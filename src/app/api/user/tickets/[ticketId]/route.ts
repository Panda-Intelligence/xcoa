import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_response', 'resolved', 'closed']).optional(),
  adminNotes: z.string().optional(),
  responseReceived: z.boolean().optional(),
  licenseGranted: z.boolean().optional(),
  responseMessage: z.string().optional(),
  licenseFee: z.string().optional(),
  licenseTerms: z.string().optional(),
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
    const ticketCheck = await db.run(sql`
      SELECT id FROM copyright_ticket 
      WHERE id = ${ticketId} AND userId = ${userId}
    `);

    if (!ticketCheck.results || ticketCheck.results.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 构建更新字段
    const updates: string[] = [];
    const values: any[] = [];
    
    updates.push('updatedAt = ?');
    values.push(Math.floor(Date.now() / 1000));

    if (updateData.status) {
      updates.push('status = ?');
      values.push(updateData.status);
    }

    if (updateData.adminNotes) {
      updates.push('adminNotes = ?');
      values.push(updateData.adminNotes);
    }

    if (updateData.responseMessage) {
      updates.push('responseMessage = ?');
      values.push(updateData.responseMessage);
    }

    if (updateData.responseReceived !== undefined) {
      updates.push('responseReceived = ?');
      values.push(updateData.responseReceived ? 1 : 0);
      if (updateData.responseReceived) {
        updates.push('lastResponseAt = ?');
        values.push(Math.floor(Date.now() / 1000));
        if (!updateData.status) {
          updates.push('status = ?');
          values.push('waiting_response');
        }
      }
    }

    if (updateData.licenseGranted !== undefined) {
      updates.push('licenseGranted = ?');
      values.push(updateData.licenseGranted ? 1 : 0);
      if (updateData.licenseGranted && !updateData.status) {
        updates.push('status = ?');
        values.push('resolved');
        updates.push('resolvedAt = ?');
        values.push(Math.floor(Date.now() / 1000));
      }
    }

    if (updateData.licenseFee) {
      updates.push('licenseFee = ?');
      values.push(updateData.licenseFee);
    }

    if (updateData.licenseTerms) {
      updates.push('licenseTerms = ?');
      values.push(updateData.licenseTerms);
    }

    values.push(ticketId);

    // 执行更新
    await db.run(sql.raw(`
      UPDATE copyright_ticket 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values));

    // 获取更新后的工单
    const updatedTicket = await db.run(sql`
      SELECT * FROM copyright_ticket WHERE id = ${ticketId}
    `);

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: updatedTicket.results[0]
    });

  } catch (error) {
    console.error('Update ticket error:', error);

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

    // 获取工单详情，包含关联的量表信息
    const ticketResult = await db.run(sql`
      SELECT 
        ct.*,
        es.name as scaleName,
        es.acronym as scaleAcronym,
        ec.name as categoryName
      FROM copyright_ticket ct
      LEFT JOIN ecoa_scale es ON ct.scaleId = es.id
      LEFT JOIN ecoa_category ec ON es.categoryId = ec.id
      WHERE ct.id = ${ticketId} AND ct.userId = ${userId}
    `);

    if (!ticketResult.results || ticketResult.results.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ticket: ticketResult.results[0]
    });

  } catch (error) {
    console.error('Get ticket details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}