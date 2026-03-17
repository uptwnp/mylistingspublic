'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Wallet, Home as HomeIcon, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const SUGGESTIONS = [
  "Nearby", "Panipat", "Pune", "Mumbai", "Bangalore", 
  "Sector 18", "Tdi City", "Ansal", "Sector 13-17", "Sector 25"
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: 0 },
  { label: "Under 50 L", value: 50 },
  { label: "Under 1 Cr", value: 100 },
  { label: "Under 5 Cr", value: 500 },
];

const PROPERTY_TYPES = [
  "1 BHK", "2 BHK", "3 BHK", "Villa", "Plot", "Commercial"
];

export function HomeSearch() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
  const [propertyType, setPropertyType] = useState("Any Type");
  
  const searchRef = useRef<HTMLDivElement>(null);

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
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveSegment('location'); }}
          className={cn(
            "flex-[1.4] flex flex-col items-start px-8 py-4 rounded-full transition-all text-left",
            activeSegment === 'location' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
          )}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900 mb-0.5">Location</span>
          <input 
            type="text"
            placeholder="Search destinations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setActiveSegment('location')}
            className="w-full bg-transparent text-[13px] font-semibold text-zinc-500 outline-none placeholder:text-zinc-400"
          />
        </button>

        {!activeSegment && <div className="h-8 w-px bg-zinc-200 shrink-0" />}

        {/* Budget Section */}
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveSegment('budget'); }}
          className={cn(
            "flex-1 flex flex-col items-start px-8 py-4 rounded-full transition-all text-left",
            activeSegment === 'budget' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
          )}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900 mb-0.5">Budget</span>
          <span className="text-[13px] font-semibold text-zinc-400 truncate w-full">
            {budget.value === 0 ? "Any Budget" : budget.label}
          </span>
        </button>

        {!activeSegment && <div className="h-8 w-px bg-zinc-200 shrink-0" />}

        {/* Type Section */}
        <div 
          className={cn(
            "flex-[1.2] flex items-center justify-between rounded-full transition-all",
            activeSegment === 'type' ? "bg-white shadow-lg ring-1 ring-black/5 z-10" : "hover:bg-zinc-100"
          )}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveSegment('type'); }}
            className="flex flex-col items-start px-8 py-4 text-left w-full h-full"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900 mb-0.5 whitespace-nowrap">Property Type</span>
            <span className="text-[13px] font-semibold text-zinc-400">{propertyType === "Any Type" ? "Add guests" : propertyType}</span>
          </button>

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
               <h3 className="mb-5 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Popular Areas</h3>
               <div className="grid grid-cols-1 gap-1">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute left-1/4 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-5 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select Budget</h3>
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-5 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Property Category</h3>
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
                    <span className="text-[11px] font-black uppercase tracking-tight">{type}</span>
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



