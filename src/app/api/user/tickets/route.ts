import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { copyrightContactRequestTable, ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// 工单状态映射
const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'yellow' },
  sent: { label: 'Sent', color: 'blue' },
  responded: { label: 'Responded', color: 'purple' },
  completed: { label: 'Completed', color: 'green' },
  failed: { label: 'Failed', color: 'red' }
} as const;

// 请求类型映射
const REQUEST_TYPE_LABELS = {
  license_inquiry: { label: 'License Inquiry', color: 'blue' },
  usage_request: { label: 'Usage Request', color: 'green' },
  support: { label: 'Support', color: 'orange' },
  other: { label: 'Other', color: 'gray' }
} as const;

type TicketStatus = keyof typeof STATUS_LABELS;
type RequestType = keyof typeof REQUEST_TYPE_LABELS;

// 辅助函数：安全的时间戳转换
function safeTimestampToDate(timestamp: number | string | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  const num = typeof timestamp === 'string' ? Number.parseInt(timestamp, 10) : timestamp;
  
  // 判断是秒级还是毫秒级时间戳
  // 如果小于13位数字，认为是秒级时间戳
  if (num < 10000000000000) {
    return new Date(num * 1000);
  }
  return new Date(num);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const userId = session.user.id;

    // 获取URL参数并验证
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    
    // 验证并限制分页参数
    const limit = Math.min(Math.max(Number.parseInt(limitParam || '20', 10), 1), 100); // 限制在1-100之间
    const offset = Math.max(Number.parseInt(offsetParam || '0', 10), 0);

    // 验证状态参数
    if (status !== 'all' && !Object.keys(STATUS_LABELS).includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status parameter',
        validStatuses: ['all', ...Object.keys(STATUS_LABELS)]
      }, { status: 400 });
    }

    // 构建查询条件
    let whereCondition = eq(copyrightContactRequestTable.userId, userId);

    if (status !== 'all') {
      whereCondition = and(
        whereCondition,
        eq(copyrightContactRequestTable.status, status)
      );
    }

    // 获取工单列表
    const tickets = await db
      .select({
        id: copyrightContactRequestTable.id,
        requestType: copyrightContactRequestTable.requestType,
        status: copyrightContactRequestTable.status,
        intendedUse: copyrightContactRequestTable.intendedUse,
        organizationName: copyrightContactRequestTable.organizationName,
        organizationType: copyrightContactRequestTable.organizationType,
        contactName: copyrightContactRequestTable.contactName,
        contactEmail: copyrightContactRequestTable.contactEmail,
        contactPhone: copyrightContactRequestTable.contactPhone,
        message: copyrightContactRequestTable.message,
        sentAt: copyrightContactRequestTable.sentAt,
        responseReceived: copyrightContactRequestTable.responseReceived,
        adminNotes: copyrightContactRequestTable.adminNotes,
        createdAt: copyrightContactRequestTable.createdAt,
        updatedAt: copyrightContactRequestTable.updatedAt,
        copyrightHolderId: copyrightContactRequestTable.copyrightHolderId,
        // 量表信息
        scaleName: ecoaScaleTable.name,
        scaleAcronym: ecoaScaleTable.acronym,
        categoryName: ecoaCategoryTable.name,
      })
      .from(copyrightContactRequestTable)
      .innerJoin(ecoaScaleTable, eq(copyrightContactRequestTable.scaleId, ecoaScaleTable.id))
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
      .where(whereCondition)
      .orderBy(desc(copyrightContactRequestTable.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取统计信息
    const statsResult = await db
      .select({
        total: sql<number>`cast(count(*) as integer)`,
        pending: sql<number>`cast(sum(case when status = 'pending' then 1 else 0 end) as integer)`,
        sent: sql<number>`cast(sum(case when status = 'sent' then 1 else 0 end) as integer)`,
        responded: sql<number>`cast(sum(case when status = 'responded' then 1 else 0 end) as integer)`,
        completed: sql<number>`cast(sum(case when status = 'completed' then 1 else 0 end) as integer)`,
        failed: sql<number>`cast(sum(case when status = 'failed' then 1 else 0 end) as integer)`,
      })
      .from(copyrightContactRequestTable)
      .where(eq(copyrightContactRequestTable.userId, userId));

    const stats = statsResult[0] || {
      total: 0,
      pending: 0,
      sent: 0,
      responded: 0,
      completed: 0,
      failed: 0
    };

    // 格式化工单数据
    const formattedTickets = tickets.map(ticket => {
      const createdDate = safeTimestampToDate(ticket.createdAt);
      const currentTime = new Date();
      const sentDate = ticket.sentAt ? safeTimestampToDate(ticket.sentAt) : null;
      const responseDate = ticket.responseReceived ? safeTimestampToDate(ticket.responseReceived) : null;
      
      return {
        ...ticket,
        statusLabel: STATUS_LABELS[ticket.status as TicketStatus]?.label || ticket.status,
        statusColor: STATUS_LABELS[ticket.status as TicketStatus]?.color || 'gray',
        requestTypeLabel: REQUEST_TYPE_LABELS[ticket.requestType as RequestType]?.label || ticket.requestType,
        requestTypeColor: REQUEST_TYPE_LABELS[ticket.requestType as RequestType]?.color || 'gray',
        createdAtFormatted: createdDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        sentAtFormatted: sentDate ? sentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : null,
        responseReceivedFormatted: responseDate ? responseDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : null,
        daysSinceCreated: Math.floor((currentTime.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
        // 工单编号基于ID生成
        ticketNumber: `CRT-${ticket.id.split('_')[1]?.slice(-8).toUpperCase() || ticket.id.slice(-8).toUpperCase()}`,
        // 主题基于请求类型和量表名生成
        subject: `${REQUEST_TYPE_LABELS[ticket.requestType as RequestType]?.label || ticket.requestType} - ${ticket.scaleName}`
      };
    });

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
      statistics: stats,
      pagination: {
        total: stats.total,
        limit,
        offset,
        hasMore: stats.total > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    
    // 更详细的错误处理
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch tickets',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}