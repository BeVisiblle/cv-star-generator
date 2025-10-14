import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobData } = await req.json();
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Du bist ein Recruiting-Experte und schreibst professionelle Stellenanzeigen für Gen Z / junge Azubis.

**Stellendaten:**
- Titel: ${jobData.title || 'Nicht angegeben'}
- Beruf: ${jobData.profession || 'Nicht angegeben'}
- Ort: ${jobData.city || 'Nicht angegeben'}
- Beschäftigungsart: ${jobData.employment_type || 'Nicht angegeben'}
- Skills: ${jobData.skills?.map((s: any) => s.name).join(', ') || 'Keine angegeben'}
- Sprachen: ${jobData.languages?.map((l: any) => l.language).join(', ') || 'Keine angegeben'}

**Aufgabe:**
Erstelle eine ansprechende, moderne Stellenbeschreibung mit folgenden Abschnitten:

1. **tasks_md** (Aufgaben & Tätigkeiten):
   - 4-6 konkrete, praxisnahe Aufgaben
   - Fokus auf "Was lernst du?" und "Was darfst du machen?"
   - Locker, direkt ansprechend ("Du wirst...", "Bei uns lernst du...")

2. **requirements_md** (Anforderungen):
   - **Must-Have:** 3-4 essentielle Anforderungen
   - **Nice-to-Have:** 2-3 wünschenswerte Qualifikationen
   - Als Bullet Points formatieren
   
3. **benefits_description** (Benefits):
   - 5-7 attraktive Benefits
   - Modern und Gen Z-gerecht (Flexibilität, Weiterbildung, Team-Events)
   - Konkret und authentisch

**WICHTIGE Formatierungsregeln:**
- NIEMALS HTML-Tags wie <strong>, <em>, <b>, etc. verwenden
- Nur reinen Text mit einfacher Markdown-Formatierung
- Bullet Points nur mit "•" (Unicode) oder "-" (Bindestrich)
- Für Hervorhebung: Fettdruck OHNE ** Markierungen schreiben
- Keine ## Überschriften - stattdessen einfach fetten Text
- Line breaks mit normalen Zeilenumbrüchen

**Tonalität:**
- Modern, freundlich, authentisch
- Kein Corporate-Sprech
- Direkt ansprechend (Du-Form)
- Motivierend und ehrlich

Gib die Antwort als strukturiertes JSON zurück.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist ein Experte für moderne Azubi-Recruiting-Texte.' },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_job_sections",
            description: "Generiert strukturierte Stellenbeschreibungs-Abschnitte",
            parameters: {
              type: "object",
              properties: {
                tasks_md: { 
                  type: "string",
                  description: "Aufgaben als Markdown (mit - Bullet Points)"
                },
                requirements_md: { 
                  type: "string",
                  description: "Anforderungen als Markdown mit ## Must-Have und ## Nice-to-Have Sektionen"
                },
                benefits_description: { 
                  type: "string",
                  description: "Benefits als Markdown (mit - Bullet Points)"
                }
              },
              required: ["tasks_md", "requirements_md", "benefits_description"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_job_sections" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit erreicht. Bitte später erneut versuchen.' 
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const generatedSections = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(generatedSections), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-generate-job-description:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});