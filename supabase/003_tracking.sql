-- Asad Tools — 003_tracking.sql — Supabase saves EVERYTHING.
-- Run AFTER 001_init.sql and 002_seed_products.sql in Supabase > SQL Editor.
-- Tables: login_history, visitors, purchases, user_activity (+ orders extended,
-- profiles extended with first/last login, first order, totals).
-- RLS: users see ONLY their own rows. Owner Asad sees ALL rows in the
-- Supabase Dashboard > Table Editor (the dashboard owner bypasses RLS —
-- RLS only limits what the app / anon key can read, never the project owner).
-- Never paste a real key here. Keys go in .env files only.

-- ---------- profiles: first / earlier data + work history summary ----------
alter table public.profiles
  add column if not exists first_login_at timestamptz,
  add column if not exists last_login_at timestamptz,
  add column if not exists login_count int default 0,
  add column if not exists first_order_at timestamptz,
  add column if not exists last_order_at timestamptz,
  add column if not exists total_orders int default 0,
  add column if not exists total_spent int default 0,
  add column if not exists is_owner boolean default false;

-- Owner flag: set Asad's own row after he registers (replace the email):
-- update public.profiles set is_owner = true where email = 'asad-owner@gmail.com';

-- ---------- 1) login_history: who logged in, when, from which device/browser ----------
create table if not exists public.login_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text,
  login_at timestamptz default now(),
  method text default 'email',        -- email | phone | google
  success boolean default true,
  user_agent text,                     -- full browser string
  device text,                         -- e.g. "Android / Chrome 131" (parsed in the app/server)
  ip_address text,
  created_at timestamptz default now()
);
alter table public.login_history enable row level security;
create policy "Users can view their own login history" on public.login_history
  for select using (auth.uid() = user_id);
create policy "Users can insert their own login history" on public.login_history
  for insert with check (auth.uid() = user_id);
-- No update / delete policy for users: history is never edited or deleted by users.

-- ---------- 2) visitors: who visited the web (even without login) ----------
create table if not exists public.visitors (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  email text,                          -- filled once the visitor logs in
  visited_at timestamptz default now(),
  page text default '/',
  referrer text,
  user_agent text,
  device text,
  ip_address text,
  created_at timestamptz default now()
);
alter table public.visitors enable row level security;
create policy "Users can view their own visits" on public.visitors
  for select using (auth.uid() = user_id);
create policy "Anyone can record a visit" on public.visitors
  for insert with check (true);
-- Anonymous visits have user_id NULL — only the owner (Table Editor) sees those.

-- ---------- 3) orders: extend with full buyer + plan detail ----------
alter table public.orders
  add column if not exists buyer_name text,
  add column if not exists phone text,
  add column if not exists plan_months text,   -- '1','6','12','24','14d' or null
  add column if not exists category text,
  add column if not exists whatsapp_order boolean default true,
  add column if not exists payment_method text default 'Easypaisa',
  add column if not exists updated_at timestamptz default now();

-- ---------- 4) purchases: who bought what — the completed-sale record ----------
-- An order is the WhatsApp intent; a purchase is the confirmed sale
-- (owner marks it paid/delivered after Easypaisa proof on WhatsApp).
create table if not exists public.purchases (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  buyer_name text not null,
  email text not null,
  phone text,
  product_id int references public.products(id),
  product_name text not null,
  category text,
  plan_months text,
  price int,
  payment_method text default 'Easypaisa',
  payment_reference text,              -- Easypaisa screenshot / TrxID from WhatsApp
  status text default 'paid',          -- paid | delivered | refunded
  purchased_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.purchases enable row level security;
create policy "Users can view their own purchases" on public.purchases
  for select using (auth.uid() = user_id);
create policy "Users can insert their own purchases" on public.purchases
  for insert with check (auth.uid() = user_id);
-- Status changes are owner-only (service role / Table Editor).

-- ---------- 5) user_activity: first + all past work, in one timeline ----------
-- activity_type: signup | first_login | login | first_order | order | purchase |
--                visit | logout | password_change
create table if not exists public.user_activity (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  activity_type text not null,
  details jsonb default '{}'::jsonb,   -- { product, price, plan_months, device, ... }
  created_at timestamptz default now()
);
alter table public.user_activity enable row level security;
create policy "Users can view their own activity" on public.user_activity
  for select using (auth.uid() = user_id);
create policy "Users can insert their own activity" on public.user_activity
  for insert with check (auth.uid() = user_id);

-- ---------- Automatic history: keep profiles + activity in sync ----------
-- Every login row updates first/last login + count, and adds an activity row.
create or replace function public.after_login_history()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is not null then
    update public.profiles
      set first_login_at = coalesce(first_login_at, new.login_at),
          last_login_at = new.login_at,
          login_count = login_count + 1
      where id = new.user_id;
    insert into public.user_activity (user_id, email, activity_type, details)
    values (new.user_id, new.email,
      case when (select login_count from public.profiles where id = new.user_id) <= 1
        then 'first_login' else 'login' end,
      jsonb_build_object('device', new.device, 'method', new.method, 'success', new.success));
  end if;
  return new;
end;
$$;
drop trigger if exists trg_after_login_history on public.login_history;
create trigger trg_after_login_history after insert on public.login_history
  for each row execute function public.after_login_history();

-- Every order updates first/last order + totals, and adds activity rows.
create or replace function public.after_order()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is not null then
    update public.profiles
      set first_order_at = coalesce(first_order_at, new.created_at),
          last_order_at = new.created_at,
          total_orders = total_orders + 1,
          total_spent = total_spent + coalesce(new.price, 0)
      where id = new.user_id;
    insert into public.user_activity (user_id, email, activity_type, details)
    values (new.user_id, new.email,
      case when (select total_orders from public.profiles where id = new.user_id) <= 1
        then 'first_order' else 'order' end,
      jsonb_build_object('product', new.product_name, 'price', new.price,
        'plan_months', new.plan_months, 'category', new.category));
  end if;
  return new;
end;
$$;
drop trigger if exists trg_after_order on public.orders;
create trigger trg_after_order after insert on public.orders
  for each row execute function public.after_order();

-- Every purchase adds an activity row too.
create or replace function public.after_purchase()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is not null then
    insert into public.user_activity (user_id, email, activity_type, details)
    values (new.user_id, new.email, 'purchase',
      jsonb_build_object('product', new.product_name, 'price', new.price,
        'plan_months', new.plan_months, 'status', new.status));
  end if;
  return new;
end;
$$;
drop trigger if exists trg_after_purchase on public.purchases;
create trigger trg_after_purchase after insert on public.purchases
  for each row execute function public.after_purchase();

-- ---------- Owner views (run in SQL Editor — owner only) ----------
-- Who bought Muse AI Account (full buyer details):
--   select * from public.purchases where product_name ilike '%Muse%' order by purchased_at desc;
-- All orders, newest first:
--   select * from public.orders order by created_at desc;
-- Login history for one buyer:
--   select * from public.login_history where email = 'buyer@gmail.com' order by login_at desc;
-- One user's full timeline (first login, first order, all past work):
--   select * from public.user_activity where email = 'buyer@gmail.com' order by created_at;
-- Visitors today:
--   select * from public.visitors where visited_at >= current_date order by visited_at desc;
