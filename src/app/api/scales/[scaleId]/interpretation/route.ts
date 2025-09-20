import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable, ecoaItemTable, scaleUsageTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { getIP } from '@/utils/get-IP';
import { withRateLimit } from '@/utils/with-rate-limit';
import { z } from 'zod';

const interpretationParamsSchema = z.object({
  scaleId: z.string(),
});

const scoreInterpretationSchema = z.object({
  scaleId: z.string(),
  scores: z.record(z.string(), z.number()), // itemId -> score
  totalScore: z.number().optional(),
  demographicInfo: z.object({
    age: z.number().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    education: z.enum(['primary', 'secondary', 'undergraduate', 'graduate', 'postgraduate']).optional(),
    clinicalContext: z.enum(['screening', 'diagnosis', 'monitoring', 'research']).optional(),
  }).optional(),
});

// 生成量表解读指南
function generateScaleInterpretation(scale: any, items: any[]) {
  const interpretation = {
    overview: {
      purpose: getScalePurpose(scale.acronym),
      clinicalUse: getClinicalUse(scale.acronym),
      targetPopulation: scale.targetPopulation,
      administrationTime: scale.administrationTime,
    },
    scoringGuide: {
      scoringMethod: scale.scoringMethod,
      cutoffScores: getCutoffScores(scale.acronym),
      interpretationLevels: getInterpretationLevels(scale.acronym),
    },
    clinicalGuidance: {
      useInScreening: getScreeningGuidance(scale.acronym),
      useInDiagnosis: getDiagnosticGuidance(scale.acronym),
      useInMonitoring: getMonitoringGuidance(scale.acronym),
      useInResearch: getResearchGuidance(scale.acronym),
    },
    itemAnalysis: items.map(item => ({
      itemNumber: item.itemNumber,
      question: item.question,
      dimension: item.dimension,
      clinicalSignificance: getItemSignificance(scale.acronym, item.itemNumber),
      scoringNotes: item.scoringInfo,
    })),
    practicalConsiderations: {
      administrationTips: getAdministrationTips(scale.acronym),
      commonChallenges: getCommonChallenges(scale.acronym),
      culturalConsiderations: getCulturalConsiderations(scale.acronym),
      limitationsAndCautions: getLimitationsAndCautions(scale.acronym),
    },
    clinicalExamples: getClinicalExamples(scale.acronym),
  };

  return interpretation;
}

// 计算个性化分数解读
function interpretScores(scale: any, scores: Record<string, number>, totalScore?: number, demographics?: any) {
  const scaleAcronym = scale.acronym;
  const interpretation = {
    totalScore: totalScore || Object.values(scores).reduce((sum, score) => sum + score, 0),
    severity: 'unknown',
    percentile: null as number | null,
    clinicalSignificance: 'to_be_determined',
    recommendations: [] as string[],
    itemAnalysis: [] as any[],
    riskFactors: [] as string[],
    followUpRecommendations: [] as string[],
  };

  // PHQ-9 特定解读
  if (scaleAcronym === 'PHQ-9') {
    const total = interpretation.totalScore;

    if (total <= 4) {
      interpretation.severity = 'minimal';
      interpretation.clinicalSignificance = 'normal_range';
      interpretation.recommendations = [
        '分数在正常范围内，无明显抑郁症状',
        '可继续正常生活和工作',
        '建议保持健康的生活方式',
      ];
    } else if (total <= 9) {
      interpretation.severity = 'mild';
      interpretation.clinicalSignificance = 'mild_symptoms';
      interpretation.recommendations = [
        '存在轻度抑郁症状，建议关注心理健康',
        '可考虑心理咨询或支持',
        '建议 2-4 周后重新评估',
      ];
    } else if (total <= 14) {
      interpretation.severity = 'moderate';
      interpretation.clinicalSignificance = 'moderate_symptoms';
      interpretation.recommendations = [
        '存在中度抑郁症状，建议寻求专业帮助',
        '推荐心理咨询或精神科评估',
        '考虑心理治疗或药物治疗',
        '建议 1-2 周后重新评估',
      ];
      interpretation.riskFactors = ['需要关注自杀风险'];
    } else if (total <= 19) {
      interpretation.severity = 'moderately_severe';
      interpretation.clinicalSignificance = 'significant_symptoms';
      interpretation.recommendations = [
        '存在中重度抑郁症状，强烈建议立即寻求专业治疗',
        '建议精神科医生评估和治疗',
        '可能需要药物治疗结合心理治疗',
      ];
      interpretation.riskFactors = ['需要密切关注自杀风险', '可能影响日常功能'];
    } else {
      interpretation.severity = 'severe';
      interpretation.clinicalSignificance = 'severe_symptoms';
      interpretation.recommendations = [
        '存在重度抑郁症状，需要立即专业医疗干预',
        '强烈建议立即联系精神科医生',
        '可能需要住院治疗或密切监护',
      ];
      interpretation.riskFactors = ['高自杀风险', '严重功能损害', '需要紧急医疗关注'];
    }

    // 第9题自杀风险特别关注
    if (scores['item_phq9_09'] && scores['item_phq9_09'] > 0) {
      interpretation.riskFactors.push('存在自杀想法，需要立即评估和干预');
      interpretation.followUpRecommendations.push('立即进行自杀风险评估');
    }
  }

  // GAD-7 特定解读
  if (scaleAcronym === 'GAD-7') {
    const total = interpretation.totalScore;

    if (total <= 4) {
      interpretation.severity = 'minimal';
      interpretation.clinicalSignificance = 'normal_range';
    } else if (total <= 9) {
      interpretation.severity = 'mild';
      interpretation.clinicalSignificance = 'mild_anxiety';
    } else if (total <= 14) {
      interpretation.severity = 'moderate';
      interpretation.clinicalSignificance = 'moderate_anxiety';
    } else {
      interpretation.severity = 'severe';
      interpretation.clinicalSignificance = 'severe_anxiety';
    }
  }

  return interpretation;
}

// 获取量表解读指南
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;
      const ip = getIP(request);

      const params = await context.params;
      const { scaleId } = interpretationParamsSchema.parse(params);

      // 获取量表详细信息
      const [scale] = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          nameEn: ecoaScaleTable.nameEn,
          acronym: ecoaScaleTable.acronym,
          description: ecoaScaleTable.description,
          categoryName: ecoaCategoryTable.name,
          scoringMethod: ecoaScaleTable.scoringMethod,
          administrationTime: ecoaScaleTable.administrationTime,
          targetPopulation: ecoaScaleTable.targetPopulation,
          psychometricProperties: ecoaScaleTable.psychometricProperties,
        })
        .from(ecoaScaleTable)
        .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
        .where(eq(ecoaScaleTable.id, scaleId));

      if (!scale) {
        return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
      }

      // 获取题项信息
      const items = await db
        .select({
          id: ecoaItemTable.id,
          itemNumber: ecoaItemTable.itemNumber,
          question: ecoaItemTable.question,
          questionEn: ecoaItemTable.questionEn,
          dimension: ecoaItemTable.dimension,
          responseType: ecoaItemTable.responseType,
          responseOptions: ecoaItemTable.responseOptions,
          scoringInfo: ecoaItemTable.scoringInfo,
        })
        .from(ecoaItemTable)
        .where(eq(ecoaItemTable.scaleId, scaleId))
        .orderBy(ecoaItemTable.sortOrder, ecoaItemTable.itemNumber);

      // 解析题项数据
      const parsedItems = items.map(item => ({
        ...item,
        responseOptions: Array.isArray(item.responseOptions) ? item.responseOptions :
          (item.responseOptions ? JSON.parse(item.responseOptions) : []),
      }));

      // 生成量表解读指南
      const interpretation = generateScaleInterpretation(scale, parsedItems);

      // 记录解读访问
      if (user) {
        try {
          await db.insert(scaleUsageTable).values({
            scaleId,
            userId: user.id,
            actionType: 'interpretation',
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || '',
          });
        } catch (error) {
          console.warn('Failed to record interpretation access:', error);
        }
      }

      return NextResponse.json({
        scale: {
          id: scale.id,
          name: scale.name,
          nameEn: scale.nameEn,
          acronym: scale.acronym,
          category: scale.categoryName,
        },
        interpretation,
        generatedAt: new Date().toISOString(),
        viewerInfo: user ? {
          isAuthenticated: true,
          canSaveResults: true,
          canExportReport: true,
        } : {
          isAuthenticated: false,
          canSaveResults: false,
          canExportReport: false,
        },
      });

    } catch (error) {
      console.error('Scale interpretation API error:', error);
      return NextResponse.json({ error: 'Failed to generate interpretation' }, { status: 500 });
    }
  }, {
    identifier: 'scale-interpretation',
    limit: 20,
    windowInSeconds: 60,
  });
}

// 个性化分数解读
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  return withRateLimit(async () => {
    try {
      const db = getDB();
      const session = await getSessionFromCookie();
      const user = session?.user;

      if (!user) {
        return NextResponse.json({ error: 'Authentication required for score interpretation' }, { status: 401 });
      }

      const params = await context.params;
      const { scaleId } = interpretationParamsSchema.parse(params);

      const body = await request.json();
      const scoreData = scoreInterpretationSchema.parse(body);

      // 获取量表信息
      const [scale] = await db
        .select({
          id: ecoaScaleTable.id,
          name: ecoaScaleTable.name,
          acronym: ecoaScaleTable.acronym,
          psychometricProperties: ecoaScaleTable.psychometricProperties,
        })
        .from(ecoaScaleTable)
        .where(eq(ecoaScaleTable.id, scaleId));

      if (!scale) {
        return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
      }

      // 生成个性化解读
      const interpretation = interpretScores(
        scale,
        scoreData.scores,
        scoreData.totalScore,
        scoreData.demographicInfo
      );

      return NextResponse.json({
        scale: {
          id: scale.id,
          name: scale.name,
          acronym: scale.acronym,
        },
        scoreInterpretation: interpretation,
        inputScores: scoreData.scores,
        demographicContext: scoreData.demographicInfo,
        interpretedAt: new Date().toISOString(),
        disclaimer: '此解读仅供参考，不能替代专业医疗诊断。如有疑虑请咨询专业医疗人员。',
      });

    } catch (error) {
      console.error('Score interpretation API error:', error);
      return NextResponse.json({ error: 'Failed to interpret scores' }, { status: 500 });
    }
  }, {
    identifier: 'score-interpretation',
    limit: 50,
    windowInSeconds: 60,
  });
}

// 辅助函数 - 获取量表特定信息
function getScalePurpose(acronym: string): string {
  const purposes = {
    'PHQ-9': '用于筛查和评估抑郁症状的严重程度，基于DSM-5抑郁症诊断标准',
    'GAD-7': '用于筛查和评估广泛性焦虑障碍的严重程度',
    'MMSE-2': '快速筛查认知功能损害，特别适用于痴呆症早期识别',
    'MoCA': '更敏感地检测轻度认知损害，比MMSE更适合早期筛查',
    'HAM-D': '临床医生评估抑郁症状严重程度的金标准工具',
    'BDI-II': '自评抑郁症状严重程度，适用于临床和研究设置',
  };
  return purposes[acronym as keyof typeof purposes] || '专业的临床评估工具';
}

function getClinicalUse(acronym: string): string[] {
  const uses = {
    'PHQ-9': ['初级医疗筛查', '专科门诊评估', '治疗效果监测', '流行病学调查'],
    'GAD-7': ['焦虑症筛查', '治疗反应评估', '共病评估', '研究调查'],
    'MMSE-2': ['认知功能筛查', '痴呆症评估', '认知变化监测', '神经心理评估'],
  };
  return uses[acronym as keyof typeof uses] || ['临床评估', '研究调查'];
}

function getCutoffScores(acronym: string): Record<string, any> {
  const cutoffs = {
    'PHQ-9': {
      minimal: { range: '0-4', description: '最小抑郁或无抑郁' },
      mild: { range: '5-9', description: '轻度抑郁' },
      moderate: { range: '10-14', description: '中度抑郁' },
      moderately_severe: { range: '15-19', description: '中重度抑郁' },
      severe: { range: '20-27', description: '重度抑郁' },
    },
    'GAD-7': {
      minimal: { range: '0-4', description: '最小焦虑' },
      mild: { range: '5-9', description: '轻度焦虑' },
      moderate: { range: '10-14', description: '中度焦虑' },
      severe: { range: '15-21', description: '重度焦虑' },
    },
  };
  return cutoffs[acronym as keyof typeof cutoffs] || {};
}

function getInterpretationLevels(acronym: string): string[] {
  const levels = {
    'PHQ-9': [
      '0-4分: 症状很少或没有，无需特殊干预',
      '5-9分: 轻度症状，建议自我关注和支持',
      '10-14分: 中度症状，建议专业咨询',
      '15-19分: 中重度症状，需要专业治疗',
      '20-27分: 重度症状，需要紧急专业干预',
    ],
    'GAD-7': [
      '0-4分: 焦虑水平正常',
      '5-9分: 轻度焦虑，可自我管理',
      '10-14分: 中度焦虑，建议专业咨询',
      '15-21分: 重度焦虑，需要专业治疗',
    ],
  };
  return levels[acronym as keyof typeof levels] || [];
}

function getScreeningGuidance(acronym: string): string {
  const guidance = {
    'PHQ-9': '适用于成年人抑郁症状初步筛查，≥10分建议进一步评估',
    'GAD-7': '适用于成年人焦虑症状筛查，≥10分建议专业评估',
    'MMSE-2': '适用于认知功能快速筛查，<24分需要进一步认知评估',
  };
  return guidance[acronym as keyof typeof guidance] || '请参考量表手册中的筛查指导';
}

function getDiagnosticGuidance(acronym: string): string {
  const guidance = {
    'PHQ-9': 'PHQ-9不能单独用于诊断，需结合临床访谈和DSM-5标准',
    'GAD-7': 'GAD-7是筛查工具，诊断需要结合完整的临床评估',
    'HAM-D': '临床医生评估工具，可辅助抑郁症诊断和严重程度评估',
  };
  return guidance[acronym as keyof typeof guidance] || '需要结合完整临床评估进行诊断';
}

function getMonitoringGuidance(acronym: string): string {
  const guidance = {
    'PHQ-9': '建议每1-2周评估一次，监测治疗反应和症状变化',
    'GAD-7': '可用于监测焦虑治疗效果，建议每2-4周评估',
    'BDI-II': '适合监测抑郁治疗进展，可每周评估',
  };
  return guidance[acronym as keyof typeof guidance] || '根据临床需要定期评估';
}

function getResearchGuidance(acronym: string): string {
  const guidance = {
    'PHQ-9': '在研究中广泛使用，具有良好的心理测量学特性',
    'EORTC QLQ-C30': '癌症生活质量研究的金标准工具',
    'SF-36': '健康相关生活质量研究的经典工具',
  };
  return guidance[acronym as keyof typeof guidance] || '适用于相关领域的科学研究';
}

function getAdministrationTips(acronym: string): string[] {
  const tips = {
    'PHQ-9': [
      '确保患者理解评估时间范围（最近两周）',
      '对于文化程度较低的患者可能需要逐项解释',
      '注意第9题的自杀风险评估',
      '创造安全、私密的评估环境',
    ],
    'GAD-7': [
      '强调评估最近两周的感受',
      '确保患者理解"担忧"的概念',
      '注意识别具体的焦虑触发因素',
    ],
  };
  return tips[acronym as keyof typeof tips] || ['按照标准化程序进行', '确保环境安静舒适'];
}

function getCommonChallenges(acronym: string): string[] {
  const challenges = {
    'PHQ-9': [
      '患者可能因社会偏见而不愿如实回答',
      '老年患者可能将抑郁症状归因于身体疾病',
      '文化差异可能影响症状表达方式',
    ],
    'MMSE-2': [
      '教育程度对结果影响较大',
      '语言和文化背景需要考虑',
      '视力听力问题可能影响测试',
    ],
  };
  return challenges[acronym as keyof typeof challenges] || ['需要考虑个体差异', '注意文化适应性'];
}

function getCulturalConsiderations(acronym: string): string[] {
  return [
    '考虑文化背景对症状表达的影响',
    '注意语言翻译的准确性',
    '了解文化对心理健康的态度差异',
    '必要时使用文化适应版本',
  ];
}

function getLimitationsAndCautions(acronym: string): string[] {
  const limitations = {
    'PHQ-9': [
      '不能替代专业的临床诊断',
      '需要考虑共病和药物影响',
      '自杀风险需要额外专业评估',
      '不适用于双相障碍的躁狂期',
    ],
    'GAD-7': [
      '主要针对广泛性焦虑，不包括特定恐惧症',
      '需要排除物质使用或医学疾病引起的焦虑',
      '不能用于诊断特定的焦虑障碍',
    ],
  };
  return limitations[acronym as keyof typeof limitations] || [
    '结果仅供参考，不能替代专业评估',
    '需要考虑个体差异和背景因素',
    '建议结合其他评估方法使用',
  ];
}

function getClinicalExamples(acronym: string): any[] {
  if (acronym === 'PHQ-9') {
    return [
      {
        caseTitle: '案例1: 轻度抑郁筛查',
        scenario: '35岁职场女性，最近工作压力大，睡眠质量下降',
        score: 7,
        interpretation: '轻度抑郁症状，建议心理咨询和压力管理',
        followUp: '2周后重新评估，关注睡眠和压力管理',
      },
      {
        caseTitle: '案例2: 中度抑郁监测',
        scenario: '55岁男性，已在接受抗抑郁治疗3个月',
        score: 12,
        interpretation: '中度抑郁症状持续，可能需要调整治疗方案',
        followUp: '与主治医生讨论药物调整或增加心理治疗',
      },
    ];
  }
  return [];
}

function getItemSignificance(acronym: string, itemNumber: number): string {
  if (acronym === 'PHQ-9') {
    const significance = {
      1: '快感缺失 - 抑郁症的核心症状之一',
      2: '心境低落 - 抑郁症的另一核心症状',
      3: '睡眠障碍 - 常见的生理症状',
      9: '自杀想法 - 需要立即关注的高危症状',
    };
    return significance[itemNumber as keyof typeof significance] || '重要的症状评估项目';
  }
  return '重要的评估维度';
}