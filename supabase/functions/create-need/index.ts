import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateNeedRequest {
  name: string;
  profession_id?: string;
  employment_type: string;
  location: {
    lat: number;
    lng: number;
  };
  radius_km: number;
  start_date?: string;
  
  skills: {
    must: string[];
    nice: string[];
  };
  licenses?: {
    must: string[];
    nice: string[];
  };
  languages?: Array<{
    language: string;
    level: string;
    type: 'must' | 'nice';
  }>;
  target_groups: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Set the auth header for RLS
    supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    } as any);

    const { 
      name, 
      profession_id, 
      employment_type, 
      location, 
      radius_km, 
      start_date, 
      skills, 
      licenses, 
      languages, 
      target_groups 
    }: CreateNeedRequest = await req.json();

    // Get user's company
    const { data: userCompany, error: companyError } = await supabase
      .rpc('get_user_company_id');

    if (companyError || !userCompany) {
      console.error('Company error:', companyError);
      return new Response(JSON.stringify({ error: 'No company found for user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check quota
    const { data: quotaData, error: quotaError } = await supabase
      .rpc('get_company_need_quota', { p_company_id: userCompany });

    if (quotaError) {
      console.error('Quota error:', quotaError);
      return new Response(JSON.stringify({ error: 'Failed to check quota' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const quota = quotaData[0];
    if (!quota || quota.remaining_needs <= 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'quota_exceeded',
        message: 'No remaining needs available. Upgrade your plan or purchase additional needs.',
        quota: quota
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the need
    const { data: needData, error: needError } = await supabase
      .from('company_needs')
      .insert({
        company_id: userCompany,
        name,
        profession_id,
        employment_type,
        location_geog: `POINT(${location.lng} ${location.lat})`,
        radius_km,
        start_date: start_date || null,
        visibility: 'active'
      })
      .select()
      .single();

    if (needError) {
      console.error('Need creation error:', needError);
      return new Response(JSON.stringify({ error: 'Failed to create need' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const needId = needData.id;

    // Insert skills
    const skillInserts = [
      ...skills.must.map(skill => ({ need_id: needId, skill, type: 'must' })),
      ...skills.nice.map(skill => ({ need_id: needId, skill, type: 'nice' }))
    ];

    if (skillInserts.length > 0) {
      const { error: skillsError } = await supabase
        .from('need_skills')
        .insert(skillInserts);

      if (skillsError) {
        console.error('Skills insert error:', skillsError);
      }
    }

    // Insert licenses
    if (licenses) {
      const licenseInserts = [
        ...licenses.must.map(license => ({ need_id: needId, license, type: 'must' })),
        ...licenses.nice.map(license => ({ need_id: needId, license, type: 'nice' }))
      ];

      if (licenseInserts.length > 0) {
        const { error: licensesError } = await supabase
          .from('need_licenses')
          .insert(licenseInserts);

        if (licensesError) {
          console.error('Licenses insert error:', licensesError);
        }
      }
    }

    // Insert languages
    if (languages && languages.length > 0) {
      const { error: languagesError } = await supabase
        .from('need_languages')
        .insert(languages.map(lang => ({
          need_id: needId,
          language: lang.language,
          level: lang.level,
          type: lang.type
        })));

      if (languagesError) {
        console.error('Languages insert error:', languagesError);
      }
    }

    // Insert target groups
    if (target_groups.length > 0) {
      const { error: targetsError } = await supabase
        .from('need_target_groups')
        .insert(target_groups.map(target => ({
          need_id: needId,
          target_group: target
        })));

      if (targetsError) {
        console.error('Target groups insert error:', targetsError);
      }
    }

    // Get top 4 matches for this need
    const { data: matchesData, error: matchesError } = await supabase
      .rpc('get_matches_for_need', { p_need_id: needId, p_limit: 4 });

    if (matchesError) {
      console.error('Matches error:', matchesError);
    }

    // Get candidate profiles for the matches
    let topMatches = [];
    if (matchesData && matchesData.length > 0) {
      const candidateIds = matchesData.map((m: any) => m.candidate_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, vorname, nachname, avatar_url, headline, ort, faehigkeiten')
        .in('id', candidateIds);

      if (!profilesError && profilesData) {
        topMatches = profilesData.map(profile => {
          const match = matchesData.find((m: any) => m.candidate_id === profile.id);
          return {
            ...profile,
            match_score: match?.score || 0,
            match_breakdown: match?.breakdown || {}
          };
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      need: needData,
      top_matches: topMatches,
      quota: {
        ...quota,
        remaining_needs: quota.remaining_needs - 1
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-need function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});