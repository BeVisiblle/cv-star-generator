-- Break RLS recursion between groups and group_members
-- 1) Helper functions with SECURITY DEFINER (stable, fixed search_path)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_group(_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = _group_id
      AND visibility = 'public'
  );
$$;

-- 2) Replace recursive groups SELECT policy
DROP POLICY IF EXISTS "Groups visibility based on type and membership" ON public.groups;
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.groups;

CREATE POLICY "Public or member can view groups" ON public.groups
FOR SELECT USING (
  visibility = 'public' OR public.is_group_member(id) OR auth.uid() IS NOT NULL
);

-- 3) Replace group_members policy to avoid direct table references
DROP POLICY IF EXISTS "View group memberships" ON public.group_members;

CREATE POLICY "View group memberships" ON public.group_members
FOR SELECT USING (
  auth.uid() = user_id OR public.is_public_group(group_id) OR public.is_group_member(group_id)
);