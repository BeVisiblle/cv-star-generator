import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type TranscribeResult = {
  text: string;
  language: string;
  durationSec?: number;
  confidence?: number;
};

type NormalizeOptions = {
  targetLang?: string;
  applyGlossary?: boolean;
  glossaryDomain?: "shk" | "elektro" | "pflege" | "logistik" | "general";
};

type PipelineOutput = {
  original: { text: string; language: string };
  translated: { text: string; language: string };
  normalized: { text: string; notes: string[] };
  meta: {
    durationSec?: number;
    confidence?: number;
    glossaryDomain: string;
    engine: { asr: string; nlp: string; translate: string };
  };
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const TRANSLATE_MODEL = Deno.env.get("TRANSLATE_MODEL") ?? "gpt-4o-mini";
const NORMALIZE_MODEL = Deno.env.get("NORMALIZE_MODEL") ?? "gpt-4o-mini";
const ASR_MODEL = Deno.env.get("ASR_MODEL") ?? "whisper-1";

const GLOSSARIES: Record<string, Record<string, string>> = {
  general: {},
  shk: {
    "heizungsbauer": "Anlagenmechaniker/in SHK",
    "anlagenmechaniker": "Anlagenmechaniker/in SHK",
    "sanitär": "Sanitär",
    "klima": "Klimatechnik",
    "heizung": "Heizungstechnik",
    "kundendienst": "Kundendiensttechniker/in",
  },
  elektro: {
    "elektriker": "Elektroniker/in",
    "hausinstallation": "Gebäudetechnik",
    "sicherungskasten": "Unterverteilung",
    "messgerät": "Mess- und Prüfgerät",
  },
  pflege: {
    "altenpfleger": "Pflegefachkraft",
    "station": "Pflegestation",
    "beatmung": "Beatmungspflege",
  },
  logistik: {
    "stapler": "Gabelstapler",
    "kommissionieren": "Kommissionierung",
    "schicht": "Schichtarbeit",
  },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function transcribeWithWhisper(file: File): Promise<TranscribeResult> {
  const form = new FormData();
  form.append("file", file, file.name || "audio.webm");
  form.append("model", ASR_MODEL);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`ASR failed: ${res.status} ${msg}`);
  }
  
  const data = await res.json();
  return {
    text: data.text ?? "",
    language: data.language ?? "",
    durationSec: data.duration ?? undefined,
    confidence: data.confidence ?? undefined,
  };
}

async function translateIfNeeded(
  inputText: string,
  detectedLangHint: string | undefined,
  targetLang = "de"
): Promise<{ text: string; srcLang: string }> {
  const system = [
    { role: "system", content: "You are a precise language detector and translator. Respond in strict JSON." },
  ];
  const user = [
    {
      role: "user",
      content: `Detect the language of the text and translate to '${targetLang}' if it's not already '${targetLang}'.
Return JSON: { "srcLang": "xx", "text": "..." }
Text: """${inputText}"""`,
    },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TRANSLATE_MODEL,
      temperature: 0,
      messages: [...system, ...user],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Translate failed: ${res.status} ${msg}`);
  }
  
  const data = await res.json();
  const json = JSON.parse(data.choices[0].message.content);
  return { text: json.text, srcLang: json.srcLang || detectedLangHint || "und" };
}

async function normalizeText(
  text: string,
  opts: NormalizeOptions
): Promise<{ text: string; notes: string[] }> {
  const glossary = GLOSSARIES[opts.glossaryDomain ?? "general"] ?? {};
  const glossaryList = Object.entries(glossary)
    .map(([k, v]) => `${k} -> ${v}`)
    .join("\n");

  const system = [
    {
      role: "system",
      content:
        "Du bist ein präziser Normalizer für Bewerbungs-Deutsch. Du wandelst Dialekt, Umgangssprache und Füllwörter in klare, kurze Sätze in Hochdeutsch um. Du änderst keine Fakten.",
    },
  ];
  const user = [
    {
      role: "user",
      content: `
Ziel-Sprache: ${opts.targetLang ?? "de"}
Aufgaben:
1) Dialekt/Umgangssprache glätten, Grammatik korrigieren, CV-tauglich machen.
2) Füllwörter entfernen, klare Hauptsätze.
3) Fachglossar anwenden (falls sinnvoll):
${glossaryList || "(kein Glossar)"}

Gib mir nur JSON:
{
  "text": "<bereinigter Text>",
  "notes": ["kurze Hinweise, was geändert wurde"]
}

Original:
"""${text}"""`,
    },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NORMALIZE_MODEL,
      temperature: 0,
      messages: [...system, ...user],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Normalize failed: ${res.status} ${msg}`);
  }
  
  const data = await res.json();
  const json = JSON.parse(data.choices[0].message.content);
  return { text: json.text, notes: json.notes ?? [] };
}

function preClean(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/\bähm?\b/gi, "")
    .replace(/\bsozusagen\b/gi, "")
    .replace(/\bhalt\b/gi, "")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Use POST multipart/form-data", { status: 405, headers: corsHeaders });
    }

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return new Response("Expect multipart/form-data with 'audio' file", { status: 400, headers: corsHeaders });
    }

    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) {
      return new Response("Missing 'audio' file", { status: 400, headers: corsHeaders });
    }

    const targetLang = (form.get("targetLang") as string) || "de";
    const glossaryDomain = (form.get("glossaryDomain") as NormalizeOptions["glossaryDomain"]) ?? "general";
    const applyGlossary = (form.get("applyGlossary") as string) !== "false";

    console.log(`Transcribing audio file: ${file.name}, size: ${file.size} bytes`);

    const asr = await transcribeWithWhisper(file);
    console.log(`Transcription complete. Language: ${asr.language}, Length: ${asr.text.length} chars`);

    const pre = preClean(asr.text);
    const translated = await translateIfNeeded(pre, asr.language, targetLang);
    console.log(`Translation complete. Source: ${translated.srcLang}, Target: ${targetLang}`);

    const normalized = await normalizeText(translated.text, {
      targetLang,
      applyGlossary,
      glossaryDomain,
    });
    console.log(`Normalization complete. Notes: ${normalized.notes.length}`);

    const out: PipelineOutput = {
      original: { text: pre, language: translated.srcLang || asr.language || "und" },
      translated: { text: translated.text, language: targetLang },
      normalized,
      meta: {
        durationSec: asr.durationSec,
        confidence: asr.confidence,
        glossaryDomain,
        engine: { asr: ASR_MODEL, nlp: NORMALIZE_MODEL, translate: TRANSLATE_MODEL },
      },
    };

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "content-type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error in transcribe-and-normalize:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
      status: 500,
    });
  }
});
