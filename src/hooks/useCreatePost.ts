import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type PostVisibility = "public" | "followers" | "connections";

interface CreatePostPayload {
  content: string;
  visibility: PostVisibility;
  media?: any[];
  jobId?: string;
  companyId?: string;
}

export const useCreatePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      if (!user?.id && !payload.companyId) {
        throw new Error("User must be logged in or company ID provided");
      }

      // Write directly to community_posts to avoid missing RPC issues
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          body_md: payload.content,
          visibility: payload.visibility as any,
          media: payload.media || [],
          job_id: payload.jobId || null,
          actor_user_id: payload.companyId ? null : user?.id,
          actor_company_id: payload.companyId || null
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate feed queries to show new post immediately
      queryClient.invalidateQueries({ queryKey: ['home-feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({ queryKey: ['recent-community-posts'] });
      
      toast({
        title: "Post erstellt",
        description: "Ihr Beitrag wurde erfolgreich veröffentlicht.",
      });
    },
    onError: (error: any) => {
      console.error('Create post error:', error);
      toast({
        title: "Fehler beim Posten",
        description: "Der Beitrag konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  return {
    createPost: (payload: CreatePostPayload) => createPostMutation.mutate(payload),
    isCreating: createPostMutation.isPending,
  };
};