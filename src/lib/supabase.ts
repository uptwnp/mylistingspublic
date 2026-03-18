import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CACHE_KEY = 'property_platform_results_v5';

const formatPropertyData = (property: Record<string, unknown>) => ({
  ...property,
  public_id: String(property.public_id ?? ''),
});

/**
 * Common property fetching logic with caching for better performance
 */
async function fetchCachedData(keySuffix: string, fetchFn: () => Promise<any>, ttl: number = 3600000) {
  if (typeof window === 'undefined') return await fetchFn();
  
  const key = `${CACHE_KEY}_${keySuffix}`;
  const cached = localStorage.getItem(key);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }

  const data = await fetchFn();
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

export async function getProperties(
  page = 0, 
  limit = 20, 
  useCache = false, 
  city?: string, 
  type?: string,
  sortField: string = 'approved_on',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const fetchFn = async () => {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' });

    if (city && city !== 'All') {
      query = query.eq('city', city);
    }
    
    if (type && type !== 'All') {
      query = query.eq('type', type);
    }

    // Only fetch approved properties
    query = query.eq('status', 'approved');

    // Handle distance sorting on client side in the component
    // but default to chronological order from DB
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
    
    const from = page * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    return data.map(formatPropertyData);
  };

  if (useCache) {
    const cacheKey = `list_${city || 'all'}_${type || 'all'}_${page}_${sortField}_${sortOrder}`;
    return await fetchCachedData(cacheKey, fetchFn);
  }

  return await fetchFn();
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('property_id', id)
    .single();

  if (error) {
    console.error(`Error fetching property ${id}:`, error);
    return null;
  }

  return formatPropertyData(data);
}

export async function getPropertyCount(city?: string) {
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  if (city && city !== 'All') {
    query = query.eq('city', city);
  }

  const { count, error } = await query;
  
  if (error) {
    console.error('Error getting property count:', error);
    return 0;
  }

  return count || 0;
}

export async function getTrendingProperties(limit = 6) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'approved')
    .order('approved_on', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trending properties:', error);
    return [];
  }

  return data.map(formatPropertyData);
}

export async function getCities() {
  const { data, error } = await supabase
    .from('properties')
    .select('city')
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching cities:', error);
    return ['Panipat', 'Karnal'];
  }

  const cities = Array.from(new Set(data.map(d => d.city)));
  return cities.length > 0 ? cities : ['Panipat', 'Karnal'];
}

export async function getAreas(city?: string) {
  let query = supabase
    .from('properties')
    .select('area')
    .eq('status', 'approved');

  if (city && city !== 'All') {
    query = query.eq('city', city);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching areas:', error);
    return [];
  }

  return Array.from(new Set(data.map(d => d.area)));
}

// Support functions for Discussion Cart
export async function getPropertiesByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .in('property_id', ids);

  if (error) {
    console.error('Error fetching multiple properties:', error);
    return [];
  }

  return data.map(formatPropertyData);
}

// User-facing features
export async function submitInquiry(inquiryData: any) {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiryData]);

  if (error) {
    console.error('Error submitting inquiry:', error);
    throw error;
  }

  return data;
}

export async function submitPropertyForSale(propertyData: any) {
  const { data, error } = await supabase
    .from('property_submissions')
    .insert([propertyData]);

  if (error) {
    console.error('Error submitting property for sale:', error);
    throw error;
  }

  return data;
}
