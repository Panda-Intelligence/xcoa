'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Heart,
  Search,
  Grid,
  List,
  Clock,
  BookOpen,
  Eye,
  Filter,
  Trash2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface FavoriteScale {
  id: string;
  scaleId: string;
  scaleName: string;
  scaleNameEn: string;
  acronym: string;
  description: string;
  itemsCount: number;
  administrationTime: number;
  categoryName: string;
  notes: string;
  createdAt: string;
}

export default function ScaleFavoritesPage() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 加载收藏数据
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites');
      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites || []);
      } else {
        console.error('加载收藏失败:', data.error);
      }
    } catch (error) {
      console.error('加载收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 移除收藏
  const handleRemoveFavorite = async (scaleId: string) => {
    try {
      const response = await fetch(`/api/scales/${scaleId}/favorite`, {
        method: 'POST' // 切换状态
      });

      if (response.ok) {
        // 从列表中移除
        setFavorites(prev => prev.filter(fav => fav.scaleId !== scaleId));
      }
    } catch (error) {
      console.error('移除收藏失败:', error);
    }
  };

  // 筛选收藏
  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = !searchQuery ||
      fav.scaleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' ||
      fav.categoryName === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // 获取所有分类
  const categories = Array.from(new Set(favorites.map(fav => fav.categoryName))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          { href: "/scales", label: t("scales_page.title") },
          { href: "/scales/favorites", label: "我的收藏" }
        ]}
      />

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* 页面标题和统计 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <Heart className="w-6 h-6 text-red-500" />
                <span>我的量表收藏</span>
              </h1>
              <p className="text-muted-foreground">
                已收藏 {favorites.length} 个量表，快速访问您常用的评估工具
              </p>
            </div>

            <Link href="/scales">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加量表
              </Button>
            </Link>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col items-center sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索收藏的量表..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 收藏内容 */}
          {filteredFavorites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || categoryFilter !== 'all' ? '没有找到匹配的收藏' : '还没有收藏的量表'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== 'all'
                    ? '尝试调整搜索条件或筛选器'
                    : '开始收藏您常用的量表，建立个人工具箱'
                  }
                </p>
                <Link href="/scales">
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    去搜索量表
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              }`}>
              {filteredFavorites.map((favorite) => (
                <Card key={favorite.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{favorite.acronym}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {favorite.categoryName}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {favorite.scaleName}
                        </CardTitle>
                        {favorite.scaleNameEn && (
                          <CardDescription className="text-sm">
                            {favorite.scaleNameEn}
                          </CardDescription>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleRemoveFavorite(favorite.scaleId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {/* 量表信息 */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {favorite.itemsCount}题
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {favorite.administrationTime}分钟
                        </span>
                      </div>

                      {/* 个人笔记 */}
                      {favorite.notes && (
                        <div className="bg-yellow-50 p-2 rounded text-xs">
                          <span className="font-medium">笔记: </span>
                          {favorite.notes}
                        </div>
                      )}

                      {/* 收藏时间 */}
                      <div className="text-xs text-muted-foreground">
                        收藏时间: {new Date(favorite.createdAt).toLocaleDateString()}
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex space-x-2">
                        <Link href={`/scales/${favorite.scaleId}`}>
                          <Button size="sm" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            查看详情
                          </Button>
                        </Link>
                        <Link href={`/scales/${favorite.scaleId}/preview`}>
                          <Button size="sm" variant="outline">
                            预览
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 收藏统计 */}
          {favorites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">收藏统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{favorites.length}</div>
                    <div className="text-sm text-muted-foreground">总收藏</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                    <div className="text-sm text-muted-foreground">涉及分类</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {favorites.filter(f => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(f.createdAt) > weekAgo;
                      }).length}
                    </div>
                    <div className="text-sm text-muted-foreground">本周新增</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(favorites.reduce((sum, fav) => sum + fav.administrationTime, 0) / favorites.length) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">平均时长(分钟)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}