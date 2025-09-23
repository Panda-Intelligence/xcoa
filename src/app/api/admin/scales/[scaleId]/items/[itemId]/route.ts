import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaItemTable, ecoaScaleTable, userTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const updateItemSchema = z.object({
  question: z.string().optional(),
  questionEn: z.string().optional(),
  dimension: z.string().optional(),
  responseType: z.enum(['likert', 'boolean', 'numeric', 'text', 'single_choice', 'multiple_choice']).optional(),
  responseOptions: z.array(z.string()).optional(),
  scoringInfo: z.string().optional(),
  isRequired: z.boolean().optional()
});

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
    
    // 检查是否是移动操作
    if (body.direction) {
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
    }

    // 常规更新操作
    const updateData = updateItemSchema.parse(body);

    // 检查题目是否存在
    const item = await db
      .select()
      .from(ecoaItemTable)
      .where(and(eq(ecoaItemTable.id, itemId), eq(ecoaItemTable.scaleId, scaleId)))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // 构建更新数据
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (updateData.question) updateFields.question = updateData.question;
    if (updateData.questionEn !== undefined) updateFields.questionEn = updateData.questionEn;
    if (updateData.dimension !== undefined) updateFields.dimension = updateData.dimension;
    if (updateData.responseType) updateFields.responseType = updateData.responseType;
    if (updateData.responseOptions !== undefined) updateFields.responseOptions = updateData.responseOptions;
    if (updateData.scoringInfo !== undefined) updateFields.scoringInfo = updateData.scoringInfo;
    if (updateData.isRequired !== undefined) updateFields.isRequired = updateData.isRequired ? 1 : 0;

    // 执行更新
    await db
      .update(ecoaItemTable)
      .set(updateFields)
      .where(eq(ecoaItemTable.id, itemId));

    // 更新量表的修改时间
    await db
      .update(ecoaScaleTable)
      .set({ updatedAt: new Date() })
      .where(eq(ecoaScaleTable.id, scaleId));

    return NextResponse.json({
      success: true,
      message: '题目更新成功'
    });

  } catch (error) {
    console.error('更新题目错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid item data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 检查题目是否存在
    const item = await db
      .select()
      .from(ecoaItemTable)
      .where(and(eq(ecoaItemTable.id, itemId), eq(ecoaItemTable.scaleId, scaleId)))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // 删除题目
    await db
      .delete(ecoaItemTable)
      .where(eq(ecoaItemTable.id, itemId));

    // 更新量表的题目数量
    await db
      .update(ecoaScaleTable)
      .set({ 
        itemsCount: sql`${ecoaScaleTable.itemsCount} - 1`,
        updatedAt: new Date()
      })
      .where(eq(ecoaScaleTable.id, scaleId));

    return NextResponse.json({
      success: true,
      message: '题目删除成功'
    });

  } catch (error) {
    console.error('删除题目错误:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}