import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobContentRequest {
  title: string;
  location: string;
  jobType: 'internship' | 'apprenticeship' | 'professional';
  industry?: string;
  company?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating job content with AI...');
    const { title, location, jobType, industry, company }: JobContentRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `Du bist ein Experte für Stellenausschreibungen in Deutschland. 
Generiere realistische, ansprechende und gesetzeskonforme Stellenausschreibungen.
Verwende geschlechtsneutrale Sprache (m/w/d) und vermeide Diskriminierung.
Orientiere dich an deutschen Arbeitsrechtsstandards und üblichen Branchenpraktiken.`;

    let userPrompt = '';
    
    if (jobType === 'internship') {
      userPrompt = `Erstelle eine Praktikumsausschreibung für "${title}" in ${location}.
      
Gib mir zurück (als JSON):
- description: Kurze Unternehmensbeschreibung und Praktikumskontext (2-3 Sätze)
- tasks: Array von 5-7 konkreten Aufgaben
- requirements: Array von 5-6 Anforderungen
- benefits: Array von 5-7 Benefits für Praktikanten
- skills: Array von 8-10 relevanten Skills mit level (1-5) und required (boolean)
- languages: Array mit Deutsch (B2+) und ggf. Englisch
- learningObjectives: Text mit Lernzielen
- durationWeeksMin: sinnvolle Mindestdauer
- durationWeeksMax: sinnvolle Maximaldauer

Beispiel Skills Format: [{"name": "Microsoft Office", "level": 3, "required": true}]
Beispiel Languages Format: [{"language": "Deutsch", "level": "B2", "required": true}]`;
    
    } else if (jobType === 'apprenticeship') {
      userPrompt = `Erstelle eine Ausbildungsausschreibung für "${title}" in ${location}.
      
Gib mir zurück (als JSON):
- description: Kurze Unternehmensbeschreibung und Ausbildungskontext (2-3 Sätze)
- tasks: Array von 6-8 konkreten Ausbildungsinhalten
- requirements: Array von 5-6 Anforderungen
- benefits: Array von 6-8 Benefits für Azubis
- skills: Array von 8-12 relevanten Skills mit level (1-4) und required (boolean)
- languages: Array mit Deutsch und ggf. weitere
- minimumEducation: empfohlener Mindestabschluss
- durationMonths: übliche Ausbildungsdauer
- chamber: passende Kammer (IHK/HWK)
- examSupport: true (Prüfungsunterstützung)
- rotationPlan: kurzer Text zum Ausbildungsplan

Skills für Azubis eher Grundlevel (1-3).`;
    
    } else { // professional
      userPrompt = `Erstelle eine Fachkräfte-Stellenausschreibung für "${title}" in ${location}.
      
Gib mir zurück (als JSON):
- description: Kurze Unternehmensbeschreibung und Stellenkontext (2-3 Sätze)
- tasks: Array von 6-8 konkreten Aufgaben
- requirements: Array von 6-8 Anforderungen
- benefits: Array von 7-9 Benefits
- skills: Array von 10-15 relevanten Skills mit level (2-5) und required (boolean)
- languages: Array mit Deutsch und ggf. weitere
- minExperienceYears: empfohlene Berufserfahrung
- degreeRequired: boolean ob Abschluss nötig
- minimumDegree: wenn degreeRequired true, welcher Abschluss
- probationPeriodMonths: übliche Probezeit (3-6)

Skills für Fachkräfte höheres Level (2-5).`;
    }

    if (industry) {
      userPrompt += `\nBranche: ${industry}`;
    }
    if (company) {
      userPrompt += `\nUnternehmen: ${company}`;
    }

    userPrompt += `\n\nAntwort ausschließlich in valides JSON ohne weitere Text oder Markdown.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-job-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});