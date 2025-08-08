-- 1) Enable PostGIS
create extension if not exists postgis;

-- 2) Canonical locations table
create table if not exists public.locations (
  id bigserial primary key,
  country_code text not null check (char_length(country_code) = 2),
  postal_code text not null,
  city text not null,
  state text,
  lat double precision not null,
  lon double precision not null,
  geog geography(Point, 4326) generated always as (ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) stored,
  unique (country_code, postal_code, city)
);

-- Indexes for fast geo and postal lookups
create index if not exists locations_geog_idx on public.locations using gist (geog);
create index if not exists locations_postal_idx on public.locations (country_code, postal_code);

-- 3) RLS: allow public read access (reference data), deny writes by default
alter table public.locations enable row level security;

-- Drop existing policies if rerun (idempotent safety)
do $$ begin
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'locations' and policyname = 'Locations are viewable by everyone'
  ) then
    drop policy "Locations are viewable by everyone" on public.locations;
  end if;
end $$;

create policy "Locations are viewable by everyone"
  on public.locations
  for select
  using (true);

-- 4) Link from profiles & companies to canonical locations (nullable for backward compatibility)
-- Companies
alter table public.companies
  add column if not exists location_id bigint references public.locations(id);
create index if not exists companies_location_id_idx on public.companies(location_id);

-- Profiles (users)
alter table public.profiles
  add column if not exists location_id bigint references public.locations(id);
create index if not exists profiles_location_id_idx on public.profiles(location_id);

-- 5) RPCs for proximity matching (use RLS of underlying tables)
-- Users near a company within X km
create or replace function public.get_users_near_company(p_company_id uuid, p_radius_km numeric)
returns setof public.profiles
language sql
stable
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

-- Generic: users near a given location id
create or replace function public.get_users_near_location(p_loc_id bigint, p_radius_km numeric)
returns table(profile_id uuid, distance_km numeric)
language sql
stable
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