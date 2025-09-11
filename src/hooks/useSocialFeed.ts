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
      // Get community posts with actor information
      const { data: postsData, error: postsError } = await sb
        .from('community_posts')
        .select(`
          *,
          actor_user:profiles!actor_user_id(id, vorname, nachname, headline, avatar_url),
          actor_company:companies!actor_company_id(id, name, logo_url)
        `) 
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!postsData?.length) {
        return [];
      }

      // Get like counts from community_likes
      const postIds = postsData.map((p: any) => p.id);
      const { data: likeCounts } = await sb
        .from('community_likes')
        .select('post_id')
        .in('post_id', postIds);

      // Get comment counts from community_comments
      const { data: commentCounts } = await sb
        .from('community_comments')
        .select('post_id')
        .in('post_id', postIds);

      // Create counts maps
      const likeCountMap = (likeCounts || []).reduce((acc: any, like: any) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      }, {});

      const commentCountMap = (commentCounts || []).reduce((acc: any, comment: any) => {
        acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
        return acc;
      }, {});

      let likedPostIds = new Set();
      if (user) {
        // Get user's likes for these posts from community_likes
        const { data: likesData } = await sb
          .from('community_likes')
          .select('post_id')
          .eq('liker_user_id', user.id)
          .in('post_id', postIds);

        likedPostIds = new Set((likesData || []).map((l: any) => l.post_id));
      }

      return postsData.map((post: any) => ({
        ...post,
        author_id: post.actor_user_id || post.actor_company_id,
        body: post.body_md || '',
        attachments: post.media || [],
        like_count: post.like_count || likeCountMap[post.id] || 0,
        comment_count: post.comment_count || commentCountMap[post.id] || 0,
        author: post.actor_user || (post.actor_company ? {
          id: post.actor_company.id,
          vorname: post.actor_company.name,
          nachname: '',
          headline: 'Unternehmen',
          avatar_url: post.actor_company.logo_url
        } : null),
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
        .from('community_posts')
        .insert({
          actor_user_id: user.id,
          body_md: body,
          post_kind: 'text',
          visibility: 'public',
          media: attachments || []
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
        .from('community_likes')
        .select('*')
        .eq('liker_user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (existingLike) {
        const { error } = await sb
          .from('community_likes')
          .delete()
          .eq('liker_user_id', user.id)
          .eq('post_id', postId);
        if (error) throw error;
        return { action: 'unliked' } as const;
      } else {
        const { error } = await sb
          .from('community_likes')
          .insert({ liker_user_id: user.id, post_id: postId });
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
        .from('community_comments')
        .select(`
          *,
          author_user:profiles!author_user_id(id, vorname, nachname, headline, avatar_url),
          author_company:companies!author_company_id(id, name, logo_url)
        `) 
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!commentsData?.length) {
        return [];
      }

      return commentsData.map((comment: any) => ({
        ...comment,
        body: comment.body_md || '',
        author_id: comment.author_user_id || comment.author_company_id,
        attachments: [],
        author: comment.author_user || (comment.author_company ? {
          id: comment.author_company.id,
          vorname: comment.author_company.name,
          nachname: '',
          headline: 'Unternehmen',
          avatar_url: comment.author_company.logo_url
        } : null),
        you_like: false,
        like_count: 0,
        reply_count: 0
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
        .from('community_comments')
        .insert({
          post_id: postId,
          parent_comment_id: parentId || null,
          author_user_id: user.id,
          body_md: body
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