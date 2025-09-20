-- 为现有量表添加版权方信息和许可类型
-- 更新现有量表的版权和许可信息

-- PHQ-9 - 需要联系版权方
UPDATE ecoa_scale SET 
  copyrightInfo = 'Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues. © Pfizer Inc.',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'contact_required'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "Pfizer Inc.", "email": "outcomes@pfizer.com", "website": "https://www.phqscreeners.com", "licenseRequired": true, "usageType": "commercial_clinical"}'))
WHERE id = 'scale_phq9';

-- GAD-7 - 需要联系版权方  
UPDATE ecoa_scale SET
  copyrightInfo = 'Developed by Drs. Robert L. Spitzer, Kurt Kroenke, Janet B.W. Williams, and Bernd Löwe. © Pfizer Inc.',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'contact_required'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "Pfizer Inc.", "email": "outcomes@pfizer.com", "website": "https://www.phqscreeners.com", "licenseRequired": true, "usageType": "commercial_clinical"}'))
WHERE id = 'scale_gad7';

-- BDI-II - 商业许可
UPDATE ecoa_scale SET
  copyrightInfo = '© Pearson Clinical Assessment (NCS Pearson, Inc.)',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'commercial'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "Pearson Clinical Assessment", "phone": "+1-800-627-7271", "website": "https://www.pearsonassessments.com", "email": "clinicalcustomersupport@pearson.com", "licenseRequired": true, "usageType": "commercial", "pricingInfo": "Contact for institutional pricing"}'))
WHERE id = 'scale_bdi2';

-- HAM-D - 公共领域
UPDATE ecoa_scale SET
  copyrightInfo = 'Public Domain - Originally developed by Max Hamilton (1960)',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'public_domain'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "Public Domain", "licenseRequired": false, "usageType": "free", "notes": "Can be used freely for clinical and research purposes"}'))
WHERE id = 'scale_hamd';

-- HAM-A - 公共领域
UPDATE ecoa_scale SET
  copyrightInfo = 'Public Domain - Originally developed by Max Hamilton (1959)',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'public_domain'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "Public Domain", "licenseRequired": false, "usageType": "free", "notes": "Can be used freely for clinical and research purposes"}'))
WHERE id = 'scale_hama';

-- MMSE-2 - 商业许可
UPDATE ecoa_scale SET
  copyrightInfo = '© Psychological Assessment Resources, Inc. (PAR)',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'commercial'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "Psychological Assessment Resources (PAR)", "phone": "+1-813-968-3003", "website": "https://www.parinc.com", "email": "custsupp@parinc.com", "licenseRequired": true, "usageType": "commercial", "pricingInfo": "Contact for licensing and pricing information"}'))
WHERE id = 'scale_mmse2';

-- MoCA - 学术免费/商业付费
UPDATE ecoa_scale SET
  copyrightInfo = '© MoCA Clinic & Institute. Dr. Ziad Nasreddine.',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'academic_free'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "MoCA Clinic & Institute", "email": "info@mocatest.org", "website": "https://www.mocatest.org", "licenseRequired": true, "usageType": "academic_free_commercial_paid", "academicUse": "Free for academic and clinical use", "commercialUse": "License required for commercial use"}'))
WHERE id = 'scale_moca';

-- EORTC QLQ-C30 - 学术免费
UPDATE ecoa_scale SET
  copyrightInfo = '© European Organisation for Research and Treatment of Cancer (EORTC)',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'academic_free'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "EORTC Quality of Life Group", "email": "qol@eortc.be", "website": "https://qol.eortc.org", "licenseRequired": false, "usageType": "academic_research_free", "notes": "Free for academic research and non-commercial clinical use"}'))
WHERE id = 'scale_eortc';

-- EQ-5D-5L - 需要注册
UPDATE ecoa_scale SET
  copyrightInfo = '© EuroQol Research Foundation',
  psychometricProperties = JSON_SET(COALESCE(psychometricProperties, '{}'), '$.licenseType', 'contact_required'),
  psychometricProperties = JSON_SET(psychometricProperties, '$.copyrightContact', JSON('{"organization": "EuroQol Research Foundation", "email": "userinformationservice@euroqol.org", "website": "https://euroqol.org", "licenseRequired": true, "usageType": "registration_required", "notes": "Registration required for all uses. Academic use may be free."}'))
WHERE id = 'scale_eq5d5l';