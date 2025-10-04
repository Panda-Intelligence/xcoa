import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleInterpretationTable, ecoaScaleTable } from '@/db/schema';
import { sql, isNull, not } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();

    const totalScales = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(ecoaScaleTable);

    const interpretationStats = await db
      .select({
        totalInterpretations: sql<number>`COUNT(*)`.as('total_interpretations'),
        draft: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'draft' THEN 1 ELSE 0 END)`.as('draft'),
        reviewing: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'reviewing' THEN 1 ELSE 0 END)`.as('reviewing'),
        approved: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'approved' THEN 1 ELSE 0 END)`.as('approved'),
        published: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.status} = 'published' THEN 1 ELSE 0 END)`.as('published'),
        aiGenerated: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.generationMethod} = 'ai' THEN 1 ELSE 0 END)`.as('ai_generated'),
        manualCreated: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.generationMethod} = 'manual' THEN 1 ELSE 0 END)`.as('manual_created'),
        needsVerification: sql<number>`SUM(CASE WHEN ${scaleInterpretationTable.needsVerification} = 1 THEN 1 ELSE 0 END)`.as('needs_verification'),
        totalViews: sql<number>`SUM(${scaleInterpretationTable.viewCount})`.as('total_views'),
        totalHelpful: sql<number>`SUM(${scaleInterpretationTable.helpfulCount})`.as('total_helpful'),
      })
      .from(scaleInterpretationTable);

    const avgQuality = await db
      .select({
        avgQualityScore: sql<number>`AVG(${scaleInterpretationTable.qualityScore})`.as('avg_quality'),
        avgCompletenessScore: sql<number>`AVG(${scaleInterpretationTable.completenessScore})`.as('avg_completeness'),
        avgAccuracyScore: sql<number>`AVG(${scaleInterpretationTable.accuracyScore})`.as('avg_accuracy'),
      })
      .from(scaleInterpretationTable)
      .where(not(isNull(scaleInterpretationTable.qualityScore)));

    const recentInterpretations = await db
      .select({
        id: scaleInterpretationTable.id,
        scaleId: scaleInterpretationTable.scaleId,
        scaleName: ecoaScaleTable.name,
        scaleAcronym: ecoaScaleTable.acronym,
        status: scaleInterpretationTable.status,
        generationMethod: scaleInterpretationTable.generationMethod,
        aiModel: scaleInterpretationTable.aiModel,
        aiTokensUsed: scaleInterpretationTable.aiTokensUsed,
        createdAt: scaleInterpretationTable.createdAt,
        needsVerification: scaleInterpretationTable.needsVerification,
        version: scaleInterpretationTable.version,
      })
      .from(scaleInterpretationTable)
      .leftJoin(ecoaScaleTable, sql`${scaleInterpretationTable.scaleId} = ${ecoaScaleTable.id}`)
      .orderBy(sql`${scaleInterpretationTable.createdAt} DESC`)
      .limit(10);

    const stats = interpretationStats[0] || {
      totalInterpretations: 0,
      draft: 0,
      reviewing: 0,
      approved: 0,
      published: 0,
      aiGenerated: 0,
      manualCreated: 0,
      needsVerification: 0,
      totalViews: 0,
      totalHelpful: 0,
    };

    const quality = avgQuality[0] || {
      avgQualityScore: null,
      avgCompletenessScore: null,
      avgAccuracyScore: null,
    };

    const coverage = totalScales[0]?.count 
      ? ((stats.totalInterpretations / totalScales[0].count) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalScales: totalScales[0]?.count || 0,
          totalInterpretations: stats.totalInterpretations,
          coverage: `${coverage}%`,
          needsVerification: stats.needsVerification,
        },
        status: {
          draft: stats.draft,
          reviewing: stats.reviewing,
          approved: stats.approved,
          published: stats.published,
        },
        generation: {
          aiGenerated: stats.aiGenerated,
          manualCreated: stats.manualCreated,
        },
        engagement: {
          totalViews: stats.totalViews,
          totalHelpful: stats.totalHelpful,
          helpfulRate: stats.totalViews > 0 
            ? ((stats.totalHelpful / stats.totalViews) * 100).toFixed(1) + '%'
            : '0%',
        },
        quality: {
          avgQualityScore: quality.avgQualityScore,
          avgCompletenessScore: quality.avgCompletenessScore,
          avgAccuracyScore: quality.avgAccuracyScore,
        },
        recentInterpretations: recentInterpretations.map(item => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        })),
      },
    });
  } catch (error) {
    const err = error as { message: string };
    console.error('Failed to fetch dashboard stats:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to fetch dashboard stats',
      },
      { status: 500 }
    );
  }
}
