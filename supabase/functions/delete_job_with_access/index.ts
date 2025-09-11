import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteJobRequest {
  job_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Delete job function invoked');
    
    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Create Supabase service client for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log('User authenticated:', user.id);

    const { job_id }: DeleteJobRequest = await req.json();

    if (!job_id) {
      throw new Error('job_id is required');
    }

    console.log('Deleting job:', job_id);

    // Get job details and verify ownership
    const { data: jobData, error: jobError } = await supabaseService
      .from('job_posts')
      .select('id, company_id, title')
      .eq('id', job_id)
      .single();

    if (jobError || !jobData) {
      console.error('Job fetch error:', jobError);
      throw new Error('Job not found');
    }

    console.log('Job data:', jobData);

    // Verify user has access to this company
    const { data: companyUser, error: companyUserError } = await supabaseService
      .from('company_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', jobData.company_id)
      .single();

    if (companyUserError || !companyUser) {
      console.error('Company access error:', companyUserError);
      throw new Error('Access denied');
    }

    console.log('Company access verified');

    // Delete the job
    const { error: deleteError } = await supabaseService
      .from('job_posts')
      .delete()
      .eq('id', job_id);

    if (deleteError) {
      console.error('Job deletion error:', deleteError);
      throw new Error('Failed to delete job');
    }

    console.log('Job deleted successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Job deleted successfully',
        job_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error deleting job:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});