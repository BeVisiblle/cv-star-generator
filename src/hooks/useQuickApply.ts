import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export function useQuickApply(jobId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: hasApplied, isLoading } = useQuery({
    queryKey: ["application-status", jobId, user?.id],
    enabled: !!user?.id && !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user!.id)
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
  });

  const { data: profileStatus, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile-status", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("candidate_profiles")
        .select("id, profession_id, seniority, availability_date, location_geog")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      
      const missing: string[] = [];
      
      if (!profile) {
        missing.push("Profil muss erstellt werden");
      } else {
        if (!profile.profession_id) missing.push("Beruf");
        if (!profile.seniority) missing.push("Erfahrungsstufe");
        if (!profile.availability_date) missing.push("Verfügbarkeitsdatum");
        if (!profile.location_geog) missing.push("Standort");
      }
      
      return {
        hasProfile: !!profile,
        profileId: profile?.id || null,
        missingFields: missing
      };
    },
  });

  const applyToJob = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Nicht eingeloggt");

      // Get job details
      const { data: job, error: jobError } = await supabase
        .from("job_posts")
        .select("company_id")
        .eq("id", jobId)
        .single();

      if (jobError) throw jobError;

      // Get candidate profile
      const { data: profile, error: profileError } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profil nicht vollständig");

      // Create application
      const { error: appError } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          job_id: jobId,
          company_id: job.company_id,
          candidate_id: profile.id,
          status: "pending",
          source: "portal",
          viewed_by_company: false,
        });

      if (appError) throw appError;

      // Create company_candidates entry if not exists
      const { error: candidateError } = await supabase
        .from("company_candidates")
        .insert({
          company_id: job.company_id,
          candidate_id: profile.id,
          stage: "new",
          source: "application",
        })
        .select()
        .single();

      // Ignore duplicate errors
      if (candidateError && !candidateError.message.includes("duplicate")) {
        throw candidateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-status", jobId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["my-applications", user?.id] });
      toast.success("Bewerbung erfolgreich versendet!");
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Bewerben");
    },
  });

  return {
    hasApplied: hasApplied ?? false,
    isLoading: isLoading || isLoadingProfile,
    applyToJob: applyToJob.mutate,
    isApplying: applyToJob.isPending,
    canApply: profileStatus?.hasProfile ?? false,
    profileStatus,
  };
}
