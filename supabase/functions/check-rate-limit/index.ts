import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitRequest {
  action: string;
  limit: number; // max allowed within the window
  window_minutes: number; // window size in minutes
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE envs (URL/ANON/SERVICE_ROLE)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { action, limit, window_minutes }: RateLimitRequest = await req.json();

    if (!action || !limit || !window_minutes) {
      return new Response(
        JSON.stringify({ error: "Missing fields: action, limit, window_minutes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const windowMs = window_minutes * 60 * 1000;
    const windowStart = new Date(
      Math.floor(Date.now() / windowMs) * windowMs
    ).toISOString();

    // Check existing counter
    const { data: existing, error: selErr } = await admin
      .from("rate_limit_counters")
      .select("count")
      .eq("profile_id", user.id)
      .eq("action", action)
      .eq("window_start", windowStart)
      .maybeSingle();

    if (selErr && selErr.code !== "PGRST116") {
      // PGRST116 = no rows
      console.error("rate limit select error", selErr);
    }

    let newCount = 1;
    if (existing && typeof existing.count === "number") {
      newCount = existing.count + 1;
      const { error: updErr } = await admin
        .from("rate_limit_counters")
        .update({ count: newCount })
        .eq("profile_id", user.id)
        .eq("action", action)
        .eq("window_start", windowStart);

      if (updErr) {
        console.error("rate limit update error", updErr);
        return new Response(JSON.stringify({ error: "Update failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: insErr } = await admin.from("rate_limit_counters").insert({
        profile_id: user.id,
        action,
        window_start: windowStart,
        count: newCount,
      });
      if (insErr) {
        console.error("rate limit insert error", insErr);
        return new Response(JSON.stringify({ error: "Insert failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const allowed = newCount <= limit;
    const remaining = Math.max(0, limit - newCount);

    return new Response(
      JSON.stringify({ allowed, remaining, count: newCount, window_start: windowStart }),
      { status: allowed ? 200 : 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("check-rate-limit error", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
