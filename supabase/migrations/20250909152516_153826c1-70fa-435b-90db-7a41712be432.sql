-- Complete migration to fix all missing schema elements

-- 1. Add missing columns to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS applied_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS viewed_by_company boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS job_post_id uuid REFERENCES job_posts(id);

-- Update existing applications to use job_post_id instead of job_id
UPDATE applications SET job_post_id = job_id WHERE job_post_id IS NULL;

-- 2. Create job_post_views table
CREATE TABLE IF NOT EXISTS job_post_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_post_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  user_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on job_post_views
ALTER TABLE job_post_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_post_views
CREATE POLICY "Anyone can insert views" ON job_post_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Company members can view job views" ON job_post_views
  FOR SELECT USING (
    job_post_id IN (
      SELECT id FROM job_posts 
      WHERE company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- 3. Create plans table with required columns
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  max_job_posts integer DEFAULT 0,
  tokens_per_post integer DEFAULT 0,
  price_cents integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default plans
INSERT INTO plans (id, name, max_job_posts, tokens_per_post) VALUES
  ('free', 'Free Plan', 1, 10),
  ('basic', 'Basic Plan', 5, 8),
  ('pro', 'Pro Plan', 20, 5),
  ('enterprise', 'Enterprise Plan', 100, 3)
ON CONFLICT (id) DO UPDATE SET
  max_job_posts = EXCLUDED.max_job_posts,
  tokens_per_post = EXCLUDED.tokens_per_post;

-- 4. Update company_subscriptions to reference plans table
ALTER TABLE company_subscriptions 
ADD CONSTRAINT fk_company_subscriptions_plan_id 
FOREIGN KEY (plan_id) REFERENCES plans(id);

-- 5. Create missing functions
CREATE OR REPLACE FUNCTION get_company_job_stats(p_company_id uuid)
RETURNS TABLE(
  total_jobs bigint,
  active_jobs bigint,
  total_applications bigint,
  total_views bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM job_posts WHERE company_id = p_company_id)::bigint as total_jobs,
    (SELECT count(*) FROM job_posts WHERE company_id = p_company_id AND is_active = true)::bigint as active_jobs,
    (SELECT count(*) FROM applications a 
     JOIN job_posts jp ON a.job_post_id = jp.id 
     WHERE jp.company_id = p_company_id)::bigint as total_applications,
    (SELECT count(*) FROM job_post_views jpv 
     JOIN job_posts jp ON jpv.job_post_id = jp.id 
     WHERE jp.company_id = p_company_id)::bigint as total_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_job_post_id ON applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_job_post_views_job_post_id ON job_post_views(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_post_views_user_id ON job_post_views(user_id);

-- 7. Update RLS policies for applications to use new columns
DROP POLICY IF EXISTS "applications_company_access" ON applications;

CREATE POLICY "applications_company_access" ON applications
  FOR ALL USING (
    job_post_id IN (
      SELECT id FROM job_posts 
      WHERE company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    job_post_id IN (
      SELECT id FROM job_posts 
      WHERE company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid()
      )
    )
  );