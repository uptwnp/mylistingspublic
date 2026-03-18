'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Wallet, Home as HomeIcon, Trees, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getAreas } from '@/lib/supabase';
import { useDiscussion } from '@/context/DiscussionContext';
import { BUDGET_OPTIONS } from './HeaderSearch';


const PROPERTY_TYPES = [
  "Residential Plot", "Residential House", "Floor", "Flat", "Shop", "Office", "Villa", "Commercial Built-up", "Big Commercial", "Industrial Land", "Industrial Built-up", "Agriculture Land", "Factory", "Godown"
];

export function HomeSearch() {
  const router = useRouter();
  const { 
    selectedCity, 
    query, setQuery, 
    budget, setBudget, 
    propertyType, setPropertyType,
    setUserLocation
  } = useDiscussion();
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [allAreas, setAllAreas] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadAreas() {
      const areas = await getAreas(selectedCity);
      setAllAreas(areas);
    }
    loadAreas();
  }, [selectedCity]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveSegment(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (overrides?: { area?: string; budget?: { label: string; value: number }; type?: string }) => {
    const params = new URLSearchParams();
    
    const finalArea = overrides?.area ?? query;
    const finalBudget = overrides?.budget ?? budget;
    const finalType = overrides?.type ?? propertyType;

    if (finalArea) params.set('area', finalArea);
    if (finalBudget.value > 0) params.set('budget', finalBudget.label);
    if (finalType !== "Any Type") params.set('type', finalType);
    
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="mt-12 w-full max-w-4xl px-4" ref={searchRef}>
      <div className={cn(
        "relative flex w-full items-center rounded-full border border-zinc-200 bg-white transition-all duration-300 shadow-xl",
        activeSegment ? "bg-zinc-50 border-zinc-300" : "hover:border-zinc-300"
      )}>
        
        {/* Location Section */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActiveSegment('location'); }}
          className={cn(
            "relative flex-[1.4] flex flex-col items-start px-8 py-4 rounded-full transition-all text-left cursor-pointer group",
            activeSegment === 'location' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
          )}
        >
          <span className="ty-label text-zinc-900 mb-0.5">Location</span>
          <div className="flex items-center w-full min-w-0">
            <input 
              type="text"
              placeholder="Search destinations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setActiveSegment('location')}
              className="w-full bg-transparent ty-caption font-semibold text-zinc-500 outline-none placeholder:text-zinc-400 min-w-0"
            />
            {activeSegment === 'location' && query && (
              <button 
                onClick={(e) => { e.stopPropagation(); setQuery(''); }}
                className="ml-2 p-1 rounded-full hover:bg-zinc-200 transition-colors shrink-0"
              >
                <X className="h-3 w-3 text-zinc-400" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {activeSegment === 'location' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute left-0 top-[calc(100%+12px)] z-50 w-[400px] rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
              >
                  <h3 className="mb-5 px-4 ty-label text-zinc-400">
                    {query ? 'Available Areas' : 'Popular Areas'}
                  </h3>
                  <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {(() => {
                      const isNearMe = query.toLowerCase() === 'near me';
                      const isExactMatch = allAreas.some(a => a.toLowerCase() === query.toLowerCase());
                      const showNearby = !query || isExactMatch || 'near me'.includes(query.toLowerCase());
                      const showDefault = !query || isExactMatch || isNearMe;
                      
                      const filtered = allAreas
                        .filter(a => a.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 10);

                      const areas = showDefault ? allAreas.slice(0, 10) : filtered;
                      const displayAreas = showNearby ? ['Near Me', ...areas] : areas;

                      return displayAreas.map((s) => (
                        <button 
                          key={s} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (s === 'Near Me' && 'geolocation' in navigator) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  setUserLocation({
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                    isFallback: false
                                  });
                                },
                                (error) => {
                                  console.error("Error getting location:", error);
                                  // Fallback will be handled in ExploreContent
                                }
                              );
                            }
                            setQuery(s); 
                            setActiveSegment('budget'); 
                          }}
                          className={cn(
                            "flex items-center gap-4 rounded-xl px-4 py-3 ty-body font-bold transition-all text-left group w-full",
                            s === 'Near Me' ? "text-emerald-600 hover:bg-emerald-50" : "text-zinc-700 hover:bg-zinc-50"
                          )}
                        >
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                            s === 'Near Me' ? "bg-emerald-100 group-hover:bg-emerald-200" : "bg-zinc-100 group-hover:bg-zinc-200"
                          )}>
                             {s === 'Near Me' ? <Navigation className="h-5 w-5 text-emerald-600" /> : <MapPin className="h-5 w-5 text-zinc-500" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={cn("truncate", s === 'Near Me' && "text-emerald-600")}>{s}</span>
                            {s === 'Near Me' && <span className="text-[10px] font-bold text-emerald-600/50 uppercase tracking-wider">Current location</span>}
                          </div>
                        </button>
                      ));
                    })()}
                    {!query || allAreas.some(a => a.toLowerCase() === query.toLowerCase()) ? null : (
                      allAreas.filter(a => a.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                        <div className="p-4 text-center ty-caption text-zinc-400">
                          No matching areas found
                        </div>
                      )
                    )}
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!activeSegment && <div className="h-8 w-px bg-zinc-200 shrink-0" />}

        {/* Budget Section */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActiveSegment('budget'); }}
          className={cn(
            "relative flex-1 flex flex-col items-start px-8 py-4 rounded-full transition-all text-left cursor-pointer group",
            activeSegment === 'budget' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
          )}
        >
          <span className="ty-label text-zinc-900 mb-0.5">Budget</span>
          <div className="flex items-center w-full min-w-0">
            <span className="ty-caption font-semibold text-zinc-400 truncate w-full">
              {budget.value === 0 ? "Any Budget" : budget.label}
            </span>
            {activeSegment === 'budget' && budget.value > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setBudget(BUDGET_OPTIONS[0]); }}
                className="ml-2 p-1 rounded-full hover:bg-zinc-200 transition-colors shrink-0"
              >
                <X className="h-3 w-3 text-zinc-400" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {activeSegment === 'budget' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute left-0 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
              >
                 <h3 className="mb-5 px-4 ty-label text-zinc-400">Select Budget</h3>
                <div className="space-y-1">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button 
                      key={opt.label}
                      onClick={(e) => { e.stopPropagation(); setBudget(opt); setActiveSegment('type'); }}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left ty-body font-bold transition-all",
                        budget.label === opt.label ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      <Wallet className={cn("h-4 w-4", budget.label === opt.label ? "text-zinc-300" : "text-zinc-400")} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!activeSegment && <div className="h-8 w-px bg-zinc-200 shrink-0" />}

        {/* Type Section */}
        <div 
          className={cn(
            "relative flex-[1.2] flex items-center justify-between rounded-full transition-all",
            activeSegment === 'type' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
          )}
        >
          <div 
            onClick={(e) => { e.stopPropagation(); setActiveSegment('type'); }}
            className="flex flex-col items-start px-8 py-4 text-left w-full h-full cursor-pointer group"
          >
            <span className="ty-label text-zinc-900 mb-0.5 whitespace-nowrap">Property Type</span>
            <div className="flex items-center w-full min-w-0">
              <span className="ty-caption font-semibold text-zinc-400 truncate w-full">{propertyType === "Any Type" ? "Add guests" : propertyType}</span>
              {activeSegment === 'type' && propertyType !== "Any Type" && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setPropertyType("Any Type"); }}
                  className="ml-2 p-1 rounded-full hover:bg-zinc-200 transition-colors shrink-0"
                >
                  <X className="h-3 w-3 text-zinc-400" />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {activeSegment === 'type' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
              >
                 <h3 className="mb-5 px-4 ty-label text-zinc-400">Property Category</h3>
                <div className="flex flex-col gap-1">
                  {PROPERTY_TYPES.map((type) => (
                    <button 
                      key={type}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setPropertyType(type); 
                        setActiveSegment(null); 
                        handleSearch({ type });
                      }}
                      className={cn(
                        "flex items-center gap-4 rounded-xl px-4 py-4 text-left ty-body font-bold transition-all",
                        propertyType === type ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      {type === "Residential Plot" || type.includes("Land") ? <Trees className="h-5 w-5" /> : <HomeIcon className="h-5 w-5" />}
                      <span className="ty-body font-bold">{type}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleSearch(); }}
            className={cn(
              "mr-2 flex h-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-all shadow-lg shadow-black/20",
              activeSegment ? "px-6 w-auto gap-3 hover:bg-black" : "w-12 px-0 hover:bg-black"
            )}
          >
            <Search className="h-5 w-5" strokeWidth={3} />
            <AnimatePresence mode="wait">
              {activeSegment && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }} 
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-black text-xs uppercase tracking-widest overflow-hidden whitespace-nowrap"
                >
                  Search
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}



