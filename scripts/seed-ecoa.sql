-- Insert eCOA Categories
INSERT INTO ecoa_category (id, name, nameEn, description, descriptionEn, sortOrder, createdAt, updatedAt, updateCounter) VALUES
('cat_01', '抑郁症评估', 'Depression Assessment', '用于评估抑郁症状严重程度和筛查的标准化工具', 'Standardized tools for assessing depression severity and screening', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('cat_02', '焦虑症评估', 'Anxiety Assessment', '用于评估各种焦虑障碍的临床量表', 'Clinical scales for assessing various anxiety disorders', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('cat_03', '认知功能评估', 'Cognitive Assessment', '评估认知功能、记忆和执行功能的神经心理学工具', 'Neuropsychological tools for assessing cognitive function, memory and executive function', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('cat_04', '生活质量评估', 'Quality of Life Assessment', '测量健康相关生活质量的综合性量表', 'Comprehensive scales measuring health-related quality of life', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('cat_05', '疼痛评估', 'Pain Assessment', '评估疼痛强度、功能影响和疼痛相关症状', 'Assessment of pain intensity, functional impact and pain-related symptoms', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Insert eCOA Scales
INSERT INTO ecoa_scale (
  id, name, nameEn, acronym, description, descriptionEn, categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo, scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, isPublic, usageCount, favoriteCount, createdAt, updatedAt, updateCounter
) VALUES
(
  'scale_phq9', '患者健康问卷-9', 'Patient Health Questionnaire-9', 'PHQ-9',
  'PHQ-9是一个广泛使用的抑郁症筛查和严重程度评估工具，包含9个项目，基于DSM-IV抑郁症诊断标准。该量表简洁有效，适用于初级医疗和专科医疗环境。',
  'The PHQ-9 is a widely used depression screening and severity assessment tool containing 9 items based on DSM-IV depression diagnostic criteria. This scale is concise and effective, suitable for primary care and specialty medical settings.',
  'cat_01', 9, 1, '["zh-CN", "en-US"]', 'validated',
  'Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues',
  '4点李克特量表评分，总分0-27分。0-4分：最小抑郁；5-9分：轻度抑郁；10-14分：中度抑郁；15-19分：中重度抑郁；20-27分：重度抑郁。',
  5, '成年人抑郁症筛查和评估', '18岁以上', '["抑郁症状", "功能损害"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_gad7', '广泛性焦虑障碍-7', 'Generalized Anxiety Disorder-7', 'GAD-7',
  'GAD-7是一个用于筛查和测量广泛性焦虑障碍严重程度的7项自评量表。该工具简短、可靠，广泛用于临床实践和研究中。',
  'The GAD-7 is a 7-item self-report scale used to screen for and measure the severity of generalized anxiety disorder. This tool is brief, reliable, and widely used in clinical practice and research.',
  'cat_02', 7, 1, '["zh-CN", "en-US"]', 'validated',
  'Developed by Drs. Robert L. Spitzer, Kurt Kroenke, Janet B.W. Williams, and Bernd Löwe',
  '4点李克特量表评分，总分0-21分。0-4分：最小焦虑；5-9分：轻度焦虑；10-14分：中度焦虑；15-21分：重度焦虑。',
  3, '成年人焦虑症筛查和评估', '18岁以上', '["焦虑症状", "担忧"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_mmse2', '简易精神状态检查量表-2', 'Mini-Mental State Examination-2', 'MMSE-2',
  'MMSE-2是MMSE的标准化更新版本，是全球使用最广泛的认知功能筛查工具之一。该量表评估定向力、注意力、记忆、语言和视空间技能。',
  'The MMSE-2 is a standardized update of the MMSE and one of the most widely used cognitive screening tools globally. This scale assesses orientation, attention, memory, language, and visuospatial skills.',
  'cat_03', 30, 5, '["zh-CN", "en-US"]', 'validated',
  '© Psychological Assessment Resources, Inc. (PAR)',
  '总分0-30分。24分以上：正常认知；18-23分：轻度认知损害；0-17分：重度认知损害。需根据教育水平调整。',
  10, '成年人和老年人认知功能评估', '18岁以上', '["定向力", "注意力", "记忆", "语言", "视空间能力"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_eortc', '欧洲癌症研究治疗组织生活质量核心问卷', 'European Organisation for Research and Treatment of Cancer Quality of Life Questionnaire', 'EORTC QLQ-C30',
  'EORTC QLQ-C30是专门为癌症患者设计的生活质量评估工具，包含功能量表和症状量表，广泛用于癌症临床试验和研究。',
  'The EORTC QLQ-C30 is a quality of life assessment tool specifically designed for cancer patients, including functional scales and symptom scales, widely used in cancer clinical trials and research.',
  'cat_04', 30, 15, '["zh-CN", "en-US"]', 'validated',
  '© European Organisation for Research and Treatment of Cancer (EORTC)',
  '线性转换为0-100分。功能量表：分数越高表示功能水平越好；症状量表：分数越高表示症状/问题越严重。',
  15, '癌症患者生活质量评估', '18岁以上', '["身体功能", "角色功能", "情绪功能", "认知功能", "社会功能", "疲劳", "恶心呕吐", "疼痛"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_sf36', '简明健康调查问卷', 'Short Form Health Survey', 'SF-36',
  'SF-36是一个广泛使用的健康相关生活质量测量工具，包含8个健康概念的36个条目，可用于一般人群和患者群体。',
  'The SF-36 is a widely used health-related quality of life measurement tool containing 36 items across 8 health concepts, applicable to both general population and patient groups.',
  'cat_04', 36, 8, '["zh-CN", "en-US"]', 'validated',
  '© QualityMetric Incorporated',
  '每个维度得分0-100分，分数越高表示健康状况越好。可计算身体健康综合得分(PCS)和心理健康综合得分(MCS)。',
  10, '一般人群和患者群体健康状况评估', '18岁以上', '["身体功能", "身体角色限制", "身体疼痛", "一般健康", "活力", "社会功能", "情感角色限制", "心理健康"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
);