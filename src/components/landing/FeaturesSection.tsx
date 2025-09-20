import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Database, BarChart3, Users, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "AI 智能检索",
    description: "基于自然语言处理的智能搜索，快速找到最适合的量表工具",
    color: "text-blue-600"
  },
  {
    icon: Database,
    title: "丰富量表库",
    description: "涵盖心理、神经、肿瘤等多个医学领域的专业量表资源",
    color: "text-green-600"
  },
  {
    icon: BarChart3,
    title: "数据分析",
    description: "提供详细的量表统计数据和使用趋势分析报告",
    color: "text-purple-600"
  },
  {
    icon: Users,
    title: "协作平台",
    description: "支持团队协作，研究人员可以共享和讨论量表使用经验",
    color: "text-orange-600"
  },
  {
    icon: Shield,
    title: "数据安全",
    description: "企业级安全保障，确保患者数据和研究结果的隐私安全",
    color: "text-red-600"
  },
  {
    icon: Zap,
    title: "快速部署",
    description: "一键部署到临床环境，与现有系统无缝集成",
    color: "text-yellow-600"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            专业功能特性
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            为临床研究和医疗实践提供全方位的 eCOA 量表解决方案
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/50 mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Search Demo Section */}
        <div className="mt-20 bg-secondary/30 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  AI 智能检索演示
                </h3>
                <p className="text-muted-foreground">
                  我们的 AI 系统可以理解您的需求，智能推荐最适合的量表工具。
                  无论是按疾病类型、评估目标还是患者群体，都能快速匹配。
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">用户输入:</p>
                      <p className="font-medium">"评估癌症患者生活质量的量表"</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">AI 推荐:</p>
                      <p className="font-medium">EORTC QLQ-C30, FACT-G, SF-36...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    <span>搜索结果 (0.2秒)</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "EORTC QLQ-C30", desc: "欧洲癌症研究治疗组织生活质量量表", match: "95%" },
                      { name: "FACT-G", desc: "癌症治疗功能评估量表", match: "92%" },
                      { name: "SF-36", desc: "简明健康状况调查表", match: "88%" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="text-xs text-primary font-medium">{item.match}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}