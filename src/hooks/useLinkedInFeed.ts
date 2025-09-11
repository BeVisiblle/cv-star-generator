import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LinkedInPost {
  id: string;
  author_id: string;
  body: string;
  attachments: any;
  visibility: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    vorname?: string | null;
    nachname?: string | null;
    headline?: string | null;
    avatar_url?: string | null;
  } | null;
  you_like?: boolean;
}

export interface LinkedInComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  body: string;
  attachments: any;
  like_count: number;
  reply_count: number;
  created_at: string;
  author?: {
    id: string;
    vorname?: string | null;
    nachname?: string | null;
    headline?: string | null;
    avatar_url?: string | null;
  } | null;
  you_like?: boolean;
}

// Hook to fetch LinkedIn feed
export function useLinkedInFeed() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['linkedin-feed', user?.id],
    enabled: !!user?.id,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 10;
      
      let query = supabase
        .from('linkedin_posts')
        .select(`
          *,
          author:profiles(id, vorname, nachname, headline, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(from, from + 9);

      const { data: posts, error } = await query;
      if (error) throw error;

      // Check which posts the user has liked
      const postIds = (posts || []).map(p => p.id);
      if (postIds.length && user?.id) {
        const { data: likes } = await supabase
          .from('linkedin_post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        const likedSet = new Set((likes || []).map(l => l.post_id));
        
        return {
          posts: (posts || []).map(post => ({
            ...post,
            you_like: likedSet.has(post.id)
          })),
          nextPage: posts && posts.length === 10 ? pageParam + 1 : undefined
        };
      }

      return {
        posts: posts || [],
        nextPage: posts && posts.length === 10 ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0
  });
}

// Hook to create a LinkedIn post
export function useCreateLinkedInPost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { body: string; attachments?: any[]; visibility?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: post, error } = await supabase
        .from('linkedin_posts')
        .insert({
          author_id: user.id,
          body: data.body,
          attachments: data.attachments || [],
          visibility: data.visibility || 'public'
        })
        .select(`
          *,
          author:profiles(id, vorname, nachname, headline, avatar_url)
        `)
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-feed'] });
      toast({ 
        title: 'Beitrag erstellt', 
        description: 'Ihr Beitrag wurde erfolgreich veröffentlicht.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler beim Erstellen',
        description: error.message || 'Beitrag konnte nicht erstellt werden.',
        variant: 'destructive'
      });
    }
  });
}

// Hook to toggle like on a post
export function useToggleLinkedInLike() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('toggle_linkedin_like', {
        p_post_id: postId,
        p_liker_user_id: user.id
      });

      if (error) throw error;
      return data as { liked: boolean; count: number };
    },
    onSuccess: (data, postId) => {
      // Update the feed data optimistically
      queryClient.setQueryData(['linkedin-feed'], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: LinkedInPost) =>
              post.id === postId
                ? { 
                    ...post, 
                    you_like: data.liked, 
                    like_count: data.count 
                  }
                : post
            )
          }))
        };
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Aktion konnte nicht ausgeführt werden.',
        variant: 'destructive'
      });
    }
  });
}

// Hook to get comments for a post
export function useLinkedInComments(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['linkedin-comments', postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('linkedin_comments')
        .select(`
          *,
          author:profiles(id, vorname, nachname, headline, avatar_url)
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which comments the user has liked
      const commentIds = (comments || []).map(c => c.id);
      if (commentIds.length && user?.id) {
        const { data: likes } = await supabase
          .from('linkedin_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);
        
        const likedSet = new Set((likes || []).map(l => l.comment_id));
        
        return (comments || []).map(comment => ({
          ...comment,
          you_like: likedSet.has(comment.id)
        }));
      }

      return comments || [];
    }
  });
}

// Hook to add comment to a post
export function useAddLinkedInComment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      body, 
      parentId 
    }: { 
      postId: string; 
      body: string;
      parentId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('add_linkedin_comment', {
        p_post_id: postId,
        p_body_md: body,
        p_author_user_id: user.id,
        p_parent_comment_id: parentId || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['linkedin-feed'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Kommentar konnte nicht hinzugefügt werden.',
        variant: 'destructive'
      });
    }
  });
}

// Hook to get user's activity (posts and comments)
export function useUserLinkedInActivity(userId: string) {
  return useQuery({
    queryKey: ['user-linkedin-activity', userId],
    enabled: !!userId,
    queryFn: async () => {
      // Get user's posts
      const { data: posts, error: postsError } = await supabase
        .from('linkedin_posts')
        .select(`
          *,
          author:profiles(id, vorname, nachname, headline, avatar_url)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      // Get user's comments
      const { data: comments, error: commentsError } = await supabase
        .from('linkedin_comments')
        .select(`
          *,
          author:profiles(id, vorname, nachname, headline, avatar_url),
          post:linkedin_posts(id, body, author:profiles(id, vorname, nachname))
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commentsError) throw commentsError;

      // Combine and sort by date
      const activities = [
        ...(posts || []).map(post => ({ ...post, type: 'post' as const })),
        ...(comments || []).map(comment => ({ ...comment, type: 'comment' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return activities;
    }
  });
}