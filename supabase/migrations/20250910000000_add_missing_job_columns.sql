-- Add missing columns for job posting system
-- These columns are used in the frontend but missing from the database schema

-- Add description_md, tasks_md, requirements_md columns
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS description_md TEXT,
ADD COLUMN IF NOT EXISTS tasks_md TEXT,
ADD COLUMN IF NOT EXISTS requirements_md TEXT;

-- Add slug column for SEO-friendly URLs
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add view_count and application_count for statistics
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;

-- Add tags column for job categorization
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add external_id and source for external job postings
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'internal';

-- Add is_featured and is_urgent for job promotion
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Add company_description for company info in job posts
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS company_description TEXT;

-- Add application fields
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS application_deadline DATE,
ADD COLUMN IF NOT EXISTS application_url TEXT,
ADD COLUMN IF NOT EXISTS application_email TEXT,
ADD COLUMN IF NOT EXISTS application_instructions TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_job_posts_slug ON public.job_posts(slug);
CREATE INDEX IF NOT EXISTS idx_job_posts_view_count ON public.job_posts(view_count);
CREATE INDEX IF NOT EXISTS idx_job_posts_application_count ON public.job_posts(application_count);
CREATE INDEX IF NOT EXISTS idx_job_posts_is_featured ON public.job_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_job_posts_is_urgent ON public.job_posts(is_urgent);
CREATE INDEX IF NOT EXISTS idx_job_posts_featured_until ON public.job_posts(featured_until);
CREATE INDEX IF NOT EXISTS idx_job_posts_external_id ON public.job_posts(external_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_source ON public.job_posts(source);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_job_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate slug when job is created
CREATE OR REPLACE FUNCTION public.set_job_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = public.generate_job_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
CREATE TRIGGER trg_set_job_slug
  BEFORE INSERT OR UPDATE ON public.job_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_slug();

-- Create function to update view count
CREATE OR REPLACE FUNCTION public.increment_job_view_count(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.job_posts 
  SET view_count = view_count + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update application count
CREATE OR REPLACE FUNCTION public.update_job_application_count(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.job_posts 
  SET application_count = (
    SELECT COUNT(*) 
    FROM public.applications 
    WHERE job_post_id = job_id
  )
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update application count when applications change
CREATE OR REPLACE FUNCTION public.trigger_update_application_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update application count for the affected job
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.update_job_application_count(NEW.job_post_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_job_application_count(OLD.job_post_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_application_count
  AFTER INSERT OR UPDATE OR DELETE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_application_count();

-- Update existing jobs to have slugs
UPDATE public.job_posts 
SET slug = public.generate_job_slug(title)
WHERE slug IS NULL OR slug = '';

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_posts_slug_unique ON public.job_posts(slug);

-- Add RLS policy for public job post views
CREATE POLICY "Public can view job post views" 
ON public.job_post_views FOR SELECT 
USING (true);

CREATE POLICY "Public can create job post views" 
ON public.job_post_views FOR INSERT 
WITH CHECK (true);

-- Create function to track job post view
CREATE OR REPLACE FUNCTION public.track_job_view(
  p_job_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert view record (will be ignored if duplicate due to unique constraint)
  INSERT INTO public.job_post_views (job_post_id, viewed_by, ip_address, user_agent)
  VALUES (p_job_id, p_user_id, p_ip_address, p_user_agent)
  ON CONFLICT (job_post_id, viewed_by) DO NOTHING;
  
  -- Increment view count
  PERFORM public.increment_job_view_count(p_job_id);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.track_job_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_job_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_job_application_count TO authenticated;
