'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/hooks/useLanguage';

const pricingPlans = [
  {
    id: "basic",
    popular: false,
    color: "border-border"
  },
  {
    id: "professional",
    popular: true,
    color: "border-primary"
  },
  {
    id: "enterprise",
    popular: false,
    color: "border-border"
  }
];

export function PricingSection() {
  const { t, language } = useLanguage();

  // Helper function to get array translations
  const getArrayTranslation = (key: string): string[] => {
    // Fallback feature lists for different plans
    const fallbackFeatures = {
      basic: language === 'zh' ? [
        "访问基础量表库 (100+)",
        "基础搜索功能",
        "每月 50 次搜索",
        "社区支持",
        "基础数据导出"
      ] : [
        "Access to basic scale library (100+)",
        "Basic search functionality",
        "50 searches per month",
        "Community support",
        "Basic data export"
      ],
      professional: language === 'zh' ? [
        "访问完整量表库 (500+)",
        "AI 智能检索",
        "无限次搜索",
        "高级数据分析",
        "团队协作功能",
        "优先技术支持",
        "自定义量表上传",
        "API 集成支持"
      ] : [
        "Access to complete scale library (500+)",
        "AI intelligent search",
        "Unlimited searches",
        "Advanced data analysis",
        "Team collaboration features",
        "Priority technical support",
        "Custom scale uploads",
        "API integration support"
      ],
      enterprise: language === 'zh' ? [
        "专业版所有功能",
        "私有部署选项",
        "企业级安全",
        "专属客户经理",
        "定制化开发",
        "培训和咨询服务",
        "SLA 保障",
        "白标解决方案"
      ] : [
        "All Professional features",
        "Private deployment options",
        "Enterprise-grade security",
        "Dedicated account manager",
        "Custom development",
        "Training and consulting services",
        "SLA guarantee",
        "White-label solutions"
      ]
    };

    return fallbackFeatures[key as keyof typeof fallbackFeatures] || [];
  };

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.description')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <span className="text-sm text-muted-foreground">{t('pricing.monthly')}</span>
            <Switch className="SwitchRoot" id="airplane-mode" />
            <span className="text-sm text-foreground">{t('pricing.yearly')} ({t('pricing.save_20')})</span>
            <Badge variant="secondary" className="text-xs">{t('pricing.recommended')}</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'shadow-lg scale-105' : ''} transition-all duration-300 hover:shadow-xl`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    {t('pricing.most_popular')}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl">{t(`pricing.plans.${plan.id}.name`)}</CardTitle>
                <CardDescription className="text-sm mt-2">
                  {t(`pricing.plans.${plan.id}.description`)}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-foreground">{t(`pricing.plans.${plan.id}.price`)}</span>
                    {t(`pricing.plans.${plan.id}.period`) && (
                      <span className="text-muted-foreground ml-1">{t(`pricing.plans.${plan.id}.period`)}</span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? "default" : "outline-solid"}
                >
                  {t(`pricing.plans.${plan.id}.button`)}
                </Button>

                <div className="space-y-3">
                  {getArrayTranslation(plan.id).map((feature, featureIndex) => (
                    <div key={`${plan.id}-feature-${featureIndex}`} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-xl font-semibold mb-4">{t('pricing.faq.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-medium mb-2">{t('pricing.faq.can_cancel.question')}</h4>
              <p className="text-sm text-muted-foreground">{t('pricing.faq.can_cancel.answer')}</p>
            </div>
            <div className="text-left">
              <h4 className="font-medium mb-2">{t('pricing.faq.payment_methods.question')}</h4>
              <p className="text-sm text-muted-foreground">{t('pricing.faq.payment_methods.answer')}</p>
            </div>
            <div className="text-left">
              <h4 className="font-medium mb-2">{t('pricing.faq.enterprise_services.question')}</h4>
              <p className="text-sm text-muted-foreground">{t('pricing.faq.enterprise_services.answer')}</p>
            </div>
            <div className="text-left">
              <h4 className="font-medium mb-2">{t('pricing.faq.data_security.question')}</h4>
              <p className="text-sm text-muted-foreground">{t('pricing.faq.data_security.answer')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}