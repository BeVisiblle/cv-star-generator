import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useConfirmContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("applications")
        .update({ 
          contacted_confirmed: true,
          contacted_confirmed_at: new Date().toISOString()
        })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Kontakt bestätigt");
    },
    onError: () => {
      toast.error("Fehler beim Bestätigen des Kontakts");
    },
  });
}
