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
  ClipboardCheck
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
async function getScaleDetails(scaleId: string): Promise<ScaleDetailPageData | null> {
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
  const { t, language } = useLanguage();
  const router = useRouter();
  const [scaleId, setScaleId] = useState<string>('');
  const [data, setData] = useState<ScaleDetailPageData | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpfulLoading, setHelpfulLoading] = useState(false);

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

      if (result?.scale) {
        const interpResponse = await fetch(`/api/scales/${scaleId}/interpretation?language=${language}`);
        if (interpResponse.ok) {
          const interpData = await interpResponse.json();
          if (interpData.success) {
            setInterpretation(interpData.interpretation);
          }
        }
      }
    }
    fetchData();
  }, [scaleId, language]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border mx-auto mb-4" />
        <p>{t('common.loading', '加载中...')}</p>
      </div>
    </div>;
  }

  if (!data?.scale) {
    notFound();
  }

  const { scale, items, userInteraction, relatedScales, statistics, meta } = data;

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

  const handleMarkHelpful = async () => {
    if (!interpretation || helpfulLoading) return;

    setHelpfulLoading(true);
    try {
      const response = await fetch(`/api/interpretations/${interpretation.id}/helpful`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setInterpretation({
          ...interpretation,
          helpfulCount: result.helpfulCount,
        });
      }
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    } finally {
      setHelpfulLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50">
      {/* 头部导航 - 固定 */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border/80 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('scale.back_to_search')}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{t('scale.scale_details')}</span>
                <span className="text-sm font-semibold text-primary">{scale.acronym}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link href={`/scales/${scale.id}/preview`}>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0 after:shadow-none">
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  {t('scale.start_assessment')}
                </Button>
              </Link>
              <FavoriteButton
                scaleId={scale.id}
                size="sm"
                showCount={true}
              />
              {userInteraction.canDownload && (
                <Button size="sm" className="shadow-sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('scale.download')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 量表基本信息 */}
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <CardTitle className="text-3xl font-bold text-foreground">{scale.name}</CardTitle>
                    {getValidationBadge(scale.validationStatus)}
                  </div>
                  {scale.nameEn && (
                    <CardDescription className="text-lg text-muted-foreground mb-3 font-medium">
                      {scale.nameEn}
                    </CardDescription>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="font-medium">{scale.acronym}</span>
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{scale.administrationTime} {t('scale.minutes')}</span>
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{scale.itemsCount} {t('scale.items')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mt-3">
                  <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
                  <TabsTrigger value="interpretation">{t('scale.professional_interpretation_tab')}</TabsTrigger>
                  <TabsTrigger value="items">{t('scale.items')}</TabsTrigger>
                  <TabsTrigger value="cases">{t('scale.clinical_cases_tab')}</TabsTrigger>
                  <TabsTrigger value="copyright">{t('scale.copyright_tab')}</TabsTrigger>
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

                <TabsContent value="interpretation" className="space-y-6">
                  {interpretation ? (
                    <>
                      <div className="bg-primary/10 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">{t('scale.ai_generated_interpretation')}</h4>
                          <Badge variant="outline" className="text-xs">v{interpretation.version}</Badge>
                        </div>
                        <p className="text-sm text-primary">
                          {t('scale.ai_generated_note')}{interpretation.viewCount}
                        </p>
                      </div>

                      <div className="space-y-6">
                        {interpretation.overview && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center text-lg">
                              <BookOpen className="w-5 h-5 mr-2 text-primary" />
                              {t('scale.scale_overview_heading')}
                            </h4>
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                              {interpretation.overview}
                            </div>
                          </div>
                        )}

                        {interpretation.structure && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center text-lg">
                              <BarChart3 className="w-5 h-5 mr-2 text-success" />
                              {t('scale.scale_structure_heading')}
                            </h4>
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                              {interpretation.structure}
                            </div>
                          </div>
                        )}

                        {interpretation.psychometricProperties && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center text-lg">
                              <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                              {t('scale.psychometric_properties_heading')}
                            </h4>
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                              {interpretation.psychometricProperties}
                            </div>
                          </div>
                        )}

                        {interpretation.interpretation && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center text-lg">
                              <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                              {t('scale.result_interpretation_heading')}
                            </h4>
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                              {interpretation.interpretation}
                            </div>
                          </div>
                        )}

                        {interpretation.usageGuidelines && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center text-lg">
                              <Users className="w-5 h-5 mr-2 text-indigo-600" />
                              {t('scale.usage_guidelines_heading')}
                            </h4>
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                              {interpretation.usageGuidelines}
                            </div>
                          </div>
                        )}

                        {interpretation.clinicalApplications && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center text-lg">
                              <Heart className="w-5 h-5 mr-2 text-destructive" />
                              {t('scale.clinical_applications_heading')}
                            </h4>
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                              {interpretation.clinicalApplications}
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold mb-3">{t('scale.helpful_question')}</h5>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleMarkHelpful}
                            disabled={helpfulLoading}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            {t('scale.mark_helpful')} ({interpretation.helpfulCount})
                          </Button>
                          <Button size="sm" variant="outline">
                            {t('scale.feedback_issue')}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg mb-2">{t('scale.no_interpretation_title')}</p>
                      <p className="text-sm">{t('scale.no_interpretation_desc')}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  {meta.hasItems ? (
                    <div className="space-y-3">
                      {/* Typed iteration */}
                      {items.map((item: ScaleItem) => (
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

                <TabsContent value="cases" className="space-y-4">
                  <ClinicalCasesTab scaleId={scale.id} scaleAcronym={scale.acronym} />
                </TabsContent>

                <TabsContent value="copyright" className="space-y-4">
                  {/* 版权许可信息 */}
                  <div>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span>{t('scale.copyright_license_info')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {scale.copyrightInfo && (
                        <div>
                          <h4 className="font-semibold mb-2">{t('scale.copyright_statement_heading')}</h4>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                            {scale.copyrightInfo}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-primary/10 border-blue-200">
                          <h4 className="font-semibold mb-2 text-blue-900">{t('scale.need_license_question')}</h4>
                          <p className="text-sm text-primary mb-3">
                            {t('scale.need_license_desc')}
                          </p>
                          <Link href={`/scales/copyright/create?scaleId=${scale.id}`}>
                            <Button size="sm" className="w-full">
                              <Plus className="w-3 h-3 mr-2" />
                              {t('scale.create_copyright_ticket')}
                            </Button>
                          </Link>
                        </Card>

                        <Card className="p-4 bg-success/10 border-green-200">
                          <h4 className="font-semibold mb-2 text-green-900">{t('scale.view_existing_tickets')}</h4>
                          <p className="text-sm text-green-800 mb-3">
                            {t('scale.view_tickets_desc')}
                          </p>
                          <Link href="/scales/copyright/tickets">
                            <Button size="sm" variant="outline" className="w-full">
                              <Eye className="w-3 h-3 mr-2" />
                              {t('scale.my_tickets')}
                            </Button>
                          </Link>
                        </Card>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2 text-yellow-900">{t('scale.important_reminder')}</h5>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>{t('scale.commercial_license_note')}</li>
                          <li>{t('scale.academic_license_note')}</li>
                          <li>{t('scale.confirm_requirements_note')}</li>
                          <li>{t('scale.team_assist_note')}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
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
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {relatedScales.map((relatedScale: RelatedScale) => (
                      <Link
                        key={relatedScale.id}
                        href={`/scales/${relatedScale.id}`}
                        className="block px-6 py-4 hover:bg-muted/50 transition-colors first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm mb-1.5">
                              {relatedScale.name}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">
                              {relatedScale.acronym} • {relatedScale.itemsCount} {t('scale.items')}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {relatedScale.description?.substring(0, 80) || ''}...
                            </p>
                          </div>
                        </div>
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
    </div>
  );
}
