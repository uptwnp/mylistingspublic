'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Wallet, Home as HomeIcon, Trees, ChevronDown, SlidersHorizontal, X, Locate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { getAreas } from '@/lib/supabase';
import { useShortlist } from '@/context/ShortlistContext';
import { SORT_CATEGORIES, NEARBY_SORT_CATEGORY } from '@/lib/constants';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { getSeoUrl, parseSeoSlug } from '@/lib/seo-utils';


export const BUDGET_OPTIONS = [
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

export const PROPERTY_TYPES = [
  "Residential Plot", "Residential House", "Floor", "Flat", "Shop", "Office", "Villa", "Commercial Built-up", "Big Commercial", "Factory", "Godown"
];

interface HeaderSearchProps {
  isScrolled: boolean;
  city: string;
  query: string;
  setQuery: (q: string) => void;
  budget: { label: string; value: number };
  setBudget: (b: { label: string; value: number }) => void;
  propertyType: string;
  setPropertyType: (t: string) => void;
  onExpand?: (segment?: string) => void;
  onOpenFilters?: () => void;
  onSearch?: () => void;
  initialSegment?: string | null;
  additionalFiltersCount?: number;
}

export function HeaderSearch({ 
  isScrolled, 
  city,
  query, 
  setQuery, 
  budget, 
  setBudget, 
  propertyType, 
  setPropertyType,
  onExpand,
  onOpenFilters,
  onSearch,
  initialSegment = null,
  additionalFiltersCount = 0
}: HeaderSearchProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(initialSegment);
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const { setUserLocation, sortField, sortOrder, setSortField, setSortOrder, userLocation } = useShortlist();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isExplorePage = pathname === '/explore' || !!parseSeoSlug(pathname.slice(1));

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let active = true;
    
    async function loadAreas() {
      setIsSearching(true);
      try {
        const areas = await getAreas(city, query);
        if (active) setAllAreas(areas);
      } catch (err) {
        console.error('Search areas failed:', err);
      } finally {
        if (active) setIsSearching(false);
      }
    }

    const timeoutId = setTimeout(loadAreas, query ? 300 : 0);
    return () => { active = false; clearTimeout(timeoutId); };
  }, [city, query]);

  useEffect(() => {
    if (activeSegment === 'location' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSegment]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveSegment(null);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!isScrolled ? (
          <motion.div
            key="large-search"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* LARGE SEARCH - PC VERSION (HIDDEN ON MOBILE) */}
            <div
              className={cn(
                "hidden sm:flex relative items-center rounded-full border border-zinc-200 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-18 p-0",
                activeSegment ? "bg-white ring-1 ring-zinc-200/50" : "hover:bg-white"
              )}
            >
              {/* PC: Area Section */}
              <div 
                onClick={(e) => { e.stopPropagation(); setActiveSegment('location'); }}
                className={cn(
                  "relative flex flex-col items-start px-10 py-2 text-left w-[35%] h-full justify-center rounded-full transition-all group cursor-pointer",
                  activeSegment === 'location' && "bg-white shadow-xl ring-1 ring-zinc-200"
                )}
              >
                <span className="ty-label text-zinc-900 mb-0.5 whitespace-nowrap">Where?</span>
                <div className="flex items-center w-full min-w-0">
                  <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="Search areas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="w-full bg-transparent ty-body font-bold text-zinc-900 outline-none placeholder:text-zinc-400 min-w-0"
                  />
                  {activeSegment === 'location' && query && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setQuery(''); }}
                      className="ml-2 p-1.5 rounded-full hover:bg-zinc-100 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5 text-zinc-600" />
                    </button>
                  )}
                </div>

                {/* Dropdown: Location */}
                <AnimatePresence>
                  {activeSegment === 'location' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-0 top-[calc(100%+8px)] z-50 w-[400px] bg-white rounded-[24px] border border-zinc-100 shadow-2xl p-4 hidden sm:block"
                    >
                      <h3 className="mb-4 px-4 ty-label text-zinc-400">
                        {query ? 'Available Areas' : 'Popular Areas'}
                      </h3>
                      <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {isSearching && !allAreas.length ? (
                          <div className="p-8 text-center ty-caption text-zinc-400">Searching...</div>
                        ) : (
                          <>
                            {(!query || 'near me'.includes(query.toLowerCase())) && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if ('geolocation' in navigator) {
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
                                      }
                                    );
                                  }
                                  setQuery('Near Me'); 
                                  setActiveSegment('budget'); 
                                }}
                                className="flex items-center gap-4 rounded-xl px-4 py-3 ty-body font-bold transition-all text-left group text-brand-primary hover:bg-blue-50"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors bg-blue-50 group-hover:bg-blue-100">
                                   <Locate className="h-5 w-5 text-brand-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="truncate text-brand-primary">Near Me</span>
                                  <span className="text-[10px] font-bold text-brand-primary/50 uppercase tracking-wider">Current location</span>
                                </div>
                              </button>
                            )}

                            {allAreas.map((s) => (
                              <button 
                                key={s} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setQuery(s); 
                                  setActiveSegment('budget'); 
                                }}
                                className="flex items-center gap-4 rounded-xl px-4 py-3 ty-body font-bold transition-all text-left group text-zinc-700 hover:bg-zinc-50"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors bg-zinc-100 group-hover:bg-zinc-200">
                                   <MapPin className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="truncate">{s}</span>
                                </div>
                              </button>
                            ))}

                            {!isSearching && allAreas.length === 0 && (
                              <div className="p-8 text-center ty-caption text-zinc-400">
                                {query ? `No matching areas found in ${city}` : "No areas available"}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-10 w-px bg-zinc-200 shrink-0" />

              {/* PC: Budget Section */}
              <div 
                onClick={(e) => { e.stopPropagation(); setActiveSegment('budget'); }}
                className={cn(
                  "relative flex flex-col items-start px-10 py-2 text-left w-[30%] h-full justify-center rounded-full transition-all group cursor-pointer",
                  activeSegment === 'budget' && "bg-white shadow-xl ring-1 ring-zinc-200"
                )}
              >
                <span className="ty-label text-zinc-900 mb-0.5 whitespace-nowrap">Your Budget</span>
                <div className="flex items-center w-full min-w-0">
                  <span className={cn("ty-body font-bold truncate w-full group-hover:text-zinc-900 transition-colors", budget.value === 0 ? "text-zinc-300" : "text-zinc-900")}>
                    {budget.value === 0 ? "Select budget" : budget.label}
                  </span>
                  {activeSegment === 'budget' && budget.value > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setBudget(BUDGET_OPTIONS[0]); }}
                      className="ml-2 p-1.5 rounded-full hover:bg-zinc-100 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5 text-zinc-600" />
                    </button>
                  )}
                </div>

                {/* Dropdown: Budget */}
                <AnimatePresence>
                  {activeSegment === 'budget' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-0 top-[calc(100%+8px)] z-50 w-80 bg-white rounded-[24px] border border-zinc-100 shadow-2xl p-4 hidden sm:block"
                    >
                      <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {BUDGET_OPTIONS.map((opt) => (
                          <button 
                            key={opt.label}
                            onClick={(e) => { e.stopPropagation(); setBudget(opt); setActiveSegment('type'); }}
                            className={cn(
                              "flex items-center gap-4 rounded-xl px-4 py-3 text-left ty-body font-bold transition-all border-2",
                              budget.label === opt.label ? "border-zinc-900 bg-zinc-50" : "border-transparent hover:bg-zinc-50"
                            )}
                          >
                            <Wallet className="h-5 w-5 text-zinc-400" />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-10 w-px bg-zinc-200 shrink-0" />

              {/* PC: Property Type & Search Section */}
              <div 
                className={cn(
                  "relative flex flex-1 items-center justify-between w-[35%] h-full rounded-full transition-all pl-10 pr-2 group cursor-pointer",
                  activeSegment === 'type' && "bg-white shadow-xl ring-1 ring-zinc-200"
                )}
                onClick={(e) => { e.stopPropagation(); setActiveSegment('type'); }}
              >
                <div className="flex flex-col items-start min-w-0 overflow-hidden flex-1">
                  <span className="ty-label text-zinc-900 mb-0.5 whitespace-nowrap">Property Type</span>
                  <div className="flex items-center w-full min-w-0">
                    <span className={cn("ty-body font-bold truncate w-full group-hover:text-zinc-900 transition-colors", propertyType === "Any Type" ? "text-zinc-300" : "text-zinc-900")}>
                      {propertyType === "Any Type" ? "What are you looking for?" : propertyType}
                    </span>
                    {activeSegment === 'type' && propertyType !== "Any Type" && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPropertyType("Any Type"); }}
                        className="ml-2 p-1.5 rounded-full hover:bg-zinc-100 transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5 text-zinc-600" />
                      </button>
                    )}
                  </div>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                  className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition-all shadow-lg hover:bg-blue-700  ml-2"
                >
                  <Search className="h-6 w-6" strokeWidth={3} />
                </button>

                {/* Dropdown: Property Type */}
                <AnimatePresence>
                  {activeSegment === 'type' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 bg-white rounded-[24px] border border-zinc-100 shadow-2xl p-4 hidden sm:block"
                    >
                      <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {PROPERTY_TYPES.map((type) => (
                          <button 
                            key={type}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setPropertyType(type); 
                              setActiveSegment(null); 
                            }}
                            className={cn(
                              "flex items-center gap-4 rounded-xl px-4 py-3 text-left ty-body font-bold transition-all border-2",
                              propertyType === type ? "border-zinc-900 bg-zinc-50" : "border-transparent hover:bg-zinc-50"
                            )}
                          >
                            <HomeIcon className="h-5 w-5 text-zinc-400" />
                            <span>{type}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* MOBILE HERO SEARCH (Simplified) */}
            <div className="sm:hidden w-full px-4 text-center">
               <button
                  onClick={() => onExpand?.()}
                  className="flex w-full items-center gap-3 rounded-full border border-blue-100 bg-blue-50/30 p-1.5 pl-6 shadow-xl shadow-blue-900/5 transition-all active:scale-[0.98] text-left"
               >
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-[13px] font-black text-brand-primary leading-none tracking-tight uppercase mb-1">Start your search</span>
                    <span className="text-[12px] font-bold text-zinc-400 truncate leading-none tracking-tight">
                      {query ? `${query}, ${city}` : `Search anything in ${city}`}
                    </span>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg shadow-blue-200">
                    <Search className="h-5 w-5" strokeWidth={3} />
                  </div>
               </button>
            </div>
          </motion.div>
        ) : (
          /* COMPACT NAVBAR SEARCH */
          <motion.div
            key="compact-search"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-center"
          >
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => { if (onExpand) onExpand(); else window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex-1 min-w-0 flex items-center divide-x divide-zinc-200 rounded-full border border-zinc-200 bg-white py-1.5 pl-4 pr-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center px-4 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onExpand?.('location'); }}>
                  <span className="ty-caption font-bold text-zinc-900 truncate tracking-tight">{query || "Anywhere"}</span>
                </div>
                <div className="flex items-center px-4 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onExpand?.('budget'); }}>
                  <span className="ty-caption font-bold text-zinc-900 truncate tracking-tight">{budget.label === "Any Budget" ? "Any Budget" : budget.label}</span>
                </div>
                <div className="flex items-center px-4 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onExpand?.('type'); }}>
                  <span className="ty-caption font-bold text-zinc-400 truncate tracking-tight">{propertyType === "Any Type" ? "Any Type" : propertyType}</span>
                </div>
                <div 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleSearch(); 
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white ml-2 transition-transform  hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" strokeWidth={3} />
                </div>
              </button>

              {isExplorePage && onOpenFilters && (
                <div className="flex items-center gap-2 relative">
                  <button
                    onClick={onOpenFilters}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-md hover:shadow-lg transition-all"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {additionalFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white border border-white">
                        {additionalFiltersCount}
                      </span>
                    )}
                  </button>

                  <div className="relative" ref={sortRef}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSortOpen(!isSortOpen);
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white h-10 px-4 whitespace-nowrap shrink-0 ty-caption font-bold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50  shadow-md hover:shadow-lg"
                    >
                      {(() => {
                        const allSortCategories = [...SORT_CATEGORIES, ...NEARBY_SORT_CATEGORY];
                        const activeCategory = allSortCategories.find(c => c.field === sortField) || SORT_CATEGORIES[0];
                        const DirectionIcon = sortOrder === 'desc' ? ArrowDown : ArrowUp;
                        return (
                          <>
                            <activeCategory.icon className="h-4 w-4 shrink-0 text-zinc-700" />
                            <span className="whitespace-nowrap">{activeCategory.label}</span>
                            <DirectionIcon className={cn("h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform", isSortOpen && "rotate-180")} />
                          </>
                        );
                      })()}
                    </button>

                    <AnimatePresence>
                      {isSortOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/50"
                          >
                            {[...SORT_CATEGORIES, ...(query === 'Near Me' || userLocation ? NEARBY_SORT_CATEGORY : [])].map((cat) => {
                              const isActive = sortField === cat.field;
                              const currentOrder = isActive ? sortOrder : cat.defaultOrder;
                              const DirectionIcon = currentOrder === 'desc' ? ArrowDown : ArrowUp;
                              return (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    if (isActive && cat.canToggle) {
                                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setSortField(cat.field);
                                      setSortOrder(cat.defaultOrder);
                                    }
                                    setIsSortOpen(false);
                                    onSearch?.(); // Call onSearch after sorting
                                  }}
                                  className={cn(
                                    "flex w-full justify-between items-center rounded-xl px-3 py-2.5 text-left ty-caption font-bold transition-all",
                                    isActive 
                                      ? "bg-zinc-900 text-white" 
                                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <cat.icon className={cn("h-4 w-4", isActive ? "text-white/70" : "text-zinc-400")} />
                                    {cat.label}
                                  </div>
                                  {isActive && <DirectionIcon className="h-3.5 w-3.5" />}
                                </button>
                              );
                            })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Compact: Keep minimal as requested previously */}
            <div
              className="sm:hidden flex items-center gap-3 rounded-full border border-zinc-200 bg-white py-2 px-4 shadow-md"
            >
              <div 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleSearch(); 
                }}
                className="flex h-6 w-6 items-center justify-center -ml-1  transition-transform cursor-pointer"
              >
                <Search className="h-4 w-4 text-zinc-900" strokeWidth={3} />
              </div>
              <button 
                onClick={() => onExpand?.()}
                className="flex-1 text-left ty-caption font-bold text-zinc-900 truncate"
              >
                {query ? `${query}, ${city}` : city}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
