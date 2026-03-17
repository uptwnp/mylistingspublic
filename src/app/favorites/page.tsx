'use client';
export const runtime = 'edge';

import { useDiscussion } from '@/context/DiscussionContext';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PropertyCard } from '@/components/PropertyCard';

export default function FavoritesPage() {
  const { savedIds } = useDiscussion();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (savedIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      
      const data = await getProperties(0, 100, false);
      const filtered = (data as Property[]).filter(p => savedIds.includes(p.property_id));
      setProperties(filtered);
      setLoading(false);
    };

    fetchSavedProperties();
  }, [savedIds]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/" className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back to Discover
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">
            Saved Properties
          </h1>
          <p className="mt-2 text-zinc-500">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} bookmarked for later.
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="mb-6 rounded-full bg-rose-50 p-6">
              <Heart className="h-12 w-12 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold">No saved properties</h2>
            <p className="mt-2 text-zinc-500">Tap the heart icon on any property to save it here.</p>
            <Link href="/" className="mt-8 rounded-full bg-black px-8 py-3 text-sm font-bold uppercase tracking-widest text-white">
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
