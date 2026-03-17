'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CITIES = [
  "Panipat",
  "Karnal",
  "Pune",
  "Mumbai",
  "Bangalore",
  "Delhi NCR",
  "Hyderabad"
];

export function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-100"
      >
        <MapPin className="h-3.5 w-3.5 text-rose-500" />
        <span>{selectedCity}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-full z-[60] mt-2 w-48 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1 shadow-2xl"
          >
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-zinc-50 rounded-xl",
                  selectedCity === city ? "text-rose-500 bg-rose-50/50" : "text-zinc-600"
                )}
              >
                {city}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
