-- Supabase Seed SQL Script for Smart Space & Rental Management System (v2)
-- Includes demo user accounts for all 4 roles + properties + rate rules + bookings + invoices + reviews

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. SEED AUTH USERS (Passwords set to: Password123!)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
-- Admin Accounts
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Vance (Admin)","role":"admin"}', now(), now()),
('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Jenkins (Admin)","role":"admin"}', now(), now()),

-- Owner Accounts
('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Sterling (Owner)","role":"owner"}', now(), now()),
('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Elena Rostova (Owner)","role":"owner"}', now(), now()),

-- Staff Accounts
('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"David Miller (Staff)","role":"staff"}', now(), now()),
('c2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rachel Green (Staff)","role":"staff"}', now(), now()),

-- Customer Accounts
('d1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jordan Lee (Customer)","role":"customer"}', now(), now()),
('d2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer2@smartspace.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Claire Bennett (Customer)","role":"customer"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. ENSURE PROFILES
INSERT INTO public.profiles (id, role, full_name, phone) VALUES
('a1111111-1111-1111-1111-111111111111', 'admin', 'Alex Vance (Admin)', '+1 555-0101'),
('a2222222-2222-2222-2222-222222222222', 'admin', 'Sarah Jenkins (Admin)', '+1 555-0102'),
('b1111111-1111-1111-1111-111111111111', 'owner', 'Marcus Sterling (Owner)', '+1 555-0201'),
('b2222222-2222-2222-2222-222222222222', 'owner', 'Elena Rostova (Owner)', '+1 555-0202'),
('c1111111-1111-1111-1111-111111111111', 'staff', 'David Miller (Staff)', '+1 555-0301'),
('c2222222-2222-2222-2222-222222222222', 'staff', 'Rachel Green (Staff)', '+1 555-0302'),
('d1111111-1111-1111-1111-111111111111', 'customer', 'Jordan Lee (Customer)', '+1 555-0401'),
('d2222222-2222-2222-2222-222222222222', 'customer', 'Claire Bennett (Customer)', '+1 555-0402')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- 3. DEMO PROPERTIES
INSERT INTO public.properties (id, owner_id, type, title, description, location, base_price, status) VALUES
('p1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'flat', 'Skyline Luxury Penthouse Loft', 'Ultra-modern 2-bedroom penthouse with panoramic city skyline views, private terrace, high-speed fiber internet, and smart home automation.', 'Downtown Financial District', 250, 'approved'),
('p2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'venue', 'Grand Glasshouse Event Pavilion', 'Stunning glass-encased event venue perfect for corporate galas, private dinners, product launches, and luxury wedding receptions.', 'Waterfront Park Avenue', 850, 'approved'),
('p3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'studio', 'Neon Light Photography & Creator Studio', 'Fully equipped creative studio with cyclorama wall, professional RGB lighting grid, podcasting suite, and private green room.', 'SoHo Creative Hub', 180, 'approved'),
('p4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'flat', 'Minimalist Waterfront Studio Apartment', 'Sleek, minimalist residential flat with floor-to-ceiling windows, rain shower, fully stocked chef kitchen, and private parking space.', 'Marina Bay District', 190, 'approved'),
('p5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'venue', 'The Industrial Brick Warehouse Venue', 'Rustic chic exposed-brick venue spanning 4,000 sq ft with industrial lighting, full sound system, and stage setup.', 'Arts District', 600, 'approved'),
('p6666666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', 'studio', 'Pop-Up Retail Showcase Studio', 'Prime street-level retail space designed for luxury brand pop-ups, art galleries, and fashion showroom launches.', 'High Street Shopping Mile', 320, 'pending')
ON CONFLICT (id) DO NOTHING;

-- 4. PROPERTY IMAGES
INSERT INTO public.property_images (id, property_id, storage_path) VALUES
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'),
(gen_random_uuid(), 'p6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

-- 5. PRICING RULES (Hourly, Daily, Monthly)
INSERT INTO public.pricing_rules (id, property_id, rate_type, amount) VALUES
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'hourly', 35),
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'daily', 250),
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'monthly', 5500),

(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'hourly', 120),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'daily', 850),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'monthly', 18000),

(gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', 'hourly', 25),
(gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', 'daily', 180),
(gen_random_uuid(), 'p3333333-3333-3333-3333-333333333333', 'monthly', 4000),

(gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', 'hourly', 30),
(gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', 'daily', 190),
(gen_random_uuid(), 'p4444444-4444-4444-4444-444444444444', 'monthly', 4200)
ON CONFLICT (id) DO NOTHING;

-- 6. DEMO BOOKINGS
INSERT INTO public.bookings (id, property_id, customer_id, starts_at, ends_at, status, total_price) VALUES
('bk111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', now() + interval '2 days', now() + interval '5 days', 'confirmed', 750),
('bk222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', now() + interval '10 days', now() + interval '11 days', 'pending', 850),
('bk333333-3333-3333-3333-333333333333', 'p3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', now() + interval '1 day', now() + interval '2 days', 'confirmed', 180)
ON CONFLICT (id) DO NOTHING;

-- 7. DEMO INVOICES
INSERT INTO public.invoices (id, booking_id, invoice_number, amount, generated_at) VALUES
(gen_random_uuid(), 'bk111111-1111-1111-1111-111111111111', 1000, 750, now()),
(gen_random_uuid(), 'bk333333-3333-3333-3333-333333333333', 1001, 180, now())
ON CONFLICT (id) DO NOTHING;

-- 8. DEMO REVIEWS
INSERT INTO public.reviews (id, property_id, customer_id, rating, comment) VALUES
(gen_random_uuid(), 'p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 5, 'Exceptional stay! The penthouse views and high-speed internet made working remotely an absolute pleasure.'),
(gen_random_uuid(), 'p2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 5, 'Hosted our annual tech gala here. The lighting, acoustic quality, and venue team were top notch!')
ON CONFLICT (id) DO NOTHING;

-- 9. DEMO WISHLIST
INSERT INTO public.wishlist (id, customer_id, property_id) VALUES
(gen_random_uuid(), 'd1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222'),
(gen_random_uuid(), 'd1111111-1111-1111-1111-111111111111', 'p3333333-3333-3333-3333-333333333333')
ON CONFLICT (customer_id, property_id) DO NOTHING;
