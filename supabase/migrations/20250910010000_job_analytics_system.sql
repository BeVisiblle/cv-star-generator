-- Job Analytics and Statistics System
-- This migration adds comprehensive analytics for job postings

-- Create job analytics table for aggregated statistics
CREATE TABLE IF NOT EXISTS public.job_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  
  -- Time period for analytics
  date DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  
  -- View statistics
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  anonymous_views INTEGER DEFAULT 0,
  authenticated_views INTEGER DEFAULT 0,
  
  -- Application statistics
  total_applications INTEGER DEFAULT 0,
  new_applications INTEGER DEFAULT 0,
  applications_by_status JSONB DEFAULT '{}'::jsonb,
  
  -- Engagement statistics
  time_on_page_avg DECIMAL(10,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Source tracking
  views_by_source JSONB DEFAULT '{}'::jsonb,
  applications_by_source JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one record per job per date per period
  UNIQUE(job_post_id, date, period)
);

-- Create job performance metrics table
CREATE TABLE IF NOT EXISTS public.job_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  
  -- Performance metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0, -- applications per view
  time_to_first_application INTERVAL,
  time_to_fill INTERVAL,
  
  -- Quality metrics
  application_quality_score DECIMAL(5,2) DEFAULT 0,
  interview_conversion_rate DECIMAL(5,2) DEFAULT 0,
  hire_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement metrics
  avg_view_duration INTERVAL,
  return_visitor_rate DECIMAL(5,2) DEFAULT 0,
  social_shares INTEGER DEFAULT 0,
  
  -- Calculated at
  calculated_at TIMESTAMPTZ DEFAULT now(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL
);

-- Create job search analytics table
CREATE TABLE IF NOT EXISTS public.job_search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Search query data
  search_query TEXT,
  filters_applied JSONB DEFAULT '{}'::jsonb,
  results_count INTEGER DEFAULT 0,
  
  -- User data
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Search results
  jobs_viewed JSONB DEFAULT '[]'::jsonb,
  jobs_applied JSONB DEFAULT '[]'::jsonb,
  
  -- Search performance
  search_time_ms INTEGER,
  clicked_job_id UUID REFERENCES public.job_posts(id),
  
  -- Metadata
  searched_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_analytics_job_post_id ON public.job_analytics(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_analytics_date ON public.job_analytics(date);
CREATE INDEX IF NOT EXISTS idx_job_analytics_period ON public.job_analytics(period);

CREATE INDEX IF NOT EXISTS idx_job_performance_metrics_job_post_id ON public.job_performance_metrics(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_performance_metrics_calculated_at ON public.job_performance_metrics(calculated_at);

CREATE INDEX IF NOT EXISTS idx_job_search_analytics_user_id ON public.job_search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_job_search_analytics_searched_at ON public.job_search_analytics(searched_at);
CREATE INDEX IF NOT EXISTS idx_job_search_analytics_search_query ON public.job_search_analytics(search_query);

-- Enable RLS
ALTER TABLE public.job_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job analytics
CREATE POLICY "Companies can view analytics for their jobs" 
ON public.job_analytics FOR SELECT 
USING (job_post_id IN (
  SELECT id FROM public.job_posts 
  WHERE company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Companies can view performance metrics for their jobs" 
ON public.job_performance_metrics FOR SELECT 
USING (job_post_id IN (
  SELECT id FROM public.job_posts 
  WHERE company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
));

-- Users can view their own search analytics
CREATE POLICY "Users can view their own search analytics" 
ON public.job_search_analytics FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Create function to calculate daily analytics
CREATE OR REPLACE FUNCTION public.calculate_daily_job_analytics(p_job_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  view_stats RECORD;
  app_stats RECORD;
BEGIN
  -- Get view statistics
  SELECT 
    COUNT(*) as total_views,
    COUNT(DISTINCT viewed_by) as unique_views,
    COUNT(CASE WHEN viewed_by IS NULL THEN 1 END) as anonymous_views,
    COUNT(CASE WHEN viewed_by IS NOT NULL THEN 1 END) as authenticated_views
  INTO view_stats
  FROM public.job_post_views 
  WHERE job_post_id = p_job_id 
    AND DATE(viewed_at) = p_date;

  -- Get application statistics
  SELECT 
    COUNT(*) as total_applications,
    COUNT(CASE WHEN DATE(applied_at) = p_date THEN 1 END) as new_applications
  INTO app_stats
  FROM public.applications 
  WHERE job_post_id = p_job_id;

  -- Insert or update analytics record
  INSERT INTO public.job_analytics (
    job_post_id,
    date,
    period,
    total_views,
    unique_views,
    anonymous_views,
    authenticated_views,
    total_applications,
    new_applications
  ) VALUES (
    p_job_id,
    p_date,
    'daily',
    COALESCE(view_stats.total_views, 0),
    COALESCE(view_stats.unique_views, 0),
    COALESCE(view_stats.anonymous_views, 0),
    COALESCE(view_stats.authenticated_views, 0),
    COALESCE(app_stats.total_applications, 0),
    COALESCE(app_stats.new_applications, 0)
  )
  ON CONFLICT (job_post_id, date, period) 
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_views = EXCLUDED.unique_views,
    anonymous_views = EXCLUDED.anonymous_views,
    authenticated_views = EXCLUDED.authenticated_views,
    total_applications = EXCLUDED.total_applications,
    new_applications = EXCLUDED.new_applications,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create function to get job statistics
CREATE OR REPLACE FUNCTION public.get_job_statistics(p_job_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_views BIGINT,
  unique_views BIGINT,
  total_applications BIGINT,
  conversion_rate DECIMAL,
  avg_daily_views DECIMAL,
  avg_daily_applications DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ja.total_views), 0) as total_views,
    COALESCE(SUM(ja.unique_views), 0) as unique_views,
    COALESCE(SUM(ja.total_applications), 0) as total_applications,
    CASE 
      WHEN SUM(ja.total_views) > 0 THEN 
        ROUND((SUM(ja.total_applications)::DECIMAL / SUM(ja.total_views) * 100), 2)
      ELSE 0 
    END as conversion_rate,
    ROUND(AVG(ja.total_views), 2) as avg_daily_views,
    ROUND(AVG(ja.total_applications), 2) as avg_daily_applications
  FROM public.job_analytics ja
  WHERE ja.job_post_id = p_job_id
    AND ja.date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    AND ja.period = 'daily';
END;
$$ LANGUAGE plpgsql;

-- Create function to get company job statistics
CREATE OR REPLACE FUNCTION public.get_company_job_statistics(p_company_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_jobs BIGINT,
  total_views BIGINT,
  total_applications BIGINT,
  avg_views_per_job DECIMAL,
  avg_applications_per_job DECIMAL,
  top_performing_job_id UUID,
  top_performing_job_title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT jp.id) as total_jobs,
    COALESCE(SUM(ja.total_views), 0) as total_views,
    COALESCE(SUM(ja.total_applications), 0) as total_applications,
    ROUND(AVG(ja.total_views), 2) as avg_views_per_job,
    ROUND(AVG(ja.total_applications), 2) as avg_applications_per_job,
    (
      SELECT jp2.id 
      FROM public.job_posts jp2
      LEFT JOIN public.job_analytics ja2 ON ja2.job_post_id = jp2.id
      WHERE jp2.company_id = p_company_id
        AND ja2.date >= CURRENT_DATE - INTERVAL '1 day' * p_days
      GROUP BY jp2.id, jp2.title
      ORDER BY SUM(ja2.total_views) DESC
      LIMIT 1
    ) as top_performing_job_id,
    (
      SELECT jp2.title 
      FROM public.job_posts jp2
      LEFT JOIN public.job_analytics ja2 ON ja2.job_post_id = jp2.id
      WHERE jp2.company_id = p_company_id
        AND ja2.date >= CURRENT_DATE - INTERVAL '1 day' * p_days
      GROUP BY jp2.id, jp2.title
      ORDER BY SUM(ja2.total_views) DESC
      LIMIT 1
    ) as top_performing_job_title
  FROM public.job_posts jp
  LEFT JOIN public.job_analytics ja ON ja.job_post_id = jp.id
  WHERE jp.company_id = p_company_id
    AND ja.date >= CURRENT_DATE - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_daily_job_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_company_job_statistics TO authenticated;

-- Create trigger to update analytics when views or applications change
CREATE OR REPLACE FUNCTION public.trigger_update_job_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics for the affected job
  IF TG_TABLE_NAME = 'job_post_views' THEN
    PERFORM public.calculate_daily_job_analytics(NEW.job_post_id, CURRENT_DATE);
  ELSIF TG_TABLE_NAME = 'applications' THEN
    PERFORM public.calculate_daily_job_analytics(NEW.job_post_id, CURRENT_DATE);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for analytics updates
CREATE TRIGGER trg_update_job_analytics_views
  AFTER INSERT ON public.job_post_views
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_job_analytics();

CREATE TRIGGER trg_update_job_analytics_applications
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_job_analytics();
