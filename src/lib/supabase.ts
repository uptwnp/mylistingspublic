import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CACHE_KEY = 'property_platform_results';

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
  image_urls: Array.isArray(property.image_urls) ? property.image_urls : []
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

export const getProperties = async (page = 0, limit = 20, useCache = false) => {
  // Try to get from localStorage first for "Perceived Instant" speed
  if (useCache && typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached && page === 0) {
      return JSON.parse(cached);
    }
  }

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('public_properties_view')
    .select(PUBLIC_FIELDS)
    .range(from, to)
    .order('approved_on', { ascending: false })
    .order('property_id', { ascending: true });

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  const formattedData = (data as Record<string, unknown>[])?.map(formatPropertyData);

  // Update cache on initial load - only if enabled
  if (useCache && page === 0 && typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEY, JSON.stringify(formattedData));
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

export const clearPropertyCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
};
