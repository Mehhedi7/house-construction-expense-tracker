-- 20231119_init.sql – Supabase migration for House Construction Expense Tracker

-- Enable pgcrypto for uuid generation if not already enabled
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table: public.categories
-- ------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  icon text default '🗂️',
  created_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- Table: public.expenses
-- ------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  category_id uuid references public.categories(id) not null,
  amount numeric not null check (amount > 0),
  date date not null default current_date,
  note text,
  vendor text,
  created_at timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.expenses   enable row level security;

create policy "allow select own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "allow insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "allow update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "allow delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

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

-- ------------------------------------------------------------
-- Function to seed default categories for a new user
-- ------------------------------------------------------------
create or replace function public.insert_default_categories(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.categories (user_id, name, icon) values
    (p_user_id, 'Land & Registration',   '🏞️'),
    (p_user_id, 'Design & Approval',     '🖼️'),
    (p_user_id, 'Foundation',            '🏗️'),
    (p_user_id, 'Bricks & Masonry',      '🧱'),
    (p_user_id, 'Cement & Sand',         '⚱️'),
    (p_user_id, 'Rod & Steel',           '🔩'),
    (p_user_id, 'Labor Wages',           '👷‍♂️'),
    (p_user_id, 'Electrical',            '🔌'),
    (p_user_id, 'Plumbing & Sanitary',   '🚰'),
    (p_user_id, 'Tiles & Flooring',      '🧩'),
    (p_user_id, 'Doors & Windows',       '🚪'),
    (p_user_id, 'Paint & Finish',        '🎨'),
    (p_user_id, 'Furniture & Fixtures',  '🛋️'),
    (p_user_id, 'Transport',             '🚚'),
    (p_user_id, 'Miscellaneous',         '📦');
end;
$$;

-- ------------------------------------------------------------
-- Trigger: After a new auth user is created, seed categories
-- ------------------------------------------------------------
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.insert_default_categories(new.id);
