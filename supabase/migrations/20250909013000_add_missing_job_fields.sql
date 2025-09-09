-- Add missing fields to job_posts table
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS description_md TEXT,
ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person_role TEXT,
ADD COLUMN IF NOT EXISTS contact_person_email TEXT,
ADD COLUMN IF NOT EXISTS contact_person_phone TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS application_deadline DATE,
ADD COLUMN IF NOT EXISTS application_url TEXT,
ADD COLUMN IF NOT EXISTS application_email TEXT,
ADD COLUMN IF NOT EXISTS application_instructions TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Update constraints to make some fields required
ALTER TABLE public.job_posts 
ALTER COLUMN team_department SET NOT NULL,
ALTER COLUMN role_family SET NOT NULL,
ALTER COLUMN contact_person_name SET NOT NULL,
ALTER COLUMN contact_person_role SET NOT NULL,
ALTER COLUMN contact_person_email SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_company_id ON public.job_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_job_type ON public.job_posts(job_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_work_mode ON public.job_posts(work_mode);
CREATE INDEX IF NOT EXISTS idx_job_posts_employment_type ON public.job_posts(employment_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_city ON public.job_posts(city);
CREATE INDEX IF NOT EXISTS idx_job_posts_state ON public.job_posts(state);
CREATE INDEX IF NOT EXISTS idx_job_posts_country ON public.job_posts(country);
CREATE INDEX IF NOT EXISTS idx_job_posts_is_active ON public.job_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_job_posts_is_public ON public.job_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_at ON public.job_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_job_posts_published_at ON public.job_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_job_posts_featured ON public.job_posts(is_featured, featured_until);
CREATE INDEX IF NOT EXISTS idx_job_posts_urgent ON public.job_posts(is_urgent);
CREATE INDEX IF NOT EXISTS idx_job_posts_tags ON public.job_posts USING GIN(tags);

-- Add RLS policies for the new fields
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- Policy for companies to manage their own job posts
CREATE POLICY "Companies can manage their own job posts" ON public.job_posts
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM public.company_users 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for public read access to published job posts
CREATE POLICY "Public can read published job posts" ON public.job_posts
  FOR SELECT USING (is_public = true AND is_active = true);

-- Policy for authenticated users to read all job posts (for internal use)
CREATE POLICY "Authenticated users can read all job posts" ON public.job_posts
  FOR SELECT USING (auth.role() = 'authenticated');
