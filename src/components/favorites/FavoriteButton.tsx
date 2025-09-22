'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/state/session';
import { useFavoritesStore } from '@/state/favorites';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  scaleId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'button' | 'icon';
  className?: string;
}

export function FavoriteButton({ 
  scaleId, 
  size = 'md',
  showCount = false,
  variant = 'button',
  className 
}: FavoriteButtonProps) {
  const { t } = useLanguage();
  const { session } = useSessionStore();
  const { 
    isFavorited, 
    toggleFavorite, 
    getFavoritesCount, 
    isLoading: storeLoading 
  } = useFavoritesStore();
  
  const [loading, setLoading] = useState(false);

  const isFav = isFavorited(scaleId);
  const favoritesCount = showCount ? getFavoritesCount() : 0;

  const handleToggle = async () => {
    if (!session?.user) {
      alert('请先登录后再收藏量表');
      return;
    }

    setLoading(true);
    
    try {
      await toggleFavorite(scaleId);
    } catch (error) {
      console.error('收藏操作失败:', error);
      alert('操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-2 text-xs';
      case 'lg':
        return 'h-12 px-6 text-base';
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={loading || storeLoading}
        className={cn(
          'transition-colors',
          isFav 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-red-500',
          className
        )}
        title={isFav ? t('scales.unfavorite', '取消收藏') : t('scales.favorite', '收藏')}
      >
        <Heart 
          className={cn(
            getIconSize(),
            isFav ? 'fill-current' : '',
            (loading || storeLoading) ? 'animate-pulse' : ''
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isFav ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={loading || storeLoading}
      className={cn(
        getSizeClasses(),
        'transition-all',
        isFav 
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
          : 'hover:bg-red-50 hover:border-red-300 hover:text-red-600',
        className
      )}
    >
      <Heart 
        className={cn(
          getIconSize(),
          'mr-2',
          isFav ? 'fill-current' : '',
          (loading || storeLoading) ? 'animate-pulse' : ''
        )} 
      />
      {(loading || storeLoading) ? (
        t('common.loading', '处理中...')
      ) : (
        <>
          {isFav ? t('scales.favorited', '已收藏') : t('scales.favorite', '收藏')}
          {showCount && favoritesCount > 0 && (
            <span className="ml-1 text-xs opacity-75">
              ({favoritesCount})
            </span>
          )}
        </>
      )}
    </Button>
  );
}