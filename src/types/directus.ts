/**
 * Directus Database Schema TypeScript Types
 * Generated and matched precisely with Directus Schema JSON
 */

export type TransactionType = 'sale' | 'rent' | 'mortgage';
export type PropertyType = 'apartment' | 'villa' | 'land' | 'commercial';
export type PropertyStatus = 'published' | 'draft' | 'sold' | 'archived';
export type DocumentType = 'single_leaf' | 'booklet' | 'contract' | 'in_progress';
export type RequestType = 'buyer' | 'seller' | 'consultation';
export type PlanTier = 'free' | 'special' | 'vip';
export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface District {
  id: number;
  name: string;
  slug: string;
  sort?: number | null;
}

export interface PropertyFile {
  id: number;
  properties_id: number;
  directus_files_id: string;
  sort?: number | null;
}

export interface Property {
  id: number;
  status: PropertyStatus;
  transaction_type: TransactionType;
  title: string;
  property_type: PropertyType;
  district_id: number | District;
  area: number;
  rooms?: number | null;
  floor?: number | null;
  total_floors?: number | null;
  price?: number | null; // For sale or full mortgage (Toman)
  rent_price?: number | null; // For monthly rent (Toman)
  document_type?: DocumentType | null;
  has_elevator?: boolean | null;
  has_parking?: boolean | null;
  has_storage?: boolean | null;
  address_detail?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  featured_image?: string | null; // UUID from directus_files or image URL
  gallery?: (PropertyFile | string)[] | null;
  description?: string | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  date_created?: string;
  date_updated?: string;
}

export interface PropertyRequest {
  id: number;
  status: RequestStatus;
  request_type: RequestType;
  plan_tier?: PlanTier | null;
  full_name: string;
  phone: string;
  budget?: number | null;
  notes?: string | null;
  date_created?: string;
}

export interface DirectusSchema {
  districts: District[];
  properties: Property[];
  properties_files: PropertyFile[];
  property_requests: PropertyRequest[];
}
