-- ==============================================================================
-- ARKITEKI STUDIO & LICENSURE COMPANION: SUPABASE DATABASE & STORAGE SCHEMA
-- ==============================================================================
-- Run this entire script in your Supabase Project's SQL Editor (Dashboard > SQL Editor)

-- 1. Create Profiles Table (linked with Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  school text,
  target_exam_year text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Automatically create a profile when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, school, target_exam_year)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'school',
    coalesce(new.raw_user_meta_data->>'targetExamYear', 'June 2026 ALE')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to invoke profile creation on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. Create Saved Prompts Table
create table if not exists public.saved_prompts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  prompt text not null,
  category text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Enable RLS for Saved Prompts
alter table public.saved_prompts enable row level security;

create policy "Users can view their own saved prompts"
  on public.saved_prompts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved prompts"
  on public.saved_prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved prompts"
  on public.saved_prompts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved prompts"
  on public.saved_prompts for delete
  using (auth.uid() = user_id);


-- 3. Create Quiz History Table (Stores Licensure simulation scores & progress)
create table if not exists public.quiz_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  deck_title text not null,
  score integer not null,
  total_questions integer not null,
  percentage numeric not null,
  created_at timestamptz default now()
);

-- Enable RLS for Quiz History
alter table public.quiz_history enable row level security;

create policy "Users can view their own quiz history"
  on public.quiz_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quiz history"
  on public.quiz_history for insert
  with check (auth.uid() = user_id);


-- 4. Create Storage Bucket for Review Materials (PDFs, images, slides)
insert into storage.buckets (id, name, public)
values ('review-materials', 'review-materials', true)
on conflict (id) do nothing;

-- Storage RLS Policies
create policy "Authenticated users can upload review materials"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'review-materials' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own uploaded review materials"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'review-materials' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view public review materials"
  on storage.objects for select
  using (bucket_id = 'review-materials');
