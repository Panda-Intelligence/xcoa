import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { 
  ecoaScaleTable, 
  ecoaCategoryTable, 
  ecoaItemTable,
  scaleUsageTable
} from '@/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const compareRequestSchema = z.object({
  scaleIds: z.array(z.string()).min(2).max(5), // 最多对比5个量表
});

// 计算两个量表的相似度
function calculateSimilarity(scale1: any, scale2: any): number {
  let similarity = 0;
  let factors = 0;

  // 分类相似度 (权重: 30%)
  if (scale1.categoryId === scale2.categoryId) {
    similarity += 30;
  }
  factors += 30;

  // 题项数量相似度 (权重: 20%)
  const itemsDiff = Math.abs((scale1.itemsCount || 0) - (scale2.itemsCount || 0));
  const itemsSimilarity = Math.max(0, 20 - itemsDiff);
  similarity += itemsSimilarity;
  factors += 20;

  // 管理时间相似度 (权重: 15%)
  if (scale1.administrationTime && scale2.administrationTime) {
    const timeDiff = Math.abs(scale1.administrationTime - scale2.administrationTime);
    const timeSimilarity = Math.max(0, 15 - timeDiff);
    similarity += timeSimilarity;
    factors += 15;
  }

  // 目标人群相似度 (权重: 15%)
  if (scale1.targetPopulation && scale2.targetPopulation) {
    const population1 = scale1.targetPopulation.toLowerCase();
    const population2 = scale2.targetPopulation.toLowerCase();
    if (population1.includes('成年人') && population2.includes('成年人')) {
      similarity += 15;
    } else if (population1.includes('老年人') && population2.includes('老年人')) {
      similarity += 15;
    } else if (population1.includes('青少年') && population2.includes('青少年')) {
      similarity += 15;
    }
  }
  factors += 15;

  // 评估领域重叠度 (权重: 20%)
  const domains1 = scale1.domains || [];
  const domains2 = scale2.domains || [];
  if (domains1.length > 0 && domains2.length > 0) {
    const intersection = domains1.filter((domain: string) => domains2.includes(domain));
    const union = [...new Set([...domains1, ...domains2])];
    const overlap = intersection.length / union.length;
    similarity += overlap * 20;
  }
  factors += 20;

  return factors > 0 ? Math.round((similarity / factors) * 100) : 0;
}

export async function POST(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;
      const ip = getIP(request);
      
      const body = await request.json();
      const { scaleIds } = compareRequestSchema.parse(body);
      
      // 获取所有要对比的量表
      const scales = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          nameEn: ecoaScaleTable.nameEn,
          acronym: ecoaScaleTable.acronym,
          description: ecoaScaleTable.description,
          descriptionEn: ecoaScaleTable.descriptionEn,
          categoryId: ecoaScaleTable.categoryId,
          categoryName: ecoaCategoryTable.name,
          categoryNameEn: ecoaCategoryTable.nameEn,
          itemsCount: ecoaScaleTable.itemsCount,
          dimensionsCount: ecoaScaleTable.dimensionsCount,
          languages: ecoaScaleTable.languages,
          validationStatus: ecoaScaleTable.validationStatus,
          administrationTime: ecoaScaleTable.administrationTime,
          targetPopulation: ecoaScaleTable.targetPopulation,
          ageRange: ecoaScaleTable.ageRange,
          domains: ecoaScaleTable.domains,
          scoringMethod: ecoaScaleTable.scoringMethod,
          copyrightInfo: ecoaScaleTable.copyrightInfo,
          psychometricProperties: ecoaScaleTable.psychometricProperties,
          usageCount: ecoaScaleTable.usageCount,
          favoriteCount: ecoaScaleTable.favoriteCount,
        })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(
          and(
            inArray(ecoaScaleTable.id, scaleIds),
            eq(ecoaScaleTable.isPublic, 1)
          )
        );

      if (scales.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 valid scales required for comparison' },
          { status: 400 }
        );
      }

      // 解析 JSON 字段
      const parsedScales = scales.map(scale => ({
        ...scale,
        languages: Array.isArray(scale.languages) ? scale.languages :
          (scale.languages ? JSON.parse(scale.languages) : []),
        domains: Array.isArray(scale.domains) ? scale.domains :
          (scale.domains ? JSON.parse(scale.domains) : []),
        psychometricProperties: typeof scale.psychometricProperties === 'object' ?
          scale.psychometricProperties :
          (scale.psychometricProperties ? JSON.parse(scale.psychometricProperties) : null),
      }));

      // 生成对比分析
      const comparison = {
        scales: parsedScales,
        analysis: {
          similarities: [] as any[],
          differences: {
            categories: [...new Set(parsedScales.map(s => s.categoryName))],
            itemsCounts: parsedScales.map(s => ({ name: s.acronym, count: s.itemsCount })),
            administrationTimes: parsedScales.map(s => ({ 
              name: s.acronym, 
              time: s.administrationTime 
            })),
            targetPopulations: [...new Set(parsedScales.map(s => s.targetPopulation))],
            validationStatuses: [...new Set(parsedScales.map(s => s.validationStatus))],
          },
          recommendations: [] as string[],
        },
        statistics: {
          totalScales: parsedScales.length,
          avgItemsCount: Math.round(
            parsedScales.reduce((sum, s) => sum + (s.itemsCount || 0), 0) / parsedScales.length
          ),
          avgAdministrationTime: Math.round(
            parsedScales.reduce((sum, s) => sum + (s.administrationTime || 0), 0) / 
            parsedScales.filter(s => s.administrationTime).length || 0
          ),
          commonLanguages: parsedScales.reduce((common, scale) => {
            return common.filter(lang => scale.languages.includes(lang));
          }, parsedScales[0].languages),
        }
      };

      // 计算量表间相似度
      for (let i = 0; i < parsedScales.length; i++) {
        for (let j = i + 1; j < parsedScales.length; j++) {
          const scale1 = parsedScales[i];
          const scale2 = parsedScales[j];
          const similarityScore = calculateSimilarity(scale1, scale2);
          
          comparison.analysis.similarities.push({
            scale1: { id: scale1.id, name: scale1.name, acronym: scale1.acronym },
            scale2: { id: scale2.id, name: scale2.name, acronym: scale2.acronym },
            similarityScore,
            commonFactors: [
              scale1.categoryId === scale2.categoryId ? '同类别' : null,
              Math.abs((scale1.itemsCount || 0) - (scale2.itemsCount || 0)) <= 5 ? '题项数相近' : null,
              scale1.administrationTime && scale2.administrationTime && 
              Math.abs(scale1.administrationTime - scale2.administrationTime) <= 5 ? '用时相近' : null,
            ].filter(Boolean),
          });
        }
      }

      // 生成使用建议
      if (comparison.analysis.similarities.some(s => s.similarityScore > 70)) {
        comparison.analysis.recommendations.push('这些量表在功能上有较高相似性，建议根据具体评估需求选择其中一个使用。');
      }

      if (parsedScales.some(s => s.administrationTime && s.administrationTime <= 5)) {
        comparison.analysis.recommendations.push('包含快速筛查工具，适合初步评估或大规模筛查。');
      }

      if (parsedScales.some(s => s.administrationTime && s.administrationTime >= 15)) {
        comparison.analysis.recommendations.push('包含详细评估工具，适合深入诊断和研究用途。');
      }

      // 记录使用分析
      for (const scale of parsedScales) {
        try {
          await db.insert(scaleUsageTable).values({
            scaleId: scale.id,
            userId: user?.id,
            actionType: 'comparison',
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || '',
          });
        } catch (error) {
          console.warn('Failed to save usage record:', error);
        }
      }

      return NextResponse.json({
        comparison,
        meta: {
          comparedAt: new Date().toISOString(),
          scaleIds,
          userId: user?.id,
        }
      });

    } catch (error) {
      console.error('Scale comparison API error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid comparison parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to compare scales' },
        { status: 500 }
      );
    }
  }, {
    identifier: 'scale-comparison',
    limit: 30,
    windowInSeconds: 60,
  });
}