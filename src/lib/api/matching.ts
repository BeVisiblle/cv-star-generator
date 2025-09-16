import { supabase } from '@/integrations/supabase/client';

export async function refreshForYou(candidateId: string, limit = 20) {
  const { data, error } = await supabase.functions.invoke('matching_generate_jobs_for_candidate', {
    body: { candidateId, limit }
  });

  if (error) throw error;
  return data;
}

export async function fetchForYou(candidateId: string, cursor = 0, limit = 20) {
  // Placeholder implementation
  console.log('fetchForYou called with:', { candidateId, cursor, limit });
  return [];
}
