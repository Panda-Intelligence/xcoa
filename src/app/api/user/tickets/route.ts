import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// 工单状态映射
const STATUS_LABELS = {
  open: { label: 'Open', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'yellow' },
  waiting_response: { label: 'Waiting Response', color: 'orange' },
  resolved: { label: 'Resolved', color: 'green' },
  closed: { label: 'Closed', color: 'gray' }
} as const;

// 优先级映射
const PRIORITY_LABELS = {
  low: { label: 'Low', color: 'gray' },
  medium: { label: 'Medium', color: 'blue' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' }
} as const;

// 请求类型映射
const REQUEST_TYPE_LABELS = {
  license_inquiry: { label: 'License Inquiry', color: 'blue' },
  usage_request: { label: 'Usage Request', color: 'green' },
  pricing_info: { label: 'Pricing Info', color: 'purple' },
  support: { label: 'Support', color: 'orange' },
  bulk_license: { label: 'Bulk License', color: 'red' }
} as const;

type TicketStatus = keyof typeof STATUS_LABELS;
type RequestType = keyof typeof REQUEST_TYPE_LABELS;
type Priority = keyof typeof PRIORITY_LABELS;

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
    let whereClause = sql`userId = ${userId}`;

    if (status !== 'all') {
      whereClause = sql`${whereClause} AND status = ${status}`;
    }

    // 获取工单列表 - 使用原始 SQL 查询 copyright_ticket 表
    const ticketsResult = await db.run(sql`
      SELECT
        ct.id, ct.ticketNumber, ct.subject, ct.requestType, ct.priority, ct.status,
        ct.copyrightOrganization, ct.copyrightEmail, ct.copyrightPhone, ct.copyrightWebsite,
        ct.intendedUse, ct.projectDescription, ct.expectedStartDate, ct.expectedDuration,
        ct.budgetRange, ct.initialMessage, ct.lastContactAt, ct.responseReceived,
        ct.licenseGranted, ct.createdAt, ct.updatedAt,
        es.name as scaleName, es.acronym as scaleAcronym, ec.name as categoryName
      FROM copyright_ticket ct
      LEFT JOIN ecoa_scale es ON ct.scaleId = es.id
      LEFT JOIN ecoa_category ec ON es.categoryId = ec.id
      WHERE ${whereClause}
      ORDER BY ct.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const tickets = ticketsResult.results || [];

    // 获取统计信息
    const statsResult = await db.run(sql`
      SELECT
        cast(count(*) as integer) as total,
        cast(sum(case when status = 'open' then 1 else 0 end) as integer) as open,
        cast(sum(case when status = 'in_progress' then 1 else 0 end) as integer) as in_progress,
        cast(sum(case when status = 'waiting_response' then 1 else 0 end) as integer) as waiting_response,
        cast(sum(case when status = 'resolved' then 1 else 0 end) as integer) as resolved,
        cast(sum(case when status = 'closed' then 1 else 0 end) as integer) as closed
      FROM copyright_ticket
      WHERE userId = ${userId}
    `);

    const stats = statsResult.results[0] || {
      total: 0,
      open: 0,
      in_progress: 0,
      waiting_response: 0,
      resolved: 0,
      closed: 0
    };

    // 格式化工单数据
    const formattedTickets = tickets.map((ticket: any) => {
      const createdDate = safeTimestampToDate(ticket.createdAt);
      const currentTime = new Date();
      const lastContactDate = ticket.lastContactAt ? safeTimestampToDate(ticket.lastContactAt) : null;
      
      return {
        ...ticket,
        statusLabel: STATUS_LABELS[ticket.status as TicketStatus]?.label || ticket.status,
        statusColor: STATUS_LABELS[ticket.status as TicketStatus]?.color || 'gray',
        priorityLabel: PRIORITY_LABELS[ticket.priority as Priority]?.label || ticket.priority,
        priorityColor: PRIORITY_LABELS[ticket.priority as Priority]?.color || 'gray',
        requestTypeLabel: REQUEST_TYPE_LABELS[ticket.requestType as RequestType]?.label || ticket.requestType,
        requestTypeColor: REQUEST_TYPE_LABELS[ticket.requestType as RequestType]?.color || 'gray',
        createdAtFormatted: createdDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        lastContactAtFormatted: lastContactDate ? lastContactDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : null,
        daysSinceCreated: Math.floor((currentTime.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
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