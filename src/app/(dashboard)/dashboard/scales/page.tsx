'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  MessageSquare,
  Eye,
  Clock,
  Users,
  BookOpen,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useFavoritesStore } from '@/state/favorites';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

interface SearchResult {
  id: string;
  name: string;
  nameEn: string;
  acronym: string;
  description: string;
  category: string;
  items_count: number;
  administration_time: number;
  validation_status: string;
  match_score: number;
  languages: string[];
  usageCount: number;
}

interface HotScale {
  id: string;
  name: string;
  nameEn: string;
  acronym: string;
  categoryName: string;
  itemsCount: number;
  administrationTime: number;
  targetPopulation: string;
  validationStatus: string;
  usageCount: number;
  favoriteCount: number;
  icon: string;
}

export default function ScalesPage() {
  const { t } = useLanguage();
  const { fetchUserFavorites } = useFavoritesStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hotScales, setHotScales] = useState<HotScale[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHotScales, setLoadingHotScales] = useState(true);
  const [searchType, setSearchType] = useState('hybrid');
  const [filters, setFilters] = useState({
    category: 'all',
    validationStatus: 'all',
    sortBy: 'relevance',
  });
  const [categories, setCategories] = useState<any[]>([]);

  // 获取分类列表
  useEffect(() => {
    fetch('/api/search/filters')
      .then(res => res.json())
      .then(data => setCategories((data as { categories?: unknown[] }).categories || []))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // 获取热门量表数据
  useEffect(() => {
    fetch('/api/scales/hot')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHotScales(data.scales || []);
        }
      })
      .catch(err => console.error('Failed to load hot scales:', err))
      .finally(() => setLoadingHotScales(false));
  }, []);

  // 批量获取用户收藏状态
  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const endpoint = searchType === 'advanced' ? '/api/search/advanced' : `/api/search/${searchType}`;
      const searchData = searchType === 'advanced' ? {
        query,
        categories: filters.category !== 'all' ? [filters.category] : undefined,
        validationStatuses: filters.validationStatus !== 'all' ? [filters.validationStatus] : undefined,
        sortBy: filters.sortBy,
      } : {
        query,
        category: filters.category,
        sortBy: filters.sortBy,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });

      const data = await response.json();
      setResults((data as { results?: SearchResult[] }).results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseIcon = (acronym: string) => {
    // 基于已知的许可信息返回图标
    const publicDomain = ['HAM-D', 'HAM-A'];
    const needsContact = ['PHQ-9', 'GAD-7'];
    const commercial = ['BDI-II', 'MMSE-2'];

    if (publicDomain.includes(acronym)) return '🆓';
    if (needsContact.includes(acronym)) return '📧';
    if (commercial.includes(acronym)) return '💼';
    return '🔍';
  };

  return (
    <>
      <PageHeader
        items={[
          { href: "/dashboard", label: t("common.dashboard") },
          { href: "/dashboard/scales", label: t("scales_page.title") }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* 搜索区域 */}
        <div>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>{t("scales_page.search_title")}</span>
            </CardTitle>
            <CardDescription>
              {t("scales_page.search_description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 搜索输入 */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder={t("scales_page.search_placeholder")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? t("scales_page.searching") : t("scales_page.search")}
              </Button>
            </div>

            {/* 搜索选项 */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t("scales_page.search_type")}:</span>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="search">{t("scales_page.basic_search")}</SelectItem>
                    <SelectItem value="semantic">{t("scales_page.semantic_search")}</SelectItem>
                    <SelectItem value="hybrid">{t("scales_page.hybrid_search")}</SelectItem>
                    <SelectItem value="advanced">{t("scales_page.advanced_filter")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t("scales_page.category")}:</span>
                <Select value={filters.category} onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("scales_page.all_categories")}</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.scaleCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t("scales_page.sort_by")}:</span>
                <Select value={filters.sortBy} onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, sortBy: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t("scales_page.relevance")}</SelectItem>
                    <SelectItem value="name">{t("scales_page.name")}</SelectItem>
                    <SelectItem value="usage">{t("scales_page.usage_frequency")}</SelectItem>
                    <SelectItem value="recent">{t("scales_page.recent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </div>

        {/* 搜索结果 */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("scales_page.search_results")}</CardTitle>
              <CardDescription>
                {t("scales_page.found_matches", `找到 ${results.length} 个匹配的量表`).replace("{count}", results.length.toString())}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{result.name}</h3>
                          <Badge variant="outline">{result.acronym}</Badge>
                          <span className="text-lg">{getLicenseIcon(result.acronym)}</span>
                        </div>

                        {result.nameEn && (
                          <p className="text-sm text-muted-foreground italic mb-2">
                            {result.nameEn}
                          </p>
                        )}

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {result.description}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {result.items_count} 题项
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {result.administration_time} 分钟
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {result.category}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {result.usageCount} 次使用
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Link href={`/scales/${result.id}`}>
                          <Button size="sm" variant="default">
                            查看详情
                          </Button>
                        </Link>
                        <Link href={`/scales/${result.id}/preview`}>
                          <Button size="sm" variant="outline">
                            预览
                          </Button>
                        </Link>
                        <Link href={`/scales/${result.id}/copyright`}>
                          <Button size="sm" variant="outline">
                            <Shield className="w-3 h-3 mr-1" />
                            版权
                          </Button>
                        </Link>
                        <FavoriteButton 
                          scaleId={result.id}
                          size="sm"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态 */}
        {!loading && results.length === 0 && query && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">没有找到匹配的量表</h3>
              <p className="text-muted-foreground mb-4">
                尝试使用不同的关键词或调整筛选条件
              </p>
              <Button variant="outline" onClick={() => setQuery('')}>
                清除搜索
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 默认显示热门量表 */}
        {!query && results.length === 0 && (
          <div>
            <CardHeader>
              <CardTitle>热门量表</CardTitle>
              <CardDescription>
                最常用的 eCOA 评估工具
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loadingHotScales ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotScales.map((scale) => (
                    <Card key={scale.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium mb-1 text-sm leading-tight">{scale.name}</h4>
                          <Badge variant="outline">{scale.acronym}</Badge>
                          {/* <span className="text-lg">{scale.icon}</span> */}
                        </div>

                        <Badge className="text-xs text-muted-foreground mb-2">{scale.categoryName}</Badge>
                        <div className="text-xs text-muted-foreground mb-3 space-y-1">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{scale.itemsCount}题</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{scale.administrationTime}分钟</span>
                          </div>
                          {/* <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>使用{scale.usageCount}次</span>
                          </div> */}
                        </div>
                        <div className="flex gap-1">
                          <Link href={`/scales/${scale.id}`}>
                            <Button size="sm" variant="outline" className="flex-1 text-xs">
                              详情
                            </Button>
                          </Link>
                          <Link href={`/scales/${scale.id}/preview`}>
                            <Button size="sm" variant="outline" className="px-2">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </Link>
                          <FavoriteButton 
                            scaleId={scale.id}
                            variant="icon"
                            size="sm"
                          />
                          <Link href={`/scales/${scale.id}/copyright`}>
                            <Button size="sm" variant="outline" className="px-2">
                              <Shield className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        )}
      </div>
    </>
  );
}