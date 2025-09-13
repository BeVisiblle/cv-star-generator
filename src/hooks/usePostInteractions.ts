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
        .from("community_posts")
        .select("like_count")
        .eq("id", postId)
        .single();
      
      if (postError) throw postError;
      
      let liked = false;
      if (user?.id) {
        // Check if user has liked this post
        const { data: userLike, error: likeError } = await supabase
          .from("community_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("liker_user_id", user.id)
          .maybeSingle();
        
        if (likeError) throw likeError;
        liked = Boolean(userLike);
      }

      return {
        count: postData?.like_count || 0,
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
        // Unlike
        const { error } = await supabase
          .from("community_likes")
          .delete()
          .eq("post_id", postId)
          .eq("liker_user_id", user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("community_likes")
          .insert({
            post_id: postId,
            liker_user_id: user.id,
          });
        
        if (error) throw error;
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
      
      // Use community_comments table
      const { data: comments, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;

      const items = (comments ?? []) as any[];
      const userIds = Array.from(
        new Set(items.map((c: any) => c.author_user_id).filter(Boolean))
      );
      
      let profilesMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url")
          .in("id", userIds as any);
        if (profErr) throw profErr;
        profilesMap = Object.fromEntries(
          (profiles ?? []).map((p: any) => [p.id, p])
        );
      }

      return items.map((c: any) => ({
        id: c.id,
        post_id: c.post_id,
        user_id: c.author_user_id,
        content: c.body_md,
        created_at: c.created_at,
        updated_at: c.updated_at,
        author: profilesMap[c.author_user_id] ?? null,
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
      // Use community_comments table
      const { error } = await supabase
        .from("community_comments")
        .insert({
          post_id: postId,
          author_user_id: user.id,
          body_md: payload.content,
        });
      
      if (error) throw error;
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
        .from("community_posts")
        .select("share_count")
        .eq("id", postId)
        .single();
      
      if (postError) throw postError;

      let hasReposted = false;
      if (user?.id) {
        // Check if user has shared this post
        const { data: userShare, error: shareError } = await supabase
          .from("community_shares")
          .select("id")
          .eq("post_id", postId)
          .eq("sharer_user_id", user.id)
          .maybeSingle();
        
        if (shareError) throw shareError;
        hasReposted = Boolean(userShare);
      }
      
      return { 
        count: postData?.share_count || 0, 
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
          .from("community_shares")
          .delete()
          .eq("post_id", postId)
          .eq("sharer_user_id", user.id);
        
        if (error) throw error;
      } else {
        // Repost
        const { error } = await supabase
          .from("community_shares")
          .insert({
            post_id: postId,
            sharer_user_id: user.id,
          });
        
        if (error) throw error;
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
