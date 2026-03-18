import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Handle missing environment variables gracefully during build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

const CACHE_KEY = 'property_platform_results_v5';

const formatPropertyData = (property: Record<string, unknown>) => ({
  ...property,
  public_id: String(property.public_id ?? ''),
  property_id: String(property.property_id ?? ''),
  tags: typeof property.tags === 'string' 
    ? property.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : Array.isArray(property.tags) ? property.tags : [],
  highlights: typeof property.highlights === 'string'
    ? property.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
    : Array.isArray(property.highlights) ? property.highlights : [],
  image_urls: (typeof property.image_urls === 'string' 
    ? property.image_urls.split(',').map((url: string) => url.trim()).filter(Boolean)
    : Array.isArray(property.image_urls) ? property.image_urls : []
  ).map((url: string) => {
    if (url.includes('r2.cloudflarestorage.com')) {
      // Convert internal R2 URL to public working format
      return url.replace('c60696ba6ea91f21fe51c590227fc61d.r2.cloudflarestorage.com/properties', 'pub-9e00030e294c40efa96642db5ba7f437.r2.dev');
    }
    return url;
  })
});

const PUBLIC_FIELDS = `
  public_id,
  property_id,
  city,
  area,
  type,
  description,
  size_min,
  size_max,
  size_unit,
  price_min,
  price_max,
  tags,
  highlights,
  image_urls,
  is_photos_public,
  landmark_location,
  landmark_location_distance,
  approved_on,
  status
`;

export async function getProperties(
  page = 0, 
  limit = 20, 
  useCache = false, 
  city?: string, 
  type?: string,
  sortField: string = 'approved_on',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  if (!supabase) return [];

  const safeLimit = Math.min(limit, 20);
  const cacheKey = `${CACHE_KEY}_${city || 'All'}_${type || 'All'}_${sortField}_${sortOrder}_${page}`;
  
  // Try to get from localStorage first for "Perceived Instant" speed
  if (useCache && typeof window !== 'undefined' && page === 0) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) { // 1 hour TTL
          return data;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  const from = page * safeLimit;
  const to = from + safeLimit - 1;

  try {
    let query = supabase
      .from('public_properties_view')
      .select(PUBLIC_FIELDS);

    if (city && city !== 'All') {
      query = query.ilike('city', `%${city.trim()}%`);
    }

    if (type && type !== 'All') {
      query = query.ilike('type', `%${type.trim()}%`);
    }

    const { data, error } = await query
      .range(from, to)
      .order(sortField, { ascending: sortOrder === 'asc', nullsFirst: false })
      .order('property_id', { ascending: true });

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    const formattedData = (data as Record<string, unknown>[])?.map(formatPropertyData);

    if (useCache && page === 0 && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify({ data: formattedData, timestamp: Date.now() }));
    }

    return formattedData;
  } catch (err) {
    console.error('Critical error in getProperties:', err);
    return [];
  }
}

export async function getPropertyById(id: string | number) {
  if (!supabase || !id) return null;
  const cleanId = String(id).trim();
  
  if (!/^\d+$/.test(cleanId)) return null;

  try {
    const { data, error } = await supabase
      .from('public_properties_view')
      .select(PUBLIC_FIELDS)
      .or(`property_id.eq.${cleanId},public_id.eq.${cleanId}`)
      .limit(1);

    if (error) {
      console.error('Error fetching property:', error);
      return null;
    }

    return (data && data.length > 0) ? formatPropertyData(data[0] as Record<string, unknown>) : null;
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
      .from('public_properties_view')
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
      .from('public_properties_view')
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

export async function getCities() {
  if (!supabase) return ['Panipat', 'Karnal'];
  try {
    const { data, error } = await supabase
      .from('public_properties_view')
      .select('city');
    
    if (error) return ['Panipat', 'Karnal'];
    
    const cities = Array.from(new Set((data as any[]).map(d => d.city))).filter(Boolean);
    return cities.length > 0 ? cities : ['Panipat', 'Karnal'];
  } catch (err) {
    return ['Panipat', 'Karnal'];
  }
}

export async function getAreas(city?: string) {
  if (!supabase) return [];
  try {
    let query = supabase
      .from('public_properties_view')
      .select('area');

    if (city && city !== 'All') {
      query = query.ilike('city', `%${city.trim()}%`);
    }

    const { data, error } = await query;
    if (error) return [];
    
    return Array.from(new Set((data as any[]).map(d => d.area))).filter(Boolean);
  } catch (err) {
    return [];
  }
}

export async function submitInquiry(inquiryData: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('inquiries').insert([inquiryData]);
  if (error) throw error;
  return data;
}

export async function submitPropertyForSale(propertyData: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('property_submissions').insert([propertyData]);
  if (error) throw error;
  return data;
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
