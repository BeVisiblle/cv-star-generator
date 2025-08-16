import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ExportFormat = "csv" | "xlsx";

interface ExportRequest {
  company_id: string;
  profile_ids: string[];
  format: ExportFormat;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const body: ExportRequest = await req.json();
    const { company_id, profile_ids, format } = body;

    if (!company_id || !Array.isArray(profile_ids) || profile_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "invalid_params" }), 
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Exporting ${profile_ids.length} profiles for company ${company_id} in ${format} format`);

    // Get unlocked profiles data
    const { data: tokenProfiles, error: tokenError } = await supabase
      .from('tokens_used')
      .select(`
        profiles!inner(
          id, vorname, nachname, ort, status, branche, 
          avatar_url, headline, faehigkeiten, email, telefon
        )
      `)
      .eq('company_id', company_id)
      .in('profile_id', profile_ids);

    if (tokenError) throw tokenError;

    // Get pipeline data
    const { data: pipelineProfiles, error: pipelineError } = await supabase
      .from('company_candidates')
      .select(`
        stage, created_at, updated_at,
        profiles!inner(
          id, vorname, nachname, ort, status, branche,
          avatar_url, headline, faehigkeiten, email, telefon
        )
      `)
      .eq('company_id', company_id)
      .in('candidate_id', profile_ids);

    if (pipelineError) throw pipelineError;

    // Merge and deduplicate profiles
    const profileMap = new Map();
    
    // Add token profiles
    (tokenProfiles || []).forEach((tp: any) => {
      if (tp.profiles) {
        profileMap.set(tp.profiles.id, {
          ...tp.profiles,
          stage: 'new',
          unlocked_source: 'token'
        });
      }
    });

    // Add/update with pipeline data
    (pipelineProfiles || []).forEach((pp: any) => {
      if (pp.profiles) {
        const existing = profileMap.get(pp.profiles.id) || pp.profiles;
        profileMap.set(pp.profiles.id, {
          ...existing,
          stage: pp.stage || 'new',
          pipeline_created: pp.created_at,
          pipeline_updated: pp.updated_at
        });
      }
    });

    const profiles = Array.from(profileMap.values());

    if (profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: "no_profiles_found" }), 
        { status: 404, headers: corsHeaders }
      );
    }

    // Generate CSV content
    const csvHeader = [
      'ID', 'Vorname', 'Nachname', 'Stadt', 'Status', 'Branche', 
      'Headline', 'Email', 'Telefon', 'Stage', 'Quelle'
    ].join(',') + '\n';

    const csvRows = profiles.map((profile: any) => [
      profile.id || '',
      escapeCsv(profile.vorname || ''),
      escapeCsv(profile.nachname || ''),
      escapeCsv(profile.ort || ''),
      escapeCsv(profile.status || ''),
      escapeCsv(profile.branche || ''),
      escapeCsv(profile.headline || ''),
      escapeCsv(profile.email || ''),
      escapeCsv(profile.telefon || ''),
      escapeCsv(profile.stage || 'new'),
      escapeCsv(profile.unlocked_source || 'pipeline')
    ].join(',')).join('\n');

    const csvContent = csvHeader + csvRows + '\n';
    const bytes = new TextEncoder().encode(csvContent);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `kandidaten_export_${company_id}_${timestamp}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(fileName, bytes, { 
        contentType: format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv',
        upsert: true 
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Create signed URL (valid for 10 minutes)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('exports')
      .createSignedUrl(fileName, 60 * 10);

    if (signedError) {
      console.error('Signed URL error:', signedError);
      throw signedError;
    }

    console.log(`Export successful: ${fileName}`);

    return new Response(
      JSON.stringify({ 
        url: signedData.signedUrl,
        filename: fileName,
        count: profiles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'export_failed' 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

function escapeCsv(value: any): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}