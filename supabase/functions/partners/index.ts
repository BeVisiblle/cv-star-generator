import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Partner = { id: string; name: string; logoUrl?: string; url?: string };

const samplePartners: Partner[] = [
  { id: "acme", name: "ACME AG", logoUrl: "https://dummyimage.com/160x48/ddd/222&text=ACME", url: "https://acme.de" },
  { id: "beta", name: "Beta GmbH", logoUrl: "https://dummyimage.com/160x48/ddd/222&text=Beta", url: "https://beta.de" },
  { id: "gamma", name: "Gamma SE", logoUrl: "https://dummyimage.com/160x48/ddd/222&text=Gamma", url: "https://gamma.example" },
  { id: "delta", name: "Delta KG", logoUrl: "https://dummyimage.com/160x48/ddd/222&text=Delta" },
  { id: "epsilon", name: "Epsilon", logoUrl: "https://dummyimage.com/160x48/ddd/222&text=Epsilon" },
  { id: "zeta", name: "Zeta Group", logoUrl: "https://dummyimage.com/160x48/ddd/222&text=Zeta" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let audience = "generic";
    if (req.method === "GET") {
      const url = new URL(req.url);
      audience = url.searchParams.get("audience") ?? "generic";
    } else {
      try {
        const body = await req.json();
        audience = body?.audience ?? "generic";
      } catch (_) {}
    }

    // For now, return the same list regardless of audience; could filter in future
    const partners = samplePartners;

    return new Response(JSON.stringify({ partners, audience }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("partners function error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
