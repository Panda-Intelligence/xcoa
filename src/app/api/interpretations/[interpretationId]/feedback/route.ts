import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { interpretationUserFeedbackTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ interpretationId: string }> }
) {
  try {
    // Our auth system exposes sessions via cookie
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { interpretationId } = await params;
    const body = await request.json();
    const { isHelpful, rating, comment, issueType, issueDescription } = body;

    const db = getDB();

    const existing = await db
      .select()
      .from(interpretationUserFeedbackTable)
      .where(
        and(
          eq(interpretationUserFeedbackTable.interpretationId, interpretationId),
          eq(interpretationUserFeedbackTable.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(interpretationUserFeedbackTable)
        .set({
          isHelpful,
          rating,
          comment,
          issueType,
          issueDescription,
          updatedAt: new Date(),
        })
        .where(eq(interpretationUserFeedbackTable.id, existing[0].id));
    } else {
      await db.insert(interpretationUserFeedbackTable).values({
        interpretationId,
        userId: session.user.id,
        isHelpful,
        rating,
        comment,
        issueType,
        issueDescription,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as { message: string };
    console.error('Failed to save feedback:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to save feedback',
      },
      { status: 500 }
    );
  }
}
