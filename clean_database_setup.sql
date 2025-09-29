-- Saubere Basis-Migration für cv-star-generator
-- Erstellt alle notwendigen Tabellen ohne Konflikte

-- 1. Profiles Tabelle (Haupttabelle für User)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  
  -- Basic Info
  email TEXT,
  vorname TEXT,
  nachname TEXT,
  full_name TEXT GENERATED ALWAYS AS (CONCAT(vorname, ' ', nachname)) STORED,
  
  -- Status und Branche
  status TEXT CHECK (status IN ('schueler', 'azubi', 'ausgelernt')),
  branche TEXT CHECK (branche IN ('handwerk', 'it', 'gesundheit')),
  
  -- Personal Data
  geburtsdatum DATE,
  strasse TEXT,
  hausnummer TEXT,
  plz VARCHAR(5),
  ort TEXT,
  telefon TEXT,
  avatar_url TEXT,
  
  -- Education/Work
  schule TEXT,
  geplanter_abschluss TEXT,
  abschlussjahr TEXT,
  ausbildungsberuf TEXT,
  ausbildungsbetrieb TEXT,
  startjahr TEXT,
  voraussichtliches_ende TEXT,
  abschlussjahr_ausgelernt TEXT,
  aktueller_beruf TEXT,
  
  -- Skills and Experience
  sprachen JSONB DEFAULT '[]',
  faehigkeiten JSONB DEFAULT '[]',
  schulbildung JSONB DEFAULT '[]',
  berufserfahrung JSONB DEFAULT '[]',
  
  -- AI Content
  uebermich TEXT,
  kenntnisse TEXT,
  motivation TEXT,
  praktische_erfahrung TEXT,
  
  -- Profile Settings
  layout INTEGER DEFAULT 1,
  profile_published BOOLEAN DEFAULT FALSE,
  profile_complete BOOLEAN DEFAULT FALSE,
  account_created BOOLEAN DEFAULT FALSE,
  einwilligung BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Companies Tabelle
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  plan_type TEXT DEFAULT 'basic',
  active_tokens INT DEFAULT 0,
  seats INT DEFAULT 1,
  subscription_status TEXT DEFAULT 'inactive',
  website_url TEXT,
  main_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Company Users Tabelle
CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, company_id)
);

-- 4. Community Posts Tabelle
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  body_md TEXT NOT NULL,
  media JSONB DEFAULT '[]',
  status TEXT DEFAULT 'published',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tokens Used Tabelle
CREATE TABLE IF NOT EXISTS public.tokens_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, profile_id)
);

-- 6. RLS Policies aktivieren
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens_used ENABLE ROW LEVEL SECURITY;

-- 7. Basis RLS Policies (mit IF NOT EXISTS)
-- Profiles: User können ihr eigenes Profil sehen/bearbeiten
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies: Alle können Companies sehen, nur Admins können bearbeiten
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
CREATE POLICY "Anyone can view companies" ON public.companies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Company admins can manage companies" ON public.companies;
CREATE POLICY "Company admins can manage companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE user_id = auth.uid() 
      AND company_id = companies.id 
      AND role = 'admin'
      AND accepted_at IS NOT NULL
    )
  );

-- Company Users: User können ihre eigenen Einträge sehen
DROP POLICY IF EXISTS "Users can view their company memberships" ON public.company_users;
CREATE POLICY "Users can view their company memberships" ON public.company_users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own company membership" ON public.company_users;
CREATE POLICY "Users can insert their own company membership" ON public.company_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community Posts: Alle können Posts sehen, User können ihre eigenen erstellen
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.community_posts;
CREATE POLICY "Anyone can view published posts" ON public.community_posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
CREATE POLICY "Users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = actor_user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = actor_user_id);

-- 8. Trigger für automatische Profile-Erstellung
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Nur Profile für normale User erstellen, nicht für Company-User
  IF NOT EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.profiles (id, email, account_created)
    VALUES (NEW.id, NEW.email, true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger aktivieren
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_branche ON public.profiles(branche);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_actor_user_id ON public.community_posts(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at);
