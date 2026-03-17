'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PropertyGrid() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 24;

  const fetchData = async (isInitial = true, useCache = false) => {
    if (isInitial) {
      if (!useCache) setRefreshing(true);
      else setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const nextP = isInitial ? 0 : page + 1;
      const data = await getProperties(nextP, LIMIT, useCache);
      
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
  };

  const [selectedType, setSelectedType] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const PROPERTY_TYPES = ["All", "Residential Plot", "House/Villa", "Flat/Apartment", "Commercial", "Industrial"];

  const filteredProperties = selectedType === 'All' 
    ? properties 
    : properties.filter(p => {
        const type = p.type.toLowerCase();
        if (selectedType === 'Residential Plot') return type.includes('plot') || type.includes('land');
        if (selectedType === 'House/Villa') return type.includes('house') || type.includes('villa');
        if (selectedType === 'Flat/Apartment') return type.includes('flat') || type.includes('apartment');
        if (selectedType === 'Commercial') return type.includes('commercial') || type.includes('shop') || type.includes('office');
        if (selectedType === 'Industrial') return type.includes('industrial') || type.includes('warehouse');
        return false;
      });

  useEffect(() => {
    fetchData(true, false);
  }, []);

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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            Curated Listings
          </h2>
          <p className="text-sm text-zinc-500">Hand-picked premium properties for you.</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCcw className={refreshing ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
          {refreshing ? 'Refreshing...' : 'Refresh Results'}
        </button>
      </div>

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
