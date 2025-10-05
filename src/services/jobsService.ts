// Jobs Service for Job Posting Management
import { supabase } from '@/integrations/supabase/client';

export interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  title: string;
  status?: 'draft' | 'published' | 'closed';
}

export class JobsService {
  /**
   * List all published jobs for current company
   */
  async listCompanyJobs(): Promise<JobPosting[]> {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw error;
    }
  }

  /**
   * List all jobs (including drafts) for current company
   */
  async listAllCompanyJobs(): Promise<JobPosting[]> {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all company jobs:', error);
      throw error;
    }
  }

  /**
   * Create a new job posting
   */
  async createJob(data: CreateJobData): Promise<JobPosting> {
    try {
      const { data: job, error } = await supabase
        .from('job_postings')
        .insert({
          title: data.title,
          status: data.status || 'published'
        })
        .select()
        .single();

      if (error) throw error;
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Update job posting
   */
  async updateJob(jobId: string, data: Partial<CreateJobData>): Promise<JobPosting> {
    try {
      const { data: job, error } = await supabase
        .from('job_postings')
        .update(data)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  /**
   * Delete job posting
   */
  async deleteJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<JobPosting | null> {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }
}
