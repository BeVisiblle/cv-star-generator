import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type JobPost = Database['public']['Tables']['job_posts']['Row'];
type JobInsert = Database['public']['Tables']['job_posts']['Insert'];
type JobUpdate = Database['public']['Tables']['job_posts']['Update'];
type JobStatus = Database['public']['Enums']['job_status'];

export class JobsService {
  // Fetch jobs for a company
  static async getCompanyJobs(companyId: string) {
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Fetch a single job by ID
  static async getJobById(jobId: string) {
    const { data, error } = await supabase
      .from('job_posts')
      .select('*, company:companies(*)')
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return data;
  }

  // Fetch public jobs (for candidates)
  static async getPublicJobs(filters?: {
    employment_type?: string;
    profession_id?: string;
    location?: string;
  }) {
    let query = supabase
      .from('job_posts')
      .select('*, company:companies(id, name, logo_url)')
      .eq('status', 'published')
      .eq('is_active', true)
      .eq('is_public', true);

    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }
    if (filters?.location) {
      query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Create a new job (draft)
  static async createJob(companyId: string, jobData: any) {
    const { data, error } = await supabase
      .from('job_posts')
      .insert({
        company_id: companyId,
        status: 'draft',
        title: jobData.title || 'Neue Stelle',
        city: jobData.location || jobData.city || '',
        employment_type: jobData.employment_type || 'apprenticeship',
        description_md: jobData.description,
        ...jobData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a job
  static async updateJob(jobId: string, updates: JobUpdate) {
    const { data, error } = await supabase
      .from('job_posts')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a job
  static async deleteJob(jobId: string) {
    const { error } = await supabase
      .from('job_posts')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  }

  // Publish a job (uses RPC to deduct token)
  static async publishJob(jobId: string, userId: string) {
    const { data, error } = await supabase.rpc('publish_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Pause a job
  static async pauseJob(jobId: string, userId: string) {
    const { data, error } = await supabase.rpc('pause_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Resume a job
  static async resumeJob(jobId: string, userId: string) {
    const { data, error } = await supabase.rpc('resume_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Inactivate a job
  static async inactivateJob(jobId: string, userId: string) {
    const { data, error } = await supabase.rpc('inactivate_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Get job status history
  static async getJobHistory(jobId: string) {
    const { data, error } = await supabase
      .from('job_status_history')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Check missing documents for a user/job
  static async getMissingDocuments(userId: string, jobId: string) {
    const { data, error } = await supabase.rpc('missing_required_documents', {
      p_user: userId,
      p_job: jobId,
    });

    if (error) throw error;
    return data;
  }

  // Compute match score
  static async computeMatch(userId: string, jobId: string) {
    const { data, error } = await supabase.rpc('compute_match', {
      p_user: userId,
      p_job: jobId,
    });

    if (error) throw error;
    return data;
  }
}

// Export types for backward compatibility
export type JobPosting = JobPost;

// Exported functions for backward compatibility
export const getJobs = JobsService.getCompanyJobs;
export const getJobById = JobsService.getJobById;
export const getPublicJobs = JobsService.getPublicJobs;
export const getCompanyJobs = JobsService.getCompanyJobs;
export const createJob = JobsService.createJob;
export const updateJob = JobsService.updateJob;
export const deleteJob = JobsService.deleteJob;
