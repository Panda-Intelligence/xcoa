import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable, userTable } from '@/db/schema';
import { eq, like, or, and, sql, desc } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const createScaleSchema = z.object({
  name: z.string(),
  nameEn: z.string().optional(),
  acronym: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  administrationTime: z.number().optional(),
  targetPopulation: z.string().optional(),
  ageRange: z.string().optional(),
  validationStatus: z.enum(['draft', 'validated', 'published']).default('draft')
});

// Admin获取量表列表
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
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 构建查询
    let query = db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        description: ecoaScaleTable.description,
        categoryName: ecoaCategoryTable.name,
        itemsCount: ecoaScaleTable.itemsCount,
        dimensionsCount: ecoaScaleTable.dimensionsCount,
        languages: ecoaScaleTable.languages,
        validationStatus: ecoaScaleTable.validationStatus,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        ageRange: ecoaScaleTable.ageRange,
        usageCount: ecoaScaleTable.usageCount,
        favoriteCount: ecoaScaleTable.favoriteCount,
        isPublic: ecoaScaleTable.isPublic,
        createdAt: ecoaScaleTable.createdAt,
        updatedAt: ecoaScaleTable.updatedAt,
      })
      .from(ecoaScaleTable)
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id));

    // 添加状态筛选
    if (status !== 'all') {
      query = query.where(eq(ecoaScaleTable.validationStatus, status));
    }

    // 添加搜索
    if (search) {
      query = query.where(
        or(
          like(ecoaScaleTable.name, `%${search}%`),
          like(ecoaScaleTable.nameEn, `%${search}%`),
          like(ecoaScaleTable.acronym, `%${search}%`),
          like(ecoaScaleTable.description, `%${search}%`)
        )
      );
    }

    const scales = await query
      .orderBy(desc(ecoaScaleTable.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取统计信息
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ecoaScaleTable);

    const statusStats = await db
      .select({
        validationStatus: ecoaScaleTable.validationStatus,
        count: sql<number>`count(*)`
      })
      .from(ecoaScaleTable)
      .groupBy(ecoaScaleTable.validationStatus);

    const statistics = {
      total: totalCount[0]?.count || 0,
      published: statusStats.find(s => s.validationStatus === 'published')?.count || 0,
      validated: statusStats.find(s => s.validationStatus === 'validated')?.count || 0,
      draft: statusStats.find(s => s.validationStatus === 'draft')?.count || 0,
    };

    return NextResponse.json({
      success: true,
      scales,
      statistics,
      pagination: {
        total: totalCount[0]?.count || 0,
        limit,
        offset,
        hasMore: (totalCount[0]?.count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Admin获取量表列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scales' },
      { status: 500 }
    );
  }
}

// Admin创建新量表
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
    const scaleData = createScaleSchema.parse(body);

    // 创建量表记录
    const scaleId = `scale_${nanoid()}`;
    await db.insert(ecoaScaleTable).values({
      id: scaleId,
      name: scaleData.name,
      nameEn: scaleData.nameEn || null,
      acronym: scaleData.acronym || null,
      description: scaleData.description || null,
      administrationTime: scaleData.administrationTime || null,
      targetPopulation: scaleData.targetPopulation || null,
      ageRange: scaleData.ageRange || null,
      validationStatus: scaleData.validationStatus,
      isPublic: 1,
      itemsCount: 0,
      dimensionsCount: 0,
      languages: [],
      usageCount: 0,
      favoriteCount: 0,
    });

    // 获取创建的量表详情
    const createdScale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '量表创建成功',
      scale: createdScale[0]
    });

  } catch (error) {
    console.error('Admin创建量表错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid scale data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create scale' },
      { status: 500 }
    );
  }
}