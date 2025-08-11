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
    // Derived fields for display
    status?: 'schueler' | 'azubi' | 'ausgelernt' | string;
    schule?: string | null;
    ausbildungsberuf?: string | null;
    ausbildungsbetrieb?: string | null;
    aktueller_beruf?: string | null;
    job_title?: string | null;
    company_id?: string | null;
  } | null;
}

export const usePostLikes = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Use an untyped Supabase reference for tables not present in generated types
  const sb: any = supabase;

  const { data, isLoading } = useQuery<{ count: number; liked: boolean }>({
    queryKey: ["post-likes", postId, user?.id ?? "anon"],
    queryFn: async (): Promise<{ count: number; liked: boolean }> => {
      console.debug("[likes] fetch", { postId });
      const { count, error } = await sb
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      if (error) throw error;

      let liked = false;
      if (user?.id) {
        const { data: mine, error: mineErr } = await sb
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        // PGRST116 = no rows found for .single(); with maybeSingle it's fine to ignore null result
        if (mineErr && (mineErr as any).code !== "PGRST116") throw mineErr;
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
        const { error } = await sb
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("post_likes").insert({
          post_id: postId,
          user_id: user.id,
        });
        if (error) throw error;
      }
      return { changed: true };
    },
    onSuccess: () => {
      // Invalidate all like queries for this post (for any user key)
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
  // Use an untyped Supabase reference for tables not present in generated types
  const sb: any = supabase;

  const commentsQuery = useQuery<PostComment[]>({
    queryKey: ["post-comments", postId],
    queryFn: async (): Promise<PostComment[]> => {
      console.debug("[comments] fetch", { postId });
      const { data: comments, error } = await sb
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const items = (comments ?? []) as any[];
      const userIds = Array.from(
        new Set(items.map((c: any) => c.user_id).filter(Boolean))
      );
      let profilesMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, vorname, nachname, avatar_url, schulbildung, berufserfahrung, ausbildungsberuf, schule, ausbildungsbetrieb, aktueller_beruf, company_id")
          .in("id", userIds as any);
        if (profErr) throw profErr;
        profilesMap = Object.fromEntries(
          (profiles ?? []).map((p: any) => [p.id, p])
        );
      }

      // Helpers to derive role/status from profile JSON
      const pickStr = (o: any, keys: string[]) => {
        for (const k of keys) {
          const v = o?.[k];
          if (typeof v === 'string' && v.trim()) return v as string;
        }
        return null;
      };

      const deriveFromProfile = (p: any) => {
        const edu = Array.isArray(p?.schulbildung) ? p.schulbildung : [];
        const exp = Array.isArray(p?.berufserfahrung) ? p.berufserfahrung : [];
        const ausbildung = exp.find((e: any) => String(e?.type || e?.art || '').toLowerCase().includes('ausbildung') && (!e?.end && !e?.bis)) || null;

        let status: 'schueler' | 'azubi' | 'ausgelernt' | string | undefined;
        if (ausbildung) status = 'azubi';
        else if (exp.length > 0) status = 'ausgelernt';
        else if (edu.length > 0) status = 'schueler';

        const firstEdu = edu[0] || {};
        const firstExp = ausbildung || exp[0] || {};

        const schule = pickStr(firstEdu, ['schule', 'school_name', 'name']) || p?.schule || null;
        const ausbildungsberuf = p?.ausbildungsberuf ?? pickStr(firstExp, ['beruf', 'ausbildungsberuf', 'job_title', 'position']);
        const ausbildungsbetrieb = p?.ausbildungsbetrieb ?? pickStr(firstExp, ['betrieb', 'company', 'company_name']);
        const aktueller_beruf = p?.aktueller_beruf ?? pickStr(firstExp, ['job_title', 'position', 'beruf']);
        const job_title = aktueller_beruf || ausbildungsberuf || null;
        const company_id = firstExp?.company_id ?? p?.company_id ?? null;

        return { status, schule, ausbildungsberuf: ausbildungsberuf ?? null, ausbildungsbetrieb: ausbildungsbetrieb ?? null, aktueller_beruf: aktueller_beruf ?? null, job_title, company_id };
      };

      return items.map((c: any) => {
        const base = profilesMap[c.user_id] ?? null;
        const derived = base ? deriveFromProfile(base) : {};
        return {
          ...c,
          author: base ? { ...base, ...derived } : null,
        } as PostComment;
      });
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
      const { error } = await sb.from("post_comments").insert({
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
      const { error } = await sb.from("post_reposts").insert({
        post_id: postId,
        reposter_id: user.id,
      });
      if (error) throw error;
      return { changed: true };
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
