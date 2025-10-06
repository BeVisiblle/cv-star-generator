import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, company, industry } = await req.json();
    
    if (!jobTitle) {
      return new Response(
        JSON.stringify({ error: 'Job title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Du bist ein professioneller CV-Schreiber. Generiere 3 prägnante Bullet Points für folgende Position:

Jobtitel: ${jobTitle}
${company ? `Unternehmen: ${company}` : ''}
${industry ? `Branche: ${industry}` : ''}

Anforderungen:
- Jeder Bullet Point sollte 1-2 Sätze lang sein
- Fokus auf konkrete Tätigkeiten und Verantwortungen
- Professionell aber verständlich formuliert
- Relevant für die Branche
- Returniere NUR die 3 Bullet Points als Array, keine zusätzlichen Erklärungen

Format: ["Bullet 1", "Bullet 2", "Bullet 3"]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist ein professioneller CV-Schreiber.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit überschritten. Bitte versuche es später erneut.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the bullet points
    try {
      const bullets = JSON.parse(content);
      return new Response(
        JSON.stringify({ bullets, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      // If parsing fails, split by newlines and clean
      const bullets = content
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 3);
      
      return new Response(
        JSON.stringify({ bullets, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in ai-generate-job-bullets:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
