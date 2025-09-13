import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    vorname?: string | null;
    nachname?: string | null;
    avatar_url?: string | null;
  } | null;
}

export const usePostLikes = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ count: number; liked: boolean }>({
    queryKey: ["post-likes", postId, user?.id ?? "anon"],
    queryFn: async (): Promise<{ count: number; liked: boolean }> => {
      console.debug("[likes] fetch", { postId });
      
      // Get like count from the post itself
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();
      
      if (postError) throw postError;
      
      let liked = false;
      if (user?.id) {
        // Try new system first (post_likes), fallback to old system (likes)
        const { data: userLike, error: likeError } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (likeError && likeError.code === 'PGRST116') {
          // Table doesn't exist, try old system
          const { data: userLikeOld, error: likeErrorOld } = await supabase
            .from("likes")
            .select("id")
            .eq("likeable_id", postId)
            .eq("likeable_type", "post")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (likeErrorOld) throw likeErrorOld;
          liked = Boolean(userLikeOld);
        } else if (likeError) {
          throw likeError;
        } else {
          liked = Boolean(userLike);
        }
      }

      return {
        count: postData?.likes_count || 0,
        liked
      };
    },
    enabled: Boolean(postId)
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Melde dich an, um Beiträge zu liken.",
          variant: "destructive",
        });
        return { changed: false };
      }
      
      const liked = data?.liked ?? false;
      if (liked) {
        // Unlike - try new system first
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, try old system
          const { error: oldError } = await supabase
            .from("likes")
            .delete()
            .eq("likeable_id", postId)
            .eq("likeable_type", "post")
            .eq("user_id", user.id);
          
          if (oldError) throw oldError;
        } else if (error) {
          throw error;
        }
      } else {
        // Like - try new system first
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, try old system
          const { error: oldError } = await supabase
            .from("likes")
            .insert({
              likeable_id: postId,
              likeable_type: "post",
              user_id: user.id,
            });
          
          if (oldError) throw oldError;
        } else if (error) {
          throw error;
        }
      }
      return { changed: true };
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
    },
  });

  return {
    count: data?.count ?? 0,
    liked: data?.liked ?? false,
    isLoading,
    toggleLike: () => toggleLikeMutation.mutate(),
    isToggling: toggleLikeMutation.isPending,
  };
};

export const usePostComments = (postId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery<PostComment[]>({
    queryKey: ["post-comments", postId],
    queryFn: async (): Promise<PostComment[]> => {
      console.debug("[comments] fetch", { postId });
      
      // Try new system first (post_comments), fallback to old system (comments)
      let { data: comments, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, try old system
        const result = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: true });
        
        if (result.error) throw result.error;
        comments = result.data;
      } else if (error) {
        throw error;
      }

      const items = (comments ?? []) as any[];
      const userIds = Array.from(
        new Set(items.map((c: any) => c.user_id).filter(Boolean))
      );
      
      let profilesMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: profiles, error: profErr } = await supabase
          .from("profiles_public")
          .select("id, vorname, nachname, avatar_url")
          .in("id", userIds as any);
        if (profErr) throw profErr;
        profilesMap = Object.fromEntries(
          (profiles ?? []).map((p: any) => [p.id, p])
        );
      }

      return items.map((c: any) => ({
        ...c,
        author: profilesMap[c.user_id] ?? null,
      })) as PostComment[];
    },
    enabled: Boolean(postId)
  });

  const addCommentMutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string | null }) => {
      if (!user?.id) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Melde dich an, um zu kommentieren.",
          variant: "destructive",
        });
        return;
      }
      // Try new system first (post_comments), fallback to old system (comments)
      let { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: payload.content,
        });
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, try old system
        const result = await supabase
          .from("comments")
          .insert({
            post_id: postId,
            user_id: user.id,
            content: payload.content,
          });
        
        if (result.error) throw result.error;
      } else if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    commentsCount: commentsQuery.data?.length ?? 0,
    isLoading: commentsQuery.isLoading,
    addComment: (content: string, parentId?: string | null) =>
      addCommentMutation.mutate({ content, parentId }),
    isAdding: addCommentMutation.isPending,
  };
};

// Shares/Reposts helper hook  
export const usePostReposts = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ count: number; hasReposted: boolean}>({
    queryKey: ["post-shares", postId, user?.id ?? "anon"],
    queryFn: async (): Promise<{ count: number; hasReposted: boolean }> => {
      console.debug("[shares] fetch", { postId });
      
      // Get share count from the post itself
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("shares_count")
        .eq("id", postId)
        .single();
      
      if (postError) throw postError;

      let hasReposted = false;
      if (user?.id) {
        // Try new system first (shares), fallback to old system if needed
        const { data: userShare, error: shareError } = await supabase
          .from("shares")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (shareError && shareError.code === 'PGRST116') {
          // Table doesn't exist, assume no shares for now
          hasReposted = false;
        } else if (shareError) {
          throw shareError;
        } else {
          hasReposted = Boolean(userShare);
        }
      }
      
      return { 
        count: postData?.shares_count || 0, 
        hasReposted 
      };
    },
    enabled: Boolean(postId)
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Melde dich an, um Beiträge zu teilen.",
          variant: "destructive",
        });
        return { changed: false };
      }
      
      const hasReposted = data?.hasReposted ?? false;
      if (hasReposted) {
        // Unrepost
        const { error } = await supabase
          .from("shares")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, ignore
        } else if (error) {
          throw error;
        }
      } else {
        // Repost
        const { error } = await supabase
          .from("shares")
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, ignore
        } else if (error) {
          throw error;
        }
      }
      return { changed: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-shares", postId] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
    },
  });

  return {
    count: data?.count ?? 0,
    hasReposted: data?.hasReposted ?? false,
    isLoading,
    repost: () => repostMutation.mutate(),
    isReposting: repostMutation.isPending,
  };
};
