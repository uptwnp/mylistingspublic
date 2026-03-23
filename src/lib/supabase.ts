import { createClient } from '@supabase/supabase-js';
import { getFallbackUnit } from './utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Handle missing environment variables gracefully during build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

const CACHE_KEY = 'property_platform_results_v6';
const AREAS_CACHE_KEY = 'property_platform_areas_v1';
const CITIES_CACHE_KEY = 'property_platform_cities_v1';
const CENTERS_CACHE_KEY = 'property_platform_centers_v1';
const CACHE_TTL = 3600000; // 1 hour

// Simple in-memory deduplication for pending requests
const pendingRequests: Record<string, Promise<any> | undefined> = {};

async function dedupeRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = pendingRequests[key];
  if (existing) return existing as Promise<T>;
  
  const promise = fetcher().finally(() => {
    pendingRequests[key] = undefined;
  });
  
  pendingRequests[key] = promise;
  return promise;
}


const formatPropertyData = (property: Record<string, unknown>) => {
  const formatted = {
    ...property,
    public_id: String(property.public_id ?? ''),
    property_id: String(property.property_id ?? ''),
    tags: typeof property.tags === 'string' 
      ? property.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : Array.isArray(property.tags) ? (property.tags as any).filter(Boolean) : [],
    highlights: typeof property.highlights === 'string'
      ? property.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
      : Array.isArray(property.highlights) ? (property.highlights as any).filter(Boolean) : [],
    image_urls: (typeof property.image_urls === 'string' 
      ? property.image_urls.split(',').map((url: string) => url.trim()).filter(Boolean)
      : Array.isArray(property.image_urls) ? property.image_urls : []
    ).map((url: string) => {
      if (typeof url === 'string' && url.includes('r2.cloudflarestorage.com')) {
        return url.replace('c60696ba6ea91f21fe51c590227fc61d.r2.cloudflarestorage.com/properties', 'pub-9e00030e294c40efa96642db5ba7f437.r2.dev');
      }
      return url;
    })
  } as any;
  
  return formatted;
};

const PUBLIC_FIELDS = 'public_id,property_id,city,area,type,description,size_min,size_max,size_unit,price_min,price_max,formatted_price,tags,highlights,image_urls,is_photos_public,landmark_location,latitude,longitude,loc_fallback,landmark_location_distance,search_text,approved_on,status';

export async function getProperties(
  page = 0, 
  limit = 20, 
  useCache = false, 
  city?: string, 
  type?: string,
  sortField: string = 'approved_on',
  sortOrder: 'asc' | 'desc' = 'desc',
  area?: string,
  budget?: string,
  minSize?: string,
  maxSize?: string,
  highlights?: string,
  keywords?: string,
  userLat?: number | null,
  userLng?: number | null
) {
  if (!supabase) return { data: [], count: 0 };

  const safeLimit = Math.min(limit, 20); // Strict maximum for pagination
  const cacheKey = `${CACHE_KEY}_${city || 'All'}_${type || 'All'}_${area || 'All'}_${budget || 'Any'}_${minSize || '0'}_${maxSize || 'Any'}_${highlights || 'None'}_${keywords || 'None'}_${sortField}_${sortOrder}_${userLat || 'noLat'}_${userLng || 'noLng'}_${page}`;
  
  // 1. Try LocalStorage Cache (Browser Only) - Perceived Instant Speed
  if (useCache && typeof window !== 'undefined' && page === 0) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) return data;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  // 2. Map Budget string to numeric values (consistent with SQL function)
  let p_min_price = null;
  let p_max_price = null;
  if (budget && budget !== 'Any Budget') {
    const b = budget.toLowerCase();
    if (b.includes('under 40')) p_max_price = 40;
    else if (b.includes('40 to 80')) { p_min_price = 40; p_max_price = 80; }
    else if (b.includes('80 lakh to 1.2 cr')) { p_min_price = 80; p_max_price = 120; }
    else if (b.includes('1.2 cr to 1.6 cr')) { p_min_price = 120; p_max_price = 160; }
    else if (b.includes('1.6 to 2.5 cr')) { p_min_price = 160; p_max_price = 250; }
    else if (b.includes('2.5 cr to 5 cr')) { p_min_price = 250; p_max_price = 500; }
    else if (b.includes('5 cr to 10 cr')) { p_min_price = 500; p_max_price = 1000; }
    else if (b.includes('10 cr to 50 cr')) { p_min_price = 1000; p_max_price = 5000; }
    else if (b.includes('50 cr to 100 cr')) { p_min_price = 5000; p_max_price = 10000; }
    else if (b.includes('100 cr')) p_min_price = 10000;
  }

  // 3. Unified RPC Call (The "Vercel Optimized" Way)
  try {
    const { data, error } = await supabase.rpc('get_public_properties_v2', {
      p_city: city || 'All',
      p_type: type || 'All',
      p_area: area || 'All',
      p_min_price,
      p_max_price,
      p_min_size: minSize ? parseFloat(minSize) : null,
      p_max_size: maxSize ? parseFloat(maxSize) : null,
      p_highlights: highlights,
      p_keywords: keywords,
      p_user_lat: userLat,
      p_user_lng: userLng,
      p_sort_field: sortField,
      p_sort_order: sortOrder,
      p_page: page,
      p_limit: safeLimit
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      // Fallback: If function doesn't exist yet, we stick to the old client logic temporarily
      throw error; 
    }

    const { properties, total_count } = (data as any)[0] || { properties: [], total_count: 0 };
    const formattedData = properties?.map(formatPropertyData) || [];

    // Local Storage Caching
    if (useCache && page === 0 && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify({ data: { data: formattedData, count: total_count }, timestamp: Date.now() }));
    }

    return { data: formattedData, count: total_count };
  } catch (err) {
    console.error('RPC failed, ensure get_public_properties_v2 is deployed in SQL Editor:', err);
    return { data: [], count: 0 };
  }
}



export async function getPropertyById(id: string | number) {
  if (!supabase || !id) return null;
  const cleanId = String(id).trim();

  try {
    const { data, error } = await supabase
      .from('website_public_listing')
      .select(PUBLIC_FIELDS)
      .eq('property_id', cleanId)
      .maybeSingle();

    if (error) {
      console.error('Error in direct getPropertyById:', error);
      return null;
    }

    return data ? formatPropertyData(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error('Critical error in getPropertyById:', err);
    return null;
  }
}

export async function getPropertiesByIds(ids: string[]) {
  if (!supabase || !ids || ids.length === 0) return [];
  
  const cleanIds = ids.map(id => String(id).trim())
    .filter(id => /^\d+$/.test(id))
    .slice(0, 20);
  
  if (cleanIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('website_public_listing')
      .select(PUBLIC_FIELDS)
      .in('property_id', cleanIds);

    if (error) {
      console.error('Error fetching properties by IDs:', error);
      return [];
    }

    return (data as Record<string, unknown>[])?.map(formatPropertyData) || [];
  } catch (err) {
    console.error('Critical error in getPropertiesByIds:', err);
    return [];
  }
}

export async function getPropertyCount(city?: string) {
  if (!supabase) return 0;
  try {
    let query = supabase
      .from('website_public_listing')
      .select('*', { count: 'exact', head: true });

    if (city && city !== 'All') {
      query = query.ilike('city', `%${city.trim()}%`);
    }

    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  } catch (err) {
    return 0;
  }
}

export async function getTrendingProperties(limit = 6) {
  return getProperties(0, limit, true, 'All', 'All', 'approved_on', 'desc');
}

import { getLocationSuggestionsAction } from '@/app/actions/property-actions';

/**
 * Optimized Cities list (uses Vercel caching)
 */
export async function getCities() {
  return getLocationSuggestionsAction('city');
}

/**
 * Optimized Areas list (uses Vercel caching)
 * Supports live query search optionally.
 */
export async function getAreas(city?: string, query?: string) {
  return getLocationSuggestionsAction('area', city || 'All', query || '');
}

export async function getAreaCenters() {
  if (!supabase) return [];
  
  return dedupeRequest('area_centers', async () => {
    // Try cache first
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CENTERS_CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) return data;
        } catch (e) {
          localStorage.removeItem(CENTERS_CACHE_KEY);
        }
      }
    }

    try {
      const { data, error } = await supabase
        .from('area_locations')
        .select('city, area, center_location');
      
      if (error) throw error;
      
      if (typeof window !== 'undefined' && data.length > 0) {
        localStorage.setItem(CENTERS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      }
      
      return data;
    } catch (err) {
      console.error('Error in getAreaCenters:', err);
      return [];
    }
  });
}

export async function upsertVisitor(visitorData: Record<string, any>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('visitors')
    .upsert({
      name: visitorData.fullName || visitorData.name,
      phone: visitorData.phoneNumber || visitorData.phone,
      email: visitorData.email,
      address: visitorData.address,
      budget: visitorData.budget,
      active_request_type: visitorData.active_request_type || 'other',
      pref_ts: visitorData.pref_ts,
      ip: visitorData.ip,
      domain: visitorData.domain,
      ref: visitorData.ref,
      shortlist_items_json: visitorData.shortlist_items_json || [],
      updated_at: new Date().toISOString()
    }, { onConflict: 'phone' })
    .select()
    .single();

  if (error) {
    console.error('Error in upsertVisitor:', error.message, error.details, error.hint);
    throw error;
  }
  return data;
}

export async function submitInquiry(inquiryData: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  
  // 1. Create or Update Visitor
  const visitor = await upsertVisitor({
    ...inquiryData,
    active_request_type: inquiryData.type || 'inquiry'
  });

  // 2. Insert into inquiries table if it still exists, 
  // but for now let's just use the visitors table as the primary source of truth for leads.
  // If the user specifically has an inquiries table, we keep it.
  const { data, error } = await supabase.from('inquiries').insert([{
    ...inquiryData,
    visitor_id: visitor.id
  }]);
  
  if (error) throw error;
  return { visitor, data };
}

export async function submitPropertyForSale(propertyData: any, visitorData: any) {
  if (!supabase) throw new Error('Supabase not initialized');

  // 1. Create or Update Visitor
  const visitor = await upsertVisitor({
    ...visitorData,
    active_request_type: 'sell'
  });

  // 2. Insert into for_sell_requests
  const { data, error } = await supabase
    .from('for_sell_requests')
    .insert([{
      visitor_id: visitor.id,
      property_type: propertyData.type,
      city: propertyData.city,
      area: propertyData.area,
      price: parseFloat(propertyData.price),
      size: parseFloat(propertyData.size),
      size_unit: propertyData.size_unit || getFallbackUnit(parseFloat(propertyData.price), parseFloat(propertyData.size)),
      description: propertyData.description,
      landmark_location: propertyData.location ? `${propertyData.location.lat},${propertyData.location.lng}` : null,
      status: 'pending'
    }]);

  if (error) {
    console.error('Error in submitPropertyForSale:', error);
    throw error;
  }
  
  return { visitor, data };
}

export const clearPropertyCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
    // Also clear keys that start with the CACHE_KEY
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_KEY))
      .forEach(key => localStorage.removeItem(key));
  }
};

export async function syncShortlist(visitorData: any, shortlistItems: string[], inquiries: Record<string, any>) {
  if (!supabase) return;
  
  return upsertVisitor({
    ...visitorData,
    shortlist_items_json: shortlistItems.map(id => ({
      property_id: id,
      notes: inquiries[id]?.question || '',
      added_at: Date.now()
    }))
  });
}

export async function submitConsultationRequest(request: any) {
  if (!supabase) throw new Error('Supabase not initialized');

  // 1. Upsert Visitor first to ensure we have an ID
  const visitor = await upsertVisitor({
    ...request.contactDetails,
    active_request_type: request.type,
    pref_ts: request.preferredDate || request.preferredTime
  });

  // 2. We can log this in a separate consultation_requests table if needed,
  // but based on the user's specific request for 'visitors' and 'for_sell_requests',
  // we are already updating the visitor's 'active_request_type' and 'pref_ts'.
  
  // If the user has a consultation_requests table, we insert there.
  // For now, let's just make sure the visitor is synced.
  return visitor;
}
