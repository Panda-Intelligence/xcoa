import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { copyrightContactRequestTable, ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// 工单状态映射
const STATUS_LABELS = {
  pending: { label: '待处理', color: 'yellow' },
  sent: { label: '已发送', color: 'blue' },
  responded: { label: '已回复', color: 'purple' },
  in_progress: { label: '处理中', color: 'blue' },
  resolved: { label: '已解决', color: 'green' },
  closed: { label: '已关闭', color: 'gray' },
  failed: { label: '失败', color: 'red' }
};

// 优先级映射
const PRIORITY_LABELS = {
  low: { label: '低', color: 'gray' },
  medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'orange' },
  urgent: { label: '紧急', color: 'red' }
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const userId = session.user.id;

    // 获取URL参数
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

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
        ticketNumber: copyrightContactRequestTable.ticketNumber,
        subject: copyrightContactRequestTable.subject,
        requestType: copyrightContactRequestTable.requestType,
        priority: copyrightContactRequestTable.priority,
        status: copyrightContactRequestTable.status,
        intendedUse: copyrightContactRequestTable.intendedUse,
        projectDescription: copyrightContactRequestTable.projectDescription,
        copyrightOrganization: copyrightContactRequestTable.copyrightOrganization,
        copyrightEmail: copyrightContactRequestTable.copyrightEmail,
        responseReceived: copyrightContactRequestTable.responseReceived,
        licenseGranted: copyrightContactRequestTable.licenseGranted,
        createdAt: copyrightContactRequestTable.createdAt,
        updatedAt: copyrightContactRequestTable.updatedAt,
        lastContactAt: copyrightContactRequestTable.lastContactAt,
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
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
        sent: sql<number>`sum(case when status = 'sent' then 1 else 0 end)`,
        responded: sql<number>`sum(case when status = 'responded' then 1 else 0 end)`,
        resolved: sql<number>`sum(case when status = 'resolved' then 1 else 0 end)`,
      })
      .from(copyrightContactRequestTable)
      .where(eq(copyrightContactRequestTable.userId, userId));

    // 格式化工单数据
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      statusLabel: STATUS_LABELS[ticket.status as keyof typeof STATUS_LABELS]?.label || ticket.status,
      statusColor: STATUS_LABELS[ticket.status as keyof typeof STATUS_LABELS]?.color || 'gray',
      priorityLabel: PRIORITY_LABELS[ticket.priority as keyof typeof PRIORITY_LABELS]?.label || ticket.priority,
      priorityColor: PRIORITY_LABELS[ticket.priority as keyof typeof PRIORITY_LABELS]?.color || 'gray',
      createdAtFormatted: new Date(ticket.createdAt * 1000).toLocaleDateString('zh-CN'),
      daysSinceCreated: Math.floor((Date.now() - ticket.createdAt * 1000) / (1000 * 60 * 60 * 24))
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
      statistics: stats[0],
      pagination: {
        total: stats[0]?.total || 0,
        limit,
        offset,
        hasMore: (stats[0]?.total || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('获取工单列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}