import { supabase } from '../supabaseClient'
import { Property, PropertyType, PropertyStatus, RateType } from '../../types/database'

export const DEMO_PROPERTIES: Property[] = [
  // 12 RESIDENTIAL FLATS
  {
    id: 'e1111111-1111-4111-e111-111111111111',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'flat',
    title: 'Skyline Luxury Penthouse Loft',
    description: 'Ultra-modern 2-bedroom penthouse with panoramic city skyline views, private terrace, high-speed fiber internet, and smart home automation.',
    location: 'Lazimpat, Kathmandu',
    base_price: 250,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-1', property_id: 'e1111111-1111-4111-e111-111111111111', storage_path: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-1', property_id: 'e1111111-1111-4111-e111-111111111111', rate_type: 'hourly', amount: 35 },
      { id: 'pr-2', property_id: 'e1111111-1111-4111-e111-111111111111', rate_type: 'daily', amount: 250 },
      { id: 'pr-3', property_id: 'e1111111-1111-4111-e111-111111111111', rate_type: 'monthly', amount: 5500 },
    ],
  },
  {
    id: 'e4444444-4444-4444-e444-444444444444',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'flat',
    title: 'Minimalist Waterfront Studio Apartment',
    description: 'Sleek, minimalist residential flat with floor-to-ceiling windows, rain shower, fully stocked chef kitchen, and private parking space.',
    location: 'Lakeside, Pokhara',
    base_price: 190,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-4', property_id: 'e4444444-4444-4444-e444-444444444444', storage_path: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-4', property_id: 'e4444444-4444-4444-e444-444444444444', rate_type: 'hourly', amount: 30 },
      { id: 'pr-5', property_id: 'e4444444-4444-4444-e444-444444444444', rate_type: 'daily', amount: 190 },
      { id: 'pr-6', property_id: 'e4444444-4444-4444-e444-444444444444', rate_type: 'monthly', amount: 4200 },
    ],
  },
  {
    id: 'f1010000-0000-4000-a000-000000000001',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'flat',
    title: 'Highline Modern Duplex Flat',
    description: 'Spacious two-story duplex flat with architectural floating stairs, double-height ceiling, private balcony, and 24/7 concierge.',
    location: 'Jhamsikhel, Lalitpur',
    base_price: 310,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f1', property_id: 'f1010000-0000-4000-a000-000000000001', storage_path: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f1a', property_id: 'f1010000-0000-4000-a000-000000000001', rate_type: 'hourly', amount: 45 },
      { id: 'pr-f1b', property_id: 'f1010000-0000-4000-a000-000000000001', rate_type: 'daily', amount: 310 },
      { id: 'pr-f1c', property_id: 'f1010000-0000-4000-a000-000000000001', rate_type: 'monthly', amount: 6800 },
    ],
  },
  {
    id: 'f1020000-0000-4000-a000-000000000002',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'flat',
    title: 'Boho-Chic Midtown Garden Residence',
    description: 'Cozy garden-level residence with private brick patio, lush indoor plants, oak hardwood floors, and ambient warm fireplace.',
    location: 'Thamel, Kathmandu',
    base_price: 175,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f2', property_id: 'f1020000-0000-4000-a000-000000000002', storage_path: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f2a', property_id: 'f1020000-0000-4000-a000-000000000002', rate_type: 'hourly', amount: 28 },
      { id: 'pr-f2b', property_id: 'f1020000-0000-4000-a000-000000000002', rate_type: 'daily', amount: 175 },
      { id: 'pr-f2c', property_id: 'f1020000-0000-4000-a000-000000000002', rate_type: 'monthly', amount: 3900 },
    ],
  },
  {
    id: 'f1030000-0000-4000-a000-000000000003',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'flat',
    title: 'Urban Industrial Loft & Terrace',
    description: 'Authentic converted factory loft featuring steel beams, polished concrete floors, custom acoustic insulation, and skyline rooftop access.',
    location: 'Patan Durbar Square, Lalitpur',
    base_price: 220,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f3', property_id: 'f1030000-0000-4000-a000-000000000003', storage_path: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f3a', property_id: 'f1030000-0000-4000-a000-000000000003', rate_type: 'hourly', amount: 32 },
      { id: 'pr-f3b', property_id: 'f1030000-0000-4000-a000-000000000003', rate_type: 'daily', amount: 220 },
      { id: 'pr-f3c', property_id: 'f1030000-0000-4000-a000-000000000003', rate_type: 'monthly', amount: 4800 },
    ],
  },
  {
    id: 'f1040000-0000-4000-a000-000000000004',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'flat',
    title: 'Scandinavian Eco Smart Flat',
    description: 'Energy-efficient 1-bedroom flat built with sustainable pine, smart climate control, workstation nook, and sunlit bay windows.',
    location: 'Boudha, Kathmandu',
    base_price: 160,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f4', property_id: 'f1040000-0000-4000-a000-000000000004', storage_path: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f4a', property_id: 'f1040000-0000-4000-a000-000000000004', rate_type: 'hourly', amount: 25 },
      { id: 'pr-f4b', property_id: 'f1040000-0000-4000-a000-000000000004', rate_type: 'daily', amount: 160 },
      { id: 'pr-f4c', property_id: 'f1040000-0000-4000-a000-000000000004', rate_type: 'monthly', amount: 3500 },
    ],
  },
  {
    id: 'f1050000-0000-4000-a000-000000000005',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'flat',
    title: 'Metropolitan Parkview Apartment',
    description: 'Elegant corner flat directly overlooking city park grounds. Features marble bathroom, sub-zero appliances, and designer furnishings.',
    location: 'Maharajgunj, Kathmandu',
    base_price: 280,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f5', property_id: 'f1050000-0000-4000-a000-000000000005', storage_path: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f5a', property_id: 'f1050000-0000-4000-a000-000000000005', rate_type: 'hourly', amount: 40 },
      { id: 'pr-f5b', property_id: 'f1050000-0000-4000-a000-000000000005', rate_type: 'daily', amount: 280 },
      { id: 'pr-f5c', property_id: 'f1050000-0000-4000-a000-000000000005', rate_type: 'monthly', amount: 6200 },
    ],
  },
  {
    id: 'f1060000-0000-4000-a000-000000000006',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'flat',
    title: 'Sunset Terrace Executive Suite',
    description: 'Premium executive suite featuring expansive outdoor dining lounge, private Jacuzzi, wine cooler, and keyless smart entry.',
    location: 'New Baneshwor, Kathmandu',
    base_price: 340,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f6', property_id: 'f1060000-0000-4000-a000-000000000006', storage_path: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f6a', property_id: 'f1060000-0000-4000-a000-000000000006', rate_type: 'hourly', amount: 50 },
      { id: 'pr-f6b', property_id: 'f1060000-0000-4000-a000-000000000006', rate_type: 'daily', amount: 340 },
      { id: 'pr-f6c', property_id: 'f1060000-0000-4000-a000-000000000006', rate_type: 'monthly', amount: 7500 },
    ],
  },
  {
    id: 'f1070000-0000-4000-a000-000000000007',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'flat',
    title: 'The Glass Horizon Micro Suite',
    description: 'Ultra-functional compact smart flat designed for remote professionals, featuring ergonomic sit-stand desk and gigabit Wi-Fi.',
    location: 'Hattisar, Kathmandu',
    base_price: 145,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f7', property_id: 'f1070000-0000-4000-a000-000000000007', storage_path: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f7a', property_id: 'f1070000-0000-4000-a000-000000000007', rate_type: 'hourly', amount: 22 },
      { id: 'pr-f7b', property_id: 'f1070000-0000-4000-a000-000000000007', rate_type: 'daily', amount: 145 },
      { id: 'pr-f7c', property_id: 'f1070000-0000-4000-a000-000000000007', rate_type: 'monthly', amount: 3200 },
    ],
  },
  {
    id: 'f1080000-0000-4000-a000-000000000008',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'flat',
    title: 'Heritage Brick Residential Studio',
    description: 'Charming brownstone residential flat with exposed original red brick, stained glass accents, and vintage clawfoot bathtub.',
    location: 'Bhaktapur Durbar Square',
    base_price: 185,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f8', property_id: 'f1080000-0000-4000-a000-000000000008', storage_path: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f8a', property_id: 'f1080000-0000-4000-a000-000000000008', rate_type: 'hourly', amount: 29 },
      { id: 'pr-f8b', property_id: 'f1080000-0000-4000-a000-000000000008', rate_type: 'daily', amount: 185 },
      { id: 'pr-f8c', property_id: 'f1080000-0000-4000-a000-000000000008', rate_type: 'monthly', amount: 4100 },
    ],
  },
  {
    id: 'f1090000-0000-4000-a000-000000000009',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'flat',
    title: 'Panoramic Bay Highrise Suite',
    description: 'Luxury highrise corner residence with floor-to-ceiling glass wall framing ocean sunsets, private sauna, and valet parking.',
    location: 'Sarangkot, Pokhara',
    base_price: 295,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f9', property_id: 'f1090000-0000-4000-a000-000000000009', storage_path: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f9a', property_id: 'f1090000-0000-4000-a000-000000000009', rate_type: 'hourly', amount: 42 },
      { id: 'pr-f9b', property_id: 'f1090000-0000-4000-a000-000000000009', rate_type: 'daily', amount: 295 },
      { id: 'pr-f9c', property_id: 'f1090000-0000-4000-a000-000000000009', rate_type: 'monthly', amount: 6500 },
    ],
  },
  {
    id: 'f1100000-0000-4000-a000-000000000010',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'flat',
    title: 'Cobblestone Village Garden Flat',
    description: 'Quiet European-style residential flat nestled in cobblestone alley, complete with ivy-covered private courtyard and herb garden.',
    location: 'Kirtipur, Kathmandu',
    base_price: 210,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-f10', property_id: 'f1100000-0000-4000-a000-000000000010', storage_path: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-f10a', property_id: 'f1100000-0000-4000-a000-000000000010', rate_type: 'hourly', amount: 31 },
      { id: 'pr-f10b', property_id: 'f1100000-0000-4000-a000-000000000010', rate_type: 'daily', amount: 210 },
      { id: 'pr-f10c', property_id: 'f1100000-0000-4000-a000-000000000010', rate_type: 'monthly', amount: 4600 },
    ],
  },

  // 6 EVENT VENUES
  {
    id: 'e2222222-2222-4222-e222-222222222222',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'venue',
    title: 'Grand Glasshouse Event Pavilion',
    description: 'Stunning glass-encased event venue perfect for corporate galas, private dinners, product launches, and luxury wedding receptions.',
    location: 'Phewa Lakeside, Pokhara',
    base_price: 850,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-2', property_id: 'e2222222-2222-4222-e222-222222222222', storage_path: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-7', property_id: 'e2222222-2222-4222-e222-222222222222', rate_type: 'hourly', amount: 120 },
      { id: 'pr-8', property_id: 'e2222222-2222-4222-e222-222222222222', rate_type: 'daily', amount: 850 },
      { id: 'pr-9', property_id: 'e2222222-2222-4222-e222-222222222222', rate_type: 'monthly', amount: 18000 },
    ],
  },
  {
    id: 'e5555555-5555-4555-e555-555555555555',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'venue',
    title: 'The Industrial Brick Warehouse Venue',
    description: 'Rustic chic exposed-brick venue spanning 4,000 sq ft with industrial lighting, full sound system, and stage setup.',
    location: 'Kupondole, Lalitpur',
    base_price: 600,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-5', property_id: 'e5555555-5555-4555-e555-555555555555', storage_path: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-10', property_id: 'e5555555-5555-4555-e555-555555555555', rate_type: 'hourly', amount: 95 },
      { id: 'pr-11', property_id: 'e5555555-5555-4555-e555-555555555555', rate_type: 'daily', amount: 600 },
      { id: 'pr-12', property_id: 'e5555555-5555-4555-e555-555555555555', rate_type: 'monthly', amount: 14000 },
    ],
  },
  {
    id: '92010000-0000-4000-a000-000000000001',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'venue',
    title: 'Velvet Lounge & Private Ballroom',
    description: 'Opulent velvet-adorned ballroom with crystal chandeliers, private cocktail bar, VIP lounge area, and built-in DJ booth.',
    location: 'Durbarmarg, Kathmandu',
    base_price: 950,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-v1', property_id: '92010000-0000-4000-a000-000000000001', storage_path: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-v1a', property_id: '92010000-0000-4000-a000-000000000001', rate_type: 'hourly', amount: 140 },
      { id: 'pr-v1b', property_id: '92010000-0000-4000-a000-000000000001', rate_type: 'daily', amount: 950 },
      { id: 'pr-v1c', property_id: '92010000-0000-4000-a000-000000000001', rate_type: 'monthly', amount: 21000 },
    ],
  },
  {
    id: '92020000-0000-4000-a000-000000000002',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'venue',
    title: 'Rooftop Terrace & Sunset Pavilion',
    description: 'Open-air highrise rooftop venue with 360-degree skyline view, ambient fire pits, weatherproof cabanas, and catering kitchen prep area.',
    location: 'Naxal, Kathmandu',
    base_price: 780,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-v2', property_id: '92020000-0000-4000-a000-000000000002', storage_path: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-v2a', property_id: '92020000-0000-4000-a000-000000000002', rate_type: 'hourly', amount: 110 },
      { id: 'pr-v2b', property_id: '92020000-0000-4000-a000-000000000002', rate_type: 'daily', amount: 780 },
      { id: 'pr-v2c', property_id: '92020000-0000-4000-a000-000000000002', rate_type: 'monthly', amount: 16500 },
    ],
  },
  {
    id: '92030000-0000-4000-a000-000000000003',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'venue',
    title: 'Underground Cellar & Acoustic Hall',
    description: 'Atmospheric subterranean venue with vaulted brick ceilings, acoustic treatment, warm mood lighting, and private entrance.',
    location: 'Lazimpat, Kathmandu',
    base_price: 520,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-v3', property_id: '92030000-0000-4000-a000-000000000003', storage_path: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-v3a', property_id: '92030000-0000-4000-a000-000000000003', rate_type: 'hourly', amount: 80 },
      { id: 'pr-v3b', property_id: '92030000-0000-4000-a000-000000000003', rate_type: 'daily', amount: 520 },
      { id: 'pr-v3c', property_id: '92030000-0000-4000-a000-000000000003', rate_type: 'monthly', amount: 11500 },
    ],
  },
  {
    id: '92040000-0000-4000-a000-000000000004',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'venue',
    title: 'Botanical Garden Courtyard Pavilion',
    description: 'Lush glass greenhouse venue surrounded by exotic plants and fountains, perfect for pop-up exhibitions, cocktail parties, and photo shoots.',
    location: 'Godavari, Lalitpur',
    base_price: 710,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-v4', property_id: '92040000-0000-4000-a000-000000000004', storage_path: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-v4a', property_id: '92040000-0000-4000-a000-000000000004', rate_type: 'hourly', amount: 100 },
      { id: 'pr-v4b', property_id: '92040000-0000-4000-a000-000000000004', rate_type: 'daily', amount: 710 },
      { id: 'pr-v4c', property_id: '92040000-0000-4000-a000-000000000004', rate_type: 'monthly', amount: 15000 },
    ],
  },

  // 5 RETAIL STUDIOS
  {
    id: 'e3333333-3333-4333-e333-333333333333',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'studio',
    title: 'Neon Light Photography & Creator Studio',
    description: 'Fully equipped creative studio with cyclorama wall, professional RGB lighting grid, podcasting suite, and private green room.',
    location: 'Jhamsikhel, Lalitpur',
    base_price: 180,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-3', property_id: 'e3333333-3333-4333-e333-333333333333', storage_path: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-13', property_id: 'e3333333-3333-4333-e333-333333333333', rate_type: 'hourly', amount: 25 },
      { id: 'pr-14', property_id: 'e3333333-3333-4333-e333-333333333333', rate_type: 'daily', amount: 180 },
      { id: 'pr-15', property_id: 'e3333333-3333-4333-e333-333333333333', rate_type: 'monthly', amount: 4000 },
    ],
  },
  {
    id: '83010000-0000-4000-a000-000000000001',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'studio',
    title: 'Pop-Up Boutique Retail Gallery',
    description: 'Street-level retail showroom with high foot-traffic storefront windows, modular display racks, POS checkout counter, and fitting rooms.',
    location: 'New Road, Kathmandu',
    base_price: 240,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-s1', property_id: '83010000-0000-4000-a000-000000000001', storage_path: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-s1a', property_id: '83010000-0000-4000-a000-000000000001', rate_type: 'hourly', amount: 35 },
      { id: 'pr-s1b', property_id: '83010000-0000-4000-a000-000000000001', rate_type: 'daily', amount: 240 },
      { id: 'pr-s1c', property_id: '83010000-0000-4000-a000-000000000001', rate_type: 'monthly', amount: 5200 },
    ],
  },
  {
    id: '83020000-0000-4000-a000-000000000002',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'studio',
    title: 'Acoustic Podcasting & Broadcast Studio',
    description: 'Sound-isolated podcast suite with Shure SM7B microphones, Rodecaster Pro II console, 4K camera multi-cam setup, and live streaming gear.',
    location: 'Kamaladi, Kathmandu',
    base_price: 160,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-s2', property_id: '83020000-0000-4000-a000-000000000002', storage_path: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-s2a', property_id: '83020000-0000-4000-a000-000000000002', rate_type: 'hourly', amount: 22 },
      { id: 'pr-s2b', property_id: '83020000-0000-4000-a000-000000000002', rate_type: 'daily', amount: 160 },
      { id: 'pr-s2c', property_id: '83020000-0000-4000-a000-000000000002', rate_type: 'monthly', amount: 3600 },
    ],
  },
  {
    id: '83030000-0000-4000-a000-000000000003',
    owner_id: 'b2222222-2222-4222-b222-222222222222',
    type: 'studio',
    title: 'Artisan Craft & Design Atelier',
    description: 'Sun-drenched studio space with drafting tables, ceramics wheel, heavy-duty workbenches, utility sinks, and gallery lighting grid.',
    location: 'Patan, Lalitpur',
    base_price: 210,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-s3', property_id: '83030000-0000-4000-a000-000000000003', storage_path: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-s3a', property_id: '83030000-0000-4000-a000-000000000003', rate_type: 'hourly', amount: 30 },
      { id: 'pr-s3b', property_id: '83030000-0000-4000-a000-000000000003', rate_type: 'daily', amount: 210 },
      { id: 'pr-s3c', property_id: '83030000-0000-4000-a000-000000000003', rate_type: 'monthly', amount: 4500 },
    ],
  },
  {
    id: '83040000-0000-4000-a000-000000000004',
    owner_id: 'b1111111-1111-4111-b111-111111111111',
    type: 'studio',
    title: 'High-Fashion Runway & Fitting Studio',
    description: 'Sleek fashion studio with 50ft catwalk runway, full-length mirror wall, steamer equipment, makeup stations, and private changing rooms.',
    location: 'Putalisadak, Kathmandu',
    base_price: 290,
    status: 'approved',
    created_at: new Date().toISOString(),
    images: [{ id: 'img-s4', property_id: '83040000-0000-4000-a000-000000000004', storage_path: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80' }],
    pricing_rules: [
      { id: 'pr-s4a', property_id: '83040000-0000-4000-a000-000000000004', rate_type: 'hourly', amount: 40 },
      { id: 'pr-s4b', property_id: '83040000-0000-4000-a000-000000000004', rate_type: 'daily', amount: 290 },
      { id: 'pr-s4c', property_id: '83040000-0000-4000-a000-000000000004', rate_type: 'monthly', amount: 6000 },
    ],
  },
]

export async function getApprovedProperties(filters?: { type?: PropertyType | 'all'; minPrice?: number; maxPrice?: number; search?: string }): Promise<Property[]> {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(*),
        images:property_images(*),
        pricing_rules(*),
        reviews(*)
      `)
      .eq('status', 'approved')

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('base_price', filters.minPrice)
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('base_price', filters.maxPrice)
    }

    if (filters?.search && filters.search.trim() !== '') {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }

    const { data, error } = await Promise.race([
      query.order('created_at', { ascending: false }),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('Property request timed out')), 10000)
      }),
    ])

    if (!error && data) {
      return data as Property[]
    }
  } catch (err) {
    console.warn('Supabase query error, returning rich demo properties list:', err)
  }

  if (typeof window === 'undefined' || !localStorage.getItem('smartspace_demo_session')) {
    return []
  }

  // Client-side filtering for the explicit local demo session.
  let list = DEMO_PROPERTIES
  if (filters?.type && filters.type !== 'all') {
    list = list.filter(p => p.type === filters.type)
  }
  if (filters?.minPrice !== undefined) {
    list = list.filter(p => p.base_price >= filters.minPrice!)
  }
  if (filters?.maxPrice !== undefined) {
    list = list.filter(p => p.base_price <= filters.maxPrice!)
  }
  if (filters?.search && filters.search.trim() !== '') {
    const s = filters.search.toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(s) || (p.location && p.location.toLowerCase().includes(s)))
  }
  return list
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (typeof window !== 'undefined' && localStorage.getItem('smartspace_demo_session')) {
    const demoProperty = DEMO_PROPERTIES.find(p => p.id === id)
    if (demoProperty) return demoProperty
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(*),
        images:property_images(*),
        pricing_rules(*),
        reviews(*, customer:profiles(*))
      `)
      .eq('id', id)
      .single()

    if (!error && data) return data as Property
  } catch (err) {
    console.warn('Using fallback property detail:', err)
  }

  return null
}

export async function getOwnerProperties(ownerId: string): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        images:property_images(*),
        pricing_rules(*)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) return data as Property[]
  } catch {}

  return DEMO_PROPERTIES.filter(p => p.owner_id === ownerId || p.owner_id === 'b1111111-1111-4111-b111-111111111111')
}

export async function getPendingProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(*),
        images:property_images(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) return data as Property[]
  } catch {}

  return []
}

export async function getAllPropertiesAdmin(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(*)
      `)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) return data as Property[]
  } catch {}

  return DEMO_PROPERTIES
}

export async function createProperty(property: {
  owner_id: string;
  type: PropertyType;
  title: string;
  description?: string;
  location?: string;
  base_price: number;
  rates: { rate_type: RateType; amount: number }[];
  image_urls?: string[];
}) {
  // 1. Insert Property
  const { data: prop, error: propErr } = await supabase
    .from('properties')
    .insert({
      owner_id: property.owner_id,
      type: property.type,
      title: property.title,
      description: property.description || null,
      location: property.location || null,
      base_price: property.base_price,
      status: 'pending',
    })
    .select()
    .single()

  if (propErr) {
    // If DB error, create in-memory object for responsive UI feedback
    const mockProp: Property = {
      id: 'prop-' + Date.now(),
      owner_id: property.owner_id,
      type: property.type,
      title: property.title,
      description: property.description || null,
      location: property.location || null,
      base_price: property.base_price,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    DEMO_PROPERTIES.unshift(mockProp)
    return mockProp
  }

  // 2. Insert Pricing Rules
  if (property.rates && property.rates.length > 0) {
    const rulesToInsert = property.rates.map(r => ({
      property_id: prop.id,
      rate_type: r.rate_type,
      amount: r.amount,
    }))
    await supabase.from('pricing_rules').insert(rulesToInsert)
  }

  // 3. Insert Property Images
  if (property.image_urls && property.image_urls.length > 0) {
    const imagesToInsert = property.image_urls.map(url => ({
      property_id: prop.id,
      storage_path: url,
    }))
    await supabase.from('property_images').insert(imagesToInsert)
  }

  return prop
}

export async function updatePropertyStatus(id: string, status: PropertyStatus) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) return data
  } catch {}

  const item = DEMO_PROPERTIES.find(p => p.id === id)
  if (item) item.status = status
  return item
}

export async function deleteProperty(id: string) {
  try {
    await supabase
      .from('properties')
      .delete()
      .eq('id', id)
  } catch {}

  const idx = DEMO_PROPERTIES.findIndex(p => p.id === id)
  if (idx !== -1) DEMO_PROPERTIES.splice(idx, 1)
}
