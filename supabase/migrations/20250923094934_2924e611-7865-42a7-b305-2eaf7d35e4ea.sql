-- Create comprehensive social media system with post scheduling and company verification

-- Add missing columns to profiles (assuming we have a public.profiles table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS employer_text text,
  ADD COLUMN IF NOT EXISTS employer_slogan text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS is_admin boolean default false;

-- Ensure companies table exists with required columns
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS is_verified boolean not null default false;

-- Create unique constraint on slug if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_slug_key') THEN
    ALTER TABLE public.companies ADD CONSTRAINT companies_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Employment status enum
CREATE TYPE IF NOT EXISTS public.employment_status AS ENUM ('pending','approved','rejected');

-- Employment verifications table
CREATE TABLE IF NOT EXISTS public.employment_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  job_title text not null,
  status public.employment_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  UNIQUE (user_id, company_id)
);

-- Company team members table
CREATE TABLE IF NOT EXISTS public.company_team_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_title text,
  added_at timestamptz not null default now(),
  PRIMARY KEY (company_id, user_id)
);

-- Post status enum
CREATE TYPE IF NOT EXISTS public.post_status AS ENUM ('draft','scheduled','published','archived');

-- Enhanced posts table (extend existing community_posts or create new)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  content text not null,
  media jsonb default '[]'::jsonb,
  status public.post_status not null default 'published',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_status_sched ON public.posts (status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts (status, published_at DESC) WHERE status = 'published';

-- Trigger function to sync team members
CREATE OR REPLACE FUNCTION public.sync_company_team_members()
RETURNS trigger AS $$
BEGIN
  IF (NEW.status = 'approved') THEN
    INSERT INTO public.company_team_members (company_id, user_id, job_title)
    VALUES (NEW.company_id, NEW.user_id, NEW.job_title)
    ON CONFLICT (company_id, user_id) DO UPDATE
      SET job_title = EXCLUDED.job_title,
          added_at = now();
  ELSE
    DELETE FROM public.company_team_members
    WHERE company_id = NEW.company_id AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_sync_company_team ON public.employment_verifications;
CREATE TRIGGER trg_sync_company_team
  AFTER INSERT OR UPDATE OF status, job_title, company_id, user_id 
  ON public.employment_verifications
  FOR EACH ROW 
  EXECUTE FUNCTION public.sync_company_team_members();

-- Feed view with proper name and subline logic
CREATE OR REPLACE VIEW public.v_feed AS
SELECT
  p.*,
  pr.display_name,
  pr.avatar_url,
  -- Name subline logic: verified employment first, then profile settings
  COALESCE(
    CASE
      WHEN ev.status = 'approved' AND c.is_verified THEN 
        (ev.job_title || ' @ ' || c.name)
      ELSE NULL
    END,
    CASE
      WHEN pr.headline IS NOT NULL AND pr.employer_text IS NOT NULL THEN
        (pr.headline || ' @ ' || pr.employer_text)
      WHEN pr.headline IS NOT NULL THEN
        pr.headline
      ELSE NULL
    END
  ) AS name_subline,
  CASE
    WHEN ev.status = 'approved' AND c.is_verified THEN c.id
    ELSE NULL
  END AS employer_company_id,
  c.name AS employer_company_name,
  c.slug AS employer_company_slug
FROM public.posts p
JOIN public.profiles pr ON pr.id = p.author_id
LEFT JOIN public.employment_verifications ev ON ev.user_id = pr.id AND ev.status = 'approved'
LEFT JOIN public.companies c ON c.id = ev.company_id
WHERE p.status = 'published';

-- RPC function for name subline
CREATE OR REPLACE FUNCTION public.profile_name_subline(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    CASE
      WHEN ev.status = 'approved' AND c.is_verified THEN 
        (ev.job_title || ' @ ' || c.name)
      ELSE NULL
    END,
    CASE
      WHEN pr.headline IS NOT NULL AND pr.employer_text IS NOT NULL THEN
        (pr.headline || ' @ ' || pr.employer_text)
      WHEN pr.headline IS NOT NULL THEN
        pr.headline
      ELSE NULL
    END
  )
  FROM public.profiles pr
  LEFT JOIN public.employment_verifications ev ON ev.user_id = pr.id AND ev.status = 'approved'
  LEFT JOIN public.companies c ON c.id = ev.company_id
  WHERE pr.id = p_user_id;
$$;

-- RPC function to publish scheduled posts
CREATE OR REPLACE FUNCTION public.publish_due_posts()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_rows int;
BEGIN
  UPDATE public.posts
    SET status = 'published',
        published_at = now(),
        updated_at = now()
  WHERE status = 'scheduled'
    AND scheduled_at IS NOT NULL
    AND scheduled_at <= now();
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "companies_select_all" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "companies_modify_admin" ON public.companies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "companies_update_admin" ON public.companies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for employment verifications
CREATE POLICY "ev_select_all" ON public.employment_verifications
  FOR SELECT USING (true);

CREATE POLICY "ev_insert_self" ON public.employment_verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "ev_update_admin" ON public.employment_verifications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- RLS Policies for team members
CREATE POLICY "team_members_read" ON public.company_team_members
  FOR SELECT USING (true);

-- RLS Policies for posts
CREATE POLICY "posts_read_published" ON public.posts
  FOR SELECT USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "posts_insert_self" ON public.posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_update_self" ON public.posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "posts_delete_self" ON public.posts
  FOR DELETE USING (author_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "comments_read_all" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_self" ON public.post_comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_update_self" ON public.post_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "comments_delete_self" ON public.post_comments
  FOR DELETE USING (auth.uid() = author_id);