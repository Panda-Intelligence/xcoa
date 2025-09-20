'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Calculator,
  FileText,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Users,
  Brain
} from 'lucide-react';
import Link from 'next/link';

interface ScaleGuide {
  id: string;
  name: string;
  acronym: string;
  category: string;
  purpose: string;
  cutoffScores: Record<string, any>;
  administrationTips: string[];
  commonChallenges: string[];
}

export default function InterpretationPage() {
  const [selectedScale, setSelectedScale] = useState('');
  const [interpretationData, setInterpretationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [popularScales] = useState([
    { id: 'scale_phq9', acronym: 'PHQ-9', name: '患者健康问卷-9', category: '抑郁症评估' },
    { id: 'scale_gad7', acronym: 'GAD-7', name: '广泛性焦虑障碍-7', category: '焦虑症评估' },
    { id: 'scale_mmse2', acronym: 'MMSE-2', name: '简易精神状态检查-2', category: '认知功能评估' },
    { id: 'scale_moca', acronym: 'MoCA', name: '蒙特利尔认知评估', category: '认知功能评估' },
    { id: 'scale_bdi2', acronym: 'BDI-II', name: '贝克抑郁量表-II', category: '抑郁症评估' },
    { id: 'scale_hamd', acronym: 'HAM-D', name: '汉密尔顿抑郁量表', category: '抑郁症评估' },
  ]);

  const loadInterpretation = async (scaleId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scales/${scaleId}/interpretation`);
      const data = await response.json();
      setInterpretationData(data);
    } catch (error) {
      console.error('Failed to load interpretation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScaleSelect = (scaleId: string) => {
    setSelectedScale(scaleId);
    loadInterpretation(scaleId);
  };

  return (
    <>
      <PageHeader
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/interpretation", label: "量表解读" }
        ]}
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guides">解读指南</TabsTrigger>
            <TabsTrigger value="calculator">分数计算器</TabsTrigger>
            <TabsTrigger value="cases">临床案例</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guides" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* 量表选择 */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">选择量表</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  {popularScales.map((scale) => (
                    <button
                      key={scale.id}
                      onClick={() => handleScaleSelect(scale.id)}
                      className={`w-full text-left p-3 rounded border transition-colors ${
                        selectedScale === scale.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{scale.acronym}</div>
                      <div className="text-xs text-muted-foreground">{scale.name}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {scale.category}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* 解读内容 */}
              <div className="lg:col-span-3">
                {!selectedScale ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">选择量表查看解读指南</h3>
                      <p className="text-muted-foreground">
                        从左侧列表中选择一个量表，查看详细的使用和解读指导
                      </p>
                    </CardContent>
                  </Card>
                ) : loading ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p>正在加载解读指南...</p>
                    </CardContent>
                  </Card>
                ) : interpretationData ? (
                  <div className="space-y-4">
                    {/* 量表概览 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Brain className="w-5 h-5" />
                          <span>{interpretationData.scale.name} 解读指南</span>
                        </CardTitle>
                        <CardDescription>
                          {interpretationData.interpretation.overview.purpose}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">
                              管理时间: {interpretationData.interpretation.overview.administrationTime} 分钟
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm">
                              适用人群: {interpretationData.interpretation.overview.targetPopulation}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <span className="text-sm">
                              临床应用: 筛查和评估
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 评分指南 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>评分和解读</CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">评分方法</h4>
                            <p className="text-sm text-muted-foreground">
                              {interpretationData.interpretation.scoringGuide.scoringMethod}
                            </p>
                          </div>
                          
                          {Object.keys(interpretationData.interpretation.scoringGuide.cutoffScores).length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">严重程度分级</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(interpretationData.interpretation.scoringGuide.cutoffScores).map(([level, info]: [string, any]) => (
                                  <div key={level} className="p-3 bg-gray-50 rounded border">
                                    <div className="font-medium text-sm">{level}</div>
                                    <div className="text-xs text-muted-foreground">{info.range}</div>
                                    <div className="text-xs">{info.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 使用指导 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>实施指导</CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        <Tabs defaultValue="administration" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="administration">实施建议</TabsTrigger>
                            <TabsTrigger value="challenges">常见挑战</TabsTrigger>
                            <TabsTrigger value="cultural">文化考虑</TabsTrigger>
                            <TabsTrigger value="limitations">使用局限</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="administration">
                            <ul className="space-y-2 text-sm">
                              {interpretationData.interpretation.practicalConsiderations.administrationTips.map((tip: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                          
                          <TabsContent value="challenges">
                            <ul className="space-y-2 text-sm">
                              {interpretationData.interpretation.practicalConsiderations.commonChallenges.map((challenge: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                          
                          <TabsContent value="cultural">
                            <ul className="space-y-2 text-sm">
                              {interpretationData.interpretation.practicalConsiderations.culturalConsiderations.map((consideration: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                  {consideration}
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                          
                          <TabsContent value="limitations">
                            <ul className="space-y-2 text-sm">
                              {interpretationData.interpretation.practicalConsiderations.limitationsAndCautions.map((limitation: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                  {limitation}
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500 opacity-50" />
                      <p>无法加载解读指南</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="calculator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>分数计算器</span>
                </CardTitle>
                <CardDescription>
                  计算量表总分并获得个性化解读
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>分数计算器功能开发中</p>
                  <p className="text-sm">即将支持交互式分数计算和实时解读</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>临床案例</span>
                </CardTitle>
                <CardDescription>
                  真实的临床应用案例和解读示例
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: 'PHQ-9 轻度抑郁筛查案例',
                      scenario: '35岁职场女性，工作压力增大，睡眠质量下降',
                      score: '7分',
                      level: '轻度抑郁',
                      recommendation: '建议心理咨询和压力管理，2周后重新评估',
                      color: 'yellow',
                    },
                    {
                      title: 'GAD-7 中度焦虑评估案例',
                      scenario: '42岁男性，担心工作和家庭问题，难以放松',
                      score: '12分',
                      level: '中度焦虑',
                      recommendation: '建议专业咨询，考虑认知行为治疗',
                      color: 'orange',
                    },
                    {
                      title: 'MoCA 轻度认知损害筛查',
                      scenario: '68岁退休教师，记忆力有所下降，家属担心',
                      score: '22分',
                      level: '轻度认知损害',
                      recommendation: '建议神经科进一步评估，监测认知变化',
                      color: 'blue',
                    },
                  ].map((caseExample, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          caseExample.color === 'yellow' ? 'bg-yellow-400' :
                          caseExample.color === 'orange' ? 'bg-orange-400' :
                          caseExample.color === 'blue' ? 'bg-blue-400' : 'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{caseExample.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>案例描述:</strong> {caseExample.scenario}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">评估结果:</span> {caseExample.score}
                            </div>
                            <div>
                              <span className="font-medium">严重程度:</span> {caseExample.level}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-sm">建议:</span>
                            <p className="text-sm text-muted-foreground">{caseExample.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calculator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>交互式分数计算器</CardTitle>
                <CardDescription>开发中的功能预览</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>交互式计算器功能正在开发中</p>
                  <p className="text-sm">将支持实时分数计算、结果解读和风险评估</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 解读详情显示 */}
        {interpretationData && (
          <Card>
            <CardHeader>
              <CardTitle>
                {interpretationData.scale.name} ({interpretationData.scale.acronym}) 详细解读
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">概述</TabsTrigger>
                  <TabsTrigger value="scoring">评分指南</TabsTrigger>
                  <TabsTrigger value="clinical">临床应用</TabsTrigger>
                  <TabsTrigger value="examples">应用案例</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">量表目的</h4>
                    <p className="text-sm text-muted-foreground">
                      {interpretationData.interpretation.overview.purpose}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">临床用途</h4>
                    <div className="flex flex-wrap gap-1">
                      {interpretationData.interpretation.overview.clinicalUse?.map((use: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="scoring" className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">评分方法</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {interpretationData.interpretation.scoringGuide.scoringMethod}
                    </p>
                  </div>
                  
                  {interpretationData.interpretation.scoringGuide.interpretationLevels?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">解读级别</h4>
                      <ul className="space-y-1 text-sm">
                        {interpretationData.interpretation.scoringGuide.interpretationLevels.map((level: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {level}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="clinical" className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">筛查用途</h4>
                      <p className="text-sm text-muted-foreground">
                        {interpretationData.interpretation.clinicalGuidance.useInScreening}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">诊断辅助</h4>
                      <p className="text-sm text-muted-foreground">
                        {interpretationData.interpretation.clinicalGuidance.useInDiagnosis}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">治疗监测</h4>
                      <p className="text-sm text-muted-foreground">
                        {interpretationData.interpretation.clinicalGuidance.useInMonitoring}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">研究应用</h4>
                      <p className="text-sm text-muted-foreground">
                        {interpretationData.interpretation.clinicalGuidance.useInResearch}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="space-y-3">
                  {interpretationData.interpretation.clinicalExamples?.length > 0 ? (
                    <div className="space-y-4">
                      {interpretationData.interpretation.clinicalExamples.map((example: any, index: number) => (
                        <Card key={index} className="p-4 bg-blue-50 border-blue-200">
                          <h4 className="font-medium mb-2">{example.caseTitle}</h4>
                          <p className="text-sm mb-2"><strong>情况:</strong> {example.scenario}</p>
                          <p className="text-sm mb-2"><strong>得分:</strong> {example.score}</p>
                          <p className="text-sm mb-2"><strong>解读:</strong> {example.interpretation}</p>
                          <p className="text-sm"><strong>随访:</strong> {example.followUp}</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>该量表暂无临床案例</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}