import { db } from '@/db/drizzle';
import { userSubscription, userUsage, featureAccessLog } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { SubscriptionPlan, PLAN_LIMITS } from '@/types/subscription';
import { createId } from '@paralleldrive/cuid2';

// 获取用户订阅信息
export async function getUserSubscription(userId: string) {
  const subscription = await db
    .select()
    .from(userSubscription)
    .where(eq(userSubscription.userId, userId))
    .limit(1);

  if (!subscription.length) {
    // 如果没有订阅记录，创建免费订阅
    const newSubscription = {
      id: createId(),
      userId,
      plan: SubscriptionPlan.FREE,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(userSubscription).values(newSubscription);
    return newSubscription;
  }

  return subscription[0];
}

// 获取用户使用量
export async function getUserUsage(
  userId: string,
  type: 'search' | 'scale_view' | 'ai_interpretation' | 'api_call'
) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const usage = await db
    .select()
    .from(userUsage)
    .where(
      and(
        eq(userUsage.userId, userId),
        eq(userUsage.type, type),
        gte(userUsage.periodStart, startOfMonth),
        lte(userUsage.periodEnd, endOfMonth)
      )
    )
    .limit(1);

  if (!usage.length) {
    // 创建新的使用记录
    const newUsage = {
      id: createId(),
      userId,
      type,
      count: 0,
      periodStart: startOfMonth,
      periodEnd: endOfMonth,
      createdAt: new Date()
    };

    await db.insert(userUsage).values(newUsage);
    return newUsage;
  }

  return usage[0];
}

// 增加使用量
export async function incrementUsage(
  userId: string,
  type: 'search' | 'scale_view' | 'ai_interpretation' | 'api_call'
) {
  const usage = await getUserUsage(userId, type);

  await db
    .update(userUsage)
    .set({ count: usage.count + 1 })
    .where(eq(userUsage.id, usage.id));

  // 记录访问日志
  await db.insert(featureAccessLog).values({
    id: createId(),
    userId,
    feature: type,
    accessedAt: new Date()
  });

  return usage.count + 1;
}

// 检查功能访问权限
export async function checkFeatureAccess(
  userId: string,
  feature: 'search' | 'scale_view' | 'ai_interpretation' | 'api_call' | 'case_study' | 'data_export'
): Promise<{ allowed: boolean; reason?: string; requiresUpgrade?: SubscriptionPlan }> {
  const subscription = await getUserSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan as SubscriptionPlan];

  // 检查订阅状态
  if (subscription.status !== 'active') {
    return {
      allowed: false,
      reason: '您的订阅已暂停或取消，请续费后继续使用'
    };
  }

  // 检查特定功能权限
  if (feature === 'case_study' && !limits.caseStudyAccess) {
    return {
      allowed: false,
      reason: '案例库需要专业版或更高级别订阅',
      requiresUpgrade: SubscriptionPlan.PROFESSIONAL
    };
  }

  if (feature === 'data_export' && !limits.dataExport) {
    return {
      allowed: false,
      reason: '数据导出功能需要专业版或更高级别订阅',
      requiresUpgrade: SubscriptionPlan.PROFESSIONAL
    };
  }

  // 检查AI解读权限
  if (feature === 'ai_interpretation') {
    if (limits.aiInterpretations === 0) {
      return {
        allowed: false,
        reason: 'AI解读功能需要专业版或更高级别订阅',
        requiresUpgrade: SubscriptionPlan.PROFESSIONAL
      };
    }

    // 检查使用量
    const usage = await getUserUsage(userId, feature);
    if (limits.aiInterpretations !== null && usage.count >= limits.aiInterpretations) {
      return {
        allowed: false,
        reason: `本月AI解读次数已达上限（${limits.aiInterpretations}次）`,
        requiresUpgrade: SubscriptionPlan.ADVANCED
      };
    }
  }

  // 检查使用量限制的功能
  const usageLimitedFeatures = ['search', 'scale_view', 'api_call'];
  if (usageLimitedFeatures.includes(feature)) {
    const limitKey = `${feature === 'scale_view' ? 'scaleViews' : feature}sPerMonth` as keyof typeof limits;
    const limit = limits[limitKey] as number | null;

    if (limit !== null) {
      const usage = await getUserUsage(userId, feature as any);
      if (usage.count >= limit) {
        const featureNames = {
          'search': '搜索',
          'scale_view': '量表查看',
          'api_call': 'API调用'
        };

        return {
          allowed: false,
          reason: `本月${featureNames[feature as keyof typeof featureNames]}次数已达上限（${limit}次）`,
          requiresUpgrade: feature === 'search' ? SubscriptionPlan.PROFESSIONAL :
                          feature === 'scale_view' ? SubscriptionPlan.ADVANCED :
                          SubscriptionPlan.ADVANCED
        };
      }
    }
  }

  return { allowed: true };
}

// 获取用户的所有使用量统计
export async function getUserUsageStats(userId: string) {
  const subscription = await getUserSubscription(userId);
  const limits = PLAN_LIMITS[subscription.plan as SubscriptionPlan];

  const [searchUsage, scaleViewUsage, aiUsage, apiUsage] = await Promise.all([
    getUserUsage(userId, 'search'),
    getUserUsage(userId, 'scale_view'),
    getUserUsage(userId, 'ai_interpretation'),
    getUserUsage(userId, 'api_call')
  ]);

  return {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    usage: {
      searches: {
        used: searchUsage.count,
        limit: limits.searchesPerMonth
      },
      scaleViews: {
        used: scaleViewUsage.count,
        limit: limits.scaleViewsPerMonth
      },
      aiInterpretations: {
        used: aiUsage.count,
        limit: limits.aiInterpretations
      },
      apiCalls: {
        used: apiUsage.count,
        limit: limits.apiCallsPerMonth
      }
    },
    features: {
      caseStudyAccess: limits.caseStudyAccess,
      dataExport: limits.dataExport,
      pdfWatermark: limits.pdfWatermark,
      copyrightAssistance: limits.copyrightAssistance,
      teamMembers: limits.teamMembers,
      supportLevel: limits.supportLevel
    }
  };
}

// 更新用户订阅
export async function updateUserSubscription(
  userId: string,
  plan: SubscriptionPlan,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
) {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(userSubscription)
    .set({
      plan,
      stripeSubscriptionId,
      stripeCustomerId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      status: 'active',
      updatedAt: now
    })
    .where(eq(userSubscription.userId, userId));

  // 重置使用量（升级时）
  if (plan !== SubscriptionPlan.FREE) {
    await resetUserUsage(userId);
  }
}

// 取消订阅
export async function cancelUserSubscription(userId: string, cancelAtPeriodEnd: boolean = true) {
  if (cancelAtPeriodEnd) {
    // 在周期结束时取消
    await db
      .update(userSubscription)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      })
      .where(eq(userSubscription.userId, userId));
  } else {
    // 立即取消并降级到免费版
    await db
      .update(userSubscription)
      .set({
        plan: SubscriptionPlan.FREE,
        status: 'canceled',
        stripeSubscriptionId: null,
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      })
      .where(eq(userSubscription.userId, userId));
  }
}

// 重置用户使用量
export async function resetUserUsage(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await db
    .update(userUsage)
    .set({
      count: 0,
      periodStart: startOfMonth,
      periodEnd: endOfMonth
    })
    .where(eq(userUsage.userId, userId));
}