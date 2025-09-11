import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Post {
  id: string;
  author_id: string;
  body: string;
  attachments: any[];
  like_count: number;
  comment_count: number;
  created_at: string;
  author?: {
    id: string;
    vorname?: string;
    nachname?: string;
    headline?: string;
    avatar_url?: string;
  };
  you_like?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  parent_id?: string;
  author_id: string;
  body: string;
  attachments: any[];
  like_count: number;
  reply_count: number;
  created_at: string;
  author?: {
    id: string;
    vorname?: string;
    nachname?: string;
    headline?: string;
    avatar_url?: string;
  };
  you_like?: boolean;
}

export function usePosts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!author_id(id, vorname, nachname, headline, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!user || !postsData) return postsData || [];

      // Get like status for current user
      const postIds = postsData.map(p => p.id);
      if (postIds.length === 0) return postsData;

      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(likesData?.map(l => l.post_id) || []);

      return postsData.map(post => ({
        ...post,
        you_like: likedPostIds.has(post.id)
      }));
    },
    enabled: !!user
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ body, attachments }: { body: string; attachments: any[] }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          body,
          attachments
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Beitrag erfolgreich veröffentlicht!');
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast.error('Fehler beim Veröffentlichen des Beitrags');
    }
  });
}

export function useTogglePostLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });
        
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast.error('Fehler beim Liken des Beitrags');
    }
  });
}

export function usePostComments(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!author_id(id, vorname, nachname, headline, avatar_url)
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!user || !commentsData) return commentsData || [];

      // Get like status for current user
      const commentIds = commentsData.map(c => c.id);
      if (commentIds.length === 0) return commentsData;

      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      const likedCommentIds = new Set(likesData?.map(l => l.comment_id) || []);

      return commentsData.map(comment => ({
        ...comment,
        you_like: likedCommentIds.has(comment.id)
      }));
    },
    enabled: !!postId
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, body, parentId }: { postId: string; body: string; parentId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          parent_id: parentId || null,
          author_id: user.id,
          body,
          attachments: []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Fehler beim Kommentieren');
    }
  });
}

export function useSocialProof(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['social-proof', postId],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('v_post_social_proof')
        .select(`
          *,
          actor:profiles!actor_id(id, vorname, nachname, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!postId && !!user
  });
}