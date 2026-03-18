'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Wallet, Home as HomeIcon, Trees, ChevronDown, SlidersHorizontal } from 'lucide-react';
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
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto flex justify-center">
      <>
        {!isScrolled ? (
          <div
            className={cn(
              "relative flex w-full flex-col sm:flex-row items-center rounded-[32px] sm:rounded-full border border-zinc-200/80 bg-white shadow-2xl h-auto sm:h-16 p-1.5 sm:p-0",
              activeSegment ? "bg-zinc-50/50 border-zinc-300" : "hover:border-zinc-300 shadow-zinc-200/50"
            )}
          >
            {/* Area Section */}
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveSegment('location'); }}
              className={cn(
                "w-full sm:flex-[1.4] flex flex-col items-start px-6 sm:px-8 py-4 sm:py-2 rounded-[28px] sm:rounded-full transition-all text-left h-full justify-center",
                activeSegment === 'location' ? "bg-white shadow-xl ring-1 ring-black/5 z-10" : "hover:bg-zinc-100/50"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-0.5">Where</span>
              <input 
                ref={inputRef}
                type="text"
                placeholder="Search areas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setActiveSegment('location')}
                className="w-full bg-transparent text-[13px] font-bold text-zinc-500 outline-none placeholder:text-zinc-400"
              />
            </button>

            <div className="hidden sm:block h-8 w-px bg-zinc-200 shrink-0" />

            {/* Budget Section */}
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveSegment('budget'); }}
              className={cn(
                "w-full sm:flex-1 flex flex-col items-start px-6 sm:px-8 py-4 sm:py-2 rounded-[28px] sm:rounded-full transition-all text-left h-full justify-center mt-1 sm:mt-0",
                activeSegment === 'budget' ? "bg-white shadow-xl ring-1 ring-black/5 z-10" : "hover:bg-zinc-100/50"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-0.5">Budget</span>
              <span className="text-[13px] font-bold text-zinc-400 truncate w-full">
                {budget.value === 0 ? "Any Budget" : budget.label}
              </span>
            </button>

            <div className="hidden sm:block h-8 w-px bg-zinc-200 shrink-0" />

            {/* Type Section */}
            <div 
              className={cn(
                "w-full sm:flex-[1.2] flex items-center justify-between rounded-[28px] sm:rounded-full transition-all h-full mt-1 sm:mt-0",
                activeSegment === 'type' ? "bg-white shadow-xl ring-1 ring-black/5 z-10" : "hover:bg-zinc-100/50"
              )}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveSegment('type'); }}
                className="flex flex-col items-start px-6 sm:px-8 py-4 sm:py-2 text-left w-full h-full justify-center"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-0.5 whitespace-nowrap">Property Type</span>
                <span className="text-[13px] font-bold text-zinc-400 truncate w-full">
                  {propertyType === "Any Type" ? "Select Type" : propertyType}
                </span>
              </button>

              <div className="flex items-center gap-2 mr-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                  className={cn(
                    "flex h-12 w-12 sm:h-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-all shadow-xl shadow-zinc-200 hover:bg-black active:scale-95",
                    (activeSegment || query) && "sm:w-auto sm:px-6 sm:gap-3"
                  )}
                >
                  <Search className="h-5 w-5" strokeWidth={3} />
                  {(activeSegment || query) && (
                    <span 
                      className="hidden sm:inline font-black text-xs uppercase tracking-widest"
                    >
                      Search
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Dropdowns */}
            <AnimatePresence>
              {activeSegment && (
                <>
                  {/* Mobile Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveSegment(null)}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
                  />
                  
                  {activeSegment === 'location' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 sm:left-0 sm:right-auto top-[calc(100%+12px)] z-50 w-full sm:max-w-sm rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl mt-4 mx-auto max-w-[calc(100vw-32px)] sm:mx-0 sm:mt-0"
                    >
                       <h3 className="mb-4 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Popular Areas</h3>
                       <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto pr-2">
                         {SUGGESTIONS.map((s) => (
                           <button 
                            key={s} 
                            onClick={() => { setQuery(s); setActiveSegment('budget'); }}
                            className="flex items-center gap-4 rounded-2xl px-4 py-3 text-[14px] font-bold text-zinc-700 hover:bg-zinc-50 transition-all group"
                           >
                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
                                <MapPin className="h-5 w-5 text-zinc-500" />
                             </div>
                             <span>{s}</span>
                           </button>
                         ))}
                       </div>
                    </motion.div>
                  )}

                  {activeSegment === 'budget' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 sm:left-1/3 sm:right-auto top-[calc(100%+12px)] z-50 w-full sm:w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl mt-4 mx-auto max-w-[calc(100vw-32px)] sm:mx-0 sm:mt-0"
                    >
                      <h3 className="mb-4 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select Budget</h3>
                      <div className="space-y-1">
                        {BUDGET_OPTIONS.map((opt) => (
                          <button 
                            key={opt.label}
                            onClick={() => { setBudget(opt); setActiveSegment('type'); }}
                            className={cn(
                              "flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-[14px] font-bold transition-all",
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 sm:right-0 sm:left-auto top-[calc(100%+12px)] z-50 w-full sm:w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl mt-4 mx-auto max-w-[calc(100vw-32px)] sm:mx-0 sm:mt-0"
                    >
                      <h3 className="mb-4 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Property Category</h3>
                      <div className="space-y-1">
                        {PROPERTY_TYPES.map((type) => (
                          <button 
                            key={type}
                            onClick={() => { setPropertyType(type); setActiveSegment(null); }}
                            className={cn(
                              "flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-[14px] font-bold transition-all",
                              propertyType === type ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
                            )}
                          >
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                              propertyType === type ? "bg-white/10" : "bg-zinc-100 group-hover:bg-zinc-200"
                            )}>
                              {type.toLowerCase().includes("plot") ? <Trees className="h-4 w-4" /> : <HomeIcon className="h-4 w-4" />}
                            </div>
                            <span className="font-bold">{type}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 w-full max-w-[calc(100vw-48px)]">
            <button
              key="compact"
              onClick={() => {
                if (onExpand) {
                  onExpand();
                } else {
                  // Default behavior for home page: scroll to top to expand
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex flex-1 items-center justify-between gap-2 sm:gap-4 rounded-full border border-zinc-200 bg-white py-1.5 sm:py-2 pl-4 sm:pl-6 pr-1.5 sm:pr-2 shadow-md hover:shadow-lg transition-all min-w-0"
            >
              <div className="flex items-center divide-x divide-zinc-200 min-w-0 overflow-hidden">
                <span 
                  onClick={(e) => { e.stopPropagation(); onExpand?.('location'); }}
                  className="pr-2 sm:pr-3 text-[12px] sm:text-sm font-bold text-zinc-900 hover:text-rose-500 transition-colors cursor-pointer truncate"
                >
                  {query || "Any Area"}
                </span>
                <span 
                  onClick={(e) => { e.stopPropagation(); onExpand?.('budget'); }}
                  className="hidden sm:block px-3 text-sm font-bold text-zinc-900 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  {budget.label === "Any Budget" ? "Any Budget" : budget.label}
                </span>
                <span 
                  onClick={(e) => { e.stopPropagation(); onExpand?.('type'); }}
                  className="hidden md:block pl-3 text-sm font-medium text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  {propertyType === "Any Type" ? "Any Type" : propertyType}
                </span>
              </div>

              <div 
                onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm cursor-pointer hover:bg-black active:scale-95 transition-all"
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
              </div>
            </button>

            {isExplorePage && (
              <button
                onClick={onOpenFilters}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-md hover:shadow-lg transition-all"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </>
    </div>
  );
}
