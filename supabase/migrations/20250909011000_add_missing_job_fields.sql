-- Add missing fields to job_posts table to match JobFormData interface

-- Add description field (if not exists)
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add JSONB fields for complex data structures
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS driving_licenses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS internship_data JSONB,
ADD COLUMN IF NOT EXISTS apprenticeship_data JSONB,
ADD COLUMN IF NOT EXISTS professional_data JSONB;

-- Add is_draft field for draft functionality
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;

-- Add created_by field to track who created the job
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing records to have is_draft = false if they are public and active
UPDATE public.job_posts 
SET is_draft = false 
WHERE is_public = true AND is_active = true;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_job_posts_is_draft ON public.job_posts(is_draft);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_by ON public.job_posts(created_by);

-- Update the trigger to handle is_draft field
CREATE OR REPLACE FUNCTION public.set_job_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set published_at when job becomes public and active
  IF NEW.is_public = true AND NEW.is_active = true AND OLD.is_public = false THEN
    NEW.published_at = now();
  END IF;
  
  -- Set is_draft to false when job becomes public
  IF NEW.is_public = true AND NEW.is_active = true THEN
    NEW.is_draft = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
