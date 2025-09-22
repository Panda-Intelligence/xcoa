'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Beaker,
  Users,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  ExternalLink,
  Target,
  Clock,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface ClinicalCase {
  id: string;
  title: string;
  trialId: string;
  scaleId: string;
  scaleName: string;
  scaleAcronym: string;
  diseaseArea: string;
  trialPhase: string;
  studyType: string;
  patientCount: number;
  duration: string;
  primaryEndpoint: string;
  secondaryEndpoints: string[];
  inclusion: string;
  intervention: string;
  results: any;
  sponsor: string;
  investigator: string;
  publication: string;
  keyFindings: string[];
  limitations: string[];
  clinicalImplications: string;
  tags: string[];
  evidenceLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  diseaseAreas: string[];
  trialPhases: string[];
  studyTypes: string[];
  evidenceLevels: string[];
  scales: Array<{ id: string; name: string; acronym: string }>;
}

export default function ClinicalCasesPage() {
  const { t } = useLanguage();
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    diseaseAreas: [],
    trialPhases: [],
    studyTypes: [],
    evidenceLevels: [],
    scales: []
  });
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);

  useEffect(() => {
    fetchCases();
  }, [diseaseFilter, phaseFilter]);

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (diseaseFilter !== 'all') params.append('diseaseArea', diseaseFilter);
      if (phaseFilter !== 'all') params.append('trialPhase', phaseFilter);

      const response = await fetch(`/api/clinical-cases?${params}`);
      const data = await response.json();

      if (data.success) {
        setCases(data.cases || []);
        setFilterOptions(data.filterOptions || {});
        setStatistics(data.statistics || {});
      }
    } catch (error) {
      console.error('加载临床案例失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEvidenceLevelColor = (level: string) => {
    const colorMap = {
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colorMap[level as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDiseaseAreaLabel = (area: string) => {
    const labels = {
      depression: '抑郁症',
      anxiety: '焦虑症',
      oncology: '肿瘤学',
      neurology: '神经科学',
      pain_management: '疼痛管理'
    };
    return labels[area as keyof typeof labels] || area;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果选中了特定案例，显示详情页
  if (selectedCase) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedCase(null)}
            className="mb-6"
          >
            ← 返回案例列表
          </Button>

          <div className="space-y-6">
            {/* 案例标题 */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{selectedCase.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getEvidenceLevelColor(selectedCase.evidenceLevel)}>
                  证据等级 {selectedCase.evidenceLevel}
                </Badge>
                <Badge variant="outline">{selectedCase.trialPhase}</Badge>
                <Badge variant="outline">{selectedCase.studyType}</Badge>
                <Badge variant="secondary">{getDiseaseAreaLabel(selectedCase.diseaseArea)}</Badge>
              </div>
            </div>

            {/* 试验基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>试验基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">试验登记号:</span>
                    <p className="text-muted-foreground">{selectedCase.trialId}</p>
                  </div>
                  <div>
                    <span className="font-medium">使用量表:</span>
                    <p className="text-muted-foreground">
                      {selectedCase.scaleName} ({selectedCase.scaleAcronym})
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">样本量:</span>
                    <p className="text-muted-foreground">{selectedCase.patientCount}例</p>
                  </div>
                  <div>
                    <span className="font-medium">试验周期:</span>
                    <p className="text-muted-foreground">{selectedCase.duration}</p>
                  </div>
                  <div>
                    <span className="font-medium">申办方:</span>
                    <p className="text-muted-foreground">{selectedCase.sponsor}</p>
                  </div>
                  <div>
                    <span className="font-medium">主要研究者:</span>
                    <p className="text-muted-foreground">{selectedCase.investigator}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 研究设计 */}
            <Card>
              <CardHeader>
                <CardTitle>研究设计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">入组标准</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                    {selectedCase.inclusion}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">干预措施</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                    {selectedCase.intervention}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">主要终点</h4>
                  <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                    {selectedCase.primaryEndpoint}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">次要终点</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedCase.secondaryEndpoints.map((endpoint, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {endpoint}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 主要结果 */}
            <Card>
              <CardHeader>
                <CardTitle>主要结果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">疗效结果</h4>
                  <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded">
                    {selectedCase.results.improvement}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">关键发现</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {selectedCase.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        <Target className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">研究局限性</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedCase.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-orange-500">•</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">临床意义</h4>
                  <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                    {selectedCase.clinicalImplications}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 发表信息 */}
            <Card>
              <CardHeader>
                <CardTitle>发表信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{selectedCase.publication}</span>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    查看原文
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: "/dashboard", label: t("common.dashboard") },
          { href: "/dashboard/interpretation", label: "量表解读" },
          { href: "/dashboard/cases", label: "临床案例" }
        ]}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* 页面标题和统计 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <Beaker className="w-6 h-6 text-blue-600" />
                <span>临床试验案例库</span>
              </h1>
              <p className="text-muted-foreground">
                探索量表在真实临床试验中的应用，学习最佳实践和研究设计
              </p>
            </div>
          </div>

        {/* 统计面板 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalCases || 0}</div>
              <div className="text-sm text-muted-foreground">总案例数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics.byEvidenceLevel?.A || 0}
              </div>
              <div className="text-sm text-muted-foreground">A级证据</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(statistics.byDiseaseArea || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">治疗领域</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filterOptions.scales?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">涉及量表</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索案例标题、量表名称、研究者或关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有领域</SelectItem>
                {filterOptions.diseaseAreas.map(area => (
                  <SelectItem key={area} value={area}>
                    {getDiseaseAreaLabel(area)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有期别</SelectItem>
                {filterOptions.trialPhases.map(phase => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 案例列表 */}
        <div className="grid gap-6">
          {cases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Beaker className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">暂无匹配的临床案例</h3>
                <p className="text-muted-foreground">
                  尝试调整搜索条件或筛选器
                </p>
              </CardContent>
            </Card>
          ) : (
            cases.map((clinicalCase) => (
              <Card key={clinicalCase.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedCase(clinicalCase)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {clinicalCase.trialId}
                        </Badge>
                        <Badge className={getEvidenceLevelColor(clinicalCase.evidenceLevel)}>
                          证据等级 {clinicalCase.evidenceLevel}
                        </Badge>
                        <Badge variant="outline">
                          {clinicalCase.trialPhase}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl leading-tight mb-2">
                        {clinicalCase.title}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {clinicalCase.scaleAcronym}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {clinicalCase.patientCount}例
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {clinicalCase.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* 主要终点 */}
                    <div>
                      <h5 className="font-medium text-sm mb-1">主要终点</h5>
                      <p className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                        {clinicalCase.primaryEndpoint}
                      </p>
                    </div>

                    {/* 关键结果 */}
                    <div>
                      <h5 className="font-medium text-sm mb-1">关键结果</h5>
                      <p className="text-sm text-muted-foreground bg-green-50 p-2 rounded">
                        {clinicalCase.results.improvement}
                      </p>
                    </div>

                    {/* 研究信息 */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building className="w-3 h-3" />
                        <span>{clinicalCase.sponsor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>已发表</span>
                      </div>
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1">
                      {clinicalCase.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {clinicalCase.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{clinicalCase.tags.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        查看详情
                      </Button>
                      <Link href={`/scales/${clinicalCase.scaleId}`}>
                        <Button size="sm" variant="outline">
                          查看量表
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 相关资源 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Beaker className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">研究设计指南</h4>
              <p className="text-xs text-muted-foreground mb-3">
                量表在临床试验中的使用指南
              </p>
              <Button size="sm" variant="outline" className="w-full">
                查看指南
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">统计分析</h4>
              <p className="text-xs text-muted-foreground mb-3">
                量表数据的统计分析方法
              </p>
              <Button size="sm" variant="outline" className="w-full">
                分析方法
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">监管指导</h4>
              <p className="text-xs text-muted-foreground mb-3">
                FDA/NMPA量表使用要求
              </p>
              <Button size="sm" variant="outline" className="w-full">
                监管要求
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}