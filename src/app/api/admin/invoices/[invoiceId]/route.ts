import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { invoiceTable, userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional(), // ISO date string
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    
    // 检查是否为管理员
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { invoiceId } = params;

    // 获取发票详情
    const invoice = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: invoice[0]
    });

  } catch (error) {
    console.error('Admin获取发票详情错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    
    // 检查是否为管理员
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { invoiceId } = params;
    const body = await request.json();
    const updateData = updateInvoiceSchema.parse(body);

    // 检查发票是否存在
    const invoice = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // 构建更新数据
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (updateData.status) {
      updateFields.status = updateData.status;
    }

    if (updateData.paymentMethod) {
      updateFields.paymentMethod = updateData.paymentMethod;
    }

    if (updateData.paymentReference) {
      updateFields.paymentReference = updateData.paymentReference;
    }

    if (updateData.notes) {
      updateFields.notes = updateData.notes;
    }

    if (updateData.paidAt) {
      updateFields.paidAt = new Date(updateData.paidAt);
      updateFields.status = 'paid'; // 自动设置为已支付
    }

    // 执行更新
    await db
      .update(invoiceTable)
      .set(updateFields)
      .where(eq(invoiceTable.id, invoiceId));

    // 获取更新后的发票
    const updatedInvoice = await db
      .select()
      .from(invoiceTable)
      .where(eq(invoiceTable.id, invoiceId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '发票更新成功',
      invoice: updatedInvoice[0]
    });

  } catch (error) {
    console.error('Admin更新发票错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    
    // 检查是否为管理员
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const params = await context.params;
    const { invoiceId } = params;

    // 检查发票状态，只有草稿状态可以删除
    const invoice = await db
      .select({ status: invoiceTable.status })
      .from(invoiceTable)
      .where(eq(invoiceTable.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice[0].status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      );
    }

    // 删除发票
    await db
      .delete(invoiceTable)
      .where(eq(invoiceTable.id, invoiceId));

    return NextResponse.json({
      success: true,
      message: '发票删除成功'
    });

  } catch (error) {
    console.error('Admin删除发票错误:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}