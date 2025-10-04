import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ interpretationId: string }> }
) {
  try {
    const { interpretationId } = await params;

    const db = getDB();

    const interpretation = await db
      .select()
      .from(scaleInterpretationTable)
      .where(eq(scaleInterpretationTable.id, interpretationId))
      .limit(1);

    if (interpretation.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Interpretation not found' },
        { status: 404 }
      );
    }

    await db
      .update(scaleInterpretationTable)
      .set({ helpfulCount: interpretation[0].helpfulCount + 1 })
      .where(eq(scaleInterpretationTable.id, interpretationId));

    return NextResponse.json({
      success: true,
      helpfulCount: interpretation[0].helpfulCount + 1,
    });
  } catch (error) {
    const err = error as { message: string };
    console.error('Failed to mark helpful:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to mark helpful',
      },
      { status: 500 }
    );
  }
}
