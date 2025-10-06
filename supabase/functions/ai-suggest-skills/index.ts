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
    const { branche, status, existingSkills = [], schulbildung, berufserfahrung } = await req.json();
    
    if (!branche) {
      return new Response(
        JSON.stringify({ error: 'Branche is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const brancheNames: Record<string, string> = {
      handwerk: 'Handwerk',
      it: 'IT',
      gesundheit: 'Gesundheit & Pflege',
      buero: 'Büro & Verwaltung',
      verkauf: 'Verkauf & Handel',
      gastronomie: 'Gastronomie & Service',
      bau: 'Bau & Architektur'
    };

    const educationContext = schulbildung?.[0] ? `\nAusbildung: ${schulbildung[0].schulform}` : '';
    const workContext = berufserfahrung?.[0] ? `\nBerufserfahrung: ${berufserfahrung[0].titel}` : '';

    const prompt = `Du bist ein Karriereberater. Schlage 6-8 relevante Fähigkeiten/Skills für folgendes Profil vor:

Branche: ${brancheNames[branche] || branche}
Status: ${status === 'schueler' ? 'Schüler' : status === 'azubi' ? 'Azubi' : 'Ausgelernt'}${educationContext}${workContext}
${existingSkills.length > 0 ? `Bereits vorhandene Skills: ${existingSkills.join(', ')}` : ''}

Anforderungen:
- Nur Skills vorschlagen die NICHT bereits vorhanden sind
- Relevant für die Branche
- Mix aus Soft Skills und Hard Skills
- Für das Status-Level angemessen
- Returniere NUR ein Array von Skill-Namen, keine Erklärungen

Format: ["Skill 1", "Skill 2", ...]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist ein hilfreicher Karriereberater.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    try {
      const skills = JSON.parse(content);
      return new Response(
        JSON.stringify({ skills, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch {
      const skills = content.split('\n').filter((s: string) => s.trim()).slice(0, 8);
      return new Response(
        JSON.stringify({ skills, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
