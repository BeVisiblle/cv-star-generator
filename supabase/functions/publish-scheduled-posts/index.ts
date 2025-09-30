import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const nowIso = new Date().toISOString();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: extra protection for public endpoints
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret) {
      const hdr = req.headers.get("x-cron-secret");
      if (hdr !== cronSecret) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await admin
      .from("community_posts")
      .update({ 
        status: "published", 
        created_at: nowIso // Update created_at for proper feed ordering
      })
      .eq("status", "scheduled")
      .lte("scheduled_at", nowIso)
      .select("id");

    if (error) {
      console.error("publish-scheduled-posts error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publishedCount = data?.length ?? 0;
    console.log(`Published ${publishedCount} scheduled posts`);

    // Realtime broadcast will occur via DB changes subscription on the client side.
    // Additional notifications can be added here in future iterations.

    return new Response(JSON.stringify({ published: publishedCount, ids: data?.map((d:any)=>d.id) || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("publish-scheduled-posts fatal", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
