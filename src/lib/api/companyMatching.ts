import { supabase } from '@/integrations/supabase/client';

export async function refreshTopMatches(jobId: string, k = 3) {
  const { data, error } = await supabase.functions.invoke('matching_generate_topk', {
    body: { jobId, k }
  });

  if (error) throw error;
  return data;
}

export async function fetchTopMatches(jobId: string) {
  // Placeholder implementation
  console.log('fetchTopMatches called with:', jobId);
  return [];
}

export async function unlockCandidate(jobId: string, candidateId: string) {
  // Placeholder implementation
  console.log('unlockCandidate called with:', { jobId, candidateId });
}

export async function rejectCandidate(jobId: string, candidateId: string, reason_code: string) {
  // Placeholder implementation
  console.log('rejectCandidate called with:', { jobId, candidateId, reason_code });
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
