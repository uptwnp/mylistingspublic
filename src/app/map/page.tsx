'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { MapPin, ArrowLeft, Layers, Navigation, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

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
      const data = await getProperties(0, 50, false);
      setProperties(data as Property[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="relative h-screen w-full bg-zinc-100 overflow-hidden">
      {/* Map Control Bar */}
      <div className="absolute top-20 left-4 right-4 z-50 flex items-center justify-between sm:left-8 sm:right-8">
        <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl transition-transform hover:scale-110 active:scale-95">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        
        <div className="flex gap-2">
          <button className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4 font-bold shadow-xl transition-transform hover:scale-105 active:scale-95">
            <Layers className="h-5 w-5" />
            <span className="hidden sm:inline">Standard</span>
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-xl transition-transform hover:scale-110 active:scale-95">
            <Navigation className="h-5 w-5" />
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

      {/* Sticky Detail Card */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute bottom-10 left-4 right-4 z-[100] mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex gap-4 p-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl">
                <img 
                  src={selectedProperty.image_urls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
                  className="h-full w-full object-cover"
                  alt=""
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {selectedProperty.area}
                  </span>
                  <button onClick={() => setSelectedProperty(null)} className="text-zinc-400 hover:text-black text-xl font-bold">×</button>
                </div>
                <h3 className="font-bold">{selectedProperty.type}</h3>
                <p className="text-sm font-black text-zinc-900">{formatPrice(selectedProperty.price_min)}</p>
                <div className="mt-3 flex gap-2">
                  <Link 
                    href={`/property/${selectedProperty.property_id}`}
                    className="flex-1 rounded-xl bg-black py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                  >
                    Details
                  </Link>
                  <Link 
                    href="/discussion-cart" 
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-zinc-50"
                  >
                    Discuss
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
