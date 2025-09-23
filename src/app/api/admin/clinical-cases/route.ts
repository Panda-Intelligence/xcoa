import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { clinicalCasesTable, ecoaScaleTable, userTable } from '@/db/schema';
import { eq, like, or, and, sql, desc } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const createCaseSchema = z.object({
  scaleId: z.string(),
  title: z.string(),
  patientBackground: z.string().optional(),
  interpretation: z.string().optional(),
  clinicalDecision: z.string().optional(),
  outcome: z.string().optional(),
  learningPoints: z.string().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  specialty: z.string().optional(),
  author: z.string().optional(),
  reviewStatus: z.enum(['draft', 'reviewed', 'published']).default('draft')
});

// Admin获取临床案例列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员
    const db = getDB();
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const reviewStatus = url.searchParams.get('reviewStatus') || 'all';
    const search = url.searchParams.get('query') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 构建查询
    let query = db
      .select({
        id: clinicalCasesTable.id,
        title: clinicalCasesTable.caseTitle,
        scaleId: clinicalCasesTable.scaleId,
        scaleName: ecoaScaleTable.name,
        scaleAcronym: ecoaScaleTable.acronym,
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
      })
      .from(clinicalCasesTable)
      .innerJoin(ecoaScaleTable, eq(clinicalCasesTable.scaleId, ecoaScaleTable.id));

    // 添加状态筛选
    if (reviewStatus !== 'all') {
      query = query.where(eq(clinicalCasesTable.reviewStatus, reviewStatus));
    }

    // 添加搜索
    if (search) {
      query = query.where(
        or(
          like(clinicalCasesTable.caseTitle, `%${search}%`),
          like(ecoaScaleTable.name, `%${search}%`),
          like(ecoaScaleTable.acronym, `%${search}%`),
          like(clinicalCasesTable.author, `%${search}%`),
          like(clinicalCasesTable.specialty, `%${search}%`)
        )
      );
    }

    const cases = await query
      .orderBy(desc(clinicalCasesTable.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取统计信息
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(clinicalCasesTable);

    const statusStats = await db
      .select({
        reviewStatus: clinicalCasesTable.reviewStatus,
        count: sql<number>`count(*)`
      })
      .from(clinicalCasesTable)
      .groupBy(clinicalCasesTable.reviewStatus);

    const statistics = {
      total: totalCount[0]?.count || 0,
      published: statusStats.find(s => s.reviewStatus === 'published')?.count || 0,
      reviewed: statusStats.find(s => s.reviewStatus === 'reviewed')?.count || 0,
      draft: statusStats.find(s => s.reviewStatus === 'draft')?.count || 0,
    };

    return NextResponse.json({
      success: true,
      cases,
      statistics,
      pagination: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        hasMore: (totalCount[0]?.count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Admin获取临床案例列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical cases' },
      { status: 500 }
    );
  }
}

// Admin创建新临床案例
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    
    // 检查是否为管理员
    const user = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const caseData = createCaseSchema.parse(body);

    // 验证量表是否存在
    const scale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, caseData.scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
    }

    // 创建案例记录
    const caseId = `case_${nanoid()}`;
    await db.insert(clinicalCasesTable).values({
      id: caseId,
      scaleId: caseData.scaleId,
      caseTitle: caseData.title,
      patientBackground: caseData.patientBackground || null,
      interpretation: caseData.interpretation || null,
      clinicalDecision: caseData.clinicalDecision || null,
      outcome: caseData.outcome || null,
      learningPoints: caseData.learningPoints || null,
      difficultyLevel: caseData.difficultyLevel,
      specialty: caseData.specialty || null,
      author: caseData.author || null,
      reviewStatus: caseData.reviewStatus,
    });

    // 获取创建的案例详情
    const createdCase = await db
      .select()
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '临床案例创建成功',
      case: createdCase[0]
    });

  } catch (error) {
    console.error('Admin创建临床案例错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid case data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create clinical case' },
      { status: 500 }
    );
  }
}