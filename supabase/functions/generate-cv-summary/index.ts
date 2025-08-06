import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CVData {
  vorname?: string;
  ort?: string;
  branche?: string;
  status?: string;
  motivation?: string;
  kenntnisse?: string;
  praktische_erfahrung?: string;
  faehigkeiten?: string[];
  sprachen?: Array<{ sprache: string; niveau: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvData }: { cvData: CVData } = await req.json();

    // Generate Berufswunsch based on branche and status
    const getBerufswunsch = (branche?: string, status?: string) => {
      const brancheMap = {
        handwerk: 'Handwerk',
        it: 'IT',
        gesundheit: 'Gesundheit & Pflege',
        buero: 'Büro & Verwaltung',
        verkauf: 'Verkauf & Handel',
        gastronomie: 'Gastronomie & Service',
        bau: 'Bau & Architektur'
      };
      
      const statusMap = {
        schueler: 'Ausbildung',
        azubi: 'Weiterbildung',
        ausgelernt: 'Berufstätigkeit'
      };

      return `${statusMap[status as keyof typeof statusMap] || 'Ausbildung'} im Bereich ${brancheMap[branche as keyof typeof brancheMap] || 'diverse Bereiche'}`;
    };

    // Process languages intelligently
    const getSprachenSummary = (sprachen?: Array<{ sprache: string; niveau: string }>) => {
      if (!sprachen || sprachen.length === 0) return '';
      
      if (sprachen.length <= 3) {
        return sprachen.map(s => `${s.sprache} (${s.niveau})`).join(', ');
      }
      
      const highLevel = sprachen.filter(s => 
        s.niveau === 'C1' || s.niveau === 'C2' || s.niveau === 'Muttersprache'
      );
      
      if (highLevel.length >= 2) {
        return `mehrsprachig mit fließenden Kenntnissen in ${highLevel.length} Sprachen`;
      }
      
      return `${sprachen.length} Sprachen`;
    };

    // Get top 3 skills
    const getTopSkills = (faehigkeiten?: string[]) => {
      if (!faehigkeiten || faehigkeiten.length === 0) return '';
      return faehigkeiten.slice(0, 3).join(', ');
    };

    // Map questions based on branche
    const getQuestionAnswers = (cvData: CVData) => {
      return {
        frage1: cvData.motivation || '',
        frage2: cvData.kenntnisse || '',
        frage3: cvData.praktische_erfahrung || ''
      };
    };

    const questions = getQuestionAnswers(cvData);
    const topSkills = getTopSkills(cvData.faehigkeiten);
    const sprachenSummary = getSprachenSummary(cvData.sprachen);
    const berufswunsch = getBerufswunsch(cvData.branche, cvData.status);

    const prompt = `Du bist eine Karriere-KI. Erstelle einen motivierenden, ehrlichen und sympathischen Text für den Lebenslaufabschnitt „Über mich".

Nutze dafür die folgenden Informationen:

Vorname: ${cvData.vorname || 'Unbekannt'}
Ort: ${cvData.ort || 'Unbekannt'}
Berufswunsch: ${berufswunsch}
Top 3 Fähigkeiten: ${topSkills}
Sprachen: ${sprachenSummary}

Antworten auf persönliche Fragen:
1. Warum möchtest du eine Ausbildung in diesem Bereich machen?
→ ${questions.frage1}

2. Was motiviert dich jeden Tag?
→ ${questions.frage2}

3. Was zeichnet dich als Person aus?
→ ${questions.frage3}

Erstelle daraus einen maximal 4-zeiligen Text, der sich als „Über mich"-Abschnitt für einen Lebenslauf eignet. Kein Marketing-Sprech, sondern menschlich, bodenständig, ehrlich und sympathisch.

Der Text darf weder übertrieben noch generisch klingen, sondern soll authentisch zur Person passen. Du darfst kreativ sein – aber nicht unrealistisch.`;

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein erfahrener Karriereberater, der authentische und bodenständige Lebenslauftexte verfasst. Schreibe immer in der ersten Person und halte dich an das 4-Zeilen-Limit.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();

    console.log('Generated CV summary:', generatedText);

    return new Response(JSON.stringify({ 
      success: true,
      summary: generatedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-cv-summary function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});