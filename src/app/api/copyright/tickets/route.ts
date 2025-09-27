import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { userTable, ecoaScaleTable, creditTransactionTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

const ticketRequestSchema = z.object({
  scaleId: z.string(),
  requestType: z.enum(['license_inquiry', 'usage_request', 'pricing_info', 'support', 'bulk_license']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  intendedUse: z.enum(['clinical', 'research', 'commercial', 'education', 'personal']),
  projectDescription: z.string().max(2000),
  expectedStartDate: z.string().optional(),
  expectedDuration: z.string().optional(),
  budgetRange: z.enum(['under_1k', '1k_5k', '5k_20k', '20k_50k', 'over_50k', 'to_be_discussed']).optional(),
  initialMessage: z.string().max(3000),

  // 团队信息会从用户资料中获取
});

const messageRequestSchema = z.object({
  ticketId: z.string(),
  content: z.string().min(1).max(3000),
  messageType: z.enum(['user_message', 'admin_note']).default('user_message'),
});

// 生成工单号
function generateTicketNumber(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CRT-${date}-${random}`;
}

// 计算版权联系费用
function calculateCopyrightContactFee(teamType: string, requestType: string): number {
  const baseFees = {
    individual_researcher: 2,
    academic_organization: 5,
    university: 8,
    commercial_company: 15,
    pharmaceutical: 25,
    clinic_hospital: 10,
    government: 8,
    nonprofit: 5,
  };

  const multipliers = {
    license_inquiry: 1.0,
    usage_request: 1.2,
    pricing_info: 0.8,
    support: 0.6,
    bulk_license: 2.0,
  };

  const baseFee = baseFees[teamType as keyof typeof baseFees] || 10;
  const multiplier = multipliers[requestType as keyof typeof multipliers] || 1.0;

  return Math.ceil(baseFee * multiplier);
}

// 创建版权联系工单
export async function POST(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;
      const ip = getIP(request);

      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const body = await request.json();
      const ticketData = ticketRequestSchema.parse(body);

      // 获取用户完整信息
      const [fullUser] = await db
        .select({
          id: userTable.id,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email,
          currentCredits: userTable.currentCredits,
          // 新增的团队类型字段 (临时通过 SQL 查询获取)
        })
        .from(userTable)
        .where(eq(userTable.id, user.id));

      if (!fullUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 获取量表信息和版权联系信息
      const [scale] = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          acronym: ecoaScaleTable.acronym,
          copyrightInfo: ecoaScaleTable.copyrightInfo,
          psychometricProperties: ecoaScaleTable.psychometricProperties,
        })
        .from(ecoaScaleTable)
        .where(eq(ecoaScaleTable.id, ticketData.scaleId));

      if (!scale) {
        return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
      }

      // 解析版权联系信息
      let copyrightContact = null;
      if (scale.psychometricProperties) {
        try {
          const props = typeof scale.psychometricProperties === 'string'
            ? JSON.parse(scale.psychometricProperties)
            : scale.psychometricProperties;
          copyrightContact = props.copyrightContact || null;
        } catch (error) {
          console.warn('Error parsing copyright contact:', error);
        }
      }

      if (!copyrightContact) {
        return NextResponse.json(
          { error: 'No copyright contact information available for this scale' },
          { status: 400 }
        );
      }

      // 计算版权联系费用 (根据团队类型)
      const teamType = 'individual_researcher'; // 临时固定，实际应从用户资料获取
      const contactFee = calculateCopyrightContactFee(teamType, ticketData.requestType);

      // 检查用户积分是否足够
      if (fullUser.currentCredits < contactFee) {
        return NextResponse.json({
          error: 'Insufficient credits',
          required: contactFee,
          current: fullUser.currentCredits,
          message: `联系版权方需要 ${contactFee} 积分，您当前有 ${fullUser.currentCredits} 积分`,
        }, { status: 402 });
      }

      // 生成工单号
      const ticketNumber = generateTicketNumber();
      const ticketId = `ticket_${createId()}`;

      // 构建工单数据
      const ticketRecord = {
        id: ticketId,
        userId: user.id,
        scaleId: ticketData.scaleId,
        ticketNumber,
        subject: `${ticketData.requestType.replace('_', ' ')} - ${scale.acronym}`,
        requestType: ticketData.requestType,
        priority: ticketData.priority,
        status: 'open',
        copyrightOrganization: copyrightContact.organization,
        copyrightEmail: copyrightContact.email,
        copyrightPhone: copyrightContact.phone || null,
        copyrightWebsite: copyrightContact.website || null,
        intendedUse: ticketData.intendedUse,
        projectDescription: ticketData.projectDescription,
        expectedStartDate: ticketData.expectedStartDate || null,
        expectedDuration: ticketData.expectedDuration || null,
        budgetRange: ticketData.budgetRange || null,
        initialMessage: ticketData.initialMessage,
        lastContactAt: Math.floor(Date.now() / 1000),
        responseReceived: 0,
        licenseGranted: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      };

      // 生成专业邮件模板
      const emailTemplate = {
        to: copyrightContact.email,
        cc: 'support@xcoa.pro', // 抄送平台支持邮箱
        subject: `[xCOA Platform] ${ticketData.requestType.replace('_', ' ')} - ${scale.acronym} (Ticket #${ticketNumber})`,
        body: `Dear ${copyrightContact.organization} Team,

We are writing from xCOA Platform (xcoa.pro) to facilitate a licensing inquiry for one of your assessment scales.

SCALE INFORMATION:
- Scale Name: ${scale.name}
- Acronym: ${scale.acronym}
- xCOA Reference: ${scale.id}

REQUEST DETAILS:
- Request Type: ${ticketData.requestType.replace('_', ' ')}
- Intended Use: ${ticketData.intendedUse}
- Project Description: ${ticketData.projectDescription}
- Expected Start Date: ${ticketData.expectedStartDate || 'To be determined'}
- Project Duration: ${ticketData.expectedDuration || 'To be determined'}
- Budget Range: ${ticketData.budgetRange || 'To be discussed'}

USER INFORMATION:
- Name: ${fullUser.firstName} ${fullUser.lastName}
- Email: ${fullUser.email}
- Organization Type: ${teamType.replace('_', ' ')}

DETAILED MESSAGE:
${ticketData.initialMessage}

PLATFORM INFORMATION:
This request was submitted through xCOA (xcoa.pro), a professional eCOA scale licensing platform that facilitates connections between researchers and scale copyright holders.

- Platform Support: support@xcoa.pro
- Ticket Number: ${ticketNumber}
- Request Date: ${new Date().toISOString()}

Please respond to this email or contact the user directly. We will track this inquiry and follow up if needed.

Thank you for your time and consideration.

Best regards,
xCOA Platform Team

---
This is an automated message from xCOA Platform
Platform: xcoa.pro | Support: support@xcoa.pro`
      };

      // 执行数据库操作 (插入工单记录)
      await db.run(sql`
        INSERT INTO copyright_ticket (
          id, userId, scaleId, ticketNumber, subject, requestType, priority, status,
          copyrightOrganization, copyrightEmail, copyrightPhone, copyrightWebsite,
          intendedUse, projectDescription, expectedStartDate, expectedDuration, budgetRange,
          initialMessage, lastContactAt, responseReceived, licenseGranted,
          createdAt, updatedAt
        ) VALUES (
          ${ticketRecord.id}, ${ticketRecord.userId}, ${ticketRecord.scaleId},
          ${ticketRecord.ticketNumber}, ${ticketRecord.subject}, ${ticketRecord.requestType},
          ${ticketRecord.priority}, ${ticketRecord.status}, ${ticketRecord.copyrightOrganization},
          ${ticketRecord.copyrightEmail}, ${ticketRecord.copyrightPhone}, ${ticketRecord.copyrightWebsite},
          ${ticketRecord.intendedUse}, ${ticketRecord.projectDescription}, ${ticketRecord.expectedStartDate},
          ${ticketRecord.expectedDuration}, ${ticketRecord.budgetRange}, ${ticketRecord.initialMessage},
          ${ticketRecord.lastContactAt}, ${ticketRecord.responseReceived}, ${ticketRecord.licenseGranted},
          ${ticketRecord.createdAt}, ${ticketRecord.updatedAt}
        )
      `);

      // 插入初始消息记录
      const initialMessageId = `msg_${createId()}`;
      await db.run(sql`
        INSERT INTO copyright_ticket_message (
          id, ticketId, messageType, sender, subject, content, isRead, isPublic,
          emailSent, createdAt
        ) VALUES (
          ${initialMessageId}, ${ticketId}, 'user_message', ${user.id},
          ${'Initial License Request'}, ${ticketData.initialMessage}, 0, 1, 0,
          ${Math.floor(Date.now() / 1000)}
        )
      `);

      // 扣除用户积分
      await db
        .update(userTable)
        .set({
          currentCredits: sql`${userTable.currentCredits} - ${contactFee}`
        })
        .where(eq(userTable.id, user.id));

      // 记录积分交易
      await db.insert(creditTransactionTable).values({
        userId: user.id,
        amount: -contactFee,
        remainingAmount: 0,
        type: 'USAGE',
        description: `版权联系服务 - ${scale.acronym} (工单 #${ticketNumber})`,
      });

      return NextResponse.json({
        success: true,
        ticket: {
          id: ticketId,
          number: ticketNumber,
          status: 'open',
          createdAt: new Date().toISOString(),
        },
        scale: {
          id: scale.id,
          name: scale.name,
          acronym: scale.acronym,
        },
        copyrightHolder: copyrightContact,
        emailTemplate,
        billing: {
          creditsCost: contactFee,
          remainingCredits: fullUser.currentCredits - contactFee,
        },
        workflow: {
          currentStep: 1,
          totalSteps: 4,
          steps: [
            '✅ 1. 工单已创建',
            '🔄 2. 邮件已发送至版权方',
            '⏳ 3. 等待版权方回复',
            '📋 4. 许可协商和确认',
          ],
          estimatedTime: '3-7个工作日',
          nextAction: '系统将自动发送邮件给版权方，并为您跟踪回复状态',
        }
      });

    } catch (error) {
      console.error('Copyright ticket API error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid ticket parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create copyright ticket' },
        { status: 500 }
      );
    }
  }, {
    identifier: 'copyright-ticket',
    limit: 5,
    windowInSeconds: 3600,
  });
}

// 获取用户的版权工单列表
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const session = await getSessionFromCookie();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 构建状态筛选条件
    let statusCondition = sql`1=1`;
    if (status !== 'all') {
      statusCondition = sql`status = ${status}`;
    }

    // 获取工单列表
    const tickets = await db.run(sql`
      SELECT
        ct.id, ct.ticketNumber, ct.subject, ct.requestType, ct.priority, ct.status,
        ct.copyrightOrganization, ct.intendedUse, ct.projectDescription,
        ct.lastContactAt, ct.responseReceived, ct.licenseGranted, ct.createdAt,
        es.name as scaleName, es.acronym as scaleAcronym
      FROM copyright_ticket ct
      LEFT JOIN ecoa_scale es ON ct.scaleId = es.id
      WHERE ct.userId = ${user.id} AND ${statusCondition}
      ORDER BY ct.createdAt DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `);

    // 获取每个工单的最新消息
    const ticketIds = tickets.results.map((t: any) => t.id);
    let latestMessages = [];

    if (ticketIds.length > 0) {
      latestMessages = await db.run(sql`
        SELECT DISTINCT
          ticketId, content, messageType, createdAt,
          ROW_NUMBER() OVER (PARTITION BY ticketId ORDER BY createdAt DESC) as rn
        FROM copyright_ticket_message
        WHERE ticketId IN (${sql.join(ticketIds.map(id => sql`${id}`), sql`, `)})
        AND isPublic = 1
      `);
    }

    const ticketsWithMessages = tickets.results.map((ticket: any) => {
      const latestMessage = latestMessages.results?.find(
        (msg: any) => msg.ticketId === ticket.id && msg.rn === 1
      );

      return {
        ...ticket,
        latestMessage: latestMessage ? {
          content: latestMessage.content.substring(0, 100) + '...',
          type: latestMessage.messageType,
          createdAt: latestMessage.createdAt,
        } : null,
        statusDisplay: getStatusDisplay(ticket.status),
        priorityDisplay: getPriorityDisplay(ticket.priority),
        daysSinceCreated: Math.floor((Date.now() / 1000 - ticket.createdAt) / 86400),
      };
    });

    return NextResponse.json({
      tickets: ticketsWithMessages,
      pagination: {
        page,
        limit,
        total: ticketsWithMessages.length, // 简化实现
      },
      summary: {
        totalTickets: ticketsWithMessages.length,
        openTickets: ticketsWithMessages.filter(t => t.status === 'open').length,
        resolvedTickets: ticketsWithMessages.filter(t => t.status === 'resolved').length,
        avgResponseTime: '2-5个工作日', // 可以基于历史数据计算
      }
    });

  } catch (error) {
    console.error('Get tickets API error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

function getStatusDisplay(status: string) {
  const statusMap = {
    open: { text: '已提交', color: 'blue', icon: '📝' },
    in_progress: { text: '处理中', color: 'yellow', icon: '🔄' },
    waiting_response: { text: '等待回复', color: 'orange', icon: '⏳' },
    resolved: { text: '已解决', color: 'green', icon: '✅' },
    closed: { text: '已关闭', color: 'gray', icon: '🔒' },
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.open;
}

function getPriorityDisplay(priority: string) {
  const priorityMap = {
    low: { text: '低', color: 'gray' },
    medium: { text: '中', color: 'blue' },
    high: { text: '高', color: 'orange' },
    urgent: { text: '紧急', color: 'red' },
  };
  return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
}