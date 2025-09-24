# AI对话式搜索功能详细实施方案

## 🎯 功能概述

将xCOA的搜索从关键词搜索升级为AI驱动的对话式搜索，支持自然语言查询如：
- "帮我找适合老年抑郁患者的量表"
- "需要评估癌症患者化疗后生活质量的工具"
- "临床试验中常用的疼痛评估量表有哪些"

## 🏗️ 技术架构设计

### 核心组件架构
```typescript
// 1. 意图解析引擎
interface QueryIntent {
  intent: 'find_scale' | 'compare_scales' | 'get_info';
  domain: string;        // 治疗领域
  population: string;    // 目标人群
  scaleType: string;     // 量表类型
  requirements: string[]; // 特殊要求
  confidence: number;    // 解析置信度
}

// 2. 领域知识图谱
interface DomainKnowledge {
  diseases: Record<string, string[]>;    // 疾病→相关量表
  populations: Record<string, string[]>; // 人群→适用量表
  contexts: Record<string, string[]>;    // 使用场景→推荐量表
}

// 3. 智能推荐引擎
interface RecommendationEngine {
  semanticMatch: (query: string) => ScaleMatch[];
  contextualRank: (matches: ScaleMatch[], context: QueryIntent) => RankedResults[];
  explanationGenerate: (results: RankedResults[]) => Explanation;
}
```

### API端点设计
```typescript
// 主要API端点
POST /api/search/conversational
POST /api/search/intent-parse
POST /api/search/contextual
GET  /api/search/suggestions/smart
```

## 🧠 NLP处理流程

### 第一层：意图识别
```javascript
// 查询示例处理
"帮我找适合老年抑郁患者的量表"
↓
解析结果: {
  intent: "find_scale",
  target_condition: "depression",
  target_population: "elderly",
  scale_purpose: "assessment",
  language_preference: "chinese"
}
```

### 第二层：实体提取
```javascript
// 实体识别
const entityExtractor = {
  diseases: ["抑郁", "焦虑", "癌症", "疼痛", "认知"],
  populations: ["老年", "儿童", "成人", "患者"],
  contexts: ["临床试验", "筛查", "诊断", "评估"],
  requirements: ["中文版", "简短", "免费", "已验证"]
};
```

### 第三层：知识匹配
```javascript
// 领域知识库
const domainKnowledge = {
  "抑郁 + 老年": {
    primaryScales: ["GDS", "PHQ-9", "HAM-D"],
    considerations: ["认知能力", "阅读水平", "文化背景"],
    recommendations: "老年患者建议使用GDS，简单易懂"
  },
  "癌症 + 生活质量": {
    primaryScales: ["EORTC QLQ-C30", "FACT-G", "FLIC"],
    considerations: ["癌症类型", "治疗阶段", "预后状况"],
    recommendations: "EORTC QLQ-C30是癌症生活质量评估金标准"
  }
};
```

## 🎨 前端界面设计

### 智能搜索输入框
```typescript
// 新的搜索界面组件
<ConversationalSearch>
  <SearchInput
    placeholder="试试这样问：帮我找适合老年痴呆患者的认知量表"
    suggestions={smartSuggestions}
    onQuery={handleConversationalQuery}
  />
  <QuickPrompts>
    <Prompt>"适合临床试验的抑郁量表"</Prompt>
    <Prompt>"癌症患者生活质量评估工具"</Prompt>
    <Prompt>"儿童焦虑筛查量表推荐"</Prompt>
  </QuickPrompts>
</ConversationalSearch>
```

### 智能结果展示
```typescript
// AI推荐结果界面
<IntelligentResults>
  <QueryUnderstanding>
    您要找：老年抑郁患者 → 抑郁症评估量表 → 适合老年人群
  </QueryUnderstanding>

  <RecommendationCard>
    <PrimaryRecommendation scale="GDS" confidence={95} />
    <AlternativeOptions scales={["PHQ-9", "HAM-D"]} />
    <ExpertNote>
      "老年患者建议首选GDS，题目简单，更适合认知能力下降的人群"
    </ExpertNote>
  </RecommendationCard>
</IntelligentResults>
```

## 🔧 实施步骤

### 第一阶段：基础NLP引擎 (3天)
```bash
# 1. 创建意图解析API
src/app/api/search/intent-parse/route.ts

# 2. 建立实体识别库
src/utils/nlp/entity-extractor.ts

# 3. 创建领域知识图谱
src/data/domain-knowledge.json
```

### 第二阶段：智能匹配算法 (2天)
```bash
# 1. 语义相似度计算
src/utils/ai/semantic-matcher.ts

# 2. 上下文推荐引擎
src/utils/ai/recommendation-engine.ts

# 3. 结果排序和解释
src/utils/ai/result-explainer.ts
```

### 第三阶段：前端界面集成 (2天)
```bash
# 1. 对话式搜索组件
src/components/search/ConversationalSearch.tsx

# 2. 智能结果展示
src/components/search/IntelligentResults.tsx

# 3. 搜索界面重构
src/app/(dashboard)/scales/page.tsx
```

## 💡 使用场景示例

### 场景1：研究者查询
```
用户输入: "我需要评估乳腺癌患者化疗期间生活质量的量表"

AI解析: {
  disease: "breast_cancer",
  intervention: "chemotherapy",
  outcome: "quality_of_life",
  population: "cancer_patients"
}

推荐结果:
1. EORTC QLQ-C30 (95%匹配) - 癌症专用生活质量金标准
2. FACT-B (90%匹配) - 乳腺癌功能评估专用
3. FLIC (85%匹配) - 癌症患者生活指数

专家建议: "EORTC QLQ-C30是乳腺癌临床试验最常用的生活质量评估工具，
建议配合FACT-B使用以获得更全面的评估。"
```

### 场景2：临床医生查询
```
用户输入: "老年科门诊快速筛查抑郁症的工具"

AI解析: {
  setting: "outpatient",
  specialty: "geriatrics",
  purpose: "screening",
  condition: "depression",
  requirement: "quick"
}

推荐结果:
1. GDS-15 (98%匹配) - 老年抑郁专用筛查，15题版本
2. PHQ-2 (92%匹配) - 超简短筛查，2题快速
3. PHQ-9 (88%匹配) - 标准筛查，详细评估

专家建议: "老年科建议先用PHQ-2做初筛，阳性再用GDS-15详细评估。
注意老年患者的视力和认知状况。"
```

## 📊 成功指标

### 技术指标
- **意图识别准确率**: >90%
- **推荐相关性**: >85%
- **响应时间**: <800ms
- **用户满意度**: >4.5/5

### 业务指标
- **搜索成功率**: 用户找到合适量表的比例 >80%
- **深度使用**: 从搜索到收藏/下载的转化率 >60%
- **专家认可**: 领域专家对推荐准确性的认可度 >85%

---

**📅 实施时间**: 1周内完成MVP版本
**🎯 目标**: 建立行业首个AI驱动的专业量表搜索引擎
**📈 价值**: 大幅提升专业用户的工作效率和准确性