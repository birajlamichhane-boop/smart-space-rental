export type UserRole = 'admin' | 'owner' | 'staff' | 'customer';

export type PropertyType = 'flat' | 'venue' | 'studio';

export type PropertyStatus = 'pending' | 'approved' | 'rejected';

export type RateType = 'hourly' | 'daily' | 'monthly';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  type: PropertyType;
  title: string;
  description: string | null;
  location: string | null;
  base_price: number;
  status: PropertyStatus;
  created_at: string;
  owner?: Profile;
  images?: PropertyImage[];
  pricing_rules?: PricingRule[];
  reviews?: Review[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
}

export interface PricingRule {
  id: string;
  property_id: string;
  rate_type: RateType;
  amount: number;
}

export interface Booking {
  id: string;
  property_id: string;
  customer_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  total_price: number | null;
  created_at: string;
  property?: Property;
  customer?: Profile;
  invoice?: Invoice;
}

export interface Review {
  id: string;
  property_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: Profile;
}

export interface Invoice {
  id: string;
  booking_id: string;
  invoice_number: number;
  amount: number;
  generated_at: string;
  booking?: Booking;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  property_id: string;
  property?: Property;
}
