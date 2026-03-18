'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from '@/components/PropertyCard';
import { Loader2, SlidersHorizontal, Map as MapIcon, LayoutGrid, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, ArrowUpDown, Clock, Tag, Ruler, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDiscussion } from '@/context/DiscussionContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { calculateDistance, getPropertyCoords } from '@/lib/utils';
import { Navigation } from 'lucide-react';

export const runtime = 'edge';

const SORT_OPTIONS = [
  { field: 'approved_on', order: 'desc' as const, label: 'Latest on Top', icon: Clock },
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

function ExploreContent() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('list');

  useEffect(() => {
    // Determine initial view mode based on screen width
    if (window.innerWidth >= 1024) {
      setViewMode('split');
    } else {
      setViewMode('list');
    }
  }, []);

  const [page, setPage] = useState(0);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const itemsPerPage = 20;
  const { 
    cartItems, selectedCity, isFilterModalOpen, setIsFilterModalOpen, 
    setActiveSelectionSheet, setKeywords, setMinSize, setMaxSize, 
    setSelectedHighlights, clearFilters, userLocation, setUserLocation
  } = useDiscussion();
  const searchParams = useSearchParams();
  const areaParam = searchParams.get('area');

  // Request location if nearby is selected
  useEffect(() => {
    if ((areaParam === 'Near Me' || sortOption.field === 'distance') && !userLocation) {
      const cityCenters: Record<string, {lat: number, lng: number}> = {
        'Panipat': { lat: 29.3909, lng: 76.9635 },
        'Karnal': { lat: 29.6857, lng: 76.9907 }
      };

      const setFallback = () => {
        const coords = cityCenters[selectedCity] || cityCenters['Panipat'];
        setUserLocation({ ...coords, isFallback: true });
        if (areaParam === 'Near Me' && sortOption.field !== 'distance') {
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
            
            if (areaParam === 'Near Me' && sortOption.field !== 'distance') {
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
      
      const city = searchParams.get('city') || selectedCity;
      const area = searchParams.get('area');
      const budget = searchParams.get('budget');
      const type = searchParams.get('type');
      const minSize = searchParams.get('minSize');
      const maxSize = searchParams.get('maxSize');
      const highlights = searchParams.get('highlights');
      const keywords = searchParams.get('keywords');

      // Fetch data with all filters
      const data = await getProperties(
        page, 
        itemsPerPage, 
        false, 
        city === 'All' ? undefined : city,
        type || undefined,
        sortOption.field === 'distance' ? 'approved_on' : sortOption.field,
        sortOption.order,
        area || undefined,
        budget || undefined,
        minSize || undefined,
        maxSize || undefined,
        highlights || undefined,
        keywords || undefined
      );
      
      let finalData = [...(data as Property[])];

      // Client-side distance sorting and calculation if needed
      if ((sortOption.field === 'distance' || areaParam === 'Near Me')) {
        if (userLocation) {
          finalData.sort((a, b) => {
            const [latA, lngA] = getPropertyCoords(a);
            const [latB, lngB] = getPropertyCoords(b);
            
            const distA = calculateDistance(userLocation.lat, userLocation.lng, latA, lngA);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, latB, lngB);
            
            return sortOption.order === 'asc' ? distA - distB : distB - distA;
          });

          // Add real calculated distance property to cards
          finalData = finalData.map(p => {
            const [pLat, pLng] = getPropertyCoords(p);
            return {
              ...p,
              landmark_location_distance: calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                pLat,
                pLng
              )
            };
          });
        } else {
          // If we're in nearby mode but don't have user location yet, 
          // clear the landmark distance so we don't show legacy/wrong DB values
          finalData = finalData.map(p => ({
            ...p,
            landmark_location_distance: undefined
          }));
        }
      }

      setProperties(finalData);
      setLoading(false);
      
      // Scroll window to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchData();
  }, [page, selectedCity, sortOption, userLocation, searchParams]);

  return (
    <div className="flex min-h-screen flex-col bg-white pt-24 sm:pt-28">
      <div className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-12 flex-1 flex flex-col">
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
            <div className="pt-6 sm:pt-8 pb-2">
              {/* Mobile-only Filter Summary Chips */}
              <div className="flex sm:hidden mb-4 items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button 
                  onClick={() => setActiveSelectionSheet('area')}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-zinc-50 border border-zinc-100 px-4 py-2 shadow-sm active:scale-95 transition-all"
                >
                  <span className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest">{searchParams.get('area') || "Any Area"}</span>
                  <div className="h-2.5 w-px bg-zinc-200" />
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                <button 
                  onClick={() => setActiveSelectionSheet('budget')}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-zinc-50 border border-zinc-100 px-4 py-2 shadow-sm active:scale-95 transition-all"
                >
                  <span className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest">{searchParams.get('budget') || "Any Budget"}</span>
                  <div className="h-2.5 w-px bg-zinc-200" />
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                <button 
                  onClick={() => setActiveSelectionSheet('type')}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-zinc-50 border border-zinc-100 px-4 py-2 shadow-sm active:scale-95 transition-all"
                >
                  <span className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest">{searchParams.get('type') || "Any Type"}</span>
                  <div className="h-2.5 w-px bg-zinc-200" />
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="relative flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md active:scale-90"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={3} />
                  {(() => {
                    const count = [
                      searchParams.get('keywords'),
                      searchParams.get('minSize'),
                      searchParams.get('maxSize'),
                      searchParams.get('highlights')
                    ].filter(Boolean).length;
                    
                    return count > 0 ? (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border border-white">
                        {count}
                      </span>
                    ) : null;
                  })()}
                </button>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="ty-title font-bold tracking-tight text-zinc-900">Explore Properties</h1>
                  <div className="flex items-center gap-2">
                    <span className="ty-micro font-bold text-zinc-400 leading-none">
                      {properties.length} Results Found
                    </span>
                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span className="ty-micro font-medium text-zinc-400 leading-none">
                      {selectedCity || "All Localities"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {viewMode === 'list' && (
                    <button 
                      onClick={() => setViewMode(window.innerWidth >= 1024 ? 'split' : 'map')}
                      className="hidden lg:flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 ty-caption font-bold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95"
                    >
                      <MapIcon className="h-3.5 w-3.5" />
                      <span>Show Map</span>
                    </button>
                  )}

                  {/* Sort By Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 ty-caption font-bold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95"
                    >
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      <span>{sortOption.label}</span>
                    </div>
                    <ChevronLeft className="h-3 w-3 rotate-270" />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40 bg-black/5 sm:bg-transparent" 
                          onClick={() => setIsSortOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 left-0 sm:left-auto top-full z-50 mt-2 w-auto sm:w-56 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/50"
                        >
                          {[...SORT_OPTIONS, ...(areaParam === 'Near Me' || userLocation ? NEARBY_SORT_OPTIONS : [])].map((option) => (
                            <button
                              key={`${option.label}-${option.order}`}
                              onClick={() => {
                                setSortOption(option);
                                setIsSortOpen(false);
                                setPage(0);
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ty-caption font-bold transition-all",
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
          </div>
            
            <div className={cn(
              "grid w-full gap-4 py-4 sm:py-6 items-start",
              viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            )}>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))
              ) : properties.length > 0 ? (
                properties.map((property) => (
                  <div key={property.property_id}>
                    <PropertyCard 
                      property={property} 
                      isExpanded={selectedProperty?.property_id === property.property_id}
                      onToggle={() => setSelectedProperty(selectedProperty?.property_id === property.property_id ? null : property)}
                      isNearMeFallback={userLocation?.isFallback}
                      showDistance={areaParam === 'Near Me' || sortOption.field === 'distance'}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-50 text-zinc-300">
                    <Search className="h-10 w-10" />
                  </div>
                  <h3 className="mb-2 ty-title font-bold text-zinc-900">No properties found</h3>
                  <p className="mb-8 max-w-[280px] ty-body text-zinc-500">
                    We couldn't find any properties matching your current filters. Try adjusting them.
                  </p>
                  
                  {(() => {
                    const additionalParams = ['minSize', 'maxSize', 'highlights', 'keywords'];
                    const hasAdditional = additionalParams.some(k => {
                      const v = searchParams.get(k);
                      return v !== null && v !== '' && v !== 'undefined';
                    });

                    return (
                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        {hasAdditional && (
                          <button 
                            onClick={() => {
                              setKeywords('');
                              setMinSize('');
                              setMaxSize('');
                              setSelectedHighlights([]);
                            }}
                            className="rounded-full bg-zinc-900 px-8 py-3 ty-caption font-bold text-white transition-all hover:bg-black active:scale-95"
                          >
                            Clear additional filters
                          </button>
                        )}
                        <button 
                          onClick={clearFilters}
                          className={cn(
                            "rounded-full px-8 py-3 ty-caption font-bold transition-all active:scale-95",
                            hasAdditional 
                              ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                              : "bg-zinc-900 text-white hover:bg-black"
                          )}
                        >
                          Clear all filters
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && properties.length > 0 && (
              <div className="mt-auto border-t border-zinc-100 bg-white py-6 mb-20 lg:mb-0">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 ty-caption font-bold text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Prev</span>
                  </button>
                  
                  <span className="ty-label text-zinc-400">
                    Page {page + 1}
                  </span>

                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={properties.length < itemsPerPage}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 ty-caption font-bold text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent"
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
            <div className="relative h-full w-full overflow-hidden sm:rounded-3xl border border-zinc-200 shadow-sm group">
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
                userLocation={userLocation}
                showDistance={areaParam === 'Near Me' || sortOption.field === 'distance'}
              />

            </div>
          </div>
        </div>
      </div>

      {/* View Toggle Button */}
      <button 
        onClick={() => {
          if (viewMode === 'list') {
            setViewMode(window.innerWidth >= 1024 ? 'split' : 'map');
          } else {
            setViewMode('list');
          }
        }}
        className={cn(
          "fixed bottom-8 sm:bottom-12 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95",
          viewMode === 'split' && "lg:hidden"
        )}
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

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
