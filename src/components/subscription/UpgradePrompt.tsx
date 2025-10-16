'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Crown, Sparkles, Zap, Building } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';

interface UpgradePromptProps {
  feature: string;
  currentPlan: SubscriptionPlan;
  requiredPlan: SubscriptionPlan;
  message?: string;
}

const planIcons = {
  [SubscriptionPlan.FREE]: null,
  [SubscriptionPlan.PROFESSIONAL]: <Crown className="w-5 h-5" />,
  [SubscriptionPlan.ADVANCED]: <Sparkles className="w-5 h-5" />,
  [SubscriptionPlan.ENTERPRISE]: <Building className="w-5 h-5" />
};

const planNames = {
  [SubscriptionPlan.FREE]: '免费版',
  [SubscriptionPlan.PROFESSIONAL]: '专业版',
  [SubscriptionPlan.ADVANCED]: '高级版',
  [SubscriptionPlan.ENTERPRISE]: '企业版'
};

const planColors = {
  [SubscriptionPlan.FREE]: 'bg-gray-100 text-gray-800',
  [SubscriptionPlan.PROFESSIONAL]: 'bg-blue-100 text-blue-800',
  [SubscriptionPlan.ADVANCED]: 'bg-purple-100 text-purple-800',
  [SubscriptionPlan.ENTERPRISE]: 'bg-amber-100 text-amber-800'
};

export function UpgradePrompt({
  feature,
  currentPlan,
  requiredPlan,
  message
}: UpgradePromptProps) {
  const router = useRouter();

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">升级解锁 {feature}</CardTitle>
        <CardDescription className="text-base mt-2">
          {message || `此功能需要升级到更高级别的订阅计划`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${planColors[currentPlan]}`}>
            <div className="flex items-center gap-1.5">
              {planIcons[currentPlan]}
              <span>当前：{planNames[currentPlan]}</span>
            </div>
          </div>

          <span className="text-gray-400">→</span>

          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${planColors[requiredPlan]} animate-pulse`}>
            <div className="flex items-center gap-1.5">
              {planIcons[requiredPlan]}
              <span>需要：{planNames[requiredPlan]}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Button
            size="lg"
            onClick={() => router.push('/pricing')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
          >
            查看升级选项
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.back()}
            className="border-amber-300 hover:bg-amber-50"
          >
            返回
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}