import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';

export function useJobPostingLimits() {
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job posting limits and token balance
  const { data: limits, isLoading, error } = useQuery({
    queryKey: ['job-posting-limits', company?.id],
    queryFn: async () => {
      if (!company?.id) return null;

      const { data, error } = await supabase.rpc('check_job_posting_limits', {
        p_company_id: company.id
      });

      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  // Publish job with token consumption
  const publishJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      if (!company?.id) throw new Error('No company selected');

      const { data, error } = await supabase.rpc('publish_job_with_tokens', {
        p_company_id: company.id,
        p_job_data: jobData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Stellenanzeige veröffentlicht",
        description: "Ihre Stellenanzeige wurde erfolgreich veröffentlicht.",
      });
      queryClient.invalidateQueries({ queryKey: ['company-job-posts', company?.id] });
      queryClient.invalidateQueries({ queryKey: ['job-posting-limits', company?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Veröffentlichung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    },
  });

  // Save job as draft
  const saveDraftMutation = useMutation({
    mutationFn: async (jobData: any) => {
      // Map fields to database schema
      const { 
        description, 
        skills, 
        languages, 
        certifications, 
        driving_licenses,
        internship,
        apprenticeship,
        professional,
        company_description,
        application_deadline,
        application_url,
        application_email,
        application_instructions,
        is_featured,
        featured_until,
        is_urgent,
        tags,
        external_id,
        source,
        ...cleanJobData 
      } = jobData;
      
      // Map description to description_md if it exists
      if (description) {
        cleanJobData.description_md = description;
      }
      
      // Map complex fields to JSONB
      if (skills) cleanJobData.skills = skills;
      if (languages) cleanJobData.languages = languages;
      if (certifications) cleanJobData.certifications = certifications;
      // Temporarily skip driving_licenses until migration is applied
      // if (driving_licenses) cleanJobData.driving_licenses = driving_licenses;
      if (internship) cleanJobData.internship_data = internship;
      if (apprenticeship) cleanJobData.apprenticeship_data = apprenticeship;
      if (professional) cleanJobData.professional_data = professional;
      
      // Map additional fields
      if (company_description) cleanJobData.company_description = company_description;
      if (application_deadline) cleanJobData.application_deadline = application_deadline;
      if (application_url) cleanJobData.application_url = application_url;
      if (application_email) cleanJobData.application_email = application_email;
      if (application_instructions) cleanJobData.application_instructions = application_instructions;
      if (is_featured !== undefined) cleanJobData.is_featured = is_featured;
      if (featured_until) cleanJobData.featured_until = featured_until;
      if (is_urgent !== undefined) cleanJobData.is_urgent = is_urgent;
      if (tags) cleanJobData.tags = tags;
      if (external_id) cleanJobData.external_id = external_id;
      if (source) cleanJobData.source = source;
      
      const { data, error } = await supabase
        .from('job_posts')
        .insert({
          ...cleanJobData,
          company_id: company?.id,
          is_active: false,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Entwurf gespeichert",
        description: "Ihre Stellenanzeige wurde als Entwurf gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: ['company-job-posts', company?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Speichern fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    },
  });

  // Update existing job
  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, jobData }: { jobId: string; jobData: any }) => {
      // Map fields to database schema
      const { 
        description, 
        skills, 
        languages, 
        certifications, 
        driving_licenses,
        internship,
        apprenticeship,
        professional,
        company_description,
        application_deadline,
        application_url,
        application_email,
        application_instructions,
        is_featured,
        featured_until,
        is_urgent,
        tags,
        external_id,
        source,
        ...cleanJobData 
      } = jobData;
      
      // Map description to description_md if it exists
      if (description) {
        cleanJobData.description_md = description;
      }
      
      // Map complex fields to JSONB
      if (skills) cleanJobData.skills = skills;
      if (languages) cleanJobData.languages = languages;
      if (certifications) cleanJobData.certifications = certifications;
      // Temporarily skip driving_licenses until migration is applied
      // if (driving_licenses) cleanJobData.driving_licenses = driving_licenses;
      if (internship) cleanJobData.internship_data = internship;
      if (apprenticeship) cleanJobData.apprenticeship_data = apprenticeship;
      if (professional) cleanJobData.professional_data = professional;
      
      // Map additional fields
      if (company_description) cleanJobData.company_description = company_description;
      if (application_deadline) cleanJobData.application_deadline = application_deadline;
      if (application_url) cleanJobData.application_url = application_url;
      if (application_email) cleanJobData.application_email = application_email;
      if (application_instructions) cleanJobData.application_instructions = application_instructions;
      if (is_featured !== undefined) cleanJobData.is_featured = is_featured;
      if (featured_until) cleanJobData.featured_until = featured_until;
      if (is_urgent !== undefined) cleanJobData.is_urgent = is_urgent;
      if (tags) cleanJobData.tags = tags;
      if (external_id) cleanJobData.external_id = external_id;
      if (source) cleanJobData.source = source;
      
      const { data, error } = await supabase
        .from('job_posts')
        .update(cleanJobData)
        .eq('id', jobId)
        .eq('company_id', company?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Stellenanzeige aktualisiert",
        description: "Ihre Stellenanzeige wurde erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ['company-job-posts', company?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Aktualisierung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    },
  });

  return {
    limits,
    isLoading,
    error,
    canPost: limits?.can_post || false,
    remainingTokens: limits?.remaining_tokens || 0,
    remainingJobPosts: limits?.remaining_job_posts || 0,
    tokensPerPost: limits?.tokens_per_post || 1,
    publishJob: publishJobMutation.mutateAsync,
    isPublishing: publishJobMutation.isPending,
    saveDraft: saveDraftMutation.mutateAsync,
    isSavingDraft: saveDraftMutation.isPending,
    updateJob: updateJobMutation.mutateAsync,
    isUpdating: updateJobMutation.isPending,
  };
}