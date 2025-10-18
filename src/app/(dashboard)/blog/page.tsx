'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { BlogPostCard } from '@/components/blog/blog-post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  BookOpen,
  Filter,
  TrendingUp,
  Eye,
  MessageCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  authorId: string;
  authorName?: string;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  readingTime?: number;
}

interface FilterOptions {
  categories: string[];
  tags: string[];
}

interface Statistics {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export default function BlogPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    tags: [],
  });
  const [statistics, setStatistics] = useState<Statistics>({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter, tagFilter, sortBy]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (tagFilter !== 'all') params.append('tag', tagFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', 'desc');
      params.append('status', 'published');

      const response = await fetch(`/api/blog/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
        setFilterOptions(data.filterOptions || { categories: [], tags: [] });
        setStatistics(data.statistics || {});
      } else {
        console.error(t('blog.failed_to_load', 'Failed to load posts'), data.error);
      }
    } catch (error) {
      console.error(t('blog.failed_to_load', 'Failed to load posts'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
          { href: '/blog', label: t('blog.title', 'Blog') },
        ]}
      />

      {/* Fixed Header and Search Area */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="p-4 space-y-4">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <span>{t('blog.page_title', 'Blog & Insights')}</span>
              </h1>
              <p className="text-muted-foreground">
                {t('blog.description', 'Latest articles and insights about psychological scales and assessments')}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{statistics.totalPosts || 0}</div>
                <div className="text-sm text-muted-foreground">{t('blog.total_posts', 'Total Posts')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{statistics.totalViews || 0}</div>
                <div className="text-sm text-muted-foreground">{t('blog.total_views', 'Total Views')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.totalLikes || 0}</div>
                <div className="text-sm text-muted-foreground">{t('blog.total_likes', 'Total Likes')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{statistics.totalComments || 0}</div>
                <div className="text-sm text-muted-foreground">{t('blog.total_comments', 'Total Comments')}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('blog.search_placeholder', 'Search posts by title, content...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('blog.category', 'Category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('blog.all_categories', 'All Categories')}</SelectItem>
                  {filterOptions.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('blog.tag', 'Tag')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('blog.all_tags', 'All Tags')}</SelectItem>
                  {filterOptions.tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('blog.sort_by', 'Sort By')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishedAt">{t('blog.sort_latest', 'Latest')}</SelectItem>
                  <SelectItem value="viewCount">{t('blog.sort_views', 'Most Viewed')}</SelectItem>
                  <SelectItem value="likeCount">{t('blog.sort_likes', 'Most Liked')}</SelectItem>
                  <SelectItem value="commentCount">{t('blog.sort_comments', 'Most Commented')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.search', 'Search')}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchQuery ? t('blog.no_matching_posts', 'No matching posts') : t('blog.no_posts_yet', 'No posts yet')}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? t('blog.adjust_search', 'Try adjusting your search criteria') : t('blog.posts_coming', 'Blog posts coming soon')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))
            )}
          </div>

          {/* Featured Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium mb-1">{t('blog.latest_insights', 'Latest Insights')}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('blog.latest_insights_desc', 'Stay updated with the latest research and trends')}
                </p>
                <Link href="/insights/interpretation">
                  <Button size="sm" variant="outline" className="w-full">
                    {t('blog.view_insights', 'View Insights')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-success" />
                <h4 className="font-medium mb-1">{t('blog.scale_library', 'Scale Library')}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('blog.scale_library_desc', 'Explore our comprehensive collection of scales')}
                </p>
                <Link href="/scales/search">
                  <Button size="sm" variant="outline" className="w-full">
                    {t('blog.browse_scales', 'Browse Scales')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium mb-1">{t('blog.join_discussion', 'Join Discussion')}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('blog.join_discussion_desc', 'Share your thoughts and connect with experts')}
                </p>
                <Link href="/insights/cases">
                  <Button size="sm" variant="outline" className="w-full">
                    {t('blog.view_cases', 'View Cases')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
