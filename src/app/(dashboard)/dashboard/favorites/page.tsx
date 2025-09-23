'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Heart,
  Search,
  Plus,
  Folder,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  BookOpen,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Share
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

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

interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  items_count: number;
  is_default: boolean;
  created_at: string;
}

export default function FavoritesPage() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteScale[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);

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
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error('加载收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选收藏
  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = !searchQuery ||
      fav.scale_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCollection = selectedCollection === 'all' ||
      fav.collection_name === selectedCollection;

    return matchesSearch && matchesCollection;
  });

  // 按优先级和置顶状态排序
  const sortedFavorites = filteredFavorites.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return b.is_pinned ? 1 : -1;
    }
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

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
    <>
      <PageHeader
        items={[
          { href: "/dashboard", label: t("common.dashboard") },
          { href: "/dashboard/favorites", label: "我的收藏" }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题和统计 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">我的量表收藏</h1>
            <p className="text-muted-foreground">
              管理您收藏的量表，按项目和用途分类整理
            </p>
          </div>

          {/* 创建分类按钮 */}
          <Dialog open={createCollectionOpen} onOpenChange={setCreateCollectionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建分类
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建收藏分类</DialogTitle>
                <DialogDescription>
                  为您的收藏量表创建一个新的分类
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>分类名称</Label>
                  <Input placeholder="例如：我的研究项目" />
                </div>
                <div>
                  <Label>描述</Label>
                  <Textarea placeholder="简单描述这个分类的用途..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>颜色</Label>
                    <Select defaultValue="blue">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">蓝色</SelectItem>
                        <SelectItem value="green">绿色</SelectItem>
                        <SelectItem value="purple">紫色</SelectItem>
                        <SelectItem value="orange">橙色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>图标</Label>
                    <Select defaultValue="folder">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="folder">文件夹</SelectItem>
                        <SelectItem value="beaker">研究</SelectItem>
                        <SelectItem value="stethoscope">临床</SelectItem>
                        <SelectItem value="graduation-cap">教学</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateCollectionOpen(false)}>
                    取消
                  </Button>
                  <Button>
                    创建分类
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
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
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.name}>
                    {collection.name} ({collection.items_count})
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

        <Tabs defaultValue="favorites" className="space-y-4">
          <TabsList>
            <TabsTrigger value="favorites">收藏量表</TabsTrigger>
            <TabsTrigger value="collections">分类管理</TabsTrigger>
            <TabsTrigger value="shared">分享的收藏</TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-4">
            {sortedFavorites.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">还没有收藏的量表</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? '没有找到匹配的收藏' : '开始收藏您常用的量表吧'}
                  </p>
                  <Link href="/dashboard/scales">
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
                {sortedFavorites.map((favorite) => (
                  <Card key={favorite.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {favorite.is_pinned && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <Badge variant="outline">{favorite.acronym}</Badge>
                            <Badge
                              style={{ backgroundColor: favorite.collection_color + '20', color: favorite.collection_color }}
                              className="text-xs"
                            >
                              {favorite.collection_name}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg leading-tight">
                            {favorite.scale_name}
                          </CardTitle>
                          {favorite.scale_name_en && (
                            <CardDescription className="text-sm">
                              {favorite.scale_name_en}
                            </CardDescription>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
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
                            {favorite.items_count}题
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {favorite.administration_time}分钟
                          </span>
                        </div>

                        {/* 个人笔记 */}
                        {favorite.personal_notes && (
                          <div className="bg-yellow-50 p-2 rounded text-xs">
                            <span className="font-medium">笔记: </span>
                            {favorite.personal_notes}
                          </div>
                        )}

                        {/* 标签 */}
                        {favorite.tags && favorite.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {favorite.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex space-x-2">
                          <Link href={`/scales/${favorite.scale_id}`}>
                            <Button size="sm" className="flex-1">
                              <Eye className="w-3 h-3 mr-1" />
                              查看详情
                            </Button>
                          </Link>
                          <Link href={`/scales/${favorite.scale_id}/preview`}>
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
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Card key={collection.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: collection.color }}
                        >
                          <Folder className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{collection.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {collection.items_count} 个量表
                          </CardDescription>
                        </div>
                      </div>

                      {!collection.is_default && (
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  {collection.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {collection.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            <Card>
              <CardContent className="text-center py-12">
                <Share className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">分享功能</h3>
                <p className="text-muted-foreground">
                  即将推出团队收藏分享功能
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}