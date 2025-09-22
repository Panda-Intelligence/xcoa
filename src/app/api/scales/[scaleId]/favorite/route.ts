import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { userFavoriteTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ 
        isFavorited: false,
        requiresAuth: true 
      });
    }

    const params = await context.params;
    const { scaleId } = params;
    const userId = session.user.id;
    
    const db = getDB();
    
    // 检查是否已收藏（使用现有的userFavoriteTable）
    const favorite = await db
      .select()
      .from(userFavoriteTable)
      .where(and(
        eq(userFavoriteTable.userId, userId),
        eq(userFavoriteTable.scaleId, scaleId)
      ))
      .limit(1);
    
    return NextResponse.json({
      isFavorited: favorite.length > 0,
      favoriteDetails: favorite[0] || null,
      requiresAuth: false
    });
    
  } catch (error) {
    console.error('检查收藏状态错误:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}

// 切换收藏状态（添加或移除）
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { scaleId } = params;
    const userId = session.user.id;
    
    const db = getDB();
    
    // 检查是否已收藏
    const existing = await db
      .select()
      .from(userFavoriteTable)
      .where(and(
        eq(userFavoriteTable.userId, userId),
        eq(userFavoriteTable.scaleId, scaleId)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      // 已收藏，移除收藏
      await db
        .delete(userFavoriteTable)
        .where(eq(userFavoriteTable.id, existing[0].id));
      
      return NextResponse.json({
        success: true,
        action: 'removed',
        message: '已移除收藏'
      });
    } else {
      // 未收藏，添加收藏
      const body = await request.json().catch(() => ({}));
      
      await db.insert(userFavoriteTable).values({
        userId,
        scaleId,
        notes: body.notes || null,
      });
      
      return NextResponse.json({
        success: true,
        action: 'added',
        message: '收藏成功'
      });
    }
    
  } catch (error) {
    console.error('切换收藏状态错误:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}