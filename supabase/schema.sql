-- Supabase Schema for Smart Space & Rental Management System (v2)

-- 1. Enable btree_gist extension for booking overlap constraint
create extension if not exists btree_gist;

-- 2. Create tables
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','owner','staff','customer')),
  full_name text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  type text not null check (type in ('flat','venue','studio')),
  title text not null,
  description text,
  location text,
  base_price numeric not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  storage_path text not null
);

create table if not exists pricing_rules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  rate_type text not null check (rate_type in ('hourly','daily','monthly')),
  amount numeric not null
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  customer_id uuid references profiles(id),
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

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  customer_id uuid references profiles(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create sequence if not exists invoice_number_seq start 1000;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id),
  invoice_number int not null default nextval('invoice_number_seq'),
  amount numeric not null,
  generated_at timestamptz default now()
);

create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  property_id uuid references properties(id),
  unique (customer_id, property_id)
);

-- 3. Auth trigger - auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table pricing_rules enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table invoices enable row level security;
alter table wishlist enable row level security;

-- Profiles RLS
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles for select using (
  auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "insert profile on auth" on profiles;
create policy "insert profile on auth" on profiles for insert with check (auth.uid() = id);

-- Properties RLS
drop policy if exists "public reads approved" on properties;
create policy "public reads approved" on properties for select using (
  status = 'approved' or owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
);

drop policy if exists "owner manages own" on properties;
create policy "owner manages own" on properties for insert with check (owner_id = auth.uid());

drop policy if exists "owner updates own" on properties;
create policy "owner updates own" on properties for update using (
  owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "owner deletes own" on properties;
create policy "owner deletes own" on properties for delete using (
  owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Property Images RLS
drop policy if exists "public reads property images" on property_images;
create policy "public reads property images" on property_images for select using (true);

drop policy if exists "owner manages images" on property_images;
create policy "owner manages images" on property_images for insert with check (
  exists (select 1 from properties pr where pr.id = property_id and pr.owner_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "owner deletes images" on property_images;
create policy "owner deletes images" on property_images for delete using (
  exists (select 1 from properties pr where pr.id = property_id and pr.owner_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Pricing Rules RLS
drop policy if exists "public reads pricing rules" on pricing_rules;
create policy "public reads pricing rules" on pricing_rules for select using (true);

drop policy if exists "owner manages pricing rules" on pricing_rules;
create policy "owner manages pricing rules" on pricing_rules for insert with check (
  exists (select 1 from properties pr where pr.id = property_id and pr.owner_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "owner updates pricing rules" on pricing_rules;
create policy "owner updates pricing rules" on pricing_rules for update using (
  exists (select 1 from properties pr where pr.id = property_id and pr.owner_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "owner deletes pricing rules" on pricing_rules;
create policy "owner deletes pricing rules" on pricing_rules for delete using (
  exists (select 1 from properties pr where pr.id = property_id and pr.owner_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Bookings RLS
drop policy if exists "customer own bookings" on bookings;
create policy "customer own bookings" on bookings for select using (
  customer_id = auth.uid() or
  exists (select 1 from properties pr where pr.id = property_id and pr.owner_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
);

drop policy if exists "customer creates booking" on bookings;
create policy "customer creates booking" on bookings for insert with check (customer_id = auth.uid());

drop policy if exists "parties update booking" on bookings;
create policy "parties update booking" on bookings for update using (
  customer_id = auth.uid() or
  exists (select 1 from properties pr where pr.id = property_id and pr.owner_id = auth.uid()) or
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
);

-- Reviews RLS
drop policy if exists "public reads reviews" on reviews;
create policy "public reads reviews" on reviews for select using (true);

drop policy if exists "customer creates review" on reviews;
create policy "customer creates review" on reviews for insert with check (customer_id = auth.uid());

-- Invoices RLS
drop policy if exists "invoice visible to involved parties" on invoices;
create policy "invoice visible to involved parties" on invoices for select using (
  exists (
    select 1 from bookings b
    where b.id = booking_id and (
      b.customer_id = auth.uid() or
      exists (select 1 from properties pr where pr.id = b.property_id and pr.owner_id = auth.uid()) or
      exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
    )
  )
);

drop policy if exists "invoices insert by booking owner or staff" on invoices;
create policy "invoices insert by booking owner or staff" on invoices for insert with check (true);

-- Wishlist RLS
drop policy if exists "own wishlist" on wishlist;
create policy "own wishlist" on wishlist for all using (customer_id = auth.uid());
