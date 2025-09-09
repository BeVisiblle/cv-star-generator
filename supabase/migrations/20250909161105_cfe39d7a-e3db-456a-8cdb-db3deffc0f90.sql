-- Update the starter plan to allow 3 free job posts
UPDATE plans 
SET max_job_posts = 3 
WHERE id = 'starter';

-- Also ensure companies can save drafts by updating subscription limits
-- Create a basic free plan if it doesn't exist
INSERT INTO plans (id, name, max_job_posts, tokens_per_post, included_tokens, included_seats, max_seats, monthly_price_cents, active)
VALUES ('free', 'Free', 3, 0, 0, 1, 1, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  max_job_posts = 3,
  tokens_per_post = 0;