import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable, interpretationHistoryTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withAdminAccess } from '@/utils/admin-protection';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAccess(request, async (request, session) => {
    try {
    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

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

    const oldVersion = existing[0].version;

    await db
      .update(scaleInterpretationTable)
      .set({
        status: 'approved',
        reviewNotes: notes,
        reviewedAt: new Date(),
        version: oldVersion + 1,
        updatedAt: new Date(),
      })
      .where(eq(scaleInterpretationTable.id, id));

    await db.insert(interpretationHistoryTable).values({
      interpretationId: id,
      version: oldVersion + 1,
      changes: JSON.stringify({
        type: 'approve',
        status: 'approved',
        notes,
      }),
      changeType: 'review',
      changeSummary: '审核通过',
      changedBy: 'system',
    });

      return NextResponse.json({ success: true });
    } catch (error) {
      const err = error as { message: string };
      console.error('Failed to approve:', err);
      return NextResponse.json(
        {
          success: false,
          message: err.message || 'Failed to approve',
        },
        { status: 500 }
      );
    }
  });
}
