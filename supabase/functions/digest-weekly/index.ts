import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API = "https://api.resend.com/emails";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Ausbildungsbasis <no-reply@ausbildungsbasis.de>";
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://app.ausbildungsbasis.de";

type NotifRow = {
  id: string;
  recipient_type: "profile" | "company";
  recipient_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Protect: optional cron header or secret
  // const AUTH = req.headers.get("x-cron-secret");
  // if (AUTH !== Deno.env.get("CRON_SECRET")) return new Response("Unauthorized", { status: 401 });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const since = new Date();
    since.setDate(since.getDate() - 7);

    console.log(`Starting weekly digest for period since: ${since.toISOString()}`);

    // 1) E-Mail-Empfänger ermitteln: Nutzer/Company-Admins mit aktivem Digest
    const { data: prefs, error: prefsErr } = await supabase
      .from("notification_prefs")
      .select("user_id, type, email")
      .eq("email", true)
      .in("type", ["weekly_digest_user", "weekly_digest_company"]);
    
    if (prefsErr) {
      console.error("Error fetching preferences:", prefsErr);
      return new Response(JSON.stringify({ error: prefsErr.message }), { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    const userIdsUser = new Set<string>();
    const userIdsCompany = new Set<string>();
    prefs?.forEach((p: any) => {
      if (p.type === "weekly_digest_user") userIdsUser.add(p.user_id);
      if (p.type === "weekly_digest_company") userIdsCompany.add(p.user_id);
    });

    console.log(`Found ${userIdsUser.size} user digest recipients and ${userIdsCompany.size} company digest recipients`);

    // 2) Mappe user_id -> profile/company context
    // Hol Profile (E-Mail) für weekly_digest_user
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", Array.from(userIdsUser));
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) ?? []);

    // Company-User (Admins) + Companies
    const { data: companyUsers } = await supabase
      .from("company_users")
      .select(`
        user_id,
        company_id,
        profiles!inner(email, display_name),
        companies!inner(name)
      `)
      .eq('role', 'admin')
      .in("user_id", Array.from(userIdsCompany));

    // 3) Notifications der letzten 7 Tage zusammenfassen
    const { data: recent } = await supabase
      .from("notifications")
      .select("id, recipient_type, recipient_id, type, title, body, payload, created_at")
      .gte("created_at", since.toISOString());

    const byRecipient = new Map<string, NotifRow[]>();
    (recent ?? []).forEach((n: any) => {
      const key = `${n.recipient_type}:${n.recipient_id}`;
      if (!byRecipient.has(key)) byRecipient.set(key, []);
      byRecipient.get(key)!.push(n);
    });

    console.log(`Found ${recent?.length || 0} notifications to digest`);

    // 4) E-Mails bauen & senden
    const emails: Array<Promise<Response>> = [];

    // 4a) User Digests
    for (const p of profiles ?? []) {
      const key = `profile:${p.id}`;
      const items = byRecipient.get(key) ?? [];
      const html = renderUserDigestHTML(p.display_name ?? "Hallo", items);
      if (!p.email) continue;

      emails.push(sendEmail(p.email, "Dein Wochenüberblick auf Ausbildungsbasis", html));
    }

    // 4b) Company Digests (an jeden Admin)
    for (const cu of companyUsers ?? []) {
      const key = `company:${cu.company_id}`;
      const items = byRecipient.get(key) ?? [];
      const recipientEmail = cu.profiles?.email;
      const companyName = cu.companies?.name ?? "Dein Unternehmen";
      if (!recipientEmail) continue;

      const html = renderCompanyDigestHTML(companyName, items);
      emails.push(sendEmail(recipientEmail, `Wochenüberblick: ${companyName}`, html));
    }

    const results = await Promise.allSettled(emails);
    const ok = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    console.log(`Digest complete: ${ok} sent, ${failed} failed`);

    return new Response(JSON.stringify({ sent: ok, failed, tried: results.length }), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in digest-weekly function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }
});

// --- Helpers ---

function esc(s?: string | null) {
  return (s ?? "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderList(items: NotifRow[]) {
  if (!items.length) return "<p style='color:#666'>Keine neuen Ereignisse in dieser Woche.</p>";
  return `
  <ul style="padding-left:16px;margin:8px 0 0">
    ${items.slice(0, 10).map(i => `<li style="margin:6px 0"><b>${esc(i.title)}</b><br><span style="color:#666;font-size:12px">${esc(i.body)}</span></li>`).join("")}
  </ul>
  `;
}

function wrapper(title: string, inner: string) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px">
    <h2 style="margin:0 0 8px">${esc(title)}</h2>
    <p style="margin:0 0 16px;color:#666">Zeitraum: letzte 7 Tage</p>
    ${inner}
    <hr style="margin:20px 0;border:none;border-top:1px solid #eee"/>
    <p style="font-size:12px;color:#999">Einstellungen ändern: <a href="${PUBLIC_SITE_URL}/settings/notifications">Benachrichtigungen</a></p>
  </div>`;
}

function renderUserDigestHTML(name: string, items: NotifRow[]) {
  // optional: filtern auf relevante Typen
  const list = renderList(items.filter(i =>
    ["company_unlocked_you", "follow_request_received", "post_interaction", "pipeline_move_for_you"].includes(i.type)
  ));
  return wrapper(`Hallo ${esc(name)}, das ist dein Wochenüberblick`, list);
}

function renderCompanyDigestHTML(company: string, items: NotifRow[]) {
  // optional: filtern auf Unternehmens-Typen
  const list = renderList(items.filter(i =>
    ["new_matches_available", "follow_accepted_chat_unlocked", "pipeline_activity_team", "low_tokens"].includes(i.type)
  ));
  return wrapper(`${esc(company)} – Wochenüberblick`, list);
}

async function sendEmail(to: string, subject: string, html: string) {
  console.log(`Sending email to: ${to}, subject: ${subject}`);
  
  return fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
}