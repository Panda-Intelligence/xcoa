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
    const body = await request.json();
    const { notes } = body;

    if (!notes) {
      return NextResponse.json(
        { success: false, message: 'Review notes are required' },
        { status: 400 }
      );
    }

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
        status: 'draft',
        reviewNotes: notes,
        reviewedAt: new Date(),
        needsVerification: 1,
        version: oldVersion + 1,
        updatedAt: new Date(),
      })
      .where(eq(scaleInterpretationTable.id, id));

    await db.insert(interpretationHistoryTable).values({
      interpretationId: id,
      version: oldVersion + 1,
      changes: JSON.stringify({
        type: 'request_changes',
        status: 'draft',
        notes,
      }),
      changeType: 'review',
      changeSummary: '需要修改',
      changedBy: 'system',
    });

      return NextResponse.json({ success: true });
    } catch (error) {
      const err = error as { message: string };
      console.error('Failed to request changes:', err);
      return NextResponse.json(
        {
          success: false,
          message: err.message || 'Failed to request changes',
        },
        { status: 500 }
      );
    }
  });
}
