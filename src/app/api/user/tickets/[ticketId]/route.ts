import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { copyrightContactRequestTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.enum(['pending', 'sent', 'responded', 'in_progress', 'resolved', 'closed', 'failed']).optional(),
  adminNotes: z.string().optional(),
  responseReceived: z.boolean().optional(),
  licenseGranted: z.boolean().optional(),
  licenseDocumentUrl: z.string().optional(),
  finalCost: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { ticketId } = params;
    const body = await request.json();
    const updateData = updateTicketSchema.parse(body);

    const db = getDB();
    const userId = session.user.id;

    // 检查工单是否存在且属于当前用户
    const ticket = await db
      .select()
      .from(copyrightContactRequestTable)
      .where(and(
        eq(copyrightContactRequestTable.id, ticketId),
        eq(copyrightContactRequestTable.userId, userId)
      ))
      .limit(1);

    if (ticket.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 构建更新数据
    const updateFields: any = {
      updatedAt: Math.floor(Date.now() / 1000)
    };

    if (updateData.status) {
      updateFields.status = updateData.status;
    }

    if (updateData.adminNotes) {
      updateFields.adminNotes = updateData.adminNotes;
    }

    if (updateData.responseReceived !== undefined) {
      updateFields.responseReceived = updateData.responseReceived ? 1 : 0;
      if (updateData.responseReceived) {
        updateFields.status = 'responded';
      }
    }

    if (updateData.licenseGranted !== undefined) {
      updateFields.licenseGranted = updateData.licenseGranted ? 1 : 0;
      if (updateData.licenseGranted) {
        updateFields.status = 'resolved';
      }
    }

    // 执行更新
    await db
      .update(copyrightContactRequestTable)
      .set(updateFields)
      .where(eq(copyrightContactRequestTable.id, ticketId));

    // 获取更新后的工单信息
    const updatedTicket = await db
      .select()
      .from(copyrightContactRequestTable)
      .where(eq(copyrightContactRequestTable.id, ticketId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '工单状态更新成功',
      ticket: updatedTicket[0]
    });

  } catch (error) {
    console.error('更新工单状态错误:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { ticketId } = params;
    const db = getDB();
    const userId = session.user.id;

    // 获取工单详情
    const ticket = await db
      .select()
      .from(copyrightContactRequestTable)
      .where(and(
        eq(copyrightContactRequestTable.id, ticketId),
        eq(copyrightContactRequestTable.userId, userId)
      ))
      .limit(1);

    if (ticket.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ticket: ticket[0]
    });

  } catch (error) {
    console.error('获取工单详情错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}