'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Calculator, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const SUGGESTIONS = [
  "Panipat", "Pune", "Mumbai", "Bangalore", 
  "Sector 18", "Tdi City", "Ansal", "Sector 13-17", "Sector 25", 
  "Krishna Garden", "Pbm Enclave", "Dlf", "Emperium City"
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: 0 },
  { label: "Under 50 L", value: 50 },
  { label: "Under 1 Cr", value: 100 },
  { label: "Under 2 Cr", value: 200 },
  { label: "Under 5 Cr", value: 500 },
  { label: "Under 10 Cr", value: 1000 },
];

export function HomeSearch() {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const router = useRouter();
  
  const suggestionRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = SUGGESTIONS.filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (budgetRef.current && !budgetRef.current.contains(event.target as Node)) {
        setShowBudgetDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    // In a real app, this would filter the PropertyGrid
    // For now, we scroll to grid or just simulate
    const grid = document.getElementById('property-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-12 w-full max-w-3xl">
      <div className="relative overflow-visible rounded-3xl bg-white p-2 shadow-2xl shadow-black/10">
        <div className="flex flex-col gap-2 sm:flex-row">
          
          {/* City/Area Input */}
          <div className="relative flex flex-1 items-center gap-3 px-4 py-3" ref={suggestionRef}>
            <MapPin className="h-5 w-5 text-zinc-400" />
            <div className="flex-1">
              <input 
                type="text" 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search City or Area..." 
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-zinc-400"
              />
            </div>
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-black">
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Suggestions Popover */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl"
                >
                  {filteredSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(s);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-zinc-50"
                    >
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-px w-full bg-zinc-100 sm:h-auto sm:w-px" />

          {/* Budget Dropdown */}
          <div className="relative flex flex-1 items-center gap-3 px-4 py-3" ref={budgetRef}>
            <Calculator className="h-5 w-5 text-zinc-400" />
            <button 
              onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
              className="flex flex-1 items-center justify-between text-sm font-bold text-zinc-900"
            >
              <span>{budget.label}</span>
            </button>

            <AnimatePresence>
              {showBudgetDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl"
                >
                  {BUDGET_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setBudget(opt);
                        setShowBudgetDropdown(false);
                      }}
                      className="flex w-full items-center px-4 py-3 text-left text-sm font-medium hover:bg-zinc-50"
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleSearch}
            className="flex h-14 items-center justify-center rounded-2xl bg-black px-8 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95 sm:h-auto"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
