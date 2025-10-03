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
  ExternalLink,
  CheckCircle,
  AlertCircle,
  BookOpen,
  BarChart3,
  Plus
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

interface ScalePageProps {
  params: Promise<{ scaleId: string }>;
}

interface ScaleData {
  scale: any;
  items: any[];
  userInteraction: any;
  relatedScales: any[];
  statistics: any;
  meta: any;
}

// Client-side function to fetch scale details
async function getScaleDetails(scaleId: string): Promise<ScaleData | null> {
  try {
    const response = await fetch(`/api/scales/${scaleId}`, {
      cache: 'no-store' // 确保获取最新数据
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching scale details:', error);
    return null;
  }
}

export default function ScalePage({ params }: ScalePageProps) {
  const { t } = useLanguage();
  const [scaleId, setScaleId] = useState<string>('');
  const [data, setData] = useState<ScaleData | null>(null);
  const [loading, setLoading] = useState(true);

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
      const result = await getScaleDetails(scaleId);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [scaleId]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4" />
        <p>{t('common.loading', '加载中...')}</p>
      </div>
    </div>;
  }

  if (!data?.scale) {
    notFound();
  }

  const { scale, items, userInteraction, relatedScales, statistics, meta } = data;

  // 解析心理测量学属性
  const psychometrics = scale.psychometricProperties || {};

  // 获取验证状态显示
  const getValidationBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{t('scale.validated')}</Badge>;
      case 'draft':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />{t('scale.draft')}</Badge>;
      case 'published':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />{t('scale.published')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('scale.back_to_search')}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{t('scale.scale_details')}</span>
                <span className="text-sm font-medium">{scale.acronym}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <FavoriteButton
                scaleId={scale.id}
                size="sm"
                showCount={true}
              />
              {userInteraction.canDownload && (
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('scale.download')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 量表基本信息 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-2xl">{scale.name}</CardTitle>
                      {getValidationBadge(scale.validationStatus)}
                    </div>
                    {scale.nameEn && (
                      <CardDescription className="text-lg text-muted-foreground mb-2">
                        {scale.nameEn}
                      </CardDescription>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {scale.acronym}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {scale.administrationTime} {t('scale.minutes')}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {scale.itemsCount} {t('scale.items')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">{t('scale.overview')}</TabsTrigger>
                    <TabsTrigger value="items">{t('scale.items')}</TabsTrigger>
                    <TabsTrigger value="psychometrics">{t('scale.psychometrics')}</TabsTrigger>
                    <TabsTrigger value="cases">临床案例</TabsTrigger>
                    <TabsTrigger value="references">{t('scale.references')}</TabsTrigger>
                    <TabsTrigger value="copyright">版权许可</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{t('scale.description')}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {scale.description}
                      </p>
                      {scale.descriptionEn && (
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2 italic">
                          {scale.descriptionEn}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">{t('scale.target_population')}</h4>
                        <p className="text-sm text-muted-foreground">{scale.targetPopulation}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">{t('scale.age_range')}</h4>
                        <p className="text-sm text-muted-foreground">{scale.ageRange}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">{t('scale.assessment_domains')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {scale.domains.map((domain: string, index: number) => (
                          <Badge key={domain || index} variant="outline">{domain}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">{t('scale.scoring_method')}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {scale.scoringMethod}
                      </p>
                    </div>

                    {scale.copyrightInfo && (
                      <div>
                        <h4 className="font-semibold mb-2">{t('scale.copyright_info')}</h4>
                        <p className="text-sm text-muted-foreground">{scale.copyrightInfo}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="items" className="space-y-4">
                    {meta.hasItems ? (
                      <div className="space-y-3">
                        { }
                        {items.map((item: any) => (
                          <Card key={item.id} className="p-4">
                            <div className="flex items-start space-x-3">
                              <Badge variant="outline" className="mt-1">
                                {item.itemNumber}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">{item.question}</p>
                                {item.questionEn && (
                                  <p className="text-sm text-muted-foreground italic mb-2">
                                    {item.questionEn}
                                  </p>
                                )}
                                {item.responseOptions.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">{t('scale.options')}：</span>
                                    {item.responseOptions.join(' / ')}
                                  </div>
                                )}
                                {item.dimension && (
                                  <Badge variant="secondary" className="text-xs mt-2">
                                    {item.dimension}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{t('scale.no_items_available')}</p>
                        <p className="text-sm">{t('scale.download_for_full_items')}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="psychometrics" className="space-y-4">
                    {psychometrics && Object.keys(psychometrics).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {psychometrics.reliability && (
                          <Card className="p-4">
                            <h4 className="font-semibold mb-2 flex items-center">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              {t('scale.reliability_indicators')}
                            </h4>
                            <div className="space-y-2 text-sm">
                              {psychometrics.reliability.cronbachAlpha && (
                                <div className="flex justify-between">
                                  <span>Cronbach&apos;s α</span>
                                  <span className="font-medium">{psychometrics.reliability.cronbachAlpha}</span>
                                </div>
                              )}
                              {psychometrics.reliability.testRetest && (
                                <div className="flex justify-between">
                                  <span>{t('scale.test_retest_reliability')}</span>
                                  <span className="font-medium">{psychometrics.reliability.testRetest}</span>
                                </div>
                              )}
                              {psychometrics.reliability.interRater && (
                                <div className="flex justify-between">
                                  <span>{t('scale.inter_rater_reliability')}</span>
                                  <span className="font-medium">{psychometrics.reliability.interRater}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        )}

                        {psychometrics.validity && (
                          <Card className="p-4">
                            <h4 className="font-semibold mb-2 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {t('scale.validity_indicators')}
                            </h4>
                            <div className="space-y-2 text-sm">
                              {psychometrics.validity.sensitivity && (
                                <div className="flex justify-between">
                                  <span>{t('scale.sensitivity')}</span>
                                  <span className="font-medium">{psychometrics.validity.sensitivity}</span>
                                </div>
                              )}
                              {psychometrics.validity.specificity && (
                                <div className="flex justify-between">
                                  <span>{t('scale.specificity')}</span>
                                  <span className="font-medium">{psychometrics.validity.specificity}</span>
                                </div>
                              )}
                              {psychometrics.validity.constructValidity && (
                                <div className="flex justify-between">
                                  <span>{t('scale.construct_validity')}</span>
                                  <span className="font-medium">{psychometrics.validity.constructValidity}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        )}

                        {psychometrics.cutoffScores && (
                          <Card className="p-4 md:col-span-2">
                            <h4 className="font-semibold mb-2">{t('scale.cutoff_scores')}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              {Object.entries(psychometrics.cutoffScores).map(([level, score]) => (
                                <div key={level} className="text-center p-2 bg-secondary rounded">
                                  <div className="font-medium">{level}</div>
                                  <div className="text-muted-foreground">{score as string}{t('scale.points')}</div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{t('scale.no_psychometric_data')}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="cases" className="space-y-4">
                    <ClinicalCasesTab scaleId={scale.id} scaleAcronym={scale.acronym} />
                  </TabsContent>

                  <TabsContent value="references" className="space-y-4">
                    {scale.references.length > 0 ? (
                      <div className="space-y-3">
                        {scale.references.map((reference: string, index: number) => (
                          <Card key={reference.substring(0, 50) || index} className="p-4">
                            <p className="text-sm leading-relaxed">{reference}</p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{t('scale.no_references_available')}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="copyright" className="space-y-4">
                    {/* 版权许可信息 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          <span>版权和许可信息</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {scale.copyrightInfo && (
                          <div>
                            <h4 className="font-semibold mb-2">版权声明</h4>
                            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                              {scale.copyrightInfo}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-4 bg-blue-50 border-blue-200">
                            <h4 className="font-semibold mb-2 text-blue-900">需要使用许可？</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              如果您需要使用此量表，我们可以帮助您联系版权方获取使用许可。
                            </p>
                            <Link href={`/scales/copyright/create?scaleId=${scale.id}`}>
                              <Button size="sm" className="w-full">
                                <Plus className="w-3 h-3 mr-2" />
                                创建版权工单
                              </Button>
                            </Link>
                          </Card>

                          <Card className="p-4 bg-green-50 border-green-200">
                            <h4 className="font-semibold mb-2 text-green-900">查看现有工单</h4>
                            <p className="text-sm text-green-800 mb-3">
                              查看您已提交的版权申请和联系工单状态。
                            </p>
                            <Link href="/scales/copyright/tickets">
                              <Button size="sm" variant="outline" className="w-full">
                                <Eye className="w-3 h-3 mr-2" />
                                我的工单
                              </Button>
                            </Link>
                          </Card>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <h5 className="font-semibold mb-2 text-yellow-900">重要提醒</h5>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• 商业用途通常需要付费许可</li>
                            <li>• 学术研究可能享有免费或优惠许可</li>
                            <li>• 建议在使用前确认具体的许可要求</li>
                            <li>• 我们的团队将协助您与版权方建立联系</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 统计信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('scale.usage_statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-2 text-blue-500" />
                    {t('scale.total_views')}
                  </span>
                  <span className="font-semibold">{statistics.totalViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-2 text-green-500" />
                    {t('scale.recent_views')}
                  </span>
                  <span className="font-semibold">{statistics.recentViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    {t('scale.favorite_count')}
                  </span>
                  <span className="font-semibold">{statistics.totalFavorites}</span>
                </div>
              </CardContent>
            </Card>

            {/* 量表信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('scale.scale_information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t('scale.items_count')}</span>
                  <span className="font-medium">{scale.itemsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('scale.dimensions_count')}</span>
                  <span className="font-medium">{scale.dimensionsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('scale.administration_time')}</span>
                  <span className="font-medium">{scale.administrationTime} {t('scale.minutes')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('scale.validation_status')}</span>
                  <span>{getValidationBadge(scale.validationStatus)}</span>
                </div>
                <div>
                  <span className="text-sm">{t('scale.supported_languages')}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scale.languages.map((lang: string) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang === 'zh-CN' ? t('scale.chinese') : lang === 'en-US' ? 'English' : lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 相关量表 */}
            {relatedScales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('scale.related_scales')}</CardTitle>
                  <CardDescription>
                    {t('scale.related_scales_description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedScales.map((relatedScale: any) => (
                      <Link
                        key={relatedScale.id}
                        href={`/scales/${relatedScale.id}`}
                        className="block"
                      >
                        <Card className="p-3 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">
                                {relatedScale.name}
                              </h5>
                              <p className="text-xs text-muted-foreground mb-2">
                                {relatedScale.acronym} • {relatedScale.itemsCount} {t('scale.items')}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {relatedScale.description.substring(0, 80)}...
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}