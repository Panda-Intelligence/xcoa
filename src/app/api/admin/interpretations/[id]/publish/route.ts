import { withAdminAccess } from '@/utils/admin-protection';
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable, interpretationHistoryTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAccess(request, async (request, session) => {
    try {
    const { id } = await params;

    const db = getDB();

    const existing = await db
      .select()
      .from(scaleInterpretationTable)
      .where(eq(scaleInterpretationTable.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Interpretation not found' },
        { status: 404 }
      );
    }

    if (existing[0].status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'Only approved interpretations can be published' },
        { status: 400 }
      );
    }

    const oldVersion = existing[0].version;

    await db
      .update(scaleInterpretationTable)
      .set({
        status: 'published',
        publishedAt: new Date(),
        version: oldVersion + 1,
        updatedAt: new Date(),
      })
      .where(eq(scaleInterpretationTable.id, id));

    await db.insert(interpretationHistoryTable).values({
      interpretationId: id,
      version: oldVersion + 1,
      changes: JSON.stringify({
        type: 'publish',
        status: 'published',
      }),
      changeType: 'publish',
      changeSummary: '发布',
      changedBy: 'system',
    });

      return NextResponse.json({ success: true });
    } catch (error) {
      const err = error as { message: string };
      console.error('Failed to publish:', err);
      return NextResponse.json(
        {
          success: false,
          message: err.message || 'Failed to publish',
        },
        { status: 500 }
      );
    }
  });
}
