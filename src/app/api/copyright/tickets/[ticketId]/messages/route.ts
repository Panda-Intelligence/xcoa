import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

const messageSchema = z.object({
  content: z.string().min(1).max(3000),
  messageType: z.enum(['user_message', 'admin_note']).default('user_message'),
});

export async function POST(
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
    const messageData = messageSchema.parse(body);

    const db = getDB();
    const userId = session.user.id;

    const ticketCheck = await db.run(sql`
      SELECT id FROM copyright_ticket 
      WHERE id = ${ticketId} AND userId = ${userId}
    `);

    if (!ticketCheck.results || ticketCheck.results.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const messageId = `msg_${createId()}`;
    const now = Math.floor(Date.now() / 1000);

    await db.run(sql`
      INSERT INTO copyright_ticket_message (
        id, ticketId, messageType, sender, subject, content, isRead, isPublic,
        emailSent, createdAt
      ) VALUES (
        ${messageId}, ${ticketId}, ${messageData.messageType}, ${userId},
        ${'User Message'}, ${messageData.content}, 0, 1, 0, ${now}
      )
    `);

    await db.run(sql`
      UPDATE copyright_ticket 
      SET lastContactAt = ${now}, updatedAt = ${now}
      WHERE id = ${ticketId}
    `);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId
    });

  } catch (error) {
    console.error('Send message error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
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

    const ticketCheck = await db.run(sql`
      SELECT id FROM copyright_ticket 
      WHERE id = ${ticketId} AND userId = ${userId}
    `);

    if (!ticketCheck.results || ticketCheck.results.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const messagesResult = await db.run(sql`
      SELECT 
        m.*,
        u.firstName,
        u.lastName,
        u.email
      FROM copyright_ticket_message m
      LEFT JOIN user u ON m.sender = u.id
      WHERE m.ticketId = ${ticketId} AND m.isPublic = 1
      ORDER BY m.createdAt ASC
    `);

    return NextResponse.json({
      success: true,
      messages: messagesResult.results || []
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
