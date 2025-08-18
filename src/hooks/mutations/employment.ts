import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/** ---------------------------
 * Update Profile (headline + freier Arbeitgeber + Slogan)
 * --------------------------*/
type UpdateProfilePayload = {
  userId: string;
  headline?: string | null;
  employer_free?: string | null;
  employer_slogan?: string | null;
};

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfilePayload) => {
      const { userId, ...fields } = input;
      const { error } = await supabase
        .from("profiles")
        .update({
          ...fields,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return fields;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["profiles_public", vars.userId] });
      const prev = qc.getQueryData<any>(["profiles_public", vars.userId]);
      // optimistic patch on public view cache (it mirrors headline/free fields)
      qc.setQueryData(["profiles_public", vars.userId], (old: any) => old ? {
        ...old,
        headline: vars.headline ?? old.headline,
        employer_free: vars.employer_free ?? old.employer_free,
        employer_slogan: vars.employer_slogan ?? old.employer_slogan,
      } : old);
      return { prev };
    },
    onError: (_e, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["profiles_public", vars.userId], ctx.prev);
      toast.error("Fehler beim Speichern der Profildaten");
    },
    onSuccess: () => {
      toast.success("Profil erfolgreich aktualisiert");
    },
    onSettled: (_data, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["profiles_public", vars.userId] });
      qc.invalidateQueries({ queryKey: ["profile_settings", vars.userId] });
    },
  });
}

/** ---------------------------
 * Start Employment Request (status=pending)
 * --------------------------*/
type StartRequestPayload = {
  userId: string;
  companyId: string;
};

export function useStartEmploymentRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, companyId }: StartRequestPayload) => {
      const { error } = await supabase
        .from("company_employment_requests")
        .insert({
          user_id: userId,
          company_id: companyId,
          status: "pending",
          created_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: (_d, { userId }) => {
      toast.success("Beschäftigungsantrag erfolgreich gesendet");
      qc.invalidateQueries({ queryKey: ["profiles_public", userId] });
      qc.invalidateQueries({ queryKey: ["profile_settings", userId] });
      qc.invalidateQueries({ queryKey: ["employment_requests", userId] });
    },
    onError: () => {
      toast.error("Fehler beim Senden des Antrags");
    },
  });
}

/** ---------------------------
 * Withdraw Employment Request (delete pending)
 * --------------------------*/
type WithdrawRequestPayload = {
  userId: string;
  companyId: string;
};

export function useWithdrawEmploymentRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, companyId }: WithdrawRequestPayload) => {
      const { error } = await supabase
        .from("company_employment_requests")
        .delete()
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .eq("status", "pending");
      if (error) throw error;
    },
    onSuccess: (_d, { userId }) => {
      toast.success("Antrag erfolgreich zurückgezogen");
      qc.invalidateQueries({ queryKey: ["profiles_public", userId] });
      qc.invalidateQueries({ queryKey: ["profile_settings", userId] });
      qc.invalidateQueries({ queryKey: ["employment_requests", userId] });
    },
    onError: () => {
      toast.error("Fehler beim Zurückziehen des Antrags");
    },
  });
}

/** ---------------------------
 * Accept Employment Request
 * --------------------------*/
type AcceptRequestPayload = {
  requestId: string;
  adminUserId: string;
};

export function useAcceptEmploymentRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, adminUserId }: AcceptRequestPayload) => {
      const { error } = await supabase
        .from("company_employment_requests")
        .update({
          status: "accepted",
          confirmed_by: adminUserId,
        })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Beschäftigungsantrag erfolgreich angenommen");
      qc.invalidateQueries({ queryKey: ["employment_requests"] });
      qc.invalidateQueries({ queryKey: ["profiles_public"] });
    },
    onError: () => {
      toast.error("Fehler beim Annehmen des Antrags");
    },
  });
}

/** ---------------------------
 * Decline Employment Request
 * --------------------------*/
type DeclineRequestPayload = {
  requestId: string;
  adminUserId: string;
};

export function useDeclineEmploymentRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, adminUserId }: DeclineRequestPayload) => {
      const { error } = await supabase
        .from("company_employment_requests")
        .update({
          status: "declined",
          confirmed_by: adminUserId,
        })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Beschäftigungsantrag abgelehnt");
      qc.invalidateQueries({ queryKey: ["employment_requests"] });
      qc.invalidateQueries({ queryKey: ["profiles_public"] });
    },
    onError: () => {
      toast.error("Fehler beim Ablehnen des Antrags");
    },
  });
}