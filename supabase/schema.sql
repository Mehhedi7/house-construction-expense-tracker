-- ============================================================
-- Supabase Schema for House Construction Expense Tracker
-- Copy and run this entire script in your Supabase SQL Editor.
-- ============================================================

-- 1. Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- 2. Create the expenses table if it does not exist
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  amount numeric not null check (amount > 0),
  category text not null default 'Miscellaneous',
  date date not null default current_date,
  note text,
  created_at timestamp with time zone default now()
);

-- Safely add missing columns and adjust constraints if table previously existed
do $$
begin
  -- Ensure user_id column exists
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'user_id') then
    alter table public.expenses add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
  end if;

  -- Ensure amount column exists
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'amount') then
    alter table public.expenses add column amount numeric not null default 0 check (amount > 0);
  end if;

  -- Ensure category column exists
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'category') then
    alter table public.expenses add column category text not null default 'Miscellaneous';
  end if;

  -- Ensure date column exists
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'date') then
    alter table public.expenses add column date date not null default current_date;
  end if;

  -- Ensure note column exists
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'note') then
    alter table public.expenses add column note text;
  end if;

  -- Ensure created_at column exists
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'created_at') then
    alter table public.expenses add column created_at timestamp with time zone default now();
  end if;

  -- If legacy 'title' column exists from the starter app, make it nullable so it won't block inserts
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'title') then
    alter table public.expenses alter column title drop not null;
  end if;

  -- If legacy 'category_id' column exists, make it nullable
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'expenses' and column_name = 'category_id') then
    alter table public.expenses alter column category_id drop not null;
  end if;
end $$;

-- 3. Create the categories table if it does not exist
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '📦',
  created_at timestamp with time zone default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.expenses enable row level security;
alter table public.categories enable row level security;

-- Drop prior policies if they exist to avoid duplication errors
drop policy if exists "allow select own expenses" on public.expenses;
drop policy if exists "allow insert own expenses" on public.expenses;
drop policy if exists "allow update own expenses" on public.expenses;
drop policy if exists "allow delete own expenses" on public.expenses;

drop policy if exists "allow select categories" on public.categories;
drop policy if exists "allow insert own categories" on public.categories;
drop policy if exists "allow update own categories" on public.categories;
drop policy if exists "allow delete own categories" on public.categories;

-- RLS Policies for expenses: Users can only see, create, update, and delete their own rows
create policy "allow select own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "allow insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "allow update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "allow delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- RLS Policies for categories: Users can see system presets (user_id is null) or their own custom categories
create policy "allow select categories"
  on public.categories for select
  using (user_id is null or auth.uid() = user_id);

create policy "allow insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "allow update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "allow delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- 5. Seed Preset Categories (where user_id is NULL for global access)
insert into public.categories (name, icon, user_id)
select c.name, c.icon, null
from (values
  ('Land & Registration',   '🏞️'),
  ('Design & Approval',     '📋'),
  ('Foundation',            '🏗️'),
  ('Bricks & Masonry',      '🧱'),
  ('Cement & Sand',         '⏳'),
  ('Rod & Steel',           '🔩'),
  ('Labor Wages',           '👷‍♂️'),
  ('Electrical',            '⚡'),
  ('Plumbing & Sanitary',   '🚿'),
  ('Tiles & Flooring',      '🪵'),
  ('Doors & Windows',       '🚪'),
  ('Paint & Finish',        '🎨'),
  ('Furniture & Fixtures',  '🛋️'),
  ('Transport',             '🚚'),
  ('Miscellaneous',         '📦')
) as c(name, icon)
where not exists (
  select 1 from public.categories where public.categories.name = c.name and public.categories.user_id is null
);
