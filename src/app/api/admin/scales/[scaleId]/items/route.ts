import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaItemTable, ecoaScaleTable, userTable } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const createItemSchema = z.object({
  question: z.string(),
  questionEn: z.string().optional(),
  dimension: z.string().optional(),
  responseType: z.enum(['likert', 'boolean', 'numeric', 'text', 'single_choice', 'multiple_choice']),
  responseOptions: z.array(z.string()).optional(),
  scoringInfo: z.string().optional(),
  isRequired: z.boolean().default(true)
});

// 获取量表题目列表
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
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
    const { scaleId } = params;

    // 获取题目列表
    const items = await db
      .select()
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, scaleId))
      .orderBy(ecoaItemTable.sortOrder, ecoaItemTable.itemNumber);

    return NextResponse.json({
      success: true,
      items
    });

  } catch (error) {
    console.error('获取量表题目错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scale items' },
      { status: 500 }
    );
  }
}

// 创建新题目
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
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
    const { scaleId } = params;
    const body = await request.json();
    const itemData = createItemSchema.parse(body);

    // 检查量表是否存在
    const scale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
    }

    // 获取下一个题目号
    const lastItem = await db
      .select({ itemNumber: ecoaItemTable.itemNumber, sortOrder: ecoaItemTable.sortOrder })
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, scaleId))
      .orderBy(desc(ecoaItemTable.itemNumber))
      .limit(1);

    const nextItemNumber = (lastItem[0]?.itemNumber || 0) + 1;
    const nextSortOrder = (lastItem[0]?.sortOrder || 0) + 1;

    // 创建题目记录
    const itemId = `item_${nanoid()}`;
    await db.insert(ecoaItemTable).values({
      id: itemId,
      scaleId,
      itemNumber: nextItemNumber,
      question: itemData.question,
      questionEn: itemData.questionEn || null,
      dimension: itemData.dimension || null,
      responseType: itemData.responseType,
      responseOptions: itemData.responseOptions || null,
      scoringInfo: itemData.scoringInfo || null,
      isRequired: itemData.isRequired ? 1 : 0,
      sortOrder: nextSortOrder,
    });

    // 更新量表的题目数量
    await db
      .update(ecoaScaleTable)
      .set({
        itemsCount: sql`${ecoaScaleTable.itemsCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(ecoaScaleTable.id, scaleId));

    // 获取创建的题目详情
    const createdItem = await db
      .select()
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.id, itemId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: '题目创建成功',
      item: createdItem[0]
    });

  } catch (error) {
    console.error('创建题目错误:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid item data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}