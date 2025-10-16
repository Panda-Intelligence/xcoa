-- Auto-generated SQL insert statements for ecoa_scale from PROMIS (NIH)
-- Generated at: 2025-10-14T15:27:57.496Z
-- Total NEW records: 33
-- Total in file: 33, Already in DB: 0
-- Source: PROMIS / NIH (healthmeasures.net)

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_physical_function', 1760455677496, 1760455677496, 0,
  'PROMIS Physical Function', 'PROMIS Physical Function', 'PHYSICAL-FUNCTION',
  'PROMIS物理功能量表用于评估个体执行日常身体活动的能力,包括上肢、下肢和中枢功能,以及工具性日常生活活动(IADL)。该量表包含124个条目的完整item bank,可用于CAT、短表格(4a、6a、8a、10a、12a、16a、20a)和完整的item bank评估。', NULL,
  NULL, 124, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-3分钟', '成人',
  NULL, '["Physical Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/PROMIS_Physical_Function_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_pain_interference', 1760455677496, 1760455677496, 0,
  'PROMIS Pain Interference', 'PROMIS Pain Interference', 'PAIN-INTERFERENCE',
  'PROMIS疼痛干扰量表评估疼痛对个体日常生活活动、社交活动、认知功能和情绪的影响程度。该量表包含41个条目的item bank,可用于CAT、短表格(4a、6a、6b、8a)和profile measures评估。', NULL,
  NULL, 41, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Physical Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_pain_intensity', 1760455677496, 1760455677496, 0,
  'PROMIS Pain Intensity', 'PROMIS Pain Intensity', 'PAIN-INTENSITY',
  'PROMIS疼痛强度量表使用单一的0-10数字评分量表(NRS)评估个体在过去7天内的平均疼痛强度。该量表广泛用于PROMIS Profile instruments(PROMIS-29、PROMIS-43、PROMIS-57)中。', NULL,
  NULL, 1, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  '0-10 numeric rating scale', '少于1分钟', '成人',
  NULL, '["Physical Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_fatigue', 1760455677496, 1760455677496, 0,
  'PROMIS Fatigue', 'PROMIS Fatigue', 'FATIGUE',
  'PROMIS疲劳量表评估个体的疲劳感和精力水平,包括疲劳对身体、认知和社交功能的影响。该量表包含95个条目的完整item bank,可用于CAT、短表格(4a、6a、7a、8a、13a)评估。', NULL,
  NULL, 95, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-3分钟', '成人',
  NULL, '["Physical Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manuals_/PROMIS_Fatigue_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_sleep_disturbance', 1760455677496, 1760455677496, 0,
  'PROMIS Sleep Disturbance', 'PROMIS Sleep Disturbance', 'SLEEP-DISTURBANCE',
  'PROMIS睡眠障碍量表评估个体的睡眠质量、入睡困难、睡眠维持困难以及睡眠对日间功能的影响。该量表包含27个条目的item bank,可用于CAT、短表格(4a、6a、8a)评估。', NULL,
  NULL, 27, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Physical Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manual_Only/PROMIS_Sleep_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_sleep_impairment', 1760455677496, 1760455677496, 0,
  'PROMIS Sleep-Related Impairment', 'PROMIS Sleep-Related Impairment', 'SLEEP-IMPAIRMENT',
  'PROMIS睡眠相关损害量表评估睡眠问题对日间功能的影响,包括警觉性、困倦感和认知功能的损害。该量表包含16个条目的item bank,可用于CAT、短表格(8a)评估。', NULL,
  NULL, 16, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 2分钟', '成人',
  NULL, '["Physical Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_depression', 1760455677496, 1760455677496, 0,
  'PROMIS Depression', 'PROMIS Depression', 'DEPRESSION',
  'PROMIS抑郁量表评估个体的抑郁症状,包括负性情绪、对生活失去兴趣、负性自我评价以及认知和社交功能障碍。该量表包含28个条目的item bank,可用于CAT、短表格(4a、6a、8a)评估。', NULL,
  NULL, 28, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manuals_/PROMIS_Depression_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_anxiety', 1760455677496, 1760455677496, 0,
  'PROMIS Anxiety', 'PROMIS Anxiety', 'ANXIETY',
  'PROMIS焦虑量表评估个体的焦虑症状,包括恐惧、担心、紧张感以及焦虑的躯体症状(如心跳加快)。该量表包含29个条目的item bank,可用于CAT、短表格(4a、6a、8a)评估。', NULL,
  NULL, 29, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manuals_/PROMIS_Anxiety_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_anger', 1760455677496, 1760455677496, 0,
  'PROMIS Anger', 'PROMIS Anger', 'ANGER',
  'PROMIS愤怒量表评估个体的愤怒情绪和敌意,包括易怒、愤怒的表达以及愤怒对社交关系的影响。该量表包含29个条目的item bank,可用于CAT、短表格(5a、8a)评估。', NULL,
  NULL, 29, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_emotional_distress', 1760455677496, 1760455677496, 0,
  'PROMIS Emotional Distress', 'PROMIS Emotional Distress', 'EMOTIONAL-DISTRESS',
  'PROMIS情绪困扰是一个总称,涵盖抑郁、焦虑和愤怒三个主要子域。该量表系列用于全面评估个体的负性情绪状态。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', '根据使用的子量表而定', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_cognitive_function', 1760455677496, 1760455677496, 0,
  'PROMIS Cognitive Function', 'PROMIS Cognitive Function', 'COGNITIVE-FUNCTION',
  'PROMIS认知功能量表评估个体的认知能力,包括记忆力、注意力、执行功能和处理速度。该量表包含Applied Cognition - Abilities和Applied Cognition - General Concerns两个子域。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 2-4分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manual_Only/PROMIS_Cognitive_Function_Scoring_Manual_17Mar2022.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_cognitive_function_abilities', 1760455677496, 1760455677496, 0,
  'PROMIS Applied Cognition - Abilities', 'PROMIS Applied Cognition - Abilities', 'COGNITIVE-FUNCTION-ABILITIES',
  'PROMIS应用认知-能力量表评估个体在日常生活中应用认知能力的情况,包括记忆、注意力、执行功能和处理速度等方面的自我评估。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 2-4分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_cognitive_function_concerns', 1760455677496, 1760455677496, 0,
  'PROMIS Applied Cognition - General Concerns', 'PROMIS Applied Cognition - General Concerns', 'COGNITIVE-FUNCTION-CONCERNS',
  'PROMIS应用认知-一般关注量表评估个体对自身认知功能的担忧程度,包括对记忆力下降、注意力不集中等认知问题的主观感受。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 2-4分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_social_roles_participation', 1760455677496, 1760455677496, 0,
  'PROMIS Ability to Participate in Social Roles and Activities', 'PROMIS Ability to Participate in Social Roles and Activities', 'SOCIAL-ROLES-PARTICIPATION',
  'PROMIS参与社会角色和活动能力量表评估个体履行日常社会角色(如工作、家庭责任、朋友关系)和参与社交活动的能力。该量表包含35个条目的item bank,可用于CAT、短表格(4a、6a、8a)评估。', NULL,
  NULL, 35, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Social Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_social_roles_satisfaction', 1760455677496, 1760455677496, 0,
  'PROMIS Satisfaction with Social Roles and Activities', 'PROMIS Satisfaction with Social Roles and Activities', 'SOCIAL-ROLES-SATISFACTION',
  'PROMIS社会角色和活动满意度量表评估个体对自己履行社会角色和参与社交活动的满意程度。该量表包含44个条目的item bank,可用于CAT、短表格(4a、6a、8a)评估。', NULL,
  NULL, 44, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Social Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_social_isolation', 1760455677496, 1760455677496, 0,
  'PROMIS Social Isolation', 'PROMIS Social Isolation', 'SOCIAL-ISOLATION',
  'PROMIS社会隔离量表评估个体感知的孤独感和与他人缺乏连接的程度,包括缺乏陪伴、社交联系和归属感。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Social Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_companionship', 1760455677496, 1760455677496, 0,
  'PROMIS Companionship', 'PROMIS Companionship', 'COMPANIONSHIP',
  'PROMIS陪伴量表评估个体感知的陪伴程度,包括有人陪伴、可以与他人分享活动和经历的感受。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Social Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_emotional_support', 1760455677496, 1760455677496, 0,
  'PROMIS Emotional Support', 'PROMIS Emotional Support', 'EMOTIONAL-SUPPORT',
  'PROMIS情感支持量表评估个体感知到的来自他人的情感支持,包括被理解、被关心和可以倾诉的感受。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Social Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_informational_support', 1760455677496, 1760455677496, 0,
  'PROMIS Informational Support', 'PROMIS Informational Support', 'INFORMATIONAL-SUPPORT',
  'PROMIS信息支持量表评估个体感知到的来自他人的信息支持,包括获得建议、指导和有用信息的可能性。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Social Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_instrumental_support', 1760455677496, 1760455677496, 0,
  'PROMIS Instrumental Support', 'PROMIS Instrumental Support', 'INSTRUMENTAL-SUPPORT',
  'PROMIS工具性支持量表评估个体感知到的来自他人的实际帮助,包括在日常任务、交通、家务等方面获得帮助的可能性。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Social Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_global_health_physical', 1760455677496, 1760455677496, 0,
  'PROMIS Global Health - Physical Health', 'PROMIS Global Health - Physical Health', 'GLOBAL-HEALTH-PHYSICAL',
  'PROMIS全球健康-身体健康量表使用4个条目评估个体对自身整体身体健康状况的感知,包括身体功能、疼痛和疲劳的总体评价。该量表是PROMIS Global Health (PROMIS-10)的身体健康子量表。', NULL,
  NULL, 4, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', '少于2分钟', '成人',
  NULL, '["Global Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manuals_/PROMIS_Global_Health_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_global_health_mental', 1760455677496, 1760455677496, 0,
  'PROMIS Global Health - Mental Health', 'PROMIS Global Health - Mental Health', 'GLOBAL-HEALTH-MENTAL',
  'PROMIS全球健康-心理健康量表使用4个条目评估个体对自身整体心理健康状况的感知,包括情绪、认知功能和社会功能的总体评价。该量表是PROMIS Global Health (PROMIS-10)的心理健康子量表。', NULL,
  NULL, 4, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', '少于2分钟', '成人',
  NULL, '["Global Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manuals_/PROMIS_Global_Health_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_global_health_10', 1760455677496, 1760455677496, 0,
  'PROMIS Global Health (PROMIS-10)', 'PROMIS Global Health (PROMIS-10)', 'GLOBAL-HEALTH-10',
  'PROMIS全球健康量表(PROMIS-10)使用10个条目快速评估个体的整体健康状况,包括身体健康和心理健康两个子量表。该量表可以生成身体健康总分和心理健康总分两个独立的T分数。', NULL,
  NULL, 10, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'Two T-scores: Physical Health and Mental Health (mean=50, SD=10)', '2-3分钟', '成人',
  NULL, '["Global Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manuals_/PROMIS_Global_Health_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_sexual_function', 1760455677496, 1760455677496, 0,
  'PROMIS Sexual Function and Satisfaction', 'PROMIS Sexual Function and Satisfaction', 'SEXUAL-FUNCTION',
  'PROMIS性功能和满意度量表评估成年人的性功能和性满意度,包括性兴趣、性唤起、性高潮、性疼痛以及对性生活的满意程度。该量表有针对男性和女性的不同版本。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', '根据使用的子量表而定', '成人',
  NULL, '["Physical Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_meaning_purpose', 1760455677496, 1760455677496, 0,
  'PROMIS Meaning and Purpose', 'PROMIS Meaning and Purpose', 'MEANING-PURPOSE',
  'PROMIS意义和目标量表评估个体对生活意义和目标的感知,包括感觉生活有价值、有方向和有目的。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manuals_/PROMIS_Meaning_and_Purpose_Scoring_Manual.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_positive_affect', 1760455677496, 1760455677496, 0,
  'PROMIS Positive Affect', 'PROMIS Positive Affect', 'POSITIVE-AFFECT',
  'PROMIS积极情感量表评估个体的积极情绪状态,包括快乐、愉悦、满足和乐观等正性情感。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_life_satisfaction', 1760455677496, 1760455677496, 0,
  'PROMIS Life Satisfaction', 'PROMIS Life Satisfaction', 'LIFE-SATISFACTION',
  'PROMIS生活满意度量表评估个体对自己生活的总体满意程度,包括对生活状况、成就和未来的满意感。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 1-2分钟', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_self_efficacy', 1760455677496, 1760455677496, 0,
  'PROMIS Self-Efficacy', 'PROMIS Self-Efficacy', 'SELF-EFFICACY',
  'PROMIS自我效能量表评估个体对自己完成特定任务和目标的信心,包括管理疾病、症状和日常生活的自信程度。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', '根据使用的子量表而定', '成人',
  NULL, '["Mental Health"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_smoking_nicotine_dependence', 1760455677496, 1760455677496, 0,
  'PROMIS Smoking - Nicotine Dependence', 'PROMIS Smoking - Nicotine Dependence', 'SMOKING-NICOTINE-DEPENDENCE',
  'PROMIS吸烟-尼古丁依赖量表评估个体对尼古丁的依赖程度,包括对香烟和电子烟的依赖。该量表评估戒断症状、渴望、耐受性和使用模式。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 2-4分钟', '成人',
  NULL, '["Health Behaviors"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manual_Only/PROMIS_Smoking_-_Nicotine_Dependence_Scoring_Manual_20May2022.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_alcohol_use', 1760455677496, 1760455677496, 0,
  'PROMIS Alcohol Use', 'PROMIS Alcohol Use', 'ALCOHOL-USE',
  'PROMIS酒精使用量表评估个体的饮酒行为和饮酒相关问题,包括饮酒频率、饮酒量以及饮酒对生活的影响。', NULL,
  NULL, 0, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'T-score (mean=50, SD=10)', 'CAT: 2-4分钟; 短表格: 2-4分钟', '成人',
  NULL, '["Health Behaviors"]', NULL,
  '[]', 'https://www.healthmeasures.net/explore-measurement-systems/promis', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_profile_29', 1760455677496, 1760455677496, 0,
  'PROMIS-29 Profile v2.1', 'PROMIS-29 Profile v2.1', 'PROFILE-29',
  'PROMIS-29 Profile是一个包含29个条目的多领域健康评估工具,涵盖7个PROMIS核心领域(身体功能、焦虑、抑郁、疲劳、睡眠障碍、参与社会角色和活动能力、疼痛干扰),每个领域使用4个条目,外加1个疼痛强度评分。该量表提供了对健康状况的快速全面评估。', NULL,
  NULL, 29, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'Seven T-scores (one per domain) + Pain Intensity raw score', '5-7分钟', '成人',
  NULL, '["Profile Instruments"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manual_Only/PROMIS_Adult_Profile_Scoring_Manual_16Sept2024.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_profile_43', 1760455677496, 1760455677496, 0,
  'PROMIS-43 Profile v2.1', 'PROMIS-43 Profile v2.1', 'PROFILE-43',
  'PROMIS-43 Profile是一个包含43个条目的多领域健康评估工具,涵盖7个PROMIS核心领域(身体功能、焦虑、抑郁、疲劳、睡眠障碍、参与社会角色和活动能力、疼痛干扰),每个领域使用6个条目,外加1个疼痛强度评分。该量表比PROMIS-29提供更详细的评估。', NULL,
  NULL, 43, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'Seven T-scores (one per domain) + Pain Intensity raw score', '7-10分钟', '成人',
  NULL, '["Profile Instruments"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manual_Only/PROMIS_Adult_Profile_Scoring_Manual_16Sept2024.pdf', 1,
  0, 0, NULL
);

INSERT INTO ecoa_scale (
  id, createdAt, updatedAt, updateCounter,
  name, nameEn, acronym,
  description, descriptionEn,
  categoryId, itemsCount, dimensionsCount,
  languages, validationStatus, copyrightInfo,
  scoringMethod, administrationTime, targetPopulation,
  ageRange, domains, psychometricProperties,
  `references`, downloadUrl, isPublic,
  usageCount, favoriteCount, searchVector
) VALUES (
  'scale_promis_profile_57', 1760455677496, 1760455677496, 0,
  'PROMIS-57 Profile v2.1', 'PROMIS-57 Profile v2.1', 'PROFILE-57',
  'PROMIS-57 Profile是一个包含57个条目的多领域健康评估工具,涵盖7个PROMIS核心领域(身体功能、焦虑、抑郁、疲劳、睡眠障碍、参与社会角色和活动能力、疼痛干扰),每个领域使用8个条目,外加1个疼痛强度评分。该量表提供了最详细的profile评估。', NULL,
  NULL, 57, 0,
  '["英文"]', 'published', '来源: PROMIS / NIH (healthmeasures.net)',
  'Seven T-scores (one per domain) + Pain Intensity raw score', '10-15分钟', '成人',
  NULL, '["Profile Instruments"]', NULL,
  '[]', 'https://www.healthmeasures.net/images/PROMIS/manuals/Scoring_Manual_Only/PROMIS_Adult_Profile_Scoring_Manual_16Sept2024.pdf', 1,
  0, 0, NULL
);
