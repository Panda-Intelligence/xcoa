'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Search,
  Eye,
  Clock,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface Scale {
  id: string;
  name: string;
  nameEn?: string;
  acronym?: string;
  categoryName?: string;
  description?: string;
  itemsCount: number;
  administrationTime?: number;
  targetPopulation?: string;
  hasInterpretation: boolean;
}

export default function InterpretationPage() {
  const { t } = useLanguage();
  const [scales, setScales] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchScalesWithInterpretation();
  }, []);

  const fetchScalesWithInterpretation = async () => {
    try {
      const response = await fetch('/api/scales/interpretations');
      const data = await response.json();

      if (data.success) {
        setScales(data.scales || []);
      } else {
        console.error(t('insights.interpretation.failed_to_load'), data.error);
      }
    } catch (error) {
      console.error(t('insights.interpretation.failed_to_load'), error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选量表
  const filteredScales = scales.filter(scale => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      scale.name.toLowerCase().includes(query) ||
      scale.nameEn?.toLowerCase().includes(query) ||
      scale.acronym?.toLowerCase().includes(query) ||
      scale.categoryName?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          { href: "/insights/interpretation", label: t('insights.interpretation.title') }
        ]}
      />

      {/* 固定标题和搜索区域 */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="p-4 space-y-4">
          {/* 页面标题 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <span>{t('insights.interpretation.guide_title')}</span>
              </h1>
              <p className="text-muted-foreground">
                {t('insights.interpretation.description')}
              </p>
            </div>
          </div>

          {/* 搜索 */}
          <div className='flex'>
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('insights.interpretation.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 可滚动的量表网格区域 */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {/* 量表网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScales.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? t('insights.interpretation.no_matching_scales') : t('insights.interpretation.no_guides_yet')}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? t('insights.interpretation.adjust_search') : t('insights.interpretation.guides_coming')}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredScales.map((scale) => (
              <Card key={scale.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{scale.acronym}</Badge>
                        {scale.categoryName && (
                          <Badge variant="secondary" className="text-xs">
                            {scale.categoryName}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {scale.name}
                      </CardTitle>
                      {scale.nameEn && (
                        <CardDescription className="text-sm">
                          {scale.nameEn}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* 量表信息 */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {scale.itemsCount}{t('insights.interpretation.items')}
                      </span>
                      {scale.administrationTime && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {scale.administrationTime}{t('insights.interpretation.minutes')}
                        </span>
                      )}
                    </div>

                    {scale.targetPopulation && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-3 h-3 text-green-600" />
                        <span className="text-muted-foreground">{scale.targetPopulation}</span>
                      </div>
                    )}

                    {scale.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {scale.description}
                      </p>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex space-x-2 pt-2">
                      <Link href={`/insights/interpretation/${scale.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Eye className="w-3 h-3 mr-1" />
                          {t('insights.interpretation.view_interpretation')}
                        </Button>
                      </Link>
                      <Link href={`/scales/${scale.id}`}>
                        <Button size="sm" variant="outline">
                          {t('insights.interpretation.scale_details')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 解读服务说明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">{t('insights.interpretation.professional_interpretation')}</h4>
              <p className="text-xs text-muted-foreground">
                {t('insights.interpretation.evidence_based_guidance')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">{t('insights.interpretation.clinical_application')}</h4>
              <p className="text-xs text-muted-foreground">
                {t('insights.interpretation.clinical_guidance')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">{t('insights.interpretation.best_practices')}</h4>
              <p className="text-xs text-muted-foreground">
                {t('insights.interpretation.implementation_advice')}
              </p>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}