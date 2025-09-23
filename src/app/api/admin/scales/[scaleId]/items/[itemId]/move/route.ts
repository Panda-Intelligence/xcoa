import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaItemTable, userTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const moveItemSchema = z.object({
  direction: z.enum(['up', 'down'])
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string; itemId: string }> }
) {
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

    const params = await context.params;
    const { scaleId, itemId } = params;
    const body = await request.json();
    const moveData = moveItemSchema.parse(body);
    
    // 获取当前题目
    const currentItem = await db
      .select()
      .from(ecoaItemTable)
      .where(and(eq(ecoaItemTable.id, itemId), eq(ecoaItemTable.scaleId, scaleId)))
      .limit(1);

    if (currentItem.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const current = currentItem[0];
    
    // 获取要交换的题目
    const targetItem = await db
      .select()
      .from(ecoaItemTable)
      .where(
        and(
          eq(ecoaItemTable.scaleId, scaleId),
          moveData.direction === 'up' 
            ? sql`${ecoaItemTable.sortOrder} < ${current.sortOrder}`
            : sql`${ecoaItemTable.sortOrder} > ${current.sortOrder}`
        )
      )
      .orderBy(
        moveData.direction === 'up' 
          ? sql`${ecoaItemTable.sortOrder} DESC`
          : ecoaItemTable.sortOrder
      )
      .limit(1);

    if (targetItem.length === 0) {
      return NextResponse.json({ error: 'Cannot move item' }, { status: 400 });
    }

    const target = targetItem[0];

    // 交换排序顺序
    await db.transaction(async (tx) => {
      await tx
        .update(ecoaItemTable)
        .set({ sortOrder: target.sortOrder })
        .where(eq(ecoaItemTable.id, current.id));
      
      await tx
        .update(ecoaItemTable)
        .set({ sortOrder: current.sortOrder })
        .where(eq(ecoaItemTable.id, target.id));
    });

    return NextResponse.json({
      success: true,
      message: '题目顺序更新成功'
    });

  } catch (error) {
    console.error('移动题目错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid move data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to move item' },
      { status: 500 }
    );
  }
}