'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Wallet, Home as HomeIcon, Trees, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

const SUGGESTIONS = [
  "Nearby", "Sector 18", "Tdi City", "Ansal", "Sector 13-17", "Sector 25", "Model Town", "Sanjay Colony", "Industrial Area"
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: 0 },
  { label: "Under 50 Lakh", value: 50 },
  { label: "Under 1 Cr", value: 100 },
  { label: "Under 5 Cr", value: 500 },
  { label: "Under 10 Cr", value: 1000 },
  { label: "Above 10 Cr", value: 1001 },
];

const PROPERTY_TYPES = [
  "Residential Plot", "Resi. House", "Shop", "Office", "Villa", "Apartment", "Commercial Plot"
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
  initialSegment?: string | null;
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
  initialSegment = null
}: HeaderSearchProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(initialSegment);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isExplorePage = pathname === '/explore';

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (query) params.set('area', query);
    if (budget.value > 0) params.set('budget', budget.label);
    if (propertyType !== "Any Type") params.set('type', propertyType);

    router.push(`/explore?${params.toString()}`);
    setActiveSegment(null);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!isScrolled ? (
          <motion.div
            key="large-search"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            {/* LARGE SEARCH - PC VERSION (HIDDEN ON MOBILE) */}
            <div
              className={cn(
                "hidden sm:flex relative items-center rounded-full border border-zinc-200/80 bg-white shadow-2xl h-18 p-0",
                activeSegment ? "bg-zinc-50/10" : "hover:bg-zinc-50/30"
              )}
            >
              {/* PC: Area Section */}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveSegment('location'); }}
                className={cn(
                  "flex flex-col items-start px-10 py-2 text-left w-[35%] h-full justify-center rounded-full transition-all group",
                  activeSegment === 'location' && "bg-white shadow-xl ring-1 ring-zinc-200"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 mb-0.5 whitespace-nowrap">Where to?</span>
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Search areas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-[15px] font-bold text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </button>

              <div className="h-10 w-px bg-zinc-200 shrink-0" />

              {/* PC: Budget Section */}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveSegment('budget'); }}
                className={cn(
                  "flex flex-col items-start px-10 py-2 text-left w-[30%] h-full justify-center rounded-full transition-all group",
                  activeSegment === 'budget' && "bg-white shadow-xl ring-1 ring-zinc-200"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 mb-0.5 whitespace-nowrap">Your Budget</span>
                <span className={cn("text-[14px] font-bold truncate w-full group-hover:text-zinc-900 transition-colors", budget.value === 0 ? "text-zinc-300" : "text-zinc-900")}>
                  {budget.value === 0 ? "Select budget" : budget.label}
                </span>
              </button>

              <div className="h-10 w-px bg-zinc-200 shrink-0" />

              {/* PC: Property Type & Search Section */}
              <div 
                className={cn(
                  "flex flex-1 items-center justify-between w-[35%] h-full rounded-full transition-all pl-10 pr-2",
                  activeSegment === 'type' && "bg-white shadow-xl ring-1 ring-zinc-200"
                )}
                onClick={(e) => { e.stopPropagation(); setActiveSegment('type'); }}
              >
                <div className="flex flex-col items-start min-w-0 overflow-hidden cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 mb-0.5 whitespace-nowrap">Property Type</span>
                  <span className={cn("text-[14px] font-bold truncate w-full group-hover:text-zinc-900 transition-colors", propertyType === "Any Type" ? "text-zinc-300" : "text-zinc-900")}>
                    {propertyType === "Any Type" ? "What are you looking for?" : propertyType}
                  </span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                  className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white transition-all shadow-lg hover:bg-rose-600 active:scale-95"
                >
                  <Search className="h-6 w-6" strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* MOBILE HERO SEARCH (Simplified) */}
            <div className="sm:hidden w-full px-4 text-center">
               <button
                  onClick={() => onExpand?.()}
                  className="flex w-full items-center gap-4 rounded-[32px] border border-zinc-200/80 bg-white p-4 shadow-2xl"
               >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                    <Search className="h-5 w-5" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-zinc-900 uppercase">Start your search</span>
                    <span className="text-[11px] font-bold text-zinc-400">{query ? `${query}, ${city}` : city}</span>
                  </div>
               </button>
            </div>

            {/* PC Dropdowns */}
            <AnimatePresence>
              {activeSegment && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 flex justify-center hidden sm:flex"
                >
                  <div className="w-full max-w-2xl bg-white rounded-[32px] border border-zinc-100 shadow-2xl p-6">
                    {activeSegment === 'location' && (
                      <div>
                        <h3 className="mb-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Popular Areas</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {SUGGESTIONS.map((s) => (
                            <button 
                              key={s} 
                              onClick={() => { setQuery(s); setActiveSegment('budget'); }}
                              className="flex items-center gap-4 rounded-2xl px-4 py-3 text-[14px] font-bold text-zinc-700 hover:bg-zinc-50 transition-all text-left"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-zinc-200">
                                 <MapPin className="h-5 w-5 text-zinc-500" />
                              </div>
                              <span>{s}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSegment === 'budget' && (
                      <div className="grid grid-cols-2 gap-2">
                        {BUDGET_OPTIONS.map((opt) => (
                          <button 
                            key={opt.label}
                            onClick={() => { setBudget(opt); setActiveSegment('type'); }}
                            className={cn(
                              "flex items-center gap-4 rounded-2xl px-4 py-4 text-left text-[14px] font-bold transition-all border-2",
                              budget.label === opt.label ? "border-zinc-900 bg-zinc-50" : "border-transparent hover:bg-zinc-50"
                            )}
                          >
                            <Wallet className="h-5 w-5 text-zinc-400" />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {activeSegment === 'type' && (
                      <div className="grid grid-cols-2 gap-2">
                        {PROPERTY_TYPES.map((type) => (
                          <button 
                            key={type}
                            onClick={() => { setPropertyType(type); setActiveSegment(null); }}
                            className={cn(
                              "flex items-center gap-4 rounded-2xl px-4 py-4 text-left text-[14px] font-bold transition-all border-2",
                              propertyType === type ? "border-zinc-900 bg-zinc-50" : "border-transparent hover:bg-zinc-50"
                            )}
                          >
                            <HomeIcon className="h-5 w-5 text-zinc-400" />
                            <span>{type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* COMPACT NAVBAR SEARCH */
          <motion.div
            key="compact-search"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full flex justify-center"
          >
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => { if (onExpand) onExpand(); else window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center divide-x divide-zinc-200 rounded-full border border-zinc-200 bg-white py-1.5 pl-4 pr-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center px-4 min-w-0">
                  <span className="text-[13px] font-bold text-zinc-900 truncate tracking-tight">{query || "Anywhere"}</span>
                </div>
                <div className="flex items-center px-4 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onExpand?.('budget'); }}>
                  <span className="text-[13px] font-bold text-zinc-900 truncate tracking-tight">{budget.label === "Any Budget" ? "Any Budget" : budget.label}</span>
                </div>
                <div className="flex items-center px-4 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onExpand?.('type'); }}>
                  <span className="text-[13px] font-bold text-zinc-400 truncate tracking-tight">{propertyType === "Any Type" ? "Any Type" : propertyType}</span>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white ml-2">
                  <Search className="h-4 w-4" strokeWidth={3} />
                </div>
              </button>

              {isExplorePage && onOpenFilters && (
                <button
                  onClick={onOpenFilters}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-md hover:shadow-lg transition-all"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile Compact: Keep minimal as requested previously */}
            <button
              onClick={() => onExpand?.()}
              className="sm:hidden flex items-center gap-3 rounded-full border border-zinc-200 bg-white py-2 px-4 shadow-md"
            >
              <Search className="h-4 w-4 text-zinc-900" strokeWidth={3} />
              <span className="text-[13px] font-bold text-zinc-900">{query ? `${query}, ${city}` : city}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
