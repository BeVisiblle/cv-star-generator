
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
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

  const { data, isLoading } = useQuery({
    queryKey: ["post-likes", postId, user?.id ?? "anon"],
    queryFn: async () => {
      console.debug("[likes] fetch", { postId });
      const { count, error } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      if (error) throw error;

      let liked = false;
      if (user?.id) {
        const { data: mine, error: mineErr } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (mineErr && mineErr.code !== "PGRST116") throw mineErr;
        liked = Boolean(mine);
      }
      return { count: count ?? 0, liked };
    },
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
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: user.id,
        });
        if (error) throw error;
      }
      return { changed: true };
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

  const commentsQuery = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async (): Promise<PostComment[]> => {
      console.debug("[comments] fetch", { postId });
      const { data: comments, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const items = comments ?? [];
      const userIds = Array.from(new Set(items.map((c: any) => c.user_id).filter(Boolean)));
      let profilesMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url")
          .in("id", userIds);
        if (profErr) throw profErr;
        profilesMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));
      }

      return items.map((c: any) => ({
        ...c,
        author: profilesMap[c.user_id] ?? null,
      }));
    },
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
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        content: payload.content,
        parent_comment_id: payload.parentId ?? null,
      });
      if (error) throw error;
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
