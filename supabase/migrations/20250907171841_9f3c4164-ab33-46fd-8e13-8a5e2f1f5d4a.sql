-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create job_posts table
CREATE TABLE IF NOT EXISTS job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description_md text,
  tasks_md text,
  requirements_md text,
  category text,
  work_mode text,
  employment text,
  duration_months int,
  hours_per_week_min int,
  hours_per_week_max int,
  country text,
  state text,
  city text,
  postal_code text,
  salary_currency char(3) DEFAULT 'EUR',
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  salary_interval text,
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS job_posts_slug_uidx ON job_posts(slug) WHERE slug IS NOT NULL;

-- Enable RLS on core tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

-- Basic helper function
CREATE OR REPLACE FUNCTION has_company_access(company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_users
    WHERE user_id = auth.uid()
    AND company_id = has_company_access.company_id
  );
$$;