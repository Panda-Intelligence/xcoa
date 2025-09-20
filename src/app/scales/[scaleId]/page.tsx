import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  Clock, 
  Users, 
  Star, 
  Download, 
  Eye, 
  Heart,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface ScalePageProps {
  params: { scaleId: string };
}

// 获取量表详情数据
async function getScaleDetails(scaleId: string) {
  try {
    const response = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/scales/${scaleId}`, {
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

// 生成页面元数据
export async function generateMetadata({ params }: ScalePageProps): Promise<Metadata> {
  const data = await getScaleDetails(params.scaleId);
  
  if (!data?.scale) {
    return {
      title: '量表未找到 - xCOA',
      description: '您查找的eCOA量表不存在或已被删除。'
    };
  }
  
  const { scale } = data;
  
  return {
    title: `${scale.name} (${scale.acronym}) - xCOA`,
    description: scale.description?.substring(0, 160) + '...' || scale.descriptionEn?.substring(0, 160) + '...',
    keywords: [
      scale.acronym,
      scale.name,
      scale.nameEn,
      '量表',
      'eCOA',
      '评估工具',
      ...JSON.parse(scale.domains || '[]')
    ].filter(Boolean).join(', '),
  };
}

export default async function ScalePage({ params }: ScalePageProps) {
  const data = await getScaleDetails(params.scaleId);
  
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
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />已验证</Badge>;
      case 'draft':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />草稿</Badge>;
      case 'published':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />已发布</Badge>;
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回搜索
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">量表详情</span>
                <span className="text-sm font-medium">{scale.acronym}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                {userInteraction.isFavorited ? '已收藏' : '收藏'}
              </Button>
              {userInteraction.canDownload && (
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  下载量表
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
                        {scale.administrationTime} 分钟
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {scale.itemsCount} 题项
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">概述</TabsTrigger>
                    <TabsTrigger value="items">题项</TabsTrigger>
                    <TabsTrigger value="psychometrics">心理测量</TabsTrigger>
                    <TabsTrigger value="references">参考文献</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">量表描述</h4>
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
                        <h4 className="font-semibold mb-2">适用人群</h4>
                        <p className="text-sm text-muted-foreground">{scale.targetPopulation}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">年龄范围</h4>
                        <p className="text-sm text-muted-foreground">{scale.ageRange}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">评估领域</h4>
                      <div className="flex flex-wrap gap-2">
                        {scale.domains.map((domain: string, index: number) => (
                          <Badge key={index} variant="outline">{domain}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">评分方法</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {scale.scoringMethod}
                      </p>
                    </div>
                    
                    {scale.copyrightInfo && (
                      <div>
                        <h4 className="font-semibold mb-2">版权信息</h4>
                        <p className="text-sm text-muted-foreground">{scale.copyrightInfo}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="items" className="space-y-4">
                    {meta.hasItems ? (
                      <div className="space-y-3">
                        {items.map((item: any, index: number) => (
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
                                    <span className="font-medium">选项：</span>
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
                        <p>该量表的详细题项信息暂未收录</p>
                        <p className="text-sm">您可以通过下载完整量表查看所有题项</p>
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
                              信度指标
                            </h4>
                            <div className="space-y-2 text-sm">
                              {psychometrics.reliability.cronbachAlpha && (
                                <div className="flex justify-between">
                                  <span>Cronbach's α</span>
                                  <span className="font-medium">{psychometrics.reliability.cronbachAlpha}</span>
                                </div>
                              )}
                              {psychometrics.reliability.testRetest && (
                                <div className="flex justify-between">
                                  <span>重测信度</span>
                                  <span className="font-medium">{psychometrics.reliability.testRetest}</span>
                                </div>
                              )}
                              {psychometrics.reliability.interRater && (
                                <div className="flex justify-between">
                                  <span>评分者间信度</span>
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
                              效度指标
                            </h4>
                            <div className="space-y-2 text-sm">
                              {psychometrics.validity.sensitivity && (
                                <div className="flex justify-between">
                                  <span>敏感性</span>
                                  <span className="font-medium">{psychometrics.validity.sensitivity}</span>
                                </div>
                              )}
                              {psychometrics.validity.specificity && (
                                <div className="flex justify-between">
                                  <span>特异性</span>
                                  <span className="font-medium">{psychometrics.validity.specificity}</span>
                                </div>
                              )}
                              {psychometrics.validity.constructValidity && (
                                <div className="flex justify-between">
                                  <span>结构效度</span>
                                  <span className="font-medium">{psychometrics.validity.constructValidity}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        )}
                        
                        {psychometrics.cutoffScores && (
                          <Card className="p-4 md:col-span-2">
                            <h4 className="font-semibold mb-2">切分值标准</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              {Object.entries(psychometrics.cutoffScores).map(([level, score]) => (
                                <div key={level} className="text-center p-2 bg-secondary rounded">
                                  <div className="font-medium">{level}</div>
                                  <div className="text-muted-foreground">{score as string}分</div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>该量表的心理测量学数据暂未收录</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="references" className="space-y-4">
                    {scale.references.length > 0 ? (
                      <div className="space-y-3">
                        {scale.references.map((reference: string, index: number) => (
                          <Card key={index} className="p-4">
                            <p className="text-sm leading-relaxed">{reference}</p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>该量表的参考文献暂未收录</p>
                      </div>
                    )}
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
                <CardTitle className="text-lg">使用统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-2 text-blue-500" />
                    总浏览量
                  </span>
                  <span className="font-semibold">{statistics.totalViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-2 text-green-500" />
                    近30天浏览
                  </span>
                  <span className="font-semibold">{statistics.recentViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    收藏次数
                  </span>
                  <span className="font-semibold">{statistics.totalFavorites}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* 量表信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">量表信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>题项数量</span>
                  <span className="font-medium">{scale.itemsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>维度数量</span>
                  <span className="font-medium">{scale.dimensionsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>管理时间</span>
                  <span className="font-medium">{scale.administrationTime} 分钟</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>验证状态</span>
                  <span>{getValidationBadge(scale.validationStatus)}</span>
                </div>
                <div>
                  <span className="text-sm">支持语言</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scale.languages.map((lang: string) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang === 'zh-CN' ? '中文' : lang === 'en-US' ? 'English' : lang}
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
                  <CardTitle className="text-lg">相关量表</CardTitle>
                  <CardDescription>
                    同类别的其他评估工具
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
                                {relatedScale.acronym} • {relatedScale.itemsCount} 题项
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