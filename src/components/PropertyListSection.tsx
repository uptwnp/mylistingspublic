'use client';

import { useEffect, useState, useRef } from 'react';
import { Property } from '@/types';
import { getPropertiesByIds } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PropertyListSectionProps {
  title: string;
  subtitle?: string;
  propertyIds: string[];
  viewAllLink?: string;
}

export function PropertyListSection({ title, subtitle, propertyIds, viewAllLink }: PropertyListSectionProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
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

    async function fetchProperties() {
      if (!propertyIds || propertyIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const data = await getPropertiesByIds(propertyIds);
        
        // Sort data based on the order in propertyIds
        const sortedData = [...data].sort((a, b) => {
          return propertyIds.indexOf(a.property_id) - propertyIds.indexOf(b.property_id);
        });

        setProperties(sortedData);
      } catch (error) {
        console.error(`Error fetching properties for section ${title}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [hasEntered, propertyIds, title]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!loading && hasEntered && properties.length === 0) return null;

  return (
    <div ref={sectionRef} className="w-full space-y-4 sm:space-y-6 scroll-mt-20">
      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-4">
          <h2 className="ty-display font-black tracking-tight text-zinc-900 truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="ty-caption text-zinc-500 font-medium truncate">{subtitle}</p>
          )}
        </div>
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="group flex items-center gap-2 ty-caption font-bold text-zinc-900 hover:text-zinc-600 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
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
