// 合规的量表数据收集引擎
// 遵循伦理和法律规范，仅收集公开可访问的基础信息

import { z } from 'zod';

// 数据源配置
export interface DataSource {
  id: string;
  name: string;
  baseUrl: string;
  type: 'academic' | 'regulatory' | 'professional' | 'commercial';
  priority: 'high' | 'medium' | 'low';
  rateLimit: number; // 每秒最大请求数
  respectRobots: boolean;
  userAgent: string;
  headers?: Record<string, string>;
  selectors: ScaleSelectors;
}

// 量表信息选择器配置
export interface ScaleSelectors {
  name: string[];
  nameEn?: string[];
  acronym: string[];
  description: string[];
  category?: string[];
  targetPopulation?: string[];
  administrationTime?: string[];
  itemsCount?: string[];
  copyright?: string[];
  contactInfo?: string[];
}

// 规范化的量表数据结构
export const NormalizedScaleSchema = z.object({
  name: z.string().min(3).max(200),
  nameEn: z.string().optional(),
  acronym: z.string().min(2).max(20),
  description: z.string().min(20).max(2000),
  descriptionEn: z.string().optional(),
  category: z.string().optional(),
  targetPopulation: z.string().optional(),
  administrationTime: z.number().min(1).max(180).optional(),
  itemsCount: z.number().min(1).max(1000).optional(),
  languages: z.array(z.string()).default(['zh-CN']),
  validationStatus: z.enum(['validated', 'draft', 'experimental']).default('draft'),
  copyrightInfo: z.string().optional(),
  copyrightHolder: z.string().optional(),
  contactEmail: z.string().email().optional(),
  licenseType: z.enum(['free', 'academic', 'commercial', 'restricted']).optional(),
  dataSource: z.string(),
  sourceUrl: z.string().url(),
  collectionDate: z.date(),
  qualityScore: z.number().min(0).max(1)
});

export type NormalizedScale = z.infer<typeof NormalizedScaleSchema>;

// 合规检查器
export class ComplianceChecker {
  async checkRobotsTxt(baseUrl: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
      if (!robotsResponse.ok) {
        return { allowed: true }; // 没有robots.txt，默认允许
      }

      const robotsText = await robotsResponse.text();
      const lines = robotsText.split('\n');

      let currentUserAgent = '';
      let isRelevantSection = false;

      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();

        if (trimmedLine.startsWith('user-agent:')) {
          currentUserAgent = trimmedLine.split(':')[1].trim();
          isRelevantSection = currentUserAgent === '*' || currentUserAgent.includes('bot');
        }

        if (isRelevantSection && trimmedLine.startsWith('disallow:')) {
          const disallowPath = trimmedLine.split(':')[1].trim();
          if (disallowPath === '/' || disallowPath === '*') {
            return {
              allowed: false,
              reason: `robots.txt禁止访问: ${disallowPath}`
            };
          }
        }
      }

      return { allowed: true };
    } catch (error) {
      console.warn('无法检查robots.txt:', error);
      return { allowed: true }; // 网络错误时默认允许，但会记录
    }
  }

  validateEthicalCompliance(url: string, data: any): boolean {
    // 检查是否包含个人隐私信息
    const personalDataPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // 信用卡号
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // 个人邮箱(某些模式)
    ];

    const content = JSON.stringify(data).toLowerCase();
    for (const pattern of personalDataPatterns) {
      if (pattern.test(content)) {
        console.warn('检测到可能的个人信息，跳过收集');
        return false;
      }
    }

    return true;
  }
}

// 请求频率限制器
export class RateLimiter {
  private requestTimes: Map<string, number[]> = new Map();

  async fetch(url: string, options: RequestInit = {}): Promise<{ html: string; status: number }> {
    const domain = new URL(url).hostname;
    await this.waitForRateLimit(domain);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'xCOA-Academic-Research-Bot/1.0 (+https://xcoa.pro/about-crawler)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers
        }
      });

      this.recordRequest(domain);

      const html = await response.text();
      return { html, status: response.status };
    } catch (error) {
      console.error(`请求失败 ${url}:`, error);
      throw error;
    }
  }

  private async waitForRateLimit(domain: string): Promise<void> {
    const now = Date.now();
    const requests = this.requestTimes.get(domain) || [];

    // 清理1分钟前的请求记录
    const recentRequests = requests.filter(time => now - time < 60000);

    // 如果最近1分钟内请求过多，等待
    if (recentRequests.length >= 60) { // 每分钟最多60次请求
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = 60000 - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  private recordRequest(domain: string): void {
    const now = Date.now();
    const requests = this.requestTimes.get(domain) || [];
    requests.push(now);

    // 只保留最近1小时的记录
    const recentRequests = requests.filter(time => now - time < 3600000);
    this.requestTimes.set(domain, recentRequests);
  }
}

// 内容解析器
export class ContentParser {
  extractScaleInfo(html: string, selectors: ScaleSelectors): Partial<NormalizedScale> {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    return {
      name: this.extractText(dom, selectors.name),
      nameEn: this.extractText(dom, selectors.nameEn || []),
      acronym: this.extractText(dom, selectors.acronym),
      description: this.extractText(dom, selectors.description),
      category: this.extractText(dom, selectors.category || []),
      targetPopulation: this.extractText(dom, selectors.targetPopulation || []),
      administrationTime: this.extractNumber(dom, selectors.administrationTime || []),
      itemsCount: this.extractNumber(dom, selectors.itemsCount || []),
      copyrightInfo: this.extractText(dom, selectors.copyright || [])
    };
  }

  private extractText(dom: Document, selectors: string[]): string | undefined {
    for (const selector of selectors) {
      try {
        const element = dom.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      } catch (error) {
        console.warn(`选择器错误 ${selector}:`, error);
      }
    }
    return undefined;
  }

  private extractNumber(dom: Document, selectors: string[]): number | undefined {
    const text = this.extractText(dom, selectors);
    if (!text) return undefined;

    const numberMatch = text.match(/(\d+)/);
    return numberMatch ? parseInt(numberMatch[1]) : undefined;
  }
}

// 使用示例
export const DATA_SOURCES: DataSource[] = [
  {
    id: 'usecoa',
    name: 'UseCOA Platform',
    baseUrl: 'https://usecoa.com',
    type: 'academic',
    priority: 'high',
    rateLimit: 1, // 每秒1次请求
    respectRobots: true,
    userAgent: 'xCOA-Academic-Research-Bot/1.0',
    selectors: {
      name: ['.scale-name', 'h1.title', '[data-scale-name]'],
      acronym: ['.acronym', '.short-name', '[data-acronym]'],
      description: ['.description', '.summary', '.overview'],
      category: ['.category', '.classification'],
      targetPopulation: ['.target-population', '.applicable-to'],
      administrationTime: ['.admin-time', '.duration'],
      copyright: ['.copyright', '.author', '.developer']
    }
  },
  {
    id: 'chinecoa',
    name: 'ChineCOA Platform',
    baseUrl: 'https://chinecoa.com',
    type: 'academic',
    priority: 'high',
    rateLimit: 1,
    respectRobots: true,
    userAgent: 'xCOA-Academic-Research-Bot/1.0',
    selectors: {
      name: ['h1', '.scale-title', '.title'],
      acronym: ['.acronym', '.abbr'],
      description: ['.description', '.intro', '.summary'],
      category: ['.category', '.type'],
      targetPopulation: ['.population', '.适用人群'],
      administrationTime: ['.time', '.时长'],
      copyright: ['.copyright', '.版权']
    }
  }
];

// 模拟数据解析（实际应该使用真实的DOM解析）
export function simulateDataExtraction(sourceId: string): NormalizedScale[] {
  const mockData: Record<string, NormalizedScale[]> = {
    usecoa: [
      {
        name: 'Patient Health Questionnaire-9',
        nameEn: 'Patient Health Questionnaire-9',
        acronym: 'PHQ-9',
        description: 'A 9-item depression screening and severity measure based on DSM-IV criteria.',
        category: 'depression',
        targetPopulation: 'Adults',
        administrationTime: 5,
        itemsCount: 9,
        copyrightInfo: 'Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke',
        dataSource: 'usecoa.com',
        sourceUrl: 'https://usecoa.com/scales/phq-9',
        qualityScore: 0.95
      }
    ],
    chinecoa: [
      {
        name: '广泛性焦虑障碍量表-7',
        nameEn: 'Generalized Anxiety Disorder-7',
        acronym: 'GAD-7',
        description: '用于筛查和测量广泛性焦虑障碍严重程度的7项自评量表',
        category: 'anxiety',
        targetPopulation: '成年人',
        administrationTime: 3,
        itemsCount: 7,
        copyrightInfo: '由Spitzer等人开发',
        dataSource: 'chinecoa.com',
        sourceUrl: 'https://chinecoa.com/scales/gad-7',
        qualityScore: 0.88
      }
    ],
    mapi_trust: [
      {
        name: 'SF-36 Health Survey',
        nameEn: 'SF-36 Health Survey',
        acronym: 'SF-36',
        description: 'A 36-item health-related quality of life questionnaire.',
        category: 'quality_of_life',
        targetPopulation: 'General population and patients',
        administrationTime: 10,
        itemsCount: 36,
        copyrightInfo: 'QualityMetric Incorporated',
        dataSource: 'mapi-trust.org',
        sourceUrl: 'https://mapi-trust.org/scales/sf-36',
        qualityScore: 0.92
      }
    ]
  };

  return mockData[sourceId] || [];
}