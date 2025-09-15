import { supabase } from '@/lib/supabase';

export async function refreshTopMatches(jobId: string, k = 3) {
  const { data, error } = await supabase.functions.invoke('matching_generate_topk', {
    body: { jobId, k }
  });

  if (error) throw error;
  return data;
}

export async function fetchTopMatches(jobId: string) {
  const { data, error } = await supabase
    .from('v_job_topmatches')
    .select('*')
    .eq('job_id', jobId)
    .order('rank', { ascending: true })
    .limit(3);

  if (error) throw error;
  return data;
}

export async function unlockCandidate(jobId: string, candidateId: string) {
  const { error } = await supabase.rpc('grant_profile_view', {
    p_job: jobId,
    p_candidate: candidateId
  });

  if (error) throw error;
  
  // Also mark application as unlocked
  await supabase.rpc('mark_application_freigeschaltet', {
    p_job: jobId,
    p_candidate: candidateId
  });
}

export async function rejectCandidate(jobId: string, candidateId: string, reason_code: string) {
  const { error } = await supabase
    .from('match_feedback')
    .insert({
      job_id: jobId,
      candidate_id: candidateId,
      feedback_type: 'reject',
      reason_code,
      created_at: new Date().toISOString()
    });

  if (error) throw error;
}

export async function suppressCandidate(jobId: string, candidateId: string, days = 30, reason = 'reject_cooldown') {
  const { data, error } = await supabase.functions.invoke('suppression_upsert', {
    body: {
      job_id: jobId,
      candidate_id: candidateId,
      days,
      reason
    }
  });

  if (error) throw error;
  return data;
}
