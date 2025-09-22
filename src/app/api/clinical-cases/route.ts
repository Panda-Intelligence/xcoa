import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, like, or, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const casesSearchSchema = z.object({
  query: z.string().optional(),
  scaleId: z.string().optional(),
  diseaseArea: z.string().optional(),
  trialPhase: z.string().optional(),
  studyType: z.string().optional(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0)
});

// 模拟临床试验案例数据（实际应该从数据库获取）
const CLINICAL_CASES = [
  {
    id: 'case_001',
    title: 'PHQ-9在抑郁症药物临床试验中的应用',
    trialId: 'NCT12345678',
    scaleId: 'scale_phq9',
    scaleName: '患者健康问卷-9',
    scaleAcronym: 'PHQ-9',
    diseaseArea: 'depression',
    trialPhase: 'Phase III',
    studyType: 'RCT',
    patientCount: 324,
    duration: '12 weeks',
    primaryEndpoint: 'PHQ-9总分改善≥50%的患者比例',
    secondaryEndpoints: ['MADRS评分变化', '临床总体印象改善', '生活质量评估'],
    inclusion: '18-65岁，确诊重度抑郁症，PHQ-9≥15分',
    intervention: '新型抗抑郁药 vs 安慰剂',
    results: {
      baseline: { mean: 18.2, sd: 3.4 },
      week12: { mean: 8.6, sd: 4.1 },
      improvement: '52.7%的患者达到主要终点'
    },
    sponsor: 'XYZ制药公司',
    investigator: '李教授 - 首都医科大学附属医院',
    publication: 'J Clin Psychiatry. 2023;84(2):123-131',
    keyFindings: [
      'PHQ-9在评估抗抑郁药疗效方面显示出良好的敏感性',
      '基线PHQ-9分数是预测治疗反应的重要指标',
      '12周治疗后PHQ-9平均下降9.6分，具有临床意义'
    ],
    limitations: [
      '研究期间相对较短',
      '缺乏长期随访数据',
      '样本主要来自单一地区'
    ],
    clinicalImplications: 'PHQ-9可作为抑郁症新药临床试验的主要疗效评估工具',
    tags: ['抑郁症', '药物试验', 'RCT', 'Phase III', '疗效评估'],
    evidenceLevel: 'A',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 'case_002',
    title: 'EORTC QLQ-C30在乳腺癌免疫治疗试验中的应用',
    trialId: 'NCT87654321',
    scaleId: 'scale_eortc',
    scaleName: 'EORTC生活质量核心问卷',
    scaleAcronym: 'EORTC QLQ-C30',
    diseaseArea: 'oncology',
    trialPhase: 'Phase II',
    studyType: 'Single-arm',
    patientCount: 156,
    duration: '24 weeks',
    primaryEndpoint: '无进展生存期',
    secondaryEndpoints: ['总生存期', '客观缓解率', 'EORTC QLQ-C30生活质量评分'],
    inclusion: '18-70岁，转移性乳腺癌，ECOG 0-1分',
    intervention: '新型免疫检查点抑制剂',
    results: {
      baseline: { qol_global: 58.3, physical: 72.1, emotional: 65.8 },
      week24: { qol_global: 71.2, physical: 78.9, emotional: 74.5 },
      improvement: '整体生活质量显著改善(p<0.001)'
    },
    sponsor: 'ABC生物技术公司',
    investigator: '王教授 - 中国医学科学院肿瘤医院',
    publication: 'Lancet Oncol. 2023;24(8):892-901',
    keyFindings: [
      'EORTC QLQ-C30有效捕捉了免疫治疗对患者生活质量的积极影响',
      '治疗期间疲劳和疼痛症状显著减轻',
      '社会功能和情感功能的改善最为明显'
    ],
    limitations: [
      '单臂研究设计',
      '缺乏对照组比较',
      '随访时间有限'
    ],
    clinicalImplications: 'EORTC QLQ-C30是评估肿瘤免疫治疗患者生活质量的理想工具',
    tags: ['乳腺癌', '免疫治疗', '生活质量', 'Phase II', '单臂试验'],
    evidenceLevel: 'B',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-15'
  },
  {
    id: 'case_003',
    title: 'GAD-7在焦虑障碍认知行为治疗试验中的应用',
    trialId: 'NCT11223344',
    scaleId: 'scale_gad7',
    scaleName: '广泛性焦虑障碍-7',
    scaleAcronym: 'GAD-7',
    diseaseArea: 'anxiety',
    trialPhase: 'Behavioral',
    studyType: 'RCT',
    patientCount: 180,
    duration: '16 weeks',
    primaryEndpoint: 'GAD-7总分较基线下降≥5分的患者比例',
    secondaryEndpoints: ['HAM-A评分变化', '临床康复率', '复发率'],
    inclusion: '18-60岁，广泛性焦虑障碍，GAD-7≥10分',
    intervention: '在线CBT vs 传统面对面CBT vs 等待列表对照',
    results: {
      baseline: { mean: 14.6, sd: 2.8 },
      week16: { mean: 6.2, sd: 3.9 },
      improvement: '78.3%的患者达到临床改善标准'
    },
    sponsor: '国家自然科学基金',
    investigator: '张教授 - 北京大学第六医院',
    publication: 'Behav Res Ther. 2023;168:104-112',
    keyFindings: [
      'GAD-7对CBT疗效评估具有良好的敏感性',
      '在线CBT与传统CBT在GAD-7改善方面无显著差异',
      'GAD-7≤5分可作为治疗成功的有效指标'
    ],
    limitations: [
      '研究对象主要为城市人群',
      '缺乏长期随访数据',
      '在线CBT技术要求较高'
    ],
    clinicalImplications: 'GAD-7是评估心理治疗干预效果的优秀工具',
    tags: ['广泛性焦虑', 'CBT', '心理治疗', 'RCT', '数字疗法'],
    evidenceLevel: 'A',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-10'
  },
  {
    id: 'case_004',
    title: 'MMSE-2在阿尔茨海默病药物试验中的认知评估',
    trialId: 'NCT99887766',
    scaleId: 'scale_mmse2',
    scaleName: '简易精神状态检查量表-2',
    scaleAcronym: 'MMSE-2',
    diseaseArea: 'neurology',
    trialPhase: 'Phase II/III',
    studyType: 'RCT',
    patientCount: 412,
    duration: '78 weeks',
    primaryEndpoint: 'MMSE-2评分的年变化率',
    secondaryEndpoints: ['ADAS-Cog评分', 'CDR-SB评分', '日常生活能力'],
    inclusion: '50-85岁，轻中度阿尔茨海默病，MMSE-2 14-26分',
    intervention: '新型胆碱酯酶抑制剂 vs 安慰剂',
    results: {
      baseline: { mean: 20.4, sd: 3.6 },
      week78: { mean: 18.1, sd: 4.2 },
      improvement: '治疗组认知下降速度减缓38%'
    },
    sponsor: 'DEF神经科学公司',
    investigator: '陈教授 - 宣武医院神经内科',
    publication: 'Alzheimers Dement. 2023;19(5):1234-1245',
    keyFindings: [
      'MMSE-2能够敏感检测轻中度认知功能变化',
      '治疗组MMSE-2年下降率为1.5分 vs 安慰剂组2.4分',
      'MMSE-2与ADAS-Cog具有良好的相关性(r=0.73)'
    ],
    limitations: [
      'MMSE-2存在天花板效应',
      '教育水平对评分有影响',
      '缺乏执行功能评估项目'
    ],
    clinicalImplications: 'MMSE-2适合作为阿尔茨海默病临床试验的认知功能主要终点',
    tags: ['阿尔茨海默病', '认知评估', '神经保护', 'Phase II/III', '长期试验'],
    evidenceLevel: 'A',
    createdAt: '2024-01-25',
    updatedAt: '2024-02-01'
  },
  {
    id: 'case_005',
    title: 'SF-36在慢性疼痛多模式治疗试验中的应用',
    trialId: 'NCT55443322',
    scaleId: 'scale_sf36',
    scaleName: '简明健康调查问卷',
    scaleAcronym: 'SF-36',
    diseaseArea: 'pain_management',
    trialPhase: 'Phase III',
    studyType: 'RCT',
    patientCount: 268,
    duration: '52 weeks',
    primaryEndpoint: 'SF-36身体功能维度改善≥10分的患者比例',
    secondaryEndpoints: ['疼痛强度VAS', '工作能力评估', '医疗资源利用'],
    inclusion: '25-70岁，慢性下腰痛≥6个月，SF-36身体功能<50分',
    intervention: '多模式疼痛管理 vs 常规药物治疗',
    results: {
      baseline: { physical: 32.1, mental: 41.8 },
      week52: { physical: 58.3, mental: 62.4 },
      improvement: '65.2%的患者身体功能达到最小临床改善'
    },
    sponsor: '疼痛医学研究基金会',
    investigator: '刘教授 - 北京协和医院疼痛科',
    publication: 'Pain Med. 2023;24(7):812-824',
    keyFindings: [
      'SF-36全面反映了多模式治疗对患者整体健康的影响',
      '身体功能和社会功能改善最为显著',
      '治疗效果在心理健康维度也有体现'
    ],
    limitations: [
      '研究期间患者依从性差异较大',
      '部分维度存在主观偏倚',
      '缺乏成本效益分析'
    ],
    clinicalImplications: 'SF-36是评估慢性疼痛综合治疗效果的理想工具',
    tags: ['慢性疼痛', '多模式治疗', '生活质量', 'Phase III', '疼痛管理'],
    evidenceLevel: 'A',
    createdAt: '2024-02-20',
    updatedAt: '2024-02-25'
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const scaleId = url.searchParams.get('scaleId') || '';
    const diseaseArea = url.searchParams.get('diseaseArea') || '';
    const trialPhase = url.searchParams.get('trialPhase') || '';
    const studyType = url.searchParams.get('studyType') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 筛选案例
    let filteredCases = CLINICAL_CASES;

    if (query) {
      const queryLower = query.toLowerCase();
      filteredCases = filteredCases.filter(case_ =>
        case_.title.toLowerCase().includes(queryLower) ||
        case_.scaleName.toLowerCase().includes(queryLower) ||
        case_.scaleAcronym.toLowerCase().includes(queryLower) ||
        case_.investigator.toLowerCase().includes(queryLower) ||
        case_.sponsor.toLowerCase().includes(queryLower) ||
        case_.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    if (scaleId) {
      filteredCases = filteredCases.filter(case_ => case_.scaleId === scaleId);
    }

    if (diseaseArea) {
      filteredCases = filteredCases.filter(case_ => case_.diseaseArea === diseaseArea);
    }

    if (trialPhase) {
      filteredCases = filteredCases.filter(case_ => case_.trialPhase.includes(trialPhase));
    }

    if (studyType) {
      filteredCases = filteredCases.filter(case_ => case_.studyType === studyType);
    }

    // 分页
    const total = filteredCases.length;
    const paginatedCases = filteredCases.slice(offset, offset + limit);

    // 获取筛选选项
    const filterOptions = {
      diseaseAreas: [...new Set(CLINICAL_CASES.map(c => c.diseaseArea))],
      trialPhases: [...new Set(CLINICAL_CASES.map(c => c.trialPhase))],
      studyTypes: [...new Set(CLINICAL_CASES.map(c => c.studyType))],
      evidenceLevels: [...new Set(CLINICAL_CASES.map(c => c.evidenceLevel))],
      scales: [...new Set(CLINICAL_CASES.map(c => ({ id: c.scaleId, name: c.scaleName, acronym: c.scaleAcronym })))],
    };

    // 统计信息
    const statistics = {
      totalCases: CLINICAL_CASES.length,
      byDiseaseArea: CLINICAL_CASES.reduce((acc, case_) => {
        acc[case_.diseaseArea] = (acc[case_.diseaseArea] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byTrialPhase: CLINICAL_CASES.reduce((acc, case_) => {
        acc[case_.trialPhase] = (acc[case_.trialPhase] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byEvidenceLevel: CLINICAL_CASES.reduce((acc, case_) => {
        acc[case_.evidenceLevel] = (acc[case_.evidenceLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      cases: paginatedCases,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit
      },
      filterOptions,
      statistics
    });

  } catch (error) {
    console.error('获取临床案例错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical cases' },
      { status: 500 }
    );
  }
}