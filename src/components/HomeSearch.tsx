'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Wallet, Home as HomeIcon, Trees, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getAreas } from '@/lib/supabase';
import { useDiscussion } from '@/context/DiscussionContext';

const SUGGESTIONS = [
  "TDI City", "Sector 13-17", "Sector 18", "Sector 25", "Ansal", "Sector 12", "Model Town", "Sector 8", "Eldeco Estate"
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: 0 },
  { label: "Under 40 Lakh", value: 40 },
  { label: "40 to 80 Lakh", value: 80 },
  { label: "80 Lakh to 1.2 Cr", value: 120 },
  { label: "1.2 Cr to 1.6 Cr", value: 160 },
  { label: "1.6 to 2.5 Cr", value: 250 },
  { label: "2.5 Cr to 5 Cr", value: 500 },
  { label: "5 Cr to 10 Cr", value: 1000 },
  { label: "10 Cr to 50 cr", value: 5000 },
  { label: "50 Cr to 100 cr", value: 10000 },
  { label: "100 Cr+", value: 10001 },
];

const PROPERTY_TYPES = [
  "Residential Plot", "Residential House", "Floor", "Flat", "Shop", "Office", "Villa", "Commercial Built-up", "Big Commercial", "Industrial Land", "Industrial Built-up", "Agriculture Land", "Factory", "Godown"
];

export function HomeSearch() {
  const router = useRouter();
  const { selectedCity } = useDiscussion();
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
  const [propertyType, setPropertyType] = useState("Any Type");
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('area', query);
    if (budget.value > 0) params.set('budget', budget.label);
    if (propertyType !== "Any Type") params.set('type', propertyType);
    
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
            "flex-[1.4] flex flex-col items-start px-8 py-4 rounded-full transition-all text-left cursor-pointer group",
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
        </div>

        {!activeSegment && <div className="h-8 w-px bg-zinc-200 shrink-0" />}

        {/* Budget Section */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActiveSegment('budget'); }}
          className={cn(
            "flex-1 flex flex-col items-start px-8 py-4 rounded-full transition-all text-left cursor-pointer group",
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
        </div>

        {!activeSegment && <div className="h-8 w-px bg-zinc-200 shrink-0" />}

        {/* Type Section */}
        <div 
          className={cn(
            "flex-[1.2] flex items-center justify-between rounded-full transition-all",
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

        {/* Dropdowns */}
        <AnimatePresence>
          {activeSegment === 'location' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute left-0 top-[calc(100%+12px)] z-50 w-full max-w-sm rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
            >
                <h3 className="mb-5 px-4 ty-label text-zinc-400">
                  {query ? 'Available Areas' : 'Popular Areas'}
                </h3>
                <div className="grid grid-cols-1 gap-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const isNearMe = query.toLowerCase() === 'near me';
                    const isExactMatch = allAreas.some(a => a.toLowerCase() === query.toLowerCase());
                    const showNearby = !query || isExactMatch || 'near me'.includes(query.toLowerCase());
                    
                    if (!showNearby) return null;

                    return (
                      <button 
                        onClick={() => { 
                          if ('geolocation' in navigator) {
                            navigator.geolocation.getCurrentPosition(() => {}, () => {});
                          }
                          setQuery('Near Me'); 
                          setActiveSegment('budget'); 
                        }}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3 ty-body font-bold text-emerald-600 hover:bg-emerald-50 transition-all group w-full text-left bg-emerald-50/20 mb-1"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-100 group-hover:bg-emerald-600 transition-colors">
                          <Navigation className="h-5 w-5" strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate">Near Me</span>
                          <span className="text-[10px] font-bold text-emerald-600/50 uppercase tracking-wider">Use current location</span>
                        </div>
                      </button>
                    );
                  })()}
                  {(() => {
                    const isNearMe = query.toLowerCase() === 'near me';
                    const isExactMatch = allAreas.some(a => a.toLowerCase() === query.toLowerCase());
                    const showDefault = !query || isExactMatch || isNearMe;
                    
                    const filtered = allAreas
                      .filter(a => a.toLowerCase().includes(query.toLowerCase()))
                      .slice(0, 10);

                    return (showDefault ? SUGGESTIONS : filtered).map((s) => (
                      <button 
                        key={s} 
                        onClick={() => { setQuery(s); setActiveSegment('budget'); }}
                        className="flex items-center gap-4 rounded-2xl px-4 py-3 ty-body font-bold text-zinc-700 hover:bg-zinc-50 transition-all group w-full text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
                          <MapPin className="h-5 w-5 text-zinc-500" />
                        </div>
                        <span className="truncate">{s}</span>
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

          {activeSegment === 'budget' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute left-1/4 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
            >
               <h3 className="mb-5 px-4 ty-label text-zinc-400">Select Budget</h3>
              <div className="space-y-1">
                {BUDGET_OPTIONS.map((opt) => (
                  <button 
                    key={opt.label}
                    onClick={() => { setBudget(opt); setActiveSegment('type'); }}
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

          {activeSegment === 'type' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
            >
               <h3 className="mb-5 px-4 ty-label text-zinc-400">Property Category</h3>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button 
                    key={type}
                    onClick={() => { setPropertyType(type); setActiveSegment(null); }}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all",
                      propertyType === type ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                    )}
                  >
                    {type === "Plot" || type === "Commercial" ? <Trees className="h-6 w-6" /> : <HomeIcon className="h-6 w-6" />}
                    <span className="ty-caption font-black">{type}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}



