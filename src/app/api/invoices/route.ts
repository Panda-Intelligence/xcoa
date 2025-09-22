import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { invoiceTable, teamTable } from '@/db/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// 创建发票的请求schema
const createInvoiceSchema = z.object({
  teamId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerOrganization: z.string().optional(),
  customerAddress: z.string().optional(),
  customerVatNumber: z.string().optional(),
  customerCountry: z.string().optional(),
  description: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    serviceType: z.string()
  })),
  dueDate: z.string(), // ISO date string
  notes: z.string().optional(),
  currency: z.string().default('USD')
});

// 获取发票列表
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

    // 获取用户的团队发票
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
      .where(
        eq(teamTable.id, session.user.id) // 假设用户ID和team ID相同，实际应该通过team membership查询
      );

    // 添加状态筛选
    if (status !== 'all') {
      query = query.where(and(
        eq(teamTable.id, session.user.id),
        eq(invoiceTable.status, status)
      ));
    }

    // 添加搜索
    if (search) {
      query = query.where(and(
        eq(teamTable.id, session.user.id),
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

    // 获取统计信息
    const stats = await db
      .select({
        total: db.$count(invoiceTable, eq(invoiceTable.teamId, session.user.id)),
        paid: db.$count(invoiceTable, and(
          eq(invoiceTable.teamId, session.user.id),
          eq(invoiceTable.status, 'paid')
        )),
        sent: db.$count(invoiceTable, and(
          eq(invoiceTable.teamId, session.user.id),
          eq(invoiceTable.status, 'sent')
        )),
        draft: db.$count(invoiceTable, and(
          eq(invoiceTable.teamId, session.user.id),
          eq(invoiceTable.status, 'draft')
        ))
      })
      .from(invoiceTable);

    return NextResponse.json({
      success: true,
      invoices,
      statistics: stats[0],
      pagination: {
        total: stats[0]?.total || 0,
        limit,
        offset,
        hasMore: (stats[0]?.total || 0) > offset + limit
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

// 创建新发票
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const invoiceData = createInvoiceSchema.parse(body);

    const db = getDB();
    const userId = session.user.id;

    // 获取团队信息
    const team = await db
      .select()
      .from(teamTable)
      .where(eq(teamTable.id, invoiceData.teamId))
      .limit(1);

    if (team.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // 计算发票金额
    const subtotal = invoiceData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const taxRate = team[0].taxRate || 0.1;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // 生成发票号
    const invoicePrefix = team[0].invoicePrefix || 'INV';
    const nextNumber = team[0].nextInvoiceNumber || 1;
    const invoiceNumber = `${invoicePrefix}-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;

    // 创建发票记录
    const invoiceId = nanoid();
    await db.insert(invoiceTable).values({
      id: invoiceId,
      teamId: invoiceData.teamId,
      invoiceNumber,
      issueDate: new Date(),
      dueDate: new Date(invoiceData.dueDate),
      status: 'draft',
      subtotal,
      taxAmount,
      totalAmount,
      currency: invoiceData.currency,
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerOrganization: invoiceData.customerOrganization || null,
      customerAddress: invoiceData.customerAddress || null,
      customerVatNumber: invoiceData.customerVatNumber || null,
      customerCountry: invoiceData.customerCountry || null,
      description: invoiceData.description,
      items: invoiceData.items.map(item => ({
        id: nanoid(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        serviceType: item.serviceType
      })),
      notes: invoiceData.notes || null,
    });

    // 更新团队的下一个发票号
    await db
      .update(teamTable)
      .set({ nextInvoiceNumber: nextNumber + 1 })
      .where(eq(teamTable.id, invoiceData.teamId));

    // 获取创建的发票详情
    const createdInvoice = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.id, invoiceId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '发票创建成功',
      invoice: createdInvoice[0],
      invoiceNumber
    });

  } catch (error) {
    console.error('创建发票错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}