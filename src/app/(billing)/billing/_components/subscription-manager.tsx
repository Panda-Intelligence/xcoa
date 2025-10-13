'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { PricingPlans } from '@/components/subscription/pricing-plans';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import type { SubscriptionPlan } from '@/constants/plans';
import { SUBSCRIPTION_PLANS, PLAN_FEATURES, getPlanDisplayName } from '@/constants/plans';

interface UserSubscriptionInfo {
  planId: SubscriptionPlan | null;
  planExpiresAt: Date | null;
  isActive: boolean;
  teamId: string | null;
  teamName: string | null;
}

export function SubscriptionManager() {
  const { language } = useLanguage();
  const toast = useToast();
  const isZh = language === 'zh';
  
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscriptionInfo | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current');
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      toast.error(isZh ? '加载订阅信息失败' : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: SubscriptionPlan, billingInterval: 'monthly' | 'yearly' = 'monthly') => {
    if (plan === SUBSCRIPTION_PLANS.FREE) {
      toast.error(isZh ? '暂不支持降级到免费版' : 'Downgrade to Free not supported yet');
      return;
    }

    if (!subscription?.teamId) {
      toast.error(isZh ? '未找到团队信息' : 'Team information not found');
      return;
    }

    try {
      toast.info(isZh ? '正在创建订阅会话...' : 'Creating checkout session...');
      
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan,
          billingInterval,
          teamId: subscription.teamId,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || (isZh ? '创建订阅会话失败' : 'Failed to create checkout session'));
      }
    } catch (error) {
      console.error('Subscription checkout error:', error);
      toast.error(isZh ? '订阅失败，请重试' : 'Subscription failed, please retry');
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.teamId) {
      toast.error(isZh ? '未找到团队信息' : 'Team information not found');
      return;
    }

    try {
      toast.info(isZh ? '正在打开订阅管理门户...' : 'Opening subscription portal...');
      
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: subscription.teamId,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else if (data.error === 'Portal not configured') {
        toast.error(
          isZh 
            ? '客户管理门户未配置。请联系管理员配置 Stripe 客户门户。' 
            : 'Customer portal not configured. Please contact admin to set up Stripe customer portal.'
        );
        if (data.configUrl) {
          console.log('Configure portal at:', data.configUrl);
        }
      } else {
        toast.error(data.message || (isZh ? '打开管理门户失败' : 'Failed to open portal'));
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error(isZh ? '打开管理门户失败，请重试' : 'Failed to open portal, please retry');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">
            {isZh ? '加载中...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.planId || SUBSCRIPTION_PLANS.FREE;
  const planDetails = PLAN_FEATURES[currentPlan];
  const isExpired = subscription?.planExpiresAt && new Date(subscription.planExpiresAt) < new Date();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isZh ? '订阅管理' : 'Subscription Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isZh ? '管理您的订阅计划和账单' : 'Manage your subscription plan and billing'}
          </p>
        </div>
      </div>

      {/* Current Plan Overview */}
      {!showPricing && (
        <>
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                    currentPlan === SUBSCRIPTION_PLANS.ENTERPRISE
                      ? 'from-purple-500 to-pink-500'
                      : currentPlan === SUBSCRIPTION_PLANS.STARTER
                      ? 'from-blue-500 to-cyan-500'
                      : 'from-gray-400 to-gray-500'
                  } flex items-center justify-center text-white`}>
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {isZh ? planDetails.name : planDetails.nameEn}
                    </CardTitle>
                    <CardDescription>
                      {isZh ? '当前订阅计划' : 'Current subscription plan'}
                    </CardDescription>
                  </div>
                </div>
                
                {subscription?.isActive && !isExpired ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {isZh ? '有效' : 'Active'}
                  </Badge>
                ) : isExpired ? (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {isZh ? '已过期' : 'Expired'}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {isZh ? '免费版' : 'Free'}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {isZh ? '订阅状态' : 'Status'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.planExpiresAt
                        ? new Date(subscription.planExpiresAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')
                        : (isZh ? '永久有效' : 'Permanent')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {isZh ? '月度积分' : 'Monthly Credits'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {planDetails.limits.monthlyCredits === -1
                        ? (isZh ? '无限' : 'Unlimited')
                        : planDetails.limits.monthlyCredits.toLocaleString()}
                    </p>
                  </div>
                </div>

                {subscription?.teamName && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {isZh ? '团队' : 'Team'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.teamName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">
                  {isZh ? '包含功能' : 'Included Features'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(isZh ? planDetails.features : planDetails.featuresEn).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {currentPlan === SUBSCRIPTION_PLANS.FREE && (
                  <Button onClick={() => setShowPricing(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 after:shadow-none">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {isZh ? '升级订阅' : 'Upgrade Now'}
                  </Button>
                )}
                {currentPlan === SUBSCRIPTION_PLANS.STARTER && (
                  <Button onClick={() => setShowPricing(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 after:shadow-none">
                    <Crown className="w-4 h-4 mr-2" />
                    {isZh ? '升级到企业版' : 'Upgrade to Enterprise'}
                  </Button>
                )}
                {currentPlan !== SUBSCRIPTION_PLANS.FREE && subscription?.isActive && !isExpired && (
                  <>
                    <Button variant="outline" onClick={handleManageSubscription}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isZh ? '管理订阅' : 'Manage Subscription'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowPricing(true)}>
                      {isZh ? '查看所有计划' : 'View All Plans'}
                    </Button>
                  </>
                )}
              </div>

              {/* Expiry Warning */}
              {isExpired && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {isZh 
                      ? '您的订阅已过期。请续订以继续使用高级功能。' 
                      : 'Your subscription has expired. Please renew to continue using premium features.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Recommendation */}
          {currentPlan !== SUBSCRIPTION_PLANS.ENTERPRISE && (
            <Card className="border-dashed border-2 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {isZh ? '解锁所有功能' : 'Unlock All Features'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isZh 
                        ? '升级到企业版，获取版权管理、专业解读等高级功能' 
                        : 'Upgrade to Enterprise for copyright management, professional interpretations and more'}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowPricing(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 after:shadow-none">
                  {isZh ? '了解更多' : 'Learn More'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Pricing Plans */}
      {showPricing && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {isZh ? '选择订阅计划' : 'Choose Your Plan'}
            </h2>
            <Button variant="outline" onClick={() => setShowPricing(false)}>
              {isZh ? '返回' : 'Back'}
            </Button>
          </div>
          
          <PricingPlans 
            currentPlan={currentPlan}
            onSelectPlan={handlePlanSelect}
          />
        </div>
      )}
    </div>
  );
}
