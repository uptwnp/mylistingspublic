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
      // Example: https://c60696ba6ea91f21fe51c590227fc61d.r2.cloudflarestorage.com/properties/images/...
      // To: https://pub-9e00030e294c40efa96642db5ba7f437.r2.dev/images/...
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
  approved_on
`;

export const getProperties = async (
  page = 0, 
  limit = 20, 
  useCache = false, 
  city?: string, 
  type?: string,
  sortBy: string = 'approved_on',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  const safeLimit = Math.min(limit, 20);
  const cacheKey = `${CACHE_KEY}_${city || 'All'}_${type || 'All'}_${sortBy}_${sortOrder}`;
  
  // Try to get from localStorage first for "Perceived Instant" speed
  if (useCache && typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached && page === 0) {
      return JSON.parse(cached).slice(0, 20);
    }
  }

  const from = page * safeLimit;
  const to = from + safeLimit - 1;

  let queryBuilder = supabase
    .from('public_properties_view')
    .select(PUBLIC_FIELDS);

  if (city && city !== 'All') {
    // Use a more flexible ilike to catch varied formatting
    queryBuilder = queryBuilder.ilike('city', `%${city.trim()}%`);
  }

  if (type && type !== 'All') {
    queryBuilder = queryBuilder.ilike('type', `%${type.trim()}%`);
  }

  // Define secondary sort to ensure stable pagination
  const { data, error } = await queryBuilder
    .range(from, to)
    .order(sortBy, { ascending: sortOrder === 'asc', nullsFirst: false })
    .order('property_id', { ascending: true });

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  const formattedData = (data as Record<string, unknown>[])?.map(formatPropertyData).slice(0, 20);

  // Update cache on initial load - only if enabled
  if (useCache && page === 0 && typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, JSON.stringify(formattedData));
  }

  return formattedData;
};

export const getPropertyById = async (id: string | number) => {
  if (!id) return null;
  
  // Clean the ID - ensure it's a string then check if it's numeric-ish
  const cleanId = String(id).trim();
  
  // If it's not a number, we shouldn't even try querying numeric columns to avoid PostgREST errors
  if (!/^\d+$/.test(cleanId)) {
    console.error('Invalid property ID format:', cleanId);
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('public_properties_view')
      .select(PUBLIC_FIELDS)
      .or(`property_id.eq.${cleanId},public_id.eq.${cleanId}`)
      .limit(1);

    if (error) {
      console.error('Supabase error fetching property:', error.message, error.details);
      return null;
    }

    return (data && data.length > 0) ? formatPropertyData(data[0] as Record<string, unknown>) : null;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Critical error in getPropertyById:', error.message);
    return null;
  }
};

export const getPropertiesByIds = async (ids: string[]) => {
  if (!ids || ids.length === 0) return [];
  
  // Clean IDs - remove empty ones and ensure they are numeric strings, cap at 20 requests
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

    const formattedData = (data as Record<string, unknown>[])?.map(formatPropertyData) || [];
    return formattedData.slice(0, 20);
  } catch (err) {
    console.error('Critical error in getPropertiesByIds:', err);
    return [];
  }
};

export const clearPropertyCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
};
