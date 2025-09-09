-- Update existing plans table with missing columns
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS max_job_posts integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS tokens_per_post integer DEFAULT 10;

-- Update existing plan records with proper values
UPDATE plans SET 
  max_job_posts = CASE 
    WHEN id = 'free' THEN 1
    WHEN id = 'basic' THEN 5  
    WHEN id = 'pro' THEN 20
    WHEN id = 'enterprise' THEN 100
    ELSE 1
  END,
  tokens_per_post = CASE
    WHEN id = 'free' THEN 10
    WHEN id = 'basic' THEN 8
    WHEN id = 'pro' THEN 5  
    WHEN id = 'enterprise' THEN 3
    ELSE 10
  END
WHERE max_job_posts IS NULL OR tokens_per_post IS NULL;

-- Create missing applications columns
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS applied_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS viewed_by_company boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS job_post_id uuid REFERENCES job_posts(id);

-- Update existing applications to use job_post_id 
UPDATE applications SET job_post_id = job_id WHERE job_post_id IS NULL;

-- Create job_post_views table
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
DROP POLICY IF EXISTS "Anyone can insert views" ON job_post_views;
CREATE POLICY "Anyone can insert views" ON job_post_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Company members can view job views" ON job_post_views;  
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