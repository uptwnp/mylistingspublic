'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PropertySectionProps {
  title: string;
  city: string;
  type: string;
}

export function PropertySection({ title, city, type }: PropertySectionProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSectionProperties() {
      setLoading(true);
      try {
        // Fetch more than needed to filter locally if type mapping is complex, 
        // but here we can try to filter by city in query and then type locally or via tags if possible.
        // For now, let's fetch first 50 properties for the city and filter.
        const data = await getProperties(0, 20, true, city, type);
        
        const filtered = data.filter((p: Property) => {
          // Double check city match locally (safety)
          const pCity = p.city?.toLowerCase() || '';
          const targetCity = city.toLowerCase();
          const cityMatch = pCity.includes(targetCity) || targetCity.includes(pCity);
          
          if (!cityMatch && city !== 'All') return false;

          const pType = p.type?.toLowerCase() || '';
          const targetType = type.toLowerCase();
          
          let typeMatch = false;
          if (targetType === 'residential plot') typeMatch = pType.includes('plot') || pType.includes('land');
          else if (targetType === 'house/villa') typeMatch = pType.includes('house') || pType.includes('villa');
          else if (targetType === 'flat/apartment') typeMatch = pType.includes('flat') || pType.includes('apartment');
          else if (targetType === 'commercial') typeMatch = pType.includes('commercial') || pType.includes('shop') || pType.includes('office');
          else typeMatch = pType.includes(targetType);

          return typeMatch;
        }).slice(0, 6); // Show up to 6 cards

        setProperties(filtered);
      } catch (error) {
        console.error(`Error fetching properties for section ${title}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchSectionProperties();
  }, [city, type, title]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!loading && properties.length === 0) return null;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-4">
          <h2 className="ty-display font-black tracking-tight text-zinc-900 truncate">
            {title}
          </h2>
          <p className="ty-caption text-zinc-500 font-medium truncate">Hand-picked properties in {city}.</p>
        </div>
        <Link 
          href={`/explore?city=${city}&type=${type}`}
          className="group flex items-center gap-2 ty-caption font-bold text-zinc-900 hover:text-zinc-600 transition-colors"
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
    </div>
  );
}
