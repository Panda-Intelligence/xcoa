import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { invoiceTable, teamTable, teamMembershipTable } from '@/db/schema';
import { eq, desc, and, like, or, inArray } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

// 用户获取自己的发票列表 (只读)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 首先获取用户所属的团队
    const userTeams = await db
      .select({ teamId: teamMembershipTable.teamId })
      .from(teamMembershipTable)
      .where(and(
        eq(teamMembershipTable.userId, session.user.id),
        eq(teamMembershipTable.isActive, 1)
      ));

    const teamIds = userTeams.map(t => t.teamId);

    if (teamIds.length === 0) {
      // 用户不属于任何团队，返回空结果
      return NextResponse.json({
        success: true,
        invoices: [],
        statistics: { total: 0, paid: 0, sent: 0, draft: 0 },
        pagination: { total: 0, limit, offset, hasMore: false }
      });
    }

    // 获取用户所属团队的发票
    let query = db
      .select({
        id: invoiceTable.id,
        invoiceNumber: invoiceTable.invoiceNumber,
        issueDate: invoiceTable.issueDate,
        dueDate: invoiceTable.dueDate,
        status: invoiceTable.status,
        subtotal: invoiceTable.subtotal,
        taxAmount: invoiceTable.taxAmount,
        totalAmount: invoiceTable.totalAmount,
        currency: invoiceTable.currency,
        description: invoiceTable.description,
        customerName: invoiceTable.customerName,
        customerEmail: invoiceTable.customerEmail,
        customerOrganization: invoiceTable.customerOrganization,
        customerAddress: invoiceTable.customerAddress,
        customerVatNumber: invoiceTable.customerVatNumber,
        customerCountry: invoiceTable.customerCountry,
        paymentMethod: invoiceTable.paymentMethod,
        paidAt: invoiceTable.paidAt,
        teamName: teamTable.name,
      })
      .from(invoiceTable)
      .innerJoin(teamTable, eq(invoiceTable.teamId, teamTable.id))
      .where(inArray(invoiceTable.teamId, teamIds));

    // 添加状态筛选
    if (status !== 'all') {
      query = query.where(and(
        inArray(invoiceTable.teamId, teamIds),
        eq(invoiceTable.status, status)
      ));
    }

    // 添加搜索
    if (search) {
      query = query.where(and(
        inArray(invoiceTable.teamId, teamIds),
        or(
          like(invoiceTable.invoiceNumber, `%${search}%`),
          like(invoiceTable.description, `%${search}%`),
          like(invoiceTable.customerName, `%${search}%`),
          like(invoiceTable.customerOrganization, `%${search}%`)
        )
      ));
    }

    const invoices = await query
      .orderBy(desc(invoiceTable.issueDate))
      .limit(limit)
      .offset(offset);

    // 获取统计信息 - 只统计用户可见的发票
    const allInvoices = await db
      .select({ status: invoiceTable.status })
      .from(invoiceTable)
      .where(inArray(invoiceTable.teamId, teamIds));

    let totalCount = 0;
    let paidCount = 0;
    let sentCount = 0;
    let draftCount = 0;

    allInvoices.forEach(invoice => {
      totalCount++;
      switch (invoice.status) {
        case 'paid': paidCount++; break;
        case 'sent': sentCount++; break;
        case 'draft': draftCount++; break;
      }
    });

    return NextResponse.json({
      success: true,
      invoices,
      statistics: {
        total: totalCount,
        paid: paidCount,
        sent: sentCount,
        draft: draftCount
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: totalCount > offset + limit
      }
    });

  } catch (error) {
    console.error('获取发票列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}