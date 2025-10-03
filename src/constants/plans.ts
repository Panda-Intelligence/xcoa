export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  ENTERPRISE: 'enterprise',
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

export const PLAN_FEATURES = {
  [SUBSCRIPTION_PLANS.FREE]: {
    name: '免费版',
    nameEn: 'Free',
    price: 0,
    priceYearly: 0,
    features: [
      '量表搜索和浏览',
      '收藏量表',
      '基础量表信息查看',
      '每月免费积分',
    ],
    featuresEn: [
      'Scale search and browse',
      'Favorite scales',
      'Basic scale information',
      'Monthly free credits',
    ],
    limits: {
      scalePreview: false,
      scaleCopyright: false,
      scaleInterpretation: false,
      monthlyCredits: 100,
    },
  },
  [SUBSCRIPTION_PLANS.STARTER]: {
    name: '专业版',
    nameEn: 'Starter',
    price: 499,
    priceYearly: 4990,
    features: [
      '免费版所有功能',
      '量表交互式预览',
      '多设备预览支持',
      '更多月度积分',
      '优先客服支持',
    ],
    featuresEn: [
      'All Free features',
      'Interactive scale preview',
      'Multi-device preview support',
      'More monthly credits',
      'Priority support',
    ],
    limits: {
      scalePreview: true,
      scaleCopyright: false,
      scaleInterpretation: false,
      monthlyCredits: 2000,
    },
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    name: '企业版',
    nameEn: 'Enterprise',
    price: 1299,
    priceYearly: 12990,
    features: [
      '入门版所有功能',
      '量表版权信息查看',
      '版权许可工单申请',
      '量表专业解读',
      '无限积分',
      '团队协作',
      '定制化服务',
      'API 访问',
    ],
    featuresEn: [
      'All Starter features',
      'Scale copyright information',
      'Copyright licensing tickets',
      'Professional scale interpretation',
      'Unlimited credits',
      'Team collaboration',
      'Custom services',
      'API access',
    ],
    limits: {
      scalePreview: true,
      scaleCopyright: true,
      scaleInterpretation: true,
      monthlyCredits: -1, // unlimited
      maxTeamMembers: -1, // unlimited
      apiAccess: true,
    },
  },
} as const;

export function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

export function formatYearlyPrice(yearlyPrice: number): string {
  const monthlySavings = Math.round((yearlyPrice / 10) - (yearlyPrice / 12));
  return `$${yearlyPrice.toLocaleString()} (省 $${monthlySavings})`;
}

export const ENTERPRISE_FEATURES = {
  SCALE_PREVIEW: 'scale_preview',
  SCALE_INTERACTIVE: 'scale_interactive',
  COPYRIGHT_VIEW: 'copyright_view',
  COPYRIGHT_TICKET: 'copyright_ticket',
  SCALE_INTERPRETATION: 'scale_interpretation',
} as const;

export type EnterpriseFeature = typeof ENTERPRISE_FEATURES[keyof typeof ENTERPRISE_FEATURES];

export const FEATURE_PLAN_REQUIREMENTS: Record<EnterpriseFeature, SubscriptionPlan[]> = {
  [ENTERPRISE_FEATURES.SCALE_PREVIEW]: [SUBSCRIPTION_PLANS.STARTER, SUBSCRIPTION_PLANS.ENTERPRISE],
  [ENTERPRISE_FEATURES.SCALE_INTERACTIVE]: [SUBSCRIPTION_PLANS.STARTER, SUBSCRIPTION_PLANS.ENTERPRISE],
  [ENTERPRISE_FEATURES.COPYRIGHT_VIEW]: [SUBSCRIPTION_PLANS.ENTERPRISE],
  [ENTERPRISE_FEATURES.COPYRIGHT_TICKET]: [SUBSCRIPTION_PLANS.ENTERPRISE],
  [ENTERPRISE_FEATURES.SCALE_INTERPRETATION]: [SUBSCRIPTION_PLANS.ENTERPRISE],
};

export function getFeatureRequiredPlan(feature: EnterpriseFeature): SubscriptionPlan {
  const plans = FEATURE_PLAN_REQUIREMENTS[feature];
  return plans[0];
}

export function isFeatureAvailable(userPlan: SubscriptionPlan | null | undefined, feature: EnterpriseFeature): boolean {
  if (!userPlan) {
    userPlan = SUBSCRIPTION_PLANS.FREE;
  }
  
  const requiredPlans = FEATURE_PLAN_REQUIREMENTS[feature];
  return requiredPlans.includes(userPlan);
}

export function getPlanLevel(plan: SubscriptionPlan): number {
  switch (plan) {
    case SUBSCRIPTION_PLANS.FREE:
      return 0;
    case SUBSCRIPTION_PLANS.STARTER:
      return 1;
    case SUBSCRIPTION_PLANS.ENTERPRISE:
      return 2;
    default:
      return 0;
  }
}

export function canUpgradeTo(currentPlan: SubscriptionPlan | null | undefined, targetPlan: SubscriptionPlan): boolean {
  const currentLevel = getPlanLevel(currentPlan || SUBSCRIPTION_PLANS.FREE);
  const targetLevel = getPlanLevel(targetPlan);
  return targetLevel > currentLevel;
}
