-- 修复数据库中的JSON字段数据
-- 2025-09-21 数据修复

-- 修复GAD-7的JSON字段数据
UPDATE ecoa_scale 
SET 
  languages = '["zh-CN", "en-US"]',
  domains = '["焦虑症状", "担忧控制", "躯体症状"]',
  psychometric_properties = '{
    "reliability": {
      "cronbachAlpha": 0.92,
      "testRetest": 0.83,
      "interRater": "不适用"
    },
    "validity": {
      "sensitivity": 0.89,
      "specificity": 0.82,
      "constructValidity": "良好"
    },
    "cutoffScores": {
      "minimal": 0,
      "mild": 5,
      "moderate": 10,
      "severe": 15
    }
  }',
  updated_at = datetime('now')
WHERE acronym = 'GAD-7';

-- 修复PHQ-9的JSON字段数据
UPDATE ecoa_scale 
SET 
  languages = '["zh-CN", "en-US"]',
  domains = '["抑郁症状", "功能损害"]',
  psychometric_properties = '{
    "reliability": {
      "cronbachAlpha": 0.89,
      "testRetest": 0.84,
      "interRater": "不适用"
    },
    "validity": {
      "sensitivity": 0.88,
      "specificity": 0.88,
      "constructValidity": "已确立"
    },
    "cutoffScores": {
      "minimal": 0,
      "mild": 5,
      "moderate": 10,
      "moderatelySerere": 15,
      "severe": 20
    }
  }',
  updated_at = datetime('now')
WHERE acronym = 'PHQ-9';

-- 修复MMSE-2的JSON字段数据
UPDATE ecoa_scale 
SET 
  languages = '["zh-CN", "en-US"]',
  domains = '["定向力", "注册记忆", "注意力计算", "回忆", "语言", "视空间"]',
  psychometric_properties = '{
    "reliability": {
      "cronbachAlpha": "不适用",
      "testRetest": 0.89,
      "interRater": 0.92
    },
    "validity": {
      "sensitivity": 0.87,
      "specificity": 0.82,
      "constructValidity": "已确立"
    },
    "cutoffScores": {
      "normal": 27,
      "mildImpairment": 21,
      "moderateImpairment": 10,
      "severeImpairment": 0
    }
  }',
  updated_at = datetime('now')
WHERE acronym = 'MMSE-2';

-- 修复EORTC QLQ-C30的JSON字段数据
UPDATE ecoa_scale 
SET 
  languages = '["zh-CN", "en-US"]',
  domains = '["躯体功能", "角色功能", "情绪功能", "认知功能", "社会功能", "疲乏", "疼痛", "恶心呕吐"]',
  psychometric_properties = '{
    "reliability": {
      "cronbachAlpha": 0.92,
      "testRetest": 0.87,
      "interRater": "不适用"
    },
    "validity": {
      "sensitivity": "良好",
      "specificity": "良好", 
      "constructValidity": "已确立"
    },
    "cutoffScores": {
      "note": "各功能量表0-100分，分数越高功能越好；症状量表0-100分，分数越高症状越重"
    }
  }',
  updated_at = datetime('now')
WHERE acronym = 'EORTC QLQ-C30';

-- 修复SF-36的JSON字段数据
UPDATE ecoa_scale 
SET 
  languages = '["zh-CN", "en-US"]',
  domains = '["躯体功能", "角色限制", "躯体疼痛", "一般健康", "精力", "社会功能", "情感限制", "精神健康"]',
  psychometric_properties = '{
    "reliability": {
      "cronbachAlpha": 0.90,
      "testRetest": 0.85,
      "interRater": "不适用"
    },
    "validity": {
      "constructValidity": "已确立",
      "discriminantValidity": "良好",
      "convergentValidity": "良好"
    },
    "cutoffScores": {
      "note": "各维度0-100分制，50分为人群均值，分数越高健康状况越好"
    }
  }',
  updated_at = datetime('now')
WHERE acronym = 'SF-36';

-- 验证修复结果
SELECT 
  acronym,
  name,
  LENGTH(languages) as languages_length,
  LENGTH(domains) as domains_length,
  LENGTH(psychometric_properties) as psychometric_length,
  languages,
  domains
FROM ecoa_scale 
WHERE acronym IN ('PHQ-9', 'GAD-7', 'MMSE-2', 'EORTC QLQ-C30', 'SF-36')
ORDER BY acronym;