import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ReactionType } from './useReactions';

interface CommentReactionData {
  id: string;
  reaction_type: ReactionType;
  user_id: string;
  created_at: string;
}

interface UseCommentReactionsProps {
  commentId: string;
  initialReactions?: CommentReactionData[];
  initialCounts?: Record<ReactionType, number>;
}

export function useCommentReactions({ 
  commentId, 
  initialReactions = [], 
  initialCounts = {} 
}: UseCommentReactionsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [optimisticReactions, setOptimisticReactions] = useState<CommentReactionData[]>(initialReactions);
  const [optimisticCounts, setOptimisticCounts] = useState<Record<ReactionType, number>>({
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    ...initialCounts
  });

  // Get current user's reaction for this comment
  const getUserReaction = useCallback(() => {
    if (!user) return null;
    return optimisticReactions.find(r => r.user_id === user.id)?.reaction_type || null;
  }, [optimisticReactions, user]);

  // Add or update reaction
  const addReactionMutation = useMutation({
    mutationFn: async (reactionType: ReactionType) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('comment_reactions')
        .upsert({
          comment_id: commentId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) throw error;
      return reactionType;
    },
    onMutate: async (reactionType: ReactionType) => {
      if (!user) return;

      // Optimistic update
      const previousReactions = optimisticReactions;
      const previousCounts = optimisticCounts;

      // Remove existing reaction if any
      const filteredReactions = optimisticReactions.filter(r => r.user_id !== user.id);
      
      // Add new reaction
      const newReaction: CommentReactionData = {
        id: `temp-${Date.now()}`,
        reaction_type: reactionType,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      const newReactions = [...filteredReactions, newReaction];
      setOptimisticReactions(newReactions);

      // Update counts
      const newCounts = { ...optimisticCounts };
      
      // Decrease count for previous reaction
      const previousReaction = optimisticReactions.find(r => r.user_id === user.id);
      if (previousReaction) {
        newCounts[previousReaction.reaction_type] = Math.max(0, newCounts[previousReaction.reaction_type] - 1);
      }
      
      // Increase count for new reaction
      newCounts[reactionType] = (newCounts[reactionType] || 0) + 1;
      setOptimisticCounts(newCounts);

      return { previousReactions, previousCounts };
    },
    onError: (error, reactionType, context) => {
      // Rollback optimistic update
      if (context) {
        setOptimisticReactions(context.previousReactions);
        setOptimisticCounts(context.previousCounts);
      }
      
      console.error('Error adding comment reaction:', error);
      toast.error('Fehler beim Hinzufügen der Reaktion');
    },
    onSuccess: () => {
      // Invalidate and refetch comment reactions
      queryClient.invalidateQueries({ queryKey: ['comment-reactions', commentId] });
    }
  });

  // Remove reaction
  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async () => {
      if (!user) return;

      // Optimistic update
      const previousReactions = optimisticReactions;
      const previousCounts = optimisticCounts;

      const currentReaction = optimisticReactions.find(r => r.user_id === user.id);
      if (!currentReaction) return;

      // Remove reaction
      const newReactions = optimisticReactions.filter(r => r.user_id !== user.id);
      setOptimisticReactions(newReactions);

      // Update counts
      const newCounts = { ...optimisticCounts };
      newCounts[currentReaction.reaction_type] = Math.max(0, newCounts[currentReaction.reaction_type] - 1);
      setOptimisticCounts(newCounts);

      return { previousReactions, previousCounts };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context) {
        setOptimisticReactions(context.previousReactions);
        setOptimisticCounts(context.previousCounts);
      }
      
      console.error('Error removing comment reaction:', error);
      toast.error('Fehler beim Entfernen der Reaktion');
    },
    onSuccess: () => {
      // Invalidate and refetch comment reactions
      queryClient.invalidateQueries({ queryKey: ['comment-reactions', commentId] });
    }
  });

  // Toggle reaction (add if not exists, remove if exists)
  const toggleReaction = useCallback((reactionType: ReactionType) => {
    const currentReaction = getUserReaction();
    
    if (currentReaction === reactionType) {
      // Remove reaction
      removeReactionMutation.mutate();
    } else {
      // Add/change reaction
      addReactionMutation.mutate(reactionType);
    }
  }, [getUserReaction, addReactionMutation, removeReactionMutation]);

  // Get total reaction count
  const getTotalReactionCount = useCallback(() => {
    return Object.values(optimisticCounts).reduce((sum, count) => sum + count, 0);
  }, [optimisticCounts]);

  return {
    reactions: optimisticReactions,
    counts: optimisticCounts,
    userReaction: getUserReaction(),
    totalCount: getTotalReactionCount(),
    toggleReaction,
    addReaction: addReactionMutation.mutate,
    removeReaction: removeReactionMutation.mutate,
    isLoading: addReactionMutation.isPending || removeReactionMutation.isPending
  };
}

