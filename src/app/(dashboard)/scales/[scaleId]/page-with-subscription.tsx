'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  Download,
  Eye,
  Heart,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  BarChart3,
  Plus,
  ClipboardCheck,
  Lock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ClinicalCasesTab } from '@/components/ClinicalCasesTab';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { SubscriptionPlan } from '@/types/subscription';
import { toast } from 'sonner';
import type { ScaleDetailPageData, ScaleItem, RelatedScale } from '@/types/scale-detail';

interface ScalePageProps {
  params: Promise<{ scaleId: string }>;
}

interface InterpretationData {
  id: string;
  overview: string;
  structure: string;
  psychometricProperties: string;
  interpretation: string;
  usageGuidelines: string;
  clinicalApplications: string;
  version: number;
  viewCount: number;
  helpfulCount: number;
}

// Client-side function to fetch scale details
async function getScaleDetails(scaleId: string, checkAccess: boolean = true): Promise<ScaleDetailPageData | null> {
  try {
    const response = await fetch(`/api/scales/${scaleId}${checkAccess ? '?checkAccess=true' : ''}`, {
      cache: 'no-store'
    });

    if (response.status === 403) {
      const error = await response.json();
      throw { status: 403, message: error.reason, requiresUpgrade: error.requiresUpgrade };
    }

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching scale details:', error);
    if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
      throw error;
    }
    return null;
  }
}

export default function ScalePage({ params }: ScalePageProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const {
    plan,
    checkFeatureAccess,
    hasReachedLimit,
    getRemainingUsage,
    canUseFeature,
    features
  } = useSubscription();

  const [scaleId, setScaleId] = useState<string>('');
  const [data, setData] = useState<ScaleDetailPageData | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpfulLoading, setHelpfulLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessError, setAccessError] = useState<{ message: string; requiresUpgrade?: string } | null>(null);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setScaleId(resolvedParams.scaleId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!scaleId) return;

    async function fetchData() {
      try {
        // 先检查权限
        const hasAccess = await checkFeatureAccess('scale_view');

        if (!hasAccess) {
          setAccessDenied(true);
          setAccessError({
            message: '您的量表查看次数已用完',
            requiresUpgrade: SubscriptionPlan.PROFESSIONAL
          });
          setLoading(false);
          return;
        }

        const result = await getScaleDetails(scaleId);
        setData(result);
        setLoading(false);

        if (result?.scale) {
          // 获取解读（如果有权限）
          if (canUseFeature('aiInterpretations')) {
            const interpResponse = await fetch(`/api/scales/${scaleId}/interpretation?language=${language}`);
            if (interpResponse.ok) {
              const interpData = await interpResponse.json();
              if (interpData.success) {
                setInterpretation(interpData.interpretation);
              }
            }
          }
        }
      } catch (error: any) {
        if (error?.status === 403) {
          setAccessDenied(true);
          setAccessError(error);
        }
        setLoading(false);
      }
    }

    fetchData();
  }, [scaleId, checkFeatureAccess, canUseFeature, language]);

  // 处理AI解读点击
  const handleAIInterpretation = async () => {
    if (!canUseFeature('aiInterpretations')) {
      toast.error('AI解读功能需要专业版或更高级别订阅', {
        action: {
          label: '查看升级选项',
          onClick: () => router.push('/pricing')
        }
      });
      return;
    }

    const hasAccess = await checkFeatureAccess('ai_interpretation');
    if (!hasAccess) {
      return;
    }

    // 跳转到AI解读页面
    router.push(`/insights/interpretation/${scaleId}`);
  };

  // 处理PDF导出
  const handlePDFExport = async () => {
    if (features.pdfWatermark) {
      toast.info('免费版导出的PDF将包含水印', {
        action: {
          label: '升级去除水印',
          onClick: () => router.push('/pricing')
        }
      });
    }

    // 执行导出逻辑
    window.open(`/api/scales/${scaleId}/export?format=pdf&watermark=${features.pdfWatermark}`);
  };

  // 处理数据导出
  const handleDataExport = async () => {
    if (!canUseFeature('dataExport')) {
      toast.error('数据导出功能需要专业版或更高级别订阅', {
        action: {
          label: '查看升级选项',
          onClick: () => router.push('/pricing')
        }
      });
      return;
    }

    // 执行导出逻辑
    window.open(`/api/scales/${scaleId}/export?format=excel`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 访问被拒绝
  if (accessDenied) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <UpgradePrompt
          feature="量表详情查看"
          currentPlan={plan}
          requiredPlan={accessError?.requiresUpgrade as SubscriptionPlan || SubscriptionPlan.PROFESSIONAL}
          message={accessError?.message}
        />
      </div>
    );
  }

  if (!data?.scale) {
    notFound();
  }

  const { scale, items = [], relatedScales = [], clinicalCases = [], reportTemplates = [] } = data;
  const displayName = language === 'zh' ? scale.name : (scale.nameEn || scale.name);

  // 显示剩余查看次数提示
  const remainingViews = getRemainingUsage('scaleViews');
  const showViewsWarning = remainingViews !== null && remainingViews <= 3;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 剩余查看次数警告 */}
      {showViewsWarning && (
        <Card className="mb-4 border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                本月剩余量表查看次数：{remainingViews} 次
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => router.push('/pricing')}>
              升级获取无限查看
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 返回按钮 */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("common.back", "返回")}
      </Button>

      {/* 量表基本信息 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{displayName}</CardTitle>
              {scale.nameEn && language === 'zh' && (
                <p className="text-lg text-muted-foreground mb-4">{scale.nameEn}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{scale.acronym}</Badge>
                <Badge variant="secondary">{scale.categoryName || t("scales.uncategorized", "未分类")}</Badge>
                <Badge variant={scale.validationStatus === 'published' ? 'default' : 'secondary'}>
                  {scale.validationStatus}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FavoriteButton
                scaleId={scale.id}
                variant="default"
                size="default"
              />
              <Button
                variant="outline"
                onClick={handleAIInterpretation}
                disabled={!canUseFeature('aiInterpretations') || hasReachedLimit('aiInterpretations')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI解读
                {!canUseFeature('aiInterpretations') && <Lock className="w-3 h-3 ml-1" />}
              </Button>
              <Button
                variant="outline"
                onClick={handlePDFExport}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF导出
                {features.pdfWatermark && <Badge className="ml-1 text-xs" variant="secondary">带水印</Badge>}
              </Button>
            </div>
          </div>

          <CardDescription className="text-base mt-4">
            {scale.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("scales.items_count", "题目数")}</p>
                <p className="font-medium">{scale.itemsCount || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("scales.admin_time", "施测时间")}</p>
                <p className="font-medium">
                  {scale.administrationTime ? `${scale.administrationTime} ${t("scales.minutes", "分钟")}` : t("scales.unknown", "未知")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("scales.target_population", "目标人群")}</p>
                <p className="font-medium">{scale.targetPopulation || t("scales.general", "通用")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("scales.views", "浏览量")}</p>
                <p className="font-medium">{scale.usageCount || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细信息标签页 */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="items">{t("scales.items", "量表题目")}</TabsTrigger>
          <TabsTrigger value="interpretation">
            {t("scales.interpretation", "解读指南")}
            {!canUseFeature('aiInterpretations') && <Lock className="w-3 h-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="cases">
            {t("scales.cases", "临床案例")}
            {!canUseFeature('caseStudyAccess') && <Lock className="w-3 h-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="related">{t("scales.related", "相关量表")}</TabsTrigger>
          <TabsTrigger value="copyright">{t("scales.copyright", "版权信息")}</TabsTrigger>
        </TabsList>

        {/* 量表题目 */}
        <TabsContent value="items">
          {items.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("scales.items_list", "题目列表")}</CardTitle>
                <CardDescription>
                  {t("scales.total_items", `共 ${items.length} 个题目`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <Badge variant="outline" className="mt-1">
                          {item.itemNumber}
                        </Badge>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">
                            {language === 'zh' ? item.question : (item.questionEn || item.question)}
                          </p>
                          {item.dimension && (
                            <Badge variant="secondary" className="text-xs">
                              {item.dimension}
                            </Badge>
                          )}
                          {item.responseOptions && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-muted-foreground">
                                {t("scales.response_options", "选项")}:
                              </p>
                              <div className="pl-4">
                                {JSON.parse(item.responseOptions).map((option: string, idx: number) => (
                                  <p key={idx} className="text-sm">
                                    {idx}. {option}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">{t("scales.no_items", "暂无题目信息")}</h3>
                <p className="text-muted-foreground">
                  {t("scales.items_coming_soon", "题目信息正在整理中，敬请期待")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 解读指南 */}
        <TabsContent value="interpretation">
          {!canUseFeature('aiInterpretations') ? (
            <UpgradePrompt
              feature="AI解读功能"
              currentPlan={plan}
              requiredPlan={SubscriptionPlan.PROFESSIONAL}
              message="升级到专业版，获取专业的量表解读指南"
            />
          ) : interpretation ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("scales.interpretation_guide", "解读指南")}</CardTitle>
                <CardDescription>
                  {t("scales.ai_generated", "由AI生成的专业解读")}
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                {/* 显示解读内容 */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">概述</h3>
                    <p>{interpretation.overview}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">结构</h3>
                    <p>{interpretation.structure}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">心理测量学属性</h3>
                    <p>{interpretation.psychometricProperties}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">{t("scales.no_interpretation", "暂无解读")}</h3>
                <Button onClick={handleAIInterpretation}>
                  生成AI解读
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 临床案例 */}
        <TabsContent value="cases">
          {!canUseFeature('caseStudyAccess') ? (
            <UpgradePrompt
              feature="临床案例库"
              currentPlan={plan}
              requiredPlan={SubscriptionPlan.PROFESSIONAL}
              message="升级到专业版，查看真实临床案例"
            />
          ) : (
            <ClinicalCasesTab cases={clinicalCases} scaleId={scale.id} />
          )}
        </TabsContent>

        {/* 相关量表 */}
        <TabsContent value="related">
          {relatedScales.length > 0 ? (
            <div className="grid gap-4">
              {relatedScales.map((relatedScale) => (
                <Card key={relatedScale.id} className="p-4">
                  <Link href={`/scales/${relatedScale.id}`}>
                    <div className="flex items-center justify-between hover:bg-muted/50 transition-colors rounded p-2">
                      <div>
                        <h4 className="font-medium">{relatedScale.name}</h4>
                        <p className="text-sm text-muted-foreground">{relatedScale.description}</p>
                      </div>
                      <Badge variant="outline">{relatedScale.acronym}</Badge>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">{t("scales.no_related", "暂无相关量表")}</h3>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 版权信息 */}
        <TabsContent value="copyright">
          <Card>
            <CardHeader>
              <CardTitle>{t("scales.copyright_info", "版权信息")}</CardTitle>
            </CardHeader>
            <CardContent>
              {scale.copyrightInfo ? (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap">{scale.copyrightInfo}</p>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {t("scales.need_authorization", "需要使用授权？")}
                    </p>
                    <Button variant="outline" asChild>
                      <Link href={`/scales/copyright/create?scaleId=${scale.id}`}>
                        {t("scales.apply_copyright", "申请版权授权")}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t("scales.no_copyright_info", "暂无版权信息")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}