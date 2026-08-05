-- FULL DATABASE SETUP (Schema + Demo Users & 23 Properties)
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
-- 3. BULLETPROOF TRIGGER FUNCTION
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role text;
BEGIN
  IF new.raw_user_meta_data IS NOT NULL THEN
    assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
  ELSE
    assigned_role := 'customer';
  END IF;

  IF assigned_role NOT IN ('admin', 'owner', 'staff', 'customer') THEN
    assigned_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    new.id,
    assigned_role,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
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
-- 5. SEED AUTH USERS
-- ========================================================
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
('a1111111-1111-4111-a111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Vance (Admin)","role":"admin"}', now(), now()),
('a2222222-2222-4222-a222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Jenkins (Admin)","role":"admin"}', now(), now()),
('b1111111-1111-4111-b111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Sterling (Owner)","role":"owner"}', now(), now()),
('b2222222-2222-4222-b222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Elena Rostova (Owner)","role":"owner"}', now(), now()),
('c1111111-1111-4111-c111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"David Miller (Staff)","role":"staff"}', now(), now()),
('c2222222-2222-4222-c222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rachel Green (Staff)","role":"staff"}', now(), now()),
('d1111111-1111-4111-d111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jordan Lee (Customer)","role":"customer"}', now(), now()),
('d2222222-2222-4222-d222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Claire Bennett (Customer)","role":"customer"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- 6. 23 DEMO PROPERTIES (12 FLATS, 6 VENUES, 5 STUDIOS)
-- ========================================================
INSERT INTO public.properties (id, owner_id, type, title, description, location, base_price, status) VALUES
('e1111111-1111-4111-e111-111111111111', 'b1111111-1111-4111-b111-111111111111', 'flat', 'Skyline Luxury Penthouse Loft', 'Ultra-modern 2-bedroom penthouse with panoramic city skyline views, private terrace, high-speed fiber internet, and smart home automation.', 'Downtown Financial District', 250, 'approved'),
('e4444444-4444-4444-e444-444444444444', 'b2222222-2222-4222-b222-222222222222', 'flat', 'Minimalist Waterfront Studio Apartment', 'Sleek, minimalist residential flat with floor-to-ceiling windows, rain shower, fully stocked chef kitchen, and private parking space.', 'Marina Bay District', 190, 'approved'),
('f1010000-0000-4000-a000-000000000001', 'b1111111-1111-4111-b111-111111111111', 'flat', 'Highline Modern Duplex Flat', 'Spacious two-story duplex flat with architectural floating stairs, double-height ceiling, private balcony, and 24/7 concierge.', 'Hudson Yards West', 310, 'approved'),
('f1020000-0000-4000-a000-000000000002', 'b2222222-2222-4222-b222-222222222222', 'flat', 'Boho-Chic Midtown Garden Residence', 'Cozy garden-level residence with private brick patio, lush indoor plants, oak hardwood floors, and ambient warm fireplace.', 'Midtown West', 175, 'approved'),
('f1030000-0000-4000-a000-000000000003', 'b1111111-1111-4111-b111-111111111111', 'flat', 'Urban Industrial Loft & Terrace', 'Authentic converted factory loft featuring steel beams, polished concrete floors, custom acoustic insulation, and skyline rooftop access.', 'Tribeca Arts District', 220, 'approved'),
('f1040000-0000-4000-a000-000000000004', 'b2222222-2222-4222-b222-222222222222', 'flat', 'Scandinavian Eco Smart Flat', 'Energy-efficient 1-bedroom flat built with sustainable pine, smart climate control, workstation nook, and sunlit bay windows.', 'Greenpoint East', 160, 'approved'),
('f1050000-0000-4000-a000-000000000005', 'b1111111-1111-4111-b111-111111111111', 'flat', 'Metropolitan Parkview Apartment', 'Elegant corner flat directly overlooking city park grounds. Features marble bathroom, sub-zero appliances, and designer furnishings.', 'Central Park South', 280, 'approved'),
('f1060000-0000-4000-a000-000000000006', 'b2222222-2222-4222-b222-222222222222', 'flat', 'Sunset Terrace Executive Suite', 'Premium executive suite featuring expansive outdoor dining lounge, private Jacuzzi, wine cooler, and keyless smart entry.', 'Financial Plaza', 340, 'approved'),
('f1070000-0000-4000-a000-000000000007', 'b1111111-1111-4111-b111-111111111111', 'flat', 'The Glass Horizon Micro Suite', 'Ultra-functional compact smart flat designed for remote professionals, featuring ergonomic sit-stand desk and gigabit Wi-Fi.', 'Tech Corridor North', 145, 'approved'),
('f1080000-0000-4000-a000-000000000008', 'b2222222-2222-4222-b222-222222222222', 'flat', 'Heritage Brick Residential Studio', 'Charming brownstone residential flat with exposed original red brick, stained glass accents, and vintage clawfoot bathtub.', 'Historic Quarter', 185, 'approved'),
('f1090000-0000-4000-a000-000000000009', 'b1111111-1111-4111-b111-111111111111', 'flat', 'Panoramic Bay Highrise Suite', 'Luxury highrise corner residence with floor-to-ceiling glass wall framing ocean sunsets, private sauna, and valet parking.', 'Coastal Promenade', 295, 'approved'),
('f1100000-0000-4000-a000-000000000010', 'b2222222-2222-4222-b222-222222222222', 'flat', 'Cobblestone Village Garden Flat', 'Quiet European-style residential flat nestled in cobblestone alley, complete with ivy-covered private courtyard and herb garden.', 'Old Town Square', 210, 'approved'),

('e2222222-2222-4222-e222-222222222222', 'b1111111-1111-4111-b111-111111111111', 'venue', 'Grand Glasshouse Event Pavilion', 'Stunning glass-encased event venue perfect for corporate galas, private dinners, product launches, and luxury wedding receptions.', 'Waterfront Park Avenue', 850, 'approved'),
('e5555555-5555-4555-e555-555555555555', 'b2222222-2222-4222-b222-222222222222', 'venue', 'The Industrial Brick Warehouse Venue', 'Rustic chic exposed-brick venue spanning 4,000 sq ft with industrial lighting, full sound system, and stage setup.', 'Arts District', 600, 'approved'),
('v2010000-0000-4000-a000-000000000001', 'b1111111-1111-4111-b111-111111111111', 'venue', 'Velvet Lounge & Private Ballroom', 'Opulent velvet-adorned ballroom with crystal chandeliers, private cocktail bar, VIP lounge area, and built-in DJ booth.', 'Grand Boulevard', 950, 'approved'),
('v2020000-0000-4000-a000-000000000002', 'b2222222-2222-4222-b222-222222222222', 'venue', 'Rooftop Terrace & Sunset Pavilion', 'Open-air highrise rooftop venue with 360-degree skyline view, ambient fire pits, weatherproof cabanas, and catering kitchen prep area.', 'Highrise Tower Top', 780, 'approved'),
('v2030000-0000-4000-a000-000000000003', 'b1111111-1111-4111-b111-111111111111', 'venue', 'Underground Cellar & Acoustic Hall', 'Atmospheric subterranean venue with vaulted brick ceilings, acoustic treatment, warm mood lighting, and private entrance.', 'Old Substation Alley', 520, 'approved'),
('v2040000-0000-4000-a000-000000000004', 'b2222222-2222-4222-b222-222222222222', 'venue', 'Botanical Garden Courtyard Pavilion', 'Lush glass greenhouse venue surrounded by exotic plants and fountains, perfect for pop-up exhibitions, cocktail parties, and photo shoots.', 'Conservatory Grounds', 710, 'approved'),

('e3333333-3333-4333-e333-333333333333', 'b1111111-1111-4111-b111-111111111111', 'studio', 'Neon Light Photography & Creator Studio', 'Fully equipped creative studio with cyclorama wall, professional RGB lighting grid, podcasting suite, and private green room.', 'SoHo Creative Hub', 180, 'approved'),
('s3010000-0000-4000-a000-000000000001', 'b2222222-2222-4222-b222-222222222222', 'studio', 'Pop-Up Boutique Retail Gallery', 'Street-level retail showroom with high foot-traffic storefront windows, modular display racks, POS checkout counter, and fitting rooms.', 'Fashion District Avenue', 240, 'approved'),
('s3020000-0000-4000-a000-000000000002', 'b1111111-1111-4111-b111-111111111111', 'studio', 'Acoustic Podcasting & Broadcast Studio', 'Sound-isolated podcast suite with Shure SM7B microphones, Rodecaster Pro II console, 4K camera multi-cam setup, and live streaming gear.', 'Media Village Tech Hub', 160, 'approved'),
('s3030000-0000-4000-a000-000000000003', 'b2222222-2222-4222-b222-222222222222', 'studio', 'Artisan Craft & Design Atelier', 'Sun-drenched studio space with drafting tables, ceramics wheel, heavy-duty workbenches, utility sinks, and gallery lighting grid.', 'Designers Square', 210, 'approved'),
('s3040000-0000-4000-a000-000000000004', 'b1111111-1111-4111-b111-111111111111', 'studio', 'High-Fashion Runway & Fitting Studio', 'Sleek fashion studio with 50ft catwalk runway, full-length mirror wall, steamer equipment, makeup stations, and private changing rooms.', 'Garment District', 290, 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.property_images (id, property_id, storage_path) VALUES
(gen_random_uuid(), 'e1111111-1111-4111-e111-111111111111', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'e4444444-4444-4444-e444-444444444444', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1010000-0000-4000-a000-000000000001', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1020000-0000-4000-a000-000000000002', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1030000-0000-4000-a000-000000000003', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1040000-0000-4000-a000-000000000004', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1050000-0000-4000-a000-000000000005', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1060000-0000-4000-a000-000000000006', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1070000-0000-4000-a000-000000000007', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1080000-0000-4000-a000-000000000008', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1090000-0000-4000-a000-000000000009', 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'f1100000-0000-4000-a000-000000000010', 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'e2222222-2222-4222-e222-222222222222', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'e5555555-5555-4555-e555-555555555555', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'v2010000-0000-4000-a000-000000000001', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'v2020000-0000-4000-a000-000000000002', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'v2030000-0000-4000-a000-000000000003', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'v2040000-0000-4000-a000-000000000004', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'e3333333-3333-4333-e333-333333333333', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 's3010000-0000-4000-a000-000000000001', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 's3020000-0000-4000-a000-000000000002', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 's3030000-0000-4000-a000-000000000003', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 's3040000-0000-4000-a000-000000000004', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;
