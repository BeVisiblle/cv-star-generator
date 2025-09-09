-- Quick Migration für Job-Posting-System
-- Kopiere diesen Code in den Supabase SQL Editor

-- 1. Analytics System
CREATE TABLE IF NOT EXISTS public.job_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  total_applications INTEGER DEFAULT 0,
  new_applications INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_post_id, date, period)
);

-- 2. Preview System
CREATE TABLE IF NOT EXISTS public.job_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  preview_token TEXT NOT NULL UNIQUE,
  viewer_role TEXT NOT NULL CHECK (viewer_role IN ('user', 'company', 'admin')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  view_count INTEGER DEFAULT 0
);

-- 3. Bookmarks
CREATE TABLE IF NOT EXISTS public.job_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(job_post_id, user_id)
);

-- 4. RPC Functions
CREATE OR REPLACE FUNCTION public.get_company_job_stats(p_company_id UUID)
RETURNS TABLE (
  total_jobs BIGINT,
  published_jobs BIGINT,
  draft_jobs BIGINT,
  total_views BIGINT,
  total_applications BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN is_public = true AND is_active = true THEN 1 END) as published_jobs,
    COUNT(CASE WHEN is_draft = true THEN 1 END) as draft_jobs,
    COALESCE(SUM(view_count), 0) as total_views,
    COALESCE(SUM(application_count), 0) as total_applications
  FROM public.job_posts
  WHERE company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Enable RLS
ALTER TABLE public.job_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bookmarks ENABLE ROW LEVEL SECURITY;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_company_job_stats TO authenticated;

-- 7. Test
SELECT 'Migration erfolgreich!' as status;
