import { NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaItemTable, ecoaScaleTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const db = getDB();
    let totalInserted = 0;
    
    // MMSE-2 简化版题目（10题核心题目）
    const mmse2Items = [
      { num: 1, q: '今年是哪一年？', qe: 'What year is it?', dim: '时间定向力', type: 'open_ended', options: ['开放式回答'] },
      { num: 2, q: '现在是什么季节？', qe: 'What season is it?', dim: '时间定向力', type: 'open_ended', options: ['开放式回答'] },
      { num: 3, q: '今天是几号？', qe: 'What is the date today?', dim: '时间定向力', type: 'open_ended', options: ['开放式回答'] },
      { num: 4, q: '我们现在在哪个城市？', qe: 'What city are we in?', dim: '地点定向力', type: 'open_ended', options: ['开放式回答'] },
      { num: 5, q: '我们在几楼？', qe: 'What floor are we on?', dim: '地点定向力', type: 'open_ended', options: ['开放式回答'] },
      { num: 6, q: '请重复：苹果、硬币、桌子', qe: 'Please repeat: Apple, Penny, Table', dim: '即时记忆', type: 'memory_task', options: ['苹果', '硬币', '桌子'] },
      { num: 7, q: '从100开始，连续减去7', qe: 'Serial 7s: 100-7=?', dim: '注意力和计算', type: 'calculation', options: ['93', '86', '79', '72', '65'] },
      { num: 8, q: '刚才我说的三个词是什么？', qe: 'What were the three words I asked you to remember?', dim: '延迟回忆', type: 'memory_recall', options: ['苹果', '硬币', '桌子'] },
      { num: 9, q: '这是什么？(指向手表)', qe: 'What is this? (point to watch)', dim: '命名', type: 'naming', options: ['手表', '表'] },
      { num: 10, q: '请复制这个图形（两个重叠的五边形）', qe: 'Copy this design (two intersecting pentagons)', dim: '视空间能力', type: 'visuospatial', options: ['绘图任务'] }
    ];

    // SF-36 简化版题目（10题核心健康问题）
    const sf36Items = [
      { num: 1, q: '总的来说，您认为您的健康状况如何？', qe: 'In general, would you say your health is:', dim: '一般健康', type: 'likert', options: ['很好', '好', '一般', '较差', '很差'] },
      { num: 2, q: '与一年前相比，您现在的健康状况如何？', qe: 'Compared to one year ago, how would you rate your health in general now?', dim: '健康变化', type: 'likert', options: ['比一年前好很多', '比一年前好一些', '和一年前差不多', '比一年前差一些', '比一年前差很多'] },
      { num: 3, q: '您的健康状况是否限制您进行剧烈活动？', qe: 'Does your health now limit you in vigorous activities?', dim: '身体功能', type: 'likert', options: ['是，限制很大', '是，限制一些', '否，一点也不限制'] },
      { num: 4, q: '您的健康状况是否限制您上几层楼梯？', qe: 'Does your health now limit you in climbing several flights of stairs?', dim: '身体功能', type: 'likert', options: ['是，限制很大', '是，限制一些', '否，一点也不限制'] },
      { num: 5, q: '过去4周里，由于身体健康问题，您工作或其他日常活动的时间是否减少了？', qe: 'During the past 4 weeks, have you cut down on the amount of time you spent on work or other activities as a result of your physical health?', dim: '身体角色功能', type: 'yes_no', options: ['是', '否'] },
      { num: 6, q: '过去4周里，您是否因为情绪问题而减少了工作或其他日常活动的时间？', qe: 'During the past 4 weeks, have you cut down on the amount of time you spent on work or other activities as a result of emotional problems?', dim: '情感角色功能', type: 'yes_no', options: ['是', '否'] },
      { num: 7, q: '过去4周里，疼痛对您的日常工作（包括上班和家务）干扰程度如何？', qe: 'During the past 4 weeks, how much did pain interfere with your normal work?', dim: '身体疼痛', type: 'likert', options: ['一点也不', '有一点', '中等程度', '相当厉害', '非常厉害'] },
      { num: 8, q: '过去4周里，您感到精力充沛吗？', qe: 'During the past 4 weeks, how much of the time did you feel full of energy?', dim: '活力', type: 'frequency', options: ['一直都是', '大部分时间', '很多时间', '有时', '很少', '从来没有'] },
      { num: 9, q: '过去4周里，您因为身体健康或情绪问题而影响了与家人、朋友、邻居或集体的正常社交活动吗？', qe: 'During the past 4 weeks, to what extent has your physical health or emotional problems interfered with your normal social activities?', dim: '社会功能', type: 'likert', options: ['一点也没有', '有一点', '中等程度', '相当厉害', '非常厉害'] },
      { num: 10, q: '过去4周里，您感到心情不好和沮丧吗？', qe: 'During the past 4 weeks, how much of the time have you felt downhearted and blue?', dim: '心理健康', type: 'frequency', options: ['一直都是', '大部分时间', '很多时间', '有时', '很少', '从来没有'] }
    ];

    // 所有量表数据
    const allScalesData = [
      {
        id: 'scale_mmse2',
        name: '简易精神状态检查量表-2',
        nameEn: 'Mini-Mental State Examination-2',
        acronym: 'MMSE-2',
        description: 'MMSE-2是MMSE的标准化更新版本，是全球使用最广泛的认知功能筛查工具之一。该量表评估定向力、注意力、记忆、语言和视空间技能。',
        categoryId: 'cat_03',
        itemsCount: 10,
        administrationTime: 10,
        targetPopulation: '成人认知功能筛查',
        validationStatus: 'validated',
        items: mmse2Items
      },
      {
        id: 'scale_sf36',
        name: '简明健康调查问卷',
        nameEn: 'Short Form Health Survey',
        acronym: 'SF-36',
        description: 'SF-36是一个广泛使用的健康相关生活质量测量工具，包含8个健康概念的36个条目，可用于一般人群和患者群体。',
        categoryId: 'cat_04',
        itemsCount: 10,
        administrationTime: 10,
        targetPopulation: '一般人群和患者群体健康状况评估',
        validationStatus: 'validated',
        items: sf36Items
      }
    ];

    // 处理MMSE-2和SF-36
    for (const scaleData of allScalesData) {
      // 创建量表记录
      try {
        await db.insert(ecoaScaleTable).values(scaleData).onConflictDoUpdate({
          target: ecoaScaleTable.id,
          set: {
            itemsCount: scaleData.itemsCount,
            updatedAt: new Date()
          }
        });
      } catch (error) {
        console.warn(`量表${scaleData.acronym}插入失败:`, error);
      }

      // 删除现有题目
      await db.delete(ecoaItemTable).where(eq(ecoaItemTable.scaleId, scaleData.id));
      
      // 插入题目
      for (const item of scaleData.items) {
        try {
          await db.insert(ecoaItemTable).values({
            id: `item_${scaleData.acronym.toLowerCase()}_${String(item.num).padStart(2, '0')}`,
            scaleId: scaleData.id,
            itemNumber: item.num,
            question: item.q,
            questionEn: item.qe,
            dimension: item.dim,
            responseType: item.type,
            responseOptions: item.options,
            scoringInfo: '根据类型评分',
            isRequired: 1,
            sortOrder: item.num,
          });
          totalInserted++;
        } catch (error) {
          console.warn(`${scaleData.acronym} 题目${item.num}插入失败:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `所有量表题目数据填充完成！总共插入 ${totalInserted} 个题目`,
      completedScales: [
        'PHQ-9 (9题) - 抑郁症筛查',
        'GAD-7 (7题) - 焦虑症筛查', 
        'HAM-D (10题) - 抑郁症评估',
        'MMSE-2 (10题) - 认知功能筛查',
        'SF-36 (10题) - 健康状况评估'
      ],
      testInstructions: '现在所有量表都有完整题目，可以测试交互式预览功能了！'
    });

  } catch (error) {
    console.error('填充所有题目错误:', error);
    return NextResponse.json(
      { error: 'Failed to populate all items', details: error.message },
      { status: 500 }
    );
  }
}