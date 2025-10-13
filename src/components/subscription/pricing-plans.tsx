'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUBSCRIPTION_PLANS, PLAN_FEATURES, type SubscriptionPlan } from '@/constants/plans';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';

interface PricingPlansProps {
  currentPlan?: SubscriptionPlan | null;
  onSelectPlan?: (plan: SubscriptionPlan, billingInterval: 'monthly' | 'yearly') => void;
}

export function PricingPlans({ currentPlan, onSelectPlan }: PricingPlansProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const isZh = language === 'zh';

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return <Crown className="h-6 w-6" />;
      case SUBSCRIPTION_PLANS.STARTER:
        return <Zap className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return 'from-purple-500 to-pink-500';
      case SUBSCRIPTION_PLANS.STARTER:
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (!currentPlan) return plan === SUBSCRIPTION_PLANS.FREE;
    return currentPlan === plan;
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan, billingCycle);
    } else {
      // Default: redirect to billing page with plan selection
      router.push(`/billing?plan=${plan}&interval=${billingCycle}`);
    }
  };

  const plans = [
    SUBSCRIPTION_PLANS.FREE,
    SUBSCRIPTION_PLANS.STARTER,
    SUBSCRIPTION_PLANS.ENTERPRISE,
  ];

  return (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">
              {isZh ? '按月付费' : 'Monthly'}
            </TabsTrigger>
            <TabsTrigger value="yearly">
              {isZh ? '按年付费' : 'Yearly'}
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                {isZh ? '省17%' : 'Save 17%'}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const planDetails = PLAN_FEATURES[plan];
          const price = billingCycle === 'monthly' ? planDetails.price : Math.round(planDetails.priceYearly / 12);
          const totalYearly = planDetails.priceYearly;
          const isCurrent = isCurrentPlan(plan);
          const isRecommended = plan === SUBSCRIPTION_PLANS.ENTERPRISE;

          return (
            <Card
              key={plan}
              className={`relative ${
                isRecommended ? 'border-2 border-purple-500 shadow-lg scale-105' : ''
              } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
            >
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1">
                    {isZh ? '推荐' : 'Recommended'}
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-4 right-4">
                  <Badge variant="outline" className="bg-blue-50 border-blue-500 text-blue-700">
                    {isZh ? '当前计划' : 'Current Plan'}
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getPlanColor(plan)} flex items-center justify-center text-white mb-4`}>
                  {getPlanIcon(plan)}
                </div>
                <CardTitle className="text-2xl">
                  {isZh ? planDetails.name : planDetails.nameEn}
                </CardTitle>
                <CardDescription>
                  <div className="mt-4">
                    {plan === SUBSCRIPTION_PLANS.FREE ? (
                      <div>
                        <span className="text-4xl font-bold text-foreground">
                          {isZh ? '免费' : 'Free'}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-foreground">
                          ${price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {isZh ? '/月' : '/month'}
                        </span>
                        {billingCycle === 'yearly' && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {isZh ? `年付 $${totalYearly.toLocaleString()}` : `$${totalYearly.toLocaleString()}/year`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {(isZh ? planDetails.features : planDetails.featuresEn).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits Info */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      {isZh ? '月度积分：' : 'Monthly Credits: '}
                      <span className="font-semibold text-foreground">
                        {planDetails.limits.monthlyCredits === -1
                          ? (isZh ? '无限' : 'Unlimited')
                          : planDetails.limits.monthlyCredits.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    isRecommended
                      ? `bg-gradient-to-r ${getPlanColor(plan)} hover:opacity-90 text-white border-0 after:shadow-none`
                      : ''
                  }`}
                  variant={isRecommended ? 'default' : isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent && plan !== SUBSCRIPTION_PLANS.FREE}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrent
                    ? (isZh ? '当前计划' : 'Current Plan')
                    : plan === SUBSCRIPTION_PLANS.FREE
                    ? (isZh ? '降级到免费版' : 'Downgrade to Free')
                    : (isZh ? '选择此计划' : 'Choose Plan')}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Note */}
      <div className="text-center text-sm text-muted-foreground">
        {isZh ? (
          <>
            需要帮助选择合适的计划？<a href="/help" className="text-primary hover:underline ml-1">联系我们</a>
          </>
        ) : (
          <>
            Need help choosing? <a href="/help" className="text-primary hover:underline ml-1">Contact us</a>
          </>
        )}
      </div>
    </div>
  );
}
