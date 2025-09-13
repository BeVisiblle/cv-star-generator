-- Ensure profiles table has all necessary columns for post authors
-- This migration ensures the profiles table has the correct structure

-- Add missing columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS vorname TEXT,
ADD COLUMN IF NOT EXISTS nachname TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'azubi',
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS ausbildungsberuf TEXT,
ADD COLUMN IF NOT EXISTS schule TEXT,
ADD COLUMN IF NOT EXISTS ausbildungsbetrieb TEXT,
ADD COLUMN IF NOT EXISTS aktueller_beruf TEXT;

-- Update existing profiles to have full_name from vorname + nachname if missing
UPDATE public.profiles 
SET full_name = TRIM(CONCAT(COALESCE(vorname, ''), ' ', COALESCE(nachname, '')))
WHERE full_name IS NULL OR full_name = '';

-- Update profiles to have vorname and nachname from full_name if missing
UPDATE public.profiles 
SET 
  vorname = CASE 
    WHEN vorname IS NULL OR vorname = '' THEN 
      CASE 
        WHEN POSITION(' ' IN full_name) > 0 THEN 
          SUBSTRING(full_name FROM 1 FOR POSITION(' ' IN full_name) - 1)
        ELSE full_name
      END
    ELSE vorname
  END,
  nachname = CASE 
    WHEN nachname IS NULL OR nachname = '' THEN 
      CASE 
        WHEN POSITION(' ' IN full_name) > 0 THEN 
          SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
        ELSE ''
      END
    ELSE nachname
  END
WHERE (vorname IS NULL OR vorname = '' OR nachname IS NULL OR nachname = '') 
  AND full_name IS NOT NULL AND full_name != '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_vorname ON public.profiles(vorname);
CREATE INDEX IF NOT EXISTS idx_profiles_nachname ON public.profiles(nachname);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Ensure RLS policies are in place for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view published profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view published profiles" 
ON public.profiles 
FOR SELECT 
USING (profile_published = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
