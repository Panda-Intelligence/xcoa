'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft,
  Eye,
  Play,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface ScalePreviewPageProps {
  params: Promise<{ scaleId: string }>;
}

export default function ScalePreviewPage({ params }: ScalePreviewPageProps) {
  const [scaleId, setScaleId] = useState<string>('');
  const [previewData, setPreviewData] = useState<any>(null);
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
                  返回搜索
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">{scale.acronym} 预览</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link href={`/scales/${scale.id}`}>
                <Button variant="outline" size="sm">
                  查看完整详情
                </Button>
              </Link>
              <Link href={`/scales/${scale.id}/copyright`}>
                <Button size="sm">
                  查看版权信息
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 量表基本信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{scale.name}</CardTitle>
                  <CardDescription className="text-lg mt-1">
                    {scale.nameEn} • {scale.categoryName}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {scale.acronym}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {scale.itemsCount} 个题项
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    约 {scale.administrationTime} 分钟
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">
                    {scale.targetPopulation}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
            </CardContent>
          </Card>

          {/* 量表描述 */}
          <Card>
            <CardHeader>
              <CardTitle>量表描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed mb-3">
                {scale.description}
              </p>
              {scale.descriptionEn && (
                <p className="text-sm leading-relaxed text-muted-foreground italic">
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
                    <Card key={item.itemNumber} className="p-4 bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <Badge variant="outline" className="mt-1">
                          {item.itemNumber}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium mb-2">{item.question}</p>
                          {item.questionEn && (
                            <p className="text-sm text-muted-foreground italic mb-2">
                              {item.questionEn}
                            </p>
                          )}
                          
                          {item.responseOptions.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">回答选项: </span>
                              <span className="text-muted-foreground">
                                {item.responseOptions.join(' / ')}
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
                <p className="text-sm text-muted-foreground">
                  {previewInfo.recommendedEnvironment}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">实施说明</h4>
                <p className="text-sm text-muted-foreground">
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

          {/* 下一步操作 */}
          <Card>
            <CardHeader>
              <CardTitle>下一步操作</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {preview.hasMoreItems && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-orange-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">预览限制</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
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