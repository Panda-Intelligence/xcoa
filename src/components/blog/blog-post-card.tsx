'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Clock,
  Calendar,
  MessageCircle,
  ThumbsUp,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface BlogPostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    authorName?: string;
    publishedAt?: string;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    readingTime?: number;
  };
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
              {post.category && (
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              )}
              {post.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-xl leading-tight mb-2">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </CardTitle>
            {post.excerpt && (
              <CardDescription className="text-sm line-clamp-3">
                {post.excerpt}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Author and Date */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {post.authorName && (
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {post.authorName}
              </span>
            )}
            {post.publishedAt && (
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {post.readingTime} {t('blog.minutes', 'min')}
              </span>
            )}
          </div>

          {/* Statistics */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {typeof post.viewCount === 'number' && (
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {post.viewCount}
              </span>
            )}
            {typeof post.likeCount === 'number' && (
              <span className="flex items-center">
                <ThumbsUp className="w-3 h-3 mr-1" />
                {post.likeCount}
              </span>
            )}
            {typeof post.commentCount === 'number' && (
              <span className="flex items-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                {post.commentCount}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Link href={`/blog/${post.slug}`} className="w-full block">
            <Button size="sm" className="w-full">
              <Eye className="w-3 h-3 mr-1" />
              {t('blog.read_more', 'Read More')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
