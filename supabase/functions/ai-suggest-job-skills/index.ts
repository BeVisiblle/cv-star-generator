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
    const { profession, industry, employmentType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY ist nicht konfiguriert');
    }

    const systemPrompt = `Du bist ein Experte für Stellenanforderungen und Skills in Deutschland. 
Generiere eine präzise Liste von Fähigkeiten basierend auf:
- Beruf/Position: ${profession}
- Branche: ${industry}
- Anstellungsart: ${employmentType}

Wichtig:
- Gib maximal 10 relevante Skills zurück
- Mix aus technischen und Soft Skills
- Sortiere nach Wichtigkeit (wichtigste zuerst)
- Bei Ausbildung: Fokus auf Grundlagen und Lernbereitschaft
- Bei Vollzeit/Fachkraft: Fokus auf Expertise und Erfahrung`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generiere die Skills-Liste.' }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_skills',
            description: 'Generiert eine strukturierte Liste von Skills',
            parameters: {
              type: 'object',
              properties: {
                skills: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Name der Fähigkeit' },
                      level: { 
                        type: 'string', 
                        enum: ['must_have', 'nice_to_have'],
                        description: 'Wichtigkeit der Fähigkeit'
                      }
                    },
                    required: ['name', 'level']
                  },
                  maxItems: 10
                }
              },
              required: ['skills']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_skills' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate Limit erreicht. Bitte später erneut versuchen.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI-Credits aufgebraucht. Bitte kontaktiere den Support.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('Keine Skills-Vorschläge erhalten');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-suggest-job-skills:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
