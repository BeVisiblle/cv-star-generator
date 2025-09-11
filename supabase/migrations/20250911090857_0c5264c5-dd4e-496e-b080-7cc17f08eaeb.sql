-- Erweitere die community_posts Tabelle für vollständige Sichtbarkeits-Optionen
ALTER TYPE post_visibility ADD VALUE IF NOT EXISTS 'followers' AFTER 'public';
ALTER TYPE post_visibility ADD VALUE IF NOT EXISTS 'connections' AFTER 'followers';

-- Migriere company_posts zu community_posts
INSERT INTO community_posts (
  id, 
  actor_company_id, 
  body_md, 
  created_at, 
  updated_at, 
  visibility, 
  post_kind
)
SELECT 
  id,
  company_id,
  content,
  created_at,
  created_at,
  CASE 
    WHEN visibility = 'public' THEN 'public'::post_visibility
    ELSE 'public'::post_visibility
  END,
  'text'::post_kind
FROM company_posts
WHERE id NOT IN (SELECT id FROM community_posts)
ON CONFLICT (id) DO NOTHING;

-- Migriere posts zu community_posts (falls es welche gibt)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
    -- Prüfe welche Spalten existieren
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'content') THEN
      INSERT INTO community_posts (
        id, 
        actor_user_id, 
        body_md, 
        created_at, 
        updated_at, 
        visibility, 
        post_kind
      )
      SELECT 
        id,
        author_id,
        content,
        created_at,
        COALESCE(updated_at, created_at),
        'public'::post_visibility,
        'text'::post_kind
      FROM posts
      WHERE id NOT IN (SELECT id FROM community_posts)
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- Erstelle eine RPC Funktion zum Erstellen von Posts
CREATE OR REPLACE FUNCTION create_community_post(
  p_body_md text,
  p_visibility post_visibility DEFAULT 'public',
  p_media jsonb DEFAULT '[]',
  p_job_id uuid DEFAULT NULL,
  p_actor_user_id uuid DEFAULT NULL,
  p_actor_company_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id uuid;
BEGIN
  -- Validierung: Entweder user_id oder company_id muss gesetzt sein
  IF p_actor_user_id IS NULL AND p_actor_company_id IS NULL THEN
    RAISE EXCEPTION 'Either actor_user_id or actor_company_id must be provided';
  END IF;
  
  IF p_actor_user_id IS NOT NULL AND p_actor_company_id IS NOT NULL THEN
    RAISE EXCEPTION 'Only one of actor_user_id or actor_company_id can be provided';
  END IF;

  -- Post erstellen
  INSERT INTO community_posts (
    actor_user_id,
    actor_company_id,
    body_md,
    visibility,
    media,
    job_id,
    post_kind
  ) VALUES (
    p_actor_user_id,
    p_actor_company_id,
    p_body_md,
    p_visibility,
    p_media,
    p_job_id,
    CASE WHEN p_job_id IS NOT NULL THEN 'job_share' ELSE 'text' END
  )
  RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$;