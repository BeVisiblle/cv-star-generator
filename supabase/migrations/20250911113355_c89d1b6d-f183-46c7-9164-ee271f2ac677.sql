-- Create posts table if not exists (enhanced version)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  body text not null,
  attachments jsonb default '[]'::jsonb,
  like_count int default 0 not null,
  comment_count int default 0 not null,
  created_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_posts_created on public.posts(created_at desc);
create index if not exists idx_posts_author on public.posts(author_id);

-- Create post_likes table
create table if not exists public.post_likes (
  user_id uuid not null,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Create follows table for social proof
create table if not exists public.follows (
  follower_id uuid not null,
  followee_id uuid not null,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id)
);

-- Create indexes for follows
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_followee on public.follows(followee_id);

-- Triggers for maintaining counts
create or replace function public.trg_post_comment_inc() returns trigger as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  if new.parent_id is not null then
    update public.comments set reply_count = reply_count + 1 where id = new.parent_id;
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function public.trg_post_comment_dec() returns trigger as $$
begin
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  if old.parent_id is not null then
    update public.comments set reply_count = greatest(reply_count - 1, 0) where id = old.parent_id;
  end if;
  return old;
end;
$$ language plpgsql;

create or replace function public.trg_post_like_inc() returns trigger as $$
begin 
  update public.posts set like_count = like_count + 1 where id = new.post_id; 
  return new; 
end;
$$ language plpgsql;

create or replace function public.trg_post_like_dec() returns trigger as $$
begin 
  update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id; 
  return old; 
end;
$$ language plpgsql;

-- Create triggers
drop trigger if exists comments_inc on public.comments;
create trigger comments_inc after insert on public.comments for each row execute procedure public.trg_post_comment_inc();

drop trigger if exists comments_dec on public.comments;
create trigger comments_dec after delete on public.comments for each row execute procedure public.trg_post_comment_dec();

drop trigger if exists post_like_inc on public.post_likes;
create trigger post_like_inc after insert on public.post_likes for each row execute procedure public.trg_post_like_inc();

drop trigger if exists post_like_dec on public.post_likes;
create trigger post_like_dec after delete on public.post_likes for each row execute procedure public.trg_post_like_dec();

-- Enable RLS
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.follows enable row level security;

-- RLS Policies for posts
drop policy if exists "read posts" on public.posts;
create policy "read posts" on public.posts for select using (true);

drop policy if exists "insert own posts" on public.posts;
create policy "insert own posts" on public.posts for insert with check (auth.uid() = author_id);

drop policy if exists "update own posts" on public.posts;
create policy "update own posts" on public.posts for update using (auth.uid() = author_id);

drop policy if exists "delete own posts" on public.posts;
create policy "delete own posts" on public.posts for delete using (auth.uid() = author_id);

-- RLS Policies for post_likes
drop policy if exists "read post_likes" on public.post_likes;
create policy "read post_likes" on public.post_likes for select using (true);

drop policy if exists "like post" on public.post_likes;
create policy "like post" on public.post_likes for insert with check (auth.uid() = user_id);

drop policy if exists "unlike post" on public.post_likes;
create policy "unlike post" on public.post_likes for delete using (auth.uid() = user_id);

-- RLS Policies for follows
drop policy if exists "read follows" on public.follows;
create policy "read follows" on public.follows for select using (true);

drop policy if exists "manage follows" on public.follows;
create policy "manage follows" on public.follows 
  for all using (auth.uid() = follower_id) 
  with check (auth.uid() = follower_id);

-- Social proof view
create or replace view public.v_post_social_proof as
select pl.post_id, pl.user_id as actor_id, 'like' as action, pl.created_at
from public.post_likes pl
union all
select c.post_id, c.author_id as actor_id, 'comment' as action, c.created_at
from public.comments c
where c.parent_id is null;

-- Storage bucket for post attachments
insert into storage.buckets (id, name, public) 
values ('post-attachments', 'post-attachments', true)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "public read post attachments" on storage.objects;
create policy "public read post attachments" on storage.objects
  for select using (bucket_id = 'post-attachments');

drop policy if exists "user can upload post attachments" on storage.objects;
create policy "user can upload post attachments" on storage.objects
  for insert with check (bucket_id = 'post-attachments' and auth.uid() is not null);