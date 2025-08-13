// Seed German locations into public.locations using postal_codes + external CSV for lat/lon
// Security: requires header x-seed-token to match SEED_LOCATIONS_TOKEN secret
// One-time use. You can run multiple times; it will upsert and skip existing.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-seed-token',
};

const DEFAULT_CSV = 'https://raw.githubusercontent.com/WZBSocialScienceCenter/plz_geocoord/master/plz_geocoord.csv';

function parseCsv(text: string): Map<string, { lat: number; lon: number }> {
  const map = new Map<string, { lat: number; lon: number }>();
  const lines = text.trim().split(/\r?\n/);
  // Expect header like ",lat,lng" then rows "01067,51.05,13.71"
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 3) continue;
    const plz = parts[0].replace(/"/g, '').trim();
    const lat = Number(parts[1]);
    const lon = Number(parts[2]);
    if (!/^[0-9]{5}$/.test(plz)) continue;
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      map.set(plz, { lat, lon });
    }
  }
  return map;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, country_code = 'DE', dry_run = false, limit = 0 } = await req.json().catch(() => ({}));

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ANON = Deno.env.get('SUPABASE_ANON_KEY');
    const key = SERVICE_ROLE || ANON;
    if (!SUPABASE_URL || !key || !ANON) throw new Error('Missing Supabase URL or API key');

    // Authorization: allow either seed token or admin/editor JWT
    let authorized = false;
    const seedToken = req.headers.get('x-seed-token');
    const expected = Deno.env.get('SEED_LOCATIONS_TOKEN');
    if (expected && seedToken === expected) {
      authorized = true;
    } else {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        try {
          const supabaseUser = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
          const { data: { user } } = await supabaseUser.auth.getUser();
          if (user) {
            const { data: rolesData } = await supabaseUser.from('user_roles').select('role').eq('user_id', user.id);
            const roles = (rolesData || []).map((r: any) => String(r.role).toLowerCase());
            if (roles.includes('admin') || roles.includes('superadmin') || roles.includes('editor') || roles.includes('contenteditor') || roles.includes('support') || roles.includes('supportagent')) {
              authorized = true;
            }
          }
        } catch (_e) {
          // ignore, will fall through to unauthorized
        }
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabase = createClient(SUPABASE_URL, key);

    // Download CSV once
    const csvUrl = url || DEFAULT_CSV;
    const resp = await fetch(csvUrl);
    if (!resp.ok) throw new Error(`Failed to download CSV: ${resp.status}`);
    const text = await resp.text();
    const coordByPlz = parseCsv(text);

    // Page through postal_codes
    const pageSize = 1000;
    let offset = 0;
    let totalProcessed = 0;
    let matched = 0;
    let skipped = 0;

    while (true) {
      const { data: rows, error } = await supabase
        .from('postal_codes')
        .select('plz, ort, bundesland')
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      if (!rows || rows.length === 0) break;

      // Process in chunks with limited concurrency
      const chunkTasks: Promise<void>[] = [];
      for (const r of rows as any[]) {
        if (limit && totalProcessed >= limit) break;
        totalProcessed++;
        const plz = String(r.plz);
        const ort = String(r.ort);
        const state = r.bundesland ? String(r.bundesland) : '';
        const coord = coordByPlz.get(plz);
        if (!coord) { skipped++; continue; }
        matched++;
        if (dry_run) continue;
        const task = supabase.rpc('upsert_location_with_coords', {
          p_postal_code: plz,
          p_city: ort,
          p_state: state,
          p_country_code: country_code,
          p_lat: coord.lat,
          p_lon: coord.lon,
        }).then(({ error: rpcErr }) => {
          if (rpcErr) console.warn('upsert_location_with_coords error', plz, ort, rpcErr.message);
        });
        chunkTasks.push(task.then(() => undefined));
        if (chunkTasks.length >= 50) {
          await Promise.all(chunkTasks.splice(0, chunkTasks.length));
        }
      }
      if (chunkTasks.length) await Promise.all(chunkTasks);

      if (limit && totalProcessed >= limit) break;
      offset += pageSize;
    }

    return new Response(
      JSON.stringify({ ok: true, totalProcessed, matched, skipped, dry_run }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e) {
    console.error('seed-locations-de error', e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});