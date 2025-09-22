import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const params = await context.params;
    const { scaleId } = params;

    // 根据scaleId获取相关的临床试验案例
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
      ]
    };

    const cases = scaleTrialMap[scaleId as keyof typeof scaleTrialMap] || [];

    // 获取量表基本信息
    const scaleInfo = {
      'scale_phq9': { name: '患者健康问卷-9', acronym: 'PHQ-9', category: '抑郁症评估' },
      'scale_gad7': { name: '广泛性焦虑障碍-7', acronym: 'GAD-7', category: '焦虑症评估' },
      'scale_eortc': { name: 'EORTC生活质量核心问卷', acronym: 'EORTC QLQ-C30', category: '生活质量评估' }
    };

    const scale = scaleInfo[scaleId as keyof typeof scaleInfo];

    if (!scale) {
      return NextResponse.json(
        { error: 'Scale not found' },
        { status: 404 }
      );
    }

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
      }
    };

    const guidance = applicationGuidance[scaleId as keyof typeof applicationGuidance];

    return NextResponse.json({
      success: true,
      scale,
      cases,
      statistics,
      applicationGuidance: guidance,
      relatedScales: {
        'scale_phq9': ['scale_hamd', 'scale_madrs', 'scale_bdi'],
        'scale_gad7': ['scale_bai', 'scale_hama'],
        'scale_eortc': ['scale_sf36', 'scale_factg']
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