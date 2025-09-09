'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowRight, UserPlus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendedGroup {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  members_count: number;
  recent_posts: number;
  recent_members: number;
  recommendation_score: number;
}

interface RecommendedGroupsProps {
  className?: string;
  limit?: number;
}

export function RecommendedGroups({ className, limit = 5 }: RecommendedGroupsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<RecommendedGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningGroups, setJoiningGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendedGroups();
  }, [limit]);

  const loadRecommendedGroups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await fetch('/api/recommendations/groups', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json());

      if (error) throw error;
      
      setGroups(data?.slice(0, limit) || []);
    } catch (err: any) {
      console.error('Error loading recommended groups:', err);
      setError(err.message || 'Fehler beim Laden der Gruppen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Bitte melde dich an, um einer Gruppe beizutreten');
      return;
    }

    setJoiningGroups(prev => new Set(prev).add(groupId));
    
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          profile_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      toast.success('Gruppe beigetreten!');
      
      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, members_count: group.members_count + 1, recent_members: group.recent_members + 1 }
          : group
      ));
      
    } catch (err: any) {
      console.error('Error joining group:', err);
      toast.error('Fehler beim Beitreten zur Gruppe');
    } finally {
      setJoiningGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleGroupClick = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  const handleViewAll = () => {
    router.push('/groups');
  };

  const getActivityLevel = (score: number) => {
    if (score > 50) return { label: '🔥 Sehr aktiv', color: 'text-red-500' };
    if (score > 25) return { label: '📈 Aktiv', color: 'text-orange-500' };
    if (score > 10) return { label: '⬆️ Wachsend', color: 'text-yellow-500' };
    return { label: '📊 Neu', color: 'text-green-500' };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('right_rail.recommended_groups')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
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
            <Users className="h-4 w-4" />
            {t('right_rail.recommended_groups')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">Fehler beim Laden</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRecommendedGroups}
              className="mt-2"
            >
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('right_rail.recommended_groups')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine Gruppen empfohlen</p>
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
            <Users className="h-4 w-4" />
            {t('right_rail.recommended_groups')}
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
        {groups.map((group) => {
          const activity = getActivityLevel(group.recommendation_score);
          const isJoining = joiningGroups.has(group.id);
          
          return (
            <div
              key={group.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10 cursor-pointer" onClick={() => handleGroupClick(group.id)}>
                  <AvatarImage src={group.cover_url} alt={group.name} />
                  <AvatarFallback>
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 
                    className="font-medium text-sm truncate cursor-pointer hover:underline"
                    onClick={() => handleGroupClick(group.id)}
                  >
                    {group.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {group.members_count} Mitglieder
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                  {group.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs', activity.color)}>
                    {activity.label}
                  </span>
                  {group.recent_posts > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {group.recent_posts} neue Posts
                    </span>
                  )}
                </div>
              </div>

              {/* Join Button */}
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={isJoining}
                  className="h-7 px-2 text-xs"
                >
                  {isJoining ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      {t('right_rail.join')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
