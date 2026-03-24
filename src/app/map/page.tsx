'use client';


import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { ArrowLeft, Layers, Locate, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-2 text-sm text-zinc-500 font-bold uppercase tracking-widest">Initializing Map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getProperties(0, 20, false);
      setProperties(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="relative h-screen w-full bg-zinc-100 overflow-hidden">
      {/* Map Control Bar */}
      <div className="absolute top-20 left-4 right-4 z-50 flex items-center justify-between sm:left-8 sm:right-8">
        <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl transition-transform hover:scale-110 active:scale-[0.98]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        
        <div className="flex gap-2">
          <button className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4 font-bold shadow-xl transition-transform hover:scale-105 active:scale-[0.98]">
            <Layers className="h-5 w-5" />
            <span className="hidden sm:inline">Standard</span>
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-xl transition-transform hover:scale-110 active:scale-[0.98]">
            <Locate className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Real Interactive Map Component */}
      <div className="absolute inset-0 z-0">
        <MapComponent 
          properties={properties} 
          selectedProperty={selectedProperty}
          onSelectProperty={setSelectedProperty}
        />
      </div>

      {/* Filters Overlay - Desktop Only */}
      <div className="absolute bottom-10 left-10 hidden lg:block z-50">
        <div className="rounded-3xl bg-white/90 p-6 backdrop-blur-xl shadow-2xl border border-white/20">
          <h2 className="text-xl font-black">Map Explorer</h2>
          <p className="text-xs text-zinc-500 font-medium">Showing {properties.length} curated listings in {selectedProperty?.city || 'Panipat'}</p>
          <div className="mt-4 flex flex-col gap-3">
            {['Luxury Villas', 'Commercial Mob', 'Plots'].map(tag => (
              <label key={tag} className="flex items-center gap-3 text-sm font-bold">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg accent-black" />
                {tag}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
