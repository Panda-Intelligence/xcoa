import { NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaItemTable, ecoaScaleTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const db = getDB();
    let totalInserted = 0;
    
    // PHQ-9 完整题目数据
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

    // 先删除现有PHQ-9题目
    await db.delete(ecoaItemTable).where(eq(ecoaItemTable.scaleId, 'scale_phq9'));
    
    // 插入PHQ-9题目
    for (const item of phq9Items) {
      try {
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
        totalInserted++;
      } catch (error) {
        console.warn(`PHQ-9 题目${item.num}插入失败:`, error);
      }
    }

    // GAD-7 完整题目数据
    const gad7Items = [
      { num: 1, q: '感到紧张、焦虑或急躁', qe: 'Feeling nervous, anxious, or on edge', dim: '焦虑症状' },
      { num: 2, q: '无法停止或控制担忧', qe: 'Not being able to stop or control worrying', dim: '担忧控制' },
      { num: 3, q: '对很多不同的事情过分担忧', qe: 'Worrying too much about different things', dim: '过度担忧' },
      { num: 4, q: '很难放松下来', qe: 'Trouble relaxing', dim: '躯体紧张' },
      { num: 5, q: '坐立不安，难以安静地坐着', qe: 'Being so restless that it\'s hard to sit still', dim: '运动性不安' },
      { num: 6, q: '变得容易烦恼或急躁', qe: 'Becoming easily annoyed or irritable', dim: '易激惹' },
      { num: 7, q: '感到好像有什么可怕的事要发生', qe: 'Feeling afraid as if something awful might happen', dim: '恐惧感' }
    ];

    // 先删除现有GAD-7题目
    await db.delete(ecoaItemTable).where(eq(ecoaItemTable.scaleId, 'scale_gad7'));
    
    // 插入GAD-7题目
    for (const item of gad7Items) {
      try {
        await db.insert(ecoaItemTable).values({
          id: `item_gad7_${String(item.num).padStart(2, '0')}`,
          scaleId: 'scale_gad7',
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
        totalInserted++;
      } catch (error) {
        console.warn(`GAD-7 题目${item.num}插入失败:`, error);
      }
    }

    // 创建基础量表记录（如果不存在）
    const scaleRecords = [
      {
        id: 'scale_phq9',
        name: '患者健康问卷-9',
        nameEn: 'Patient Health Questionnaire-9',
        acronym: 'PHQ-9',
        description: 'PHQ-9是一个广泛使用的抑郁症筛查和严重程度评估工具，包含9个项目，基于DSM-IV抑郁症诊断标准。',
        categoryId: 'cat_01',
        itemsCount: 9,
        administrationTime: 5,
        targetPopulation: '成年人抑郁症筛查和评估',
        validationStatus: 'validated'
      },
      {
        id: 'scale_gad7',
        name: '广泛性焦虑障碍-7',
        nameEn: 'Generalized Anxiety Disorder-7',
        acronym: 'GAD-7',
        description: 'GAD-7是一个用于筛查和测量广泛性焦虑障碍严重程度的7项自评量表。该工具简短、可靠，广泛用于临床实践和研究中。',
        categoryId: 'cat_02',
        itemsCount: 7,
        administrationTime: 3,
        targetPopulation: '成年人焦虑症筛查和评估',
        validationStatus: 'validated'
      }
    ];

    // 确保量表记录存在
    for (const scale of scaleRecords) {
      try {
        // 使用 INSERT OR REPLACE 确保量表存在
        await db.insert(ecoaScaleTable).values(scale).onConflictDoUpdate({
          target: ecoaScaleTable.id,
          set: {
            itemsCount: scale.itemsCount,
            updatedAt: new Date()
          }
        });
      } catch (error) {
        console.warn(`量表${scale.acronym}创建/更新失败:`, error);
      }
    }

    // 验证插入结果
    const phq9Check = await db
      .select()
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, 'scale_phq9'));
      
    const gad7Check = await db
      .select()
      .from(ecoaItemTable)
      .where(eq(ecoaItemTable.scaleId, 'scale_gad7'));

    return NextResponse.json({
      success: true,
      message: `成功插入${totalInserted}个题目`,
      details: {
        phq9Items: phq9Check.length,
        gad7Items: gad7Check.length,
        totalInserted
      },
      availableScales: [
        { id: 'scale_phq9', name: 'PHQ-9', items: phq9Check.length },
        { id: 'scale_gad7', name: 'GAD-7', items: gad7Check.length }
      ]
    });

  } catch (error) {
    console.error('插入题目数据错误:', error);
    return NextResponse.json(
      { error: 'Failed to insert scale items', details: error.message },
      { status: 500 }
    );
  }
}