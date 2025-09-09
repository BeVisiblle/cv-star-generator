-- Job Posting Limits and Token System
-- Add job posting limits to plans and implement token-based job publishing

-- 1) Add job posting limits to plans
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_job_posts int DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS job_post_tokens_per_post int DEFAULT 1;

-- Update existing plans with job posting limits
UPDATE public.plans SET 
  max_job_posts = CASE 
    WHEN id = 'starter' THEN 2
    WHEN id = 'growth' THEN 10
    WHEN id = 'pro' THEN 50
    ELSE 0
  END,
  job_post_tokens_per_post = 1
WHERE id IN ('starter', 'growth', 'pro');

-- 2) Add job posting tracking to company subscriptions
ALTER TABLE public.company_subscriptions ADD COLUMN IF NOT EXISTS job_posts_used int DEFAULT 0;
ALTER TABLE public.company_subscriptions ADD COLUMN IF NOT EXISTS job_posts_limit int DEFAULT 0;

-- Update existing subscriptions with job posting limits
UPDATE public.company_subscriptions cs
SET job_posts_limit = p.max_job_posts
FROM public.plans p
WHERE cs.plan_id = p.id;

-- 3) Create job posting token consumption function
CREATE OR REPLACE FUNCTION public.consume_job_post_tokens(
  _company_id uuid,
  _job_id uuid DEFAULT NULL
) RETURNS TABLE(
  success boolean,
  remaining_tokens int,
  remaining_job_posts int,
  message text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_plan_id text;
  v_tokens_per_post int;
  v_job_posts_limit int;
  v_job_posts_used int;
  v_token_balance int;
  v_remaining_tokens int;
  v_remaining_job_posts int;
BEGIN
  -- Check company access
  IF NOT public.has_company_access(_company_id) THEN
    RETURN QUERY SELECT false, 0, 0, 'ACCESS_DENIED'::text;
    RETURN;
  END IF;

  -- Get company subscription details
  SELECT cs.plan_id, cs.job_posts_limit, cs.job_posts_used, cs.token_balance,
         p.job_post_tokens_per_post
  INTO v_plan_id, v_job_posts_limit, v_job_posts_used, v_token_balance, v_tokens_per_post
  FROM public.company_subscriptions cs
  JOIN public.plans p ON p.id = cs.plan_id
  WHERE cs.company_id = _company_id;

  -- Check if company has subscription
  IF v_plan_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'NO_SUBSCRIPTION'::text;
    RETURN;
  END IF;

  -- Check job posting limit
  IF v_job_posts_used >= v_job_posts_limit THEN
    RETURN QUERY SELECT false, v_token_balance, (v_job_posts_limit - v_job_posts_used), 'JOB_POST_LIMIT_REACHED'::text;
    RETURN;
  END IF;

  -- Check token balance
  IF v_token_balance < v_tokens_per_post THEN
    RETURN QUERY SELECT false, v_token_balance, (v_job_posts_limit - v_job_posts_used), 'INSUFFICIENT_TOKENS'::text;
    RETURN;
  END IF;

  -- Consume tokens and increment job posts counter
  PERFORM pg_advisory_xact_lock(hashtext(_company_id::text));

  UPDATE public.company_subscriptions
  SET token_balance = token_balance - v_tokens_per_post,
      job_posts_used = job_posts_used + 1,
      updated_at = now()
  WHERE company_id = _company_id
    AND token_balance >= v_tokens_per_post
    AND job_posts_used < job_posts_limit;

  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, v_token_balance, (v_job_posts_limit - v_job_posts_used), 'UPDATE_FAILED'::text;
    RETURN;
  END IF;

  -- Get updated balances
  SELECT token_balance, (job_posts_limit - job_posts_used)
  INTO v_remaining_tokens, v_remaining_job_posts
  FROM public.company_subscriptions
  WHERE company_id = _company_id;

  -- Log token consumption
  INSERT INTO public.token_ledger(company_id, delta, reason, ref, client_request_id)
  VALUES (_company_id, -v_tokens_per_post, 'job_post', _job_id::text, gen_random_uuid());

  RETURN QUERY SELECT true, v_remaining_tokens, v_remaining_job_posts, 'SUCCESS'::text;
END;
$$;

-- 4) Create function to check job posting limits
CREATE OR REPLACE FUNCTION public.check_job_posting_limits(
  _company_id uuid
) RETURNS TABLE(
  can_post boolean,
  remaining_tokens int,
  remaining_job_posts int,
  tokens_per_post int,
  message text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_plan_id text;
  v_tokens_per_post int;
  v_job_posts_limit int;
  v_job_posts_used int;
  v_token_balance int;
  v_remaining_tokens int;
  v_remaining_job_posts int;
  v_can_post boolean;
BEGIN
  -- Check company access
  IF NOT public.has_company_access(_company_id) THEN
    RETURN QUERY SELECT false, 0, 0, 0, 'ACCESS_DENIED'::text;
    RETURN;
  END IF;

  -- Get company subscription details
  SELECT cs.plan_id, cs.job_posts_limit, cs.job_posts_used, cs.token_balance,
         p.job_post_tokens_per_post
  INTO v_plan_id, v_job_posts_limit, v_job_posts_used, v_token_balance, v_tokens_per_post
  FROM public.company_subscriptions cs
  JOIN public.plans p ON p.id = cs.plan_id
  WHERE cs.company_id = _company_id;

  -- Check if company has subscription
  IF v_plan_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 0, 'NO_SUBSCRIPTION'::text;
    RETURN;
  END IF;

  v_remaining_tokens := v_token_balance;
  v_remaining_job_posts := v_job_posts_limit - v_job_posts_used;
  v_can_post := v_remaining_tokens >= v_tokens_per_post AND v_remaining_job_posts > 0;

  RETURN QUERY SELECT v_can_post, v_remaining_tokens, v_remaining_job_posts, v_tokens_per_post, 'SUCCESS'::text;
END;
$$;

-- 5) Create function to publish job with token consumption
CREATE OR REPLACE FUNCTION public.publish_job_with_tokens(
  _job_id uuid
) RETURNS TABLE(
  success boolean,
  remaining_tokens int,
  remaining_job_posts int,
  message text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_company_id uuid;
  v_result record;
BEGIN
  -- Get job company
  SELECT company_id INTO v_company_id
  FROM public.job_posts
  WHERE id = _job_id;

  IF v_company_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'JOB_NOT_FOUND'::text;
    RETURN;
  END IF;

  -- Consume tokens
  SELECT * INTO v_result
  FROM public.consume_job_post_tokens(v_company_id, _job_id);

  -- If successful, publish the job
  IF v_result.success THEN
    UPDATE public.job_posts
    SET is_public = true,
        is_active = true,
        published_at = now()
    WHERE id = _job_id;
  END IF;

  RETURN QUERY SELECT v_result.success, v_result.remaining_tokens, v_result.remaining_job_posts, v_result.message;
END;
$$;

-- 6) Grant permissions
GRANT EXECUTE ON FUNCTION public.consume_job_post_tokens(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_job_posting_limits(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_job_with_tokens(uuid) TO authenticated;

-- 7) Add RLS policies for job posting limits
CREATE POLICY "Companies can view their own job posting limits"
ON public.company_subscriptions
FOR SELECT
TO authenticated
USING (public.has_company_access(company_id));

-- 8) Create index for performance
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_job_posts 
ON public.company_subscriptions(company_id, job_posts_used, job_posts_limit);
