-- Supabase Schema for Smart Space & Rental Management System (v2)

-- 1. Enable btree_gist extension for booking overlap constraint
create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- 2. Create tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','owner','staff','customer')),
  full_name text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('flat','venue','studio')),
  title text not null,
  description text,
  location text,
  base_price numeric not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  storage_path text not null
);

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  rate_type text not null check (rate_type in ('hourly','daily','monthly')),
  amount numeric not null
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id),
  customer_id uuid references public.profiles(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  total_price numeric,
  created_at timestamptz default now(),
  exclude using gist (
    property_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status <> 'cancelled')
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id),
  customer_id uuid references public.profiles(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create sequence if not exists invoice_number_seq start 1000;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  invoice_number int not null default nextval('invoice_number_seq'),
  amount numeric not null,
  generated_at timestamptz default now()
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id),
  property_id uuid references public.properties(id),
  unique (customer_id, property_id)
);

-- 3. Auth trigger - auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  assigned_role text;
begin
  if new.raw_user_meta_data is not null then
    assigned_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  else
    assigned_role := 'customer';
  end if;

  if assigned_role not in ('admin', 'owner', 'staff', 'customer') then
    assigned_role := 'customer';
  end if;

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    assigned_role,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name;

  return new;
exception when others then
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.invoices enable row level security;
alter table public.wishlist enable row level security;
