'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';
import { useShortlist } from '@/context/ShortlistContext';

export function PropertyGrid() {
  const { selectedCity } = useShortlist();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const fetchData = useCallback(async (isInitial = true, useCache = false) => {
    if (isInitial) {
      if (!useCache) setRefreshing(true);
      else setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const nextP = isInitial ? 0 : page + 1;
      const data = await getProperties(nextP, LIMIT, useCache, selectedCity);
      
      if (isInitial) {
        const newData = data as Property[];
        const uniqueData = newData.filter((p, index, self) => 
          index === self.findIndex((t) => t.property_id === p.property_id)
        );
        setProperties(uniqueData);
        setPage(0);
      } else {
        setProperties(prev => {
          const newData = data as Property[];
          const existingIds = new Set(prev.map(p => p.property_id));
          const filteredNewData = newData.filter(p => !existingIds.has(p.property_id));
          return [...prev, ...filteredNewData];
        });
        setPage(nextP);
      }
      
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page, selectedCity]);

  useEffect(() => {
    setProperties([]);
    fetchData(true, true);
  }, [selectedCity]); // Re-fetch when city changes

  useEffect(() => {
    if (properties.length === 0 && !loading) {
      fetchData(true, true);
    }
  }, [fetchData]);

  const [selectedType, setSelectedType] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const PROPERTY_TYPES = ["All", "Residential Plot", "House/Villa", "Flat/Apartment", "Commercial", "Industrial"];

  const filteredProperties = properties.filter(p => {
    // City match (safety check)
    if (selectedCity && selectedCity !== 'All') {
      if (p.city?.toLowerCase() !== selectedCity.toLowerCase()) return false;
    }

    if (selectedType === 'All') return true;

    const type = p.type.toLowerCase();
    if (selectedType === 'Residential Plot') return type.includes('plot') || type.includes('land');
    if (selectedType === 'House/Villa') return type.includes('house') || type.includes('villa');
    if (selectedType === 'Flat/Apartment') return type.includes('flat') || type.includes('apartment');
    if (selectedType === 'Commercial') return type.includes('commercial') || type.includes('shop') || type.includes('office');
    if (selectedType === 'Industrial') return type.includes('industrial') || type.includes('warehouse');
    return false;
  });

  const handleRefresh = () => {
    fetchData(true, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchData(false, false);
    }
  };

  return (
    <div id="property-grid" className="w-full space-y-6">
      {/* Property Type Filters - Android Style */}
      <div className="-mx-4 flex overflow-x-auto px-4 py-2 scrollbar-none sm:mx-0 sm:px-0">
        <div className="flex gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold tracking-tight transition-all active:scale-95",
                selectedType === type
                  ? "bg-zinc-900 text-white shadow-lg"
                  : "bg-white text-zinc-500 border border-zinc-100 hover:border-zinc-200"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 items-start">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard 
              key={property.property_id} 
              property={property} 
              isExpanded={expandedId === property.property_id}
              onToggle={() => setExpandedId(expandedId === property.property_id ? null : property.property_id)}
            />
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading More Properties...
              </>
            ) : (
              'Load More Results'
            )}
          </button>
        </div>
      )}

      {properties.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-zinc-500">No properties found. Try refreshing.</p>
        </div>
      )}
    </div>
  );
}
