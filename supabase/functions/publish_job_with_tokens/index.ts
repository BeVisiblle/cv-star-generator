import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishJobRequest {
  job_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Publish job function invoked');
    
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

    const { job_id }: PublishJobRequest = await req.json();

    if (!job_id) {
      throw new Error('job_id is required');
    }

    console.log('Publishing job:', job_id);

    // Get job details and verify ownership
    const { data: jobData, error: jobError } = await supabaseService
      .from('job_posts')
      .select(`
        *,
        companies!inner(id, name, active_tokens, token_balance)
      `)
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

    // Get company subscription data to determine token cost
    const { data: subscriptionData, error: subscriptionError } = await supabaseService
      .from('company_subscriptions')
      .select(`
        *,
        plans(
          max_job_posts,
          tokens_per_post
        )
      `)
      .eq('company_id', jobData.company_id)
      .maybeSingle();

    console.log('Subscription data:', subscriptionData);

    // Determine token cost (default to 0 for free plans)
    const tokenCost = subscriptionData?.plans?.tokens_per_post || 0;
    const currentTokenBalance = jobData.companies.token_balance || 0;

    console.log('Token cost:', tokenCost, 'Current balance:', currentTokenBalance);

    // Check if company has enough tokens (if tokens are required)
    if (tokenCost > 0 && currentTokenBalance < tokenCost) {
      throw new Error('Insufficient tokens to publish job');
    }

    // Start transaction: Update job status and deduct tokens if needed
    const updates: any = {
      is_active: true,
      is_public: true,
      published_at: new Date().toISOString(),
      is_draft: false,
      updated_at: new Date().toISOString()
    };

    // Update job status
    const { error: updateError } = await supabaseService
      .from('job_posts')
      .update(updates)
      .eq('id', job_id);

    if (updateError) {
      console.error('Job update error:', updateError);
      throw new Error('Failed to publish job');
    }

    console.log('Job updated successfully');

    // Deduct tokens if required
    if (tokenCost > 0) {
      const { error: tokenError } = await supabaseService
        .from('companies')
        .update({
          token_balance: currentTokenBalance - tokenCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobData.company_id);

      if (tokenError) {
        console.error('Token deduction error:', tokenError);
        // Rollback job publication
        await supabaseService
          .from('job_posts')
          .update({
            is_active: false,
            is_public: false,
            published_at: null,
            is_draft: true
          })
          .eq('id', job_id);
        
        throw new Error('Failed to deduct tokens');
      }

      console.log('Tokens deducted successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Job published successfully',
        job_id,
        tokens_used: tokenCost
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error publishing job:', error);
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