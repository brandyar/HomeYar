/**
 * Central Database API Client & Repository
 * Full TypeScript implementation matching the database schema
 */
import {
  createDirectus,
  rest,
  readItems,
  createItem,
  staticToken,
} from '@directus/sdk';
import {
  DirectusSchema,
  District,
  Property,
  PropertyRequest,
} from '../types/directus';
import {
  INITIAL_DISTRICTS,
  INITIAL_PROPERTIES,
  INITIAL_REQUESTS,
} from './mockData';

// Environment variables for production deployment
const ENV_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DIRECTUS_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DIRECTUS_URL) ||
  ''
).trim();

const ENV_TOKEN = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DIRECTUS_TOKEN) ||
  (typeof process !== 'undefined' && process.env?.DIRECTUS_STATIC_TOKEN) ||
  ''
).trim();

export function getStoredDirectusConfig(): {
  url: string;
  token: string;
  isProductionEnv: boolean;
} {
  const isProductionEnv = Boolean(ENV_URL);
  if (typeof window === 'undefined') {
    return {
      url: ENV_URL || 'https://api.homyar-estate.ir',
      token: ENV_TOKEN,
      isProductionEnv,
    };
  }
  // Environment variables have the highest priority in production
  const url = ENV_URL || localStorage.getItem('homyar_api_url') || 'https://api.homyar-estate.ir';
  const token = ENV_TOKEN || localStorage.getItem('homyar_api_token') || '';
  return { url, token, isProductionEnv };
}

export function saveStoredDirectusConfig(url: string, token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('homyar_api_url', url.trim());
  localStorage.setItem('homyar_api_token', token.trim());
}

/**
 * Creates and returns configured API Client
 */
export function getDirectusClient(overrideUrl?: string, overrideToken?: string) {
  const { url, token } = getStoredDirectusConfig();
  const targetUrl = (overrideUrl || url).replace(/\/$/, '');
  const activeToken = overrideToken !== undefined ? overrideToken : token;

  const client = createDirectus<DirectusSchema>(targetUrl).with(rest());
  if (activeToken) {
    return client.with(staticToken(activeToken));
  }
  return client;
}

// Local cache keys
const LOCAL_STORAGE_PROPERTIES = 'homyar_local_properties_v2';
const LOCAL_STORAGE_REQUESTS = 'homyar_local_requests_v2';
const LOCAL_STORAGE_DISTRICTS = 'homyar_local_districts_v2';

function getLocalDistricts(): District[] {
  if (typeof window === 'undefined') return INITIAL_DISTRICTS;
  const raw = localStorage.getItem(LOCAL_STORAGE_DISTRICTS);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_DISTRICTS, JSON.stringify(INITIAL_DISTRICTS));
    return INITIAL_DISTRICTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_DISTRICTS;
  }
}

function getLocalProperties(): Property[] {
  if (typeof window === 'undefined') return INITIAL_PROPERTIES;
  const raw = localStorage.getItem(LOCAL_STORAGE_PROPERTIES);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    return INITIAL_PROPERTIES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROPERTIES;
  }
}

function saveLocalProperties(props: Property[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_PROPERTIES, JSON.stringify(props));
}

function getLocalRequests(): PropertyRequest[] {
  if (typeof window === 'undefined') return INITIAL_REQUESTS;
  const raw = localStorage.getItem(LOCAL_STORAGE_REQUESTS);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    return INITIAL_REQUESTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_REQUESTS;
  }
}

function saveLocalRequests(reqs: PropertyRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_REQUESTS, JSON.stringify(reqs));
}

/**
 * Test Server Connection
 */
export async function testDirectusConnection(
  targetUrl?: string,
  token?: string
): Promise<{ success: boolean; message: string }> {
  const { url } = getStoredDirectusConfig();
  const testUrl = (targetUrl || url).replace(/\/$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${testUrl}/server/ping`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      return { success: true, message: 'اتصال به سرور مرکزی با موفقیت برقرار شد.' };
    }
    return { success: false, message: `پاسخ سرور مرکزی ناموفق بود (${res.status}).` };
  } catch (err: any) {
    return {
      success: false,
      message:
        err.name === 'AbortError'
          ? 'زمان انتظار به پایان رسید (Timeout).'
          : 'امکان برقراری ارتباط با آدرس سرور وجود ندارد.',
    };
  }
}

/**
 * Fetch Districts
 */
export async function fetchDistricts(): Promise<District[]> {
  try {
    const client = getDirectusClient();
    const res = await (client as any).request(
      (readItems as any)('districts', {
        sort: ['sort', 'name'],
        limit: 100,
      })
    );
    if (Array.isArray(res) && res.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_DISTRICTS, JSON.stringify(res));
      }
      return res as District[];
    }
  } catch (error) {
    // Fall back to stored cache
  }
  return getLocalDistricts();
}

/**
 * Fetch Properties from Server or Local Cache
 */
export async function fetchProperties(): Promise<Property[]> {
  try {
    const client = getDirectusClient();
    const res = await (client as any).request(
      (readItems as any)('properties', {
        fields: ['*', { district_id: ['id', 'name', 'slug'] }],
        filter: {
          status: { _eq: 'published' },
        },
        sort: ['-date_created'],
        limit: 150,
      })
    );
    if (Array.isArray(res) && res.length > 0) {
      saveLocalProperties(res as Property[]);
      return res as Property[];
    }
  } catch (error) {
    // Fall back to stored cache
  }
  return getLocalProperties();
}

/**
 * Create a new property in Central Database & local cache
 */
export async function createProperty(
  payload: Partial<Property>
): Promise<{ success: boolean; property: Property; fromServer: boolean }> {
  let createdProperty: Property | null = null;
  let fromServer = false;

  const currentLocal = getLocalProperties();
  const newId = Date.now();
  const newProperty: Property = {
    id: newId,
    status: payload.status || 'published',
    transaction_type: payload.transaction_type || 'sale',
    title: payload.title || 'ملک بدون عنوان',
    property_type: payload.property_type || 'apartment',
    district_id: payload.district_id || 1,
    area: Number(payload.area) || 0,
    rooms: payload.rooms !== undefined && payload.rooms !== null ? Number(payload.rooms) : 1,
    floor: payload.floor !== undefined && payload.floor !== null ? Number(payload.floor) : 1,
    total_floors: payload.total_floors ? Number(payload.total_floors) : 1,
    price: payload.price ? Number(payload.price) : null,
    rent_price: payload.rent_price ? Number(payload.rent_price) : null,
    document_type: payload.document_type || 'single_leaf',
    has_elevator: Boolean(payload.has_elevator),
    has_parking: Boolean(payload.has_parking),
    has_storage: Boolean(payload.has_storage),
    address_detail: payload.address_detail || '',
    latitude: payload.latitude ? Number(payload.latitude) : 37.2809,
    longitude: payload.longitude ? Number(payload.longitude) : 49.5832,
    featured_image:
      payload.featured_image ||
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery: payload.gallery || [],
    description: payload.description || '',
    owner_name: payload.owner_name || '',
    owner_phone: payload.owner_phone || '',
    date_created: new Date().toISOString(),
  };

  try {
    const client = getDirectusClient();
    const res = await (client as any).request(
      (createItem as any)('properties', {
        ...newProperty,
        district_id:
          typeof newProperty.district_id === 'object'
            ? (newProperty.district_id as District).id
            : newProperty.district_id,
      })
    );
    if (res && res.id) {
      createdProperty = res as Property;
      fromServer = true;
    }
  } catch (error) {
    // If server unreachable, persisted locally
  }

  const finalProperty = createdProperty || newProperty;
  saveLocalProperties([finalProperty, ...currentLocal]);

  return {
    success: true,
    property: finalProperty,
    fromServer,
  };
}

/**
 * Fetch Property Requests
 */
export async function fetchPropertyRequests(): Promise<PropertyRequest[]> {
  try {
    const client = getDirectusClient();
    const res = await (client as any).request(
      (readItems as any)('property_requests', {
        sort: ['-date_created'],
        limit: 100,
      })
    );
    if (Array.isArray(res) && res.length > 0) {
      saveLocalRequests(res as PropertyRequest[]);
      return res as PropertyRequest[];
    }
  } catch (error) {
    // Fall back to cache
  }
  return getLocalRequests();
}

/**
 * Create a new Property Request (Buyer / Seller / Consultation)
 */
export async function createPropertyRequest(
  payload: Partial<PropertyRequest>
): Promise<{ success: boolean; request: PropertyRequest; fromServer: boolean }> {
  let createdRequest: PropertyRequest | null = null;
  let fromServer = false;

  const currentLocal = getLocalRequests();
  const newId = Date.now();
  const newRequest: PropertyRequest = {
    id: newId,
    status: 'new',
    request_type: payload.request_type || 'buyer',
    plan_tier: payload.plan_tier || 'free',
    full_name: payload.full_name || 'کاربر محترم',
    phone: payload.phone || '',
    budget: payload.budget ? Number(payload.budget) : null,
    notes: payload.notes || '',
    date_created: new Date().toISOString(),
  };

  try {
    const client = getDirectusClient();
    const res = await (client as any).request((createItem as any)('property_requests', newRequest));
    if (res && res.id) {
      createdRequest = res as PropertyRequest;
      fromServer = true;
    }
  } catch (error) {
    // fallback to cache
  }

  const finalRequest = createdRequest || newRequest;
  saveLocalRequests([finalRequest, ...currentLocal]);

  return {
    success: true,
    request: finalRequest,
    fromServer,
  };
}

/**
 * Get asset file URL or direct image URL
 */
export function getAssetUrl(fileIdOrUrl?: string | null): string {
  if (!fileIdOrUrl) {
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  }
  if (fileIdOrUrl.startsWith('http://') || fileIdOrUrl.startsWith('https://')) {
    return fileIdOrUrl;
  }
  const { url, token } = getStoredDirectusConfig();
  const baseUrl = `${url.replace(/\/$/, '')}/assets/${fileIdOrUrl}`;
  return token ? `${baseUrl}?access_token=${token}` : baseUrl;
}
