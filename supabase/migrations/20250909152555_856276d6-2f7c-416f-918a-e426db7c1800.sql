-- Step 1: Create plans table first
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_cents integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Step 2: Add the missing columns to plans table
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS max_job_posts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_per_post integer DEFAULT 0;

-- Step 3: Insert default plans
INSERT INTO plans (id, name, max_job_posts, tokens_per_post) VALUES
  ('free', 'Free Plan', 1, 10),
  ('basic', 'Basic Plan', 5, 8),
  ('pro', 'Pro Plan', 20, 5),
  ('enterprise', 'Enterprise Plan', 100, 3)
ON CONFLICT (id) DO UPDATE SET
  max_job_posts = EXCLUDED.max_job_posts,
  tokens_per_post = EXCLUDED.tokens_per_post;