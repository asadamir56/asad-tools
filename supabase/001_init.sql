-- Asad Tools — Supabase SQL (run in Supabase Dashboard > SQL Editor, in order)
-- Tables: profiles (users), products, orders. RLS on.
-- Never paste a real key here. Keys go in .env files only.

-- 1) profiles: one row per auth user. Supabase Auth creates auth.users;
--    this table holds the public profile (name, phone, WhatsApp).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  phone text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''), new.raw_user_meta_data->>'phone');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) products: 40 products, selling price already includes margin.
create table if not exists public.products (
  id int primary key,
  name text not null,
  detail text default '',
  category text not null,
  duration text,              -- '1','2','3','5','6','12','24','14d' or null
  base_price int,
  price int,                  -- selling price (Rs); null = WhatsApp par poochhain
  logo text,
  by_meta boolean default false,
  created_at timestamptz default now()
);
alter table public.products enable row level security;
create policy "Anyone can read products" on public.products for select using (true);
-- Only the owner (service role / admin) inserts products. No public insert policy.

-- 3) orders: customer orders, status pending -> confirmed -> delivered
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  product_id int references public.products(id),
  product_name text not null,
  price int,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "Users can create their own orders" on public.orders
  for insert with check (auth.uid() = user_id);
