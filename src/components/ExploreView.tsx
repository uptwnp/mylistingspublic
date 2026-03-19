'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { PropertyCard, PropertyCardSkeleton } from '@/components/PropertyCard';
import { Loader2, SlidersHorizontal, Map as MapIcon, LayoutGrid, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Search, ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/context/ShortlistContext';
import { useSearchParams } from 'next/navigation';
import { calculateDistance, getPropertyCoords } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

import { SORT_CATEGORIES, NEARBY_SORT_CATEGORY } from '@/lib/constants';

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

interface ExploreViewProps {
  overrideCity?: string;
  overrideType?: string;
  overrideArea?: string;
  overrideBudget?: string;
}

export function ExploreView({ 
  overrideCity, 
  overrideType,
  overrideArea,
  overrideBudget
}: ExploreViewProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
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
  const searchParams = useSearchParams();
  const areaParam = searchParams.get('area');

  const { 
    shortlistItems, selectedCity, isFilterModalOpen, setIsFilterModalOpen, 
    setActiveSelectionSheet, setKeywords, setMinSize, setMaxSize, 
    setSelectedHighlights, clearFilters, userLocation, setUserLocation,
    sortField, sortOrder, setSortField, setSortOrder
  } = useShortlist();

  // Re-derive active category from context strings:
  const allSortCategories = [...SORT_CATEGORIES, ...NEARBY_SORT_CATEGORY];
  const activeCategory = allSortCategories.find(c => c.field === sortField) || SORT_CATEGORIES[0];

  useEffect(() => {
    // If we entered 'Near me' for the first time and sort isn't updated
    if (areaParam === 'Near Me' && sortField === 'approved_on') {
      setSortField('distance');
      setSortOrder('asc');
    }
  }, [areaParam]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const itemsPerPage = 1000;

  // Request location if nearby is selected
  useEffect(() => {
    if ((areaParam === 'Near Me' || sortField === 'distance') && !userLocation) {
      const cityCenters: Record<string, {lat: number, lng: number}> = {
        'Panipat': { lat: 29.3909, lng: 76.9635 },
        'Karnal': { lat: 29.6857, lng: 76.9907 }
      };

      const setFallback = () => {
        const coords = cityCenters[selectedCity] || cityCenters['Panipat'];
        setUserLocation({ ...coords, isFallback: true });
        if (areaParam === 'Near Me' && sortField !== 'distance') {
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
            
            if (areaParam === 'Near Me' && sortField !== 'distance') {
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
  }, [areaParam, sortField, userLocation, selectedCity]);

  useEffect(() => {
    const fetchData = async () => {
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
        sortField === 'distance' ? 'approved_on' : sortField,
        sortOrder,
        area || undefined,
        budget || undefined,
        minSize || undefined,
        maxSize || undefined,
        highlights || undefined,
        keywords || undefined
      );
      
      let finalData = [...data];
      setTotalCount(count);

      // Client-side distance sorting and calculation if needed
      if ((sortField === 'distance' || areaParam === 'Near Me')) {
        if (userLocation) {
          finalData.sort((a, b) => {
            const [latA, lngA] = getPropertyCoords(a, finalData);
            const [latB, lngB] = getPropertyCoords(b, finalData);
            
            const distA = calculateDistance(userLocation.lat, userLocation.lng, latA, lngA);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, latB, lngB);
            
            return sortOrder === 'asc' ? distA - distB : distB - distA;
          });

          // Add real calculated distance property to cards
          finalData = finalData.map(p => {
            const [pLat, pLng] = getPropertyCoords(p, finalData);
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
          finalData = finalData.map(p => ({
            ...p,
            landmark_location_distance: undefined
          }));
        }
      }

      setProperties(finalData);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchData();
  }, [page, selectedCity, sortField, sortOrder, userLocation, searchParams, overrideCity, overrideType, overrideArea, overrideBudget]);

  return (
    <div className="flex min-h-screen flex-col bg-white pt-20 sm:pt-24">
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
            <div className="pt-2 sm:pt-4 pb-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="ty-title font-bold tracking-tight text-zinc-900 capitalize">
                    {(() => {
                      const type = overrideType || searchParams.get('type');
                      const area = overrideArea || searchParams.get('area');
                      const budget = overrideBudget || searchParams.get('budget');
                      const city = overrideCity || searchParams.get('city') || selectedCity;

                      const displayType = type && type !== 'Any Type' && type !== 'All' ? type : '';
                      const displayArea = area && area !== 'All' && area !== 'Any' ? area : '';
                      
                      let titleParts = [];
                      if (displayType) titleParts.push(displayType);
                      else titleParts.push("Properties");

                      if (displayArea) {
                        if (displayArea.toLowerCase() === 'near me') titleParts.push("Near Me");
                        else titleParts.push(`in ${displayArea}`);
                      } else if (city && city !== 'All') {
                        titleParts.push(`in ${city}`);
                      }

                      if (budget && budget !== 'Any Budget') {
                        titleParts.push(`(${budget})`);
                      }

                      return titleParts.join(' ');
                    })()}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="ty-micro font-bold text-zinc-400 leading-none">
                      {totalCount} Results Found
                    </span>
                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span className="ty-micro font-medium text-zinc-400 leading-none">
                      {overrideCity || selectedCity || "All Localities"}
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
                </div>
              </div>
            </div>
            
            <div className={cn(
              "grid w-full gap-4 py-4 sm:py-6 items-start flex-1",
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
                      showDistance={areaParam === 'Near Me' || sortField === 'distance'}
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
                    We couldn't find any properties matching your search.
                  </p>
                  <button onClick={clearFilters} className="rounded-full bg-zinc-900 px-8 py-3 ty-caption font-bold text-white transition-all hover:bg-black active:scale-95">
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
            "sticky top-20 h-[calc(100vh-80px)] transition-all duration-300",
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
                showDistance={areaParam === 'Near Me' || sortField === 'distance'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <button 
        onClick={() => setViewMode(viewMode === 'list' ? (window.innerWidth >= 1024 ? 'split' : 'map') : 'list')}
        className={cn(
          "fixed bottom-8 sm:bottom-12 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-all hover:scale-105",
          viewMode === 'split' && "lg:hidden"
        )}
      >
        {viewMode === 'map' ? <><LayoutGrid className="h-4 w-4" /><span>Show List</span></> : <><MapIcon className="h-4 w-4" /><span>Show Map</span></>}
      </button>
    </div>
  );
}
