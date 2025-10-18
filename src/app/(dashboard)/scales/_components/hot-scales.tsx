'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Clock,
  BookOpen,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import type { HotScale } from './types';

export default function HotScales() {
  const [hotScales, setHotScales] = useState<HotScale[]>([]);
  const [loadingHotScales, setLoadingHotScales] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();
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

  return loadingHotScales ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" >
      {
        Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded mb-1" />
              <div className="h-2 bg-muted rounded" />
            </CardContent>
          </Card>
        ))
      }
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hotScales.map((scale) => (
        <Card key={scale.id} className="hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => router.push(`/scales/${scale.id}`)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">{scale.name}</h4>
              <Badge variant="outline">{scale.acronym}</Badge>
            </div>

            <Badge variant="outline" className="text-xs text-muted-foreground mb-2">{scale.categoryName}</Badge>
            <div className="text-xs text-muted-foreground mb-3 space-y-1">
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3" />
                <span>{scale.itemsCount} {t("scales.items", "items")}</span>
              </div>
              {scale.administrationTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{scale.administrationTime} {t("scales.minutes", "分钟")}</span>
                </div>
              )}
            </div>

            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
              <Link href={`/scales/copyright/create?scaleId=${scale.id}`}>
                <Button size="sm" variant="outline" className="px-2">
                  <Shield className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}