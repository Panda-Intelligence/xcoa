import { SubscriptionPlan } from '../helpers/subscription-helper';

// Mock用户数据
export const mockUsers = {
  // 免费用户
  freeUser: {
    email: 'free@test.com',
    password: 'test123',
    plan: SubscriptionPlan.FREE,
    usage: {
      searches: 10,
      scaleViews: 2,
      aiInterpretations: 0,
      apiCalls: 0
    }
  },

  // 专业版用户
  professionalUser: {
    email: 'pro@test.com',
    password: 'test123',
    plan: SubscriptionPlan.PROFESSIONAL,
    apiKey: 'test_pro_api_key',
    usage: {
      searches: 150, // 无限制
      scaleViews: 45,
      aiInterpretations: 8,
      apiCalls: 0
    }
  },

  // 高级版用户
  advancedUser: {
    email: 'advanced@test.com',
    password: 'test123',
    plan: SubscriptionPlan.ADVANCED,
    apiKey: 'test_advanced_api_key',
    usage: {
      searches: 300, // 无限制
      scaleViews: 200, // 无限制
      aiInterpretations: 45,
      apiCalls: 3500
    }
  },

  // 企业版用户
  enterpriseUser: {
    email: 'enterprise@test.com',
    password: 'test123',
    plan: SubscriptionPlan.ENTERPRISE,
    apiKey: 'test_enterprise_api_key',
    usage: {
      searches: 1000, // 无限制
      scaleViews: 500, // 无限制
      aiInterpretations: 200, // 无限制
      apiCalls: 50000 // 无限制
    }
  },

  // 接近限制的用户（80%使用量）
  nearLimitUser: {
    email: 'nearlimit@test.com',
    password: 'test123',
    plan: SubscriptionPlan.FREE,
    usage: {
      searches: 24, // 80% of 30
      scaleViews: 4, // 80% of 5
      aiInterpretations: 0,
      apiCalls: 0
    }
  },

  // 达到限制的用户
  limitReachedUser: {
    email: 'limitreached@test.com',
    password: 'test123',
    plan: SubscriptionPlan.FREE,
    usage: {
      searches: 30, // 100% of 30
      scaleViews: 5, // 100% of 5
      aiInterpretations: 0,
      apiCalls: 0
    }
  }
};

// Mock量表数据
export const mockScales = {
  phq9: {
    id: 'scale_phq9',
    name: '患者健康问卷-9',
    nameEn: 'Patient Health Questionnaire-9',
    acronym: 'PHQ-9',
    description: '用于筛查、诊断、监测和衡量抑郁症严重程度的多用途工具',
    itemsCount: 9,
    administrationTime: 5,
    categoryId: 'cat_mental_health',
    categoryName: '心理健康',
    validationStatus: 'published',
    copyrightInfo: '公共领域，免费使用',
    items: [
      {
        id: 'item_phq9_1',
        itemNumber: 1,
        question: '做事时提不起劲或没有兴趣',
        questionEn: 'Little interest or pleasure in doing things',
        responseOptions: ['完全不会', '好几天', '一半以上的天数', '几乎每天']
      },
      // ... 其他题目
    ]
  },

  gad7: {
    id: 'scale_gad7',
    name: '广泛性焦虑障碍量表-7',
    nameEn: 'Generalized Anxiety Disorder-7',
    acronym: 'GAD-7',
    description: '用于筛查广泛性焦虑障碍的简短自评工具',
    itemsCount: 7,
    administrationTime: 3,
    categoryId: 'cat_mental_health',
    categoryName: '心理健康',
    validationStatus: 'published',
    copyrightInfo: '需要许可',
    items: []
  }
};

// Mock订阅计划数据
export const mockPlans = {
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

// Mock Stripe事件
export const mockStripeEvents = {
  checkoutCompleted: {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        customer_email: 'test@example.com',
        subscription: 'sub_test_123',
        metadata: {
          plan: 'professional'
        }
      }
    }
  },

  subscriptionUpdated: {
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        items: {
          data: [{
            price: {
              metadata: {
                plan: 'advanced'
              }
            }
          }]
        }
      }
    }
  },

  subscriptionDeleted: {
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123'
      }
    }
  },

  paymentFailed: {
    type: 'invoice.payment_failed',
    data: {
      object: {
        subscription: 'sub_test_123',
        customer: 'cus_test_123'
      }
    }
  }
};