'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
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
  Tablet,
  Save,
  Download,
  Share,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Pause,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

interface ScalePreviewPageProps {
  params: Promise<{ scaleId: string }>;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type ViewMode = 'preview' | 'interactive';

interface Answer {
  itemNumber: number;
  selectedOption: string;
  score?: number;
  timestamp: Date;
}

export default function ScalePreviewPage({ params }: ScalePreviewPageProps) {
  const { t } = useLanguage();
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
  const [isPaused, setIsPaused] = useState(false);

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

  // 处理答案选择
  const handleAnswerSelect = useCallback((itemNumber: number, selectedOption: string) => {
    const timestamp = new Date();
    setAnswers(prev => {
      const existing = prev.find(a => a.itemNumber === itemNumber);
      if (existing) {
        return prev.map(a =>
          a.itemNumber === itemNumber
            ? { ...a, selectedOption, timestamp }
            : a
        );
      } else {
        return [...prev, { itemNumber, selectedOption, timestamp }];
      }
    });

    if (!completedItems.includes(itemNumber)) {
      setCompletedItems(prev => [...prev, itemNumber]);
    }
  }, [completedItems]);

  // 开始交互模式
  const startInteractiveMode = () => {
    setViewMode('interactive');
    setStartTime(new Date());
    setCurrentItemIndex(0);
    setAnswers([]);
    setCompletedItems([]);
    setShowResults(false);
  };

  // 计算总分
  const calculateScore = useCallback(() => {
    if (!previewData?.preview?.items) return 0;
    return answers.reduce((total, answer) => {
      const item = previewData.preview.items.find((i: any) => i.itemNumber === answer.itemNumber);
      if (item?.responseOptions) {
        const optionIndex = item.responseOptions.indexOf(answer.selectedOption);
        return total + (optionIndex >= 0 ? optionIndex : 0);
      }
      return total;
    }, 0);
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
      case 'tablet': return <Tablet className="w-4 h-4" />;
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

  const { scale, preview, previewInfo } = previewData;
  const currentItem = preview.items[currentItemIndex];
  const progressPercentage = viewMode === 'interactive'
    ? (completedItems.length / preview.items.length) * 100
    : 0;
  const deviceStyles = getDeviceStyles();

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/scales">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back', '返回')}
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">{scale.acronym} 预览</span>
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
                  预览
                </Button>
                <Button
                  variant={viewMode === 'interactive' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={startInteractiveMode}
                >
                  <Play className="w-4 h-4 mr-1" />
                  交互
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
                    title={mode === 'desktop' ? '桌面模式' : mode === 'tablet' ? '平板模式' : '手机模式'}
                  >
                    {getDeviceIcon(mode)}
                  </Button>
                ))}
              </div>

              <Link href={`/scales/${scale.id}`}>
                <Button variant="outline" size="sm">
                  查看详情
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
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="justify-start"
            >
              <Eye className="w-4 h-4 mr-2" />
              预览模式
            </Button>
            <Button
              variant={viewMode === 'interactive' ? 'default' : 'outline'}
              size="sm"
              onClick={startInteractiveMode}
              className="justify-start"
            >
              <Play className="w-4 h-4 mr-2" />
              交互模式
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
                  {mode === 'desktop' ? '桌面' : mode === 'tablet' ? '平板' : '手机'}
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
                    进度: {completedItems.length} / {preview.items.length}
                  </span>
                  <div className="flex items-center space-x-2">
                    {startTime && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Timer className="w-3 h-3" />
                        <span className="text-xs">{getElapsedTime()}分钟</span>
                      </div>
                    )}
                    <span className={`${deviceStyles.fontSize} text-blue-600`}>
                      {Math.round(progressPercentage)}% 完成
                    </span>
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
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
                    {scale.itemsCount} 个题项
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className={deviceStyles.fontSize}>
                    约 {scale.administrationTime} 分钟
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
          {viewMode === 'interactive' && currentItem && (
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={deviceStyles.fontSize}>
                    题项 {currentItem.itemNumber} / {preview.items.length}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {!isPaused && startTime && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPaused(!isPaused)}
                      >
                        <Pause className="w-3 h-3" />
                      </Button>
                    )}
                    <Badge variant={completedItems.includes(currentItem.itemNumber) ? 'default' : 'secondary'}>
                      {completedItems.includes(currentItem.itemNumber) ? (
                        <><Check className="w-3 h-3 mr-1" />已完成</>
                      ) : '待完成'}
                    </Badge>
                  </div>
                </div>
                {currentItem.dimension && (
                  <Badge variant="outline" className="w-fit">
                    {currentItem.dimension}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className={`space-y-4 ${deviceStyles.cardPadding}`}>
                <div>
                  <p className={`font-medium ${deviceMode === 'mobile' ? 'text-base' : 'text-lg'} mb-3`}>
                    {currentItem.question}
                  </p>
                  {currentItem.questionEn && (
                    <p className={`${deviceStyles.fontSize} text-muted-foreground italic mb-4`}>
                      {currentItem.questionEn}
                    </p>
                  )}
                </div>

                {currentItem.responseOptions.length > 0 && (
                  <RadioGroup
                    value={answers.find(a => a.itemNumber === currentItem.itemNumber)?.selectedOption || ''}
                    onValueChange={(value) => handleAnswerSelect(currentItem.itemNumber, value)}
                    className="space-y-3"
                  >
                    {currentItem.responseOptions.map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className={`flex items-center space-x-3 ${deviceStyles.cardPadding} rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all`}>
                        <RadioGroupItem value={option} id={`option-${optionIndex}`} />
                        <Label
                          htmlFor={`option-${optionIndex}`}
                          className={`flex-1 cursor-pointer ${deviceStyles.fontSize} leading-relaxed`}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* 导航按钮 */}
                <div className={`flex items-center justify-between pt-4 border-t ${deviceMode === 'mobile' ? 'flex-col space-y-3' : ''}`}>
                  <Button
                    variant="outline"
                    size={deviceMode === 'mobile' ? 'default' : 'default'}
                    onClick={() => setCurrentItemIndex(Math.max(0, currentItemIndex - 1))}
                    disabled={currentItemIndex === 0}
                    className={deviceMode === 'mobile' ? 'w-full' : ''}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    上一题
                  </Button>

                  {deviceMode !== 'mobile' && (
                    <span className={`${deviceStyles.fontSize} text-muted-foreground`}>
                      {currentItemIndex + 1} / {preview.items.length}
                    </span>
                  )}

                  {currentItemIndex < preview.items.length - 1 ? (
                    <Button
                      size={deviceMode === 'mobile' ? 'default' : 'default'}
                      onClick={() => setCurrentItemIndex(currentItemIndex + 1)}
                      disabled={!completedItems.includes(currentItem.itemNumber)}
                      className={deviceMode === 'mobile' ? 'w-full' : ''}
                    >
                      下一题
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      size={deviceMode === 'mobile' ? 'default' : 'default'}
                      onClick={() => setShowResults(true)}
                      disabled={completedItems.length < preview.items.length}
                      className={`${deviceMode === 'mobile' ? 'w-full' : ''} bg-green-600 hover:bg-green-700`}
                    >
                      查看结果
                      <Check className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>

                {deviceMode === 'mobile' && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    {currentItemIndex + 1} / {preview.items.length}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 结果展示 */}
          {viewMode === 'interactive' && showResults && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>完成结果</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className={`grid ${deviceMode === 'mobile' ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'} text-sm mb-4`}>
                  <div>
                    <span className="font-medium">完成题项:</span>
                    <span className="ml-1">{completedItems.length} / {preview.items.length}</span>
                  </div>
                  <div>
                    <span className="font-medium">预估总分:</span>
                    <span className="ml-1">{calculateScore()}</span>
                  </div>
                  <div>
                    <span className="font-medium">完成率:</span>
                    <span className="ml-1">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div>
                    <span className="font-medium">用时:</span>
                    <span className="ml-1">{getElapsedTime()} 分钟</span>
                  </div>
                </div>

                <div className={`${deviceMode === 'mobile' ? 'grid grid-cols-2 gap-2' : 'flex space-x-2'} pt-4 border-t`}>
                  <Button size="sm" className={deviceMode === 'mobile' ? 'justify-center' : ''}>
                    <Save className="w-4 h-4 mr-1" />
                    保存结果
                  </Button>
                  <Button variant="outline" size="sm" className={deviceMode === 'mobile' ? 'justify-center' : ''}>
                    <Download className="w-4 h-4 mr-1" />
                    导出报告
                  </Button>
                  <Button variant="outline" size="sm" className={deviceMode === 'mobile' ? 'justify-center' : ''}>
                    <Share className="w-4 h-4 mr-1" />
                    分享结果
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
                    }}
                    className={deviceMode === 'mobile' ? 'justify-center col-span-2' : ''}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    重新开始
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
                    <span>量表预览</span>
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    这是该量表的部分题项预览，完整版本请查看详情页面
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className={`grid ${deviceMode === 'mobile' ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-4'} text-sm`}>
                    <div>
                      <span className="font-medium">预览题项:</span>
                      <span className="ml-1">{preview.previewCount} / {preview.totalItems}</span>
                    </div>
                    <div>
                      <span className="font-medium">预览比例:</span>
                      <span className="ml-1">{previewInfo.previewRatio}%</span>
                    </div>
                    <div>
                      <span className="font-medium">评估时间:</span>
                      <span className="ml-1">{previewInfo.estimatedCompletionTime} 分钟</span>
                    </div>
                    <div>
                      <span className="font-medium">维度数量:</span>
                      <span className="ml-1">{preview.dimensions.length} 个</span>
                    </div>
                  </div>

                  {/* 快速开始交互按钮 */}
                  <div className="mt-4 pt-4 border-t">
                    <Button onClick={startInteractiveMode} className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      开始交互式体验
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 量表描述 */}
              <Card>
                <CardHeader>
                  <CardTitle>量表描述</CardTitle>
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
                      <span>题项预览 ({preview.previewCount} / {preview.totalItems})</span>
                      {preview.hasMoreItems && (
                        <Badge variant="secondary">
                          还有 {preview.totalItems - preview.previewCount} 个题项
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      以下是该量表的前 {preview.previewCount} 个题项
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
                                  <span className="font-medium text-muted-foreground">回答选项: </span>
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
                      <span>答题示例</span>
                    </CardTitle>
                    <CardDescription>
                      以下是一些题项的示例回答，仅供参考
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {preview.sampleAnswers.map((sample: any, index: number) => (
                        <div key={sample.itemNumber} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                          <div className="text-sm">
                            <span className="font-medium">题项 {sample.itemNumber}: </span>
                            <span>{sample.question}</span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium text-green-700">示例答案: </span>
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
                    <span>使用指导</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">推荐环境</h4>
                    <p className={`${deviceStyles.fontSize} text-muted-foreground`}>
                      {previewInfo.recommendedEnvironment}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">实施说明</h4>
                    <p className={`${deviceStyles.fontSize} text-muted-foreground`}>
                      {previewInfo.instructions}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">评估维度</h4>
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
              <CardTitle>下一步操作</CardTitle>
            </CardHeader>

            <CardContent>
              <div className={`grid grid-cols-1 ${deviceMode === 'mobile' ? 'gap-2' : 'md:grid-cols-3 gap-4'}`}>
                <Link href={`/scales/${scale.id}`}>
                  <Button className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    查看完整详情
                  </Button>
                </Link>

                <Link href={`/scales/${scale.id}/copyright`}>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    检查版权许可
                  </Button>
                </Link>

                <Link href={`/scales/${scale.id}/interpretation`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Info className="w-4 h-4 mr-2" />
                    查看解读指南
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
                  <span className="font-medium">预览限制</span>
                </div>
                <p className={`${deviceStyles.fontSize} text-orange-700 mt-1`}>
                  这只是部分题项预览 ({preview.previewCount} / {preview.totalItems})。
                  要查看完整量表内容，请访问详情页面或联系版权方获得使用许可。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}