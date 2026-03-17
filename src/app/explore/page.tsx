'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from '@/components/PropertyCard';
import { Loader2, SlidersHorizontal, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
      </div>
    </div>
  ),
});

export default function ExplorePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProperties(0, 50, false);
      setProperties(data as Property[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white pt-20">
      {/* Header / Filter Bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-tight text-zinc-900">Explore Properties</h1>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
            {properties.length} Results
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          <div className="ml-2 hidden h-8 w-px bg-zinc-200 sm:block" />

          {/* View Toggles (Desktop) */}
          <div className="hidden items-center gap-1 rounded-2xl bg-zinc-100 p-1 lg:flex">
            <button 
              onClick={() => setViewMode('split')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${viewMode === 'split' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
            >
              Split View
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
            >
              List Only
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
            >
              Map Only
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        
        {/* List Side */}
        <div className={`flex flex-col overflow-y-auto transition-all duration-300 border-r border-zinc-100 ${
          viewMode === 'split' ? 'w-full lg:w-[35%]' : 
          viewMode === 'list' ? 'w-full' : 'hidden'
        }`}>
          <div className={`grid w-full gap-4 p-4 lg:p-6 items-start ${
            viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
          }`}>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))
            ) : (
              properties.map((property) => (
                <div key={property.property_id}>
                  <PropertyCard 
                    property={property} 
                    isExpanded={selectedProperty?.property_id === property.property_id}
                    onToggle={() => setSelectedProperty(selectedProperty?.property_id === property.property_id ? null : property)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Side */}
        <div className={`relative flex-1 bg-zinc-100 transition-all duration-300 ${
          viewMode === 'split' ? 'hidden lg:block' : 
          viewMode === 'map' ? 'w-full' : 'hidden'
        }`}>
          <MapComponent 
            properties={properties} 
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
          />
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-transform active:scale-95 lg:hidden"
        >
          {viewMode === 'map' ? (
            <>
              <LayoutGrid className="h-4 w-4" />
              <span>Show List</span>
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4" />
              <span>Show Map</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
