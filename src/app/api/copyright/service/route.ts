import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import {
  userTable,
  ecoaScaleTable,
  creditTransactionTable,
  scaleUsageTable
} from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

const copyrightServiceRequestSchema = z.object({
  scaleId: z.string(),
  serviceType: z.enum(['view_contact_info', 'initiate_contact', 'bulk_contact', 'priority_contact']),

  // 仅当 serviceType 为 initiate_contact 时需要
  contactRequest: z.object({
    requestType: z.enum(['license_inquiry', 'usage_request', 'pricing_info', 'support', 'bulk_license']),
    priority: z.enum(['standard', 'priority', 'urgent']).default('standard'),
    intendedUse: z.enum(['clinical', 'research', 'commercial', 'education', 'personal']),
    projectDescription: z.string().max(2000),
    organizationContext: z.string().max(1000).optional(),
    timeframe: z.string().optional(),
    budgetRange: z.string().optional(),
    message: z.string().max(3000),
  }).optional(),
});

// 获取用户团队类型和定价
async function getUserTeamType(userId: string): Promise<{ teamType: string, pricing: any }> {
  const db = getDB();

  try {
    const result = await db.run(sql`
      SELECT teamType, organizationName, organizationSize, currentCredits
      FROM user WHERE id = ${userId}
    `);

    const userInfo = result.results?.[0] as any;
    const teamType = userInfo?.teamType || 'individual_researcher';

    // 根据团队类型计算定价
    const pricingTiers = {
      individual_researcher: { contact: 2, interpretation: 1, priority: 5 },
      academic_organization: { contact: 5, interpretation: 2, priority: 10 },
      university: { contact: 8, interpretation: 3, priority: 15 },
      commercial_company: { contact: 15, interpretation: 8, priority: 30 },
      pharmaceutical: { contact: 25, interpretation: 15, priority: 50 },
      clinic_hospital: { contact: 10, interpretation: 5, priority: 20 },
      government: { contact: 8, interpretation: 3, priority: 15 },
      nonprofit: { contact: 5, interpretation: 2, priority: 10 },
    };

    return {
      teamType,
      pricing: pricingTiers[teamType as keyof typeof pricingTiers] || pricingTiers.individual_researcher,
    };
  } catch (error) {
    console.warn('Error getting user team type:', error);
    return {
      teamType: 'individual_researcher',
      pricing: { contact: 2, interpretation: 1, priority: 5 },
    };
  }
}

// 版权服务主接口
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
      const serviceRequest = copyrightServiceRequestSchema.parse(body);

      // 获取用户信息和定价
      const { teamType, pricing } = await getUserTeamType(user.id);

      // 获取用户当前积分
      const [userInfo] = await db
        .select({
          id: userTable.id,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email,
          currentCredits: userTable.currentCredits,
        })
        .from(userTable)
        .where(eq(userTable.id, user.id));

      if (!userInfo) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 获取量表和版权信息
      const [scale] = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          acronym: ecoaScaleTable.acronym,
          copyrightInfo: ecoaScaleTable.copyrightInfo,
          psychometricProperties: ecoaScaleTable.psychometricProperties,
        })
        .from(ecoaScaleTable)
        .where(eq(ecoaScaleTable.id, serviceRequest.scaleId));

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

      // 根据服务类型处理请求
      switch (serviceRequest.serviceType) {
        case 'view_contact_info':
          // 查看联系信息 - 消耗积分
          const viewCost = pricing.contact;

          if (userInfo.currentCredits < viewCost) {
            return NextResponse.json({
              error: 'Insufficient credits',
              required: viewCost,
              current: userInfo.currentCredits,
              message: `查看版权方联系信息需要 ${viewCost} 积分`,
            }, { status: 402 });
          }

          // 扣除积分
          await db
            .update(userTable)
            .set({ currentCredits: sql`${userTable.currentCredits} - ${viewCost}` })
            .where(eq(userTable.id, user.id));

          // 记录积分交易
          await db.insert(creditTransactionTable).values({
            userId: user.id,
            amount: -viewCost,
            remainingAmount: 0,
            type: 'USAGE',
            description: `查看版权联系信息 - ${scale.acronym}`,
          });

          // 记录使用行为
          await db.insert(scaleUsageTable).values({
            scaleId: serviceRequest.scaleId,
            userId: user.id,
            actionType: 'copyright_view',
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || '',
          });

          return NextResponse.json({
            success: true,
            serviceType: 'contact_info_accessed',
            scale: { id: scale.id, name: scale.name, acronym: scale.acronym },
            copyrightContact: {
              organization: copyrightContact.organization,
              email: copyrightContact.email,
              phone: copyrightContact.phone,
              website: copyrightContact.website,
              businessHours: '工作日 9:00-17:00 (版权方时区)',
              preferredContact: copyrightContact.email ? 'email' : 'phone',
            },
            billing: {
              creditsCost: viewCost,
              remainingCredits: userInfo.currentCredits - viewCost,
              teamType,
            },
            guidance: {
              contactTips: [
                '邮件联系通常响应更及时',
                '详细说明您的使用目的和项目背景',
                '提供您的专业机构信息',
                '询问具体的许可要求和费用',
              ],
              emailTemplate: `Dear ${copyrightContact.organization} Team,

I am writing to inquire about licensing the ${scale.name} (${scale.acronym}) for [YOUR_PURPOSE].

My details:
- Name: ${userInfo.firstName} ${userInfo.lastName}
- Email: ${userInfo.email}
- Organization: [YOUR_ORGANIZATION]
- Intended use: [CLINICAL/RESEARCH/COMMERCIAL]

Could you please provide information about:
1. Licensing requirements for my intended use
2. Any associated fees or royalties
3. Usage restrictions or guidelines
4. Timeline for obtaining permission

Thank you for your time.

Best regards,
${userInfo.firstName} ${userInfo.lastName}`,
            }
          });

        case 'initiate_contact':
          // 发起联系 - 使用工单系统
          if (!serviceRequest.contactRequest) {
            return NextResponse.json(
              { error: 'Contact request details required for initiate_contact service' },
              { status: 400 }
            );
          }

          const contactCost = serviceRequest.contactRequest.priority === 'urgent' ?
            pricing.contact * 2 : pricing.contact;

          if (userInfo.currentCredits < contactCost) {
            return NextResponse.json({
              error: 'Insufficient credits',
              required: contactCost,
              current: userInfo.currentCredits,
              serviceType: 'initiate_contact',
              message: `发起版权联系需要 ${contactCost} 积分 (${serviceRequest.contactRequest.priority} 优先级)`,
            }, { status: 402 });
          }

          // 创建工单 (调用工单 API 的逻辑)
          const ticketNumber = `CRT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
          const ticketId = `ticket_${createId()}`;

          // 插入工单记录
          await db.run(sql`
            INSERT INTO copyright_ticket (
              id, userId, scaleId, ticketNumber, subject, requestType, priority, status,
              copyrightOrganization, copyrightEmail, intendedUse, projectDescription,
              initialMessage, lastContactAt, createdAt, updatedAt
            ) VALUES (
              ${ticketId}, ${user.id}, ${serviceRequest.scaleId}, ${ticketNumber},
              ${`${serviceRequest.contactRequest.requestType} - ${scale.acronym}`},
              ${serviceRequest.contactRequest.requestType}, ${serviceRequest.contactRequest.priority}, 'open',
              ${copyrightContact.organization}, ${copyrightContact.email},
              ${serviceRequest.contactRequest.intendedUse}, ${serviceRequest.contactRequest.projectDescription},
              ${serviceRequest.contactRequest.message}, ${Math.floor(Date.now() / 1000)},
              ${Math.floor(Date.now() / 1000)}, ${Math.floor(Date.now() / 1000)}
            )
          `);

          // 扣除积分
          await db
            .update(userTable)
            .set({ currentCredits: sql`${userTable.currentCredits} - ${contactCost}` })
            .where(eq(userTable.id, user.id));

          // 记录积分交易
          await db.insert(creditTransactionTable).values({
            userId: user.id,
            amount: -contactCost,
            remainingAmount: 0,
            type: 'USAGE',
            description: `版权联系服务 - ${scale.acronym} (工单 #${ticketNumber})`,
          });

          return NextResponse.json({
            success: true,
            serviceType: 'contact_initiated',
            ticket: {
              id: ticketId,
              number: ticketNumber,
              status: 'open',
              estimatedResponse: serviceRequest.contactRequest.priority === 'urgent' ? '24小时内' : '3-5个工作日',
            },
            billing: {
              creditsCost: contactCost,
              remainingCredits: userInfo.currentCredits - contactCost,
            },
            workflow: {
              step: 1,
              description: '工单已创建，邮件即将发送给版权方',
              nextSteps: [
                '系统将发送专业邮件给版权方',
                '您将收到工单确认邮件',
                '我们会跟踪版权方的回复',
                '回复后您将收到通知',
              ],
            }
          });

        default:
          return NextResponse.json(
            { error: 'Unsupported service type' },
            { status: 400 }
          );
      }

    } catch (error) {
      console.error('Copyright service API error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid service request', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Copyright service failed' },
        { status: 500 }
      );
    }
  }, {
    identifier: 'copyright-service',
    limit: 10,
    windowInSeconds: 3600,
  });
}