'use client';

import Link from 'next/link';
import { Heart, Home, Menu, ShoppingCart, User, LogOut, ChevronDown, MapPin, Building2, Trees, Globe } from 'lucide-react';
import { useDiscussion } from '@/context/DiscussionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { HeaderSearch } from './HeaderSearch';
import { FilterModal } from './FilterModal';
import { useCallback } from 'react';

export default function Navbar() {
  const { savedIds, cartItems, selectedCity, setSelectedCity, isFilterModalOpen, setIsFilterModalOpen } = useDiscussion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isForceExpanded, setIsForceExpanded] = useState(false);
  const [initialSegment, setInitialSegment] = useState<string | null>(null);
  const [isOtherCityDropdownOpen, setIsOtherCityDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const otherCityDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';
  const OTHER_CITIES = [
    "Pune", "Mumbai", "Bangalore", "Delhi NCR", "Hyderabad"
  ];
  const shouldShowCompact = (isScrolled || !isHomePage) && !isForceExpanded;

  // Search state
  const [query, setQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [budget, setBudget] = useState({ label: "Any Budget", value: 0 });
  const [propertyType, setPropertyType] = useState("Any Type");
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsForceExpanded(false);
        setInitialSegment(null);
      }
      if (otherCityDropdownRef.current && !otherCityDropdownRef.current.contains(event.target as Node)) {
        setIsOtherCityDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (query) params.set('area', query);
    if (keywords) params.set('keywords', keywords);
    if (budget.value > 0) params.set('budget', budget.label);
    if (propertyType !== "Any Type") params.set('type', propertyType);
    if (minSize) params.set('minSize', minSize);
    if (maxSize) params.set('maxSize', maxSize);
    if (selectedHighlights.length > 0) params.set('highlights', selectedHighlights.join(','));

    router.push(`/explore?${params.toString()}`);
  }, [selectedCity, query, budget, propertyType, minSize, maxSize, selectedHighlights, router]);

  const searchProps = {
    city: selectedCity,
    query,
    setQuery,
    budget,
    setBudget,
    propertyType,
    setPropertyType,
    onOpenFilters: () => setIsFilterModalOpen(true)
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        shouldShowCompact 
          ? "border-b border-zinc-200 bg-white/95 backdrop-blur-xl py-3 shadow-sm" 
          : "bg-white py-4 sm:py-6"
      )}>
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          {/* Top Row: Logo, Center (Tabs/Search), and Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Left Section: Logo */}
            <div className="flex flex-1 items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 shadow-lg shadow-black/10 transition-transform group-hover:scale-105">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-zinc-900 hidden lg:block">
                  My<span className="text-zinc-400 font-medium">Listing</span>
                </span>
              </Link>
            </div>

            {/* Middle Section: Airbnb-style Tabs or Compact Search */}
            <div className="flex-[2] flex justify-center items-center">
                <AnimatePresence mode="wait">
                  {shouldShowCompact ? (
                    <div className="w-full max-w-md z-20" key="compact-search">
                      <HeaderSearch 
                        isScrolled={true} 
                        {...searchProps} 
                        onExpand={(segment) => {
                          setInitialSegment(segment || null);
                          setIsForceExpanded(true);
                        }}
                      />
                    </div>
                  ) : (
                    <motion.div
                      key="city-tabs"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex items-center justify-center gap-1 sm:gap-2"
                    >
                    <button 
                      onClick={() => setSelectedCity("Panipat")}
                      className={cn(
                        "group relative flex flex-col items-center gap-1 px-6 py-1 transition-all",
                        selectedCity === "Panipat" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                      )}
                    >
                      <Building2 className={cn("h-5 w-5 transition-transform group-hover:scale-110", selectedCity === "Panipat" ? "text-zinc-900" : "text-zinc-300")} />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Panipat</span>
                      {selectedCity === "Panipat" && (
                        <div 
                          className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-zinc-900 rounded-full"
                        />
                      )}
                    </button>
                    <button 
                      onClick={() => setSelectedCity("Karnal")}
                      className={cn(
                        "group relative flex flex-col items-center gap-1 px-6 py-1 transition-all",
                        selectedCity === "Karnal" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                      )}
                    >
                      <Trees className={cn("h-5 w-5 transition-transform group-hover:scale-110", selectedCity === "Karnal" ? "text-zinc-900" : "text-zinc-300")} />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Karnal</span>
                      {selectedCity === "Karnal" && (
                        <div 
                          className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-zinc-900 rounded-full"
                        />
                      )}
                    </button>
                    <div className="relative" ref={otherCityDropdownRef}>
                      <button 
                        onClick={() => setIsOtherCityDropdownOpen(!isOtherCityDropdownOpen)}
                        className={cn(
                          "group relative flex flex-col items-center gap-1 px-6 py-1 transition-all",
                          OTHER_CITIES.includes(selectedCity) ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                        )}
                      >
                        <Globe className={cn("h-5 w-5 transition-transform group-hover:scale-110", OTHER_CITIES.includes(selectedCity) ? "text-zinc-900" : "text-zinc-300")} />
                        <div className="relative flex items-center justify-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] leading-none">
                            {OTHER_CITIES.includes(selectedCity) ? selectedCity : "Other"}
                          </span>
                          <ChevronDown className={cn(
                            "absolute left-full ml-1 mb-0.5 h-3 w-3 transition-transform text-zinc-400 group-hover:text-zinc-600", 
                            isOtherCityDropdownOpen && "rotate-180"
                          )} />
                        </div>
                        {OTHER_CITIES.includes(selectedCity) && (
                          <div 
                            className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-zinc-900 rounded-full"
                          />
                        )}
                      </button>
                      <AnimatePresence>
                        {isOtherCityDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-1/2 top-full z-[70] mt-4 w-48 -translate-x-1/2 overflow-hidden rounded-3xl border border-zinc-100 bg-white p-1 shadow-2xl"
                          >
                            {OTHER_CITIES.map((city) => (
                              <button
                                key={city}
                                onClick={() => {
                                  setSelectedCity(city);
                                  setIsOtherCityDropdownOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-zinc-50 rounded-2xl",
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Section: Actions */}
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
              <Link 
                href="/sell" 
                className="hidden xl:block rounded-full px-4 py-2 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                Sell Property
              </Link>

              <div className="relative" ref={menuRef}>
                <div 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white p-1.5 pl-3 transition-shadow hover:shadow-md cursor-pointer ml-1"
                >
                  <Menu className="h-4 w-4 text-zinc-600" />
                  <Link href="/discussion-cart" onClick={(e) => e.stopPropagation()}>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                      <ShoppingCart className="h-4 w-4 text-zinc-300" />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 border border-white text-[8px] font-bold text-white">
                          {cartItems.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full z-[60] mt-4 w-64 overflow-hidden rounded-3xl border border-zinc-100 bg-white p-2 shadow-2xl"
                    >
                      <div className="py-2">
                        <Link 
                          href="/sell" 
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Home className="h-4 w-4 text-zinc-400" />
                          List your property
                        </Link>
                        <Link 
                          href="/favorites" 
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 text-zinc-400" />
                          Saved properties
                        </Link>
                        <Link 
                          href="/discussion-cart" 
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShoppingCart className="h-4 w-4 text-zinc-400" />
                          Discussion cart
                        </Link>
                      </div>
                      <div className="h-px bg-zinc-100 mx-2 my-1" />
                      <div className="py-2">
                        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors hover:bg-zinc-50">
                          <User className="h-4 w-4" />
                          Account Settings
                        </button>
                        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom Row: Large Search */}
          <AnimatePresence>
            {!shouldShowCompact && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex justify-center w-full"
              >
                <div
                  className="mt-8 pb-4 w-full max-w-3xl z-10"
                  ref={searchContainerRef}
                >
                  <div className="flex flex-col items-center">
                    <br />
                    <br />
                    <HeaderSearch isScrolled={false} {...searchProps} initialSegment={initialSegment} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        keywords={keywords}
        setKeywords={setKeywords}
        minSize={minSize}
        setMinSize={setMinSize}
        maxSize={maxSize}
        setMaxSize={setMaxSize}
        selectedHighlights={selectedHighlights}
        setSelectedHighlights={setSelectedHighlights}
        onApply={handleApplyFilters}
      />
    </>
  );
}
