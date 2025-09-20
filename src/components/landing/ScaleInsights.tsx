import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  Search,
  Filter,
  Calendar,
  Eye,
  ArrowRight,
  Star,
  ArrowLeft,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  publishDate: string;
  views: number;
  rating: number;
  tags: string[];
  featured: boolean;
}

interface ScaleInsightsProps {
  user?: any;
  onBack?: () => void;
}

export function ScaleInsights({ user, onBack }: ScaleInsightsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Mock data for articles
  const articles: Article[] = [
    {
      id: "1",
      title: "SF-36 量表详解：健康相关生活质量评估的金标准",
      excerpt: "SF-36 是目前国际上使用最广泛的健康相关生活质量评估工具，本文详细解读其评分方法、临床应用和注意事项。",
      content: "SF-36 健康调查简表（Short Form-36 Health Survey）是由美国波士顿健康研究所研制的一般健康状况量表...",
      category: "生活质量",
      readTime: 8,
      publishDate: "2024-01-15",
      views: 2547,
      rating: 4.8,
      tags: ["SF-36", "生活质量", "健康评估", "国际标准"],
      featured: true
    },
    {
      id: "2",
      title: "PHQ-9 抑郁症自评量表：从筛查到诊断的完整指南",
      excerpt: "PHQ-9 作为抑郁症筛查的首选工具，如何正确使用？本文提供详细的评分标准和临床解释。",
      content: "患者健康问卷-9（Patient Health Questionnaire-9，PHQ-9）是一个包含9个条目的自评量表...",
      category: "精神健康",
      readTime: 6,
      publishDate: "2024-01-12",
      views: 1923,
      rating: 4.6,
      tags: ["PHQ-9", "抑郁症", "筛查工具", "自评量表"],
      featured: true
    },
    {
      id: "3",
      title: "EORTC QLQ-C30：癌症患者生活质量评估权威指南",
      excerpt: "欧洲癌症研究与治疗组织开发的癌症患者专用生活质量量表，适用于各种癌症类型的临床研究。",
      content: "EORTC QLQ-C30 是由欧洲癌症研究与治疗组织（European Organisation for Research and Treatment of Cancer）开发的...",
      category: "肿瘤学",
      readTime: 10,
      publishDate: "2024-01-10",
      views: 1456,
      rating: 4.9,
      tags: ["EORTC", "癌症", "生活质量", "临床研究"],
      featured: false
    },
    {
      id: "4",
      title: "GAD-7 焦虑自评量表：快速识别焦虑障碍",
      excerpt: "GAD-7 是临床和研究中广泛使用的焦虑评估工具，具有良好的信效度和简便性。",
      content: "广泛性焦虑障碍量表-7（Generalized Anxiety Disorder Scale-7，GAD-7）是一个用于筛查和评估...",
      category: "精神健康",
      readTime: 5,
      publishDate: "2024-01-08",
      views: 1234,
      rating: 4.5,
      tags: ["GAD-7", "焦虑", "筛查", "精神健康"],
      featured: false
    },
    {
      id: "5",
      title: "VAS 视觉模拟评分法：疼痛评估的经典工具",
      excerpt: "视觉模拟评分法是疼痛评估的金标准，了解其正确使用方法和临床意义。",
      content: "视觉模拟评分法（Visual Analogue Scale，VAS）是临床上最常用的疼痛评估工具之一...",
      category: "疼痛评估",
      readTime: 4,
      publishDate: "2024-01-05",
      views: 987,
      rating: 4.4,
      tags: ["VAS", "疼痛", "评分法", "临床应用"],
      featured: false
    },
    {
      id: "6",
      title: "MMSE 简易精神状态量表：认知功能筛查的标准工具",
      excerpt: "MMSE 是认知功能筛查最常用的工具，本文详解其评分方法和临床应用场景。",
      content: "简易精神状态量表（Mini-Mental State Examination，MMSE）是由 Folstein 等人于1975年制定的...",
      category: "认知评估",
      readTime: 7,
      publishDate: "2024-01-03",
      views: 1567,
      rating: 4.7,
      tags: ["MMSE", "认知功能", "筛查", "老年医学"],
      featured: false
    }
  ];

  const categories = ["all", "生活质量", "精神健康", "肿瘤学", "疼痛评估", "认知评估"];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredArticles = articles.filter(article => article.featured);

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setSelectedArticle(null)}
          className="mb-6"
        >
          ← 返回文章列表
        </Button>

        <article className="prose prose-lg max-w-none">
          <header className="not-prose mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedArticle.title}
            </h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{selectedArticle.publishDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{selectedArticle.readTime} 分钟阅读</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{selectedArticle.views.toLocaleString()} 次阅读</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{selectedArticle.rating}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">{selectedArticle.category}</Badge>
              {selectedArticle.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </header>

          <div className="text-gray-700 leading-relaxed">
            <p className="text-lg text-gray-600 mb-6">{selectedArticle.excerpt}</p>
            <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      {onBack && (
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>返回首页</span>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">量表解读中心</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          深入了解各类 eCOA 量表的使用方法、评分标准和临床应用，提升您的专业实践水平
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有分类</SelectItem>
              {categories.slice(1).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured Articles */}
      {selectedCategory === "all" && searchQuery === "" && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">精选文章</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticles.map(article => (
              <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-fit">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        精选
                      </Badge>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime} 分钟</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{article.category}</Badge>
                    {article.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArticle(article)}
                    className="group-hover:bg-blue-50 group-hover:border-blue-200"
                  >
                    阅读全文
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Articles */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {selectedCategory === "all" ? "所有文章" : `${selectedCategory} 相关文章`}
          <span className="text-base font-normal text-gray-600 ml-2">
            ({filteredArticles.length} 篇)
          </span>
        </h2>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无相关文章</h3>
            <p className="text-gray-600">请尝试调整搜索条件或选择其他分类</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredArticles.map(article => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription>
                        {article.excerpt}
                      </CardDescription>
                    </div>
                    {article.featured && (
                      <Badge variant="secondary" className="ml-4">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        精选
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{article.publishDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime} 分钟阅读</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArticle(article)}
                    >
                      阅读全文
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">{article.category}</Badge>
                    {article.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}