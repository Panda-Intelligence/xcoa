# SaaS订阅功能开发实施计划

## 一、订阅等级设计

### 1.1 订阅层级定义

| 功能 | 免费版 | 专业版 | 高级版 | 企业版 |
|-----|--------|--------|--------|--------|
| **价格** | ¥0 | ¥299/月 | ¥899/月 | ¥2999+/月 |
| **搜索** | 30次/月 | 无限 | 无限 | 无限 |
| **量表详情** | 5个/月 | 100个/月 | 无限 | 无限 |
| **AI解读** | ❌ | 20次/月 | 100次/月 | 无限 |
| **案例库** | ❌ | ✅ | ✅ | ✅ |
| **PDF导出** | 带水印 | 无水印 | 无水印 | 无水印 |
| **数据导出** | ❌ | CSV/Excel | CSV/Excel | CSV/Excel |
| **API接入** | ❌ | ❌ | 10000次/月 | 无限 |
| **团队协作** | 1人 | 1人 | 5人 | 无限 |
| **版权申请** | ❌ | ❌ | ❌ | ✅ |
| **支持** | 社区 | 邮件 | 优先 | 专属客服 |

### 1.2 功能权限代码定义

```typescript
// src/types/subscription.ts
export enum SubscriptionPlan {
  FREE = 'free',
  PROFESSIONAL = 'professional',
  ADVANCED = 'advanced',
  ENTERPRISE = 'enterprise'
}

export interface PlanLimits {
  searchesPerMonth: number | null;      // null = 无限
  scaleViewsPerMonth: number | null;
  aiInterpretations: number | null;
  caseStudyAccess: boolean;
  pdfWatermark: boolean;
  dataExport: boolean;
  apiCallsPerMonth: number | null;
  teamMembers: number | null;
  copyrightAssistance: boolean;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

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
```

## 二、数据库设计

### 2.1 用户订阅表

```sql
-- 用户订阅表
CREATE TABLE user_subscription (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, paused
  currentPeriodStart TIMESTAMP,
  currentPeriodEnd TIMESTAMP,
  cancelAtPeriodEnd BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id)
);

-- 用户使用量追踪表
CREATE TABLE user_usage (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL, -- search, scale_view, ai_interpretation, api_call
  count INTEGER DEFAULT 0,
  periodStart TIMESTAMP,
  periodEnd TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id),
  UNIQUE(userId, type, periodStart)
);

-- 功能访问日志表
CREATE TABLE feature_access_log (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  feature TEXT NOT NULL,
  accessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON格式的额外信息
  FOREIGN KEY (userId) REFERENCES user(id)
);
```

## 三、核心功能实现

### 3.1 权限检查中间件

```typescript
// src/middleware/subscription.ts
import { getUserSubscription, getUserUsage, incrementUsage } from '@/services/subscription';
import { PLAN_LIMITS } from '@/types/subscription';

export async function checkFeatureAccess(
  userId: string,
  feature: 'search' | 'scale_view' | 'ai_interpretation' | 'api_call'
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getUserSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan];

  // 检查功能是否可用
  if (feature === 'ai_interpretation' && limits.aiInterpretations === 0) {
    return {
      allowed: false,
      reason: '您的订阅计划不包含AI解读功能'
    };
  }

  // 检查使用量限制
  const usage = await getUserUsage(userId, feature);
  const limitKey = `${feature}sPerMonth` as keyof typeof limits;
  const limit = limits[limitKey];

  if (limit !== null && usage.count >= limit) {
    return {
      allowed: false,
      reason: `本月${getFeatureName(feature)}次数已达上限（${limit}次）`
    };
  }

  // 记录使用
  await incrementUsage(userId, feature);

  return { allowed: true };
}

function getFeatureName(feature: string): string {
  const names = {
    'search': '搜索',
    'scale_view': '量表查看',
    'ai_interpretation': 'AI解读',
    'api_call': 'API调用'
  };
  return names[feature] || feature;
}
```

### 3.2 升级引导组件

```typescript
// src/components/subscription/UpgradePrompt.tsx
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  feature: string;
  currentPlan: string;
  requiredPlan: string;
}

export function UpgradePrompt({ feature, currentPlan, requiredPlan }: UpgradePromptProps) {
  const router = useRouter();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">
        升级以解锁 {feature}
      </h3>
      <p className="text-gray-600 mb-4">
        此功能需要 {requiredPlan} 或更高级别的订阅计划
      </p>
      <div className="space-x-3">
        <Button
          onClick={() => router.push('/pricing')}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          查看升级选项
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    </div>
  );
}
```

### 3.3 使用量显示组件

```typescript
// src/components/subscription/UsageIndicator.tsx
import { Progress } from '@/components/ui/progress';

interface UsageIndicatorProps {
  used: number;
  limit: number | null;
  label: string;
}

export function UsageIndicator({ used, limit, label }: UsageIndicatorProps) {
  if (limit === null) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">无限制</span>
      </div>
    );
  }

  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-medium ${isNearLimit ? 'text-orange-500' : ''}`}>
          {used} / {limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={isNearLimit ? 'bg-orange-100' : ''}
      />
    </div>
  );
}
```

## 四、Stripe集成配置

### 4.1 产品和价格设置

```typescript
// scripts/setup-stripe-products.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function setupProducts() {
  // 创建产品
  const product = await stripe.products.create({
    name: 'OpeneCOA订阅',
    description: 'eCOA量表搜索与解读平台订阅服务',
  });

  // 创建价格计划
  const plans = [
    { name: '专业版', amount: 29900, metadata: { plan: 'professional' } },
    { name: '高级版', amount: 89900, metadata: { plan: 'advanced' } },
    { name: '企业版', amount: 299900, metadata: { plan: 'enterprise' } },
  ];

  for (const plan of plans) {
    await stripe.prices.create({
      product: product.id,
      unit_amount: plan.amount,
      currency: 'cny',
      recurring: { interval: 'month' },
      nickname: plan.name,
      metadata: plan.metadata,
    });
  }
}
```

### 4.2 Webhook处理

```typescript
// src/app/api/stripe/webhook/route.ts
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancel(event.data.object);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

## 五、开发时间线

### Phase 1: 基础架构（Week 1）
- [ ] Day 1-2: 数据库表设计和创建
- [ ] Day 3-4: 订阅类型定义和权限系统
- [ ] Day 5: 使用量追踪服务开发

### Phase 2: 核心功能（Week 2）
- [ ] Day 1-2: 权限检查中间件实现
- [ ] Day 3-4: 升级引导和限制提示组件
- [ ] Day 5: 使用量显示和管理页面

### Phase 3: 支付集成（Week 3）
- [ ] Day 1-2: Stripe产品和价格配置
- [ ] Day 3-4: Checkout流程实现
- [ ] Day 5: Webhook处理和订阅同步

### Phase 4: 优化完善（Week 4）
- [ ] Day 1-2: 订阅管理仪表板
- [ ] Day 3: 发票和账单历史
- [ ] Day 4: 测试和bug修复
- [ ] Day 5: 文档和部署

## 六、关键API接口

### 6.1 获取用户订阅状态
```typescript
// GET /api/subscription/status
{
  "plan": "professional",
  "status": "active",
  "currentPeriodEnd": "2025-11-15",
  "usage": {
    "searches": { "used": 15, "limit": null },
    "scaleViews": { "used": 45, "limit": 100 },
    "aiInterpretations": { "used": 8, "limit": 20 }
  }
}
```

### 6.2 创建升级Checkout Session
```typescript
// POST /api/subscription/upgrade
{
  "targetPlan": "advanced",
  "billingPeriod": "monthly"
}

// Response
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

## 七、监控指标

### 7.1 关键业务指标
- 免费到付费转化率
- 各订阅层级分布
- 月度经常性收入（MRR）
- 客户生命周期价值（LTV）
- 流失率（Churn Rate）

### 7.2 使用量指标
- 各功能使用频率
- 达到限制的用户比例
- 升级触发点分析
- API调用分布

## 八、测试计划

### 8.1 功能测试
- [ ] 免费用户限制测试
- [ ] 付费用户权限测试
- [ ] 使用量计算准确性
- [ ] 升级/降级流程
- [ ] 支付失败处理

### 8.2 性能测试
- [ ] 权限检查响应时间
- [ ] 使用量查询性能
- [ ] 并发用户测试

## 九、部署检查清单

- [ ] Stripe产品和价格配置完成
- [ ] Webhook端点配置并验证
- [ ] 环境变量设置（Stripe密钥等）
- [ ] 数据库迁移执行
- [ ] 监控告警设置
- [ ] 用户文档更新
- [ ] 客服培训材料准备

---

*文档版本: v1.0*
*创建日期: 2025-10-15*
*预计完成: 2025-11-15*