'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserUsageStats } from '@/services/subscription';
import { SubscriptionPlan, PLAN_LIMITS } from '@/types/subscription';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SubscriptionStatus {
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd: Date;
  usage: {
    searches: { used: number; limit: number | null };
    scaleViews: { used: number; limit: number | null };
    aiInterpretations: { used: number; limit: number | null };
    apiCalls: { used: number; limit: number | null };
  };
  features: {
    caseStudyAccess: boolean;
    dataExport: boolean;
    pdfWatermark: boolean;
    copyrightAssistance: boolean;
    teamMembers: number | null;
    supportLevel: string;
  };
  loading: boolean;
  error: string | null;
}

const defaultStatus: SubscriptionStatus = {
  plan: SubscriptionPlan.FREE,
  status: 'active',
  currentPeriodEnd: new Date(),
  usage: {
    searches: { used: 0, limit: 30 },
    scaleViews: { used: 0, limit: 5 },
    aiInterpretations: { used: 0, limit: 0 },
    apiCalls: { used: 0, limit: 0 }
  },
  features: {
    caseStudyAccess: false,
    dataExport: false,
    pdfWatermark: true,
    copyrightAssistance: false,
    teamMembers: 1,
    supportLevel: 'community'
  },
  loading: true,
  error: null
};

export function useSubscription() {
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(defaultStatus);

  // 获取订阅状态
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setSubscriptionStatus(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/subscription/status');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      setSubscriptionStatus({
        ...data,
        currentPeriodEnd: new Date(data.currentPeriodEnd),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscriptionStatus(prev => ({
        ...prev,
        loading: false,
        error: '获取订阅状态失败'
      }));
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // 检查功能权限
  const checkFeatureAccess = useCallback(
    async (feature: 'search' | 'scale_view' | 'ai_interpretation' | 'api_call' | 'case_study' | 'data_export') => {
      try {
        const response = await fetch('/api/subscription/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature })
        });

        const result = await response.json();

        if (!result.allowed) {
          // 显示升级提示
          toast.error(result.reason || '此功能需要升级订阅', {
            action: {
              label: '查看升级选项',
              onClick: () => router.push('/pricing')
            }
          });

          return false;
        }

        return true;
      } catch (error) {
        console.error('Error checking feature access:', error);
        toast.error('权限检查失败，请稍后重试');
        return false;
      }
    },
    [router]
  );

  // 检查是否接近限制
  const isNearLimit = useCallback((feature: 'searches' | 'scaleViews' | 'aiInterpretations' | 'apiCalls') => {
    const usage = subscriptionStatus.usage[feature];
    if (usage.limit === null) return false;
    return usage.used >= usage.limit * 0.8;
  }, [subscriptionStatus]);

  // 检查是否已达限制
  const hasReachedLimit = useCallback((feature: 'searches' | 'scaleViews' | 'aiInterpretations' | 'apiCalls') => {
    const usage = subscriptionStatus.usage[feature];
    if (usage.limit === null) return false;
    return usage.used >= usage.limit;
  }, [subscriptionStatus]);

  // 获取剩余使用量
  const getRemainingUsage = useCallback((feature: 'searches' | 'scaleViews' | 'aiInterpretations' | 'apiCalls') => {
    const usage = subscriptionStatus.usage[feature];
    if (usage.limit === null) return null;
    return Math.max(0, usage.limit - usage.used);
  }, [subscriptionStatus]);

  // 获取使用百分比
  const getUsagePercentage = useCallback((feature: 'searches' | 'scaleViews' | 'aiInterpretations' | 'apiCalls') => {
    const usage = subscriptionStatus.usage[feature];
    if (usage.limit === null) return 0;
    return Math.min(100, (usage.used / usage.limit) * 100);
  }, [subscriptionStatus]);

  // 判断是否可以使用某个功能
  const canUseFeature = useCallback((feature: keyof typeof subscriptionStatus.features) => {
    if (feature === 'teamMembers') {
      return subscriptionStatus.features[feature] !== null && subscriptionStatus.features[feature] > 1;
    }
    return subscriptionStatus.features[feature as keyof typeof subscriptionStatus.features];
  }, [subscriptionStatus]);

  // 升级订阅
  const upgradeToPlan = useCallback(async (plan: SubscriptionPlan, isYearly: boolean = false) => {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlan: plan, billingPeriod: isYearly ? 'yearly' : 'monthly' })
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('升级失败，请稍后重试');
    }
  }, []);

  // 取消订阅
  const cancelSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('订阅已取消，将在当前计费周期结束后生效');
        fetchSubscriptionStatus();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('取消订阅失败，请稍后重试');
    }
  }, [fetchSubscriptionStatus]);

  return {
    ...subscriptionStatus,
    checkFeatureAccess,
    isNearLimit,
    hasReachedLimit,
    getRemainingUsage,
    getUsagePercentage,
    canUseFeature,
    upgradeToPlan,
    cancelSubscription,
    refreshStatus: fetchSubscriptionStatus
  };
}