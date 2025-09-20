import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

const pricingPlans = [
  {
    name: "基础版",
    price: "免费",
    description: "适合个人研究者和小团队",
    features: [
      "访问基础量表库 (100+)",
      "基础搜索功能",
      "每月 50 次搜索",
      "社区支持",
      "基础数据导出"
    ],
    buttonText: "免费开始",
    popular: false,
    color: "border-border"
  },
  {
    name: "专业版",
    price: "¥299",
    period: "/月",
    description: "适合专业研究团队",
    features: [
      "访问完整量表库 (500+)",
      "AI 智能检索",
      "无限次搜索",
      "高级数据分析",
      "团队协作功能",
      "优先技术支持",
      "自定义量表上传",
      "API 集成支持"
    ],
    buttonText: "立即订阅",
    popular: true,
    color: "border-primary"
  },
  {
    name: "企业版",
    price: "¥999",
    period: "/月",
    description: "适合大型医疗机构",
    features: [
      "专业版所有功能",
      "私有部署选项",
      "企业级安全",
      "专属客户经理",
      "定制化开发",
      "培训和咨询服务",
      "SLA 保障",
      "白标解决方案"
    ],
    buttonText: "联系销售",
    popular: false,
    color: "border-border"
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            选择适合的订阅方案
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            从个人研究到企业级部署，我们提供灵活的定价方案满足不同需求
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <span className="text-sm text-muted-foreground">月付</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" />
              <div className="w-10 h-6 bg-secondary rounded-full shadow-inner"></div>
              <div className="absolute w-4 h-4 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
            </div>
            <span className="text-sm text-foreground">年付 (节省 20%)</span>
            <Badge variant="secondary" className="text-xs">推荐</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.color} ${plan.popular ? 'shadow-lg scale-105' : ''} transition-all duration-300 hover:shadow-xl`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    最受欢迎
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
          <h3 className="text-xl font-semibold mb-4">常见问题</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-medium mb-2">可以随时取消订阅吗？</h4>
              <p className="text-sm text-muted-foreground">是的，您可以随时取消订阅，取消后仍可使用至当前计费周期结束。</p>
            </div>
            <div className="text-left">
              <h4 className="font-medium mb-2">支持哪些支付方式？</h4>
              <p className="text-sm text-muted-foreground">支持支付宝、微信支付、银行卡等多种支付方式。</p>
            </div>
            <div className="text-left">
              <h4 className="font-medium mb-2">企业版包含哪些定制服务？</h4>
              <p className="text-sm text-muted-foreground">包含私有部署、定制开发、专属培训等一对一服务。</p>
            </div>
            <div className="text-left">
              <h4 className="font-medium mb-2">数据安全如何保障？</h4>
              <p className="text-sm text-muted-foreground">采用银行级加密技术，符合 GDPR 和国内数据保护法规要求。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}