'use client';


export const runtime = 'edge';

import { useShortlist } from '@/context/ShortlistContext';
import { Property } from '@/types';
import { getProperties, getPropertiesByIds } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PropertyCard } from '@/components/PropertyCard';

export default function FavoritesPage() {
  const { savedIds, isInitialized } = useShortlist();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchSavedProperties = async () => {
      if (savedIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      
      try {
        const data = await getPropertiesByIds(savedIds.slice(0, 20));
        setProperties(data as Property[]);
      } catch (err) {
        console.error('Failed to fetch favorite properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, [savedIds, isInitialized]);

  if (!isInitialized || (loading && savedIds.length > 0)) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-12 animate-pulse">
            <div className="h-4 w-32 bg-zinc-200 rounded-full mb-4" />
            <div className="h-12 w-64 bg-zinc-200 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white rounded-3xl animate-pulse p-4 space-y-4 shadow-sm border border-zinc-100">
                 <div className="h-2/3 w-full bg-zinc-50 rounded-2xl" />
                 <div className="h-4 w-3/4 bg-zinc-50 rounded-full" />
                 <div className="h-6 w-1/2 bg-zinc-50 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-12">
          <Link href="/explore" className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back to Discover
          </Link>
          <h1 className="ty-display font-black tracking-tight text-zinc-900">
            Saved Properties
          </h1>
          <p className="mt-2 ty-body text-zinc-500">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} bookmarked for later.
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="mb-6 rounded-full bg-rose-50 p-6">
              <Heart className="h-12 w-12 text-rose-500" />
            </div>
            <h2 className="ty-title font-bold">No saved properties</h2>
            <p className="mt-2 ty-body text-zinc-500">Tap the heart icon on any property to save it here.</p>
            <Link href="/explore" className="mt-8 rounded-full bg-black px-8 py-3 ty-caption font-bold uppercase tracking-widest text-white">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.property_id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
