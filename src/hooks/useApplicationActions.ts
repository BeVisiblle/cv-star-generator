import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUnlockApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "unlocked",
          unlocked_at: new Date().toISOString()
        })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed"] });
      toast.success("Bewerbung wurde freigeschaltet");
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Freischalten: ${error.message}`);
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, note }: { applicationId: string; note?: string }) => {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "interview_scheduled",
          // Note: interview_note field doesn't exist in current schema
          // but status change will be visible to candidate
        })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed"] });
      toast.success("Kandidat wurde zu einem Gespräch eingeladen");
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Einladen: ${error.message}`);
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason?: string }) => {
      const updates: any = { 
        status: "rejected"
      };

      if (reason) {
        updates.reason_short = reason;
      }

      const { error } = await supabase
        .from("applications")
        .update(updates)
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed"] });
      toast.success("Bewerbung wurde abgelehnt");
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Ablehnen: ${error.message}`);
    },
  });
}

export function useAcceptApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "accepted"
        })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications-detailed"] });
      toast.success("Bewerbung wurde akzeptiert");
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Akzeptieren: ${error.message}`);
    },
  });
}
