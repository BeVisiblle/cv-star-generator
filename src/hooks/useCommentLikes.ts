import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useCommentLikes(commentId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get comment likes
  const { data: likesData, isLoading } = useQuery({
    queryKey: ['comment-likes', commentId],
    queryFn: async () => {
      const { data: likes, error: likesError } = await supabase
        .from('community_likes')
        .select('id, liker_user_id')
        .eq('post_id', commentId);

      if (likesError) throw likesError;

      const count = likes?.length || 0;
      const liked = likes?.some(like => like.liker_user_id === user?.id) || false;

      return { count, liked };
    },
    enabled: !!commentId,
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const isCurrentlyLiked = likesData?.liked || false;

      if (isCurrentlyLiked) {
        // Unlike
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', commentId)
          .eq('liker_user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('community_likes')
          .insert({
            post_id: commentId,
            liker_user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['comment-likes', commentId] });
    },
    onError: (error) => {
      console.error('Error toggling comment like:', error);
      toast.error('Fehler beim Liken des Kommentars');
    },
  });

  return {
    count: likesData?.count || 0,
    liked: likesData?.liked || false,
    isLoading,
    toggleLike: toggleLikeMutation.mutate,
    isToggling: toggleLikeMutation.isPending,
  };
}
