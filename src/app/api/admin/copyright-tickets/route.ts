import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { userTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// Admin获取所有版权工单
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员
    const db = getDB();
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const priority = url.searchParams.get('priority') || 'all';
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 构建查询条件
    let statusCondition = sql`1=1`;
    if (status !== 'all') {
      statusCondition = sql`ct.status = ${status}`;
    }

    let priorityCondition = sql`1=1`;
    if (priority !== 'all') {
      priorityCondition = sql`ct.priority = ${priority}`;
    }

    let searchCondition = sql`1=1`;
    if (search) {
      searchCondition = sql`(
        ct.ticketNumber LIKE ${`%${search}%`} OR
        ct.subject LIKE ${`%${search}%`} OR
        ct.copyrightOrganization LIKE ${`%${search}%`} OR
        u.firstName LIKE ${`%${search}%`} OR
        u.lastName LIKE ${`%${search}%`} OR
        u.email LIKE ${`%${search}%`} OR
        es.name LIKE ${`%${search}%`} OR
        es.acronym LIKE ${`%${search}%`}
      )`;
    }

    // 获取工单列表
    const tickets = await db.run(sql`
      SELECT
        ct.id, ct.ticketNumber, ct.subject, ct.requestType, ct.priority, ct.status,
        ct.copyrightOrganization, ct.copyrightEmail, ct.copyrightPhone, ct.copyrightWebsite,
        ct.intendedUse, ct.projectDescription, ct.responseReceived, ct.licenseGranted,
        ct.createdAt, ct.updatedAt,
        u.firstName as userName, u.lastName as userLastName, u.email as userEmail,
        es.name as scaleName, es.acronym as scaleAcronym,
        (CAST(julianday('now') - julianday(datetime(ct.createdAt, 'unixepoch')) AS INTEGER)) as daysSinceCreated
      FROM copyright_ticket ct
      LEFT JOIN user u ON ct.userId = u.id
      LEFT JOIN ecoa_scale es ON ct.scaleId = es.id
      WHERE ${statusCondition} AND ${priorityCondition} AND ${searchCondition}
      ORDER BY ct.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // 获取统计信息
    const statsResult = await db.run(sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'waiting_response' THEN 1 ELSE 0 END) as waiting_response,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM copyright_ticket
    `);

    const statistics = statsResult.results[0] || {
      total: 0, open: 0, in_progress: 0, waiting_response: 0, resolved: 0, closed: 0
    };

    // 处理工单数据
    const processedTickets = tickets.results.map((ticket: any) => ({
      ...ticket,
      userName: `${ticket.userName || ''} ${ticket.userLastName || ''}`.trim() || 'Unknown User'
    }));

    return NextResponse.json({
      success: true,
      tickets: processedTickets,
      statistics,
      pagination: {
        total: statistics.total,
        limit,
        offset,
        hasMore: statistics.total > offset + limit
      }
    });

  } catch (error) {
    console.error('Admin获取版权工单列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch copyright tickets' },
      { status: 500 }
    );
  }
}