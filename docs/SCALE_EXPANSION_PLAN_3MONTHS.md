# 量表数据扩充至500个 - 3个月实施计划 (修订版)

## ⚠️ 关键发现与策略调整

### 核心问题确认
**www.usecoa.com 并没有提供量表的具体 items 数据**，仅包含：
- 量表基础信息（名称、描述、缩写）
- 版权信息
- 目标人群、领域、语言等元数据

### 实际可用数据
- ✅ **已爬取基础信息**: 328个量表（来自 www.usecoa.com）
- ✅ **手动录入items**: 3个量表（PHQ-9, GAD-7, MMSE-2）有完整题目
- ❌ **无法自动获取**: 其余325个量表的items数据无法通过爬虫获取

### 策略转变：现实可行方案

**原计划行不通的原因**：
1. www.usecoa.com 没有items详情页
2. 大部分量表有版权保护，完整题目不公开
3. 爬虫只能获取基础信息，无法批量获取items

**新策略**：
1. **聚焦基础信息扩充** - 通过多源爬虫达到500个量表基础信息库
2. **精选高价值量表补充items** - 手动录入50-100个常用量表的完整题目
3. **提供题目获取指引** - 为其他量表提供官方链接和获取方式

---

## 📊 修订后的现状分析

### 现有数据情况
- **量表基础信息**: 328个（www.usecoa.com）
- **完整items数据**: 3个（PHQ-9, GAD-7, MMSE-2）
- **已爬取文件**: 695个JSON文件（包含重复和无效数据）
- **数据质量**:
  - ✅ 328个量表有完整基础信息
  - ✅ 版权信息覆盖率 100%
  - ❌ Items完整度 <1%（仅3个）

### 数据来源分析
**可爬取的数据源**（基础信息）：
1. www.usecoa.com - 已完成328个
2. 其他医学量表数据库网站 - 待开发

**Items数据来源**（需手动处理）：
1. ✅ 学术论文附录 - 可免费获取但需逐篇查找
2. ✅ IPIP等开源项目 - 完全公开但数量有限
3. ✅ 官方PDF文档 - 部分量表提供免费下载
4. ❌ 商业量表数据库 - 有版权限制

### 目标缺口重新评估
- **目标**: 500个量表
- **现有基础信息**: 328个
- **需新增基础信息**: 172个量表 ✅ 可行
- **Items数据目标**: 50-100个高价值量表 ✅ 务实

---

## 🎯 修订后的目标拆解

### 第1阶段目标（Week 1-4）- 基础信息扩充
**主要任务**: 新增基础信息至400个量表
- ✅ 分析现有695个爬取文件，提取有效量表（预计+30-50个）
- ✅ 开发新数据源爬虫（医学量表网站）
- ✅ 新增40-70个基础信息
- ✅ 累计达到: 370-400个量表基础信息

**Items工作**:
- ✅ 手动录入15-20个高频量表的完整items（如：BDI-II, HADS, MMPI-2精简版）

### 第2阶段目标（Week 5-8）- 加速到500
**主要任务**: 基础信息达到500个
- ✅ 持续爬取新数据源（100-130个）
- ✅ 累计达到: 500个量表基础信息

**Items工作**:
- ✅ 手动录入20-30个常用量表items
- ✅ 累计items数据: 40-50个量表

### 第3阶段目标（Week 9-12）- 质量提升
**主要任务**: 数据质量优化
- ✅ AI辅助补充英文翻译、描述
- ✅ 完善版权信息和psychometric properties
- ✅ 继续手动录入高价值量表items（目标总计60-100个）
- ✅ 建立items获取指引系统（为无items的量表提供官方链接）

---

## 📅 修订后的详细实施计划

### 🗓️ **Week 1-2：数据清理与新源开发**

#### 任务1: 分析已爬取的695个文件
**目标**: 从695个JSON文件中筛选出有效的新量表

```bash
# 分析脚本
pnpm tsx scripts/utils/analyze-crawled-data.ts

# 功能：
# 1. 去除重复数据（同一量表多次爬取）
# 2. 过滤无效数据（缺少核心字段）
# 3. 生成可导入的新量表SQL
```

**预期产出**: 30-50个新量表基础信息

---

#### 任务2: 调研并开发新数据源爬虫
**潜在数据源**:

1. **常笑医学网量表工具** (cxmed.cn/ms.html)
   - 特点: 医学专科量表
   - 数据类型: 基础信息 + 部分有在线计算工具

2. **医学题库网** (medtiku.com)
   - 特点: 医学考试相关量表
   - 数据类型: 基础信息

3. **PubMed Central 开放论文附录**
   - 特点: 高质量学术量表
   - 数据类型: 基础信息 + items（需手动提取）

**开发爬虫**:
```typescript
// scripts/crawlee/cxmed-crawler.ts
// 爬取常笑医学网的量表基础信息
```

**输出**:
- ✅ 2-3个新数据源爬虫
- ✅ 新增40-70个基础信息

---

#### 任务3: 手动录入高价值量表items（第一批）
**优先级量表**（依据临床使用频率）:

1. **抑郁焦虑类**:
   - ✅ BDI-II (Beck Depression Inventory-II) - 21题
   - ✅ HADS (Hospital Anxiety and Depression Scale) - 14题
   - ✅ BAI (Beck Anxiety Inventory) - 21题

2. **生活质量类**:
   - ✅ SF-36 (Short Form-36) - 36题
   - ✅ WHO-QOL-BREF (WHO生活质量简表) - 26题

3. **认知评估类**:
   - ✅ MoCA (Montreal Cognitive Assessment) - 30分
   - ✅ MMSE (Mini-Mental State Examination) - 30题 *(已有MMSE-2)*

**数据来源**:
- 官方PDF（如果免费）
- 学术论文附录
- IPIP等开源项目

**工作流程**:
```bash
# 1. 查找量表PDF/论文
# 2. 提取题目并翻译
# 3. 手动编写SQL
scripts/seed-bdi2-items.sql
scripts/seed-hads-items.sql
...

# 4. 导入数据库
DB_NAME=$(cat wrangler.jsonc | jq -r '.d1_databases[0].database_name')
pnpm exec wrangler d1 execute $DB_NAME --local --file=scripts/seed-bdi2-items.sql
```

**时间估算**: 每个量表2-4小时（查找+录入+验证）
**本阶段目标**: 15-20个量表

---

### 🗓️ **Week 3-4：数据导入与质量监控**

#### 任务4: 批量导入新爬取数据
```bash
# 1. 去重检查
pnpm tsx scripts/utils/deduplicate-scales.ts

# 2. 生成SQL
pnpm tsx scripts/crawlee/generate-new-scales-insert.ts

# 3. 导入本地
pnpm exec wrangler d1 execute $DB_NAME --local --file=scripts/insert-new-scales.sql

# 4. 同步远程
pnpm exec wrangler d1 execute $DB_NAME --remote --file=scripts/insert-new-scales.sql
```

---

#### 任务5: 建立数据质量监控
**监控脚本**: `scripts/utils/quality-check.ts`

```typescript
interface QualityMetrics {
  totalScales: number;
  scalesWithItems: number;         // 有items的量表数
  itemsCompleteness: number;        // items完整度 %
  scalesWithCopyright: number;      // 有版权信息的量表数
  scalesWithEnglishName: number;    // 有英文名的量表数
  scalesPublished: number;          // published状态的量表数

  // 新增指标
  scalesWithItemsGuide: number;     // 有获取指引的量表数
  topDomains: Array<{domain: string, count: number}>;  // Top领域分布
}
```

**Admin Dashboard页面**: `/admin/data-quality`
- 实时展示质量指标
- 缺失items的量表列表
- 按领域分类统计

---

### 🗓️ **Week 5-8：加速扩充至500**

#### 任务6: 持续爬取新数据源
**策略**: 并行运行多个爬虫

```bash
# 并行爬取
pnpm tsx scripts/crawlee/source-a-crawler.ts &
pnpm tsx scripts/crawlee/source-b-crawler.ts &
pnpm tsx scripts/crawlee/source-c-crawler.ts &
wait

# 合并数据
pnpm tsx scripts/utils/merge-crawled-data.ts
```

**目标**: 每周新增20-30个量表基础信息
**预期**: 4周新增100-130个，累计达到500个

---

#### 任务7: 继续手动录入items（第二批）
**优先级量表**:

4. **人格评估类**:
   - MBTI简化版（16题）
   - Big Five人格量表（44题）

5. **临床症状类**:
   - PANSS (阳性与阴性症状量表)
   - YMRS (Young Mania Rating Scale)
   - HAMD (Hamilton Depression Scale)

6. **功能评估类**:
   - Barthel指数
   - FIM (功能独立性测量)

**本阶段目标**: 20-30个量表
**累计items数据**: 40-50个量表

---

### 🗓️ **Week 9-12：质量提升与系统完善**

#### 任务8: AI辅助数据增强
**工具开发**: `scripts/ai/enhancer.ts`

```typescript
// 功能1: 自动生成英文翻译
async function translateScale(scale: EcoaScale) {
  // 使用Claude API翻译name和description
}

// 功能2: 补充psychometric properties
async function enrichPsychometrics(scale: EcoaScale) {
  // 基于量表名称搜索学术数据库
  // 提取信度、效度信息
}

// 功能3: 生成简短描述
async function generateSummary(scale: EcoaScale) {
  // 压缩长描述为50-100字摘要
}
```

**成本估算**: 500个量表 × 3次API调用 × $0.015 = ~$22

---

#### 任务9: Items获取指引系统
**需求**: 为无items的量表提供获取途径

**数据结构扩展**:
```typescript
// src/types/scale-detail.ts
interface ScaleItemsGuide {
  hasItems: boolean;
  itemsSource?: 'internal' | 'external';
  externalGuide?: {
    officialUrl?: string;        // 官方下载链接
    paperReference?: string;      // 学术论文引用
    purchaseInfo?: string;        // 商业购买信息
    contactInfo?: string;         // 联系方式
    notes?: string;               // 获取说明
  };
}
```

**实现**:
1. 量表详情页显示"如何获取完整题目"
2. 提供官方链接、论文引用、购买途径
3. 说明版权和使用限制

---

#### 任务10: 继续手动录入items（第三批）
**目标**: 继续录入10-20个高价值量表
**累计items数据**: 60-100个量表

**筛选标准**:
- 临床使用频率高
- 开源或学术免费
- 有完整的中英文版本
- 信效度良好

---

### 📊 阶段性成果检查点

| 时间点 | 量表总数 | Items数量 | 关键指标 |
|--------|---------|----------|---------|
| Week 2 | 360-380 | 15-20 | 新源爬虫开发完成 |
| Week 4 | 380-400 | 20-30 | 质量监控上线 |
| Week 6 | 430-450 | 30-40 | 持续爬取进行中 |
| Week 8 | 480-500 | 40-50 | 达到500目标 |
| Week 10 | 500+ | 50-70 | AI增强完成 |
| Week 12 | 500+ | 60-100 | 最终验收 |

---

## 🛠️ 技术架构与工具

### 核心脚本文件结构
```
scripts/
├── crawlee/
│   ├── generate-scale-insert.ts   # 现有：生成SQL（已完成）
│   ├── usecoa-html.ts              # 现有：爬虫（已完成）
│   ├── cxmed-crawler.ts            # 新增：常笑医学网爬虫
│   ├── medtiku-crawler.ts          # 新增：医学题库网爬虫
│   └── pubmed-crawler.ts           # 新增：PubMed附录爬虫
├── utils/
│   ├── analyze-crawled-data.ts     # 新增：分析695个JSON文件
│   ├── deduplicate-scales.ts       # 新增：去重工具
│   ├── quality-check.ts            # 新增：质量监控
│   └── merge-crawled-data.ts       # 新增：合并多源数据
├── ai/
│   ├── enhancer.ts                 # 新增：AI数据增强
│   └── translator.ts               # 新增：AI翻译
├── seed-phq9-items.sql             # 现有：PHQ-9 items
├── seed-gad7-items.sql             # 现有：GAD-7 items
├── seed-mmse2-items.sql            # 现有：MMSE-2 items
├── seed-bdi2-items.sql             # 新增：BDI-II items
├── seed-hads-items.sql             # 新增：HADS items
└── ...                             # 其他手动录入的items SQL
```

### 数据库操作命令
```bash
# 获取数据库名称
DB_NAME=$(cat wrangler.jsonc | jq -r '.d1_databases[0].database_name')

# 本地操作
alias db-local="pnpm exec wrangler d1 execute $DB_NAME --local"
alias db-count="db-local --command 'SELECT COUNT(*) FROM ecoa_scale'"
alias db-items-count="db-local --command 'SELECT COUNT(*) FROM ecoa_item'"

# 远程操作
alias db-remote="pnpm exec wrangler d1 execute $DB_NAME --remote"

# 质量检查
alias quality="pnpm tsx scripts/utils/quality-check.ts"
```

---

## 💰 修订后的成本估算

### 人力成本
**开发人员**（1人，3个月）：
- 爬虫开发：30小时（基础信息爬虫，无items）
- 数据清洗：40小时
- AI工具开发：20小时
- 手动录入items：120小时（60-100个量表 × 2小时/个）
- 测试验证：30小时
- **总计**：240小时 ≈ 1.5个月全职

### 技术成本
- **Claude API**（AI增强+翻译）：
  - 500个量表 × 2次调用 = 1000次
  - 估算成本：~$20-30

- **代理IP**：不需要（爬取基础信息不易被封）

- **Cloudflare服务**：免费（D1前5GB免费）

**总成本**: <$50

---

## 📊 修订后的验收标准

### 数量指标
- ✅ **量表总数** ≥ 500个
- ✅ **完整items数据** ≥ 60个（高价值量表）
- ✅ **Items获取指引** ≥ 400个（为无items量表提供获取途径）

### 质量指标
- ✅ **基础信息完整度** = 100%（name, acronym, description）
- ✅ **版权信息覆盖率** ≥ 95%
- ✅ **英文翻译覆盖率** ≥ 90%
- ✅ **Published状态** ≥ 450个（90%）

### 用户体验指标
- ✅ **搜索可用性** = 100%（所有量表可搜索）
- ✅ **详情页完整性** ≥ 95%
- ✅ **Items获取指引** ≥ 80%（无内置items的量表有获取说明）

---

## ✅ 修订后的立即行动方案

### 明天开始（Day 1）
1. ✅ 运行分析脚本，检查695个JSON文件
2. ✅ 手动筛选10-15个新量表候选
3. ✅ 调研常笑医学网、医学题库网的页面结构
4. ✅ 确定第一批手动录入items的20个量表清单

### 本周完成（Week 1）
1. ✅ 开发 `analyze-crawled-data.ts` 脚本
2. ✅ 从695个文件中提取30-50个新量表
3. ✅ 开发1个新数据源爬虫
4. ✅ 手动录入5-10个量表items

### 本月完成（Month 1）
1. ✅ 量表基础信息达到380-400个
2. ✅ Items数据达到20-30个量表
3. ✅ 质量监控系统上线
4. ✅ 2-3个新数据源爬虫就绪

---

## 🎯 核心策略总结

### 面对现实：Items数据难题
**问题**: 大部分量表的完整题目受版权保护，无法通过爬虫批量获取

**解决方案**:
1. **分层策略**：
   - **Tier 1**（60-100个）：手动录入高频量表的完整items
   - **Tier 2**（400+个）：仅提供基础信息 + items获取指引

2. **价值聚焦**：
   - 集中精力在临床最常用的量表上
   - 为用户提供获取完整量表的途径
   - 建立版权合规的数据获取流程

3. **用户体验优化**：
   - 明确标识哪些量表有完整items
   - 为无items的量表提供官方下载链接
   - 建立用户反馈和贡献机制

### 可行性评估
| 目标 | 可行性 | 风险 |
|------|--------|------|
| 500个量表基础信息 | ✅ 高 | 低（已有328个，仅需172个） |
| 60-100个完整items | ✅ 高 | 中（需人力投入120小时） |
| 版权合规 | ✅ 高 | 低（已有策略） |
| 3个月完成 | ✅ 高 | 低（时间充裕） |

---

**文档版本**: v2.0（修订版）
**创建日期**: 2025-10-14
**修订日期**: 2025-10-14
**修订原因**: www.usecoa.com不提供items数据，调整为基础信息爬取+手动items录入混合策略
