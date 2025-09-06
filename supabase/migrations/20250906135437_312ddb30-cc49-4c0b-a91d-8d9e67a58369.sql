-- 1.1 Feature-Flag „Passwort nach Verify erforderlich"
CREATE TABLE IF NOT EXISTS app_settings (
  id       boolean PRIMARY KEY DEFAULT true,
  require_password_after_verify boolean NOT NULL DEFAULT false
);

-- falls schon vorhanden einfach ignorieren
INSERT INTO app_settings (id, require_password_after_verify)
VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

-- 1.2 Hilfsfunktion für idempotente Spalten-Ergänzung
CREATE OR REPLACE FUNCTION _add_col_if_missing(table_name text, column_name text, column_def text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = _add_col_if_missing.table_name 
    AND column_name = _add_col_if_missing.column_name
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', table_name, column_name, column_def);
  END IF;
END;
$$;

-- 1.3 Onboarding Sessions Tabelle erstellen falls nicht vorhanden
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Plan Enum Type erstellen
DO $$ BEGIN
  CREATE TYPE plan_code AS ENUM ('free', 'starter', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Looking Tag Enum Type erstellen  
DO $$ BEGIN
  CREATE TYPE looking_tag AS ENUM ('Praktikanten', 'Auszubildende', 'Fachkräfte');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Company Size Enum Type erstellen
DO $$ BEGIN
  CREATE TYPE company_size_band AS ENUM ('1-9', '10-49', '50-249', '250-999', '1000+');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Onboarding-Sessions um E-Mail/Plan/Claim erweitern
SELECT _add_col_if_missing('onboarding_sessions','selected_plan','plan_code');
SELECT _add_col_if_missing('onboarding_sessions','stripe_status','text');  -- e.g. started|completed|free
SELECT _add_col_if_missing('onboarding_sessions','claimed_by','uuid REFERENCES auth.users(id)');
SELECT _add_col_if_missing('onboarding_sessions','org_id','uuid REFERENCES companies(id)');

CREATE INDEX IF NOT EXISTS onboarding_sessions_email_open_idx
  ON onboarding_sessions(email)
  WHERE completed = false;

-- Organizations Tabelle anpassen (erweitert companies)
SELECT _add_col_if_missing('companies','plan','plan_code DEFAULT ''free''');
SELECT _add_col_if_missing('companies','plan_status','text DEFAULT ''inactive''');

-- Org Preferences Tabelle für looking_for
CREATE TABLE IF NOT EXISTS org_preferences (
  org_id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  looking_for looking_tag[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Entitlements Tabelle
CREATE TABLE IF NOT EXISTS org_entitlements (
  org_id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  unlock_tokens_total integer NOT NULL DEFAULT 0,
  unlock_tokens_used integer NOT NULL DEFAULT 0,
  job_postings_limit integer NOT NULL DEFAULT 0,
  matching_tier text DEFAULT 'none',
  ads_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Billing Events Tabelle
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies für neue Tabellen
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Policies für onboarding_sessions
CREATE POLICY "Users can access their sessions" ON onboarding_sessions
  FOR ALL USING (auth.uid() = claimed_by OR auth.uid() IS NOT NULL);

-- Policies für org_preferences  
CREATE POLICY "Company members can view preferences" ON org_preferences
  FOR SELECT USING (org_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

CREATE POLICY "Company admins can manage preferences" ON org_preferences
  FOR ALL USING (org_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid() AND role = 'admin'));

-- Policies für org_entitlements
CREATE POLICY "Company members can view entitlements" ON org_entitlements
  FOR SELECT USING (org_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Policies für billing_events
CREATE POLICY "Company members can view billing events" ON billing_events
  FOR SELECT USING (org_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid()));

-- Apply Entitlements Function
CREATE OR REPLACE FUNCTION apply_entitlements(p_org_id uuid, p_plan plan_code)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_tokens integer;
  v_jobs integer;
  v_matching text;
  v_ads boolean;
BEGIN
  -- Plan-spezifische Entitlements
  CASE p_plan
    WHEN 'free' THEN
      v_tokens := 3; v_jobs := 0; v_matching := 'none'; v_ads := false;
    WHEN 'starter' THEN  
      v_tokens := 10; v_jobs := 1; v_matching := 'guaranteed_2'; v_ads := false;
    WHEN 'premium' THEN
      v_tokens := 50; v_jobs := 10; v_matching := 'personalized_email'; v_ads := true;
    ELSE
      RAISE EXCEPTION 'unknown_plan: %', p_plan;
  END CASE;

  -- Upsert Entitlements
  INSERT INTO org_entitlements (org_id, unlock_tokens_total, job_postings_limit, matching_tier, ads_enabled)
  VALUES (p_org_id, v_tokens, v_jobs, v_matching, v_ads)
  ON CONFLICT (org_id) DO UPDATE SET
    unlock_tokens_total = EXCLUDED.unlock_tokens_total,
    job_postings_limit = EXCLUDED.job_postings_limit,
    matching_tier = EXCLUDED.matching_tier,
    ads_enabled = EXCLUDED.ads_enabled,
    updated_at = now();

  -- Update company plan status
  UPDATE companies 
  SET plan = p_plan, plan_status = 'active', updated_at = now()
  WHERE id = p_org_id;
END;
$$;