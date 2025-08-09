import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

function toArray(v: string | string[]) {
  return Array.isArray(v) ? v : [v];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const domain = Deno.env.get("MAILGUN_DOMAIN");
    const apiKey = Deno.env.get("MAILGUN_KEY");
    const from = Deno.env.get("MAILGUN_FROM");

    if (!domain || !apiKey || !from) {
      return new Response(
        JSON.stringify({ error: "Missing MAILGUN_DOMAIN/MAILGUN_KEY/MAILGUN_FROM" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, html, text }: EmailRequest = await req.json();

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: "Missing fields: to, subject, and html or text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipients = toArray(to);

    const params = new URLSearchParams();
    params.append("from", from);
    for (const rcpt of recipients) params.append("to", rcpt);
    params.append("subject", subject);
    if (html) params.append("html", html);
    if (text) params.append("text", text);

    const auth = "Basic " + btoa(`api:${apiKey}`);
    const resp = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: { "Authorization": auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const body = await resp.text();

    return new Response(body, {
      status: resp.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-email-notification error", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
