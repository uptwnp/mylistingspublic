'use client';

import Link from 'next/link';
import { Heart, Home, Menu, ShoppingCart, User, LogOut, ChevronDown, MapPin, Building2, Trees, Globe, SlidersHorizontal, Search, Store, X, Wallet } from 'lucide-react';
import { useDiscussion } from '@/context/DiscussionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HeaderSearch, BUDGET_OPTIONS } from './HeaderSearch';
import { FilterModal } from './FilterModal';
import { SelectionBottomSheet } from './SelectionBottomSheet';
import { useCallback } from 'react';

export default function Navbar() {
  const { savedIds, cartItems, selectedCity, setSelectedCity, isFilterModalOpen, setIsFilterModalOpen, activeSelectionSheet, setActiveSelectionSheet, isMobileSearchOpen, setIsMobileSearchOpen } = useDiscussion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isForceExpanded, setIsForceExpanded] = useState(false);

  const [initialSegment, setInitialSegment] = useState<string | null>(null);
  const [isOtherCityDropdownOpen, setIsOtherCityDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const otherCityDropdownRef = useRef<HTMLDivElement>(null);
  const mobileOtherCityDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isHomePage = pathname === '/';
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const OTHER_CITIES = [
    "Sonipat", "Delhi NCR", "Gurgaon", "Noida", "Rohtak"
  ];

  useEffect(() => {
    async function loadAreas() {
      const { getAreas } = await import('@/lib/supabase');
      const areas = await getAreas(selectedCity);
      setAllAreas(areas);
    }
    loadAreas();
  }, [selectedCity]);
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
      const clickedOutsideOtherCity = (!otherCityDropdownRef.current || !otherCityDropdownRef.current.contains(event.target as Node)) && 
                                      (!mobileOtherCityDropdownRef.current || !mobileOtherCityDropdownRef.current.contains(event.target as Node));
      
      if (clickedOutsideOtherCity) {
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
  }, [selectedCity, query, keywords, budget, propertyType, minSize, maxSize, selectedHighlights, router, pathname]);

  // Sync search state from URL
  useEffect(() => {
    // Only sync if we're on the /explore page or it's a direct URL hit
    // This prevents clearing state when navigating back to Home
    
    const area = searchParams.get('area') || '';
    if (area !== query) setQuery(area);

    const budgetLabel = searchParams.get('budget') || 'Any Budget';
    const foundBudget = BUDGET_OPTIONS.find(opt => opt.label === budgetLabel) || BUDGET_OPTIONS[0];
    if (foundBudget.label !== budget.label) setBudget(foundBudget);

    const type = searchParams.get('type') || 'Any Type';
    if (type !== propertyType) setPropertyType(type);

    const kw = searchParams.get('keywords') || '';
    if (kw !== keywords) setKeywords(kw);

    const min = searchParams.get('minSize') || '';
    if (min !== minSize) setMinSize(min);

    const max = searchParams.get('maxSize') || '';
    if (max !== maxSize) setMaxSize(max);

    const hParams = searchParams.get('highlights') || '';
    const hArray = hParams ? hParams.split(',') : [];
    if (JSON.stringify(hArray) !== JSON.stringify(selectedHighlights)) {
      setSelectedHighlights(hArray);
    }
    
    const city = searchParams.get('city');
    if (city && city !== selectedCity) {
      setSelectedCity(city);
    }
  }, [searchParams]);

  // Auto-apply when on Explore page
  useEffect(() => {
    if (pathname === '/explore') {
      // Avoid recursive updates: only push if state changed from URL
      const areaInUrl = searchParams.get('area') || '';
      const budgetInUrl = searchParams.get('budget') || 'Any Budget';
      const typeInUrl = searchParams.get('type') || 'Any Type';
      const keywordsInUrl = searchParams.get('keywords') || '';
      const minSizeInUrl = searchParams.get('minSize') || '';
      const maxSizeInUrl = searchParams.get('maxSize') || '';
      const highlightsInUrl = searchParams.get('highlights') || '';
      
      const isDifferent = 
        query !== areaInUrl || 
        budget.label !== budgetInUrl || 
        propertyType !== typeInUrl ||
        keywords !== keywordsInUrl ||
        minSize !== minSizeInUrl ||
        maxSize !== maxSizeInUrl ||
        selectedHighlights.join(',') !== highlightsInUrl;
        
      if (isDifferent) {
        handleApplyFilters();
      }
    }
  }, [budget, propertyType, query, keywords, minSize, maxSize, selectedHighlights, handleApplyFilters, pathname]);

  const searchProps = {
    city: selectedCity,
    query,
    setQuery,
    budget,
    setBudget,
    propertyType,
    setPropertyType,
    onOpenFilters: () => setIsFilterModalOpen(true),
    onSearch: () => {
      setIsForceExpanded(false);
      if (pathname !== '/explore') {
        handleApplyFilters();
      }
    }
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        shouldShowCompact 
          ? "border-b border-zinc-200 bg-white/95 backdrop-blur-xl py-3 shadow-sm" 
          : "bg-white py-4 sm:py-6"
      )}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          {/* Top Row: Logo, Center (Tabs/Search), and Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Left Section: Logo & Mobile Search Trigger */}
            <div className="flex flex-1 items-center gap-3 sm:gap-6 min-w-0">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-zinc-900 shadow-lg shadow-black/10 transition-transform group-hover:scale-105">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className={cn(
                  "ty-subtitle font-bold tracking-tighter text-zinc-900 truncate",
                  shouldShowCompact ? "hidden lg:block" : "block"
                )}>
                  My<span className="text-zinc-400 font-medium">Listing</span>
                </span>
              </Link>

              {/* Mobile Search Pill - Visible on scroll or subpages */}
              {shouldShowCompact && (
                <div className="sm:hidden flex-1 px-2">
                  <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="flex w-full items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2.5 shadow-md shadow-zinc-200/50 hover:shadow-lg transition-all"
                  >
                    <Search className="h-4 w-4 text-zinc-900" strokeWidth={3} />
                    <span className="ty-caption font-black text-zinc-900 truncate tracking-tight">
                      {query ? `${query}, ${selectedCity}` : selectedCity}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Middle Section: Desktop Tabs or Compact Search */}
            <div className="flex-[3] flex justify-center items-center min-w-0">
                <AnimatePresence mode="wait">
                  {shouldShowCompact ? (
                    <div className="w-full max-w-md z-20 hidden sm:block" key="compact-search">
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="hidden sm:flex items-center justify-center gap-1 max-w-[calc(100vw-140px)] px-2 sm:max-w-none sm:px-0"
                    >
                    <button 
                      onClick={() => setSelectedCity("Panipat")}
                      className={cn(
                        "group relative flex flex-col items-center gap-1 px-4 sm:px-6 py-1 transition-all shrink-0",
                        selectedCity === "Panipat" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                      )}
                    >
                      <Building2 className={cn("h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110", selectedCity === "Panipat" ? "text-zinc-900" : "text-zinc-300")} />
                      <span className="ty-micro font-bold">Panipat</span>
                      {selectedCity === "Panipat" && (
                        <div 
                          className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-zinc-900 rounded-full"
                        />
                      )}
                    </button>
                    <button 
                      onClick={() => setSelectedCity("Karnal")}
                      className={cn(
                        "group relative flex flex-col items-center gap-1 px-4 sm:px-6 py-1 transition-all shrink-0",
                        selectedCity === "Karnal" ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                      )}
                    >
                      <Trees className={cn("h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110", selectedCity === "Karnal" ? "text-zinc-900" : "text-zinc-300")} />
                      <span className="ty-micro font-bold">Karnal</span>
                      {selectedCity === "Karnal" && (
                        <div 
                          className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-zinc-900 rounded-full"
                        />
                      )}
                    </button>
                    <div className="relative shrink-0" ref={otherCityDropdownRef}>
                      <button 
                        onClick={() => setIsOtherCityDropdownOpen(!isOtherCityDropdownOpen)}
                        className={cn(
                          "group relative flex flex-col items-center gap-1 px-4 sm:px-6 py-1 transition-all",
                          OTHER_CITIES.includes(selectedCity) ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                        )}
                      >
                        <Globe className={cn("h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110", OTHER_CITIES.includes(selectedCity) ? "text-zinc-900" : "text-zinc-300")} />
                        <div className="relative flex items-center justify-center">
                          <span className="ty-micro font-bold leading-none">
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
                                library-key={city}
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
                className="hidden xl:block rounded-full px-4 py-2 ty-caption font-bold text-zinc-900 transition-colors hover:bg-zinc-100"
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
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 border border-white ty-micro font-bold text-white">
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
                          className="flex items-center gap-3 px-4 py-3 ty-caption font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Home className="h-4 w-4 text-zinc-400" />
                          List your property
                        </Link>
                        <Link 
                          href="/favorites" 
                          className="flex items-center gap-3 px-4 py-3 ty-caption font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 text-zinc-400" />
                          Saved properties
                        </Link>
                        <Link 
                          href="/discussion-cart" 
                          className="flex items-center gap-3 px-4 py-3 ty-caption font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShoppingCart className="h-4 w-4 text-zinc-400" />
                          Discussion cart
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom Row / Hero Content */}
          <AnimatePresence>
            {!shouldShowCompact && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="hidden sm:flex items-center justify-center w-full"
              >
                <div
                  className="mt-4 sm:mt-24 pb-6 sm:pb-8 w-full max-w-5xl z-20"
                  ref={searchContainerRef}
                >


                  <div className="flex flex-col items-center">
                    {/* Shown on desktop */}
                    <div className="hidden sm:block w-full">
                      <HeaderSearch isScrolled={false} {...searchProps} initialSegment={initialSegment} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Full-Screen Mobile Search Overlay - Airbnb Style */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[1000] flex flex-col bg-white sm:hidden"
          >
            {/* Overlay Top Bar */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-50">
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 text-zinc-900 shadow-sm transition-all active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-4">
                {["Panipat", "Karnal", "Other"].map((city) => {
                  const isActive = (city === "Other" && OTHER_CITIES.includes(selectedCity)) || selectedCity === city;
                  return (
                    <div key={city} className="relative" ref={city === "Other" ? mobileOtherCityDropdownRef : null}>
                      <button
                        onClick={() => {
                          if (city === "Other") {
                            setIsOtherCityDropdownOpen(!isOtherCityDropdownOpen);
                          } else {
                            setSelectedCity(city);
                            setIsOtherCityDropdownOpen(false);
                          }
                        }}
                        className={cn(
                          "relative ty-caption font-black uppercase tracking-widest transition-colors pb-1.5",
                          isActive ? "text-zinc-900" : "text-zinc-400"
                        )}
                      >
                        {city === "Other" && OTHER_CITIES.includes(selectedCity) ? selectedCity : city}
                        {isActive && (
                          <motion.div layoutId="mobileOverlayCityActive" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
                        )}
                      </button>

                      {city === "Other" && (
                        <AnimatePresence>
                          {isOtherCityDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute left-1/2 top-full z-[1001] mt-2 w-40 -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1 shadow-2xl"
                            >
                              {OTHER_CITIES.map((otherCity) => (
                                <button
                                  key={otherCity}
                                  onClick={() => {
                                    setSelectedCity(otherCity);
                                    setIsOtherCityDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "flex w-full items-center px-4 py-2 text-left text-[10px] font-black uppercase tracking-wider transition-colors hover:bg-zinc-50 rounded-xl",
                                    selectedCity === otherCity ? "text-rose-500 bg-rose-50/50" : "text-zinc-600"
                                  )}
                                >
                                  {otherCity}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="w-10 opacity-0" /> {/* Spacer */}
            </div>

            {/* Overlay Content: Search Fields as Cards */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-zinc-50/50">
              <div className="flex flex-col gap-4">
                {/* Where Card */}
                <button 
                  onClick={() => setActiveSelectionSheet('area')}
                  className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/40 text-left transition-all active:scale-[0.98] active:bg-zinc-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="ty-title font-bold text-zinc-900">Where to?</h2>
                    <MapPin className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-base font-bold", !query ? "text-zinc-400" : "text-zinc-900")}>
                      {query || "Search areas..."}
                    </span>
                    <div className="h-4 w-px bg-zinc-200" />
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </div>
                </button>

                {/* Budget Card - OPTIONS SHOWN VIA BOTTOM SHEET */}
                <button 
                  onClick={() => setActiveSelectionSheet('budget')}
                  className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/40 text-left transition-all active:scale-[0.98] active:bg-zinc-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="ty-title font-bold text-zinc-900">What's your budget?</h2>
                    <Wallet className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-base font-bold", budget.label === "Any Budget" ? "text-zinc-400" : "text-zinc-900")}>
                      {budget.label === "Any Budget" ? "Select your price range" : budget.label}
                    </span>
                    <div className="h-4 w-px bg-zinc-200" />
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </div>
                </button>

                {/* Property Type Card - OPTIONS SHOWN VIA BOTTOM SHEET */}
                <button 
                  onClick={() => setActiveSelectionSheet('type')}
                  className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/40 text-left transition-all active:scale-[0.98] active:bg-zinc-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="ty-title font-bold text-zinc-900">Property type?</h2>
                    <Home className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-base font-bold", propertyType === "Any Type" ? "text-zinc-400" : "text-zinc-900")}>
                      {propertyType === "Any Type" ? "What are you looking for?" : propertyType}
                    </span>
                    <div className="h-4 w-px bg-zinc-200" />
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Overlay Bottom Bar */}
            <div className="border-t border-zinc-100 bg-white px-6 py-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
              <button 
                onClick={() => {
                  setQuery('');
                  setBudget({ label: "Any Budget", value: 0 });
                  setPropertyType("Any Type");
                }}
                className="ty-caption font-black text-zinc-900 underline underline-offset-4"
              >
                Clear all
              </button>
              <button 
                onClick={() => {
                  handleApplyFilters();
                  setIsMobileSearchOpen(false);
                }}
                className="flex items-center gap-2 rounded-full bg-rose-500 px-8 py-3.5 ty-caption font-black text-white shadow-xl shadow-rose-200 transition-all active:scale-95"
              >
                <Search className="h-4 w-4" strokeWidth={3} />
                <span>Search</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <SelectionBottomSheet
        isOpen={activeSelectionSheet === 'budget'}
        onClose={() => setActiveSelectionSheet(null)}
        title="Your Budget"
        type="budget"
        selectedValue={budget}
        onSelect={setBudget}
      />

      <SelectionBottomSheet
        isOpen={activeSelectionSheet === 'type'}
        onClose={() => setActiveSelectionSheet(null)}
        title="Property type?"
        type="propertyType"
        selectedValue={propertyType}
        onSelect={setPropertyType}
      />

      <SelectionBottomSheet
        isOpen={activeSelectionSheet === 'area'}
        onClose={() => setActiveSelectionSheet(null)}
        title="Where to?"
        type="area"
        selectedValue={query}
        onSelect={setQuery}
        data={allAreas}
      />

      {/* Fixed Bottom Category Filters (Mobile Only) */}
    </>
  );
}
