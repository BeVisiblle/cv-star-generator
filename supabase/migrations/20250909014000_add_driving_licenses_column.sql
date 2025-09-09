-- Add missing driving_licenses column to job_posts table
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS driving_licenses JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_driving_licenses ON public.job_posts USING GIN(driving_licenses);
