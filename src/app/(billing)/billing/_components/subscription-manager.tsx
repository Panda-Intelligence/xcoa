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
  const { t, language } = useLanguage();
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
      toast.error(t('billing.failed_to_load_subscription'));
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: SubscriptionPlan, billingInterval: 'monthly' | 'yearly' = 'monthly') => {
    if (plan === SUBSCRIPTION_PLANS.FREE) {
      toast.error(t('billing.downgrade_not_supported'));
      return;
    }

    if (!subscription?.teamId) {
      toast.error(t('billing.team_info_not_found'));
      return;
    }

    try {
      toast.info(t('billing.creating_checkout_session'));

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
        toast.error(data.message || t('billing.failed_to_create_checkout'));
      }
    } catch (error) {
      console.error('Subscription checkout error:', error);
      toast.error(t('billing.subscription_failed_retry'));
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.teamId) {
      toast.error(t('billing.team_info_not_found'));
      return;
    }

    try {
      toast.info(t('billing.opening_subscription_portal'));

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
        toast.error(t('billing.portal_not_configured'));
        if (data.configUrl) {
          console.log('Configure portal at:', data.configUrl);
        }
      } else {
        toast.error(data.message || t('billing.failed_to_open_portal'));
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error(t('billing.failed_to_open_portal_retry'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">
            {t('common.loading')}
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
            {t('billing.subscription_management')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('billing.manage_subscription_billing')}
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
                      {t('billing.current_subscription_plan')}
                    </CardDescription>
                  </div>
                </div>

                {subscription?.isActive && !isExpired ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('billing.active')}
                  </Badge>
                ) : isExpired ? (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {t('billing.expired')}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {t('billing.free')}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {t('billing.status')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.planExpiresAt
                        ? new Date(subscription.planExpiresAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')
                        : t('billing.permanent')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {t('billing.monthly_credits')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {planDetails.limits.monthlyCredits === -1
                        ? t('billing.unlimited')
                        : planDetails.limits.monthlyCredits.toLocaleString()}
                    </p>
                  </div>
                </div>

                {subscription?.teamName && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {t('billing.team')}
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
                  {t('billing.included_features')}
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
                    {t('billing.upgrade_now')}
                  </Button>
                )}
                {currentPlan === SUBSCRIPTION_PLANS.STARTER && (
                  <Button onClick={() => setShowPricing(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 after:shadow-none">
                    <Crown className="w-4 h-4 mr-2" />
                    {t('billing.upgrade_to_enterprise')}
                  </Button>
                )}
                {currentPlan !== SUBSCRIPTION_PLANS.FREE && subscription?.isActive && !isExpired && (
                  <>
                    <Button variant="outline" onClick={handleManageSubscription}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {t('billing.manage_subscription')}
                    </Button>
                    <Button variant="outline" onClick={() => setShowPricing(true)}>
                      {t('billing.view_all_plans')}
                    </Button>
                  </>
                )}
              </div>

              {/* Expiry Warning */}
              {isExpired && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('billing.subscription_expired_message')}
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
                      {t('billing.unlock_all_features')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('billing.upgrade_enterprise_description')}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowPricing(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 after:shadow-none">
                  {t('billing.learn_more')}
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
              {t('billing.choose_your_plan')}
            </h2>
            <Button variant="outline" onClick={() => setShowPricing(false)}>
              {t('billing.back')}
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
