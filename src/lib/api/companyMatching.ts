import { supabase } from '@/integrations/supabase/client';

export async function refreshTopMatches(jobId: string, k = 10) {
  const { data, error } = await supabase.functions.invoke('matching_generate_topk', {
    body: { job_id: jobId, k }
  });

  if (error) throw error;
  return data;
}

export async function fetchTopMatches(jobId: string) {
  // For now return mock data until database tables are properly set up
  console.log('fetchTopMatches called with:', jobId);
  
  // Mock data structure that matches the expected format
  return [
    {
      candidate_id: 'mock-candidate-1',
      score: 0.95,
      rank: 1,
      is_explore: false,
      explanation: {
        overall: 0.95,
        skills_match: 0.9,
        location_fit: 0.98
      },
      candidate: {
        vorname: 'Max',
        nachname: 'Mustermann',
        stage: 'available',
        language_level: 'native'
      }
    },
    {
      candidate_id: 'mock-candidate-2', 
      score: 0.87,
      rank: 2,
      is_explore: false,
      explanation: {
        overall: 0.87,
        skills_match: 0.85,
        location_fit: 0.9
      },
      candidate: {
        vorname: 'Anna',
        nachname: 'Schmidt',
        stage: 'available',
        language_level: 'native'
      }
    }
  ];
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
