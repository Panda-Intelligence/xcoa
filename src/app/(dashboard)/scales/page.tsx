'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  Eye,
  Clock,
  Users,
  BookOpen,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { useFavoritesStore } from '@/state/favorites';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { useRouter } from 'next/navigation';
import type { HotScale } from './_components/types';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';

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
  licenseType?: string | null;
}

export default function ScalesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { fetchUserFavorites } = useFavoritesStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allScales, setAllScales] = useState<HotScale[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingAllScales, setLoadingAllScales] = useState(false);
  const [searchType] = useState('hybrid');
  const [filters, setFilters] = useState({
    category: 'all',
    treatmentArea: 'all',
    validationStatus: 'all',
    sortBy: 'relevance',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const columns = useMemo<ColumnDef<HotScale>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => t("scales.name", "量表名称"),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{language === 'zh' ? row.original.name : row.original.nameEn}</div>
            {language !== 'en' && row.original.nameEn && (
              <div className="text-xs text-muted-foreground">{row.original.nameEn}</div>
            )}
          </div>
        ),
        size: 400,
      },
      {
        accessorKey: 'acronym',
        header: () => t("scales.acronym", "缩写"),
        cell: ({ row }) => <Badge variant="outline">{row.original.acronym}</Badge>,
      },
      {
        accessorKey: 'categoryName',
        header: () => t("scales.category", "分类"),
        cell: ({ row }) => <Badge variant="secondary" className="text-xs">{row.original.categoryName}</Badge>,
      },
      {
        accessorKey: 'itemsCount',
        header: () => <div className="text-center">{t("scales.items", "条目数")}</div>,
        cell: ({ row }) => <div className="text-center">{row.original.itemsCount}</div>,
      },
      {
        accessorKey: 'administrationTime',
        header: () => <div className="text-center">{t("scales.time", "时长")}</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.administrationTime ? `${row.original.administrationTime} ${t("scales.minutes", "分钟")}` : '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">{t("scales.actions", "操作")}</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Link href={`/scales/${row.original.id}/preview`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <FavoriteButton
              scaleId={row.original.id}
              variant="icon"
              size="sm"
            />
            <Link href={`/scales/copyright/create?scaleId=${row.original.id}`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Shield className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [t, language]
  );

  const table = useReactTable({
    data: allScales,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(pagination.total / pagination.limit),
  });

  const handlePageSizeChange = (newLimit: string) => {
    setPagination(prev => ({
      ...prev,
      limit: Number.parseInt(newLimit, 10),
      page: 1,
    }));
    fetchAllScales(1);
  };

  // 获取分类列表
  useEffect(() => {
    fetch('/api/search/filters')
      .then(res => res.json())
      .then(data => setCategories((data as { categories?: unknown[] }).categories || []))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // 获取所有量表（分页）
  const fetchAllScales = async (page: number = 1) => {
    setLoadingAllScales(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        category: filters.category,
        treatmentArea: filters.treatmentArea,
        sortBy: filters.sortBy,
      });

      const response = await fetch(`/api/scales?${params}`);
      const data = await response.json();

      if (data.success) {
        setAllScales(data.scales || []);
        setPagination(prev => ({
          ...prev,
          page,
          total: data.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load all scales:', error);
    } finally {
      setLoadingAllScales(false);
    }
  };

  // 当切换到 "all" tab 时加载数据
  useEffect(() => {
    fetchAllScales(1);
  }, [filters.category, filters.treatmentArea, filters.sortBy]);

  // 翻页
  const handlePageChange = (newPage: number) => {
    fetchAllScales(newPage);
  };

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

  const getLicenseIcon = (licenseType?: string | null) => {
    if (!licenseType) return '🔍';

    switch (licenseType) {
      case 'public_domain':
        return '🆓';
      case 'free_with_attribution':
        return '📝';
      case 'contact_required':
        return '📧';
      case 'commercial':
        return '💼';
      case 'research_only':
        return '🔬';
      default:
        return '🔍';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: "/scales", label: t("scales_page.title") }
        ]}
      />

      {/* 固定搜索区域 */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="">
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
              {/* 搜索选项 */}
              <div className="flex flex-wrap gap-4">

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
                  <span className="text-sm font-medium">{t("scales_page.treatment_area.label", "治疗领域")}:</span>
                  <Select value={filters.treatmentArea} onValueChange={(value) =>
                    setFilters(prev => ({ ...prev, treatmentArea: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("scales_page.all_treatment_areas", "全部")}</SelectItem>
                      <SelectItem value="immunology">{t("scales_page.treatment_area.immunology", "免疫")}</SelectItem>
                      <SelectItem value="respiratory">{t("scales_page.treatment_area.respiratory", "呼吸")}</SelectItem>
                      <SelectItem value="digestive">{t("scales_page.treatment_area.digestive", "消化")}</SelectItem>
                      <SelectItem value="neurology">{t("scales_page.treatment_area.neurology", "神内")}</SelectItem>
                      <SelectItem value="oncology">{t("scales_page.treatment_area.oncology", "肿瘤")}</SelectItem>
                      <SelectItem value="hematology">{t("scales_page.treatment_area.hematology", "血液")}</SelectItem>
                      <SelectItem value="dermatology">{t("scales_page.treatment_area.dermatology", "皮肤")}</SelectItem>
                      <SelectItem value="general">{t("scales_page.treatment_area.general", "通用")}</SelectItem>
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
          </CardContent>
        </div>
      </div>

      {/* 可滚动的结果区域 */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">

          {loadingAllScales ? (
            <div className="border rounded-md flex-1">
              <div className="animate-pulse p-4 space-y-3">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ) : (
            results.length === 0 && <>
              {/* 表格容器 - 固定表头和底部 */}
              <div className="border rounded-md flex-1 flex flex-col overflow-hidden">
                <div className="overflow-y-auto flex-1">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                      {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <TableHead
                              key={header.id}
                              className="bg-background"
                              style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map(row => (
                        <TableRow
                          key={row.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/scales/${row.original.id}`)}
                        >
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 分页控件 - 顶部 */}
              {pagination.total > 0 && (
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {t("common.total_records", "Total {{total}} records", { total: pagination.total })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{t("common.page_size", "每页显示")}</span>
                      <Select value={pagination.limit.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">{t("common.items", "条")}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t("common.previous", "上一页")}
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      {t("common.page_info", `第 ${pagination.page} 页，共 ${Math.ceil(pagination.total / pagination.limit)} 页`)}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      {t("common.next", "下一页")}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 搜索结果 */}
          {results.length > 0 && (
            <div>
              <CardHeader>
                <CardTitle>{t("scales_page.search_results")}</CardTitle>
                <CardDescription>
                  {t("scales_page.found_matches", `找到 ${results.length} 个匹配的量表`).replace("{count}", results.length.toString())}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => router.push(`/scales/${result.id}`)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">{result.name}</h3>
                            <Badge variant="outline">{result.acronym}</Badge>
                            <span className="text-lg">{getLicenseIcon(result.licenseType)}</span>
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
                              {result.items_count} {t("scales.items", "items")}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {result.administration_time} {t("scales.minutes", "minutes")}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {result.category}
                            </span>
                          </div>
                        </div>

                        {/* 右侧快速操作区域 - 阻止卡片点击事件 */}
                        <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/scales/${result.id}/preview`}>
                            <Button size="sm" variant="outline" className="px-2">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </Link>
                          <FavoriteButton
                            scaleId={result.id}
                            variant="icon"
                            size="sm"
                          />
                          <Link href={`/scales/${result.id}/copyright`}>
                            <Button size="sm" variant="outline" className="px-2">
                              <Shield className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </div>
          )}

          {/* 空状态 */}
          {!loading && results.length === 0 && query && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">{t("scales.no_results", "No matching scales found")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("scales.no_results_suggestion", "Try different keywords or adjust filter criteria")}
                </p>
                <Button variant="outline" onClick={() => setQuery('')}>
                  {t("scales.clear_search", "Clear Search")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}