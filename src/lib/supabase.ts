// Re-export supabase client for backwards compatibility
import { supabase } from '@/integrations/supabase/client';

export function createClient() {
  return supabase;
}

export { supabase };