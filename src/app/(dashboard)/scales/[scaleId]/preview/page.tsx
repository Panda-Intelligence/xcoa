'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Play,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
  Info,
  Smartphone,
  Monitor,
  TabletSmartphone,
  Save,
  Download,
  Share,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Timer,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';
import { MobileFrame, PadFrame, DesktopFrame } from '@/components/device/Frames';
import { QuestionRenderer } from '@/components/scale-preview/QuestionRenderer';
import { FeatureGate } from '@/components/subscription/feature-gate';
import { ENTERPRISE_FEATURES } from '@/constants/plans';
import { toast } from 'sonner';
import { createId } from '@paralleldrive/cuid2';

interface ScalePreviewPageProps {
  params: Promise<{ scaleId: string }>;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type ViewMode = 'preview' | 'interactive';

interface Answer {
  itemNumber: number;
  selectedOption?: string; // 单选题答案
  selectedOptions?: string[]; // 多选题答案
  textValue?: string; // 开放性题目答案
  dateValue?: string; // 日期题目答案
  drawingValue?: string; // 画图题目答案 (base64)
  score?: number;
  timestamp: Date;
}

export default function ScalePreviewPage({ params }: ScalePreviewPageProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [scaleId, setScaleId] = useState<string>('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 交互式预览状态
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // 报告相关状态
  const [sessionId, setSessionId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setScaleId(resolvedParams.scaleId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!scaleId) return;

    fetch(`/api/scales/${scaleId}/preview`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          notFound();
        } else {
          setPreviewData(data);
        }
      })
      .catch(err => {
        console.error('Failed to load preview:', err);
        notFound();
      })
      .finally(() => setLoading(false));
  }, [scaleId]);

  // 自动进入下一题（选择答案后自动触发）
  const autoAdvanceToNext = useCallback(() => {
    const preview = previewData?.preview;
    if (!preview?.items) return;

    if (currentItemIndex < preview.items.length - 1) {
      setIsTransitioning(true);
      // 延迟0.8秒后自动进入下一题，给用户确认选择的时间
      setTimeout(() => {
        setCurrentItemIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 800);
    } else {
      // 最后一题，延迟1.2秒后显示结果
      setTimeout(() => {
        setShowResults(true);
      }, 1200);
    }
  }, [currentItemIndex, previewData?.preview?.items]);

  // 处理答案选择
  const handleAnswerSelect = useCallback((itemNumber: number, value: any, answerType: 'single' | 'multiple' | 'text' | 'date' | 'drawing' = 'single') => {
    const timestamp = new Date();

    if (!value || (Array.isArray(value) && value.length === 0)) {
      console.error('选择的答案为空或undefined!');
      return;
    }

    setAnswers(prev => {
      console.log('当前答案数组:', prev);
      const existing = prev.find(a => a.itemNumber === itemNumber);
      let newAnswers: Answer[];

      const newAnswer: Answer = {
        itemNumber,
        timestamp,
        ...(answerType === 'single' && { selectedOption: value }),
        ...(answerType === 'multiple' && { selectedOptions: value }),
        ...(answerType === 'text' && { textValue: value }),
        ...(answerType === 'date' && { dateValue: value }),
        ...(answerType === 'drawing' && { drawingValue: value }),
      };

      if (existing) {
        newAnswers = prev.map(a =>
          a.itemNumber === itemNumber ? newAnswer : a
        );
        console.log('更新现有答案');
      } else {
        newAnswers = [...prev, newAnswer];
        console.log('添加新答案');
      }
      console.log('新答案数组:', newAnswers);
      return newAnswers;
    });

    if (!completedItems.includes(itemNumber)) {
      setCompletedItems(prev => {
        const newCompleted = [...prev, itemNumber];
        console.log('更新已完成题目:', newCompleted);
        return newCompleted;
      });
      // 自动进入下一题
      autoAdvanceToNext();
    } else {
      console.log('题目已经完成过');
    }
    console.log('=== 答题调试结束 ===');
  }, [completedItems, autoAdvanceToNext]);

  // 开始交互模式
  const startInteractiveMode = () => {
    console.log('开始交互模式...');
    setViewMode('interactive');
    setStartTime(new Date());
    setCurrentItemIndex(0);
    setAnswers([]);
    setCompletedItems([]);
    setShowResults(false);
    // 生成新的 sessionId
    setSessionId(`session_${createId()}`);

    // 如果当前数据不是完整模式，重新获取完整数据
    if (!previewData?.preview?.isFullMode) {
      console.log('加载完整模式数据...');
      setLoading(true);
      fetch(`/api/scales/${scaleId}/preview?mode=full`)
        .then(res => res.json())
        .then(data => {
          console.log('完整模式数据加载结果:', data);
          if (data.error) {
            console.error('Failed to load full scale data:', data.error);
          } else {
            setPreviewData(data);
            console.log('设置了新的预览数据:', data.preview?.items?.length, '个题目');
          }
        })
        .catch(err => {
          console.error('Failed to load full scale:', err);
        })
        .finally(() => setLoading(false));
    } else {
      console.log('已经是完整模式，题目数量:', previewData.preview.items?.length);
    }
  };

  // 保存结果到后端
  const handleSaveResults = async () => {
    if (answers.length === 0) {
      toast.error(t('scale_preview.no_answers_to_save', 'No answers to save'));
      return;
    }

    setIsSaving(true);

    try {
      // 将答案转换为 API 所需的格式
      const responses = answers.map(answer => {
        // 找到对应的题目以获取 itemId
        const item = previewData?.preview?.items?.find(
          (i: any) => i.itemNumber === answer.itemNumber
        );

        if (!item) {
          console.warn(`找不到题目 ${answer.itemNumber} 的 itemId`);
          return null;
        }

        // 确定response值
        let response = answer.selectedOption ||
                      answer.selectedOptions ||
                      answer.textValue ||
                      answer.dateValue ||
                      answer.drawingValue;

        // 计算responseValue (用于评分)
        let responseValue: number | undefined = undefined;
        if (answer.selectedOption && item.responseOptions) {
          responseValue = item.responseOptions.indexOf(answer.selectedOption);
        } else if (answer.selectedOptions && item.responseOptions) {
          responseValue = answer.selectedOptions.reduce((sum: number, option: string) => {
            return sum + item.responseOptions.indexOf(option);
          }, 0);
        }

        return {
          itemId: item.id,
          itemNumber: answer.itemNumber,
          response,
          responseValue,
          completedAt: answer.timestamp,
        };
      }).filter(Boolean); // 过滤掉 null 值

      if (responses.length === 0) {
        toast.error(t('scale_preview.no_valid_items', 'Unable to find valid item data'));
        setIsSaving(false);
        return;
      }

      const requestBody = {
        sessionId: sessionId || `session_${createId()}`,
        responses,
      };

      const response = await fetch(`/api/scales/${scaleId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || t('scale_preview.save_failed', 'Save failed'));
      }

      // 更新 sessionId
      setSessionId(data.sessionId);
      toast.success(t('scale_preview.save_success', 'Results saved successfully'));

      return data.sessionId;
    } catch (error) {
      console.error('保存结果失败:', error);
      toast.error(error instanceof Error ? error.message : t('scale_preview.save_failed', 'Failed to save results'));
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // 导出报告
  const handleExportReport = async () => {
    try {
      setIsGeneratingReport(true);

      // 如果还没有保存，先保存结果
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        try {
          currentSessionId = await handleSaveResults();
          if (!currentSessionId) {
            return; // 保存失败，不继续生成报告
          }
        } catch (error) {
          return; // 保存失败，不继续生成报告
        }
      }

      // 生成报告
      const response = await fetch(`/api/scales/${scaleId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          reportType: 'pdf',
          includeCharts: true,
          includeInterpretation: true,
          includeRecommendations: true,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || t('scale_preview.report_generation_failed', 'Failed to generate report'));
      }

      toast.success(t('scale_preview.report_generated', 'Report generated successfully'));

      // 跳转到报告详情页
      if (data.report?.reportUrl) {
        router.push(data.report.reportUrl);
      }
    } catch (error) {
      console.error('生成报告失败:', error);
      toast.error(error instanceof Error ? error.message : t('scale_preview.report_generation_failed', 'Failed to generate report'));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 计算总分和专业解读
  const calculateScore = useCallback(() => {

    if (!previewData?.preview?.items) {
      console.log('没有预览数据或题目数据');
      return { total: 0, interpretation: t('scale_preview.no_data', 'No data') };
    }

    if (answers.length === 0) {
      console.log('没有任何答案');
      return { total: 0, interpretation: t('scale_preview.not_started', 'Not yet started') };
    }

    const total = answers.reduce((sum, answer, index) => {
      console.log(`处理答案${index + 1}:`, answer);
      const item = previewData.preview.items.find((i: any) => i.itemNumber === answer.itemNumber);
      console.log('找到对应题目:', item ? '是' : '否');

      if (item?.responseOptions && item.responseOptions.length > 0) {
        let score = 0;

        // 单选题计分
        if (answer.selectedOption) {
          const optionIndex = item.responseOptions.indexOf(answer.selectedOption);
          score = optionIndex >= 0 ? optionIndex : 0;
        }

        // 多选题计分
        if (answer.selectedOptions) {
          score = answer.selectedOptions.reduce((total, option) => {
            const optionIndex = item.responseOptions.indexOf(option);
            return total + (optionIndex >= 0 ? optionIndex : 0);
          }, 0);
        }

        // 文本题、日期题、画图题暂时不计分，或可以根据需要设置默认分数
        if (answer.textValue || answer.dateValue || answer.drawingValue) {
          score = 1; // 完成即得1分
        }

        return sum + score;
      }
      console.log('题目没有选项或匹配失败');
      return sum;
    }, 0);

    console.log('最终总分:', total);

    // 根据量表的切分值提供解读
    const scoring = previewData.scoring;
    let interpretation = '';

    if (previewData.scale.acronym === 'PHQ-9') {
      if (total <= 4) interpretation = t('scale_preview.phq9_minimal', 'Minimal depression');
      else if (total <= 9) interpretation = t('scale_preview.phq9_mild', 'Mild depression');
      else if (total <= 14) interpretation = t('scale_preview.phq9_moderate', 'Moderate depression');
      else if (total <= 19) interpretation = t('scale_preview.phq9_moderately_severe', 'Moderately severe depression');
      else interpretation = t('scale_preview.phq9_severe', 'Severe depression');
    } else if (previewData.scale.acronym === 'GAD-7') {
      if (total <= 4) interpretation = t('scale_preview.gad7_minimal', 'Minimal anxiety');
      else if (total <= 9) interpretation = t('scale_preview.gad7_mild', 'Mild anxiety');
      else if (total <= 14) interpretation = t('scale_preview.gad7_moderate', 'Moderate anxiety');
      else interpretation = t('scale_preview.gad7_severe', 'Severe anxiety');
    } else {
      interpretation = t('scale_preview.total_score_format', 'Total score: {{score}} points', { score: total });
    }

    console.log('最终解读:', interpretation);
    console.log('=== 计分调试结束 ===');
    return { total, interpretation };
  }, [answers, previewData]);

  // 获取耗时
  const getElapsedTime = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime.getTime()) / 1000 / 60); // 分钟
  };

  // 设备模式样式
  const getDeviceStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          container: 'max-w-sm mx-auto',
          padding: 'px-3 py-4',
          fontSize: 'text-sm',
          cardPadding: 'p-3',
          gridCols: 'grid-cols-1',
          buttonSize: 'text-sm'
        };
      case 'tablet':
        return {
          container: 'max-w-2xl mx-auto',
          padding: 'px-4 py-6',
          fontSize: 'text-base',
          cardPadding: 'p-4',
          gridCols: 'grid-cols-2',
          buttonSize: 'text-base'
        };
      default:
        return {
          container: 'max-w-4xl mx-auto',
          padding: 'px-6 py-8',
          fontSize: 'text-base',
          cardPadding: 'p-4',
          gridCols: 'grid-cols-3',
          buttonSize: 'text-base'
        };
    }
  };

  const getDeviceIcon = (mode: DeviceMode) => {
    switch (mode) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <TabletSmartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!previewData) {
    notFound();
  }

  const { scale, preview, previewInfo, scoring } = previewData;
  const currentItem = preview?.items?.[currentItemIndex];
  const progressPercentage = viewMode === 'interactive'
    ? (completedItems.length / (preview?.items?.length || 1)) * 100
    : 0;
  const deviceStyles = getDeviceStyles();
  const scoreResult = calculateScore();

  // 调试信息
  console.log('Debug - Preview data:', {
    scaleId,
    viewMode,
    currentItemIndex,
    previewItemsLength: preview?.items?.length,
    currentItem: currentItem ? 'exists' : 'undefined',
    isFullMode: preview?.isFullMode
  });

  const DeviceFrame = deviceMode === 'desktop' ? DesktopFrame
    : (deviceMode === 'mobile' ? MobileFrame : PadFrame)

  return (
    <FeatureGate
      feature={ENTERPRISE_FEATURES.SCALE_PREVIEW}
      featureName={t('features.scale_preview')}
      featureDescription={t('features.scale_preview_desc')}
    >
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/scales">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back')}
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">{scale.acronym} {t("scale_preview.title")}</span>
                {viewMode === 'interactive' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Play className="w-3 h-3 mr-1" />
                    {t("scale_preview.interactive_mode_badge")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* 模式切换 - 桌面端显示 */}
              <div className="hidden lg:flex space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t("scale_preview.preview_mode")}
                </Button>
                <Button
                  variant={viewMode === 'interactive' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={startInteractiveMode}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {t("scale_preview.interactive_mode")}
                </Button>
              </div>

              {/* 设备模式切换 */}
              <div className="hidden md:flex space-x-1 bg-gray-100 rounded-lg p-1">
                {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={deviceMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setDeviceMode(mode)}
                    title={mode === 'desktop' ? t("scale_preview.desktop_mode") : mode === 'tablet' ? t("scale_preview.tablet_mode") : t("scale_preview.mobile_mode")}
                  >
                    {getDeviceIcon(mode)}
                  </Button>
                ))}
              </div>

              <Link href={`/scales/${scale.id}`}>
                <Button variant="outline" size="sm">
                  {t("scale_preview.view_details")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`${deviceStyles.container} ${deviceStyles.padding}`}>
        {/* 移动端模式切换 */}
        <div className="md:hidden mb-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline-solid'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="justify-start"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t("scale_preview.preview_mode")}
            </Button>
            <Button
              variant={viewMode === 'interactive' ? 'default' : 'outline-solid'}
              size="sm"
              onClick={startInteractiveMode}
              className="justify-start"
            >
              <Play className="w-4 h-4 mr-2" />
              {t("scale_preview.interactive_mode")}
            </Button>
          </div>

          {/* 移动端设备模式切换 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-2">
            {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => (
              <Button
                key={mode}
                variant={deviceMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode(mode)}
                className="flex-1"
              >
                {getDeviceIcon(mode)}
                <span className="ml-1 text-xs">
                  {mode === 'desktop' ? t("scale_preview.desktop") : mode === 'tablet' ? t("scale_preview.tablet") : t("scale_preview.mobile")}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* 进度条 (仅在交互模式显示) */}
          {viewMode === 'interactive' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className={deviceStyles.cardPadding}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${deviceStyles.fontSize} font-medium text-blue-800`}>
                    {t("scale_preview.progress")}: {completedItems.length} / {preview?.items?.length || 0}
                  </span>
                  <div className="flex items-center space-x-2">
                    {startTime && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Timer className="w-3 h-3" />
                        <span className="text-xs">{getElapsedTime()}{t("scale_preview.minutes")}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="w-3 h-3" />
                      <span className="text-xs font-bold">{t("scale_preview.current_score")}: {scoreResult.total}{t("scale_preview.points")}</span>
                    </div>
                    <span className={`${deviceStyles.fontSize} text-blue-600`}>
                      {Math.round(progressPercentage)}% {t("scale_preview.completed")}
                    </span>
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                {isTransitioning && (
                  <div className="mt-2 text-xs text-blue-600 text-center">
                    {t("scale_preview.loading_question")}
                  </div>
                )}
                {/* 实时分数解读 */}
                {completedItems.length > 0 && (
                  <div className="mt-2 text-xs text-center text-green-700 font-medium">
                    {scoreResult.interpretation}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 量表基本信息 */}
          <Card>
            <CardHeader>
              <div className={`flex ${deviceMode === 'mobile' ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
                <div>
                  <CardTitle className={deviceMode === 'mobile' ? 'text-xl' : 'text-2xl'}>
                    {scale.name}
                  </CardTitle>
                  <CardDescription className={`${deviceMode === 'mobile' ? 'text-sm' : 'text-lg'} mt-1`}>
                    {scale.nameEn} • {scale.categoryName}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={deviceMode === 'mobile' ? 'text-sm px-2 py-1 w-fit' : 'text-lg px-3 py-1'}>
                  {scale.acronym}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className={`grid ${deviceMode === 'mobile' ? 'grid-cols-1 gap-2' : deviceStyles.gridCols} gap-4`}>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className={deviceStyles.fontSize}>
                    {scale.itemsCount} {t("common.items")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className={deviceStyles.fontSize}>
                    {scale.administrationTime} {t("scale_preview.minutes")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className={deviceStyles.fontSize}>
                    {scale.targetPopulation}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 交互式填写界面 */}
          {viewMode === 'interactive' && (
            <>
              {/* 调试信息卡片 */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800">{t('scale_preview.debug_info')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div>Scale ID: {scaleId}</div>
                    <div>{t('scale_preview.preview_data_exists')}: {previewData ? t('scale_preview.yes') : t('scale_preview.no')}</div>
                    <div>{t('scale_preview.preview_mode_status')}: {preview?.isFullMode ? t('scale_preview.full_mode_status') : t('scale_preview.preview_mode_status')}</div>
                    <div>{t('scale_preview.items_count')}: {preview?.items?.length || 0}</div>
                    <div>{t('scale_preview.current_question_index')}: {currentItemIndex}</div>
                    <div>{t('scale_preview.current_question_exists')}: {currentItem ? t('scale_preview.yes') : t('scale_preview.no')}</div>
                    {currentItem && <div>{t('scale_preview.current_question')}: {currentItem.question}</div>}
                  </div>
                </CardContent>
              </Card>

              {currentItem ? (
                <DeviceFrame>
                  <Card className={`bg-white border-2 ${isTransitioning ? 'border-green-300 bg-green-50' : 'border-blue-200'} transition-all duration-500`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={deviceStyles.fontSize}>
                          {t("scale_preview.question_number")} {currentItem.itemNumber} / {preview?.items?.length || 0}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {currentItem.dimension && (
                            <Badge variant="outline" className="text-xs">
                              {currentItem.dimension}
                            </Badge>
                          )}
                          <Badge variant={completedItems.includes(currentItem.itemNumber) ? 'default' : 'secondary'}>
                            {completedItems.includes(currentItem.itemNumber) ? (
                              <><Check className="w-3 h-3 mr-1" />{t("scale_preview.completed_status")}</>
                            ) : t("scale_preview.pending_status")}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className={`space-y-4 ${deviceStyles.cardPadding}`}>
                      <div>
                        <p className={`font-medium ${deviceMode === 'mobile' ? 'text-base' : 'text-lg'} mb-3 leading-relaxed`}>
                          {currentItem.question}
                        </p>
                        {currentItem.questionEn && (
                          <p className={`${deviceStyles.fontSize} text-muted-foreground italic mb-4`}>
                            {currentItem.questionEn}
                          </p>
                        )}
                      </div>

                      {/* 题目渲染器 - 支持多种题目类型 */}
                      <QuestionRenderer
                        item={currentItem}
                        itemIndex={currentItemIndex}
                        value={(() => {
                          const answer = answers.find(a => a.itemNumber === currentItem.itemNumber);
                          if (!answer) return '';

                          // 根据答案类型返回对应的值
                          if (answer.selectedOption) return answer.selectedOption;
                          if (answer.selectedOptions) return answer.selectedOptions;
                          if (answer.textValue) return answer.textValue;
                          if (answer.dateValue) return answer.dateValue;
                          if (answer.drawingValue) return answer.drawingValue;
                          return '';
                        })()}
                        onChange={(value) => {
                          console.log('QuestionRenderer onChange 触发:', value);

                          // 根据题目类型和值类型判断答案类型
                          let answerType: 'single' | 'multiple' | 'text' | 'date' | 'drawing' = 'single';

                          if (Array.isArray(value)) {
                            answerType = 'multiple';
                          } else if (currentItem.responseType === 'date' || currentItem.responseType === 'datetime') {
                            answerType = 'date';
                          } else if (currentItem.responseType === 'drawing' || currentItem.responseType === 'sketch') {
                            answerType = 'drawing';
                          } else if (currentItem.responseType === 'text' || currentItem.responseType === 'textarea' ||
                            !currentItem.responseOptions || currentItem.responseOptions.length === 0) {
                            answerType = 'text';
                          }

                          handleAnswerSelect(currentItem.itemNumber, value, answerType);
                        }}
                        disabled={false}
                        deviceMode={deviceMode}
                      />

                      {/* 手动导航（备用选项） */}
                      <div className={`flex items-center justify-between pt-4 border-t ${deviceMode === 'mobile' ? 'flex-col space-y-3' : ''}`}>
                        <Button
                          variant="outline"
                          size={deviceMode === 'mobile' ? 'sm' : 'sm'}
                          onClick={() => setCurrentItemIndex(Math.max(0, currentItemIndex - 1))}
                          disabled={currentItemIndex === 0}
                          className={deviceMode === 'mobile' ? 'w-full' : ''}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          {t("scale_preview.previous_question")}
                        </Button>

                        {deviceMode !== 'mobile' && (
                          <span className={`${deviceStyles.fontSize} text-muted-foreground`}>
                            {currentItemIndex + 1} / {preview?.items?.length || 0}
                          </span>
                        )}

                        {currentItemIndex < (preview?.items?.length || 0) - 1 ? (
                          <Button
                            variant="outline"
                            size={deviceMode === 'mobile' ? 'sm' : 'sm'}
                            onClick={() => setCurrentItemIndex(currentItemIndex + 1)}
                            disabled={!completedItems.includes(currentItem.itemNumber)}
                            className={deviceMode === 'mobile' ? 'w-full' : ''}
                          >
                            {t("scale_preview.skip")}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size={deviceMode === 'mobile' ? 'sm' : 'sm'}
                            onClick={() => setShowResults(true)}
                            disabled={completedItems.length === 0}
                            className={deviceMode === 'mobile' ? 'w-full' : ''}
                          >
                            {t("scale_preview.view_results")}
                            <Check className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>

                      {deviceMode === 'mobile' && (
                        <div className="text-center text-sm text-muted-foreground pt-2">
                          {currentItemIndex + 1} / {preview?.items?.length || 0}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </DeviceFrame>
              ) : (
                // 如果没有当前题目，显示加载或错误信息
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <h3 className="font-medium text-red-800 mb-2">{t('scale_preview.cannot_load_questions')}</h3>
                    <p className="text-sm text-red-600 mb-4">
                      {t('scale_preview.question_load_failed')}
                    </p>
                    <div className="space-y-2 text-xs text-red-500">
                      <div>{t('scale_preview.preview_data')}: {previewData ? t('scale_preview.exists') : t('scale_preview.not_exists')}</div>
                      <div>{t('scale_preview.question_count')}: {preview?.items?.length || 0}</div>
                      <div>{t('scale_preview.current_index')}: {currentItemIndex}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewMode('preview');
                        setCurrentItemIndex(0);
                      }}
                      className="mt-4"
                    >
                      {t('scale_preview.return_to_preview')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* 专业结果展示 */}
          {viewMode === 'interactive' && showResults && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>{t("scale_preview.completion_results")}</span>
                </CardTitle>
                <CardDescription className="text-green-700">
                  {t("scale_preview.results_description")}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* 核心结果 */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {scoreResult.total} {t('scale_preview.points')}
                    </div>
                    <div className="text-lg font-medium text-green-800">
                      {scoreResult.interpretation}
                    </div>
                  </div>

                  {scoring && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {Object.entries(scoring).map(([level, score]) => (
                        <div key={level} className={`text-center p-2 rounded ${scoreResult.total >= (score as number) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                          <div className="font-medium">{level}</div>
                          <div>{score}+</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 详细统计 */}
                <div className={`grid ${deviceMode === 'mobile' ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'} text-sm mb-4`}>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{t("scale_preview.completed_items")}</span>
                    </div>
                    <span className="text-lg font-bold">{completedItems.length} / {preview?.items?.length || 0}</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{t("scale_preview.completion_rate")}</span>
                    </div>
                    <span className="text-lg font-bold">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center space-x-2 mb-1">
                      <Timer className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">{t("scale_preview.time_used")}</span>
                    </div>
                    <span className="text-lg font-bold">{getElapsedTime()} {t("scale_preview.minutes")}</span>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center space-x-2 mb-1">
                      <Check className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">{t("scale_preview.total_score")}</span>
                    </div>
                    <span className="text-lg font-bold">{scoreResult.total}</span>
                  </div>
                </div>

                {/* 专业建议 */}
                {previewInfo?.scoringInfo && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">{t('scale_preview.score_explanation')}</h4>
                    <p className="text-sm text-blue-800">
                      {previewInfo.scoringInfo}
                    </p>
                  </div>
                )}

                <div className={`${deviceMode === 'mobile' ? 'grid grid-cols-2 gap-2' : 'flex space-x-2'} pt-4 border-t`}>
                  <Button
                    size="sm"
                    className={deviceMode === 'mobile' ? 'justify-center' : ''}
                    onClick={handleSaveResults}
                    disabled={isSaving || answers.length === 0}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        {t("scale_preview.save_results")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={deviceMode === 'mobile' ? 'justify-center' : ''}
                    onClick={handleExportReport}
                    disabled={isGeneratingReport || answers.length === 0}
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        {t("reports.generating_pdf")}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        {t("scale_preview.export_report")}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className={deviceMode === 'mobile' ? 'justify-center' : ''}>
                    <Share className="w-4 h-4 mr-1" />
                    {t("scale_preview.share_results")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAnswers([]);
                      setCompletedItems([]);
                      setCurrentItemIndex(0);
                      setShowResults(false);
                      setStartTime(new Date());
                      setSessionId(`session_${createId()}`);
                    }}
                    className={deviceMode === 'mobile' ? 'justify-center col-span-2' : ''}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {t("scale_preview.restart")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 预览模式 - 显示原有的预览内容 */}
          {viewMode === 'preview' && (
            <>
              {/* 预览信息 */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-800">
                    <Eye className="w-5 h-5" />
                    <span>{t("scale_preview.scale_preview_title")}</span>
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {t("scale_preview.preview_description")}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className={`grid ${deviceMode === 'mobile' ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-4'} text-sm`}>
                    <div>
                      <span className="font-medium">{t("scale_preview.preview_items")}:</span>
                      <span className="ml-1">{preview.previewCount} / {preview.totalItems}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t("scale_preview.preview_ratio")}:</span>
                      <span className="ml-1">{previewInfo.previewRatio}%</span>
                    </div>
                    <div>
                      <span className="font-medium">{t("scale_preview.assessment_time")}:</span>
                      <span className="ml-1">{previewInfo.estimatedCompletionTime} {t("scale_preview.minutes")}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t("scale_preview.dimensions_count")}:</span>
                      <span className="ml-1">{preview.dimensions.length}</span>
                    </div>
                  </div>

                  {/* 快速开始交互按钮 */}
                  <div className="mt-4 pt-4 border-t">
                    <Button onClick={startInteractiveMode} className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      {t("scale_preview.start_interactive_full").replace("{count}", preview.totalItems.toString())}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 量表描述 */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('scale_preview.scale_description')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`${deviceStyles.fontSize} leading-relaxed mb-3`}>
                    {scale.description}
                  </p>
                  {scale.descriptionEn && (
                    <p className={`${deviceStyles.fontSize} leading-relaxed text-muted-foreground italic`}>
                      {scale.descriptionEn}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 题项预览 */}
              {preview.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{t('scale_preview.items_preview')} ({preview.previewCount} / {preview.totalItems})</span>
                      {preview.hasMoreItems && (
                        <Badge variant="secondary">
                          {t('scale_preview.more_items_remaining', 'More {{count}} items remaining', { count: preview.totalItems - preview.previewCount })}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {t('scale_preview.items_preview_note', 'The following are the first {{count}} items of this scale, use interactive mode for complete experience', { count: preview.previewCount })}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {preview.items.map((item: any, index: number) => (
                        <Card key={item.itemNumber} className={`${deviceStyles.cardPadding} bg-gray-50`}>
                          <div className={`flex ${deviceMode === 'mobile' ? 'flex-col space-y-2' : 'items-start space-x-3'}`}>
                            <Badge variant="outline" className={deviceMode === 'mobile' ? 'w-fit' : 'mt-1'}>
                              {item.itemNumber}
                            </Badge>
                            <div className="flex-1">
                              <p className={`font-medium ${deviceStyles.fontSize} mb-2`}>{item.question}</p>
                              {item.questionEn && (
                                <p className="text-sm text-muted-foreground italic mb-2">
                                  {item.questionEn}
                                </p>
                              )}

                              {item.responseOptions.length > 0 && (
                                <div className="text-sm">
                                  <span className="font-medium text-muted-foreground">{t('scale_preview.response_options')}: </span>
                                  <span className="text-muted-foreground">
                                    {deviceMode === 'mobile' ?
                                      item.responseOptions.slice(0, 2).join(' / ') + (item.responseOptions.length > 2 ? '...' : '') :
                                      item.responseOptions.join(' / ')
                                    }
                                  </span>
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
                  </CardContent>
                </Card>
              )}

              {/* 样本答案示例 */}
              {preview.sampleAnswers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>{t('scale_preview.sample_answers')}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('scale_preview.sample_description')}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {preview.sampleAnswers.map((sample: any, index: number) => (
                        <div key={sample.itemNumber} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                          <div className="text-sm">
                            <span className="font-medium">{t('scale_preview.question_number')} {sample.itemNumber}: </span>
                            <span>{sample.question}</span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium text-green-700">{t('scale_preview.sample_answer')}: </span>
                            <span className="text-green-700">{sample.selectedOption}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 使用指导 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>{t('scale_preview.usage_guide')}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('scale_preview.recommended_environment')}</h4>
                    <p className={`${deviceStyles.fontSize} text-muted-foreground`}>
                      {previewInfo.recommendedEnvironment}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('scale_preview.instructions')}</h4>
                    <p className={`${deviceStyles.fontSize} text-muted-foreground`}>
                      {previewInfo.instructions}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('scale_preview.assessment_dimensions')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {preview.dimensions.map((dimension: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {dimension}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* 下一步操作 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('scale_preview.next_actions')}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className={`grid grid-cols-1 ${deviceMode === 'mobile' ? 'gap-2' : 'md:grid-cols-3 gap-4'}`}>
                <Link href={`/scales/${scale.id}`}>
                  <Button className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t('scale_preview.view_full_details')}
                  </Button>
                </Link>

                <Link href={`/scales/${scale.id}/copyright`}>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {t('scale_preview.check_copyright')}
                  </Button>
                </Link>

                <Link href={`/scales/${scale.id}/interpretation`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Info className="w-4 h-4 mr-2" />
                    {t('scale_preview.view_interpretation')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 预览限制提示 */}
          {viewMode === 'preview' && preview.hasMoreItems && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-orange-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">{t('scale_preview.preview_limitation')}</span>
                </div>
                <p className={`${deviceStyles.fontSize} text-orange-700 mt-1`}>
                  {t('scale_preview.preview_limitation_description', 'This is only a partial preview ({{previewCount}} / {{totalItems}}). To experience the complete scale assessment, please click "Start Interactive Experience".', { previewCount: preview.previewCount, totalItems: preview.totalItems })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}