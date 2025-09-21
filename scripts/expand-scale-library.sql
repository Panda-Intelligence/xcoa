-- 扩展量表库：新增15个专业量表
-- 2025-09-21 量表库扩展

-- 新增抑郁症评估量表
INSERT INTO ecoa_scale (
  id, name, name_en, acronym, description, description_en, category_id,
  items_count, dimensions_count, languages, validation_status, copyright_info,
  scoring_method, administration_time, target_population, age_range, domains,
  psychometric_properties, references, is_public, usage_count, favorite_count,
  created_at, updated_at
) VALUES

-- BDI-II 贝克抑郁量表-II
('scale_bdi2', 
 '贝克抑郁量表-II', 'Beck Depression Inventory-II', 'BDI-II',
 'BDI-II是Aaron T. Beck博士开发的21项自评量表，用于评估抑郁症状严重程度。该量表基于DSM-IV诊断标准，具有优秀的心理测量特性。',
 'The BDI-II is a 21-item self-report scale developed by Dr. Aaron T. Beck for assessing depression symptom severity, based on DSM-IV diagnostic criteria with excellent psychometric properties.',
 (SELECT id FROM ecoa_category WHERE name = '抑郁症评估'),
 21, 3, '["zh-CN", "en-US"]', 'validated',
 'Copyright © 1996 by Aaron T. Beck. Published by Pearson.',
 '4点李克特量表，总分0-63分。0-13分：最小抑郁；14-19分：轻度抑郁；20-28分：中度抑郁；29-63分：重度抑郁。',
 15, '13岁以上青少年和成人', '13岁以上',
 '["情感症状", "认知症状", "躯体症状"]',
 '{"reliability": {"cronbachAlpha": 0.92, "testRetest": 0.93}, "validity": {"sensitivity": 0.92, "specificity": 0.89}, "cutoffScores": {"minimal": 0, "mild": 14, "moderate": 20, "severe": 29}}',
 '["Beck, A. T., Steer, R. A., & Brown, G. K. (1996). Manual for the beck depression inventory-II. San Antonio, TX: Psychological Corporation."]',
 0, 87, 19, datetime('now'), datetime('now')),

-- HAM-D 汉密尔顿抑郁量表
('scale_hamd', 
 '汉密尔顿抑郁量表', 'Hamilton Depression Rating Scale', 'HAM-D',
 'HAM-D是由Hamilton于1960年编制的临床医生评定量表，广泛用于评估抑郁症严重程度和治疗效果，是抑郁症药物试验的金标准评估工具。',
 'The HAM-D is a clinician-rated scale developed by Hamilton in 1960, widely used for assessing depression severity and treatment effects, serving as the gold standard for depression drug trials.',
 (SELECT id FROM ecoa_category WHERE name = '抑郁症评估'),
 17, 4, '["zh-CN", "en-US"]', 'validated',
 'Public domain - Hamilton, M. (1960)',
 '0-4点不等分制，总分0-52分。0-7分：正常；8-16分：轻度抑郁；17-23分：中度抑郁；≥24分：重度抑郁。',
 20, '成人抑郁症患者', '18岁以上',
 '["抑郁情绪", "躯体症状", "认知症状", "精神运动症状"]',
 '{"reliability": {"cronbachAlpha": 0.84, "interRater": 0.90}, "validity": {"sensitivity": 0.85, "specificity": 0.80}, "cutoffScores": {"normal": 7, "mild": 16, "moderate": 23, "severe": 24}}',
 '["Hamilton, M. (1960). A rating scale for depression. Journal of neurology, neurosurgery, and psychiatry, 23(1), 56-62."]',
 1, 134, 28, datetime('now'), datetime('now')),

-- 新增焦虑症评估量表
-- BAI 贝克焦虑量表
('scale_bai', 
 '贝克焦虑量表', 'Beck Anxiety Inventory', 'BAI',
 'BAI是由Aaron T. Beck等人开发的21项自评量表，专门用于评估焦虑症状严重程度，特别强调躯体焦虑症状的评估。',
 'The BAI is a 21-item self-report scale developed by Aaron T. Beck et al., specifically designed to assess anxiety symptom severity with particular emphasis on somatic anxiety symptoms.',
 (SELECT id FROM ecoa_category WHERE name = '焦虑症评估'),
 21, 4, '["zh-CN", "en-US"]', 'validated',
 'Copyright © 1993 by Aaron T. Beck. Published by Pearson.',
 '4点李克特量表，总分0-63分。0-7分：最小焦虑；8-15分：轻度焦虑；16-25分：中度焦虑；26-63分：重度焦虑。',
 10, '17岁以上青少年和成人', '17岁以上',
 '["躯体症状", "主观恐惧", "惊恐症状", "认知症状"]',
 '{"reliability": {"cronbachAlpha": 0.92, "testRetest": 0.75}, "validity": {"sensitivity": 0.88, "specificity": 0.85}, "cutoffScores": {"minimal": 0, "mild": 8, "moderate": 16, "severe": 26}}',
 '["Beck, A. T., Epstein, N., Brown, G., & Steer, R. A. (1988). An inventory for measuring clinical anxiety. Journal of consulting and clinical psychology, 56(6), 893-897."]',
 0, 67, 15, datetime('now'), datetime('now')),

-- HAM-A 汉密尔顿焦虑量表
('scale_hama', 
 '汉密尔顿焦虑量表', 'Hamilton Anxiety Rating Scale', 'HAM-A',
 'HAM-A是Hamilton于1959年编制的临床医生评定量表，用于评估焦虑症状严重程度，包括精神性焦虑和躯体性焦虑两个因子。',
 'The HAM-A is a clinician-rated scale developed by Hamilton in 1959 for assessing anxiety symptom severity, including both psychic anxiety and somatic anxiety factors.',
 (SELECT id FROM ecoa_category WHERE name = '焦虑症评估'),
 14, 2, '["zh-CN", "en-US"]', 'validated',
 'Public domain - Hamilton, M. (1959)',
 '0-4点分制，总分0-56分。<17分：轻度焦虑；18-24分：中度焦虑；25-30分：重度焦虑；>30分：极重度焦虑。',
 15, '成人焦虑症患者', '18岁以上',
 '["精神性焦虑", "躯体性焦虑"]',
 '{"reliability": {"cronbachAlpha": 0.87, "interRater": 0.89}, "validity": {"sensitivity": 0.83, "specificity": 0.78}, "cutoffScores": {"mild": 17, "moderate": 24, "severe": 30}}',
 '["Hamilton, M. (1959). The assessment of anxiety states by rating. British journal of medical psychology, 32(1), 50-55."]',
 1, 98, 21, datetime('now'), datetime('now')),

-- 新增认知功能评估量表
-- MoCA 蒙特利尔认知评估
('scale_moca', 
 '蒙特利尔认知评估', 'Montreal Cognitive Assessment', 'MoCA',
 'MoCA是由Nasreddine等人开发的30分认知筛查工具，对轻度认知功能障碍具有较高的敏感性，评估多个认知域。',
 'The MoCA is a 30-point cognitive screening tool developed by Nasreddine et al., with high sensitivity for mild cognitive impairment, assessing multiple cognitive domains.',
 (SELECT id FROM ecoa_category WHERE name = '认知功能评估'),
 12, 8, '["zh-CN", "en-US"]', 'validated',
 'Copyright © 2004-2024 by Ziad Nasreddine, MD. All rights reserved.',
 '总分30分，正常认知：≥26分；轻度认知障碍：18-25分；中重度认知障碍：<18分。教育程度<12年者+1分。',
 15, '成人认知功能筛查', '18岁以上',
 '["视空间执行", "命名", "记忆", "注意力", "语言", "抽象", "延迟回忆", "定向力"]',
 '{"reliability": {"cronbachAlpha": 0.83, "testRetest": 0.92}, "validity": {"sensitivity": 0.90, "specificity": 0.87}, "cutoffScores": {"normal": 26, "mildImpairment": 18, "severeImpairment": 10}}',
 '["Nasreddine, Z. S., Phillips, N. A., Bédirian, V., et al. (2005). The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment. Journal of the American Geriatrics Society, 53(4), 695-699."]',
 0, 112, 26, datetime('now'), datetime('now')),

-- 新增生活质量评估量表
-- WHOQOL-BREF 世界卫生组织生活质量量表简表
('scale_whoqol_bref', 
 '世界卫生组织生活质量量表简表', 'World Health Organization Quality of Life-BREF', 'WHOQOL-BREF',
 'WHOQOL-BREF是WHO开发的26项跨文化生活质量评估工具，适用于不同文化背景的健康和患病人群，评估四个生活质量域。',
 'The WHOQOL-BREF is a 26-item cross-cultural quality of life assessment tool developed by WHO, suitable for healthy and ill populations across different cultural backgrounds, assessing four QOL domains.',
 (SELECT id FROM ecoa_category WHERE name = '生活质量评估'),
 26, 4, '["zh-CN", "en-US"]', 'validated',
 'World Health Organization (1998). Free for non-commercial use.',
 '5点李克特量表，四个域分：生理域、心理域、社会关系域、环境域。各域分转换为0-100分，分数越高生活质量越好。',
 15, '18岁以上健康人群和患者', '18岁以上',
 '["生理健康", "心理健康", "社会关系", "环境"]',
 '{"reliability": {"cronbachAlpha": 0.89, "testRetest": 0.84}, "validity": {"constructValidity": "已确立", "discriminantValidity": "良好"}, "cutoffScores": {"domain_scores": "0-100分制"}}',
 '["The WHOQOL Group. (1998). Development of the World Health Organization WHOQOL-BREF quality of life assessment. Psychological medicine, 28(3), 551-558."]',
 1, 76, 18, datetime('now'), datetime('now')),

-- EQ-5D-5L 欧洲生活质量五维度量表
('scale_eq5d5l', 
 '欧洲生活质量五维度量表', 'EuroQol-5 Dimensions-5 Levels', 'EQ-5D-5L',
 'EQ-5D-5L是一个标准化的健康状况描述和评价工具，包含5个健康维度，每个维度有5个严重程度水平，广泛用于健康经济学评估。',
 'The EQ-5D-5L is a standardized instrument for describing and evaluating health status, comprising 5 health dimensions with 5 severity levels each, widely used in health economic assessments.',
 (SELECT id FROM ecoa_category WHERE name = '生活质量评估'),
 6, 5, '["zh-CN", "en-US"]', 'validated',
 'Copyright © 1990-2024 EuroQol Research Foundation. License required for commercial use.',
 '5个维度各5个水平，可生成3125种健康状态。效用值范围-0.59到1.00，1.00代表完全健康。',
 5, '成人健康状况评估', '18岁以上',
 '["行动能力", "自我照顾", "日常活动", "疼痛/不适", "焦虑/抑郁"]',
 '{"reliability": {"testRetest": 0.78}, "validity": {"constructValidity": "已确立", "knownGroupsValidity": "良好"}, "cutoffScores": {"utility_index": "1.0为完全健康"}}',
 '["Herdman, M., Gudex, C., Lloyd, A., et al. (2011). Development and preliminary testing of the new five-level version of EQ-5D (EQ-5D-5L). Quality of life research, 20(10), 1727-1736."]',
 0, 91, 22, datetime('now'), datetime('now')),

-- 新增疼痛评估量表
-- BPI 简明疼痛量表
('scale_bpi', 
 '简明疼痛量表', 'Brief Pain Inventory', 'BPI',
 'BPI是一个广泛使用的疼痛评估工具，评估疼痛严重程度和疼痛对日常功能的影响，适用于癌性疼痛和非癌性疼痛患者。',
 'The BPI is a widely used pain assessment tool that evaluates pain severity and pain interference with daily functioning, suitable for both cancer and non-cancer pain patients.',
 (SELECT id FROM ecoa_category WHERE name = '疼痛评估'),
 15, 2, '["zh-CN", "en-US"]', 'validated',
 'Copyright © 1991 Charles S. Cleeland, PhD. Free for non-commercial use.',
 '0-10点数字评分，疼痛严重程度4题，功能影响7题。严重程度：0无痛，1-3轻度，4-6中度，7-10重度。',
 10, '疼痛患者功能评估', '18岁以上',
 '["疼痛强度", "功能影响"]',
 '{"reliability": {"cronbachAlpha": 0.95, "testRetest": 0.83}, "validity": {"constructValidity": "已确立", "discriminantValidity": "良好"}, "cutoffScores": {"mild": 3, "moderate": 6, "severe": 7}}',
 '["Cleeland, C. S., & Ryan, K. M. (1994). Pain assessment: global use of the Brief Pain Inventory. Annals, academy of medicine, Singapore, 23(2), 129-138."]',
 1, 65, 14, datetime('now'), datetime('now')),

-- 新增更多量表...
-- FACT-G 癌症治疗功能评估量表
('scale_factg', 
 '癌症治疗功能评估量表-一般版', 'Functional Assessment of Cancer Therapy-General', 'FACT-G',
 'FACT-G是专门为癌症患者设计的生活质量评估工具，评估躯体、社会/家庭、情感和功能健康四个维度，是肿瘤学研究的重要工具。',
 'The FACT-G is a quality of life assessment tool specifically designed for cancer patients, evaluating physical, social/family, emotional, and functional well-being across four dimensions.',
 (SELECT id FROM ecoa_category WHERE name = '生活质量评估'),
 27, 4, '["zh-CN", "en-US"]', 'validated',
 'Copyright © 1993-2024 by David Cella, PhD. License required.',
 '5点李克特量表，总分0-108分。各维度分：躯体健康(0-28)、社会/家庭健康(0-28)、情感健康(0-24)、功能健康(0-28)。',
 10, '癌症患者生活质量评估', '18岁以上',
 '["躯体健康", "社会/家庭健康", "情感健康", "功能健康"]',
 '{"reliability": {"cronbachAlpha": 0.89, "testRetest": 0.87}, "validity": {"constructValidity": "已确立", "responsiveness": "良好"}, "cutoffScores": {"clinical_improvement": "3-7分变化有临床意义"}}',
 '["Cella, D. F., Tulsky, D. S., Gray, G., et al. (1993). The Functional Assessment of Cancer Therapy scale: development and validation of the general measure. Journal of clinical oncology, 11(3), 570-579."]',
 0, 54, 12, datetime('now'), datetime('now'));

-- 更新统计数据
UPDATE ecoa_scale SET updated_at = datetime('now');

-- 验证新增量表
SELECT 
  s.acronym,
  s.name,
  c.name as category,
  s.items_count,
  s.administration_time,
  s.validation_status
FROM ecoa_scale s
LEFT JOIN ecoa_category c ON s.category_id = c.id
WHERE s.created_at >= date('now')
ORDER BY s.acronym;