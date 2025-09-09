-- Fix missing columns in job_posts table
-- This migration ensures all required columns exist

-- Add missing columns if they don't exist
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS driving_licenses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS internship_data JSONB,
ADD COLUMN IF NOT EXISTS apprenticeship_data JSONB,
ADD COLUMN IF NOT EXISTS professional_data JSONB,
ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person_role TEXT,
ADD COLUMN IF NOT EXISTS contact_person_email TEXT,
ADD COLUMN IF NOT EXISTS contact_person_phone TEXT,
ADD COLUMN IF NOT EXISTS visa_sponsorship BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS relocation_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS travel_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns from the additional migration
ALTER TABLE public.job_posts 
ADD COLUMN IF NOT EXISTS description_md TEXT,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_driving_licenses ON public.job_posts USING GIN(driving_licenses);
CREATE INDEX IF NOT EXISTS idx_job_posts_skills ON public.job_posts USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_job_posts_languages ON public.job_posts USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_job_posts_certifications ON public.job_posts USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_job_posts_internship_data ON public.job_posts USING GIN(internship_data);
CREATE INDEX IF NOT EXISTS idx_job_posts_apprenticeship_data ON public.job_posts USING GIN(apprenticeship_data);
CREATE INDEX IF NOT EXISTS idx_job_posts_professional_data ON public.job_posts USING GIN(professional_data);
CREATE INDEX IF NOT EXISTS idx_job_posts_tags ON public.job_posts USING GIN(tags);

-- Update existing records to have proper defaults
UPDATE public.job_posts 
SET 
  driving_licenses = '[]'::jsonb,
  skills = '[]'::jsonb,
  languages = '[]'::jsonb,
  certifications = '[]'::jsonb,
  tags = '{}',
  source = 'manual'
WHERE 
  driving_licenses IS NULL OR 
  skills IS NULL OR 
  languages IS NULL OR 
  certifications IS NULL OR 
  tags IS NULL OR 
  source IS NULL;
