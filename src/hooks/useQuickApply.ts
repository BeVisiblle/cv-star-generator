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
    queryKey: ["profile-status", jobId, user?.id],
    enabled: !!user?.id && !!jobId,
    queryFn: async () => {
      // Profil prüfen (profiles Tabelle, nicht candidate_profiles!)
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      
      const missing: string[] = [];
      
      if (!profile) {
        missing.push("Profil muss erstellt werden");
        return {
          hasProfile: false,
          profileId: null,
          missingFields: missing,
          missingDocuments: []
        };
      }

      // Job-Details laden um erforderliche Dokumente zu prüfen
      const { data: job, error: jobError } = await supabase
        .from("job_posts")
        .select("required_documents")
        .eq("id", jobId)
        .single();

      if (jobError) throw jobError;

      const missingDocuments: string[] = [];

      // Nur prüfen wenn Dokumente erforderlich sind
      if (job?.required_documents && Array.isArray(job.required_documents) && job.required_documents.length > 0) {
        // Benutzer-Dokumente laden
        const { data: userDocs, error: docsError } = await supabase
          .from("user_documents")
          .select("document_type")
          .eq("user_id", user!.id);

        if (docsError) throw docsError;

        const uploadedDocTypes = userDocs?.map(d => d.document_type) || [];

        // Prüfe welche erforderlichen Dokumente fehlen
        for (const reqDoc of job.required_documents) {
          const docType = typeof reqDoc === 'string' ? reqDoc : (reqDoc as any).type;
          const docLabel = typeof reqDoc === 'string' ? reqDoc : ((reqDoc as any).label || (reqDoc as any).type);
          
          if (!uploadedDocTypes.includes(docType)) {
            missingDocuments.push(docLabel);
          }
        }

        if (missingDocuments.length > 0) {
          missing.push("Erforderliche Dokumente fehlen");
        }
      }
      
      return {
        hasProfile: true,
        profileId: profile.id,
        missingFields: missing,
        missingDocuments
      };
    },
  });

  const applyToJob = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Nicht eingeloggt");

      // Prüfe ob erforderliche Dokumente fehlen
      if (profileStatus?.missingDocuments && profileStatus.missingDocuments.length > 0) {
        const docList = profileStatus.missingDocuments.join(", ");
        throw new Error(`Bitte lade folgende Dokumente hoch: ${docList}`);
      }

      // Get job details
      const { data: job, error: jobError } = await supabase
        .from("job_posts")
        .select("company_id")
        .eq("id", jobId)
        .single();

      if (jobError) throw jobError;

      // Get or create candidate entry for this company
      const { data: existingCandidate } = await supabase
        .from("candidates")
        .select("id")
        .eq("user_id", user.id)
        .eq("company_id", job.company_id)
        .maybeSingle();

      let candidateId: string;

      if (existingCandidate) {
        candidateId = existingCandidate.id;
      } else {
        // Get profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("vorname, nachname, email, cv_url, ort")
          .eq("id", user.id)
          .single();

        // Create candidate entry
        const { data: newCandidate, error: candidateError } = await supabase
          .from("candidates")
          .insert({
            company_id: job.company_id,
            user_id: user.id,
            vorname: profile?.vorname,
            nachname: profile?.nachname,
            full_name: `${profile?.vorname || ''} ${profile?.nachname || ''}`.trim(),
            email: profile?.email || user.email,
            cv_url: profile?.cv_url,
            city: profile?.ort,
          })
          .select("id")
          .single();

        if (candidateError) throw candidateError;
        candidateId = newCandidate.id;
      }

      // Create application
      const { error: appError } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          job_id: jobId,
          job_post_id: jobId,
          company_id: job.company_id,
          candidate_id: candidateId,
          status: "pending",
          stage: "new",
          source: "portal",
          viewed_by_company: false,
        });

      if (appError) throw appError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-status", jobId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["my-applications", user?.id] });
      toast.success("Bewerbung erfolgreich versendet!");
    },
    onError: (error: Error) => {
      if (error.message.includes("Bitte lade folgende Dokumente hoch")) {
        toast.error(error.message);
      } else {
        toast.error("Fehler beim Bewerben");
      }
    },
  });

  return {
    hasApplied: hasApplied ?? false,
    isLoading: isLoading || isLoadingProfile,
    applyToJob: applyToJob.mutate,
    isApplying: applyToJob.isPending,
    canApply: (profileStatus?.hasProfile && (!profileStatus?.missingDocuments || profileStatus.missingDocuments.length === 0)) ?? false,
    profileStatus,
  };
}
