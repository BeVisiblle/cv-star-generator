import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Stage } from "@/components/Company/SelectionBar";

export function useBulkStageUpdate(companyId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ profileIds, stage }: { profileIds: string[]; stage: Stage }) => {
      const { data, error } = await supabase.rpc("bulk_stage_update" as any, {
        p_company_id: companyId,
        p_profile_ids: profileIds,
        p_stage: stage
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, { profileIds, stage }) => {
      queryClient.invalidateQueries({ queryKey: ["unlockedCandidates"] });
      queryClient.invalidateQueries({ queryKey: ["companyPipeline"] });
      toast.success(`${profileIds.length} Kandidaten auf "${stage}" gesetzt`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Fehler beim Aktualisieren der Stages");
    }
  });
}

export function useExportCandidates(companyId: string) {
  const mutation = useMutation({
    mutationFn: async ({ format, profileIds }: { format: "csv" | "xlsx"; profileIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke("export-candidates", {
        body: { company_id: companyId, profile_ids: profileIds, format }
      });
      if (error) throw error;
      return data.url as string;
    },
    onError: (error: any) => {
      toast.error(error.message || "Fehler beim Exportieren");
    }
  });

  return {
    isPending: mutation.isPending,
    export: async (format: "csv" | "xlsx", profileIds: string[]) => {
      const url = await mutation.mutateAsync({ format, profileIds });
      toast.success("Export erfolgreich erstellt");
      return url;
    }
  };
}