'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, Crown, Zap, Lock, ArrowRight } from 'lucide-react';
import { PLAN_FEATURES, SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/constants/plans';
import { useLanguage } from '@/hooks/useLanguage';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan: SubscriptionPlan;
  currentPlan: SubscriptionPlan | null;
  featureName: string;
  featureDescription?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  requiredPlan,
  currentPlan,
  featureName,
  featureDescription,
}: UpgradeModalProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const planDetails = PLAN_FEATURES[requiredPlan];
  const isZh = language === 'zh';

  const handleUpgrade = async () => {
    setIsLoading(true);
    router.push('/billing');
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return <Crown className="h-5 w-5" />;
      case SUBSCRIPTION_PLANS.STARTER:
        return <Zap className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case SUBSCRIPTION_PLANS.STARTER:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${getPlanColor(requiredPlan)} text-white`}>
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl">
              {isZh ? '升级以使用此功能' : 'Upgrade to Use This Feature'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {isZh ? (
              <>
                <span className="font-semibold text-foreground">{featureName}</span>
                {featureDescription && <span> - {featureDescription}</span>}
                是 <span className="font-semibold text-foreground">{planDetails.name}</span> 的专属功能
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">{featureName}</span>
                {featureDescription && <span> - {featureDescription}</span>}
                is exclusive to <span className="font-semibold text-foreground">{planDetails.nameEn}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlanIcon(requiredPlan)}
                  <CardTitle>{isZh ? planDetails.name : planDetails.nameEn}</CardTitle>
                </div>
                <Badge variant="default" className={getPlanColor(requiredPlan)}>
                  {isZh ? '推荐' : 'Recommended'}
                </Badge>
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  ${planDetails.price}
                </span>
                <span className="text-muted-foreground">{isZh ? '/月' : '/month'}</span>
                <span className="ml-2 text-sm">
                  {isZh ? '或' : 'or'} ${planDetails.priceYearly}{isZh ? '/年' : '/year'}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  {isZh ? '包含功能：' : 'Included Features:'}
                </p>
                <ul className="space-y-2">
                  {(isZh ? planDetails.features : planDetails.featuresEn).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              {isZh ? (
                <>
                  💡 升级后，您将立即获得访问权限。
                  {requiredPlan === SUBSCRIPTION_PLANS.ENTERPRISE && '企业版还包含团队协作、定制服务和 API 访问。'}
                </>
              ) : (
                <>
                  💡 You'll get immediate access after upgrading.
                  {requiredPlan === SUBSCRIPTION_PLANS.ENTERPRISE && ' Enterprise also includes team collaboration, custom services, and API access.'}
                </>
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {isZh ? '稍后' : 'Later'}
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className={getPlanColor(requiredPlan)}
          >
            {isLoading ? (
              isZh ? '正在跳转...' : 'Redirecting...'
            ) : (
              <>
                {isZh ? `升级到${planDetails.name}` : `Upgrade to ${planDetails.nameEn}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
