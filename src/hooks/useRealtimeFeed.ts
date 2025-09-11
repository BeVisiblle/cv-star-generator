import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useRealtimeFeed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    console.log('[realtime-feed] Setting up subscriptions');

    // Subscribe to community posts changes
    const postsChannel = supabase
      .channel('community-posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
        },
        (payload) => {
          console.log('[realtime-feed] Post changed:', payload);
          
          // Invalidate community feed queries
          queryClient.invalidateQueries({ queryKey: ['home-feed'] });
          queryClient.invalidateQueries({ queryKey: ['recent-community-posts'] });
          
          // If it's the current user's post, also invalidate their profile activity
          const newPost = payload.new as any;
          if (newPost?.actor_user_id === user.id) {
            queryClient.invalidateQueries({ 
              queryKey: ['recent-community-posts', user.id] 
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_likes',
        },
        (payload) => {
          console.log('[realtime-feed] Like changed:', payload);
          
          // Invalidate like queries for the specific post
          const newLike = payload.new as any;
          const oldLike = payload.old as any;
          if (newLike?.post_id || oldLike?.post_id) {
            const postId = newLike?.post_id || oldLike?.post_id;
            queryClient.invalidateQueries({ queryKey: ['post-likes', postId] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
        },
        (payload) => {
          console.log('[realtime-feed] Comment changed:', payload);
          
          // Invalidate comment queries for the specific post
          const newComment = payload.new as any;
          const oldComment = payload.old as any;
          if (newComment?.post_id || oldComment?.post_id) {
            const postId = newComment?.post_id || oldComment?.post_id;
            queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[realtime-feed] Cleaning up subscriptions');
      supabase.removeChannel(postsChannel);
    };
  }, [user?.id, queryClient]);
};

export default useRealtimeFeed;