-- Update functions to set a fixed search_path for security
CREATE OR REPLACE FUNCTION public.coords_for_plz(plz_input text)
RETURNS TABLE(city text, lat double precision, lon double precision)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT l.city, l.lat, l.lon
  FROM public.locations l
  WHERE l.postal_code = plz_input
  ORDER BY l.city ASC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.search_companies_within_radius(
  lat_input double precision,
  lon_input double precision,
  radius_km double precision
)
RETURNS TABLE(
  company_id uuid,
  name text,
  city text,
  postal_code text,
  distance_km double precision
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH origin AS (
    SELECT ST_SetSRID(ST_MakePoint(lon_input, lat_input), 4326)::geography AS g
  )
  SELECT c.id AS company_id,
         c.name,
         l.city,
         l.postal_code,
         ST_Distance(l.geog, (SELECT g FROM origin)) / 1000.0 AS distance_km
  FROM public.companies c
  JOIN public.locations l ON c.location_id = l.id
  WHERE ST_DWithin(l.geog, (SELECT g FROM origin), radius_km * 1000.0)
  ORDER BY distance_km ASC;
$$;

CREATE OR REPLACE FUNCTION public.search_candidates_within_radius(
  lat_input double precision,
  lon_input double precision,
  radius_km double precision
)
RETURNS TABLE(
  profile_id uuid,
  city text,
  postal_code text,
  distance_km double precision
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH origin AS (
    SELECT ST_SetSRID(ST_MakePoint(lon_input, lat_input), 4326)::geography AS g
  )
  SELECT p.id AS profile_id,
         l.city,
         l.postal_code,
         ST_Distance(l.geog, (SELECT g FROM origin)) / 1000.0 AS distance_km
  FROM public.profiles p
  JOIN public.locations l ON p.location_id = l.id
  WHERE ST_DWithin(l.geog, (SELECT g FROM origin), radius_km * 1000.0)
  ORDER BY distance_km ASC;
$$;