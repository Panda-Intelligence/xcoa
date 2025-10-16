'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X, Sparkles } from 'lucide-react';
import { SubscriptionPlan, PLAN_PRICING, PLAN_FEATURES } from '@/types/subscription';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isYearly: boolean;
  currentPlan?: SubscriptionPlan;
  onUpgrade: (plan: SubscriptionPlan, isYearly: boolean) => void;
  isPopular?: boolean;
}

function PricingCard({ plan, isYearly, currentPlan, onUpgrade, isPopular }: PricingCardProps) {
  const pricing = PLAN_PRICING[plan];
  const features = PLAN_FEATURES[plan];
  const price = isYearly ? pricing.yearly : pricing.monthly;
  const isCurrentPlan = currentPlan === plan;

  return (
    <Card className={cn(
      "relative hover:shadow-xl transition-all duration-300",
      isPopular && "border-purple-500 border-2 scale-105"
    )}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
          <Sparkles className="w-3 h-3 mr-1" />
          最受欢迎
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{pricing.name}</CardTitle>
        <CardDescription>
          {plan === SubscriptionPlan.FREE && '开始您的eCOA之旅'}
          {plan === SubscriptionPlan.PROFESSIONAL && '适合个人研究者和小团队'}
          {plan === SubscriptionPlan.ADVANCED && '专业团队的最佳选择'}
          {plan === SubscriptionPlan.ENTERPRISE && '大型组织的定制方案'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">¥{price.toLocaleString()}</span>
            <span className="text-gray-500">/{isYearly ? '年' : '月'}</span>
          </div>
          {isYearly && plan !== SubscriptionPlan.FREE && (
            <p className="text-sm text-green-600">节省 ¥{((pricing.monthly * 12) - pricing.yearly).toLocaleString()}</p>
          )}
        </div>

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan}
          onClick={() => onUpgrade(plan, isYearly)}
        >
          {isCurrentPlan ? '当前计划' : plan === SubscriptionPlan.FREE ? '开始免费试用' : '升级到此计划'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();

  // TODO: 从用户会话获取当前订阅计划
  const currentPlan = SubscriptionPlan.FREE;

  const handleUpgrade = async (plan: SubscriptionPlan, isYearly: boolean) => {
    if (plan === SubscriptionPlan.FREE) {
      router.push('/sign-up');
      return;
    }

    // TODO: 调用Stripe Checkout API
    router.push(`/checkout?plan=${plan}&period=${isYearly ? 'yearly' : 'monthly'}`);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">选择适合您的计划</h1>
        <p className="text-xl text-gray-600 mb-8">灵活的定价，满足不同需求</p>

        <div className="flex items-center justify-center gap-4">
          <span className={cn("font-medium", !isYearly && "text-purple-600")}>月付</span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-purple-600"
          />
          <span className={cn("font-medium", isYearly && "text-purple-600")}>
            年付
            <Badge className="ml-2" variant="secondary">省2个月</Badge>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <PricingCard
          plan={SubscriptionPlan.FREE}
          isYearly={isYearly}
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
        />
        <PricingCard
          plan={SubscriptionPlan.PROFESSIONAL}
          isYearly={isYearly}
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
        />
        <PricingCard
          plan={SubscriptionPlan.ADVANCED}
          isYearly={isYearly}
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          isPopular={true}
        />
        <PricingCard
          plan={SubscriptionPlan.ENTERPRISE}
          isYearly={isYearly}
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
        />
      </div>

      <div className="mt-16 bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">功能对比</h2>
        <ComparisonTable currentPlan={currentPlan} />
      </div>
    </div>
  );
}

function ComparisonTable({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const features = [
    { name: '搜索次数', free: '30/月', pro: '无限', advanced: '无限', enterprise: '无限' },
    { name: '量表详情', free: '5/月', pro: '100/月', advanced: '无限', enterprise: '无限' },
    { name: 'AI解读', free: <X className="w-5 h-5 text-red-500" />, pro: '20次/月', advanced: '100次/月', enterprise: '无限' },
    { name: '案例库', free: <X className="w-5 h-5 text-red-500" />, pro: <Check className="w-5 h-5 text-green-500" />, advanced: <Check className="w-5 h-5 text-green-500" />, enterprise: <Check className="w-5 h-5 text-green-500" /> },
    { name: 'PDF导出', free: '带水印', pro: '无水印', advanced: '无水印', enterprise: '无水印' },
    { name: '数据导出', free: <X className="w-5 h-5 text-red-500" />, pro: <Check className="w-5 h-5 text-green-500" />, advanced: <Check className="w-5 h-5 text-green-500" />, enterprise: <Check className="w-5 h-5 text-green-500" /> },
    { name: 'API接入', free: <X className="w-5 h-5 text-red-500" />, pro: <X className="w-5 h-5 text-red-500" />, advanced: '10000次/月', enterprise: '无限' },
    { name: '团队成员', free: '1', pro: '1', advanced: '5', enterprise: '无限' },
    { name: '版权申请协助', free: <X className="w-5 h-5 text-red-500" />, pro: <X className="w-5 h-5 text-red-500" />, advanced: <X className="w-5 h-5 text-red-500" />, enterprise: <Check className="w-5 h-5 text-green-500" /> },
    { name: '技术支持', free: '社区', pro: '邮件', advanced: '优先', enterprise: '专属客服' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">功能</th>
            <th className="text-center py-3 px-4">
              <div className={cn(currentPlan === SubscriptionPlan.FREE && "text-purple-600 font-bold")}>
                免费版
              </div>
            </th>
            <th className="text-center py-3 px-4">
              <div className={cn(currentPlan === SubscriptionPlan.PROFESSIONAL && "text-purple-600 font-bold")}>
                专业版
              </div>
            </th>
            <th className="text-center py-3 px-4">
              <div className={cn(currentPlan === SubscriptionPlan.ADVANCED && "text-purple-600 font-bold")}>
                高级版
              </div>
            </th>
            <th className="text-center py-3 px-4">
              <div className={cn(currentPlan === SubscriptionPlan.ENTERPRISE && "text-purple-600 font-bold")}>
                企业版
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b">
              <td className="py-3 px-4 font-medium">{feature.name}</td>
              <td className="text-center py-3 px-4">{feature.free}</td>
              <td className="text-center py-3 px-4">{feature.pro}</td>
              <td className="text-center py-3 px-4">{feature.advanced}</td>
              <td className="text-center py-3 px-4">{feature.enterprise}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}