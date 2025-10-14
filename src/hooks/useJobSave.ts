import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export function useJobSave(jobId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isSaved, isLoading } = useQuery({
    queryKey: ["job-save", jobId, user?.id],
    enabled: !!user?.id && !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_saves")
        .select("id")
        .eq("user_id", user!.id)
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Nicht eingeloggt");

      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from("job_saves")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", jobId);

        if (error) throw error;
      } else {
        // Save
        const { error } = await supabase
          .from("job_saves")
          .insert({
            user_id: user.id,
            job_id: jobId,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-save", jobId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["saved-jobs", user?.id] });
      toast.success(isSaved ? "Aus gespeicherten entfernt" : "Job gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    },
  });

  return {
    isSaved: isSaved ?? false,
    isLoading,
    toggleSave: toggleSave.mutate,
    isToggling: toggleSave.isPending,
  };
}
