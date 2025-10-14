import { supabase } from "@/integrations/supabase/client";

type JobPost = any; // Simplified to avoid deep type instantiation
type JobInsert = any;
type JobUpdate = any;
type JobStatus = "draft" | "published" | "paused" | "inactive";

export class JobsService {
  // Fetch jobs for a company
  static async getCompanyJobs(companyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Fetch a single job by ID
  static async getJobById(jobId: string): Promise<any> {
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
  }): Promise<any[]> {
    // Build base query
    const baseQuery = supabase
      .from('job_posts')
      .select('*, company:companies(id, name, logo_url)')
      .eq('status', 'published')
      .eq('is_active', true)
      .eq('is_public', true);

    // Apply filters if provided
    let query = baseQuery;
    
    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }
    
    if (filters?.location) {
      // Search across city, state, country
      const searchPattern = `%${filters.location}%`;
      query = query.or(`city.ilike.${searchPattern},state.ilike.${searchPattern},country.ilike.${searchPattern}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // Create a new job (draft)
  static async createJob(companyId: string, jobData: any): Promise<any> {
    const insertData: any = {
      company_id: companyId,
      status: 'draft',
      title: jobData.title || 'Neue Stelle',
      industry: jobData.industry || '',
      city: jobData.city || '',
      employment_type: jobData.employment_type || 'apprenticeship',
      start_date: jobData.start_date || null,
      description_md: jobData.description_md || '',
      tasks_md: jobData.tasks_md || '',
      requirements_md: jobData.requirements_md || '',
      benefits_description: jobData.benefits_description || '',
      salary_min: jobData.salary_min || null,
      salary_max: jobData.salary_max || null,
      work_mode: jobData.work_mode || null,
      working_hours: jobData.working_hours || null,
      is_public: jobData.is_public ?? true,
      is_active: jobData.is_active ?? false,
    };

    const { data, error } = await supabase
      .from('job_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a job
  static async updateJob(jobId: string, updates: any): Promise<any> {
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
  static async deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('job_posts')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  }

  // Publish a job (uses RPC to deduct token)
  static async publishJob(jobId: string, userId: string): Promise<any> {
    const { data, error } = await supabase.rpc('publish_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Pause a job
  static async pauseJob(jobId: string, userId: string): Promise<any> {
    const { data, error } = await supabase.rpc('pause_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Resume a job
  static async resumeJob(jobId: string, userId: string): Promise<any> {
    const { data, error } = await supabase.rpc('resume_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Inactivate a job
  static async inactivateJob(jobId: string, userId: string): Promise<any> {
    const { data, error } = await supabase.rpc('inactivate_job', {
      job_uuid: jobId,
      actor: userId,
    });

    if (error) throw error;
    return data;
  }

  // Get job status history
  static async getJobHistory(jobId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('job_status_history')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Check missing documents for a user/job
  static async getMissingDocuments(userId: string, jobId: string): Promise<any> {
    const { data, error } = await supabase.rpc('missing_required_documents', {
      p_user: userId,
      p_job: jobId,
    });

    if (error) throw error;
    return data;
  }

  // Compute match score
  static async computeMatch(userId: string, jobId: string): Promise<any> {
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

