import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const params = await context.params;
    const { scaleId } = params;

    // 完整的量表案例映射
    const scaleTrialMap = {
      'scale_phq9': [
        {
          id: 'case_phq9_001',
          title: 'PHQ-9在重度抑郁症药物试验中的主要疗效评估',
          trialId: 'NCT12345678',
          phase: 'Phase III',
          studyType: 'RCT',
          patientCount: 324,
          duration: '12周',
          sponsor: 'XYZ制药公司',
          primaryOutcome: 'PHQ-9总分改善≥50%',
          results: '治疗组52.7%患者达到主要终点 vs 安慰剂组23.1%',
          publication: 'J Clin Psychiatry. 2023;84(2):123-131',
          evidenceLevel: 'A',
          clinicalSignificance: 'PHQ-9被证实为抑郁症新药疗效评估的可靠工具'
        },
        {
          id: 'case_phq9_002',
          title: 'PHQ-9在初级医疗抑郁症筛查的多中心验证研究',
          trialId: 'NCT98765432',
          phase: 'Validation',
          studyType: 'Cross-sectional',
          patientCount: 1247,
          duration: '6个月',
          sponsor: '国家卫健委',
          primaryOutcome: 'PHQ-9筛查的敏感性和特异性',
          results: '敏感性88.2%，特异性91.5%，最佳切分值≥10分',
          publication: 'Gen Hosp Psychiatry. 2023;71:45-52',
          evidenceLevel: 'A',
          clinicalSignificance: 'PHQ-9适合作为初级医疗抑郁症筛查的标准工具'
        }
      ],
      'scale_gad7': [
        {
          id: 'case_gad7_001',
          title: 'GAD-7在认知行为治疗焦虑障碍试验中的应用',
          trialId: 'NCT11223344',
          phase: 'Behavioral',
          studyType: 'RCT',
          patientCount: 180,
          duration: '16周',
          sponsor: '心理健康研究基金',
          primaryOutcome: 'GAD-7总分下降≥5分',
          results: '78.3%患者达到临床改善，在线CBT与传统CBT效果相当',
          publication: 'Behav Res Ther. 2023;168:104-112',
          evidenceLevel: 'A',
          clinicalSignificance: 'GAD-7是评估心理治疗干预效果的优秀工具'
        }
      ],
      'scale_eortc': [
        {
          id: 'case_eortc_001',
          title: 'EORTC QLQ-C30在乳腺癌免疫治疗试验中的生活质量评估',
          trialId: 'NCT87654321',
          phase: 'Phase II',
          studyType: 'Single-arm',
          patientCount: 156,
          duration: '24周',
          sponsor: 'ABC生物技术',
          primaryOutcome: '无进展生存期',
          results: '整体生活质量显著改善(p<0.001)，mPFS 12.8个月',
          publication: 'Lancet Oncol. 2023;24(8):892-901',
          evidenceLevel: 'B',
          clinicalSignificance: 'EORTC QLQ-C30有效评估肿瘤免疫治疗的生活质量获益'
        }
      ],
      'scale_sf36': [
        {
          id: 'case_sf36_001',
          title: 'SF-36在慢性疼痛多模式治疗试验中的应用',
          trialId: 'NCT55443322',
          phase: 'Phase III',
          studyType: 'RCT',
          patientCount: 268,
          duration: '52周',
          sponsor: '疼痛医学研究基金会',
          primaryOutcome: 'SF-36身体功能维度改善≥10分',
          results: '65.2%的患者身体功能达到最小临床改善',
          publication: 'Pain Med. 2023;24(7):812-824',
          evidenceLevel: 'A',
          clinicalSignificance: 'SF-36是评估慢性疼痛综合治疗效果的理想工具'
        }
      ],
      'scale_mmse2': [
        {
          id: 'case_mmse2_001',
          title: 'MMSE-2在阿尔茨海默病药物试验中的认知评估',
          trialId: 'NCT99887766',
          phase: 'Phase II/III',
          studyType: 'RCT',
          patientCount: 412,
          duration: '78周',
          sponsor: 'DEF神经科学公司',
          primaryOutcome: 'MMSE-2评分的年变化率',
          results: '治疗组认知下降速度减缓38%',
          publication: 'Alzheimers Dement. 2023;19(5):1234-1245',
          evidenceLevel: 'A',
          clinicalSignificance: 'MMSE-2适合作为阿尔茨海默病临床试验的认知功能主要终点'
        }
      ],
      'scale_bpi': [
        {
          id: 'case_bpi_001',
          title: 'BPI在癌性疼痛药物试验中的疼痛评估应用',
          trialId: 'NCT77889900',
          phase: 'Phase III',
          studyType: 'RCT',
          patientCount: 198,
          duration: '8周',
          sponsor: '疼痛医学研究院',
          primaryOutcome: 'BPI疼痛强度评分下降≥2分',
          results: '71.2%患者达到临床意义改善，疼痛强度平均下降3.4分',
          publication: 'J Pain. 2023;24(6):445-456',
          evidenceLevel: 'A',
          clinicalSignificance: 'BPI是癌性疼痛药物疗效评估的金标准工具'
        },
        {
          id: 'case_bpi_002',
          title: 'BPI在慢性疼痛综合治疗中的功能评估',
          trialId: 'NCT33445566',
          phase: 'Phase II',
          studyType: 'RCT',
          patientCount: 156,
          duration: '24周',
          sponsor: '综合疼痛治疗中心',
          primaryOutcome: 'BPI功能干扰评分改善≥2分',
          results: '多模式治疗组功能改善显著优于药物组(p<0.01)',
          publication: 'Clin J Pain. 2023;39(8):378-385',
          evidenceLevel: 'A',
          clinicalSignificance: 'BPI功能评估维度对治疗效果评估具有重要价值'
        }
      ],
      'scale_vas': [
        {
          id: 'case_vas_001',
          title: 'VAS在急性术后疼痛管理中的应用',
          trialId: 'NCT22334455',
          phase: 'Phase IV',
          studyType: 'RCT',
          patientCount: 240,
          duration: '72小时',
          sponsor: '麻醉疼痛学会',
          primaryOutcome: 'VAS疼痛评分<4分的维持时间',
          results: '新型镇痛方案VAS<4分维持时间延长47%',
          publication: 'Anesthesiology. 2023;138(4):567-575',
          evidenceLevel: 'A',
          clinicalSignificance: 'VAS是术后疼痛管理效果评估的简便有效工具'
        }
      ],
      'scale_hamd': [
        {
          id: 'case_hamd_001',
          title: 'HAM-D在抑郁症临床医生评定中的多中心研究',
          trialId: 'NCT44556677',
          phase: 'Phase III',
          studyType: 'RCT',
          patientCount: 378,
          duration: '16周',
          sponsor: '精神医学研究联盟',
          primaryOutcome: 'HAM-D总分下降≥50%',
          results: '标准化培训后评定者间信度达0.92，疗效检出率显著提高',
          publication: 'Am J Psychiatry. 2023;180(7):789-798',
          evidenceLevel: 'A',
          clinicalSignificance: 'HAM-D是抑郁症药物试验中医生评定的权威工具'
        }
      ]
    };

    const cases = scaleTrialMap[scaleId as keyof typeof scaleTrialMap] || [];

    // 如果没有特定案例，提供通用指导
    if (cases.length === 0) {
      return NextResponse.json({
        success: true,
        scale: {
          id: scaleId,
          message: '该量表的临床试验案例正在收集中'
        },
        cases: [],
        statistics: {
          totalCases: 0,
          evidenceLevelA: 0,
          rctStudies: 0,
          totalPatients: 0,
          averagePatients: 0
        },
        applicationGuidance: {
          primaryUse: '请参考量表原始文献了解适用场景',
          trialDesign: '建议咨询领域专家确定在试验中的应用方式',
          timing: '根据研究目标确定评估时间点',
          interpretation: '参考量表标准化说明进行结果解读',
          considerations: ['确保评估者接受适当培训', '考虑目标人群的特殊性', '注意文化和语言适应性']
        },
        relatedScales: []
      });
    }

    // 获取量表基本信息
    const scaleInfo = {
      'scale_phq9': { name: '患者健康问卷-9', acronym: 'PHQ-9', category: '抑郁症评估' },
      'scale_gad7': { name: '广泛性焦虑障碍-7', acronym: 'GAD-7', category: '焦虑症评估' },
      'scale_eortc': { name: 'EORTC生活质量核心问卷', acronym: 'EORTC QLQ-C30', category: '生活质量评估' },
      'scale_sf36': { name: '简明健康调查问卷', acronym: 'SF-36', category: '健康状况评估' },
      'scale_mmse2': { name: '简易精神状态检查量表-2', acronym: 'MMSE-2', category: '认知功能评估' },
      'scale_bpi': { name: '简明疼痛量表', acronym: 'BPI', category: '疼痛评估' },
      'scale_vas': { name: '视觉模拟评分量表', acronym: 'VAS', category: '疼痛评估' },
      'scale_hamd': { name: '汉密尔顿抑郁量表', acronym: 'HAM-D', category: '抑郁症评估' }
    };

    const scale = scaleInfo[scaleId as keyof typeof scaleInfo] || {
      name: '未知量表',
      acronym: scaleId.replace('scale_', '').toUpperCase(),
      category: '待分类'
    };

    // 案例统计
    const statistics = {
      totalCases: cases.length,
      evidenceLevelA: cases.filter(c => c.evidenceLevel === 'A').length,
      rctStudies: cases.filter(c => c.studyType === 'RCT').length,
      totalPatients: cases.reduce((sum, c) => sum + c.patientCount, 0),
      averagePatients: cases.length > 0 ? Math.round(cases.reduce((sum, c) => sum + c.patientCount, 0) / cases.length) : 0
    };

    // 应用指导
    const applicationGuidance = {
      'scale_phq9': {
        primaryUse: '抑郁症严重程度评估和疗效监测',
        trialDesign: '适合作为主要或次要终点指标',
        timing: '基线、治疗期间和随访期定期评估',
        interpretation: '≥5分改善具有临床意义，≥50%改善表示显著疗效',
        considerations: ['适用于18岁以上成人', '需考虑文化和教育背景', '可与其他抑郁量表联合使用']
      },
      'scale_gad7': {
        primaryUse: '焦虑症状严重程度评估和治疗监测',
        trialDesign: '适合心理治疗和药物治疗试验',
        timing: '治疗前后和随访期评估',
        interpretation: '≥5分改善具有临床意义，≤5分表示症状缓解',
        considerations: ['简短易用，患者接受度高', '与其他焦虑量表相关性好', '适合大规模筛查研究']
      },
      'scale_eortc': {
        primaryUse: '癌症患者生活质量全面评估',
        trialDesign: '肿瘤治疗试验的重要次要终点',
        timing: '治疗前、治疗期间和长期随访',
        interpretation: '功能量表分数越高越好，症状量表分数越低越好',
        considerations: ['需要专业培训实施', '可配合疾病特异性模块', '国际标准化量表']
      },
      'scale_sf36': {
        primaryUse: '健康相关生活质量综合评估',
        trialDesign: '慢性病干预试验的重要结局指标',
        timing: '基线和多个随访时间点评估',
        interpretation: '各维度0-100分，50分为人群均值，分数越高越好',
        considerations: ['需要考虑年龄和疾病状态', '可计算身体和心理健康综合评分', '适合人群比较研究']
      },
      'scale_mmse2': {
        primaryUse: '认知功能筛查和痴呆症诊断辅助',
        trialDesign: '神经保护药物试验的主要认知终点',
        timing: '基线、治疗期间和长期随访定期评估',
        interpretation: '≥24分正常，18-23分轻度损害，<18分明显损害',
        considerations: ['需要标准化实施环境', '教育水平需要校正', '存在练习效应需注意']
      },
      'scale_bpi': {
        primaryUse: '疼痛强度和功能影响的综合评估',
        trialDesign: '疼痛药物和非药物治疗试验的核心终点',
        timing: '治疗前后和随访期定期评估',
        interpretation: '疼痛强度≥2分改善具有临床意义，功能改善≥1分有意义',
        considerations: ['适用于各种类型疼痛', '功能评估具有独特价值', '国际疼痛研究标准工具']
      },
      'scale_vas': {
        primaryUse: '疼痛强度的简便快速评估',
        trialDesign: '急性疼痛和短期干预试验的首选工具',
        timing: '实时评估，可高频次测量',
        interpretation: '0-10分，≥2分变化具有临床意义',
        considerations: ['简单易用，患者容易理解', '适合床旁和急诊评估', '可用于各年龄段']
      },
      'scale_hamd': {
        primaryUse: '临床医生评定的抑郁症严重程度评估',
        trialDesign: '抑郁症药物试验的金标准评估工具',
        timing: '基线、治疗期间定期评估',
        interpretation: '≥8分为抑郁，≥25分为重度抑郁，≥50%改善为显著疗效',
        considerations: ['需要专业培训的评定者', '评定者间信度很重要', '适合药物试验监管要求']
      }
    };

    const guidance = applicationGuidance[scaleId as keyof typeof applicationGuidance] || {
      primaryUse: '请参考量表原始文献了解适用场景',
      trialDesign: '建议咨询领域专家确定在试验中的应用方式',
      timing: '根据研究目标确定评估时间点',
      interpretation: '参考量表标准化说明进行结果解读',
      considerations: ['确保评估者接受适当培训', '考虑目标人群的特殊性', '注意文化和语言适应性']
    };

    return NextResponse.json({
      success: true,
      scale,
      cases,
      statistics,
      applicationGuidance: guidance,
      relatedScales: {
        'scale_phq9': ['scale_hamd', 'scale_madrs', 'scale_bdi'],
        'scale_gad7': ['scale_bai', 'scale_hama'],
        'scale_eortc': ['scale_sf36', 'scale_factg'],
        'scale_sf36': ['scale_eortc', 'scale_whoqol'],
        'scale_mmse2': ['scale_moca', 'scale_adas'],
        'scale_bpi': ['scale_vas', 'scale_mpq'],
        'scale_vas': ['scale_bpi', 'scale_nrs'],
        'scale_hamd': ['scale_phq9', 'scale_madrs']
      }[scaleId] || []
    });

  } catch (error) {
    console.error('获取量表案例错误:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scale cases' },
      { status: 500 }
    );
  }
}