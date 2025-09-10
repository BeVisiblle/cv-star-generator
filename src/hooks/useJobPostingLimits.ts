import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from './useCompany';

export const useJobPostingLimits = () => {
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get company subscription and limits
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['company-subscription', company?.id],
    queryFn: async () => {
      if (!company?.id) return null;
      
      const { data, error } = await supabase
        .from('company_subscriptions')
        .select(`
          *,
          plans (
            max_job_posts,
            tokens_per_post
          )
        `)
        .eq('company_id', company.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  // Get current job posts count
  const { data: jobPostsData, isLoading: jobPostsLoading } = useQuery({
    queryKey: ['company-job-posts-summary', company?.id],
    queryFn: async () => {
      if (!company?.id) return { count: 0, posts: [] };
      
      const { data, error } = await supabase
        .from('job_posts')
        .select('id, title, created_at, is_public, is_active')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { count: data?.length || 0, posts: data || [] };
    },
    enabled: !!company?.id,
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
        description_md: jobData.description,
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

      if (error) {
        console.error('Save draft error:', error);
        console.error('Data being inserted:', basicJobData);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Entwurf gespeichert",
        description: "Ihre Stellenanzeige wurde als Entwurf gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: ['company-job-posts', company?.id] });
      queryClient.invalidateQueries({ queryKey: ['company-job-posts-summary', company?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Speichern fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    },
  });

  // Update existing job - including status fields
  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, jobData }: { jobId: string; jobData: any }) => {
      // Include basic fields plus status fields
      const basicJobData = {
        title: jobData.title,
        job_type: jobData.job_type,
        team_department: jobData.team_department,
        role_family: jobData.role_family,
        description_md: jobData.description,
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
        visa_sponsorship: jobData.visa_sponsorship || false,
        relocation_support: jobData.relocation_support || false,
        travel_percentage: jobData.travel_percentage || 0,
        updated_at: new Date().toISOString(),
        // Include status fields if provided
        ...(jobData.is_active !== undefined && { is_active: jobData.is_active }),
        ...(jobData.is_public !== undefined && { is_public: jobData.is_public }),
        ...(jobData.is_draft !== undefined && { is_draft: jobData.is_draft }),
      };

      const { data, error } = await supabase
        .from('job_posts')
        .update(basicJobData)
        .eq('id', jobId)
        .eq('company_id', company?.id)
        .select()
        .single();

      if (error) {
        console.error('Update job error:', error);
        console.error('Data being updated:', basicJobData);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Stellenanzeige aktualisiert",
        description: "Ihre Stellenanzeige wurde erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ['company-job-posts', company?.id] });
      queryClient.invalidateQueries({ queryKey: ['company-job-posts-summary', company?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Aktualisierung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    },
  });

  // Publish job using RPC function
  const publishJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('publish_job_with_tokens', {
        body: { job_id: jobId }
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
      queryClient.invalidateQueries({ queryKey: ['company-job-posts-summary', company?.id] });
      queryClient.invalidateQueries({ queryKey: ['company-subscription', company?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Veröffentlichung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    },
  });

  // Calculate limits and usage
  const maxJobPosts = subscriptionData?.plans?.max_job_posts ?? 3;
  const currentJobPosts = jobPostsData?.count || 0;
  const remainingJobPosts = Math.max(0, maxJobPosts - currentJobPosts);
  const canCreateJob = remainingJobPosts > 0;

  const tokensPerPost = subscriptionData?.plans?.tokens_per_post || 0;
  const tokenBalance = subscriptionData?.token_balance || 0;
  const canPublishJob = tokenBalance >= tokensPerPost;

  return {
    // Data
    subscriptionData,
    jobPostsData,
    
    // Loading states
    subscriptionLoading,
    jobPostsLoading,
    
    // Mutations
    saveDraftMutation,
    updateJobMutation,
    publishJobMutation,
    
    // Limits and usage
    maxJobPosts,
    currentJobPosts,
    remainingJobPosts,
    canCreateJob,
    tokensPerPost,
    tokenBalance,
    canPublishJob,
    
    // Helper functions
    saveDraft: saveDraftMutation.mutateAsync,
    updateJob: updateJobMutation.mutateAsync,
    publishJob: publishJobMutation.mutateAsync,
  };
};