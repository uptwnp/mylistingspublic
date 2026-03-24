'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from '@/components/PropertyCard';
import { SlidersHorizontal, Map as MapIcon, LayoutGrid, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Search, ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/context/ShortlistContext';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { calculateDistance, getPropertyCoords } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { parseSeoSlug, getSeoUrl } from '@/lib/seo-utils';
import { FilterChips } from '@/components/FilterChips';


import { SORT_CATEGORIES, NEARBY_SORT_CATEGORY } from '@/lib/constants';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-50 animate-pulse">
      <div className="text-center">
        <MapIcon className="mx-auto h-8 w-8 text-zinc-200 mb-3" />
        <span className="ty-micro font-bold text-zinc-400 uppercase tracking-widest">Initialising Map...</span>
      </div>
    </div>
  ),
});

interface ExploreViewProps {
  overrideCity?: string;
  overrideType?: string;
  overrideArea?: string;
  overrideBudget?: string;
  initialProperties?: Property[];
  initialTotalCount?: number;
}

export function ExploreView({ 
  overrideCity, 
  overrideType,
  overrideArea,
  overrideBudget,
  initialProperties = [],
  initialTotalCount = 0
}: ExploreViewProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(initialProperties.length === 0);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    // Determine actual view mode based on screen width
    if (window.innerWidth < 1024) {
      setViewMode('list');
    }
    // Small delay to enable animations AFTER layout is settled
    const timer = setTimeout(() => setIsFirstMount(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const [page, setPage] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeArea = overrideArea || searchParams.get('area');

  const { 
    shortlistItems, selectedCity, isFilterModalOpen, setIsFilterModalOpen, 
    setActiveSelectionSheet, setKeywords, setMinSize, setMaxSize, 
    setSelectedHighlights, clearFilters, userLocation, setUserLocation,
    sortField, sortOrder, setSortField, setSortOrder, areaCenters, loadAreaCentersOnce,
    cacheProperties, keywords, minSize, maxSize, selectedHighlights
  } = useShortlist();

  useEffect(() => {
    loadAreaCentersOnce();
  }, [loadAreaCentersOnce]);

  // Re-derive active category from context strings:
  const allSortCategories = [...SORT_CATEGORIES, ...NEARBY_SORT_CATEGORY];
  const activeCategory = allSortCategories.find(c => c.field === sortField) || SORT_CATEGORIES[0];

  useEffect(() => {
    // If we entered 'Near me' for the first time and sort isn't updated
    if (activeArea === 'Near Me' && sortField === 'approved_on') {
      setSortField('distance');
      setSortOrder('asc');
    }
  }, [activeArea]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const itemsPerPage = 20;

  // Request location if nearby is selected
  useEffect(() => {
    if ((activeArea === 'Near Me' || sortField === 'distance') && !userLocation) {
      const cityCenters: Record<string, {lat: number, lng: number}> = {
        'Panipat': { lat: 29.3909, lng: 76.9635 },
        'Karnal': { lat: 29.6857, lng: 76.9907 }
      };

      const setFallback = () => {
        const coords = cityCenters[selectedCity] || cityCenters['Panipat'];
        setUserLocation({ ...coords, isFallback: true });
        if (activeArea === 'Near Me' && sortField !== 'distance') {
          setSortField('distance');
          setSortOrder('asc');
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
            
            if (activeArea === 'Near Me' && sortField !== 'distance') {
              setSortField('distance');
              setSortOrder('asc');
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
  }, [activeArea, userLocation, selectedCity]); // Removed sortField from here to stop the 'sorting trap'

  // Reset page when any core search filter changes
  useEffect(() => {
    setPage(0);
  }, [selectedCity, userLocation, searchParams, overrideCity, overrideType, overrideArea, overrideBudget]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const city = overrideCity || searchParams.get('city') || selectedCity;
        const area = overrideArea || searchParams.get('area');
        const budget = overrideBudget || searchParams.get('budget');
        const type = overrideType || searchParams.get('type');
        const minSize = searchParams.get('minSize');
        const maxSize = searchParams.get('maxSize');
        const highlights = searchParams.get('highlights');
        const keywords = searchParams.get('keywords');

        // Fetch data with all filters
        const { data, count } = await getProperties(
          page, 
          itemsPerPage, 
          false, 
          city === 'All' ? undefined : city,
          type || undefined,
          sortField === 'distance' ? 'distance' : sortField,
          sortOrder,
          area || undefined,
          budget || undefined,
          minSize || undefined,
          maxSize || undefined,
          highlights || undefined,
          keywords || undefined,
          userLocation?.lat,
          userLocation?.lng
        );
        
        let finalData = data ? [...data] : [];
        setTotalCount(count || 0);

        // Calculate distances locally only for card labels ("1.2 km away")
        if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
          finalData = finalData.map(p => {
            const [pLat, pLng] = getPropertyCoords(p, finalData, areaCenters);
            // Defensive distance check
            if (!isNaN(pLat) && !isNaN(pLng)) {
              return {
                ...p,
                landmark_location_distance: calculateDistance(userLocation.lat, userLocation.lng, pLat, pLng)
              };
            }
            return p;
          });
        }

        setProperties(finalData);
        cacheProperties(finalData);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
      } catch (err) {
        console.error('Explore fetch crash:', err);
        setLoading(false);
        // On critical failure, fallback to empty or cached
        if (properties.length === 0) setProperties([]);
      }
    };
    fetchData();
  }, [page, selectedCity, sortField, sortOrder, userLocation, searchParams, overrideCity, overrideType, overrideArea, overrideBudget]);

  return (
    <div className="flex min-h-screen flex-col bg-white pt-20 sm:pt-24">
      {/* Mobile-only Filter Chips (Shows directly) */}
      <div className="mb-4 sm:mb-2">
        <FilterChips 
          hasResults={properties.length > 0 || loading} 
          onToggleMap={() => setViewMode(window.innerWidth >= 1024 ? 'split' : 'map')}
        />
      </div>


      <div className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-12 flex-1 flex flex-col">

        {/* Main Content Area */}
        <div className="relative flex flex-1 gap-8 lg:gap-8">
          
          {/* List Side */}
          <div 
            id="property-list-container"
            className={cn(
              "flex flex-col",
              !isFirstMount && "transition-all duration-300",
              viewMode === 'split' ? 'w-full lg:w-[35%]' : 
              viewMode === 'list' ? 'w-full' : 'hidden'
            )}>
            {/* Section Header */}
            <div className="pt-2 sm:pt-4 pb-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="ty-title tracking-tight text-zinc-800" suppressHydrationWarning={true}>
                    {(() => {
                      const type = overrideType || searchParams.get('type');
                      const area = overrideArea || searchParams.get('area');
                      const budget = overrideBudget || searchParams.get('budget');
                      const city = overrideCity || searchParams.get('city') || selectedCity;

                      const isPlaceholder = (v: any) => !v || typeof v !== 'string' || 
                        ['all', 'any', 'all-types', 'any-type', 'any-budget', 'any budget', 'any-area', 'anywhere', 'nothing', 'undefined', 'null'].includes(v.toLowerCase());

                      const displayType = !isPlaceholder(type) ? type : 'Properties';
                      const displayArea = !isPlaceholder(area) ? area : '';
                      const displayBudget = !isPlaceholder(budget) ? budget : '';

                      // Result count logic
                      const countText = totalCount > 0 ? `${totalCount}+ ` : '0 ';
                      
                      return (
                        <>
                          <span className="font-bold">{countText}</span>
                          <span className="font-bold capitalize">{displayType}</span>
                          <span className="font-normal text-zinc-400 lowercase"> for sale </span>
                          {displayArea && (
                            <>
                              <span className="font-normal text-zinc-400 lowercase">in </span>
                              <span className="font-bold capitalize">
                                {displayArea.toLowerCase() === 'near me' || displayArea.toLowerCase() === 'near-me' ? 'Near Me' : `${displayArea}, ${city}`}
                              </span>
                            </>
                          )}
                          {!displayArea && city && city !== 'All' && (
                            <>
                              <span className="font-normal text-zinc-400 lowercase">in </span>
                              <span className="font-bold capitalize">{city}</span>
                            </>
                          )}
                          {displayBudget && displayBudget !== 'Any Budget' && (
                            <>
                              <span className="font-normal text-zinc-400 lowercase"> in </span>
                              <span className="font-bold capitalize">{displayBudget}</span>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </h1>



                  
                  {/* Additional Filter Description */}
                  {(keywords || minSize || maxSize || selectedHighlights.length > 0) && (
                    <p className="ty-caption font-medium text-zinc-500">
                      Including: {[
                        keywords && `"${keywords}"`,
                        minSize && `Min ${minSize} Sq.Yds`,
                        maxSize && `Max ${maxSize} Sq.Yds`,
                        ...selectedHighlights
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {viewMode === 'list' && (
                    <button 
                      onClick={() => setViewMode(window.innerWidth >= 1024 ? 'split' : 'map')}
                      className="hidden lg:flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 ty-caption font-bold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
                    >
                      <MapIcon className="h-3.5 w-3.5" />
                      <span>Show Map</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className={cn(
              "grid w-full gap-4 py-4 sm:py-6 items-start content-start",
              viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            )}>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))
              ) : properties.length > 0 ? (
                properties.map((property) => (
                  <PropertyCard 
                    key={property.property_id} 
                    property={property} 
                    isExpanded={selectedProperty?.property_id === property.property_id}
                    onToggle={() => setSelectedProperty(selectedProperty?.property_id === property.property_id ? null : property)}
                    isNearMeFallback={userLocation?.isFallback}
                    showDistance={activeArea === 'Near Me' || sortField === 'distance'}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-50 text-zinc-300">
                    <Search className="h-10 w-10" />
                  </div>
                  <h3 className="mb-2 ty-title font-bold text-zinc-900">No properties found</h3>
                  <p className="mb-8 max-w-[280px] ty-body text-zinc-500">
                    We couldn't find any properties matching your search.
                  </p>
                  <button 
                    onClick={() => {
                      clearFilters();
                      // Redirect to standard explore (default city) with no filters
                      const url = getSeoUrl(selectedCity, 'Any Type', 'anywhere', 'Any Budget');
                      if (url) {
                        router.push(url);
                      } else {
                        router.push('/explore');
                      }
                    }} 
                    className="rounded-full bg-zinc-900 px-8 py-3 ty-caption font-bold text-white transition-all hover:bg-black active:scale-[0.98]"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && properties.length > 0 && totalCount > itemsPerPage && (
              <div className="mt-8 border-t border-zinc-100 bg-white py-6 mb-20 lg:mb-0">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 ty-caption font-bold text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Prev</span>
                  </button>
                  <span className="ty-label text-zinc-400">Page {page + 1}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * itemsPerPage >= totalCount}
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
            "sticky top-20 h-[calc(100vh-80px)]",
            !isFirstMount && "transition-all duration-300",
            viewMode === 'split' ? 'hidden lg:flex lg:flex-1' : 
            viewMode === 'map' ? 'w-full flex' : 'hidden',
            "items-center justify-center pt-2 lg:pt-4 pb-5"
          )}>
            <div className="relative h-full w-full overflow-hidden sm:rounded-3xl border border-zinc-200 shadow-sm group">
              <div className="absolute top-4 right-4 z-40 flex gap-2">
                {viewMode === 'split' && (
                  <button onClick={() => setViewMode('map')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-xl backdrop-blur-md hover:bg-white hover:text-zinc-900"><Maximize2 className="h-5 w-5" /></button>
                )}
                {viewMode === 'map' && (
                  <button onClick={() => setViewMode('split')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-xl backdrop-blur-md hover:bg-white hover:text-zinc-900"><Minimize2 className="h-5 w-5" /></button>
                )}
                <button onClick={() => setViewMode('list')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-xl backdrop-blur-md hover:bg-white hover:text-zinc-900"><X className="h-5 w-5" /></button>
              </div>
              <MapComponent 
                properties={properties} 
                selectedProperty={selectedProperty}
                onSelectProperty={setSelectedProperty}
                userLocation={userLocation}
                showDistance={activeArea === 'Near Me' || sortField === 'distance'}
              />
            </div>
          </div>
        </div>
      </div>

      {(properties.length > 0 || viewMode === 'map') && (
        <button 
          onClick={() => setViewMode(viewMode === 'list' ? (window.innerWidth >= 1024 ? 'split' : 'map') : 'list')}
          className={cn(
            "fixed bottom-8 sm:bottom-12 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-all hover:scale-105",
            viewMode === 'split' && "lg:hidden"
          )}
        >
          {viewMode === 'map' ? <><LayoutGrid className="h-4 w-4" /><span>Show List</span></> : <><MapIcon className="h-4 w-4" /><span>Show Map</span></>}
        </button>
      )}
    </div>
  );
}
