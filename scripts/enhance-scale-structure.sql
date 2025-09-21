-- xCOA 量表内容管理数据结构增强
-- 2025-09-21 数据库扩展

-- 1. 创建量表常模数据表
CREATE TABLE IF NOT EXISTS scale_norms (
  id TEXT PRIMARY KEY,
  scale_id TEXT NOT NULL,
  population_type TEXT NOT NULL,  -- 人群类型：general, clinical, elderly, etc.
  sample_size INTEGER,            -- 样本量
  mean_score REAL,               -- 平均分
  std_deviation REAL,            -- 标准差
  min_score REAL,                -- 最小值
  max_score REAL,                -- 最大值
  percentiles TEXT,              -- JSON格式百分位数 {p25: x, p50: x, p75: x, p90: x, p95: x}
  age_range TEXT,                -- 年龄范围
  gender TEXT,                   -- 性别：male, female, mixed
  education_level TEXT,          -- 教育水平
  cultural_background TEXT,      -- 文化背景
  study_reference TEXT,          -- 研究引用
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id)
);

-- 2. 创建量表解读指导表  
CREATE TABLE IF NOT EXISTS scale_interpretations (
  id TEXT PRIMARY KEY,
  scale_id TEXT NOT NULL,
  score_range_min INTEGER,       -- 分数范围最小值
  score_range_max INTEGER,       -- 分数范围最大值
  severity_level TEXT,           -- 严重程度等级
  interpretation_zh TEXT,        -- 中文解读
  interpretation_en TEXT,        -- 英文解读
  clinical_significance TEXT,    -- 临床意义
  recommendations TEXT,          -- 建议措施
  follow_up_guidance TEXT,       -- 后续指导
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id)
);

-- 3. 创建临床案例表
CREATE TABLE IF NOT EXISTS clinical_cases (
  id TEXT PRIMARY KEY,
  scale_id TEXT NOT NULL,
  case_title TEXT NOT NULL,      -- 案例标题
  patient_background TEXT,       -- 患者背景
  scale_scores TEXT,             -- JSON格式分数 {total: x, domain1: x, domain2: x}
  interpretation TEXT,           -- 案例解读
  clinical_decision TEXT,        -- 临床决策
  outcome TEXT,                  -- 治疗结果
  learning_points TEXT,          -- 学习要点
  difficulty_level TEXT,         -- 难度等级：beginner, intermediate, advanced
  specialty TEXT,                -- 专科：psychiatry, oncology, neurology, etc.
  author TEXT,                   -- 案例作者
  review_status TEXT,            -- 审核状态：draft, reviewed, published
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id)
);

-- 4. 创建量表使用指南表
CREATE TABLE IF NOT EXISTS scale_guidelines (
  id TEXT PRIMARY KEY,
  scale_id TEXT NOT NULL,
  guideline_type TEXT,           -- 指南类型：administration, scoring, interpretation
  title TEXT NOT NULL,
  content TEXT,                  -- 指南内容
  target_audience TEXT,          -- 目标受众：clinician, researcher, student
  evidence_level TEXT,           -- 证据等级：A, B, C
  last_updated DATE,
  version TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id)
);

-- 5. 创建量表比较表（用于量表对比功能）
CREATE TABLE IF NOT EXISTS scale_comparisons (
  id TEXT PRIMARY KEY,
  scale_1_id TEXT NOT NULL,
  scale_2_id TEXT NOT NULL,
  comparison_aspects TEXT,       -- JSON格式比较方面
  similarities TEXT,             -- 相似之处
  differences TEXT,              -- 不同之处
  usage_recommendations TEXT,    -- 使用建议
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (scale_1_id) REFERENCES ecoa_scale(id),
  FOREIGN KEY (scale_2_id) REFERENCES ecoa_scale(id)
);

-- 6. 创建版权许可详细信息表
CREATE TABLE IF NOT EXISTS copyright_licenses (
  id TEXT PRIMARY KEY,
  scale_id TEXT NOT NULL,
  license_type TEXT,             -- 许可类型：public_domain, academic_free, commercial_paid
  copyright_holder TEXT,         -- 版权持有者
  contact_email TEXT,            -- 联系邮箱
  contact_phone TEXT,            -- 联系电话
  website TEXT,                  -- 官方网站
  license_terms TEXT,            -- 许可条款
  commercial_cost TEXT,          -- 商业使用费用
  academic_cost TEXT,            -- 学术使用费用
  usage_restrictions TEXT,       -- 使用限制
  application_process TEXT,      -- 申请流程
  response_time TEXT,            -- 预期回复时间
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_scale_norms_scale_id ON scale_norms(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_norms_population ON scale_norms(population_type);
CREATE INDEX IF NOT EXISTS idx_interpretations_scale_id ON scale_interpretations(scale_id);
CREATE INDEX IF NOT EXISTS idx_interpretations_score_range ON scale_interpretations(score_range_min, score_range_max);
CREATE INDEX IF NOT EXISTS idx_clinical_cases_scale_id ON clinical_cases(scale_id);
CREATE INDEX IF NOT EXISTS idx_clinical_cases_specialty ON clinical_cases(specialty);
CREATE INDEX IF NOT EXISTS idx_guidelines_scale_id ON scale_guidelines(scale_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_type ON scale_guidelines(guideline_type);
CREATE INDEX IF NOT EXISTS idx_comparisons_scales ON scale_comparisons(scale_1_id, scale_2_id);
CREATE INDEX IF NOT EXISTS idx_copyright_scale_id ON copyright_licenses(scale_id);

-- 验证表结构创建
.tables