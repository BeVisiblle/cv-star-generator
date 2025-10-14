import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export type SavedJob = {
  id: string;
  job_id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    city?: string;
    employment_type?: string;
    is_active: boolean;
    company: {
      id: string;
      name: string;
      logo_url?: string;
    };
  };
};

export function useSavedJobs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-jobs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_saves" as any)
        .select(`
          id,
          job_id,
          created_at,
          job:job_posts!job_id (
            id,
            title,
            city,
            employment_type,
            is_active,
            company:companies!company_id (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as SavedJob[];
    },
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from("job_saves" as any)
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", user!.id);

        if (error) throw error;
      } else {
        // Add to saved
        const { error } = await supabase
          .from("job_saves" as any)
          .insert({ job_id: jobId, user_id: user!.id });

        if (error) throw error;
      }
    },
    onSuccess: (_, { isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      toast.success(isSaved ? "Job entfernt" : "Job gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    },
  });
}
