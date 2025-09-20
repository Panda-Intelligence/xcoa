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
  Heart,
  Eye,
  Clock,
  Users,
  BookOpen,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

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

export default function ScalesPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
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
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

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
      setResults(data.results || []);
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
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/scales", label: "eCOA 量表" }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* 搜索区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>量表搜索</span>
            </CardTitle>
            <CardDescription>
              搜索 15+ 专业 eCOA 量表，获取版权许可信息
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 搜索输入 */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="搜索量表名称、缩写或描述..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? '搜索中...' : '搜索'}
              </Button>
            </div>

            {/* 搜索选项 */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">搜索类型:</span>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="search">基础搜索</SelectItem>
                    <SelectItem value="semantic">语义搜索</SelectItem>
                    <SelectItem value="hybrid">混合搜索</SelectItem>
                    <SelectItem value="advanced">高级筛选</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">分类:</span>
                <Select value={filters.category} onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分类</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.scaleCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">排序:</span>
                <Select value={filters.sortBy} onValueChange={(value) =>
                  setFilters(prev => ({ ...prev, sortBy: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">相关性</SelectItem>
                    <SelectItem value="name">名称</SelectItem>
                    <SelectItem value="usage">使用频率</SelectItem>
                    <SelectItem value="recent">最新</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 搜索结果 */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>搜索结果</CardTitle>
              <CardDescription>
                找到 {results.length} 个匹配的量表
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
                          <Badge variant={result.validation_status === 'validated' ? 'default' : 'secondary'}>
                            {result.validation_status === 'validated' ? '已验证' : result.validation_status}
                          </Badge>
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
                        <Button size="sm" variant="outline">
                          <Heart className="w-3 h-3 mr-1" />
                          收藏
                        </Button>
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
          <Card>
            <CardHeader>
              <CardTitle>热门量表</CardTitle>
              <CardDescription>
                最常用的 eCOA 评估工具
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { acronym: 'PHQ-9', name: '患者健康问卷-9', category: '抑郁症评估', icon: '📧' },
                  { acronym: 'GAD-7', name: '广泛性焦虑障碍-7', category: '焦虑症评估', icon: '📧' },
                  { acronym: 'HAM-D', name: '汉密尔顿抑郁量表', category: '抑郁症评估', icon: '🆓' },
                  { acronym: 'MoCA', name: '蒙特利尔认知评估', category: '认知功能评估', icon: '🎓' },
                  { acronym: 'BDI-II', name: '贝克抑郁量表-II', category: '抑郁症评估', icon: '💼' },
                  { acronym: 'EORTC QLQ-C30', name: 'EORTC生活质量问卷', category: '生活质量评估', icon: '🎓' },
                ].map((scale) => (
                  <Card key={scale.acronym} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{scale.acronym}</Badge>
                        <span className="text-lg">{scale.icon}</span>
                      </div>
                      <h4 className="font-medium mb-1">{scale.name}</h4>
                      <p className="text-xs text-muted-foreground">{scale.category}</p>
                      <div className="flex gap-1 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          详情
                        </Button>
                        <Button size="sm" variant="outline">
                          <Shield className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">版权许可查询</h4>
              <p className="text-xs text-muted-foreground mb-3">
                检查量表使用许可要求
              </p>
              <Link href="/dashboard/copyright">
                <Button size="sm" variant="outline" className="w-full">
                  立即查询
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">量表解读指南</h4>
              <p className="text-xs text-muted-foreground mb-3">
                专业的量表使用和解读指导
              </p>
              <Link href="/dashboard/interpretation">
                <Button size="sm" variant="outline" className="w-full">
                  查看指南
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">联系工单</h4>
              <p className="text-xs text-muted-foreground mb-3">
                查看版权联系工单状态
              </p>
              <Link href="/dashboard/copyright/tickets">
                <Button size="sm" variant="outline" className="w-full">
                  我的工单
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}