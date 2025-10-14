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
    const { industry, employmentType, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY ist nicht konfiguriert');
    }

    const systemPrompt = `Du bist ein Experte für Gehälter in Deutschland.
Basierend auf:
- Branche: ${industry}
- Anstellungsart: ${employmentType}
- Position: ${title}

Gib eine realistische Gehalts-Range an (in EUR).
- Bei Ausbildung/Praktikum: Monatsvergütung
- Bei Vollzeit/Teilzeit: Jahresgehalt
- Berücksichtige deutsche Marktstandards und regionale Unterschiede`;

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
          { role: 'user', content: 'Schlage eine Gehalts-Range vor.' }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_salary',
            description: 'Schlägt eine Gehalts-Range vor',
            parameters: {
              type: 'object',
              properties: {
                salary_min: { 
                  type: 'number',
                  description: 'Minimales Gehalt in EUR'
                },
                salary_max: { 
                  type: 'number',
                  description: 'Maximales Gehalt in EUR'
                },
                unit: {
                  type: 'string',
                  enum: ['month', 'year'],
                  description: 'Zeiteinheit'
                }
              },
              required: ['salary_min', 'salary_max', 'unit']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_salary' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate Limit erreicht' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('Keine Gehaltsvorschläge erhalten');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-suggest-salary:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
