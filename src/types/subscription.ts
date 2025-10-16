// 订阅计划类型定义
export enum SubscriptionPlan {
  FREE = 'free',
  PROFESSIONAL = 'professional',
  ADVANCED = 'advanced',
  ENTERPRISE = 'enterprise'
}

// 计划限制接口
export interface PlanLimits {
  searchesPerMonth: number | null;      // null = 无限
  scaleViewsPerMonth: number | null;    // 量表详情查看次数
  aiInterpretations: number | null;     // AI解读次数
  caseStudyAccess: boolean;             // 案例库访问
  pdfWatermark: boolean;                // PDF是否带水印
  dataExport: boolean;                  // 数据导出功能
  apiCallsPerMonth: number | null;      // API调用次数
  teamMembers: number | null;           // 团队成员数
  copyrightAssistance: boolean;         // 版权申请协助
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

// 各计划的限制配置
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    searchesPerMonth: 30,
    scaleViewsPerMonth: 5,
    aiInterpretations: 0,
    caseStudyAccess: false,
    pdfWatermark: true,
    dataExport: false,
    apiCallsPerMonth: 0,
    teamMembers: 1,
    copyrightAssistance: false,
    supportLevel: 'community'
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    searchesPerMonth: null,
    scaleViewsPerMonth: 100,
    aiInterpretations: 20,
    caseStudyAccess: true,
    pdfWatermark: false,
    dataExport: true,
    apiCallsPerMonth: 0,
    teamMembers: 1,
    copyrightAssistance: false,
    supportLevel: 'email'
  },
  [SubscriptionPlan.ADVANCED]: {
    searchesPerMonth: null,
    scaleViewsPerMonth: null,
    aiInterpretations: 100,
    caseStudyAccess: true,
    pdfWatermark: false,
    dataExport: true,
    apiCallsPerMonth: 10000,
    teamMembers: 5,
    copyrightAssistance: false,
    supportLevel: 'priority'
  },
  [SubscriptionPlan.ENTERPRISE]: {
    searchesPerMonth: null,
    scaleViewsPerMonth: null,
    aiInterpretations: null,
    caseStudyAccess: true,
    pdfWatermark: false,
    dataExport: true,
    apiCallsPerMonth: null,
    teamMembers: null,
    copyrightAssistance: true,
    supportLevel: 'dedicated'
  }
};

// 计划定价信息
export const PLAN_PRICING = {
  [SubscriptionPlan.FREE]: {
    monthly: 0,
    yearly: 0,
    name: '免费版',
    badge: null
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    monthly: 299,
    yearly: 2990, // 年付10个月价格
    name: '专业版',
    badge: null
  },
  [SubscriptionPlan.ADVANCED]: {
    monthly: 899,
    yearly: 8990,
    name: '高级版',
    badge: '最受欢迎'
  },
  [SubscriptionPlan.ENTERPRISE]: {
    monthly: 2999,
    yearly: 29990,
    name: '企业版',
    badge: null
  }
};

// 功能描述
export const PLAN_FEATURES = {
  [SubscriptionPlan.FREE]: [
    '每月30次搜索',
    '5个量表详情查看/月',
    '基础筛选功能',
    '社区支持',
    '带水印PDF导出'
  ],
  [SubscriptionPlan.PROFESSIONAL]: [
    '无限搜索',
    '100个量表详情/月',
    'AI解读功能（20次/月）',
    '案例库访问',
    '无水印PDF导出',
    '数据导出（CSV/Excel）',
    '邮件支持'
  ],
  [SubscriptionPlan.ADVANCED]: [
    '专业版所有功能',
    '无限量表详情查看',
    'AI解读功能（100次/月）',
    'API接入（10000次/月）',
    '批量导出',
    '优先支持',
    '团队协作（5个成员）'
  ],
  [SubscriptionPlan.ENTERPRISE]: [
    '高级版所有功能',
    '无限AI解读',
    'API接入（无限制）',
    '专属客服',
    '版权申请协助',
    '定制化报告',
    '无限团队成员',
    'SLA保障'
  ]
};

// Stripe产品ID映射
export const STRIPE_PRICE_IDS = {
  [SubscriptionPlan.PROFESSIONAL]: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL_YEARLY
  },
  [SubscriptionPlan.ADVANCED]: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVANCED_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVANCED_YEARLY
  },
  [SubscriptionPlan.ENTERPRISE]: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY
  }
};