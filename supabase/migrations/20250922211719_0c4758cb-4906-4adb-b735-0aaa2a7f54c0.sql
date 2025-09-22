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
  current_role TEXT,
  current_company TEXT,
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

-- Step 3: Create sample data function
CREATE OR REPLACE FUNCTION create_sample_data()
RETURNS void AS $$
DECLARE
  sample_company_1 UUID;
  sample_company_2 UUID;
  sample_company_3 UUID;
BEGIN
  -- Insert sample companies if they don't exist
  INSERT INTO public.companies (id, name, logo_url, industry, main_location, employee_count, description, website_url, subscription_status)
  VALUES 
    (gen_random_uuid(), 'TechStart GmbH', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center', 'Technology', 'Berlin', 50, 'Innovative startup focused on AI and machine learning solutions.', 'https://techstart.de', 'active'),
    (gen_random_uuid(), 'Design Studio München', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&h=100&fit=crop&crop=center', 'Design', 'München', 25, 'Creative design agency specializing in digital experiences.', 'https://designstudio.de', 'active'),
    (gen_random_uuid(), 'FinTech Solutions', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop&crop=center', 'Financial Services', 'Frankfurt', 100, 'Leading fintech company revolutionizing digital payments.', 'https://fintech-solutions.de', 'active')
  ON CONFLICT (name) DO NOTHING;

  -- Get company IDs for sample data
  SELECT id INTO sample_company_1 FROM public.companies WHERE name = 'TechStart GmbH' LIMIT 1;
  SELECT id INTO sample_company_2 FROM public.companies WHERE name = 'Design Studio München' LIMIT 1;
  SELECT id INTO sample_company_3 FROM public.companies WHERE name = 'FinTech Solutions' LIMIT 1;

  -- Insert sample candidates
  INSERT INTO public.candidates (
    id, full_name, email, title, company_name, industry, location, country, city,
    profile_image, bio, skills, languages, experience_years, company_id,
    linkedin_url, github_url, salary_expectation_min, salary_expectation_max,
    availability_status, preferred_work_type, mutual_connections, is_verified
  )
  VALUES 
    (
      gen_random_uuid(), 'Alex Mueller', 'alex@example.com', 'Senior Frontend Developer', 'TechStart GmbH', 'Technology', 'Berlin, Germany', 'Germany', 'Berlin',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 
      'Passionate frontend developer with 5+ years of experience in React, TypeScript, and modern web technologies. Love creating beautiful and functional user interfaces.',
      ARRAY['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'GraphQL'], 
      ARRAY['German', 'English'], 5, sample_company_1,
      'https://linkedin.com/in/alexmueller', 'https://github.com/alexmueller', 60000, 80000,
      'available', 'hybrid', 12, true
    ),
    (
      gen_random_uuid(), 'Sarah Schmidt', 'sarah@example.com', 'UX/UI Designer', 'Design Studio München', 'Design', 'München, Germany', 'Germany', 'München',
      'https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face',
      'Creative UX/UI designer specializing in user-centered design and digital experiences. Strong background in design thinking and prototyping.',
      ARRAY['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems'],
      ARRAY['German', 'English', 'French'], 3, sample_company_2,
      'https://linkedin.com/in/sarahschmidt', NULL, 45000, 65000,
      'available', 'remote', 8, true
    ),
    (
      gen_random_uuid(), 'Marcus Weber', 'marcus@example.com', 'DevOps Engineer', 'FinTech Solutions', 'Financial Services', 'Frankfurt, Germany', 'Germany', 'Frankfurt',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'Experienced DevOps engineer with expertise in cloud infrastructure, CI/CD, and automation. Passionate about scalable and secure systems.',
      ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python', 'Bash'],
      ARRAY['German', 'English'], 7, sample_company_3,
      'https://linkedin.com/in/marcusweber', 'https://github.com/marcusweber', 70000, 90000,
      'available', 'hybrid', 15, true
    ),
    (
      gen_random_uuid(), 'Lisa Hoffmann', 'lisa@example.com', 'Product Manager', 'Freelance', 'Consulting', 'Hamburg, Germany', 'Germany', 'Hamburg',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'Strategic product manager with a track record of launching successful digital products. Expert in agile methodologies and user-driven development.',
      ARRAY['Product Strategy', 'Agile', 'Scrum', 'Analytics', 'User Research', 'Roadmapping'],
      ARRAY['German', 'English', 'Spanish'], 4, sample_company_1,
      'https://linkedin.com/in/lisahoffmann', NULL, 55000, 75000,
      'open_to_offers', 'remote', 6, false
    ),
    (
      gen_random_uuid(), 'Thomas Bauer', 'thomas@example.com', 'Full Stack Developer', 'TechStart GmbH', 'Technology', 'Berlin, Germany', 'Germany', 'Berlin',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'Full stack developer passionate about building scalable web applications. Strong experience with both frontend and backend technologies.',
      ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Express.js', 'Next.js'],
      ARRAY['German', 'English'], 6, sample_company_1,
      'https://linkedin.com/in/thomasbauer', 'https://github.com/thomasbauer', 65000, 85000,
      'available', 'office', 10, true
    ),
    (
      gen_random_uuid(), 'Anna Richter', 'anna@example.com', 'Data Scientist', 'FinTech Solutions', 'Financial Services', 'Frankfurt, Germany', 'Germany', 'Frankfurt',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      'Data scientist with expertise in machine learning and statistical analysis. Passionate about extracting insights from complex datasets.',
      ARRAY['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Jupyter'],
      ARRAY['German', 'English'], 4, sample_company_3,
      'https://linkedin.com/in/annarichter', 'https://github.com/annarichter', 60000, 80000,
      'available', 'hybrid', 9, true
    )
  ON CONFLICT (email) DO NOTHING;

  -- Insert sample job posts
  INSERT INTO public.jobs (
    id, title, description, company_id, location, employment_type, salary_min, salary_max,
    requirements, benefits, is_active, is_public, created_at
  )
  VALUES 
    (
      gen_random_uuid(), 'Senior React Developer', 
      'We are looking for an experienced React developer to join our growing team. You will be responsible for building modern web applications using React, TypeScript, and other cutting-edge technologies.',
      sample_company_1, 'Berlin, Germany', 'full_time', 60000, 80000,
      ARRAY['5+ years React experience', 'TypeScript expertise', 'Modern CSS frameworks', 'Git version control'],
      ARRAY['Flexible working hours', 'Remote work options', 'Professional development budget', 'Modern office in Berlin'],
      true, true, NOW()
    ),
    (
      gen_random_uuid(), 'UX Designer', 
      'Join our creative team as a UX Designer and help us create amazing user experiences for our clients. You will work on diverse projects from concept to implementation.',
      sample_company_2, 'München, Germany', 'full_time', 45000, 65000,
      ARRAY['3+ years UX design experience', 'Figma proficiency', 'User research skills', 'Portfolio required'],
      ARRAY['Creative environment', 'Flexible hours', 'Design conference budget', 'Team collaboration'],
      true, true, NOW()
    ),
    (
      gen_random_uuid(), 'DevOps Engineer', 
      'We need a skilled DevOps engineer to help us scale our infrastructure and improve our deployment processes. Experience with cloud platforms and automation is essential.',
      sample_company_3, 'Frankfurt, Germany', 'full_time', 70000, 90000,
      ARRAY['AWS/Azure experience', 'Docker & Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code'],
      ARRAY['Competitive salary', 'Stock options', 'Learning budget', 'Health insurance'],
      true, true, NOW()
    )
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql;

-- Execute the sample data creation
SELECT create_sample_data();

-- Step 4: Update timestamp trigger
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