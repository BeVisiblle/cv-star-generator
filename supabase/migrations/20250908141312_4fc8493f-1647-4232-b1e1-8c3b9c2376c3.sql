-- Ensure documents bucket exists and is public
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Enable RLS on user_documents table
alter table if exists public.user_documents enable row level security;

-- Drop existing permissive policies to avoid duplicates (safe-if-exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_documents' AND policyname = 'user_docs_owner_all'
  ) THEN
    DROP POLICY "user_docs_owner_all" ON public.user_documents;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_documents' AND policyname = 'company_can_view_unlocked_docs'
  ) THEN
    DROP POLICY "company_can_view_unlocked_docs" ON public.user_documents;
  END IF;
END $$;

-- Owners can fully manage their own documents
create policy "user_docs_owner_all"
  on public.user_documents
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Company members can view documents of unlocked candidates
create policy "company_can_view_unlocked_docs"
  on public.user_documents
  for select
  using (
    exists (
      select 1
      from public.company_users cu
      join public.company_candidates cc on cc.company_id = cu.company_id
      where cu.user_id = auth.uid()
        and cc.candidate_id = user_documents.user_id
        and (cc.unlocked_at is not null or cc.stage <> 'new')
    )
  );
