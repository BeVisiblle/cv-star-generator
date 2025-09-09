import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';
import { useToast } from './use-toast';

export interface JobPostingLimits {
  can_post: boolean;
  remaining_tokens: number;
  remaining_job_posts: number;
  tokens_per_post: number;
  message: string;
}

export function useJobPostingLimits() {
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check current limits
  const { data: limits, isLoading, error } = useQuery({
    queryKey: ['job-posting-limits', company?.id],
    queryFn: async (): Promise<JobPostingLimits | null> => {
      if (!company?.id) return null;

      const { data, error } = await supabase.rpc('check_job_posting_limits', {
        _company_id: company.id
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!company?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Publish job with token consumption
  const publishJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.rpc('publish_job_with_tokens', {
        _job_id: jobId
      });

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Stellenanzeige veröffentlicht",
          description: `Verbleibende Tokens: ${result.remaining_tokens}, Verbleibende Job-Posts: ${result.remaining_job_posts}`,
        });
        // Refetch limits and job posts
        queryClient.invalidateQueries({ queryKey: ['job-posting-limits', company?.id] });
        queryClient.invalidateQueries({ queryKey: ['company-job-posts', company?.id] });
      } else {
        toast({
          title: "Veröffentlichung fehlgeschlagen",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    },
  });

  // Save job as draft
  const saveDraftMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const { data, error } = await supabase
        .from('job_posts')
        .insert({
          ...jobData,
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
      const { data, error } = await supabase
        .from('job_posts')
        .update(jobData)
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
    publishJob: publishJobMutation.mutate,
    isPublishing: publishJobMutation.isPending,
    saveDraft: saveDraftMutation.mutate,
    isSavingDraft: saveDraftMutation.isPending,
    updateJob: updateJobMutation.mutate,
    isUpdating: updateJobMutation.isPending,
  };
}
