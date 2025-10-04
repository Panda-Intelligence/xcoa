import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable, interpretationHistoryTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      scaleId,
      overview,
      structure,
      psychometricProperties,
      interpretation,
      usageGuidelines,
      clinicalApplications,
      language = 'zh',
      generationMethod = 'manual',
      status = 'draft',
    } = body;

    if (!scaleId) {
      return NextResponse.json(
        { success: false, message: 'Scale ID is required' },
        { status: 400 }
      );
    }

    const db = getDB();

    const existing = await db
      .select()
      .from(scaleInterpretationTable)
      .where(
        and(
          eq(scaleInterpretationTable.scaleId, scaleId),
          eq(scaleInterpretationTable.language, language)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Interpretation already exists for this scale and language' },
        { status: 400 }
      );
    }

    const result = await db.insert(scaleInterpretationTable).values({
      scaleId,
      overview,
      structure,
      psychometricProperties,
      interpretation,
      usageGuidelines,
      clinicalApplications,
      language,
      generationMethod,
      status,
      version: 1,
      needsVerification: generationMethod === 'manual' ? 0 : 1,
    }).returning();

    const newInterpretation = result[0];

    await db.insert(interpretationHistoryTable).values({
      interpretationId: newInterpretation.id,
      version: 1,
      changes: JSON.stringify({
        type: 'create',
        method: generationMethod,
      }),
      changeType: 'create',
      changeSummary: '创建解读',
      changedBy: 'system',
    });

    return NextResponse.json({
      success: true,
      interpretation: newInterpretation,
    });
  } catch (error) {
    const err = error as { message: string };
    console.error('Failed to create interpretation:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to create interpretation',
      },
      { status: 500 }
    );
  }
}
