import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Eye, Star, ArrowRight } from "lucide-react";

interface InsightsPreviewProps {
  onViewInsights: () => void;
}

export function InsightsPreview({ onViewInsights }: InsightsPreviewProps) {
  const featuredArticles = [
    {
      id: "1",
      title: "SF-36 量表详解：健康相关生活质量评估的金标准",
      excerpt: "SF-36 是目前国际上使用最广泛的健康相关生活质量评估工具，本文详细解读其评分方法、临床应用和注意事项。",
      category: "生活质量",
      readTime: 8,
      views: 2547,
      rating: 4.8,
      tags: ["SF-36", "生活质量", "健康评估"]
    },
    {
      id: "2",
      title: "PHQ-9 抑郁症自评量表：从筛查到诊断的完整指南",
      excerpt: "PHQ-9 作为抑郁症筛查的首选工具，如何正确使用？本文提供详细的评分标准和临床解释。",
      category: "精神健康",
      readTime: 6,
      views: 1923,
      rating: 4.6,
      tags: ["PHQ-9", "抑郁症", "筛查工具"]
    },
    {
      id: "3",
      title: "EORTC QLQ-C30：癌症患者生活质量评估权威指南",
      excerpt: "欧洲癌症研究与治疗组织开发的癌症患者专用生活质量量表，适用于各种癌症类型的临床研究。",
      category: "肿瘤学",
      readTime: 10,
      views: 1456,
      rating: 4.9,
      tags: ["EORTC", "癌症", "生活质量"]
    }
  ];

  return (
    <section id="insights" className="py-20 bg-gradient-to-br from-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-4">
            <BookOpen className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm text-primary">专业解读</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            量表解读中心
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            深入了解各类 eCOA 量表的使用方法、评分标准和临床应用，提升您的专业实践水平
          </p>
        </div>

        {/* Featured Articles */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {featuredArticles.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    精选
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{article.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-3">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime} 分钟</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{article.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="outline" className="text-xs">{article.category}</Badge>
                  {article.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={onViewInsights}
                >
                  阅读全文
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={onViewInsights}
            className="bg-primary hover:bg-primary/90"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            查看更多解读文章
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}