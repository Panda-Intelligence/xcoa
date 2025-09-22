# 临床案例数据库实施方案

## 🎯 功能定位

建立专业的临床案例知识库，为量表使用者提供真实的临床应用参考，提升量表使用的准确性和有效性。

## 🏥 案例数据库架构

### 案例分类体系
```typescript
// 案例分类维度
interface CaseClassification {
  diseaseArea: 'oncology' | 'psychiatry' | 'neurology' | 'cardiology' | 'pain_management';
  scaleType: 'screening' | 'diagnostic' | 'outcome' | 'monitoring';
  population: 'pediatric' | 'adult' | 'elderly' | 'special_needs';
  setting: 'hospital' | 'clinic' | 'research' | 'home_care';
  evidenceLevel: 'A' | 'B' | 'C' | 'expert_opinion';
}

// 案例难度分级
enum CaseDifficulty {
  BEGINNER = 'beginner',      // 学生、初学者
  INTERMEDIATE = 'intermediate', // 有经验的临床医生
  ADVANCED = 'advanced',      // 专家级、复杂案例
  RESEARCH = 'research'       // 研究专用案例
}
```

### 完整数据结构
```sql
-- 主案例表
CREATE TABLE clinical_cases (
  id TEXT PRIMARY KEY,
  scale_id TEXT NOT NULL,
  title TEXT NOT NULL,
  
  -- 案例分类
  disease_area TEXT NOT NULL,
  scale_type TEXT NOT NULL,
  target_population TEXT NOT NULL,
  clinical_setting TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  evidence_level TEXT NOT NULL,
  
  -- 患者信息（脱敏）
  patient_demographics TEXT,      -- JSON: 年龄段、性别、病史等
  presenting_symptoms TEXT,       -- 主要症状
  medical_history TEXT,           -- 相关病史
  current_medications TEXT,       -- 当前用药
  
  -- 量表应用
  scale_administration_context TEXT, -- 使用背景
  baseline_assessment TEXT,       -- 基线评估
  baseline_scores TEXT,           -- JSON: 基线分数
  administration_notes TEXT,      -- 实施注意事项
  
  -- 干预和随访
  intervention_description TEXT,  -- 干预措施
  follow_up_timeline TEXT,        -- 随访时间线
  follow_up_scores TEXT,          -- JSON: 随访分数
  score_changes_analysis TEXT,    -- 分数变化分析
  
  -- 临床结局
  clinical_outcomes TEXT,         -- 临床结局
  treatment_response TEXT,        -- 治疗反应
  adverse_events TEXT,            -- 不良事件
  final_assessment TEXT,          -- 最终评估
  
  -- 专业分析
  case_discussion TEXT,           -- 案例讨论
  lessons_learned TEXT,           -- 经验教训
  key_teaching_points TEXT,       -- 关键教学点
  clinical_decision_rationale TEXT, -- 临床决策理由
  
  -- 元数据
  author_name TEXT,               -- 案例作者
  author_institution TEXT,       -- 作者机构
  author_credentials TEXT,        -- 作者资质
  review_status TEXT DEFAULT 'draft', -- 审核状态
  peer_reviewed BOOLEAN DEFAULT FALSE, -- 同行评议
  publication_reference TEXT,    -- 发表引用
  
  -- 系统字段
  created_at DATETIME,
  updated_at DATETIME,
  
  FOREIGN KEY (scale_id) REFERENCES ecoa_scale(id)
);

-- 案例标签表
CREATE TABLE case_tags (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  tag_category TEXT,              -- 标签类别
  created_at DATETIME,
  FOREIGN KEY (case_id) REFERENCES clinical_cases(id)
);

-- 案例评价表
CREATE TABLE case_ratings (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  usefulness_rating INTEGER CHECK(usefulness_rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at DATETIME,
  FOREIGN KEY (case_id) REFERENCES clinical_cases(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 📋 案例内容标准

### 案例撰写模板
```markdown
# 案例标题
[简明描述案例的核心问题和使用的量表]

## 患者背景
- **年龄段**: [保护隐私，使用年龄段]
- **性别**: [男/女]
- **主要诊断**: [疾病诊断]
- **病程**: [疾病持续时间]
- **既往史**: [相关病史]

## 量表应用背景
- **使用目的**: [筛查/诊断/监测/结局评估]
- **评估时间点**: [基线/治疗中/随访]
- **实施环境**: [门诊/住院/居家]
- **实施者**: [医生/护士/患者自评]

## 量表实施过程
- **量表选择理由**: [为什么选择这个量表]
- **实施注意事项**: [特殊考虑和调整]
- **患者配合度**: [完成情况和困难]

## 评估结果
### 基线评估
- **总分**: [X分]
- **各维度分数**: [具体分数]
- **临床解读**: [基于切分值的专业解读]

### 随访评估（如适用）
- **随访时间**: [X周/月后]
- **分数变化**: [前后对比]
- **临床意义**: [变化的临床意义]

## 临床决策
- **基于量表结果的决策**: [诊断/治疗调整/转诊等]
- **其他评估工具配合**: [联合使用的其他量表]
- **决策依据**: [为什么这样决策]

## 结局和随访
- **治疗结局**: [患者最终结局]
- **量表预测准确性**: [量表预测与实际结局的符合度]
- **长期随访**: [长期预后情况]

## 专业讨论
### 经验教训
- [从这个案例中学到的经验]
- [量表使用中的注意事项]
- [可以改进的地方]

### 教学要点
- [关键的临床教学点]
- [量表解读的重点]
- [临床实践的指导意义]

## 参考文献
[相关的研究文献和指南]
```

## 🔍 案例搜索功能

### 智能搜索维度
```typescript
// 多维度案例搜索
interface CaseSearchFilters {
  scaleId?: string;              // 特定量表
  diseaseArea?: string[];        // 疾病领域
  targetPopulation?: string[];   // 目标人群
  clinicalSetting?: string[];    // 临床环境
  difficultyLevel?: string[];    // 难度等级
  evidenceLevel?: string[];      // 证据等级
  outcomeType?: string[];        // 结局类型
  keywords?: string;             // 关键词搜索
}

// 案例推荐算法
interface CaseRecommendation {
  similarCases: ClinicalCase[];       // 相似案例
  relatedScales: ClinicalCase[];      // 相关量表案例
  expertRecommended: ClinicalCase[];  // 专家推荐
  recentlyAdded: ClinicalCase[];      // 最新添加
}
```

## 📊 案例质量控制

### 内容审核流程
```typescript
enum ReviewStatus {
  DRAFT = 'draft',                    // 草稿
  SUBMITTED = 'submitted',            // 已提交
  UNDER_REVIEW = 'under_review',      // 审核中
  REVISION_REQUIRED = 'revision_required', // 需要修改
  APPROVED = 'approved',              // 已批准
  PUBLISHED = 'published',            // 已发布
  ARCHIVED = 'archived'               // 已归档
}

// 审核标准
interface QualityStandards {
  clinicalAccuracy: boolean;          // 临床准确性
  ethicalCompliance: boolean;         // 伦理合规性
  educationalValue: boolean;          // 教育价值
  dataCompleteness: boolean;          // 数据完整性
  writingQuality: boolean;            // 撰写质量
}
```

### 专家审核系统
```sql
-- 审核专家表
CREATE TABLE case_reviewers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  specialty TEXT NOT NULL,        -- 专业领域
  credentials TEXT,               -- 资质认证
  institution TEXT,               -- 所属机构
  review_count INTEGER DEFAULT 0, -- 审核数量
  average_rating REAL,            -- 平均评分
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 审核记录表
CREATE TABLE case_reviews (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  review_status TEXT NOT NULL,
  quality_score INTEGER,          -- 质量评分
  review_comments TEXT,           -- 审核意见
  suggestions TEXT,               -- 改进建议
  reviewed_at DATETIME,
  FOREIGN KEY (case_id) REFERENCES clinical_cases(id),
  FOREIGN KEY (reviewer_id) REFERENCES case_reviewers(id)
);
```

## 🎓 教育功能集成

### 学习路径设计
```typescript
// 基于案例的学习路径
interface LearningPath {
  id: string;
  title: string;                  // 学习路径标题
  description: string;            // 描述
  targetAudience: string[];       // 目标受众
  cases: CaseSequence[];          // 案例序列
  estimatedDuration: number;      // 预估学习时间
  prerequisites: string[];        // 前置要求
}

// 案例序列
interface CaseSequence {
  caseId: string;
  order: number;
  learningObjectives: string[];   // 学习目标
  keyQuestions: string[];         // 关键问题
  followUpTasks: string[];        // 后续任务
}
```

## 📈 成功指标

### 内容指标
- **案例数量**: 目标100+案例（6个月内）
- **覆盖领域**: 涵盖5大临床领域
- **质量评分**: 平均4.0/5.0以上
- **更新频率**: 每月新增10+案例

### 使用指标
- **访问频率**: 月活跃案例浏览用户>1000
- **学习完成率**: 学习路径完成率>70%
- **专家参与**: 专家贡献案例和审核>50人
- **用户反馈**: 案例实用性评分>4.2/5.0

---

**📅 开发周期**: 2-3周完成MVP版本  
**🎯 目标**: 建立业界首个专业量表临床案例库  
**📈 价值**: 提升临床量表应用的教育和培训价值