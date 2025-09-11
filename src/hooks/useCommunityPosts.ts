import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CommunityPost {
  id: string;
  post_kind: 'text' | 'media' | 'job_share' | 'poll';
  actor_user_id?: string;
  actor_company_id?: string;
  visibility: 'public' | 'followers' | 'connections' | 'org_only';
  body_md?: string;
  media?: any[];
  job_id?: string;
  applies_enabled?: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  // Enriched data
  author?: any;
  company?: any;
  job?: any;
  liked?: boolean;
}

export interface CreatePostData {
  post_kind?: 'text' | 'media' | 'job_share' | 'poll';
  actor_user_id?: string;
  actor_company_id?: string;
  visibility?: 'public' | 'followers' | 'connections' | 'org_only';
  body_md?: string;
  media?: any[];
  job_id?: string;
  mentions?: any[];
}

// Hook to get community feed
export function useCommunityFeed() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['community-feed', user?.id],
    enabled: !!user?.id,
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase.rpc('get_community_feed', {
        p_user_id: user!.id,
        p_limit: 20,
        p_offset: pageParam * 20
      });

      if (error) throw error;

      // Enrich posts with additional data
      const enrichedPosts = await Promise.all(
        (data || []).map(async (post: any) => {
          const enriched = { ...post };

          // Get author info
          if (post.actor_user_id) {
            const { data: profile } = await supabase
              .from('profiles_public')
              .select('*')
              .eq('id', post.actor_user_id)
              .single();
            enriched.author = profile;
          }

          // Get company info
          if (post.actor_company_id) {
            const { data: company } = await supabase
              .from('companies')
              .select('id, name, logo_url, industry')
              .eq('id', post.actor_company_id)
              .single();
            enriched.company = company;
          }

          // Get job info for job shares
          if (post.job_id) {
            const { data: job } = await supabase
              .from('job_posts')
              .select('id, title, city, employment_type, salary_min, salary_max')
              .eq('id', post.job_id)
              .single();
            enriched.job = job;
          }

          // Check if user liked the post
          if (user?.id) {
            const { data: like } = await supabase
              .from('community_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('liker_user_id', user.id)
              .maybeSingle();
            enriched.liked = !!like;
          }

          return enriched;
        })
      );

      return {
        posts: enrichedPosts,
        nextPageParam: enrichedPosts.length === 20 ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    initialPageParam: 0
  });
}

// Hook to create a community post
export function useCreateCommunityPost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const { data: postId, error } = await supabase.rpc('create_community_post', {
        p_post_kind: data.post_kind || 'text',
        p_actor_user_id: data.actor_user_id || user?.id,
        p_actor_company_id: data.actor_company_id,
        p_visibility: data.visibility || 'public',
        p_body_md: data.body_md,
        p_media: data.media || [],
        p_job_id: data.job_id,
        p_mentions: data.mentions || []
      });

      if (error) throw error;
      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      toast({ title: 'Beitrag veröffentlicht', description: 'Dein Beitrag wurde erfolgreich erstellt.' });
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
export function useToggleCommunityLike() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, companyId }: { postId: string; companyId?: string }) => {
      const { data, error } = await supabase.rpc('toggle_community_like', {
        p_post_id: postId,
        p_liker_user_id: companyId ? null : user?.id,
        p_liker_company_id: companyId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['community-feed'], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: CommunityPost) =>
              post.id === variables.postId
                ? { 
                    ...post, 
                    liked: (data as any).liked, 
                    like_count: (data as any).count 
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

// Hook to add comment to a post
export function useAddCommunityComment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      body, 
      companyId, 
      parentCommentId 
    }: { 
      postId: string; 
      body: string; 
      companyId?: string;
      parentCommentId?: string;
    }) => {
      const { data, error } = await supabase.rpc('add_community_comment', {
        p_post_id: postId,
        p_body_md: body,
        p_author_user_id: companyId ? null : user?.id,
        p_author_company_id: companyId,
        p_parent_comment_id: parentCommentId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-comments'] });
      toast({ title: 'Kommentar hinzugefügt', description: 'Dein Kommentar wurde veröffentlicht.' });
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

// Hook to share a job as a community post
export function useShareJobAsPost() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      jobId, 
      visibility, 
      customMessage 
    }: { 
      companyId: string; 
      jobId: string; 
      visibility?: 'public' | 'followers' | 'connections' | 'org_only';
      customMessage?: string;
    }) => {
      const { data, error } = await supabase.rpc('share_job_as_post', {
        p_company_id: companyId,
        p_job_id: jobId,
        p_visibility: visibility || 'public',
        p_custom_message: customMessage
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      toast({ 
        title: 'Job-Post geteilt', 
        description: 'Deine Stellenanzeige wurde erfolgreich in der Community geteilt.' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler beim Teilen',
        description: error.message || 'Job konnte nicht geteilt werden.',
        variant: 'destructive'
      });
    }
  });
}

// Hook to get community preferences
export function useCommunityPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['community-preferences', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_community_preferences', {
        p_user_id: user!.id
      });

      if (error) throw error;
      return data;
    }
  });
}

// Hook to update community preferences
export function useUpdateCommunityPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: {
      show_job_shares?: boolean;
      show_company_posts?: boolean;
      show_user_posts?: boolean;
      origin_filter?: string;
      radius_km?: number;
      muted_company_ids?: string[];
      muted_user_ids?: string[];
    }) => {
      const { data, error } = await supabase.rpc('set_community_preferences', {
        p_user_id: user!.id,
        ...preferences
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      toast({ title: 'Einstellungen gespeichert', description: 'Deine Feed-Einstellungen wurden aktualisiert.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  });
}