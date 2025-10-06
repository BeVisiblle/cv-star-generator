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
    const { 
      branche, 
      status, 
      faehigkeiten = [], 
      schulbildung = [],
      berufserfahrung = [],
      motivation,
      kenntnisse,
      geburtsdatum
    } = await req.json();
    
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

    const statusNames: Record<string, string> = {
      schueler: 'Schüler/in',
      azubi: 'Auszubildende/r',
      ausgelernt: 'Ausgelernte Fachkraft'
    };

    // Calculate age if birthdate provided
    let ageText = '';
    if (geburtsdatum) {
      const today = new Date();
      const birthDate = new Date(geburtsdatum);
      const age = today.getFullYear() - birthDate.getFullYear();
      ageText = `Alter: ${age} Jahre\n`;
    }

    const educationContext = schulbildung.length > 0 
      ? `\nSchulbildung: ${schulbildung.map((s: any) => `${s.schulform} ${s.name ? 'an ' + s.name : ''}`).join(', ')}` 
      : '';
    
    const workContext = berufserfahrung.length > 0 
      ? `\nBerufserfahrung: ${berufserfahrung.map((w: any) => w.titel).join(', ')}` 
      : '';

    const skillsContext = faehigkeiten.length > 0 
      ? `\nFähigkeiten: ${faehigkeiten.join(', ')}` 
      : '';

    const motivationContext = motivation 
      ? `\nMotivation: ${motivation}` 
      : '';

    const kenntnisseContext = kenntnisse 
      ? `\nKenntnisse/Interessen: ${kenntnisse}` 
      : '';

    const prompt = `Erstelle einen professionellen "Über mich"-Text für einen Lebenslauf mit folgenden Informationen:

${ageText}Branche: ${brancheNames[branche] || branche}
Status: ${statusNames[status] || status}${educationContext}${workContext}${skillsContext}${motivationContext}${kenntnisseContext}

Anforderungen:
- Schreibe in der Ich-Form
- Authentisch und persönlich, aber professionell
- 4-6 Sätze (ca. 100-150 Wörter)
- Betone Stärken, Motivation und Ziele
- Verbinde bisherige Erfahrungen mit zukünftigen Zielen
- Keine Übertreibungen, realistisch bleiben
- Direkt den Text zurückgeben, keine Anführungszeichen oder Formatierung`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist ein professioneller Karriereberater und erstellst authentische, persönliche Lebenslauf-Texte.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Zu viele Anfragen. Bitte versuche es in ein paar Sekunden erneut.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'KI-Guthaben aufgebraucht. Bitte lade dein Konto auf.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'KI-Service momentan nicht verfügbar' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aboutMeText = data.choices?.[0]?.message?.content;
    
    if (!aboutMeText) {
      throw new Error('No content generated');
    }

    // Clean up the text (remove quotes if present)
    const cleanedText = aboutMeText.replace(/^["']|["']$/g, '').trim();

    return new Response(
      JSON.stringify({ aboutMe: cleanedText, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Ein unerwarteter Fehler ist aufgetreten' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
