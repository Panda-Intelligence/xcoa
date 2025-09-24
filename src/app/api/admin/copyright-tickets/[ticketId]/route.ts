import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { userTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_response', 'resolved', 'closed']).optional(),
  adminNotes: z.string().optional(),
  responseReceived: z.number().optional(),
  licenseGranted: z.number().optional(),
  responseMessage: z.string().optional()
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
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
    const { ticketId } = params;

    // 获取工单详情
    const ticketResult = await db.run(sql`
      SELECT
        ct.*,
        u.firstName as userName, u.lastName as userLastName, u.email as userEmail,
        es.name as scaleName, es.acronym as scaleAcronym, es.description as scaleDescription
      FROM copyright_ticket ct
      LEFT JOIN user u ON ct.userId = u.id
      LEFT JOIN ecoa_scale es ON ct.scaleId = es.id
      WHERE ct.id = ${ticketId}
    `);

    if (ticketResult.results.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = ticketResult.results[0];

    // 获取工单消息历史
    const messagesResult = await db.run(sql`
      SELECT *
      FROM copyright_ticket_message
      WHERE ticketId = ${ticketId}
      ORDER BY createdAt ASC
    `);

    return NextResponse.json({
      success: true,
      ticket: {
        ...ticket,
        userName: `${ticket.userName || ''} ${ticket.userLastName || ''}`.trim() || 'Unknown User'
      },
      messages: messagesResult.results || []
    });

  } catch (error) {
    console.error('Admin获取工单详情错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
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
    const { ticketId } = params;
    const body = await request.json();
    const updateData = updateTicketSchema.parse(body);

    // 检查工单是否存在
    const ticketCheck = await db.run(sql`
      SELECT id FROM copyright_ticket WHERE id = ${ticketId}
    `);

    if (ticketCheck.results.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 构建更新SQL
    const updateFields = [];
    const updateValues = [];

    if (updateData.status) {
      updateFields.push('status = ?');
      updateValues.push(updateData.status);
    }

    if (updateData.responseReceived !== undefined) {
      updateFields.push('responseReceived = ?');
      updateValues.push(updateData.responseReceived);
    }

    if (updateData.licenseGranted !== undefined) {
      updateFields.push('licenseGranted = ?');
      updateValues.push(updateData.licenseGranted);
    }

    updateFields.push('updatedAt = ?');
    updateValues.push(Math.floor(Date.now() / 1000));

    // 执行更新
    await db.run(sql`
      UPDATE copyright_ticket
      SET ${sql.raw(updateFields.join(', '))}
      WHERE id = ${ticketId}
    `);

    // 如果有管理员备注，添加消息记录
    if (updateData.adminNotes) {
      await db.run(sql`
        INSERT INTO copyright_ticket_message (
          id, ticketId, messageType, sender, subject, content, isRead, isPublic, createdAt
        ) VALUES (
          ${'msg_' + Date.now()}, ${ticketId}, 'admin_note', ${session.user.id},
          'Admin Update', ${updateData.adminNotes}, 1, 0, ${Math.floor(Date.now() / 1000)}
        )
      `);
    }

    // 如果有回复消息，添加用户可见的消息
    if (updateData.responseMessage) {
      await db.run(sql`
        INSERT INTO copyright_ticket_message (
          id, ticketId, messageType, sender, subject, content, isRead, isPublic, createdAt
        ) VALUES (
          ${'msg_' + Date.now() + '_public'}, ${ticketId}, 'admin_response', ${session.user.id},
          'Status Update', ${updateData.responseMessage}, 0, 1, ${Math.floor(Date.now() / 1000)}
        )
      `);
    }

    return NextResponse.json({
      success: true,
      message: '工单状态更新成功'
    });

  } catch (error) {
    console.error('Admin更新工单错误:', error);

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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
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
    const { ticketId } = params;

    // 删除相关消息
    await db.run(sql`
      DELETE FROM copyright_ticket_message WHERE ticketId = ${ticketId}
    `);

    // 删除工单
    await db.run(sql`
      DELETE FROM copyright_ticket WHERE id = ${ticketId}
    `);

    return NextResponse.json({
      success: true,
      message: '版权工单删除成功'
    });

  } catch (error) {
    console.error('Admin删除工单错误:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}