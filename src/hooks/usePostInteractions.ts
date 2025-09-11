import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface PostComment {
  id: string;
  post_id: string;
  user_id?: string;
  author_user_id?: string;
  content?: string;
  body_md?: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at?: string;
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
      
      // Get like count from community_posts
      const { data: post, error: postError } = await supabase
        .from("community_posts")
        .select("like_count")
        .eq("id", postId)
        .single();
      
      if (postError) throw postError;

      let liked = false;
      if (user?.id) {
        const { data: myLike, error: likeError } = await supabase
          .from("community_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("liker_user_id", user.id)
          .maybeSingle();
        
        if (likeError && (likeError as any).code !== "PGRST116") throw likeError;
        liked = Boolean(myLike);
      }
      
      return { count: post?.like_count ?? 0, liked };
    },
  });

  // Real-time subscription for likes
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`likes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_likes',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Invalidate likes query when likes change
          queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_posts',
          filter: `id=eq.${postId}`,
        },
        () => {
          // Invalidate when post like_count updates
          queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

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
      
      const { data, error } = await supabase.rpc('toggle_community_like', {
        p_post_id: postId,
        p_liker_user_id: user.id
      });
      
      if (error) throw error;
      return { changed: true, result: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
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
        ...c,
        content: c.body_md || c.content,
        user_id: c.author_user_id || c.user_id,
        author: profilesMap[c.author_user_id || c.user_id] ?? null,
      })) as PostComment[];
    },
  });

  // Real-time subscription for comments
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Invalidate comments query when comments change
          queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_posts',
          filter: `id=eq.${postId}`,
        },
        () => {
          // Invalidate when post comment_count updates
          queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

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
      
      const { data, error } = await supabase.rpc('add_community_comment', {
        p_post_id: postId,
        p_body_md: payload.content,
        p_author_user_id: user.id,
        p_parent_comment_id: payload.parentId ?? null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
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

// Reposts ("Teilen") helper hook
export const usePostReposts = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const sb: any = supabase;

  const { data, isLoading } = useQuery<{ count: number; hasReposted: boolean}>({
    queryKey: ["post-reposts", postId, user?.id ?? "anon"],
    queryFn: async (): Promise<{ count: number; hasReposted: boolean }> => {
      console.debug("[reposts] fetch", { postId });
      const { count, error } = await sb
        .from("post_reposts")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      if (error) throw error;

      let hasReposted = false;
      if (user?.id) {
        const { data: mine, error: mineErr } = await sb
          .from("post_reposts")
          .select("id")
          .eq("post_id", postId)
          .eq("reposter_id", user.id)
          .maybeSingle();
        if (mineErr && (mineErr as any).code !== "PGRST116") throw mineErr;
        hasReposted = Boolean(mine);
      }
      return { count: count ?? 0, hasReposted };
    },
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
      if (data?.hasReposted) {
        toast({ title: "Bereits geteilt", description: "Du hast diesen Beitrag schon geteilt." });
        return { changed: false };
      }
      
      // Use RPC function for community shares
      const { data: shareData, error } = await sb.rpc('share_community_post', {
        p_post_id: postId,
        p_sharer_user_id: user.id
      });
      
      if (error) throw error;
      return { changed: true, result: shareData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-reposts", postId] });
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
