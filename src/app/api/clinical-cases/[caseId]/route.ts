import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { clinicalCasesTable, ecoaScaleTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { caseId } = params;
    const db = getDB();

    // 获取案例详情
    const clinicalCase = await db
      .select({
        id: clinicalCasesTable.id,
        title: clinicalCasesTable.caseTitle,
        patientBackground: clinicalCasesTable.patientBackground,
        scaleScores: clinicalCasesTable.scaleScores,
        interpretation: clinicalCasesTable.interpretation,
        clinicalDecision: clinicalCasesTable.clinicalDecision,
        outcome: clinicalCasesTable.outcome,
        learningPoints: clinicalCasesTable.learningPoints,
        difficultyLevel: clinicalCasesTable.difficultyLevel,
        specialty: clinicalCasesTable.specialty,
        author: clinicalCasesTable.author,
        reviewStatus: clinicalCasesTable.reviewStatus,
        createdAt: clinicalCasesTable.createdAt,
        updatedAt: clinicalCasesTable.updatedAt,
        // Scale information
        scaleId: ecoaScaleTable.id,
        scaleName: ecoaScaleTable.name,
        scaleNameEn: ecoaScaleTable.nameEn,
        scaleAcronym: ecoaScaleTable.acronym,
        scaleDescription: ecoaScaleTable.description,
      })
      .from(clinicalCasesTable)
      .innerJoin(ecoaScaleTable, eq(clinicalCasesTable.scaleId, ecoaScaleTable.id))
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    if (clinicalCase.length === 0) {
      return NextResponse.json({ error: 'Clinical case not found' }, { status: 404 });
    }

    const caseData = clinicalCase[0];

    // Transform the data to match the frontend interface
    const transformedCase = {
      id: caseData.id,
      title: caseData.title,
      scaleId: caseData.scaleId,
      scaleName: caseData.scaleName,
      scaleNameEn: caseData.scaleNameEn,
      scaleAcronym: caseData.scaleAcronym,
      scaleDescription: caseData.scaleDescription,
      patientBackground: caseData.patientBackground,
      scaleScores: caseData.scaleScores,
      interpretation: caseData.interpretation,
      clinicalDecision: caseData.clinicalDecision,
      outcome: caseData.outcome,
      learningPoints: caseData.learningPoints,
      difficultyLevel: caseData.difficultyLevel,
      specialty: caseData.specialty,
      author: caseData.author,
      reviewStatus: caseData.reviewStatus,
      createdAt: caseData.createdAt,
      updatedAt: caseData.updatedAt,
    };

    return NextResponse.json({
      success: true,
      case: transformedCase
    });

  } catch (error) {
    console.error('获取临床案例详情错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical case details' },
      { status: 500 }
    );
  }
}