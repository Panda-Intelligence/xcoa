import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> }
) {
  try {
    const { scaleId } = await params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';

    const db = getDB();

    const interpretations = await db
      .select()
      .from(scaleInterpretationTable)
      .where(
        and(
          eq(scaleInterpretationTable.scaleId, scaleId),
          eq(scaleInterpretationTable.status, 'published'),
          eq(scaleInterpretationTable.language, language)
        )
      )
      .limit(1);

    if (interpretations.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No published interpretation found',
      });
    }

    const interpretation = interpretations[0];

    await db
      .update(scaleInterpretationTable)
      .set({ viewCount: interpretation.viewCount + 1 })
      .where(eq(scaleInterpretationTable.id, interpretation.id));

    return NextResponse.json({
      success: true,
      interpretation: {
        id: interpretation.id,
        overview: interpretation.overview,
        structure: interpretation.structure,
        psychometricProperties: interpretation.psychometricProperties,
        interpretation: interpretation.interpretation,
        usageGuidelines: interpretation.usageGuidelines,
        clinicalApplications: interpretation.clinicalApplications,
        version: interpretation.version,
        viewCount: interpretation.viewCount + 1,
        helpfulCount: interpretation.helpfulCount,
      },
    });
  } catch (error) {
    const err = error as { message: string };
    console.error('Failed to fetch interpretation:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to fetch interpretation',
      },
      { status: 500 }
    );
  }
}
