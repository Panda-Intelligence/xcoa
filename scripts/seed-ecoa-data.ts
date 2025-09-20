import { drizzle } from 'drizzle-orm/d1';
import { 
  ecoaCategoryTable, 
  ecoaScaleTable, 
  ecoaItemTable, 
  type EcoaCategory,
  type EcoaScale,
  type EcoaItem 
} from '../src/db/schema';

export async function seedEcoaData(db: any) {
  console.log('🌱 开始为 eCOA 数据库添加种子数据...');

  // 1. 创建分类
  const categories = [
    {
      name: '抑郁症评估',
      nameEn: 'Depression Assessment',
      description: '用于评估抑郁症状严重程度和筛查的标准化工具',
      descriptionEn: 'Standardized tools for assessing depression severity and screening',
      sortOrder: 1
    },
    {
      name: '焦虑症评估', 
      nameEn: 'Anxiety Assessment',
      description: '用于评估各种焦虑障碍的临床量表',
      descriptionEn: 'Clinical scales for assessing various anxiety disorders',
      sortOrder: 2
    },
    {
      name: '认知功能评估',
      nameEn: 'Cognitive Assessment',
      description: '评估认知功能、记忆和执行功能的神经心理学工具',
      descriptionEn: 'Neuropsychological tools for assessing cognitive function, memory and executive function',
      sortOrder: 3
    },
    {
      name: '生活质量评估',
      nameEn: 'Quality of Life Assessment', 
      description: '测量健康相关生活质量的综合性量表',
      descriptionEn: 'Comprehensive scales measuring health-related quality of life',
      sortOrder: 4
    },
    {
      name: '疼痛评估',
      nameEn: 'Pain Assessment',
      description: '评估疼痛强度、功能影响和疼痛相关症状',
      descriptionEn: 'Assessment of pain intensity, functional impact and pain-related symptoms',
      sortOrder: 5
    }
  ];

  const insertedCategories = [];
  for (const category of categories) {
    const [inserted] = await db.insert(ecoaCategoryTable).values(category).returning();
    insertedCategories.push(inserted);
    console.log(`✅ 创建分类: ${category.name}`);
  }

  // 2. 创建量表数据
  const scales = [
    // 抑郁症评估量表
    {
      name: '患者健康问卷-9',
      nameEn: 'Patient Health Questionnaire-9',
      acronym: 'PHQ-9',
      description: 'PHQ-9是一个广泛使用的抑郁症筛查和严重程度评估工具，包含9个项目，基于DSM-IV抑郁症诊断标准。该量表简洁有效，适用于初级医疗和专科医疗环境。',
      descriptionEn: 'The PHQ-9 is a widely used depression screening and severity assessment tool containing 9 items based on DSM-IV depression diagnostic criteria. This scale is concise and effective, suitable for primary care and specialty medical settings.',
      categoryId: insertedCategories.find(c => c.name === '抑郁症评估')?.id,
      itemsCount: 9,
      dimensionsCount: 1,
      languages: ['zh-CN', 'en-US'],
      validationStatus: 'validated',
      copyrightInfo: 'Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues',
      scoringMethod: '4点李克特量表评分，总分0-27分。0-4分：最小抑郁；5-9分：轻度抑郁；10-14分：中度抑郁；15-19分：中重度抑郁；20-27分：重度抑郁。',
      administrationTime: 5,
      targetPopulation: '成年人抑郁症筛查和评估',
      ageRange: '18岁以上',
      domains: ['抑郁症状', '功能损害'],
      psychometricProperties: {
        reliability: { cronbachAlpha: 0.89, testRetest: 0.84 },
        validity: { sensitivity: 0.88, specificity: 0.88 },
        cutoffScores: { mild: 5, moderate: 10, moderatelySerere: 15, severe: 20 }
      },
      references: [
        'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity of a brief depression severity measure. Journal of general internal medicine, 16(9), 606-613.'
      ],
      isPublic: 1,
      usageCount: 0,
      favoriteCount: 0
    },
    {
      name: '广泛性焦虑障碍-7',
      nameEn: 'Generalized Anxiety Disorder-7',
      acronym: 'GAD-7',
      description: 'GAD-7是一个用于筛查和测量广泛性焦虑障碍严重程度的7项自评量表。该工具简短、可靠，广泛用于临床实践和研究中。',
      descriptionEn: 'The GAD-7 is a 7-item self-report scale used to screen for and measure the severity of generalized anxiety disorder. This tool is brief, reliable, and widely used in clinical practice and research.',
      categoryId: insertedCategories.find(c => c.name === '焦虑症评估')?.id,
      itemsCount: 7,
      dimensionsCount: 1,
      languages: ['zh-CN', 'en-US'],
      validationStatus: 'validated',
      copyrightInfo: 'Developed by Drs. Robert L. Spitzer, Kurt Kroenke, Janet B.W. Williams, and Bernd Löwe',
      scoringMethod: '4点李克特量表评分，总分0-21分。0-4分：最小焦虑；5-9分：轻度焦虑；10-14分：中度焦虑；15-21分：重度焦虑。',
      administrationTime: 3,
      targetPopulation: '成年人焦虑症筛查和评估',
      ageRange: '18岁以上',
      domains: ['焦虑症状', '担忧'],
      psychometricProperties: {
        reliability: { cronbachAlpha: 0.92, testRetest: 0.83 },
        validity: { sensitivity: 0.89, specificity: 0.82 },
        cutoffScores: { mild: 5, moderate: 10, severe: 15 }
      },
      references: [
        'Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of internal medicine, 166(10), 1092-1097.'
      ],
      isPublic: 1,
      usageCount: 0,
      favoriteCount: 0
    },
    {
      name: '简易精神状态检查量表-2',
      nameEn: 'Mini-Mental State Examination-2',
      acronym: 'MMSE-2',
      description: 'MMSE-2是MMSE的标准化更新版本，是全球使用最广泛的认知功能筛查工具之一。该量表评估定向力、注意力、记忆、语言和视空间技能。',
      descriptionEn: 'The MMSE-2 is a standardized update of the MMSE and one of the most widely used cognitive screening tools globally. This scale assesses orientation, attention, memory, language, and visuospatial skills.',
      categoryId: insertedCategories.find(c => c.name === '认知功能评估')?.id,
      itemsCount: 30,
      dimensionsCount: 5,
      languages: ['zh-CN', 'en-US'],
      validationStatus: 'validated',
      copyrightInfo: '© Psychological Assessment Resources, Inc. (PAR)',
      scoringMethod: '总分0-30分。24分以上：正常认知；18-23分：轻度认知损害；0-17分：重度认知损害。需根据教育水平调整。',
      administrationTime: 10,
      targetPopulation: '成年人和老年人认知功能评估',
      ageRange: '18岁以上',
      domains: ['定向力', '注意力', '记忆', '语言', '视空间能力'],
      psychometricProperties: {
        reliability: { cronbachAlpha: 0.88, interRater: 0.95 },
        validity: { sensitivity: 0.87, specificity: 0.82 },
        cutoffScores: { normal: 24, mildImpairment: 18, severeImpairment: 17 }
      },
      references: [
        'Folstein, M. F., Folstein, S. E., & McHugh, P. R. (1975). "Mini-mental state": a practical method for grading the cognitive state of patients for the clinician. Journal of psychiatric research, 12(3), 189-198.'
      ],
      isPublic: 1,
      usageCount: 0,
      favoriteCount: 0
    },
    {
      name: '欧洲癌症研究治疗组织生活质量核心问卷',
      nameEn: 'European Organisation for Research and Treatment of Cancer Quality of Life Questionnaire',
      acronym: 'EORTC QLQ-C30',
      description: 'EORTC QLQ-C30是专门为癌症患者设计的生活质量评估工具，包含功能量表和症状量表，广泛用于癌症临床试验和研究。',
      descriptionEn: 'The EORTC QLQ-C30 is a quality of life assessment tool specifically designed for cancer patients, including functional scales and symptom scales, widely used in cancer clinical trials and research.',
      categoryId: insertedCategories.find(c => c.name === '生活质量评估')?.id,
      itemsCount: 30,
      dimensionsCount: 15,
      languages: ['zh-CN', 'en-US'],
      validationStatus: 'validated',
      copyrightInfo: '© European Organisation for Research and Treatment of Cancer (EORTC)',
      scoringMethod: '线性转换为0-100分。功能量表：分数越高表示功能水平越好；症状量表：分数越高表示症状/问题越严重。',
      administrationTime: 15,
      targetPopulation: '癌症患者生活质量评估',
      ageRange: '18岁以上',
      domains: ['身体功能', '角色功能', '情绪功能', '认知功能', '社会功能', '疲劳', '恶心呕吐', '疼痛'],
      psychometricProperties: {
        reliability: { cronbachAlpha: 0.85, testRetest: 0.87 },
        validity: { constructValidity: 'good', criterionValidity: 'good' }
      },
      references: [
        'Aaronson, N. K., et al. (1993). The European Organization for Research and Treatment of Cancer QLQ-C30: a quality-of-life instrument for use in international clinical trials in oncology. JNCI: Journal of the National Cancer Institute, 85(5), 365-376.'
      ],
      isPublic: 1,
      usageCount: 0,
      favoriteCount: 0
    },
    {
      name: '简明健康调查问卷',
      nameEn: 'Short Form Health Survey',
      acronym: 'SF-36',
      description: 'SF-36是一个广泛使用的健康相关生活质量测量工具，包含8个健康概念的36个条目，可用于一般人群和患者群体。',
      descriptionEn: 'The SF-36 is a widely used health-related quality of life measurement tool containing 36 items across 8 health concepts, applicable to both general population and patient groups.',
      categoryId: insertedCategories.find(c => c.name === '生活质量评估')?.id,
      itemsCount: 36,
      dimensionsCount: 8,
      languages: ['zh-CN', 'en-US'],
      validationStatus: 'validated',
      copyrightInfo: '© QualityMetric Incorporated',
      scoringMethod: '每个维度得分0-100分，分数越高表示健康状况越好。可计算身体健康综合得分(PCS)和心理健康综合得分(MCS)。',
      administrationTime: 10,
      targetPopulation: '一般人群和患者群体健康状况评估',
      ageRange: '18岁以上',
      domains: ['身体功能', '身体角色限制', '身体疼痛', '一般健康', '活力', '社会功能', '情感角色限制', '心理健康'],
      psychometricProperties: {
        reliability: { cronbachAlpha: 0.90, testRetest: 0.85 },
        validity: { constructValidity: 'excellent', discriminantValidity: 'good' }
      },
      references: [
        'Ware Jr, J. E., & Sherbourne, C. D. (1992). The MOS 36-item short-form health survey (SF-36): I. Conceptual framework and item selection. Medical care, 473-483.'
      ],
      isPublic: 1,
      usageCount: 0,
      favoriteCount: 0
    }
  ];

  const insertedScales = [];
  for (const scale of scales) {
    const [inserted] = await db.insert(ecoaScaleTable).values(scale).returning();
    insertedScales.push(inserted);
    console.log(`✅ 创建量表: ${scale.name} (${scale.acronym})`);
  }

  // 3. 为 PHQ-9 创建详细题项数据
  const phq9Scale = insertedScales.find(s => s.acronym === 'PHQ-9');
  if (phq9Scale) {
    const phq9Items = [
      {
        scaleId: phq9Scale.id,
        itemNumber: 1,
        question: '做事时提不起劲或没有兴趣',
        questionEn: 'Little interest or pleasure in doing things',
        dimension: '核心症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 1
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 2,
        question: '感到心情低落、沮丧或绝望',
        questionEn: 'Feeling down, depressed, or hopeless',
        dimension: '核心症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 2
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 3,
        question: '入睡困难、睡不安稳或睡眠过多',
        questionEn: 'Trouble falling or staying asleep, or sleeping too much',
        dimension: '躯体症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 3
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 4,
        question: '感觉疲倦或没有活力',
        questionEn: 'Feeling tired or having little energy',
        dimension: '躯体症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 4
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 5,
        question: '食欲不振或吃太多',
        questionEn: 'Poor appetite or overeating',
        dimension: '躯体症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 5
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 6,
        question: '觉得自己很糟糕，或觉得自己很失败，或让自己或家人失望',
        questionEn: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
        dimension: '认知症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 6
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 7,
        question: '对事物专注有困难，例如阅读报纸或看电视时',
        questionEn: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        dimension: '认知症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 7
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 8,
        question: '动作或说话速度缓慢到别人已经察觉？或正好相反—烦躁或坐立不安，动来动去的情况超过平常',
        questionEn: 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
        dimension: '躯体症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 8
      },
      {
        scaleId: phq9Scale.id,
        itemNumber: 9,
        question: '有不如死掉或用某种方式伤害自己的想法',
        questionEn: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
        dimension: '自杀风险',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 9
      }
    ];

    for (const item of phq9Items) {
      await db.insert(ecoaItemTable).values(item);
    }
    console.log(`✅ 为 PHQ-9 创建了 ${phq9Items.length} 个题项`);
  }

  // 4. 为 GAD-7 创建详细题项数据
  const gad7Scale = insertedScales.find(s => s.acronym === 'GAD-7');
  if (gad7Scale) {
    const gad7Items = [
      {
        scaleId: gad7Scale.id,
        itemNumber: 1,
        question: '感到紧张、焦虑或急躁',
        questionEn: 'Feeling nervous, anxious, or on edge',
        dimension: '焦虑症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 1
      },
      {
        scaleId: gad7Scale.id,
        itemNumber: 2,
        question: '无法停止或控制担忧',
        questionEn: 'Not being able to stop or control worrying',
        dimension: '焦虑症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 2
      },
      {
        scaleId: gad7Scale.id,
        itemNumber: 3,
        question: '对很多不同的事物担忧过度',
        questionEn: 'Worrying too much about different things',
        dimension: '焦虑症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 3
      },
      {
        scaleId: gad7Scale.id,
        itemNumber: 4,
        question: '很难放松下来',
        questionEn: 'Trouble relaxing',
        dimension: '焦虑症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 4
      },
      {
        scaleId: gad7Scale.id,
        itemNumber: 5,
        question: '坐立不安，难以静坐',
        questionEn: 'Being so restless that it is hard to sit still',
        dimension: '焦虑症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 5
      },
      {
        scaleId: gad7Scale.id,
        itemNumber: 6,
        question: '变得容易恼怒或急躁',
        questionEn: 'Becoming easily annoyed or irritable',
        dimension: '焦虑症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 6
      },
      {
        scaleId: gad7Scale.id,
        itemNumber: 7,
        question: '感到好像有什么可怕的事情会发生',
        questionEn: 'Feeling afraid, as if something awful might happen',
        dimension: '焦虑症状',
        responseType: 'likert',
        responseOptions: ['完全不会', '有几天', '一半以上的天数', '几乎每天'],
        scoringInfo: '0=完全不会, 1=有几天, 2=一半以上的天数, 3=几乎每天',
        isRequired: 1,
        sortOrder: 7
      }
    ];

    for (const item of gad7Items) {
      await db.insert(ecoaItemTable).values(item);
    }
    console.log(`✅ 为 GAD-7 创建了 ${gad7Items.length} 个题项`);
  }

  console.log('🎉 eCOA 种子数据创建完成！');
  console.log(`📊 总计创建：${insertedCategories.length} 个分类，${insertedScales.length} 个量表`);
}