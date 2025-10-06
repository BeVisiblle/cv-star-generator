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

    const prompt = `Du bist ein professioneller CV-Schreiber für junge Menschen in Deutschland. 
Generiere 3 prägnante Bullet Points für folgende Position:

Jobtitel: ${jobTitle}
${company ? `Unternehmen: ${company}` : ''}
${industry ? `Branche: ${industry}` : ''}

ANFORDERUNGEN:
- Jeder Bullet Point sollte 1-2 Sätze lang sein
- Fokus auf konkrete Tätigkeiten und Verantwortungen
- Professionell aber verständlich formuliert (kein Marketing-Sprech!)
- Relevant für die Branche und das Niveau (Ausbildung/Berufseinstieg)
- Authentisch & bodenständig

WICHTIG: 
Returniere die 3 Bullet Points als einfache Liste ohne JSON-Formatierung.
Keine Anführungszeichen, Klammern oder Nummerierungen.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist ein professioneller CV-Schreiber für junge Menschen in Deutschland.' },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_job_bullets",
            description: "Returniere 3 Bullet Points für Jobbeschreibung",
            parameters: {
              type: "object",
              properties: {
                bullets: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                  description: "Genau 3 Bullet Points als String-Array"
                }
              },
              required: ["bullets"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_job_bullets" } }
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
    let bullets: string[];

    // Try tool calling response first
    if (data.choices?.[0]?.message?.tool_calls) {
      try {
        const toolCall = data.choices[0].message.tool_calls[0];
        const args = JSON.parse(toolCall.function.arguments);
        bullets = args.bullets;
      } catch (e) {
        console.error('Tool call parsing error:', e);
        bullets = [];
      }
    } else {
      // Fallback to content parsing
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        return new Response(
          JSON.stringify({ error: 'No response from AI' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(content);
        bullets = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Split by newlines and clean
        bullets = content
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && !line.match(/^[\[\]"',]+$/))
          .map((line: string) => line.replace(/^[•\-\*\d\.]\s*/, '').replace(/^["']|["']$/g, '').trim())
          .slice(0, 3);
      }
    }

    // Ensure exactly 3 bullets
    if (bullets.length < 3) {
      bullets = [
        ...bullets,
        ...Array(3 - bullets.length).fill('Weitere Tätigkeiten im Rahmen der Position')
      ];
    }

    return new Response(
      JSON.stringify({ bullets: bullets.slice(0, 3), success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-generate-job-bullets:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
