-- FULL DATABASE SETUP (Schema + Demo Users & Properties)
-- Copy and paste this ENTIRE file into Supabase SQL Editor & click RUN!

-- ========================================================
-- 1. EXTENSIONS
-- ========================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================================
-- 2. TABLES & SEQUENCES
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','owner','staff','customer')),
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('flat','venue','studio')),
  title text NOT NULL,
  description text,
  location text,
  base_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  rate_type text NOT NULL CHECK (rate_type IN ('hourly','daily','monthly')),
  amount numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id),
  customer_id uuid REFERENCES public.profiles(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  total_price numeric,
  created_at timestamptz DEFAULT now(),
  EXCLUDE USING gist (
    property_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status <> 'cancelled')
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id),
  customer_id uuid REFERENCES public.profiles(id),
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  invoice_number int NOT NULL DEFAULT nextval('invoice_number_seq'),
  amount numeric NOT NULL,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.profiles(id),
  property_id uuid REFERENCES public.properties(id),
  UNIQUE (customer_id, property_id)
);

-- ========================================================
-- 3. TRIGGERS & FUNCTIONS
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own profile" ON public.profiles;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert profile on auth" ON public.profiles;
CREATE POLICY "insert profile on auth" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "public reads approved" ON public.properties;
CREATE POLICY "public reads approved" ON public.properties FOR SELECT USING (
  status = 'approved' OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff'))
);

DROP POLICY IF EXISTS "owner manages own" ON public.properties;
CREATE POLICY "owner manages own" ON public.properties FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "owner updates own" ON public.properties;
CREATE POLICY "owner updates own" ON public.properties FOR UPDATE USING (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "owner deletes own" ON public.properties;
CREATE POLICY "owner deletes own" ON public.properties FOR DELETE USING (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "public reads property images" ON public.property_images;
CREATE POLICY "public reads property images" ON public.property_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "owner manages images" ON public.property_images;
CREATE POLICY "owner manages images" ON public.property_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = property_id AND pr.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "owner deletes images" ON public.property_images;
CREATE POLICY "owner deletes images" ON public.property_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = property_id AND pr.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "public reads pricing rules" ON public.pricing_rules;
CREATE POLICY "public reads pricing rules" ON public.pricing_rules FOR SELECT USING (true);

DROP POLICY IF EXISTS "owner manages pricing rules" ON public.pricing_rules;
CREATE POLICY "owner manages pricing rules" ON public.pricing_rules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = property_id AND pr.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "owner updates pricing rules" ON public.pricing_rules;
CREATE POLICY "owner updates pricing rules" ON public.pricing_rules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = property_id AND pr.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "owner deletes pricing rules" ON public.pricing_rules;
CREATE POLICY "owner deletes pricing rules" ON public.pricing_rules FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = property_id AND pr.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "customer own bookings" ON public.bookings;
CREATE POLICY "customer own bookings" ON public.bookings FOR SELECT USING (
  customer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = property_id AND pr.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff'))
);

DROP POLICY IF EXISTS "customer creates booking" ON public.bookings;
CREATE POLICY "customer creates booking" ON public.bookings FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "parties update booking" ON public.bookings;
CREATE POLICY "parties update booking" ON public.bookings FOR UPDATE USING (
  customer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = property_id AND pr.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','staff'))
);

DROP POLICY IF EXISTS "public reads reviews" ON public.reviews;
CREATE POLICY "public reads reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "customer creates review" ON public.reviews;
CREATE POLICY "customer creates review" ON public.reviews FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "invoice visible to involved parties" ON public.invoices;
CREATE POLICY "invoice visible to involved parties" ON public.invoices FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND (
      b.customer_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.properties pr WHERE pr.id = b.property_id AND pr.owner_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = b.property_id AND p.role IN ('admin','staff'))
    )
  )
);

DROP POLICY IF EXISTS "invoices insert by booking owner or staff" ON public.invoices;
CREATE POLICY "invoices insert by booking owner or staff" ON public.invoices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "own wishlist" ON public.wishlist;
CREATE POLICY "own wishlist" ON public.wishlist FOR ALL USING (customer_id = auth.uid());

-- ========================================================
-- 5. SEED AUTH USERS FIRST (AUTO-POPINATES PROFILES VIA TRIGGER)
-- ========================================================
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Vance (Admin)","role":"admin"}', now(), now()),
('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Jenkins (Admin)","role":"admin"}', now(), now()),
('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Sterling (Owner)","role":"owner"}', now(), now()),
('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Elena Rostova (Owner)","role":"owner"}', now(), now()),
('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"David Miller (Staff)","role":"staff"}', now(), now()),
('c2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rachel Green (Staff)","role":"staff"}', now(), now()),
('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jordan Lee (Customer)","role":"customer"}', now(), now()),
('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Claire Bennett (Customer)","role":"customer"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- 6. DEMO PROPERTIES & DETAILS
-- ========================================================
INSERT INTO public.properties (id, owner_id, type, title, description, location, base_price, status) VALUES
('p1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'flat', 'Skyline Luxury Penthouse Loft', 'Ultra-modern 2-bedroom penthouse with panoramic city skyline views, private terrace, high-speed fiber internet, and smart home automation.', 'Downtown Financial District', 250, 'approved'),
('p2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'venue', 'Grand Glasshouse Event Pavilion', 'Stunning glass-encased event venue perfect for corporate galas, private dinners, product launches, and luxury wedding receptions.', 'Waterfront Park Avenue', 850, 'approved'),
('p3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'studio', 'Neon Light Photography & Creator Studio', 'Fully equipped creative studio with cyclorama wall, professional RGB lighting grid, podcasting suite, and private green room.', 'SoHo Creative Hub', 180, 'approved'),
('p4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'flat', 'Minimalist Waterfront Studio Apartment', 'Sleek, minimalist residential flat with floor-to-ceiling windows, rain shower, fully stocked chef kitchen, and private parking space.', 'Marina Bay District', 190, 'approved'),
('p5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'venue', 'The Industrial Brick Warehouse Venue', 'Rustic chic exposed-brick venue spanning 4,000 sq ft with industrial lighting, full sound system, and stage setup.', 'Arts District', 600, 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.property_images (id, property_id, storage_path) VALUES
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pricing_rules (id, property_id, rate_type, amount) VALUES
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'hourly', 35),
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'daily', 250),
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'monthly', 5500),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'hourly', 120),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'daily', 850),
(gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', 'hourly', 25),
(gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', 'daily', 180)
ON CONFLICT (id) DO NOTHING;
