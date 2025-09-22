-- Step 1: Add missing profile fields to candidates table
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS salary_expectation_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_expectation_max INTEGER,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS education TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS preferred_work_type TEXT DEFAULT 'hybrid',
ADD COLUMN IF NOT EXISTS mutual_connections INTEGER DEFAULT 0;

-- Step 2: Create profiles table for enhanced user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  location TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  skills TEXT[],
  interests TEXT[],
  experience_years INTEGER,
  job_title TEXT,
  company_name TEXT,
  education TEXT[],
  certifications TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;