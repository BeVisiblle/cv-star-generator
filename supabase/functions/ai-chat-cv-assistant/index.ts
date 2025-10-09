import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatCVInput {
  message: string;
  conversationHistory?: ChatMessage[];
  currentData?: Record<string, any>;
}

interface ChatCVOutput {
  nextQuestion: string | null;
  extractedData: Record<string, any>;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
  isComplete: boolean;
}

const QUESTION_FLOW = [
  { id: 'status', field: 'status', question: 'Bist du gerade Schüler, Azubi oder ausgelernt?' },
  { id: 'branche', field: 'branche', question: 'In welcher Branche möchtest du arbeiten?' },
  { id: 'name', field: 'vorname', question: 'Wie heißt du? (Vor- und Nachname)' },
  { id: 'email', field: 'email', question: 'Wie lautet deine E-Mail-Adresse?' },
  { id: 'phone', field: 'phone', question: 'Deine Telefonnummer? (optional)', optional: true },
  { id: 'birth', field: 'geburtsdatum', question: 'Wann bist du geboren? (TT.MM.JJJJ)' },
  { id: 'nationality', field: 'nationalitaet', question: 'Welche Staatsangehörigkeit hast du?', optional: true },
  { id: 'education', field: 'schulbildung', question: 'Erzähl mir über deine Schulbildung.' },
  { id: 'experience', field: 'berufserfahrung', question: 'Hast du schon Berufserfahrung? (Praktika, Jobs, etc.)', optional: true },
  { id: 'skills', field: 'skills', question: 'Welche besonderen Fähigkeiten oder Qualifikationen hast du?', optional: true },
  { id: 'languages', field: 'sprachen', question: 'Welche Sprachen sprichst du?', optional: true },
];

function determineNextField(currentData: Record<string, any>): typeof QUESTION_FLOW[0] | null {
  for (const q of QUESTION_FLOW) {
    if (!currentData[q.field] || currentData[q.field] === '') {
      return q;
    }
  }
  return null;
}

function calculateCompletion(currentData: Record<string, any>): number {
  const requiredFields = QUESTION_FLOW.filter(q => !q.optional);
  const filledRequired = requiredFields.filter(q => currentData[q.field] && currentData[q.field] !== '').length;
  return Math.round((filledRequired / requiredFields.length) * 100);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== AI Chat CV Assistant - Start (v2) ===');
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('ERROR: LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: LOVABLE_API_KEY missing',
        details: 'Please configure LOVABLE_API_KEY in Supabase secrets'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      });
    }

    const { message, conversationHistory = [], currentData = {} }: ChatCVInput = await req.json();

    if (!message) {
      console.error('ERROR: No message provided');
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      });
    }

    console.log('Processing message:', message.substring(0, 100));
    console.log('Current data keys:', Object.keys(currentData));

    const nextField = determineNextField(currentData);
    
    const tools = [{
      type: 'function',
      function: {
        name: 'extract_answer',
        description: 'Extract structured answer from user message',
        parameters: {
          type: 'object',
          properties: {
            field: { type: 'string', description: 'Field name being answered' },
            value: { type: 'string', description: 'Extracted value' },
            additionalData: { 
              type: 'object', 
              description: 'Any additional data mentioned',
              additionalProperties: true
            }
          },
          required: ['field', 'value']
        }
      }
    }];

    const systemPrompt = `Du bist ein freundlicher CV-Assistent. Du führst ein strukturiertes Gespräch um einen Lebenslauf zu erstellen.

Aktuelle Frage: ${nextField ? nextField.question : 'Alle Informationen gesammelt'}
Bereits gesammelte Daten: ${JSON.stringify(currentData)}

WICHTIG - Verwende EXAKT diese Feldnamen:
- status (für Schüler/Azubi/Ausgelernt)
- branche (für Branche/Berufsfeld)
- vorname (für Vorname)
- nachname (für Nachname)  
- email (für E-Mail)
- phone (für Telefon)
- geburtsdatum (für Geburtsdatum)
- nationalitaet (für Staatsangehörigkeit)
- schulbildung (für Schulbildung)
- berufserfahrung (für Berufserfahrung)
- skills (für Fähigkeiten)
- sprachen (für Sprachen)

Aufgaben:
1. Extrahiere die Antwort strukturiert mit dem EXAKTEN Feldnamen von oben
2. Sei präzise aber freundlich
3. Bei unklaren Antworten: frage nach
4. Erkenne auch implizite Informationen (z.B. "Ich bin 17" → geburtsjahr berechnen)`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools,
        tool_choice: { type: 'function', function: { name: 'extract_answer' } }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again in a moment.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        });
      }
      
      throw new Error(`AI API failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Response received');
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error('No tool call in response:', JSON.stringify(data, null, 2));
      throw new Error('AI did not return structured data');
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log('Extracted answer:', extracted);

    const updatedData = { 
      ...currentData, 
      [extracted.field]: extracted.value,
      ...extracted.additionalData
    };

    const nextQuestion = determineNextField(updatedData);
    const completion = calculateCompletion(updatedData);

    const output: ChatCVOutput = {
      nextQuestion: nextQuestion ? nextQuestion.question : null,
      extractedData: updatedData,
      confidence: {
        overall: completion,
        fields: Object.fromEntries(
          Object.keys(updatedData).map(k => [k, updatedData[k] ? 85 : 0])
        )
      },
      isComplete: completion === 100
    };

    console.log('✅ Chat step complete. Completion:', completion);
    console.log('=== AI Chat CV Assistant - Success ===');

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 200
    });

  } catch (err) {
    console.error('❌ ERROR in ai-chat-cv-assistant:', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
    
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : String(err),
      type: 'chat_cv_error',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 500
    });
  }
});
