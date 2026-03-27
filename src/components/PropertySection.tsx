'use client';

import { useEffect, useState, useRef } from 'react';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getSeoUrl } from '@/lib/seo-utils';

interface PropertySectionProps {
  title: string;
  city: string;
  type: string;
  initialData?: { data: Property[], count: number };
}

export function PropertySection({ title, city, type, initialData }: PropertySectionProps) {
  const [properties, setProperties] = useState<Property[]>(initialData?.data || []);
  const [loading, setLoading] = useState(!initialData);
  const [hasEntered, setHasEntered] = useState(!!initialData);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEntered) return;
    
    // Skip fetching if we already have initial properties for THIS city and type
    // This prevents the redundant client-side fetch on hydrate
    // Use stringify to compare data content instead of reference (references break on SSR/Hydration)
    const initialDataJson = initialData ? JSON.stringify(initialData.data) : null;
    const currentDataJson = JSON.stringify(properties);
    
    if (initialData && properties.length > 0 && initialDataJson === currentDataJson) {
      return;
    }

    async function fetchSectionProperties() {
      setLoading(true);
      try {
        // Now handled entirely by the RPC for performance
        const { data } = await getProperties(0, 6, true, city, type);
        setProperties(data);
      } catch (error) {
        console.error(`Error fetching properties for section ${title}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchSectionProperties();
  }, [hasEntered, city, type, title, initialData]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!loading && hasEntered && properties.length === 0) return null;

  return (
    <div ref={sectionRef} className="w-full space-y-4 sm:space-y-6 scroll-mt-20">
      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-4">
          <h2 className="ty-display font-black tracking-tight text-zinc-900 truncate">
            {title}
          </h2>
          <p className="ty-caption text-zinc-500 font-medium truncate">Latest properties in {city}.</p>
        </div>
        <Link 
          href={getSeoUrl(city, type) || `/explore?city=${city}&type=${type}`}
          className="group hidden sm:flex items-center gap-2 ty-caption font-bold text-zinc-900 hover:text-zinc-600 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))
        ) : (
          properties.map((property) => (
            <PropertyCard 
              key={property.property_id} 
              property={property} 
              isExpanded={expandedId === property.property_id}
              onToggle={() => setExpandedId(expandedId === property.property_id ? null : property.property_id)}
            />
          ))
        )}
      </div>

      <Link 
        href={getSeoUrl(city, type) || `/explore?city=${city}&type=${type}`}
        className="group flex sm:hidden items-center justify-center gap-3 w-full py-3.5 bg-white rounded-full border border-zinc-200 ty-caption font-bold text-zinc-900 shadow-sm hover:shadow-md transition-all active:scale-[0.98] mt-2 group/btn"
      >
        View All {title}
        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
      </Link>
    </div>
  );
}
