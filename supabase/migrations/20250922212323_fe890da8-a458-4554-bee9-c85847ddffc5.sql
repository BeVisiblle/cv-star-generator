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

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Step 3: Insert sample companies (using existing table structure)
INSERT INTO public.companies (name, logo_url, industry, main_location, employee_count, description, website_url, subscription_status)
VALUES 
  ('TechStart GmbH', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center', 'Technology', 'Berlin', 50, 'Innovative startup focused on AI and machine learning solutions.', 'https://techstart.de', 'active'),
  ('Design Studio München', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&h=100&fit=crop&crop=center', 'Design', 'München', 25, 'Creative design agency specializing in digital experiences.', 'https://designstudio.de', 'active'),
  ('FinTech Solutions', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop&crop=center', 'Financial Services', 'Frankfurt', 100, 'Leading fintech company revolutionizing digital payments.', 'https://fintech-solutions.de', 'active')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();