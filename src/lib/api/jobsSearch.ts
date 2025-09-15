import { supabase } from '@/lib/supabase';

export interface JobsSearchFilters {
  track?: string;
  remote_only?: boolean;
  benefits_any?: string[];
  shifts_any?: string[];
  contract_types?: string[];
  radius_km?: number;
  order_by?: 'newest' | 'nearest';
}

export interface JobSearchResult {
  id: string;
  company_id: string;
  title: string;
  track: string;
  is_remote: boolean;
  benefits: string[];
  contract_type: string;
  created_at: string;
  distance_km?: number;
  has_explanation: boolean;
  explanation?: any;
}

export async function searchOpenJobs(
  candidateId: string,
  cursor = 0,
  limit = 20,
  filters: JobsSearchFilters = {}
) {
  const { data, error } = await supabase.rpc('open_jobs_search', {
    p_candidate: candidateId,
    p_cursor: cursor,
    p_limit: limit,
    p_filters: {
      ...filters,
      benefits_any: filters.benefits_any?.join(',') ?? '',
      shifts_any: filters.shifts_any?.join(',') ?? '',
      contract_types: filters.contract_types?.join(',') ?? '',
    }
  });

  if (error) throw error;
  return data as JobSearchResult[];
}

export async function applyToJob(candidateId: string, jobId: string) {
  const { data, error } = await supabase.rpc('apply_to_job', {
    p_candidate: candidateId,
    p_job: jobId
  });

  if (error) throw error;
  return data;
}

export async function getMyApplications(candidateId: string) {
  const { data, error } = await supabase
    .from('v_my_applications')
    .select('*')
    .eq('candidate_id', candidateId);

  if (error) throw error;
  return data;
}

export async function toggleSavedJob(candidateId: string, jobId: string) {
  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('job_id', jobId)
    .single();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId);
    
    if (error) throw error;
    return { saved: false };
  } else {
    // Add
    const { error } = await supabase
      .from('saved_jobs')
      .insert({
        candidate_id: candidateId,
        job_id: jobId
      });
    
    if (error) throw error;
    return { saved: true };
  }
}

export async function toggleCompanyFollow(candidateId: string, companyId: string) {
  // Check if already following
  const { data: existing } = await supabase
    .from('company_follows')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('company_id', companyId)
    .single();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('company_follows')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('company_id', companyId);
    
    if (error) throw error;
    return { following: false };
  } else {
    // Add
    const { error } = await supabase
      .from('company_follows')
      .insert({
        candidate_id: candidateId,
        company_id: companyId
      });
    
    if (error) throw error;
    return { following: true };
  }
}
