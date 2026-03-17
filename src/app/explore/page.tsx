'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from '@/components/PropertyCard';
import { Loader2, SlidersHorizontal, Map as MapIcon, LayoutGrid, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, ArrowUpDown, Clock, Tag, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDiscussion } from '@/context/DiscussionContext';
import { useSearchParams } from 'next/navigation';
import { calculateDistance } from '@/lib/utils';
import { Navigation } from 'lucide-react';

const SORT_OPTIONS = [
  { field: 'approved_on', order: 'desc' as const, label: 'Newest First', icon: Clock },
  { field: 'price_min', order: 'asc' as const, label: 'Price: Low to High', icon: Tag },
  { field: 'price_min', order: 'desc' as const, label: 'Price: High to Low', icon: Tag },
  { field: 'size_min', order: 'desc' as const, label: 'Size: Large to Small', icon: Ruler },
];

const NEARBY_SORT_OPTIONS = [
  { field: 'distance', order: 'asc' as const, label: 'Nearby First', icon: Navigation },
];

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
  const [page, setPage] = useState(0);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, isFallback?: boolean} | null>(null);
  const itemsPerPage = 20;
  const { setIsFilterModalOpen, selectedCity } = useDiscussion();
  const searchParams = useSearchParams();
  const areaParam = searchParams.get('area');

  // Request location if nearby is selected
  useEffect(() => {
    if ((areaParam === 'Nearby' || sortOption.field === 'distance') && !userLocation) {
      const cityCenters: Record<string, {lat: number, lng: number}> = {
        'Panipat': { lat: 29.3909, lng: 76.9635 },
        'Karnal': { lat: 29.6857, lng: 76.9907 }
      };

      const setFallback = () => {
        const coords = cityCenters[selectedCity] || cityCenters['Panipat'];
        setUserLocation({ ...coords, isFallback: true });
        if (areaParam === 'Nearby' && sortOption.field !== 'distance') {
          setSortOption(NEARBY_SORT_OPTIONS[0]);
        }
      };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              isFallback: false
            });
            
            if (areaParam === 'Nearby' && sortOption.field !== 'distance') {
              setSortOption(NEARBY_SORT_OPTIONS[0]);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setFallback();
          },
          { timeout: 5000 }
        );
      } else {
        setFallback();
      }
    }
  }, [areaParam, sortOption.field, userLocation, selectedCity]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch data with existing filters
      const data = await getProperties(
        page, 
        itemsPerPage, 
        false, 
        selectedCity === 'All' ? undefined : selectedCity,
        undefined,
        sortOption.field === 'distance' ? 'approved_on' : sortOption.field,
        sortOption.order
      );
      
      let finalData = [...(data as Property[])];

      // Client-side distance sorting if needed
      if ((sortOption.field === 'distance' || areaParam === 'Nearby') && userLocation) {
        finalData.sort((a, b) => {
          const latA = a.latitude || 29.3909; // Default to Panipat center
          const lngA = a.longitude || 76.9635;
          const latB = b.latitude || 29.3909;
          const lngB = b.longitude || 76.9635;
          
          const distA = calculateDistance(userLocation.lat, userLocation.lng, latA, lngA);
          const distB = calculateDistance(userLocation.lat, userLocation.lng, latB, lngB);
          
          return sortOption.order === 'asc' ? distA - distB : distB - distA;
        });

        // Add distance property to cards if we have location
        finalData = finalData.map(p => ({
          ...p,
          landmark_location_distance: calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            p.latitude || 29.3909, 
            p.longitude || 76.9635
          )
        }));
      }

      setProperties(finalData);
      setLoading(false);
      
      // Scroll window to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchData();
  }, [page, selectedCity, sortOption, userLocation, areaParam]);

  return (
    <div className="flex min-h-screen flex-col bg-white pt-20">
      <div className="mx-auto max-w-[1440px] w-full px-6 lg:px-12 flex-1 flex flex-col">
        {/* Main Content Area */}
        <div className="relative flex flex-1 gap-8 lg:gap-8">
          
          {/* List Side */}
          <div 
            id="property-list-container"
            className={cn(
              "flex flex-col transition-all duration-300",
              viewMode === 'split' ? 'w-full lg:w-[35%]' : 
              viewMode === 'list' ? 'w-full' : 'hidden'
            )}>
            {/* Section Header */}
            <div className="pt-8 pb-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-black tracking-tight text-zinc-900">Explore Properties</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                      {properties.length} Results Found
                    </span>
                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
                      {selectedCity || "All Localities"}
                    </span>
                  </div>
                </div>

                {/* Sort By Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Sort by: {sortOption.label}</span>
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsSortOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/50"
                        >
                          {[...SORT_OPTIONS, ...(areaParam === 'Nearby' || userLocation ? NEARBY_SORT_OPTIONS : [])].map((option) => (
                            <button
                              key={`${option.label}-${option.order}`}
                              onClick={() => {
                                setSortOption(option);
                                setIsSortOpen(false);
                                setPage(0);
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all",
                                sortOption.label === option.label 
                                  ? "bg-zinc-900 text-white" 
                                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                              )}
                            >
                              <option.icon className={cn("h-4 w-4", sortOption.label === option.label ? "text-white/70" : "text-zinc-400")} />
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "grid w-full gap-4 py-6 items-start",
              viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            )}>
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
                      isNearbyFallback={userLocation?.isFallback}
                      showDistance={areaParam === 'Nearby' || sortOption.field === 'distance'}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && properties.length > 0 && (
              <div className="mt-auto border-t border-zinc-100 bg-white py-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Page {page + 1}
                  </span>

                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={properties.length < itemsPerPage}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Map Side */}
          <div className={cn(
            "sticky top-20 h-[calc(100vh-80px)] transition-all duration-300",
            viewMode === 'split' ? 'hidden lg:flex lg:flex-1' : 
            viewMode === 'map' ? 'w-full flex' : 'hidden',
            "items-center justify-center pt-8 pb-5"
          )}>
            <div className="relative h-full w-full overflow-hidden rounded-3xl border border-zinc-200 shadow-sm group">
              {/* Overlay Buttons */}
              <div className="absolute top-4 right-4 z-40 flex gap-2">
                {viewMode === 'split' && (
                  <button 
                    onClick={() => setViewMode('map')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:text-zinc-900 active:scale-95"
                    title="Expand Map"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </button>
                )}
                {viewMode === 'map' && (
                  <button 
                    onClick={() => setViewMode('split')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:text-zinc-900 active:scale-95"
                    title="Restore View"
                  >
                    <Minimize2 className="h-5 w-5" />
                  </button>
                )}
                <button 
                  onClick={() => setViewMode('list')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:text-zinc-900 active:scale-95"
                  title="Close Map"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <MapComponent 
                properties={properties} 
                selectedProperty={selectedProperty}
                onSelectProperty={setSelectedProperty}
              />
            </div>
          </div>
        </div>
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
  );
}
