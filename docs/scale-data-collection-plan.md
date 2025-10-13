# Open eCOA 量表数据收集方案

## 🎯 项目目标

建立一个合规、高效的量表数据收集系统，从公开数据源自动化收集、规范化和验证量表信息，丰富xCOA平台的量表库。

## ⚖️ 合规和伦理原则

### 法律合规框架
- ✅ **仅收集公开数据**: 只从公开可访问的网站收集信息
- ✅ **遵守robots.txt**: 严格遵守网站的爬虫政策
- ✅ **尊重版权**: 不收集受版权保护的完整量表内容
- ✅ **数据引用**: 明确标注数据来源和引用信息
- ✅ **合理使用**: 仅收集基本描述信息，不复制完整内容

### 技术规范
- ✅ **请求频率限制**: 每个域名最多每秒1次请求
- ✅ **User-Agent标识**: 明确标识为学术研究爬虫
- ✅ **缓存机制**: 避免重复请求相同内容
- ✅ **错误处理**: 优雅处理网络错误和反爬机制

## 📊 目标数据源

### 主要公开数据源
```typescript
const DATA_SOURCES = {
  // 学术和研究机构
  academic: {
    'usecoa.com': {
      priority: 'high',
      type: 'eCOA专业平台',
      focus: ['量表目录', '基本信息', '分类体系'],
      updateFreq: 'weekly'
    },
    'chinecoa.com': {
      priority: 'high',
      type: '中文eCOA平台',
      focus: ['中文量表', '本土化信息', '临床应用'],
      updateFreq: 'weekly'
    },
    'mapi-trust.org': {
      priority: 'medium',
      type: '患者报告结局信托',
      focus: ['PRO量表', '验证信息', '使用指南'],
      updateFreq: 'monthly'
    }
  },

  // 政府和监管机构
  regulatory: {
    'fda.gov': {
      sections: ['/medical-devices/guidance-documents'],
      focus: ['FDA指南', '量表要求', '验证标准']
    },
    'ema.europa.eu': {
      sections: ['/human-regulatory/research-development'],
      focus: ['EMA指南', '欧盟要求', 'PRO指导']
    }
  },

  // 专业组织和期刊
  professional: {
    'ispor.org': {
      sections: ['/health-economics-outcomes-research-hesearch'],
      focus: ['经济学评估', '结局研究', '方法学指南']
    },
    'isoqol.org': {
      sections: ['/resources'],
      focus: ['生活质量', '量表开发', '最佳实践']
    }
  }
};
```

## 🤖 技术架构设计

### 爬虫系统架构
```typescript
// 核心爬虫引擎
interface ScrapingEngine {
  scheduler: TaskScheduler;      // 任务调度器
  fetcher: WebFetcher;          // 网页获取器
  parser: ContentParser;        // 内容解析器
  validator: DataValidator;     // 数据验证器
  normalizer: DataNormalizer;   // 数据规范化
  storage: DatabaseWriter;      // 数据存储器
}

// 任务调度器
interface TaskScheduler {
  addTask(url: string, config: ScrapingConfig): void;
  getRateLimit(domain: string): RateLimit;
  scheduleRetry(task: Task, delay: number): void;
  pauseForDomain(domain: string, duration: number): void;
}

// 数据解析器
interface ContentParser {
  extractScaleInfo(html: string, config: ParseConfig): ScaleData;
  extractCategoryInfo(html: string): CategoryData;
  extractCopyrightInfo(html: string): CopyrightData;
  validateStructure(data: any): boolean;
}
```

### 数据收集API设计
```typescript
// 爬虫控制API
POST /api/admin/scraping/start     // 启动数据收集
POST /api/admin/scraping/pause     // 暂停收集
GET  /api/admin/scraping/status    // 获取收集状态
GET  /api/admin/scraping/logs      // 查看收集日志

// 数据管理API
GET  /api/admin/collected-data     // 查看收集的数据
POST /api/admin/data/validate      // 验证数据质量
POST /api/admin/data/normalize     // 规范化数据
POST /api/admin/data/import        // 导入到主数据库
```

## 🔍 数据提取策略

### 量表基础信息提取
```typescript
interface ScaleExtractionRule {
  name: {
    selectors: ['h1', '.scale-title', '[data-scale-name]'],
    patterns: [/量表名称[:：]\s*(.+)/, /Scale Name:\s*(.+)/],
    required: true
  },
  acronym: {
    selectors: ['.acronym', '.short-name', '[data-acronym]'],
    patterns: [/缩写[:：]\s*([A-Z0-9-]+)/, /Acronym:\s*([A-Z0-9-]+)/],
    required: true
  },
  description: {
    selectors: ['.description', '.summary', '.overview'],
    maxLength: 2000,
    required: true
  },
  category: {
    selectors: ['.category', '.classification', '[data-category]'],
    mapping: CATEGORY_MAPPING,
    required: false
  },
  targetPopulation: {
    selectors: ['.target-population', '.applicable-to'],
    patterns: [/适用人群[:：]\s*(.+)/, /Target Population:\s*(.+)/],
    required: false
  },
  administrationTime: {
    selectors: ['.admin-time', '.duration'],
    patterns: [/(\d+)\s*分钟/, /(\d+)\s*minutes?/],
    type: 'number',
    required: false
  }
}
```

### 版权信息提取
```typescript
interface CopyrightExtractionRule {
  copyrightHolder: {
    selectors: ['.copyright-holder', '.author', '.developer'],
    patterns: [/版权所有[:：]\s*(.+)/, /Copyright.*?(\d{4}).*?(.+)/],
    required: true
  },
  contactEmail: {
    selectors: ['[href^="mailto:"]'],
    patterns: [/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/],
    required: false
  },
  licenseType: {
    selectors: ['.license', '.usage-rights'],
    mapping: {
      'free': ['免费', 'free', 'open source'],
      'academic': ['学术', 'academic', 'research only'],
      'commercial': ['商业', 'commercial', 'paid'],
      'restricted': ['限制', 'restricted', 'permission required']
    },
    required: false
  }
}
```

## 🔧 实施方案

### Phase 1: 基础爬虫框架 (第1-2周)
```typescript
// 1. 创建基础爬虫引擎
src/utils/scraping/
├── engine.ts           // 核心爬虫引擎
├── scheduler.ts        // 任务调度器
├── fetcher.ts          // 网页获取器
├── parser.ts           // 内容解析器
└── config.ts           // 配置管理

// 2. 实现合规控制
src/utils/scraping/compliance/
├── robots-checker.ts   // robots.txt检查
├── rate-limiter.ts     // 请求频率控制
├── ethical-rules.ts    // 伦理规则检查
└── copyright-detector.ts // 版权信息检测
```

### Phase 2: 数据解析和规范化 (第2-3周)
```typescript
// 3. 数据解析器
src/utils/scraping/parsers/
├── scale-parser.ts     // 量表信息解析
├── category-parser.ts  // 分类信息解析
├── copyright-parser.ts // 版权信息解析
└── validation-parser.ts // 验证信息解析

// 4. 数据规范化
src/utils/scraping/normalizers/
├── scale-normalizer.ts   // 量表数据规范化
├── category-mapper.ts    // 分类映射
├── language-detector.ts  // 语言检测
└── quality-scorer.ts     // 数据质量评分
```

### Phase 3: 管理界面和监控 (第3-4周)
```typescript
// 5. 管理界面
src/app/(admin)/admin/data-collection/
├── page.tsx              // 数据收集管理页面
├── sources/page.tsx      // 数据源管理
├── rules/page.tsx        // 提取规则配置
└── logs/page.tsx         // 收集日志查看

// 6. 监控和质量控制
src/app/api/admin/scraping/
├── monitor/route.ts      // 爬虫监控
├── quality/route.ts      // 数据质量检查
├── conflicts/route.ts    // 冲突数据处理
└── statistics/route.ts   // 收集统计
```

## 📋 数据质量保证

### 数据验证规则
```typescript
interface DataValidationRules {
  completeness: {
    required: ['name', 'acronym', 'description'],
    recommended: ['category', 'targetPopulation', 'administrationTime'],
    optional: ['itemsCount', 'validationStatus', 'references']
  },
  accuracy: {
    nameLength: { min: 5, max: 200 },
    acronymPattern: /^[A-Z0-9-]{2,20}$/,
    descriptionLength: { min: 50, max: 2000 },
    administrationTime: { min: 1, max: 180 } // 分钟
  },
  consistency: {
    categoryMapping: STANDARD_CATEGORIES,
    languageDetection: ['zh-CN', 'en-US'],
    duplicateDetection: ['name', 'acronym', 'description']
  }
}
```

### 数据去重和冲突处理
```typescript
interface ConflictResolution {
  duplicateHandling: {
    strategy: 'merge' | 'keep_latest' | 'manual_review',
    mergeRules: {
      name: 'prefer_longer',
      description: 'prefer_more_detailed',
      copyright: 'prefer_most_recent',
      validation: 'prefer_higher_quality'
    }
  },
  qualityScoring: {
    sourceReliability: { weight: 0.3 },
    dataCompleteness: { weight: 0.3 },
    informationRecency: { weight: 0.2 },
    validationStatus: { weight: 0.2 }
  }
}
```

## 🚀 技术实现

### 爬虫引擎核心代码
```typescript
// 主爬虫引擎
export class ScaleDataCollector {
  private scheduler: TaskScheduler;
  private rateLimiter: RateLimiter;
  private parser: ContentParser;

  async collectFromSource(source: DataSource): Promise<CollectionResult> {
    // 1. 检查robots.txt和合规性
    const compliance = await this.checkCompliance(source.url);
    if (!compliance.allowed) {
      throw new Error(`收集被禁止: ${compliance.reason}`);
    }

    // 2. 获取页面内容
    const content = await this.rateLimiter.fetch(source.url, {
      headers: {
        'User-Agent': 'Open eCOA-Academic-Research-Bot/1.0 (+https://openecoa.com/about-crawler)'
      }
    });

    // 3. 解析量表信息
    const rawData = await this.parser.extractScaleData(content.html, source.config);

    // 4. 数据验证和规范化
    const validatedData = await this.validator.validate(rawData);
    const normalizedData = await this.normalizer.normalize(validatedData);

    // 5. 质量评分
    const qualityScore = await this.scorer.calculateQuality(normalizedData);

    return {
      source: source.url,
      data: normalizedData,
      quality: qualityScore,
      timestamp: new Date(),
      status: 'collected'
    };
  }
}
```

### 数据规范化管道
```typescript
export class DataNormalizer {
  async normalizeScale(rawData: any): Promise<NormalizedScale> {
    return {
      // 基础信息规范化
      name: this.cleanText(rawData.name),
      nameEn: this.detectEnglishName(rawData),
      acronym: this.standardizeAcronym(rawData.acronym),
      description: this.summarizeDescription(rawData.description),
      descriptionEn: this.translateIfNeeded(rawData.description),

      // 分类映射
      categoryId: this.mapCategory(rawData.category),

      // 数值规范化
      itemsCount: this.parseNumber(rawData.itemsCount),
      administrationTime: this.parseTime(rawData.administrationTime),

      // 语言检测
      languages: this.detectLanguages(rawData),

      // 验证状态评估
      validationStatus: this.assessValidation(rawData),

      // 元数据
      dataSource: rawData.source,
      collectionDate: new Date(),
      qualityScore: this.calculateQualityScore(rawData)
    };
  }
}
```

## 📊 数据收集监控

### 收集统计和监控
```typescript
interface CollectionMetrics {
  daily: {
    totalRequests: number;
    successfulExtractions: number;
    failedRequests: number;
    newScalesFound: number;
    duplicatesDetected: number;
    qualityScoreAverage: number;
  },
  bySource: Record<string, {
    totalScales: number;
    averageQuality: number;
    lastUpdate: Date;
    errorRate: number;
  }>,
  dataQuality: {
    completenessRate: number;
    validationPassRate: number;
    duplicateRate: number;
    manualReviewRequired: number;
  }
}
```

### 实时监控界面
```typescript
// 管理员监控面板
const MonitoringDashboard = () => (
  <div className="grid grid-cols-3 gap-6">
    <MetricsCard title="今日收集" metrics={dailyMetrics} />
    <QualityCard title="数据质量" quality={qualityMetrics} />
    <SourcesCard title="数据源状态" sources={sourceStatus} />

    <RecentCollections collections={recentCollections} />
    <ErrorLogs errors={recentErrors} />
    <QualityReview items={reviewQueue} />
  </div>
);
```

## 🛡️ 安全和隐私保护

### 数据安全措施
```typescript
interface SecurityMeasures {
  dataProtection: {
    encryption: 'AES-256',           // 敏感数据加密
    anonymization: true,             // 去标识化处理
    accessControl: 'role-based',     // 基于角色的访问控制
    auditLog: 'comprehensive'        // 完整的审计日志
  },
  ethicalSafeguards: {
    noPersonalData: true,            // 不收集个人数据
    sourceAttribution: true,         // 明确数据来源
    updateNotification: true,        // 数据更新通知
    deletionRights: true             // 支持数据删除请求
  }
}
```

### 隐私保护原则
- ✅ **最小化收集**: 只收集必要的量表描述信息
- ✅ **去标识化**: 移除任何可能的个人标识信息
- ✅ **透明度**: 公开数据收集策略和用途
- ✅ **用户控制**: 支持数据更正和删除请求

## 📈 数据质量控制

### 三级质量检查
```typescript
// Level 1: 自动化检查
const AutomaticValidation = {
  structuralCheck: '数据结构完整性',
  formatValidation: '格式规范性检查',
  duplicateDetection: '重复数据检测',
  sourceVerification: '来源可靠性验证'
};

// Level 2: 规则引擎检查
const RuleEngineValidation = {
  semanticConsistency: '语义一致性检查',
  crossReferenceValidation: '交叉引用验证',
  domainKnowledgeCheck: '领域知识检查',
  temporalConsistency: '时间一致性检查'
};

// Level 3: 人工审核
const ManualReview = {
  expertValidation: '专家验证',
  medicalAccuracy: '医学准确性检查',
  copyrightCompliance: '版权合规检查',
  clinicalRelevance: '临床相关性评估'
};
```

## 🎯 预期成果

### 数据收集目标
```typescript
// 6个月收集目标
const CollectionGoals = {
  quantitative: {
    totalScales: 500,              // 收集500个量表基础信息
    categories: 20,                // 覆盖20个主要分类
    languages: ['zh-CN', 'en-US'], // 双语量表信息
    sources: 10                    // 10个主要数据源
  },
  qualitative: {
    averageQuality: 0.85,          // 平均质量分数85%
    completeness: 0.90,            // 数据完整度90%
    accuracy: 0.95,                // 数据准确率95%
    duplicateRate: 0.05            // 重复率控制在5%以下
  }
}
```

### 业务价值
- ✅ **数据库扩展**: 从当前7个量表扩展到500+量表
- ✅ **内容丰富**: 完整的量表描述和分类信息
- ✅ **质量保证**: 多级验证确保数据准确性
- ✅ **持续更新**: 自动化的数据更新和维护

## 📋 实施时间线

### 第1周: 框架搭建
- [ ] 爬虫引擎核心架构
- [ ] 合规检查模块
- [ ] 基础数据解析器

### 第2周: 数据源集成
- [ ] 主要数据源适配
- [ ] 解析规则配置
- [ ] 数据验证逻辑

### 第3周: 质量控制
- [ ] 数据规范化管道
- [ ] 去重和冲突处理
- [ ] 质量评分系统

### 第4周: 管理界面
- [ ] 收集状态监控
- [ ] 数据质量报告
- [ ] 人工审核界面

---

**⚖️ 重要提醒**: 本方案严格遵守网络爬虫伦理和法律规范，仅收集公开可访问的基础信息，不侵犯任何版权或隐私权。所有收集的数据都会明确标注来源，并用于学术研究和教育目的。

**🎯 预期价值**: 通过合规的数据收集，xCOA平台将建立最全面的中英文量表信息库，为用户提供更丰富的专业资源。