import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Handle missing environment variables gracefully during build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

const CACHE_KEY = 'property_platform_results_v5';
const AREAS_CACHE_KEY = 'property_platform_areas_v1';
const CITIES_CACHE_KEY = 'property_platform_cities_v1';
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
      : Array.isArray(property.tags) ? property.tags : [],
    highlights: typeof property.highlights === 'string'
      ? property.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
      : Array.isArray(property.highlights) ? property.highlights : [],
    image_urls: (typeof property.image_urls === 'string' 
      ? property.image_urls.split(',').map((url: string) => url.trim()).filter(Boolean)
      : Array.isArray(property.image_urls) ? property.image_urls : []
    ).map((url: string) => {
      if (url.includes('r2.cloudflarestorage.com')) {
        return url.replace('c60696ba6ea91f21fe51c590227fc61d.r2.cloudflarestorage.com/properties', 'pub-9e00030e294c40efa96642db5ba7f437.r2.dev');
      }
      return url;
    })
  } as any;

  // Extract latitude and longitude from landmark_location if it's in "lat,lng" format
  if (property.landmark_location && typeof property.landmark_location === 'string') {
    const parts = property.landmark_location.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        formatted.latitude = lat;
        formatted.longitude = lng;
      }
    }
  }
  
  return formatted;
};

const PUBLIC_FIELDS = 'public_id,property_id,city,area,type,description,size_min,size_max,size_unit,price_min,price_max,tags,highlights,image_urls,is_photos_public,landmark_location,landmark_location_distance,approved_on,status';

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
  keywords?: string
) {
  if (!supabase) return [];

  const safeLimit = Math.min(limit, 50);
  const cacheKey = `${CACHE_KEY}_${city || 'All'}_${type || 'All'}_${area || 'All'}_${budget || 'Any'}_${minSize || '0'}_${maxSize || 'Any'}_${highlights || 'None'}_${keywords || 'None'}_${sortField}_${sortOrder}_${page}`;
  
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

    if (type && type !== 'All' && type !== 'Any Type') {
      query = query.ilike('type', `%${type.trim()}%`);
    }

    if (area && area !== 'All' && area !== 'Near Me') {
      query = query.ilike('area', `%${area.trim()}%`);
    }

    if (budget && budget !== 'Any Budget') {
      // Prices in DB are in Lakhs: 1 = 1 Lakh, 100 = 1 Cr
      // Overlap logic: p_min <= u_max AND p_max >= u_min
      
      if (budget === 'Under 40 Lakh') {
        query = query.lte('price_min', 40);
      } else if (budget === '40 to 80 Lakh') {
        query = query.lte('price_min', 80).gte('price_max', 40);
      } else if (budget === '80 Lakh to 1.2 Cr') {
        query = query.lte('price_min', 120).gte('price_max', 80);
      } else if (budget === '1.2 Cr to 1.6 Cr') {
        query = query.lte('price_min', 160).gte('price_max', 120);
      } else if (budget === '1.6 to 2.5 Cr') {
        query = query.lte('price_min', 250).gte('price_max', 160);
      } else if (budget === '2.5 Cr to 5 Cr') {
        query = query.lte('price_min', 500).gte('price_max', 250);
      } else if (budget === '5 Cr to 10 Cr') {
        query = query.lte('price_min', 1000).gte('price_max', 500);
      } else if (budget === '10 Cr to 50 cr') {
        query = query.lte('price_min', 5000).gte('price_max', 1000);
      } else if (budget === '50 Cr to 100 cr') {
        query = query.lte('price_min', 10000).gte('price_max', 5000);
      } else if (budget === '100 Cr+') {
        query = query.gte('price_max', 10000);
      }
    }

    if (minSize) {
      const sizeVal = parseFloat(minSize);
      if (!isNaN(sizeVal)) query = query.gte('size_min', sizeVal);
    }

    if (maxSize) {
      const sizeVal = parseFloat(maxSize);
      if (!isNaN(sizeVal)) query = query.lte('size_max', sizeVal);
    }

    if (highlights) {
      const highlightList = highlights.split(',').map(h => h.trim()).filter(Boolean);
      if (highlightList.length > 0) {
        // Since Supabase REST API doesn't support 'contains' well for CSV strings, we use ilike for each if needed, 
        // but often highlights are stored as text arrays or JSONB. 
        // Assuming they are comma-separated text based on formatPropertyData.
        highlightList.forEach(h => {
          query = query.ilike('highlights', `%${h}%`);
        });
      }
    }

    if (keywords) {
      query = query.or(`description.ilike.%${keywords}%,tags.ilike.%${keywords}%,area.ilike.%${keywords}%,type.ilike.%${keywords}%,city.ilike.%${keywords}%`);
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
  
  return dedupeRequest('cities', async () => {
    // Try cache first
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CITIES_CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) return data;
        } catch (e) {
          localStorage.removeItem(CITIES_CACHE_KEY);
        }
      }
    }

    try {
      const { data, error } = await supabase
        .from('public_properties_view')
        .select('city');
      
      if (error) throw error;
      
      const cities = Array.from(new Set((data as any[]).map(d => d.city))).filter(Boolean);
      const result = cities.length > 0 ? cities : ['Panipat', 'Karnal'];

      if (typeof window !== 'undefined') {
        localStorage.setItem(CITIES_CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
      }

      return result;
    } catch (err) {
      console.error('Error in getCities:', err);
      return ['Panipat', 'Karnal'];
    }
  });
}

export async function getAreas(city?: string) {
  if (!supabase) return [];
  const cacheKey = `${AREAS_CACHE_KEY}_${city || 'All'}`;
  
  return dedupeRequest(cacheKey, async () => {
    // Try cache first
    if (typeof window !== 'undefined') {
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

    try {
      let query = supabase
        .from('public_properties_view')
        .select('area');

      if (city && city !== 'All') {
        query = query.ilike('city', `%${city.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const areas = Array.from(new Set((data as any[]).map(d => d.area))).filter(Boolean);

      if (typeof window !== 'undefined' && areas.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({ data: areas, timestamp: Date.now() }));
      }
      
      return areas;
    } catch (err) {
      console.error('Error in getAreas:', err);
      return [];
    }
  });
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
