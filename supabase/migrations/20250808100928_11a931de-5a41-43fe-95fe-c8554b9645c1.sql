-- Move PostGIS extension to extensions schema to satisfy linter
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
-- If postgis already exists in public, move it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'postgis' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION postgis SET SCHEMA extensions;
  END IF;
END$$;

-- Ensure RLS remains enabled on locations
alter table if exists public.locations enable row level security;

-- Recreate functions with immutable search_path and default security invoker
create or replace function public.get_users_near_company(p_company_id uuid, p_radius_km numeric)
returns setof public.profiles
language sql
stable
set search_path = ''
as $$
  select p.*
  from public.profiles p
  join public.locations pl on pl.id = p.location_id
  join public.companies c on c.id = p_company_id
  join public.locations cl on cl.id = c.location_id
  where p.location_id is not null
    and c.location_id is not null
    and ST_DWithin(pl.geog, cl.geog, (p_radius_km * 1000)::double precision)
  order by ST_Distance(pl.geog, cl.geog) asc;
$$;

create or replace function public.get_users_near_location(p_loc_id bigint, p_radius_km numeric)
returns table(profile_id uuid, distance_km numeric)
language sql
stable
set search_path = ''
as $$
  select p.id as profile_id,
         ST_Distance(pl.geog, l.geog) / 1000 as distance_km
  from public.profiles p
  join public.locations pl on pl.id = p.location_id
  join public.locations l  on l.id = p_loc_id
  where p.location_id is not null
    and ST_DWithin(pl.geog, l.geog, (p_radius_km * 1000)::double precision)
  order by distance_km asc;
$$;