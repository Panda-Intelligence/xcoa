import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { clinicalCasesTable, ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, like, or, and, sql, desc } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const casesSearchSchema = z.object({
  query: z.string().optional(),
  scaleId: z.string().optional(),
  specialty: z.string().optional(),
  difficultyLevel: z.string().optional(),
  reviewStatus: z.string().optional(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0)
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const scaleId = url.searchParams.get('scaleId') || '';
    const specialty = url.searchParams.get('specialty') || '';
    const difficultyLevel = url.searchParams.get('difficultyLevel') || '';
    const reviewStatus = url.searchParams.get('reviewStatus') || 'published'; // 默认只显示已发布的案例
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const db = getDB();

    // 构建查询
    let queryBuilder = db
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
        categoryName: ecoaCategoryTable.name,
      })
      .from(clinicalCasesTable)
      .innerJoin(ecoaScaleTable, eq(clinicalCasesTable.scaleId, ecoaScaleTable.id))
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
      .where(eq(clinicalCasesTable.reviewStatus, reviewStatus));

    // 添加搜索条件
    if (query) {
      queryBuilder = queryBuilder.where(
        and(
          eq(clinicalCasesTable.reviewStatus, reviewStatus),
          or(
            like(clinicalCasesTable.caseTitle, `%${query}%`),
            like(ecoaScaleTable.name, `%${query}%`),
            like(ecoaScaleTable.acronym, `%${query}%`),
            like(clinicalCasesTable.author, `%${query}%`),
            like(clinicalCasesTable.specialty, `%${query}%`)
          )
        )
      );
    }

    if (scaleId) {
      queryBuilder = queryBuilder.where(
        and(
          eq(clinicalCasesTable.reviewStatus, reviewStatus),
          eq(clinicalCasesTable.scaleId, scaleId)
        )
      );
    }

    if (specialty) {
      queryBuilder = queryBuilder.where(
        and(
          eq(clinicalCasesTable.reviewStatus, reviewStatus),
          eq(clinicalCasesTable.specialty, specialty)
        )
      );
    }

    if (difficultyLevel) {
      queryBuilder = queryBuilder.where(
        and(
          eq(clinicalCasesTable.reviewStatus, reviewStatus),
          eq(clinicalCasesTable.difficultyLevel, difficultyLevel)
        )
      );
    }

    // 执行查询
    const cases = await queryBuilder
      .orderBy(desc(clinicalCasesTable.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取筛选选项 (从实际数据中获取)
    const filterOptionsQuery = await db
      .select({
        specialty: clinicalCasesTable.specialty,
        difficultyLevel: clinicalCasesTable.difficultyLevel,
        scaleId: ecoaScaleTable.id,
        scaleName: ecoaScaleTable.name,
        scaleAcronym: ecoaScaleTable.acronym,
      })
      .from(clinicalCasesTable)
      .innerJoin(ecoaScaleTable, eq(clinicalCasesTable.scaleId, ecoaScaleTable.id))
      .where(eq(clinicalCasesTable.reviewStatus, 'published'));

    const filterOptions = {
      specialties: [...new Set(filterOptionsQuery.map(c => c.specialty).filter(Boolean))],
      difficultyLevels: [...new Set(filterOptionsQuery.map(c => c.difficultyLevel).filter(Boolean))],
      scales: [...new Set(filterOptionsQuery.map(c => ({
        id: c.scaleId,
        name: c.scaleName,
        acronym: c.scaleAcronym
      })))],
    };

    // 获取统计信息
    const totalCases = await db
      .select({ count: sql<number>`count(*)` })
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.reviewStatus, 'published'));

    const specialtyStats = await db
      .select({
        specialty: clinicalCasesTable.specialty,
        count: sql<number>`count(*)`
      })
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.reviewStatus, 'published'))
      .groupBy(clinicalCasesTable.specialty);

    const difficultyStats = await db
      .select({
        difficultyLevel: clinicalCasesTable.difficultyLevel,
        count: sql<number>`count(*)`
      })
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.reviewStatus, 'published'))
      .groupBy(clinicalCasesTable.difficultyLevel);

    const statistics = {
      totalCases: totalCases[0]?.count || 0,
      bySpecialty: specialtyStats.reduce((acc, stat) => {
        if (stat.specialty) acc[stat.specialty] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      byDifficultyLevel: difficultyStats.reduce((acc, stat) => {
        if (stat.difficultyLevel) acc[stat.difficultyLevel] = stat.count;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      cases,
      pagination: {
        total: totalCases[0]?.count || 0,
        limit,
        offset,
        hasMore: (totalCases[0]?.count || 0) > offset + limit
      },
      filterOptions,
      statistics
    });

  } catch (error) {
    console.error('获取临床案例错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical cases' },
      { status: 500 }
    );
  }
}