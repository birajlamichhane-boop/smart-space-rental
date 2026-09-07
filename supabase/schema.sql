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
  check (ends_at > starts_at),
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

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

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

-- Add the constraint when this file is applied to an existing database.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and conname = 'bookings_valid_interval'
  ) then
    alter table public.bookings
      add constraint bookings_valid_interval check (ends_at > starts_at);
  end if;
end $$;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (
  auth.uid() = id or public.current_user_role() = 'admin'
);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "insert profile on auth" on public.profiles;
create policy "insert profile on auth" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "public reads approved" on public.properties;
create policy "public reads approved" on public.properties for select using (
  status = 'approved' or owner_id = auth.uid() or public.current_user_role() in ('admin', 'staff')
);

drop policy if exists "owner manages own" on public.properties;
create policy "owner manages own" on public.properties for insert with check (owner_id = auth.uid());

drop policy if exists "owner updates own" on public.properties;
create policy "owner updates own" on public.properties for update using (
  owner_id = auth.uid() or public.current_user_role() = 'admin'
);

drop policy if exists "owner deletes own" on public.properties;
create policy "owner deletes own" on public.properties for delete using (
  owner_id = auth.uid() or public.current_user_role() = 'admin'
);

drop policy if exists "public reads property images" on public.property_images;
create policy "public reads property images" on public.property_images for select using (true);

drop policy if exists "owner manages images" on public.property_images;
create policy "owner manages images" on public.property_images for insert with check (
  exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = auth.uid())
  or public.current_user_role() = 'admin'
);

drop policy if exists "owner deletes images" on public.property_images;
create policy "owner deletes images" on public.property_images for delete using (
  exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = auth.uid())
  or public.current_user_role() = 'admin'
);

drop policy if exists "public reads pricing rules" on public.pricing_rules;
create policy "public reads pricing rules" on public.pricing_rules for select using (true);

drop policy if exists "owner manages pricing rules" on public.pricing_rules;
create policy "owner manages pricing rules" on public.pricing_rules for insert with check (
  exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = auth.uid())
  or public.current_user_role() = 'admin'
);

drop policy if exists "owner updates pricing rules" on public.pricing_rules;
create policy "owner updates pricing rules" on public.pricing_rules for update using (
  exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = auth.uid())
  or public.current_user_role() = 'admin'
);

drop policy if exists "owner deletes pricing rules" on public.pricing_rules;
create policy "owner deletes pricing rules" on public.pricing_rules for delete using (
  exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = auth.uid())
  or public.current_user_role() = 'admin'
);

drop policy if exists "customer own bookings" on public.bookings;
create policy "customer own bookings" on public.bookings for select using (
  customer_id = auth.uid()
  or exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = auth.uid())
  or public.current_user_role() in ('admin', 'staff')
);

drop policy if exists "customer creates booking" on public.bookings;
create policy "customer creates booking" on public.bookings for insert with check (customer_id = auth.uid());

drop policy if exists "parties update booking" on public.bookings;
create policy "parties update booking" on public.bookings for update using (
  customer_id = auth.uid()
  or exists (select 1 from public.properties pr where pr.id = property_id and pr.owner_id = auth.uid())
  or public.current_user_role() in ('admin', 'staff')
);

drop policy if exists "public reads reviews" on public.reviews;
create policy "public reads reviews" on public.reviews for select using (true);

drop policy if exists "customer creates review" on public.reviews;
create policy "customer creates review" on public.reviews for insert with check (customer_id = auth.uid());

drop policy if exists "invoice visible to involved parties" on public.invoices;
create policy "invoice visible to involved parties" on public.invoices for select using (
  exists (
    select 1 from public.bookings b where b.id = booking_id and (
      b.customer_id = auth.uid()
      or exists (select 1 from public.properties pr where pr.id = b.property_id and pr.owner_id = auth.uid())
      or public.current_user_role() in ('admin', 'staff')
    )
  )
);

drop policy if exists "invoices insert by booking owner or staff" on public.invoices;
create policy "invoices insert by booking owner or staff" on public.invoices for insert with check (
  amount >= 0 and exists (
    select 1 from public.bookings b where b.id = booking_id and amount = b.total_price and (
      b.customer_id = auth.uid()
      or exists (select 1 from public.properties pr where pr.id = b.property_id and pr.owner_id = auth.uid())
      or public.current_user_role() in ('admin', 'staff')
    )
  )
);

drop policy if exists "own wishlist" on public.wishlist;
create policy "own wishlist" on public.wishlist for all using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
