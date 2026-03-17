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
              "relative flex w-full items-center rounded-full border border-zinc-200 bg-white shadow-xl h-16",
              activeSegment ? "bg-zinc-50 border-zinc-300" : "hover:border-zinc-300"
            )}
          >
            {/* Area Section */}
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveSegment('location'); }}
              className={cn(
                "flex-[1.4] flex flex-col items-start px-8 py-2 rounded-full transition-all text-left h-full justify-center",
                activeSegment === 'location' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-900 mb-0.5">Area</span>
              <input 
                ref={inputRef}
                type="text"
                placeholder="Search areas"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setActiveSegment('location')}
                className="w-full bg-transparent text-[13px] font-semibold text-zinc-500 outline-none placeholder:text-zinc-400"
              />
            </button>

            <div className="h-8 w-px bg-zinc-200 shrink-0" />

            {/* Budget Section */}
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveSegment('budget'); }}
              className={cn(
                "flex-1 flex flex-col items-start px-8 py-2 rounded-full transition-all text-left h-full justify-center",
                activeSegment === 'budget' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-900 mb-0.5">Budget</span>
              <span className="text-[13px] font-semibold text-zinc-400 truncate w-full">
                {budget.value === 0 ? "Any Budget" : budget.label}
              </span>
            </button>

            <div className="h-8 w-px bg-zinc-200 shrink-0" />

            {/* Type Section */}
            <div 
              className={cn(
                "flex-[1.2] flex items-center justify-between rounded-full transition-all h-full",
                activeSegment === 'type' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
              )}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveSegment('type'); }}
                className="flex flex-col items-start px-8 py-2 text-left w-full h-full justify-center"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-900 mb-0.5 whitespace-nowrap">Property Type</span>
                <span className="text-[13px] font-semibold text-zinc-400 truncate w-full">
                  {propertyType === "Any Type" ? "Select Type" : propertyType}
                </span>
              </button>

              <div className="flex items-center gap-2 mr-2">
               
                {/* Search Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                  className={cn(
                    "flex h-12 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white transition-all shadow-lg shadow-rose-500/20 hover:bg-rose-600",
                    activeSegment ? "px-6 w-auto gap-3" : "w-12 px-0"
                  )}
                >
                  <Search className="h-5 w-5" strokeWidth={2.5} />
                  {activeSegment && (
                    <span 
                      className="font-black text-xs uppercase tracking-widest overflow-hidden whitespace-nowrap"
                    >
                      Search
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Dropdowns */}
            {activeSegment === 'location' && (
              <div
                className="absolute left-0 top-[calc(100%+12px)] z-50 w-full max-w-sm rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
              >
                 <h3 className="mb-4 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Popular Areas</h3>
                 <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
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
              </div>
            )}

            {activeSegment === 'budget' && (
              <div
                className="absolute left-1/3 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
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
              </div>
            )}

            {activeSegment === 'type' && (
              <div
                className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
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
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
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
              className="flex items-center gap-4 rounded-full border border-zinc-200 bg-white py-2 pl-6 pr-2 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center divide-x divide-zinc-200">
                <span 
                  onClick={(e) => { e.stopPropagation(); onExpand?.('location'); }}
                  className="pr-3 text-sm font-bold text-zinc-900 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  {query || "Any Area"}
                </span>
                <span 
                  onClick={(e) => { e.stopPropagation(); onExpand?.('budget'); }}
                  className="px-3 text-sm font-bold text-zinc-900 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  {budget.label === "Any Budget" ? "Any Budget" : budget.label}
                </span>
                <span 
                  onClick={(e) => { e.stopPropagation(); onExpand?.('type'); }}
                  className="pl-3 text-sm font-medium text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  {propertyType === "Any Type" ? "Any Type" : propertyType}
                </span>
              </div>

              <div 
                onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm cursor-pointer hover:bg-rose-600 active:scale-95 transition-all"
              >
                <Search className="h-4 w-4" strokeWidth={3} />
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
