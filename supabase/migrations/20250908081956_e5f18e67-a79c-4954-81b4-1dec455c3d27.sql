-- Fix RLS issues for missing tables
ALTER TABLE geography_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE geometry_columns ENABLE ROW LEVEL SECURITY;

-- Create public read policies for geography/geometry columns (read-only system tables)
CREATE POLICY "Public can read geography columns" ON geography_columns FOR SELECT USING (true);
CREATE POLICY "Public can read geometry columns" ON geometry_columns FOR SELECT USING (true);

-- Fix the ensure_job_slug function to use proper search path
CREATE OR REPLACE FUNCTION ensure_job_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(
        regexp_replace(NEW.title, '[äöüß]', 'ae-oe-ue-ss', 'g'),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )) || '-' || substring(NEW.id::text from 1 for 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;