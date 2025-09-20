-- Insert additional eCOA Scales (Phase 2)
INSERT INTO ecoa_scale (
  id, name, nameEn, acronym, description, descriptionEn, categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo, scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, isPublic, usageCount, favoriteCount, createdAt, updatedAt, updateCounter
) VALUES
-- 抑郁症评估量表
(
  'scale_bdi2', '贝克抑郁量表-第二版', 'Beck Depression Inventory-II', 'BDI-II',
  'BDI-II是一个21项的自评抑郁症筛查量表，用于评估抑郁症状的严重程度。该量表基于DSM-IV抑郁症诊断标准，广泛用于临床诊断和研究。',
  'The BDI-II is a 21-item self-report measure of depression severity based on DSM-IV criteria. It is widely used in clinical diagnosis and research for assessing depressive symptoms.',
  'cat_01', 21, 3, '["zh-CN", "en-US"]', 'validated',
  '© Pearson Clinical Assessment',
  '4点李克特量表评分，总分0-63分。0-13分：最小抑郁；14-19分：轻度抑郁；20-28分：中度抑郁；29-63分：重度抑郁。',
  10, '成年人和青少年抑郁症评估', '13岁以上', '["情感症状", "认知症状", "躯体症状"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_hamd', '汉密尔顿抑郁量表', 'Hamilton Depression Rating Scale', 'HAM-D',
  'HAM-D是一个17项的他评抑郁量表，由临床医生填写，用于评估抑郁症的严重程度和治疗反应。该量表是临床试验中最常用的抑郁评估工具之一。',
  'The HAM-D is a 17-item clinician-rated scale for assessing depression severity and treatment response. It is one of the most commonly used depression assessment tools in clinical trials.',
  'cat_01', 17, 4, '["zh-CN", "en-US"]', 'validated',
  'Public Domain',
  '0-4点评分系统，总分0-52分。0-7分：正常；8-16分：轻度抑郁；17-23分：中度抑郁；≥24分：重度抑郁。',
  15, '成年人抑郁症临床评估', '18岁以上', '["情感症状", "认知症状", "躯体症状", "睡眠障碍"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),

-- 焦虑症评估量表
(
  'scale_bai', '贝克焦虑量表', 'Beck Anxiety Inventory', 'BAI',
  'BAI是一个21项的自评焦虑量表，主要评估焦虑的躯体症状。该量表能够很好地区分焦虑和抑郁症状，适用于焦虑障碍的筛查和评估。',
  'The BAI is a 21-item self-report measure that focuses on the somatic symptoms of anxiety. It effectively distinguishes anxiety from depression and is useful for screening and assessment of anxiety disorders.',
  'cat_02', 21, 2, '["zh-CN", "en-US"]', 'validated',
  '© Pearson Clinical Assessment',
  '4点李克特量表评分，总分0-63分。0-7分：最小焦虑；8-15分：轻度焦虑；16-25分：中度焦虑；26-63分：重度焦虑。',
  8, '成年人焦虑症状评估', '17岁以上', '["躯体症状", "认知症状"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_hama', '汉密尔顿焦虑量表', 'Hamilton Anxiety Rating Scale', 'HAM-A',
  'HAM-A是一个14项的他评焦虑量表，由临床医生填写，用于评估焦虑症状的严重程度。该量表包括心理性焦虑和躯体性焦虑两个维度。',
  'The HAM-A is a 14-item clinician-rated scale for assessing anxiety symptom severity. It includes both psychic anxiety and somatic anxiety dimensions.',
  'cat_02', 14, 2, '["zh-CN", "en-US"]', 'validated',
  'Public Domain',
  '0-4点评分系统，总分0-56分。<17分：轻度焦虑；18-24分：中度焦虑；25-30分：重度焦虑；>30分：极重度焦虑。',
  12, '成年人焦虑症临床评估', '18岁以上', '["心理性焦虑", "躯体性焦虑"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),

-- 认知功能评估量表
(
  'scale_moca', '蒙特利尔认知评估', 'Montreal Cognitive Assessment', 'MoCA',
  'MoCA是一个30分的认知筛查工具，对轻度认知损害比MMSE更敏感。该量表评估多个认知域，包括执行功能、注意力、记忆、语言和视空间技能。',
  'The MoCA is a 30-point cognitive screening tool that is more sensitive than MMSE for detecting mild cognitive impairment. It assesses multiple cognitive domains including executive functions, attention, memory, language, and visuospatial skills.',
  'cat_03', 30, 8, '["zh-CN", "en-US", "fr", "es"]', 'validated',
  '© MoCA Clinic & Institute',
  '总分0-30分。≥26分：正常认知；18-25分：轻度认知损害；10-17分：中度认知损害；<10分：重度认知损害。',
  10, '成年人和老年人认知功能筛查', '18岁以上', '["执行功能", "注意力", "记忆", "语言", "视空间技能", "抽象思维", "定向力"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_adas_cog', '阿尔茨海默病评估量表-认知部分', 'Alzheimer''s Disease Assessment Scale-Cognitive Subscale', 'ADAS-Cog',
  'ADAS-Cog是一个11项的认知功能评估工具，专门用于评估阿尔茨海默病患者的认知功能损害程度。该量表是阿尔茨海默病药物试验的标准评估工具。',
  'The ADAS-Cog is an 11-item cognitive assessment tool specifically designed to evaluate cognitive impairment in Alzheimer''s disease patients. It is the standard assessment tool in Alzheimer''s disease drug trials.',
  'cat_03', 11, 6, '["zh-CN", "en-US"]', 'validated',
  'Public Domain',
  '总分0-70分，分数越高表示认知损害越严重。正常老年人：0-6分；轻度认知损害：7-18分；轻度痴呆：19-35分；中重度痴呆：>35分。',
  45, '阿尔茨海默病和痴呆患者认知评估', '50岁以上', '["记忆", "语言", "实用技能", "定向力", "注意力", "视空间能力"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),

-- 生活质量评估量表
(
  'scale_eq5d5l', '欧洲五维健康量表', 'EuroQol Five-Dimension Five-Level', 'EQ-5D-5L',
  'EQ-5D-5L是一个简短的健康相关生活质量评估工具，包含5个维度，每个维度有5个水平。该量表广泛用于卫生经济学评价和健康状况测量。',
  'The EQ-5D-5L is a brief health-related quality of life assessment tool with 5 dimensions, each having 5 levels. It is widely used in health economic evaluation and health status measurement.',
  'cat_04', 5, 5, '["zh-CN", "en-US", "de", "fr", "es", "it", "ja", "ko"]', 'validated',
  '© EuroQol Research Foundation',
  '描述性系统产生健康状态，VAS评分0-100分。可转换为效用值（0-1）用于QALY计算。',
  5, '一般人群和患者群体健康状况评估', '12岁以上', '["行动能力", "自我照顾", "日常活动", "疼痛/不适", "焦虑/抑郁"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_whoqol', '世界卫生组织生活质量评估', 'World Health Organization Quality of Life Assessment', 'WHOQOL-BREF',
  'WHOQOL-BREF是WHO开发的26项生活质量评估工具，评估身体健康、心理健康、社会关系和环境四个领域。该量表具有跨文化适用性。',
  'The WHOQOL-BREF is a 26-item quality of life assessment tool developed by WHO, assessing four domains: physical health, psychological health, social relationships, and environment. It has cross-cultural applicability.',
  'cat_04', 26, 4, '["zh-CN", "en-US", "ar", "fr", "es", "ru", "pt", "hi"]', 'validated',
  '© World Health Organization',
  '5点李克特量表评分，各领域得分4-20分，转换为0-100分便于比较。分数越高表示生活质量越好。',
  15, '成年人生活质量综合评估', '18岁以上', '["身体健康", "心理健康", "社会关系", "环境"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),

-- 疼痛评估量表
(
  'scale_bpi', '简明疼痛量表', 'Brief Pain Inventory', 'BPI',
  'BPI是一个15项的疼痛评估工具，评估疼痛的严重程度和对日常功能的影响。该量表广泛用于癌症疼痛和慢性疼痛的临床评估和研究。',
  'The BPI is a 15-item pain assessment tool that evaluates pain severity and its impact on daily functioning. It is widely used in clinical assessment and research of cancer pain and chronic pain.',
  'cat_05', 15, 2, '["zh-CN", "en-US", "es", "fr", "de", "it", "ja"]', 'validated',
  '© Charles S. Cleeland, The University of Texas M.D. Anderson Cancer Center',
  '0-10数字评分，疼痛严重程度4题（最轻、最重、平均、现在），功能影响7题。≤3分：轻度；4-6分：中度；≥7分：重度。',
  10, '癌症患者和慢性疼痛患者', '18岁以上', '["疼痛严重程度", "功能影响"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
),
(
  'scale_mcgill', '麦吉尔疼痛问卷', 'McGill Pain Questionnaire', 'MPQ',
  'MPQ是一个经典的疼痛评估工具，包含78个疼痛描述词，用于评估疼痛的感觉、情感和评价三个维度。该量表能够提供疼痛的详细描述。',
  'The MPQ is a classic pain assessment tool containing 78 pain descriptors that evaluate three dimensions of pain: sensory, affective, and evaluative. It provides detailed pain descriptions.',
  'cat_05', 78, 3, '["zh-CN", "en-US", "fr"]', 'validated',
  'Public Domain',
  '包含感觉词汇、情感词汇和评价词汇三类，计算疼痛评定指数(PRI)。还包括现在疼痛强度(PPI)和视觉模拟评分。',
  20, '各种类型疼痛的详细评估', '16岁以上', '["感觉维度", "情感维度", "评价维度"]',
  1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
);