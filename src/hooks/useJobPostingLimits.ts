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

  // Save job as draft - using only basic fields that definitely exist
  const saveDraftMutation = useMutation({
    mutationFn: async (jobData: any) => {
      // Only use basic fields that are guaranteed to exist in the database
      const basicJobData = {
        title: jobData.title,
        job_type: jobData.job_type,
        team_department: jobData.team_department,
        role_family: jobData.role_family,
        description: jobData.description,
        work_mode: jobData.work_mode,
        city: jobData.city,
        address_street: jobData.address_street,
        address_number: jobData.address_number,
        postal_code: jobData.postal_code,
        state: jobData.state,
        country: jobData.country,
        public_transport: jobData.public_transport || false,
        parking_available: jobData.parking_available || false,
        barrier_free_access: jobData.barrier_free_access || false,
        commute_distance_km: jobData.commute_distance_km || 25,
        employment_type: jobData.employment_type,
        start_immediately: jobData.start_immediately !== undefined ? jobData.start_immediately : true,
        start_date: jobData.start_date,
        end_date: jobData.end_date,
        hours_per_week_min: jobData.hours_per_week_min,
        hours_per_week_max: jobData.hours_per_week_max,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_currency: jobData.salary_currency || 'EUR',
        salary_interval: jobData.salary_interval || 'month',
        tasks_description: jobData.tasks_description,
        requirements_description: jobData.requirements_description,
        benefits_description: jobData.benefits_description,
        contact_person_name: jobData.contact_person_name,
        contact_person_role: jobData.contact_person_role,
        contact_person_email: jobData.contact_person_email,
        contact_person_phone: jobData.contact_person_phone,
        company_description: jobData.company_description,
        application_deadline: jobData.application_deadline,
        application_url: jobData.application_url,
        application_email: jobData.application_email,
        application_instructions: jobData.application_instructions,
        tags: jobData.tags || [],
        is_featured: jobData.is_featured || false,
        is_urgent: jobData.is_urgent || false,
        featured_until: jobData.featured_until,
        visa_sponsorship: jobData.visa_sponsorship || false,
        relocation_support: jobData.relocation_support || false,
        travel_percentage: jobData.travel_percentage || 0,
        company_id: company?.id,
        is_active: false,
        is_public: false,
        is_draft: true,
      };

      const { data, error } = await supabase
        .from('job_posts')
        .insert(basicJobData)
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

  // Update existing job - using only basic fields
  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, jobData }: { jobId: string; jobData: any }) => {
      // Only use basic fields that are guaranteed to exist
      const basicJobData = {
        title: jobData.title,
        job_type: jobData.job_type,
        team_department: jobData.team_department,
        role_family: jobData.role_family,
        description: jobData.description,
        work_mode: jobData.work_mode,
        city: jobData.city,
        address_street: jobData.address_street,
        address_number: jobData.address_number,
        postal_code: jobData.postal_code,
        state: jobData.state,
        country: jobData.country,
        public_transport: jobData.public_transport || false,
        parking_available: jobData.parking_available || false,
        barrier_free_access: jobData.barrier_free_access || false,
        commute_distance_km: jobData.commute_distance_km || 25,
        employment_type: jobData.employment_type,
        start_immediately: jobData.start_immediately !== undefined ? jobData.start_immediately : true,
        start_date: jobData.start_date,
        end_date: jobData.end_date,
        hours_per_week_min: jobData.hours_per_week_min,
        hours_per_week_max: jobData.hours_per_week_max,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_currency: jobData.salary_currency || 'EUR',
        salary_interval: jobData.salary_interval || 'month',
        tasks_description: jobData.tasks_description,
        requirements_description: jobData.requirements_description,
        benefits_description: jobData.benefits_description,
        contact_person_name: jobData.contact_person_name,
        contact_person_role: jobData.contact_person_role,
        contact_person_email: jobData.contact_person_email,
        contact_person_phone: jobData.contact_person_phone,
        company_description: jobData.company_description,
        application_deadline: jobData.application_deadline,
        application_url: jobData.application_url,
        application_email: jobData.application_email,
        application_instructions: jobData.application_instructions,
        tags: jobData.tags || [],
        is_featured: jobData.is_featured || false,
        is_urgent: jobData.is_urgent || false,
        featured_until: jobData.featured_until,
        visa_sponsorship: jobData.visa_sponsorship || false,
        relocation_support: jobData.relocation_support || false,
        travel_percentage: jobData.travel_percentage || 0,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('job_posts')
        .update(basicJobData)
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