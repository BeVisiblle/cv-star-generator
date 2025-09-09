-- Job RPC Functions
-- This migration adds all the RPC functions needed for the job posting system

-- Function to get job statistics for a company
CREATE OR REPLACE FUNCTION public.get_company_job_stats(p_company_id UUID)
RETURNS TABLE (
  total_jobs BIGINT,
  published_jobs BIGINT,
  draft_jobs BIGINT,
  total_views BIGINT,
  total_applications BIGINT,
  avg_views_per_job DECIMAL,
  avg_applications_per_job DECIMAL,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN is_public = true AND is_active = true THEN 1 END) as published_jobs,
    COUNT(CASE WHEN is_draft = true THEN 1 END) as draft_jobs,
    COALESCE(SUM(view_count), 0) as total_views,
    COALESCE(SUM(application_count), 0) as total_applications,
    ROUND(AVG(view_count), 2) as avg_views_per_job,
    ROUND(AVG(application_count), 2) as avg_applications_per_job,
    CASE 
      WHEN SUM(view_count) > 0 THEN 
        ROUND((SUM(application_count)::DECIMAL / SUM(view_count) * 100), 2)
      ELSE 0 
    END as conversion_rate
  FROM public.job_posts
  WHERE company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get job applications with details
CREATE OR REPLACE FUNCTION public.get_job_applications(
  p_job_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  application_id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  applied_at TIMESTAMPTZ,
  status TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  viewed_by_company BOOLEAN,
  viewed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as application_id,
    a.user_id,
    p.first_name || ' ' || p.last_name as user_name,
    au.email as user_email,
    a.applied_at,
    a.status,
    a.cover_letter,
    a.resume_url,
    a.viewed_by_company,
    a.viewed_at
  FROM public.applications a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  LEFT JOIN auth.users au ON au.id = a.user_id
  WHERE a.job_post_id = p_job_id
    AND (p_status IS NULL OR a.status = p_status)
  ORDER BY a.applied_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to update application status
CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.applications 
  SET 
    status = p_status,
    company_notes = p_notes,
    rejection_reason = p_rejection_reason,
    status_updated_at = now(),
    status_updated_by = auth.uid()
  WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark application as viewed
CREATE OR REPLACE FUNCTION public.mark_application_viewed(p_application_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.applications 
  SET 
    viewed_by_company = true,
    viewed_at = now(),
    viewed_by_user_id = auth.uid()
  WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get job posting limits for a company
CREATE OR REPLACE FUNCTION public.get_job_posting_limits(p_company_id UUID)
RETURNS TABLE (
  max_jobs INTEGER,
  current_jobs INTEGER,
  remaining_jobs INTEGER,
  max_featured_jobs INTEGER,
  current_featured_jobs INTEGER,
  remaining_featured_jobs INTEGER,
  can_post_job BOOLEAN,
  can_feature_job BOOLEAN
) AS $$
DECLARE
  company_record RECORD;
  current_jobs_count INTEGER;
  current_featured_count INTEGER;
BEGIN
  -- Get company details
  SELECT * INTO company_record FROM public.companies WHERE id = p_company_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company not found';
  END IF;
  
  -- Count current jobs
  SELECT COUNT(*) INTO current_jobs_count 
  FROM public.job_posts 
  WHERE company_id = p_company_id AND is_public = true;
  
  -- Count current featured jobs
  SELECT COUNT(*) INTO current_featured_count 
  FROM public.job_posts 
  WHERE company_id = p_company_id AND is_featured = true AND is_public = true;
  
  -- Calculate limits based on company plan
  RETURN QUERY
  SELECT 
    CASE company_record.plan_type
      WHEN 'free' THEN 3
      WHEN 'basic' THEN 10
      WHEN 'premium' THEN 50
      WHEN 'enterprise' THEN 999999
      ELSE 3
    END as max_jobs,
    current_jobs_count as current_jobs,
    GREATEST(0, 
      CASE company_record.plan_type
        WHEN 'free' THEN 3
        WHEN 'basic' THEN 10
        WHEN 'premium' THEN 50
        WHEN 'enterprise' THEN 999999
        ELSE 3
      END - current_jobs_count
    ) as remaining_jobs,
    CASE company_record.plan_type
      WHEN 'free' THEN 0
      WHEN 'basic' THEN 2
      WHEN 'premium' THEN 10
      WHEN 'enterprise' THEN 999999
      ELSE 0
    END as max_featured_jobs,
    current_featured_count as current_featured_jobs,
    GREATEST(0, 
      CASE company_record.plan_type
        WHEN 'free' THEN 0
        WHEN 'basic' THEN 2
        WHEN 'premium' THEN 10
        WHEN 'enterprise' THEN 999999
        ELSE 0
      END - current_featured_count
    ) as remaining_featured_jobs,
    (current_jobs_count < 
      CASE company_record.plan_type
        WHEN 'free' THEN 3
        WHEN 'basic' THEN 10
        WHEN 'premium' THEN 50
        WHEN 'enterprise' THEN 999999
        ELSE 3
      END
    ) as can_post_job,
    (current_featured_count < 
      CASE company_record.plan_type
        WHEN 'free' THEN 0
        WHEN 'basic' THEN 2
        WHEN 'premium' THEN 10
        WHEN 'enterprise' THEN 999999
        ELSE 0
      END
    ) as can_feature_job;
END;
$$ LANGUAGE plpgsql;

-- Function to publish job with token validation
CREATE OR REPLACE FUNCTION public.publish_job_with_tokens(
  p_job_id UUID,
  p_featured BOOLEAN DEFAULT false
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  remaining_tokens INTEGER
) AS $$
DECLARE
  job_record RECORD;
  company_record RECORD;
  limits_record RECORD;
  tokens_needed INTEGER := 1;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM public.job_posts WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Job not found', 0;
    RETURN;
  END IF;
  
  -- Get company details
  SELECT * INTO company_record FROM public.companies WHERE id = job_record.company_id;
  
  -- Get posting limits
  SELECT * INTO limits_record FROM public.get_job_posting_limits(job_record.company_id);
  
  -- Check if company can post jobs
  IF NOT limits_record.can_post_job THEN
    RETURN QUERY SELECT false, 'Job posting limit reached', limits_record.remaining_jobs;
    RETURN;
  END IF;
  
  -- Check featured job limits if trying to feature
  IF p_featured AND NOT limits_record.can_feature_job THEN
    RETURN QUERY SELECT false, 'Featured job limit reached', limits_record.remaining_featured_jobs;
    RETURN;
  END IF;
  
  -- Calculate tokens needed
  IF p_featured THEN
    tokens_needed := 2; -- Featured jobs cost 2 tokens
  END IF;
  
  -- Check if company has enough tokens
  IF company_record.token_balance < tokens_needed THEN
    RETURN QUERY SELECT false, 'Insufficient tokens', company_record.token_balance;
    RETURN;
  END IF;
  
  -- Deduct tokens
  UPDATE public.companies 
  SET token_balance = token_balance - tokens_needed
  WHERE id = job_record.company_id;
  
  -- Publish the job
  UPDATE public.job_posts 
  SET 
    is_public = true,
    is_active = true,
    is_draft = false,
    is_featured = p_featured,
    published_at = now(),
    updated_at = now()
  WHERE id = p_job_id;
  
  -- Log the publication
  PERFORM public.log_job_edit(
    p_job_id,
    'publish',
    jsonb_build_object('featured', p_featured, 'tokens_used', tokens_needed),
    '{}'::jsonb,
    jsonb_build_object('featured', p_featured, 'tokens_used', tokens_needed),
    'Job published with ' || tokens_needed || ' tokens'
  );
  
  -- Return success
  RETURN QUERY SELECT 
    true, 
    'Job published successfully', 
    company_record.token_balance - tokens_needed;
END;
$$ LANGUAGE plpgsql;

-- Function to search jobs with filters
CREATE OR REPLACE FUNCTION public.search_jobs(
  p_keywords TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_work_mode TEXT DEFAULT NULL,
  p_employment_type TEXT DEFAULT NULL,
  p_salary_min INTEGER DEFAULT NULL,
  p_salary_max INTEGER DEFAULT NULL,
  p_company_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company_name TEXT,
  city TEXT,
  work_mode TEXT,
  employment_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT,
  published_at TIMESTAMPTZ,
  description_snippet TEXT,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jp.id,
    jp.title,
    c.name as company_name,
    jp.city,
    jp.work_mode,
    jp.employment_type,
    jp.salary_min,
    jp.salary_max,
    jp.salary_currency,
    jp.published_at,
    LEFT(jp.description_md, 200) as description_snippet,
    jp.tags
  FROM public.job_posts jp
  JOIN public.companies c ON c.id = jp.company_id
  WHERE jp.is_public = true 
    AND jp.is_active = true
    AND (p_keywords IS NULL OR jp.title ILIKE '%' || p_keywords || '%' OR jp.description_md ILIKE '%' || p_keywords || '%')
    AND (p_city IS NULL OR jp.city ILIKE '%' || p_city || '%')
    AND (p_work_mode IS NULL OR jp.work_mode = p_work_mode)
    AND (p_employment_type IS NULL OR jp.employment_type = p_employment_type)
    AND (p_salary_min IS NULL OR jp.salary_min >= p_salary_min)
    AND (p_salary_max IS NULL OR jp.salary_max <= p_salary_max)
    AND (p_company_id IS NULL OR jp.company_id = p_company_id)
  ORDER BY 
    jp.is_featured DESC,
    jp.published_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get job recommendations for a user
CREATE OR REPLACE FUNCTION public.get_job_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  job_id UUID,
  title TEXT,
  company_name TEXT,
  city TEXT,
  work_mode TEXT,
  employment_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  recommendation_score DECIMAL,
  recommendation_reasons TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jr.job_post_id as job_id,
    jp.title,
    c.name as company_name,
    jp.city,
    jp.work_mode,
    jp.employment_type,
    jp.salary_min,
    jp.salary_max,
    jr.recommendation_score,
    ARRAY(SELECT jsonb_array_elements_text(jr.recommendation_reasons)) as recommendation_reasons
  FROM public.job_recommendations jr
  JOIN public.job_posts jp ON jp.id = jr.job_post_id
  JOIN public.companies c ON c.id = jp.company_id
  WHERE jr.user_id = p_user_id
    AND jr.expires_at > now()
    AND jp.is_public = true
    AND jp.is_active = true
  ORDER BY jr.recommendation_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle job like/bookmark
CREATE OR REPLACE FUNCTION public.toggle_job_like(p_job_id UUID)
RETURNS TABLE (
  is_liked BOOLEAN,
  like_count INTEGER
) AS $$
DECLARE
  user_id UUID;
  existing_bookmark RECORD;
  new_like_count INTEGER;
BEGIN
  -- Get current user
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Check if already bookmarked
  SELECT * INTO existing_bookmark 
  FROM public.job_bookmarks 
  WHERE job_post_id = p_job_id AND user_id = user_id;
  
  IF existing_bookmark IS NOT NULL THEN
    -- Remove bookmark
    DELETE FROM public.job_bookmarks 
    WHERE job_post_id = p_job_id AND user_id = user_id;
    
    -- Get new count
    SELECT COUNT(*) INTO new_like_count 
    FROM public.job_bookmarks 
    WHERE job_post_id = p_job_id;
    
    RETURN QUERY SELECT false, new_like_count;
  ELSE
    -- Add bookmark
    INSERT INTO public.job_bookmarks (job_post_id, user_id)
    VALUES (p_job_id, user_id);
    
    -- Get new count
    SELECT COUNT(*) INTO new_like_count 
    FROM public.job_bookmarks 
    WHERE job_post_id = p_job_id;
    
    RETURN QUERY SELECT true, new_like_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_company_job_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_applications TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_application_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_application_viewed TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_posting_limits TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_job_with_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_job_like TO authenticated;
