'use server';

import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';

/**
 * Optimized Location Hub for Vercel.
 * Caches the "Top 20" lists (no query) to prevent redundant DB hits. 
 * Provides live search for queries.
 */
export async function getLocationSuggestionsAction(
  type: 'city' | 'area',
  city: string = 'All',
  query: string = '',
  limit: number = 20
) {
  // 1. If no query, we use Vercel's Global Data Cache (unstable_cache)
  if (!query) {
    // We wrap the fetch in unstable_cache for cross-user caching on Vercel
    const cachedFetch = unstable_cache(
      async (t: string, c: string, l: number) => {
        if (!supabase) return [];
        
        try {
          const { data, error } = await supabase.rpc('get_location_hub', {
            p_type: t,
            p_city: c,
            p_query: null,
            p_limit: l
          });
          
          if (error) {
            console.error(`Location cache fetch error (${t}):`, error);
            return [];
          }
          
          return (data as any[])?.map(d => d.name) || [];
        } catch (err) {
          console.error(`Location Hub Critical Error (${t}):`, err);
          return [];
        }
      },
      [`location-hub-v2-${type}-${city}-${limit}`],
      {
        revalidate: 3600, // 1 hour cache TTL on Vercel
        tags: ['locations', `locations-${type}`]
      }
    );
    
    return cachedFetch(type, city, limit);
  }

  // 2. Dynamic Search (Skips cache for real-time accuracy)
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase.rpc('get_location_hub', {
      p_type: type,
      p_city: city,
      p_query: query,
      p_limit: limit
    });
    
    if (error) {
       console.error(`Dynamic search error (${type}):`, error);
       return [];
    }
    
    return (data as any[])?.map(d => d.name) || [];
  } catch (err) {
    return [];
  }
}
