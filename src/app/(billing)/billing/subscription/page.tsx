'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS, PLAN_FEATURES, type SubscriptionPlan } from '@/constants/plans';

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const { subscription, isLoading } = useSubscription();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS.FREE);

  useEffect(() => {
    if (subscription?.plan) {
      setCurrentPlan(subscription.plan as SubscriptionPlan);
    }
  }, [subscription]);

  const plans = [
    {
      id: SUBSCRIPTION_PLANS.FREE,
      data: PLAN_FEATURES[SUBSCRIPTION_PLANS.FREE],
      popular: false,
      color: 'border-border',
    },
    {
      id: SUBSCRIPTION_PLANS.STARTER,
      data: PLAN_FEATURES[SUBSCRIPTION_PLANS.STARTER],
      popular: true,
      color: 'border-primary',
    },
    {
      id: SUBSCRIPTION_PLANS.ENTERPRISE,
      data: PLAN_FEATURES[SUBSCRIPTION_PLANS.ENTERPRISE],
      popular: false,
      color: 'border-border',
    },
  ];

  const handleUpgrade = (planId: SubscriptionPlan) => {
    // TODO: Implement subscription upgrade logic
    console.log('Upgrade to:', planId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('common.loading', '加载中...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      {/* Current Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                {t('billing.current_plan', '当前订阅方案')}
              </CardTitle>
              <CardDescription className="mt-2">
                {t('billing.manage_subscription', '管理您的订阅和计费信息')}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {PLAN_FEATURES[currentPlan].name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('billing.plan_status', '状态')}: <span className="text-foreground font-medium">{subscription?.status === 'active' ? t('billing.active', '活跃') : t('billing.inactive', '未激活')}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {t('billing.monthly_credits', '每月积分')}: <span className="text-foreground font-medium">
                {PLAN_FEATURES[currentPlan].limits.monthlyCredits === -1
                  ? t('billing.unlimited', '无限制')
                  : PLAN_FEATURES[currentPlan].limits.monthlyCredits}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">{t('billing.available_plans', '可用订阅方案')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.color} ${plan.popular ? 'shadow-lg scale-105' : ''} transition-all duration-300 hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      {t('pricing.most_popular', '最受欢迎')}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl">{plan.data.name}</CardTitle>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-foreground">
                        ¥{plan.data.price}
                      </span>
                      {plan.data.price > 0 && (
                        <span className="text-muted-foreground ml-1">
                          {t('pricing.per_month', '/月')}
                        </span>
                      )}
                    </div>
                    {plan.data.priceYearly > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('pricing.yearly', '年付')}: ¥{plan.data.priceYearly}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {isCurrent ? (
                    <Button disabled className="w-full" variant="outline">
                      {t('billing.current_plan', '当前方案')}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plan.id === SUBSCRIPTION_PLANS.FREE
                        ? t('billing.downgrade', '降级')
                        : t('billing.upgrade', '升级')}
                    </Button>
                  )}

                  <div className="space-y-3">
                    {plan.data.features.map((feature, featureIndex) => (
                      <div key={`${plan.id}-feature-${featureIndex}`} className="flex items-start space-x-3">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
