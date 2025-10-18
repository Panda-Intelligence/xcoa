'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Beaker,
  Users,
  Award,
  BookOpen,
  BarChart3,
  Eye,
  Target,
  Clock,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';

interface ClinicalCase {
  id: string;
  title: string;
  scaleId: string;
  scaleName: string;
  scaleNameEn?: string;
  scaleAcronym: string;
  scaleDescription?: string;
  patientBackground?: string;
  scaleScores?: Record<string, number>;
  interpretation?: string;
  clinicalDecision?: string;
  outcome?: string;
  learningPoints?: string;
  difficultyLevel?: string;
  specialty?: string;
  author?: string;
  reviewStatus: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  specialties: string[];
  difficultyLevels: string[];
  scales: Array<{ id: string; name: string; acronym: string }>;
}

export default function ClinicalCasesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    specialties: [],
    difficultyLevels: [],
    scales: []
  });
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    fetchCases();
  }, [specialtyFilter, difficultyFilter]);

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (specialtyFilter !== 'all') params.append('specialty', specialtyFilter);
      if (difficultyFilter !== 'all') params.append('difficultyLevel', difficultyFilter);

      const response = await fetch(`/api/clinical-cases?${params}`);
      const data = await response.json();

      if (data.success) {
        setCases(data.cases || []);
        setFilterOptions(data.filterOptions || {});
        setStatistics(data.statistics || {});
      }
    } catch (error) {
      console.error(t('insights.cases.failed_to_load'), error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLevelColor = (level?: string) => {
    const colorMap = {
      'beginner': 'bg-green-100 text-green-800 border-green-200',
      'intermediate': 'bg-primary/10 text-primary border-blue-200',
      'advanced': 'bg-red-100 text-red-800 border-red-200'
    };
    return level ? colorMap[level as keyof typeof colorMap] || 'bg-gray-100 text-foreground border' : 'bg-gray-100 text-foreground border';
  };

  const getSpecialtyLabel = (specialty?: string) => {
    const labels: Record<string, string> = {
      psychiatry: t('insights.specialty.psychiatry'),
      oncology: t('insights.specialty.oncology'),
      neurology: t('insights.specialty.neurology'),
      cardiology: t('insights.specialty.cardiology'),
      general: t('insights.specialty.general')
    };
    return specialty ? labels[specialty] || specialty : t('insights.specialty.unknown');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: "/insights/interpretation", label: t('insights.interpretation.title') },
          { href: "/insights/cases", label: t('insights.cases.title') }
        ]}
      />

      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* 固定标题和搜索筛选区域 */}
          <div className="flex-shrink-0 border-b bg-background">
            <div className="p-4 space-y-4">
              {/* 页面标题和统计 */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center space-x-2">
                    <Beaker className="w-6 h-6 text-primary" />
                    <span>{t('insights.cases.case_library_title')}</span>
                  </h1>
                  <p className="text-muted-foreground">
                    {t('insights.cases.description')}
                  </p>
                </div>
              </div>

              {/* 统计面板 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{statistics.totalCases || 0}</div>
                    <div className="text-sm text-muted-foreground">{t('insights.cases.total_cases')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-success">
                      {statistics.byDifficultyLevel?.beginner || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('insights.cases.beginner_cases')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(statistics.bySpecialty || {}).length}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('insights.cases.specialty_areas')}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {filterOptions.scales?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('insights.cases.scales_involved')}</div>
                  </CardContent>
                </Card>
              </div>

              {/* 搜索和筛选 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('insights.cases.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchCases()}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('insights.cases.specialty')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('insights.cases.all_specialties')}</SelectItem>
                      {filterOptions.specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t('insights.cases.difficulty')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('insights.cases.all_difficulties')}</SelectItem>
                      {filterOptions.difficultyLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={fetchCases} disabled={loading}>
                  {loading ? t('common.searching') : t('common.search')}
                </Button>
              </div>
            </div>
          </div>

          {/* 可滚动的案例内容区域 */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              {/* 案例列表 */}

              {cases.length === 0 ? (
                <div className='mb-20'>
                  <CardContent className="text-center py-12">
                    <Beaker className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">{t('insights.cases.no_matching_cases')}</h3>
                    <p className="text-muted-foreground">
                      {t('insights.cases.adjust_filters')}
                    </p>
                  </CardContent>
                </div>
              ) : (<div className="grid grid-cols-2 gap-6">
                {cases.map((clinicalCase) => (
                  <Card key={clinicalCase.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/insights/cases/${clinicalCase.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {clinicalCase.scaleAcronym}
                            </Badge>
                            {clinicalCase.difficultyLevel && (
                              <Badge className={getDifficultyLevelColor(clinicalCase.difficultyLevel)}>
                                {clinicalCase.difficultyLevel}
                              </Badge>
                            )}
                            {clinicalCase.specialty && (
                              <Badge variant="outline">
                                {getSpecialtyLabel(clinicalCase.specialty)}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl leading-tight mb-2">
                            {clinicalCase.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {clinicalCase.scaleAcronym}
                            </span>
                            {clinicalCase.author && (
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {clinicalCase.author}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(clinicalCase.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* 患者背景 */}
                        {clinicalCase.patientBackground && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">{t('insights.cases.patient_background')}</h5>
                            <p className="text-sm text-muted-foreground bg-primary/10 p-2 rounded">
                              {clinicalCase.patientBackground}
                            </p>
                          </div>
                        )}

                        {/* 结果解读 */}
                        {clinicalCase.interpretation && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">{t('insights.cases.result_interpretation')}</h5>
                            <p className="text-sm text-muted-foreground bg-success/10 p-2 rounded">
                              {clinicalCase.interpretation}
                            </p>
                          </div>
                        )}

                        {/* 量表评分 */}
                        {clinicalCase.scaleScores && Object.keys(clinicalCase.scaleScores).length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">{t('insights.cases.score_results')}</h5>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(clinicalCase.scaleScores).map(([key, value]) => (
                                <div key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {key}: {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 案例信息 */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3" />
                            <span>{getSpecialtyLabel(clinicalCase.specialty)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{clinicalCase.reviewStatus}</span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/insights/cases/${clinicalCase.id}`);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {t('insights.cases.view_details')}
                          </Button>
                          <Link href={`/scales/${clinicalCase.scaleId}`}>
                            <Button size="sm" variant="outline">
                              {t('insights.cases.view_scale')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}

              {/* 相关资源 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Beaker className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium mb-1">{t('insights.cases.research_design_guide')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('insights.cases.scale_usage_guide')}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      {t('insights.cases.view_guide')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-success" />
                    <h4 className="font-medium mb-1">{t('insights.cases.statistical_analysis')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('insights.cases.analysis_methods')}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      {t('insights.cases.analysis_methods_btn')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium mb-1">{t('insights.cases.regulatory_guidance')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('insights.cases.fda_requirements')}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      {t('insights.cases.regulatory_requirements')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}