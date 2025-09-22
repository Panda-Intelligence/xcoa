import { NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaItemTable, ecoaScaleTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const db = getDB();
    let totalInserted = 0;
    
    // EORTC QLQ-C30 核心题目（15题版本）
    const eortcItems = [
      { num: 1, q: '您在做费力的活动时有困难吗？如提重物或做体力活动', qe: 'Do you have any trouble doing strenuous activities, like carrying a heavy shopping bag or a suitcase?', dim: '身体功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 2, q: '您在长距离步行时有困难吗？', qe: 'Do you have any trouble taking a long walk?', dim: '身体功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 3, q: '您在短距离步行时有困难吗？', qe: 'Do you have any trouble taking a short walk outside of the house?', dim: '身体功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 4, q: '白天您需要在床上休息或坐在椅子上吗？', qe: 'Do you need to stay in bed or a chair during the day?', dim: '身体功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 5, q: '您在吃饭、穿衣、洗澡或上厕所时需要帮助吗？', qe: 'Do you need help with eating, dressing, washing yourself or using the toilet?', dim: '身体功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 6, q: '在过去一周里，您是否因为身体状况或医疗而限制了工作或做其他日常活动？', qe: 'Were you limited in doing either your work or other daily activities?', dim: '角色功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 7, q: '在过去一周里，您是否因为身体状况或医疗而限制了追求业余爱好或其他休闲活动？', qe: 'Were you limited in pursuing your hobbies or other leisure time activities?', dim: '角色功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 8, q: '您感到气短吗？', qe: 'Were you short of breath?', dim: '症状量表', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 9, q: '您感到疼痛吗？', qe: 'Have you had pain?', dim: '症状量表', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 10, q: '您需要休息吗？', qe: 'Did you need to rest?', dim: '症状量表', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 11, q: '您睡眠有困难吗？', qe: 'Have you had trouble sleeping?', dim: '症状量表', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 12, q: '您感到虚弱吗？', qe: 'Have you felt weak?', dim: '症状量表', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 13, q: '您感到恶心吗？', qe: 'Have you felt nauseated?', dim: '症状量表', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 14, q: '您的身体状况或医疗影响了您的家庭生活吗？', qe: 'Has your physical condition or medical treatment interfered with your family life?', dim: '社会功能', options: ['一点也没有', '有一点', '很有', '非常有'] },
      { num: 15, q: '您的身体状况或医疗影响了您的社交活动吗？', qe: 'Has your physical condition or medical treatment interfered with your social activities?', dim: '社会功能', options: ['一点也没有', '有一点', '很有', '非常有'] }
    ];

    // VAS疼痛量表题目（5题简化版）
    const vasItems = [
      { num: 1, q: '请在0-10的量尺上标出您目前的疼痛程度（0=无痛，10=无法忍受的疼痛）', qe: 'Please rate your current pain on a scale of 0-10 (0=no pain, 10=unbearable pain)', dim: '疼痛强度', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
      { num: 2, q: '请标出您过去24小时内最严重的疼痛程度', qe: 'Please rate your worst pain in the last 24 hours', dim: '疼痛强度', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
      { num: 3, q: '请标出您过去24小时内最轻微的疼痛程度', qe: 'Please rate your least pain in the last 24 hours', dim: '疼痛强度', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
      { num: 4, q: '请标出您过去24小时内的平均疼痛程度', qe: 'Please rate your average pain in the last 24 hours', dim: '疼痛强度', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
      { num: 5, q: '疼痛对您的日常活动影响程度如何？', qe: 'How much has pain interfered with your daily activities?', dim: '功能影响', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] }
    ];

    // 所有量表数据
    const additionalScales = [
      {
        id: 'scale_eortc',
        name: 'EORTC生活质量核心问卷',
        nameEn: 'EORTC QLQ-C30',
        acronym: 'EORTC QLQ-C30',
        description: 'EORTC QLQ-C30是专门为癌症患者设计的生活质量评估工具，包含功能量表和症状量表，广泛用于癌症临床试验和研究。',
        categoryId: 'cat_04',
        itemsCount: 15,
        administrationTime: 15,
        targetPopulation: '癌症患者生活质量评估',
        validationStatus: 'validated',
        items: eortcItems
      },
      {
        id: 'scale_vas',
        name: '视觉模拟评分量表',
        nameEn: 'Visual Analogue Scale',
        acronym: 'VAS',
        description: 'VAS是一个简单而有效的疼痛评估工具，使用0-10的数字量尺来评估疼痛强度和对功能的影响。',
        categoryId: 'cat_05',
        itemsCount: 5,
        administrationTime: 2,
        targetPopulation: '疼痛患者',
        validationStatus: 'validated',
        items: vasItems
      }
    ];

    // 处理每个量表
    for (const scaleData of additionalScales) {
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
            id: `item_${scaleData.acronym.toLowerCase().replace(/[^a-z0-9]/g, '')}_${String(item.num).padStart(2, '0')}`,
            scaleId: scaleData.id,
            itemNumber: item.num,
            question: item.q,
            questionEn: item.qe,
            dimension: item.dim,
            responseType: 'likert',
            responseOptions: item.options,
            scoringInfo: '0-最高分',
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
      message: `额外量表题目数据填充完成！总共插入 ${totalInserted} 个题目`,
      completedScales: [
        'EORTC QLQ-C30 (15题) - 癌症生活质量',
        'VAS (5题) - 疼痛评估'
      ],
      testInstructions: [
        '访问 /scales/scale_eortc/preview 测试EORTC',
        '访问 /scales/scale_vas/preview 测试VAS',
        '所有量表现在都支持完整的交互式预览！'
      ]
    });

  } catch (error) {
    console.error('填充额外题目错误:', error);
    return NextResponse.json(
      { error: 'Failed to populate additional items', details: error.message },
      { status: 500 }
    );
  }
}