'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  User
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface BlogPostHeaderProps {
  title: string;
  category?: string;
  tags?: string[];
  authorName?: string;
  authorAvatar?: string;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  readingTime?: number;
}

export function BlogPostHeader({
  title,
  category,
  tags,
  authorName,
  authorAvatar,
  publishedAt,
  viewCount,
  likeCount,
  commentCount,
  readingTime,
}: BlogPostHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 border-b pb-6">
      {/* Category and Tags */}
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        {category && (
          <Badge variant="outline" className="text-sm">
            {category}
          </Badge>
        )}
        {tags?.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-sm">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
        {title}
      </h1>

      {/* Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={authorAvatar} alt={authorName || 'Author'} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{authorName || t('blog.anonymous', 'Anonymous')}</span>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              {publishedAt && (
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(publishedAt).toLocaleDateString()}
                </span>
              )}
              {readingTime && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {readingTime} {t('blog.min_read', 'min read')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {typeof viewCount === 'number' && (
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {viewCount}
            </span>
          )}
          {typeof likeCount === 'number' && (
            <span className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {likeCount}
            </span>
          )}
          {typeof commentCount === 'number' && (
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
