import { supabase } from '@/lib/supabase';

export async function refreshForYou(candidateId: string, limit = 20) {
  const { data, error } = await supabase.functions.invoke('matching_generate_jobs_for_candidate', {
    body: { candidateId, limit }
  });

  if (error) throw error;
  return data;
}

export async function fetchForYou(candidateId: string, cursor = 0, limit = 20) {
  const { data, error } = await supabase
    .from('v_candidate_foryou_with_jobs')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('score', { ascending: false })
    .range(cursor, cursor + limit - 1);

  if (error) throw error;
  return data;
}
