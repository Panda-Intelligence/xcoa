'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/state/session';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  scaleId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'button' | 'icon';
  className?: string;
}

export function FavoriteButton({ 
  scaleId, 
  initialFavorited = false,
  size = 'md',
  showCount = false,
  variant = 'button',
  className 
}: FavoriteButtonProps) {
  const { t } = useLanguage();
  const { session } = useSessionStore();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 检查收藏状态
  useEffect(() => {
    if (session?.user) {
      checkFavoriteStatus();
    }
  }, [scaleId, session?.user]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/scales/${scaleId}/favorite`);
      const data = await response.json();
      
      if (response.ok) {
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user) {
      // 未登录，引导登录
      alert('请先登录后再收藏量表');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/scales/${scaleId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsFavorited(data.action === 'added');
        
        // 更新收藏数量
        if (showCount) {
          setFavoriteCount(prev => 
            data.action === 'added' ? prev + 1 : Math.max(0, prev - 1)
          );
        }
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      alert('网络错误，请稍后重试');
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
        onClick={toggleFavorite}
        disabled={loading}
        className={cn(
          'transition-colors',
          isFavorited 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-red-500',
          className
        )}
        title={isFavorited ? t('scales.unfavorite', '取消收藏') : t('scales.favorite', '收藏')}
      >
        <Heart 
          className={cn(
            getIconSize(),
            isFavorited ? 'fill-current' : '',
            loading ? 'animate-pulse' : ''
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size={size}
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(
        getSizeClasses(),
        'transition-all',
        isFavorited 
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
          : 'hover:bg-red-50 hover:border-red-300 hover:text-red-600',
        className
      )}
    >
      <Heart 
        className={cn(
          getIconSize(),
          'mr-2',
          isFavorited ? 'fill-current' : '',
          loading ? 'animate-pulse' : ''
        )} 
      />
      {loading ? (
        t('common.loading', '处理中...')
      ) : (
        <>
          {isFavorited ? t('scales.favorited', '已收藏') : t('scales.favorite', '收藏')}
          {showCount && favoriteCount > 0 && (
            <span className="ml-1 text-xs opacity-75">
              ({favoriteCount})
            </span>
          )}
        </>
      )}
    </Button>
  );
}