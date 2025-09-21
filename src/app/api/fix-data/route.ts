import { NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaItemTable, ecoaScaleTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const db = getDB();
    
    // 立即插入PHQ-9题目数据
    const phq9Items = [
      { num: 1, q: '做事时提不起劲或没有兴趣', qe: 'Little interest or pleasure in doing things', dim: '核心症状' },
      { num: 2, q: '感到心情低落、沮丧或绝望', qe: 'Feeling down, depressed, or hopeless', dim: '核心症状' },
      { num: 3, q: '入睡困难、睡不安稳或睡眠过多', qe: 'Trouble falling or staying asleep, or sleeping too much', dim: '躯体症状' },
      { num: 4, q: '感觉疲倦或没有活力', qe: 'Feeling tired or having little energy', dim: '躯体症状' },
      { num: 5, q: '食欲不振或吃太多', qe: 'Poor appetite or overeating', dim: '躯体症状' },
      { num: 6, q: '觉得自己很糟糕，或觉得自己很失败，或让自己或家人失望', qe: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down', dim: '认知症状' },
      { num: 7, q: '对事物专注有困难，例如阅读报纸或看电视时', qe: 'Trouble concentrating on things, such as reading the newspaper or watching television', dim: '认知症状' },
      { num: 8, q: '动作或说话速度缓慢到别人已经察觉？或正好相反—烦躁或坐立不安，动来动去的情况超过平常', qe: 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual', dim: '躯体症状' },
      { num: 9, q: '有不如死掉或用某种方式伤害自己的想法', qe: 'Thoughts that you would be better off dead, or of hurting yourself in some way', dim: '自杀风险' }
    ];

    // 先删除现有数据
    await db.delete(ecoaItemTable).where(eq(ecoaItemTable.scaleId, 'scale_phq9'));
    
    // 插入新数据
    for (const item of phq9Items) {
      await db.insert(ecoaItemTable).values({
        id: `item_phq9_${String(item.num).padStart(2, '0')}`,
        scaleId: 'scale_phq9',
        itemNumber: item.num,
        question: item.q,
        questionEn: item.qe,
        dimension: item.dim,
        responseType: 'likert',
        responseOptions: ["完全不会", "有几天", "一半以上的天数", "几乎每天"],
        scoringInfo: `${item.num-1}-3分`,
        isRequired: 1,
        sortOrder: item.num,
      });
    }

    // 验证结果
    const inserted = await db
      .select()
      .from(ecoaItemTable)  
      .where(eq(ecoaItemTable.scaleId, 'scale_phq9'))
      .orderBy(ecoaItemTable.itemNumber);

    return NextResponse.json({
      success: true,
      message: `成功插入${inserted.length}个PHQ-9题目`,
      items: inserted.map(item => ({
        itemNumber: item.itemNumber,
        question: item.question,
        options: item.responseOptions
      }))
    });

  } catch (error) {
    console.error('Emergency insert error:', error);
    return NextResponse.json(
      { error: 'Failed to insert PHQ-9 items', details: error.message },
      { status: 500 }
    );
  }
}