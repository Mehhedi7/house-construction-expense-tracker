-- 20231119_init.sql – Supabase migration for House Construction Expense Tracker

create extension if not exists "pgcrypto";

-- Table: public.expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  amount numeric not null check (amount > 0),
  category text not null default 'Miscellaneous',
  date date not null default current_date,
  note text,
  created_at timestamp with time zone default now()
);

-- Table: public.categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '📦',
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
alter table public.expenses enable row level security;
alter table public.categories enable row level security;

-- Policies for expenses
drop policy if exists "allow select own expenses" on public.expenses;
drop policy if exists "allow insert own expenses" on public.expenses;
drop policy if exists "allow update own expenses" on public.expenses;
drop policy if exists "allow delete own expenses" on public.expenses;

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

-- Policies for categories
drop policy if exists "allow select categories" on public.categories;
drop policy if exists "allow insert own categories" on public.categories;
drop policy if exists "allow update own categories" on public.categories;
drop policy if exists "allow delete own categories" on public.categories;

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

-- Seed Preset Categories
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
