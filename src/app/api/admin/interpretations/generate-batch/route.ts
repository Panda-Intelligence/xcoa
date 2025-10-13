import { withAdminAccess } from '@/utils/admin-protection';
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, scaleInterpretationTable, interpretationHistoryTable } from '@/db/schema';
import { getInterpretationGenerator } from '@/services/interpretation/ai-generator';
import { eq, sql, and } from 'drizzle-orm';
import type { ScaleDataForInterpretation } from '@/types/interpretation';

export async function POST(request: NextRequest) {
  return withAdminAccess(request, async (request, session) => {
    try {
      const { limit = 5, offset = 0, scaleId, force = false, language = 'zh' } = await request.json();

    const db = getDB();
    const generator = getInterpretationGenerator();

    // 获取需要生成解读的量表
    let query = db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        copyrightHolderId: ecoaScaleTable.copyrightHolderId,
        itemsCount: ecoaScaleTable.itemsCount,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        domains: ecoaScaleTable.domains,
        description: ecoaScaleTable.description,
      })
      .from(ecoaScaleTable);

    if (scaleId) {
      query = query.where(eq(ecoaScaleTable.id, scaleId)) as typeof query;
    } else if (!force) {
      query = query.where(sql`
        NOT EXISTS (
          SELECT 1 FROM ${scaleInterpretationTable}
          WHERE ${scaleInterpretationTable.scaleId} = ${ecoaScaleTable.id}
          AND ${scaleInterpretationTable.language} = ${language}
        )
      `) as typeof query;
    }

    query = query.limit(limit).offset(offset) as typeof query;
    const scales = await query;

    if (scales.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scales need interpretation',
        results: { success: 0, failed: 0, total: 0 },
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { scale: string; error: string }[],
    };

    for (const scale of scales) {
      try {
        const scaleData: ScaleDataForInterpretation = {
          id: scale.id,
          name: scale.name,
          nameEn: scale.nameEn,
          acronym: scale.acronym,
          copyrightHolder: scale.copyrightHolderId || undefined,
          itemsCount: scale.itemsCount || undefined,
          administrationTime: scale.administrationTime || undefined,
          targetPopulation: scale.targetPopulation ? [scale.targetPopulation] : undefined,
          assessmentDomains: scale.domains || undefined,
          abstract: scale.description || undefined,
        };

        const result = await generator.generate(scaleData, { language });

        if (!result.success || !result.content) {
          throw new Error(result.error || 'Generation failed');
        }

        const existing = await db
          .select()
          .from(scaleInterpretationTable)
          .where(
            and(
              eq(scaleInterpretationTable.scaleId, scale.id),
              eq(scaleInterpretationTable.language, language)
            )
          )
          .limit(1);

        if (existing.length > 0 && !force) {
          continue;
        }

        if (existing.length > 0) {
          const oldVersion = existing[0].version;
          await db
            .update(scaleInterpretationTable)
            .set({
              overview: result.content.overview,
              structure: result.content.structure,
              psychometricProperties: result.content.psychometricProperties,
              interpretation: result.content.interpretation,
              usageGuidelines: result.content.usageGuidelines,
              clinicalApplications: result.content.clinicalApplications,
              rawContent: result.rawContent,
              aiModel: result.metadata?.model,
              aiTokensUsed: result.metadata?.tokensUsed,
              aiGeneratedAt: new Date(),
              version: oldVersion + 1,
              status: 'draft',
              needsVerification: 1,
              updatedAt: new Date(),
            })
            .where(eq(scaleInterpretationTable.id, existing[0].id));

          await db.insert(interpretationHistoryTable).values({
            interpretationId: existing[0].id,
            version: oldVersion + 1,
            changes: JSON.stringify({ type: 'regenerate' }),
            changeType: 'update',
            changeSummary: `AI重新生成（${result.metadata?.model}）`,
            changedBy: 'system',
          });
        } else {
          await db.insert(scaleInterpretationTable).values({
            scaleId: scale.id,
            overview: result.content.overview,
            structure: result.content.structure,
            psychometricProperties: result.content.psychometricProperties,
            interpretation: result.content.interpretation,
            usageGuidelines: result.content.usageGuidelines,
            clinicalApplications: result.content.clinicalApplications,
            rawContent: result.rawContent,
            generationMethod: 'ai',
            status: 'draft',
            language,
            aiModel: result.metadata?.model,
            aiTokensUsed: result.metadata?.tokensUsed,
            aiGeneratedAt: new Date(),
            aiConfidence: 0.7,
            needsVerification: 1,
            version: 1,
          });
        }

        results.success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed++;
        results.errors.push({
          scale: `${scale.name} (${scale.acronym})`,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        success: results.success,
        failed: results.failed,
        total: scales.length,
        errors: results.errors,
      },
    });
  } catch (error) {
    const err = error as { message: string };
      console.error('Batch generation failed:', err);
      return NextResponse.json(
        {
          success: false,
          message: err.message || 'Batch generation failed',
        },
        { status: 500 }
      );
    }
  });
}
