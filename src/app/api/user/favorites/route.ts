import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { userFavoriteTable, ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

// 添加收藏的请求schema
const addFavoriteSchema = z.object({
  scaleId: z.string(),
  notes: z.string().optional()
});

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const userId = session.user.id;

    // 获取用户的收藏量表（带详细信息）
    const favorites = await db
      .select({
        id: userFavoriteTable.id,
        scaleId: userFavoriteTable.scaleId,
        notes: userFavoriteTable.notes,
        createdAt: userFavoriteTable.createdAt,
        scaleName: ecoaScaleTable.name,
        scaleNameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        description: ecoaScaleTable.description,
        itemsCount: ecoaScaleTable.itemsCount,
        administrationTime: ecoaScaleTable.administrationTime,
        targetPopulation: ecoaScaleTable.targetPopulation,
        validationStatus: ecoaScaleTable.validationStatus,
        categoryName: ecoaCategoryTable.name,
      })
      .from(userFavoriteTable)
      .innerJoin(ecoaScaleTable, eq(userFavoriteTable.scaleId, ecoaScaleTable.id))
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
      .where(eq(userFavoriteTable.userId, userId))
      .orderBy(desc(userFavoriteTable.createdAt));

    // 简单统计
    const totalFavorites = favorites.length;

    return NextResponse.json({
      success: true,
      favorites,
      statistics: {
        totalFavorites,
        totalCollections: 1, // 暂时只有默认分类
        recentFavorites: favorites.filter(f => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(f.createdAt) > weekAgo;
        }).length
      }
    });

  } catch (error) {
    console.error('获取收藏列表错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scaleId, notes } = addFavoriteSchema.parse(body);

    const db = getDB();
    const userId = session.user.id;

    // 检查是否已经收藏
    const existingFavorite = await db
      .select()
      .from(userFavoriteTable)
      .where(and(
        eq(userFavoriteTable.userId, userId),
        eq(userFavoriteTable.scaleId, scaleId)
      ))
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json({ error: 'Scale already in favorites' }, { status: 409 });
    }

    // 创建收藏记录
    await db.insert(userFavoriteTable).values({
      userId,
      scaleId,
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      message: '收藏成功'
    });

  } catch (error) {
    console.error('添加收藏错误:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// 移除收藏
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const scaleId = url.searchParams.get('scaleId');

    if (!scaleId) {
      return NextResponse.json({ error: 'Scale ID required' }, { status: 400 });
    }

    const db = getDB();
    const userId = session.user.id;

    // 删除收藏记录
    const result = await db
      .delete(userFavoriteTable)
      .where(and(
        eq(userFavoriteTable.userId, userId),
        eq(userFavoriteTable.scaleId, scaleId)
      ));

    return NextResponse.json({
      success: true,
      message: '已移除收藏'
    });

  } catch (error) {
    console.error('移除收藏错误:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}