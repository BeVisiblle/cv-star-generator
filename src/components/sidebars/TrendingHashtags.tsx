'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, TrendingUp, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendingHashtag {
  tag: string;
  post_count: number;
  reaction_count: number;
  comment_count: number;
  time_weight: number;
  trending_score: number;
}

interface TrendingHashtagsProps {
  className?: string;
  limit?: number;
}

export function TrendingHashtags({ className, limit = 10 }: TrendingHashtagsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrendingHashtags();
  }, [limit]);

  const loadTrendingHashtags = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data since hashtags table doesn't exist yet
      const mockHashtags = [
        { tag: 'ausbildung', usage_count: 156, trend_score: 95 },
        { tag: 'berufsausbildung', usage_count: 89, trend_score: 78 },
        { tag: 'azubi', usage_count: 67, trend_score: 65 },
        { tag: 'handwerk', usage_count: 45, trend_score: 52 },
        { tag: 'it', usage_count: 38, trend_score: 48 },
        { tag: 'kaufmann', usage_count: 32, trend_score: 41 },
        { tag: 'elektroniker', usage_count: 28, trend_score: 35 },
        { tag: 'mechatroniker', usage_count: 24, trend_score: 29 }
      ];
      
      setHashtags(mockHashtags.slice(0, limit));
    } catch (err: any) {
      console.error('Error loading trending hashtags:', err);
      setError(err.message || 'Fehler beim Laden der Hashtags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHashtagClick = (tag: string) => {
    navigate(`/search?q=%23${tag}&type=hashtags`);
  };

  const handleViewAll = () => {
    navigate('/trending/hashtags');
  };

  const getTrendingLevel = (score: number) => {
    if (score > 100) return { label: '🔥 Sehr beliebt', color: 'text-red-500' };
    if (score > 50) return { label: '📈 Im Trend', color: 'text-orange-500' };
    if (score > 20) return { label: '⬆️ Steigend', color: 'text-yellow-500' };
    return { label: '📊 Aktiv', color: 'text-green-500' };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('right_rail.trending_hashtags')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('right_rail.trending_hashtags')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">Fehler beim Laden</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTrendingHashtags}
              className="mt-2"
            >
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hashtags.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('right_rail.trending_hashtags')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine Hashtags im Trend</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('right_rail.trending_hashtags')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="h-6 px-2 text-xs"
          >
            Alle
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hashtags.map((hashtag, index) => {
          const trending = getTrendingLevel(hashtag.trending_score);
          
          return (
            <div
              key={hashtag.tag}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleHashtagClick(hashtag.tag)}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
              </div>

              {/* Hashtag */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-sm truncate">
                    {hashtag.tag}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {hashtag.post_count} Posts
                  </Badge>
                  <span className={cn('text-xs', trending.color)}>
                    {trending.label}
                  </span>
                </div>
              </div>

              {/* Engagement */}
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-muted-foreground">
                  {hashtag.reaction_count + hashtag.comment_count}
                </div>
                <div className="text-xs text-muted-foreground">
                  Interaktionen
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
