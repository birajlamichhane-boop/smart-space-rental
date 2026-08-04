# Smart Space & Rental Management System (v2)

A web platform to rent spaces — residential flats, event venues, and retail studios — supporting four roles: Admin, Owner, Staff, and Customer, each with dedicated dashboards.

## Features
- **Property Listings & Search/Filter**: Filter by category (flat, venue, studio), price range, and location keywords.
- **Dynamic Pricing & Flexible Billing**: Supports hourly, daily, and monthly rates.
- **Overlap Protection**: Enforced at the database level via Postgres `btree_gist` exclusion constraints to guarantee zero double-booking.
- **Sequential Invoice Generation**: Auto-generated sequential invoice numbers (e.g. #1000, #1001) upon booking confirmation with printable view.
- **4 Role-Based Dashboards**:
  - **Admin**: System stats, total revenue chart, property approval queue.
  - **Owner**: Managed listings table, active bookings, occupancy rate chart, property creation modal.
  - **Staff**: Operations booking queue for reviewing and confirming reservations.
  - **Customer**: Reservation management, saved wishlist, invoice history.
- **Red & Black Theme**: High-contrast near-black background (`#0A0A0B`), `#141416` surface, deep red accents (`#E11D2E`), hover glow (`#FF2E44`), and static ambient radial gradients.

## Tech Stack
- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **Icons & Motion**: Lucide React + Framer Motion
- **Data & Charts**: Recharts + TanStack Query + React Router v6
- **Backend & Auth**: Supabase (`@supabase/supabase-js`)

---

## Setup Instructions

### 1. Installation
Unzip the repository or navigate to the project directory, then install dependencies:

```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://fdxflvrqchtpmqmfuztc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XW7Bb3dFWhLWxRbkrZFzlA_Uk8yGQYz
```

### 3. Supabase Database Schema Setup
Execute the SQL script located in `supabase/schema.sql` inside your Supabase SQL Editor. This will create:
- Tables: `profiles`, `properties`, `property_images`, `pricing_rules`, `bookings`, `reviews`, `invoices`, `wishlist`.
- `btree_gist` extension and overlap exclusion constraint on `bookings`.
- `handle_new_user` Postgres trigger to auto-populate user profiles with metadata role.
- Row Level Security (RLS) policies for all tables.

### 4. Running Locally
Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build & Preview
To build for production and preview locally:

```bash
npm run build
npm run preview
```

## Deployment
Deploy to Vercel or Netlify:
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the host dashboard.
