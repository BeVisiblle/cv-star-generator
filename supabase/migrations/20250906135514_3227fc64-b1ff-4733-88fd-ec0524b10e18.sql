-- 1.1 Feature-Flag „Passwort nach Verify erforderlich"
CREATE TABLE IF NOT EXISTS app_settings (
  id       boolean PRIMARY KEY DEFAULT true,
  require_password_after_verify boolean NOT NULL DEFAULT false
);

-- falls schon vorhanden einfach ignorieren
INSERT INTO app_settings (id, require_password_after_verify)
VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

-- 1.2 Hilfsfunktion für idempotente Spalten-Ergänzung (korrigiert)
CREATE OR REPLACE FUNCTION _add_col_if_missing(p_table_name text, p_column_name text, p_column_def text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name 
    AND column_name = p_column_name
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', p_table_name, p_column_name, p_column_def);
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
SELECT _add_col_if_missing('onboarding_sessions','stripe_status','text');
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