import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface ReactionCounts {
  like: number;
  love: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface MostPopularReaction {
  type: ReactionType;
  count: number;
}

export function useReactions({ 
  postId, 
  initialReactions = [], 
  initialCounts = {} 
}: { 
  postId: string; 
  initialReactions?: any[]; 
  initialCounts?: Partial<ReactionCounts>; 
}) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    ...initialCounts,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReactions();
  }, [postId, user?.id]);

  const loadReactions = async () => {
    if (!postId) return;
    
    try {
      // Load reaction counts
      const { data: reactionData, error: reactionError } = await supabase
        .from('reactions')
        .select('kind, count(*)')
        .eq('post_id', postId)
        .group('kind');

      if (reactionError) throw reactionError;

      // Load user's reaction
      let userReactionType: ReactionType | null = null;
      if (user) {
        const { data: userReactionData } = await supabase
          .from('reactions')
          .select('kind')
          .eq('post_id', postId)
          .eq('profile_id', user.id)
          .single();
        
        userReactionType = userReactionData?.kind as ReactionType || null;
      }

      // Update counts
      const newCounts: ReactionCounts = {
        like: 0,
        love: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      };

      reactionData?.forEach((reaction: any) => {
        const kind = reaction.kind as ReactionType;
        if (kind in newCounts) {
          newCounts[kind] = parseInt(reaction.count) || 0;
        }
      });

      setCounts(newCounts);
      setUserReaction(userReactionType);

    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const toggleReaction = async (reactionType: ReactionType) => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const isCurrentlyReacted = userReaction === reactionType;
      
      if (isCurrentlyReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('profile_id', user.id)
          .eq('kind', reactionType);
        
        if (error) throw error;
        
        setUserReaction(null);
        setCounts(prev => ({
          ...prev,
          [reactionType]: Math.max(0, prev[reactionType] - 1),
        }));
      } else {
        // Remove any existing reaction first
        if (userReaction) {
          await supabase
            .from('reactions')
            .delete()
            .eq('post_id', postId)
            .eq('profile_id', user.id)
            .eq('kind', userReaction);
        }
        
        // Add new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            profile_id: user.id,
            kind: reactionType,
          });
        
        if (error) throw error;
        
        setUserReaction(reactionType);
        setCounts(prev => ({
          ...prev,
          [reactionType]: prev[reactionType] + 1,
          ...(userReaction && userReaction !== reactionType ? { [userReaction]: Math.max(0, prev[userReaction] - 1) } : {}),
        }));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      // Reload reactions on error
      await loadReactions();
    } finally {
      setIsLoading(false);
    }
  };

  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const mostPopular: MostPopularReaction = Object.entries(counts).reduce(
    (max, [type, count]) => {
      if (count > max.count) {
        return { type: type as ReactionType, count };
      }
      return max;
    },
    { type: 'like', count: 0 }
  );

  return {
    counts,
    userReaction,
    totalCount,
    mostPopular,
    toggleReaction,
    isLoading,
  };
}