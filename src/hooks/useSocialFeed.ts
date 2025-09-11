import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Post {
  id: string;
  author_id: string;
  body: string;
  attachments: any; // JSON from DB
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
  parent_id?: string | null;
  author_id: string;
  body: string;
  attachments: any; // JSON from DB
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

const sb: any = supabase; // bypass strict generated types until types refresh

export function useSocialPosts() {
  const { user } = useAuth();
  
  return useQuery<Post[]>({
    queryKey: ['social-posts'],
    queryFn: async () => {
      const { data: postsData, error: postsError } = await sb
        .from('posts')
        .select(`*, author:profiles!author_id(id, vorname, nachname, headline, avatar_url)`) 
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!user || !postsData?.length) return postsData || [];

      const postIds = postsData.map((p: any) => p.id);
      const { data: likesData } = await sb
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set((likesData || []).map((l: any) => l.post_id));

      return postsData.map((post: any) => ({
        ...post,
        you_like: likedPostIds.has(post.id)
      }));
    },
    enabled: !!user
  });
}

export function useCreateSocialPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ body, attachments }: { body: string; attachments: any }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await sb
        .from('posts')
        .insert({
          author_id: user.id,
          body,
          attachments
        })
        .select()
        .single();

      if (error) throw error;
      return data as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Beitrag erfolgreich veröffentlicht!');
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast.error('Fehler beim Veröffentlichen des Beitrags');
    }
  });
}

export function useToggleSocialPostLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await sb
        .from('post_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (existingLike) {
        const { error } = await sb
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        if (error) throw error;
        return { action: 'unliked' } as const;
      } else {
        const { error } = await sb
          .from('post_likes')
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
        return { action: 'liked' } as const;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast.error('Fehler beim Liken des Beitrags');
    }
  });
}

export function useSocialPostComments(postId: string) {
  const { user } = useAuth();

  return useQuery<PostComment[]>({
    queryKey: ['social-comments', postId],
    queryFn: async () => {
      const { data: commentsData, error } = await sb
        .from('comments')
        .select(`*, author:profiles!author_id(id, vorname, nachname, headline, avatar_url)`) 
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!user || !commentsData?.length) return commentsData || [];

      const commentIds = commentsData.map((c: any) => c.id);
      const { data: likesData } = await sb
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      const likedCommentIds = new Set((likesData || []).map((l: any) => l.comment_id));

      return commentsData.map((comment: any) => ({
        ...comment,
        you_like: likedCommentIds.has(comment.id)
      }));
    },
    enabled: !!postId
  });
}

export function useAddSocialComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, body, parentId }: { postId: string; body: string; parentId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await sb
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
      return data as PostComment;
    },
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Fehler beim Kommentieren');
    }
  });
}

export function useSocialProof(postId: string) {
  const { user } = useAuth();

  return useQuery<{ actor_id: string; action: string; actor?: { id: string; vorname?: string; nachname?: string; avatar_url?: string } } | null>({
    queryKey: ['social-proof', postId],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await sb
        .from('v_post_social_proof')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const { data: actor } = await sb
        .from('profiles')
        .select('id, vorname, nachname, avatar_url')
        .eq('id', data.actor_id)
        .maybeSingle();

      return { ...data, actor: actor || undefined };
    },
    enabled: !!postId && !!user
  });
}