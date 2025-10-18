'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Eye, Star, ArrowRight, MessageCircle } from "lucide-react";
import { useLanguage } from '@/hooks/useLanguage';

interface BlogPreviewProps {
  onViewBlog: () => void;
}

export function BlogPreview({ onViewBlog }: BlogPreviewProps) {
  const { t, language } = useLanguage();

  // Helper function to get blog data based on language
  const getBlogData = () => {
    if (language === 'zh') {
      return [
        {
          id: "1",
          title: "如何选择合适的临床评估量表",
          excerpt: "本文深入探讨如何根据研究目的和患者群体特征选择最合适的临床评估量表，包括信效度评估和实用性考量。",
          category: "临床指南",
          readTime: 5,
          views: 3245,
          commentCount: 42,
          tags: ["量表选择", "临床实践", "方法学"]
        },
        {
          id: "2",
          title: "ePRO系统实施最佳实践",
          excerpt: "分享电子患者报告结局(ePRO)系统在临床试验中的成功实施案例，包括患者培训、数据质量控制和技术挑战解决方案。",
          category: "技术实践",
          readTime: 7,
          views: 2187,
          commentCount: 28,
          tags: ["ePRO", "临床试验", "数据管理"]
        },
        {
          id: "3",
          title: "量表中文化适应性验证流程",
          excerpt: "详细介绍量表跨文化适应的标准流程，包括翻译、回译、认知性访谈和心理测量学验证步骤。",
          category: "本地化",
          readTime: 6,
          views: 1834,
          commentCount: 15,
          tags: ["文化适应", "翻译", "验证"]
        }
      ];
    }

    return [
      {
        id: "1",
        title: "How to Choose the Right Clinical Assessment Scale",
        excerpt: "This article explores how to select the most appropriate clinical assessment scales based on research objectives and patient characteristics, including reliability, validity, and practical considerations.",
        category: "Clinical Guidelines",
        readTime: 5,
        views: 3245,
        commentCount: 42,
        tags: ["Scale Selection", "Clinical Practice", "Methodology"]
      },
      {
        id: "2",
        title: "Best Practices for ePRO System Implementation",
        excerpt: "Sharing successful case studies of electronic Patient-Reported Outcome (ePRO) systems in clinical trials, including patient training, data quality control, and technical challenge solutions.",
        category: "Technical Practice",
        readTime: 7,
        views: 2187,
        commentCount: 28,
        tags: ["ePRO", "Clinical Trials", "Data Management"]
      },
      {
        id: "3",
        title: "Cross-Cultural Adaptation Validation Process for Scales",
        excerpt: "Detailed introduction to the standard process for cross-cultural adaptation of scales, including translation, back-translation, cognitive interviews, and psychometric validation steps.",
        category: "Localization",
        readTime: 6,
        views: 1834,
        commentCount: 15,
        tags: ["Cultural Adaptation", "Translation", "Validation"]
      }
    ];
  };

  const featuredPosts = getBlogData();

  return (
    <section id="blog" className="py-20 bg-linear-to-br from-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-4">
            <BookOpen className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm text-primary">{t('blog.subtitle')}</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('blog.title')}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('blog.description')}
          </p>
        </div>

        {/* Featured Posts */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {featuredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {t('blog.featured')}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime} {t('blog.minutes')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  {post.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={onViewBlog}
                >
                  {t('blog.read_more')}
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
            onClick={onViewBlog}
            className="bg-primary hover:bg-primary/90"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            {t('blog.view_more')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
