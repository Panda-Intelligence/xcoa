'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  AlertCircle,
  BarChart3,
  Zap,
  Users
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

interface DashboardData {
  overview: {
    totalScales: number;
    totalInterpretations: number;
    coverage: string;
    needsVerification: number;
  };
  status: {
    draft: number;
    reviewing: number;
    approved: number;
    published: number;
  };
  generation: {
    aiGenerated: number;
    manualCreated: number;
  };
  engagement: {
    totalViews: number;
    totalHelpful: number;
    helpfulRate: string;
  };
  quality: {
    avgQualityScore: number | null;
    avgCompletenessScore: number | null;
    avgAccuracyScore: number | null;
  };
  recentInterpretations: any[];
}

export default function InterpretationDashboard() {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/interpretations/dashboard');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">
          {isZh ? '加载中...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">
          {isZh ? '加载失败' : 'Failed to load'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isZh ? '解读生成监控台' : 'Interpretation Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isZh ? '实时监控 AI 解读生成进度和质量' : 'Monitor AI interpretation generation progress and quality'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              总量表数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.totalScales}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已解读: {data.overview.totalInterpretations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              覆盖率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.coverage}</div>
            <p className="text-xs text-muted-foreground mt-1">
              目标: 80%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
              待验证
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {data.overview.needsVerification}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              需要专家审核
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              已发布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {data.status.published}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              可供用户查看
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              状态分布
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">草稿</Badge>
                  <span className="text-sm text-muted-foreground">待处理</span>
                </div>
                <span className="font-semibold">{data.status.draft}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className="bg-yellow-500 mr-2">审核中</Badge>
                  <span className="text-sm text-muted-foreground">专家审核</span>
                </div>
                <span className="font-semibold">{data.status.reviewing}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className="bg-blue-500 mr-2">已审核</Badge>
                  <span className="text-sm text-muted-foreground">待发布</span>
                </div>
                <span className="font-semibold">{data.status.approved}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className="bg-green-500 mr-2">已发布</Badge>
                  <span className="text-sm text-muted-foreground">线上可见</span>
                </div>
                <span className="font-semibold">{data.status.published}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              生成方式
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold">AI 生成</div>
                  <div className="text-sm text-muted-foreground">Claude 3.5 Sonnet</div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {data.generation.aiGenerated}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold">人工创建</div>
                  <div className="text-sm text-muted-foreground">专家编写</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.generation.manualCreated}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              用户参与度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm">总查看次数</span>
              </div>
              <span className="font-semibold">{data.engagement.totalViews?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                <span className="text-sm">有帮助反馈</span>
              </div>
              <span className="font-semibold">{data.engagement.totalHelpful?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-sm">有帮助率</span>
              </div>
              <span className="font-semibold">{data.engagement.helpfulRate}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              质量评分
            </CardTitle>
            <CardDescription>基于专家审核的平均分数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.quality.avgQualityScore ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">整体质量</span>
                    <span className="font-semibold">{data.quality.avgQualityScore.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${data.quality.avgQualityScore}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">完整性</span>
                    <span className="font-semibold">{data.quality.avgCompletenessScore?.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${data.quality.avgCompletenessScore}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">准确性</span>
                    <span className="font-semibold">{data.quality.avgAccuracyScore?.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${data.quality.avgAccuracyScore}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无质量评分数据</p>
                <p className="text-sm mt-1">审核后将显示评分</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              最近生成
            </CardTitle>
            <Link href="/admin/interpretations">
              <Button variant="outline" size="sm">
                查看全部
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentInterpretations.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.scaleName}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.scaleAcronym} • {item.aiModel} • {item.aiTokensUsed} tokens
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'published' && (
                    <Badge className="bg-green-500">已发布</Badge>
                  )}
                  {item.status === 'approved' && (
                    <Badge className="bg-blue-500">已审核</Badge>
                  )}
                  {item.status === 'reviewing' && (
                    <Badge className="bg-yellow-500">审核中</Badge>
                  )}
                  {item.status === 'draft' && (
                    <Badge variant="secondary">草稿</Badge>
                  )}
                  {item.needsVerification === 1 && (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
