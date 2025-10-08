import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = 'https://koymmvuhcxlvcuoyjnvv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_id } = await req.json();
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Starting batch matching for job ${job_id}`);

    // 1. Hole Job Details
    const { data: job, error: jobError } = await supabase
      .from('job_posts')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${job_id}`);
    }

    // 2. Hole alle relevanten Kandidaten (nur published profiles)
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select('id, vorname, nachname, ort, branche, faehigkeiten, sprachen, berufserfahrung_jahre')
      .eq('profile_published', true)
      .not('vorname', 'is', null);

    if (candidatesError) {
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
    }

    console.log(`Found ${candidates?.length || 0} candidates to match`);

    // 3. Batch-Processing (10 parallel)
    const BATCH_SIZE = 10;
    const results = [];

    for (let i = 0; i < (candidates?.length || 0); i += BATCH_SIZE) {
      const batch = candidates!.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (candidate) => {
        try {
          const prompt = `Bewerte den Match zwischen Job und Kandidat (0-100):

**Job:**
- Titel: ${job.title}
- Skills: ${JSON.stringify(job.skills || [])}
- Sprachen: ${JSON.stringify(job.required_languages || [])}
- Ort: ${job.city}
- Typ: ${job.employment_type}

**Kandidat:**
- Skills: ${JSON.stringify(candidate.faehigkeiten || [])}
- Sprachen: ${JSON.stringify(candidate.sprachen || [])}
- Ort: ${candidate.ort}
- Erfahrung: ${candidate.berufserfahrung_jahre || 0} Jahre
- Branche: ${candidate.branche}

Bewerte Skills, Location, Sprachen und gib einen Gesamt-Score.`;

          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'Du bist ein Job-Matching-Experte.' },
                { role: 'user', content: prompt }
              ],
              tools: [{
                type: "function",
                function: {
                  name: "evaluate_match",
                  parameters: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      explanation: {
                        type: "object",
                        properties: {
                          strengths: { type: "array", items: { type: "string" } },
                          gaps: { type: "array", items: { type: "string" } }
                        }
                      }
                    },
                    required: ["score", "explanation"],
                    additionalProperties: false
                  }
                }
              }],
              tool_choice: { type: "function", function: { name: "evaluate_match" } }
            }),
          });

          if (!response.ok) {
            console.error(`AI error for candidate ${candidate.id}:`, response.status);
            return null;
          }

          const data = await response.json();
          const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
          
          if (!toolCall) {
            console.error(`No tool call for candidate ${candidate.id}`);
            return null;
          }

          const { score, explanation } = JSON.parse(toolCall.function.arguments);

          // Speichere in Cache
          await supabase
            .from('candidate_match_cache')
            .upsert({
              job_id: job_id,
              candidate_id: candidate.id,
              score: score,
              explanation: explanation,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'job_id,candidate_id'
            });

          return { candidate_id: candidate.id, score };
        } catch (error) {
          console.error(`Error matching candidate ${candidate.id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null));

      // Rate limit protection: 100ms pause zwischen Batches
      if (i + BATCH_SIZE < (candidates?.length || 0)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Completed matching for job ${job_id}: ${results.length} candidates matched`);

    return new Response(JSON.stringify({ 
      success: true, 
      matched_count: results.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in compute-job-match-batch:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});