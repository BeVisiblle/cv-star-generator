import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReactionType } from './useReactions';

interface ReactionUpdate {
  post_id: string;
  comment_id?: string;
  reaction_type: ReactionType;
  user_id: string;
  action: 'INSERT' | 'DELETE' | 'UPDATE';
}

export function useRealtimeReactions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to post reactions
    const postReactionsSubscription = supabase
      .channel('post-reactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_reactions'
        },
        (payload) => {
          console.log('Post reaction change:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          const postId = newRecord?.post_id || oldRecord?.post_id;
          
          if (!postId) return;

          // Invalidate post reactions query
          queryClient.invalidateQueries({ 
            queryKey: ['post-reactions', postId] 
          });
          
          // Update post likes count in cache
          queryClient.setQueryData(['post', postId], (oldData: any) => {
            if (!oldData) return oldData;
            
            let newLikesCount = oldData.likes_count || 0;
            
            if (eventType === 'INSERT') {
              if (newRecord?.reaction_type === 'like') {
                newLikesCount += 1;
              }
            } else if (eventType === 'DELETE') {
              if (oldRecord?.reaction_type === 'like') {
                newLikesCount = Math.max(0, newLikesCount - 1);
              }
            } else if (eventType === 'UPDATE') {
              // Handle reaction type change
              if (oldRecord?.reaction_type === 'like' && newRecord?.reaction_type !== 'like') {
                newLikesCount = Math.max(0, newLikesCount - 1);
              } else if (oldRecord?.reaction_type !== 'like' && newRecord?.reaction_type === 'like') {
                newLikesCount += 1;
              }
            }
            
            return {
              ...oldData,
              likes_count: newLikesCount
            };
          });
        }
      )
      .subscribe();

    // Subscribe to comment reactions
    const commentReactionsSubscription = supabase
      .channel('comment-reactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_reactions'
        },
        (payload) => {
          console.log('Comment reaction change:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          const commentId = newRecord?.comment_id || oldRecord?.comment_id;
          
          if (!commentId) return;

          // Invalidate comment reactions query
          queryClient.invalidateQueries({ 
            queryKey: ['comment-reactions', commentId] 
          });
        }
      )
      .subscribe();

    return () => {
      postReactionsSubscription.unsubscribe();
      commentReactionsSubscription.unsubscribe();
    };
  }, [queryClient]);
}

