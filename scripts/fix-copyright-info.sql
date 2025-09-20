-- 修复版权信息更新，处理 null 值
-- 为现有量表添加版权方信息和许可类型

-- PHQ-9 - 需要联系版权方
UPDATE ecoa_scale SET 
  copyrightInfo = 'Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues. © Pfizer Inc.',
  psychometricProperties = '{"licenseType": "contact_required", "copyrightContact": {"organization": "Pfizer Inc.", "email": "outcomes@pfizer.com", "website": "https://www.phqscreeners.com", "licenseRequired": true, "usageType": "commercial_clinical"}}'
WHERE id = 'scale_phq9';

-- GAD-7 - 需要联系版权方  
UPDATE ecoa_scale SET
  copyrightInfo = 'Developed by Drs. Robert L. Spitzer, Kurt Kroenke, Janet B.W. Williams, and Bernd Löwe. © Pfizer Inc.',
  psychometricProperties = '{"licenseType": "contact_required", "copyrightContact": {"organization": "Pfizer Inc.", "email": "outcomes@pfizer.com", "website": "https://www.phqscreeners.com", "licenseRequired": true, "usageType": "commercial_clinical"}}'
WHERE id = 'scale_gad7';

-- BDI-II - 商业许可
UPDATE ecoa_scale SET
  copyrightInfo = '© Pearson Clinical Assessment (NCS Pearson, Inc.)',
  psychometricProperties = '{"licenseType": "commercial", "copyrightContact": {"organization": "Pearson Clinical Assessment", "phone": "+1-800-627-7271", "website": "https://www.pearsonassessments.com", "email": "clinicalcustomersupport@pearson.com", "licenseRequired": true, "usageType": "commercial", "pricingInfo": "Contact for institutional pricing"}}'
WHERE id = 'scale_bdi2';

-- HAM-D - 公共领域
UPDATE ecoa_scale SET
  copyrightInfo = 'Public Domain - Originally developed by Max Hamilton (1960)',
  psychometricProperties = '{"licenseType": "public_domain", "copyrightContact": {"organization": "Public Domain", "licenseRequired": false, "usageType": "free", "notes": "Can be used freely for clinical and research purposes"}}'
WHERE id = 'scale_hamd';

-- HAM-A - 公共领域
UPDATE ecoa_scale SET
  copyrightInfo = 'Public Domain - Originally developed by Max Hamilton (1959)',
  psychometricProperties = '{"licenseType": "public_domain", "copyrightContact": {"organization": "Public Domain", "licenseRequired": false, "usageType": "free", "notes": "Can be used freely for clinical and research purposes"}}'
WHERE id = 'scale_hama';