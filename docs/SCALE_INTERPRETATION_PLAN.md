# 量表解读功能完善技术计划

## 📋 项目背景

**当前状态：**
- 量表数据通过爬虫从 usecoa.com 获取
- 数据包含：量表基本信息、版权信息、适用人群、评估领域等
- **缺失：专业的量表解读内容**

**目标：**
为每个量表提供专业、全面的解读内容，帮助用户理解量表的使用方法、结果解释和临床应用。

## 🎯 解读内容结构

### 1. 量表概述 (Overview)
- 量表简介
- 历史发展
- 应用场景
- 适用人群

### 2. 量表结构 (Structure)
- 题目数量和类型
- 计分方法
- 维度/因子结构
- 施测时间

### 3. 心理测量学特性 (Psychometric Properties)
- 信度（Reliability）
  - 内部一致性（Cronbach's α）
  - 重测信度
  - 分半信度
- 效度（Validity）
  - 内容效度
  - 结构效度
  - 效标效度
- 常模数据

### 4. 结果解释 (Interpretation)
- 分数范围
- 切分点（Cut-off scores）
- 严重程度分级
- 临床意义

### 5. 使用指南 (Usage Guidelines)
- 施测流程
- 注意事项
- 常见问题
- 最佳实践

### 6. 临床应用 (Clinical Applications)
- 典型应用场景
- 案例分析
- 与其他量表的对比
- 局限性

## 🛠️ 技术方案

### 方案 A：AI 生成 + 人工审核（推荐）

**优点：**
- 快速生成大量内容
- 成本可控
- 可持续迭代优化

**实施步骤：**

#### 1. 数据准备
```typescript
// 1. 增强爬虫，提取更多结构化信息
interface ScaleData {
  id: string;
  name: string;
  nameEn: string;
  acronym: string;
  author: string;
  copyrightHolder: string;
  itemsCount: number;
  administrationTime: number;
  targetPopulation: string[];
  assessmentDomains: string[];
  abstract: string;
  
  // 新增字段
  yearPublished?: number;
  originalLanguage?: string;
  psychometricData?: {
    reliability?: {
      cronbachAlpha?: number;
      testRetest?: number;
    };
    validity?: {
      type: string;
      value: number;
    }[];
  };
  scoringMethod?: string;
  interpretationGuidelines?: string;
}
```

#### 2. AI 提示词工程
```typescript
// src/services/interpretation/ai-generator.ts
import { Anthropic } from '@anthropic-ai/sdk';

const INTERPRETATION_PROMPT = `
你是一位专业的临床心理学家和心理测量学专家。请为以下量表生成专业、准确的解读内容。

量表信息：
- 名称：{name}
- 英文名：{nameEn}
- 缩写：{acronym}
- 作者：{author}
- 题目数：{itemsCount}
- 施测时间：{administrationTime}分钟
- 评估领域：{domains}
- 适用人群：{targetPopulation}

请生成以下内容（使用中文）：

## 1. 量表概述
- 简介（100-150字）
- 发展历史
- 主要应用场景

## 2. 量表结构
- 维度/因子
- 计分方法
- 题目类型

## 3. 心理测量学特性
- 信度指标
- 效度证据
- 常模参考

## 4. 结果解释
- 分数范围
- 切分点标准
- 严重程度分级

## 5. 使用指南
- 施测注意事项
- 适用场景
- 不适用场景

## 6. 临床应用建议
- 典型应用
- 与其他量表的区别
- 局限性

要求：
1. 内容专业、准确、客观
2. 使用简洁清晰的语言
3. 提供具体的数据和标准
4. 标注需要进一步验证的信息
5. 引用权威文献（如有）
`;

export async function generateInterpretation(scaleData: ScaleData) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = INTERPRETATION_PROMPT
    .replace('{name}', scaleData.name)
    .replace('{nameEn}', scaleData.nameEn)
    .replace('{acronym}', scaleData.acronym)
    .replace('{author}', scaleData.author)
    .replace('{itemsCount}', scaleData.itemsCount.toString())
    .replace('{administrationTime}', scaleData.administrationTime.toString())
    .replace('{domains}', scaleData.assessmentDomains.join('、'))
    .replace('{targetPopulation}', scaleData.targetPopulation.join('、'));

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
```

#### 3. 数据库设计
```sql
-- 量表解读表
CREATE TABLE scale_interpretation (
  id TEXT PRIMARY KEY,
  scaleId TEXT NOT NULL REFERENCES ecoa_scale(id),
  
  -- 内容字段
  overview TEXT,              -- 量表概述
  structure TEXT,             -- 量表结构
  psychometricProperties TEXT, -- 心理测量学特性
  interpretation TEXT,        -- 结果解释
  usageGuidelines TEXT,       -- 使用指南
  clinicalApplications TEXT,  -- 临床应用
  
  -- 元数据
  generationMethod TEXT,      -- 'ai' | 'manual' | 'hybrid'
  generatedAt TIMESTAMP,
  reviewedAt TIMESTAMP,
  reviewedBy TEXT,
  status TEXT,                -- 'draft' | 'reviewed' | 'published'
  version INTEGER DEFAULT 1,
  
  -- AI 相关
  aiModel TEXT,               -- 使用的 AI 模型
  aiPromptVersion TEXT,       -- 提示词版本
  confidence REAL,            -- AI 生成的置信度
  
  -- 审核相关
  reviewNotes TEXT,           -- 审核意见
  needsVerification BOOLEAN,  -- 需要专家验证
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 解读修订历史
CREATE TABLE interpretation_history (
  id TEXT PRIMARY KEY,
  interpretationId TEXT NOT NULL REFERENCES scale_interpretation(id),
  version INTEGER NOT NULL,
  changes TEXT,               -- JSON 格式的变更记录
  changedBy TEXT,
  changeReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 专家审核反馈
CREATE TABLE interpretation_feedback (
  id TEXT PRIMARY KEY,
  interpretationId TEXT NOT NULL REFERENCES scale_interpretation(id),
  expertId TEXT,
  expertName TEXT,
  expertCredentials TEXT,     -- 专家资质
  section TEXT,               -- 哪个部分的反馈
  feedbackType TEXT,          -- 'correction' | 'addition' | 'suggestion'
  content TEXT,
  status TEXT,                -- 'pending' | 'applied' | 'rejected'
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolvedAt TIMESTAMP
);
```

#### 4. 批量生成脚本
```typescript
// scripts/generate-interpretations.ts
import { getDB } from '@/db';
import { ecoaScaleTable } from '@/db/schema';
import { generateInterpretation } from '@/services/interpretation/ai-generator';
import { eq } from 'drizzle-orm';

async function generateAllInterpretations() {
  const db = getDB();
  
  // 获取所有没有解读的量表
  const scales = await db
    .select()
    .from(ecoaScaleTable)
    .where(eq(ecoaScaleTable.hasInterpretation, false))
    .limit(10); // 每次处理 10 个

  for (const scale of scales) {
    console.log(`Generating interpretation for ${scale.name}...`);
    
    try {
      const interpretation = await generateInterpretation({
        id: scale.id,
        name: scale.name,
        nameEn: scale.nameEn,
        acronym: scale.acronym,
        author: scale.author,
        copyrightHolder: scale.copyrightHolder,
        itemsCount: scale.itemsCount,
        administrationTime: scale.administrationTime,
        targetPopulation: scale.targetPopulation,
        assessmentDomains: scale.assessmentDomains,
        abstract: scale.abstract,
      });

      // 解析 AI 生成的内容
      const sections = parseInterpretation(interpretation);

      // 保存到数据库
      await db.insert(scaleInterpretationTable).values({
        id: `interp_${scale.id}`,
        scaleId: scale.id,
        overview: sections.overview,
        structure: sections.structure,
        psychometricProperties: sections.psychometric,
        interpretation: sections.interpretation,
        usageGuidelines: sections.usage,
        clinicalApplications: sections.clinical,
        generationMethod: 'ai',
        aiModel: 'claude-3-5-sonnet-20241022',
        status: 'draft',
        needsVerification: true,
      });

      // 更新量表标记
      await db
        .update(ecoaScaleTable)
        .set({ hasInterpretation: true })
        .where(eq(ecoaScaleTable.id, scale.id));

      console.log(`✓ Generated interpretation for ${scale.name}`);
      
      // 避免 API 限流
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`✗ Failed to generate interpretation for ${scale.name}:`, error);
    }
  }
}

function parseInterpretation(text: string) {
  // 使用正则表达式提取各个部分
  const sections = {
    overview: extractSection(text, '量表概述', '量表结构'),
    structure: extractSection(text, '量表结构', '心理测量学特性'),
    psychometric: extractSection(text, '心理测量学特性', '结果解释'),
    interpretation: extractSection(text, '结果解释', '使用指南'),
    usage: extractSection(text, '使用指南', '临床应用'),
    clinical: extractSection(text, '临床应用', null),
  };
  
  return sections;
}

function extractSection(text: string, start: string, end: string | null): string {
  const startRegex = new RegExp(`##\\s*\\d+\\.\\s*${start}`, 'i');
  const startMatch = text.match(startRegex);
  
  if (!startMatch) return '';
  
  const startIndex = startMatch.index! + startMatch[0].length;
  
  if (!end) {
    return text.substring(startIndex).trim();
  }
  
  const endRegex = new RegExp(`##\\s*\\d+\\.\\s*${end}`, 'i');
  const endMatch = text.substring(startIndex).match(endRegex);
  
  if (!endMatch) {
    return text.substring(startIndex).trim();
  }
  
  return text.substring(startIndex, startIndex + endMatch.index!).trim();
}

// 运行生成
generateAllInterpretations();
```

#### 5. 审核管理界面
```typescript
// src/app/(admin)/admin/_components/interpretations/interpretation-reviewer.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface InterpretationReviewProps {
  interpretation: ScaleInterpretation;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: (notes: string) => void;
}

export function InterpretationReviewer({ 
  interpretation, 
  onApprove, 
  onReject, 
  onRequestChanges 
}: InterpretationReviewProps) {
  const [reviewNotes, setReviewNotes] = useState('');

  return (
    <div className="space-y-6">
      {/* 量表信息 */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">{interpretation.scale.name}</h3>
        <div className="flex gap-2">
          <Badge variant={interpretation.status === 'published' ? 'default' : 'secondary'}>
            {interpretation.status}
          </Badge>
          <Badge variant="outline">
            {interpretation.generationMethod}
          </Badge>
          {interpretation.needsVerification && (
            <Badge variant="destructive">需要验证</Badge>
          )}
        </div>
      </Card>

      {/* 内容审核 */}
      <div className="space-y-4">
        <Section title="量表概述" content={interpretation.overview} />
        <Section title="量表结构" content={interpretation.structure} />
        <Section title="心理测量学特性" content={interpretation.psychometricProperties} />
        <Section title="结果解释" content={interpretation.interpretation} />
        <Section title="使用指南" content={interpretation.usageGuidelines} />
        <Section title="临床应用" content={interpretation.clinicalApplications} />
      </div>

      {/* 审核操作 */}
      <Card className="p-4">
        <Textarea
          placeholder="审核意见..."
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2 mt-4">
          <Button onClick={onApprove} className="bg-green-600">
            ✓ 通过并发布
          </Button>
          <Button 
            onClick={() => onRequestChanges(reviewNotes)} 
            variant="outline"
          >
            ✎ 需要修改
          </Button>
          <Button onClick={onReject} variant="destructive">
            ✗ 拒绝
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

### 方案 B：众包 + 专家审核

**优点：**
- 内容质量更可控
- 可以积累专业社区
- 建立权威性

**实施步骤：**

1. **专家贡献系统**
   - 邀请临床心理学家、精神科医生等专业人士
   - 提供贡献工具和模板
   - 积分激励系统

2. **内容审核流程**
   - 多级审核：初审 → 专家审核 → 最终审核
   - 版本控制
   - 反馈循环

3. **质量控制**
   - 内容标准和模板
   - 引用文献要求
   - 定期更新机制

### 方案 C：混合方案（最优）

**结合 AI 生成和人工审核：**

1. **AI 生成初稿**（快速覆盖）
   - 使用 Claude 3.5 Sonnet 生成基础内容
   - 标注生成来源和置信度
   - 自动识别需要验证的部分

2. **专家审核和增强**（确保质量）
   - 临床专家审核 AI 生成的内容
   - 添加临床经验和案例
   - 更新最新研究进展

3. **持续优化**（迭代改进）
   - 收集用户反馈
   - A/B 测试不同版本
   - 定期更新和完善

## 📊 实施时间线

### Phase 1: 基础设施（2周）
- [ ] 设计数据库结构
- [ ] 开发 AI 生成服务
- [ ] 创建批量生成脚本
- [ ] 搭建审核管理界面

### Phase 2: 内容生成（3周）
- [ ] AI 生成所有量表的初稿
- [ ] 人工审核前 20% 高优先级量表
- [ ] 修正提示词和生成流程
- [ ] 完善内容质量标准

### Phase 3: 审核发布（2周）
- [ ] 组织专家团队审核
- [ ] 处理反馈和修正
- [ ] 发布第一批解读内容
- [ ] 监控用户反馈

### Phase 4: 持续优化（ongoing）
- [ ] 收集和处理用户反馈
- [ ] 定期更新内容
- [ ] 添加新量表的解读
- [ ] 建立专家贡献体系

## 💰 成本估算

### AI 生成成本
- Claude 3.5 Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- 每个量表解读约 4000 tokens 输出
- 假设 500 个量表: 500 × 4000 × $15/1M = **$30**

### 人工审核成本
- 专家审核费用: $50-100/量表
- 500 个量表: **$25,000 - $50,000**

### 开发成本
- 基础设施开发: 2周
- 内容管理系统: 1周
- 审核工具: 1周
- 总计: **4周开发时间**

## 🎯 成功指标

1. **覆盖率**: 90% 的量表有完整解读
2. **质量**: 专家审核通过率 > 80%
3. **用户满意度**: NPS > 50
4. **使用率**: 60% 的用户查看解读内容
5. **更新频率**: 每季度更新 10% 的内容

## 🚀 快速启动

```bash
# 1. 配置 AI API
echo "ANTHROPIC_API_KEY=your_api_key" >> .env

# 2. 运行数据库迁移
pnpm db:push

# 3. 生成第一批解读（10个量表）
pnpm tsx scripts/generate-interpretations.ts

# 4. 启动审核界面
pnpm dev
# 访问 /admin/interpretations
```

## 📚 参考资源

1. **心理测量学标准**
   - APA Standards for Educational and Psychological Testing
   - AERA/APA/NCME Standards

2. **量表数据库**
   - PubMed
   - PsycINFO
   - Google Scholar

3. **AI 提示词资源**
   - Anthropic Prompt Engineering Guide
   - OpenAI Best Practices

## ⚠️ 注意事项

1. **法律合规**
   - 确保生成的内容不侵犯版权
   - 标注 AI 生成来源
   - 添加免责声明

2. **专业责任**
   - 明确标注内容仅供参考
   - 建议咨询专业人士
   - 不替代专业诊断

3. **隐私保护**
   - 不包含患者个人信息
   - 案例脱敏处理
   - 遵守医疗隐私法规

## 🔄 后续扩展

1. **多语言支持**: 生成英文版解读
2. **视频教程**: 量表使用视频指南
3. **互动工具**: 在线计分器和结果解释器
4. **API 服务**: 提供解读内容 API
5. **移动应用**: 量表解读 App
