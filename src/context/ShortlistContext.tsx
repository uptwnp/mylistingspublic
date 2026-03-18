'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { SelectionBottomSheet } from '@/components/SelectionBottomSheet';

export interface InquiryData {
  wantSiteVisit: boolean;
  interestedInPurchase: boolean;
  haveQuestion: boolean;
  question: string;
}

interface ShortlistContextType {
  shortlistItems: string[];
  savedIds: string[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  // Global search filters
  query: string;
  setQuery: (q: string) => void;
  budget: { label: string; value: number };
  setBudget: (b: { label: string; value: number }) => void;
  propertyType: string;
  setPropertyType: (t: string) => void;
  keywords: string;
  setKeywords: (k: string) => void;
  minSize: string;
  setMinSize: (s: string) => void;
  maxSize: string;
  setMaxSize: (s: string) => void;
  selectedHighlights: string[];
  setSelectedHighlights: (h: string[]) => void;
  clearFilters: () => void;
  
  inquiries: Record<string, InquiryData>;
  inquiryProperty: any | null;
  setInquiryProperty: (property: any | null) => void;
  updateInquiry: (id: string, inquiryData: InquiryData) => void;
  addToShortlist: (property: any) => void;
  removeFromShortlist: (id: string) => void;
  toggleSave: (id: string) => void;
  isInShortlist: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  clearShortlist: () => void;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
  activeSelectionSheet: 'budget' | 'type' | 'area' | null;
  setActiveSelectionSheet: (type: 'budget' | 'type' | 'area' | null) => void;
  confirmAddToShortlist: (id: string, inquiryData: InquiryData) => void;
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (open: boolean) => void;
  userLocation: {lat: number, lng: number, isFallback?: boolean} | null;
  setUserLocation: (loc: {lat: number, lng: number, isFallback?: boolean} | null) => void;
  recentlyVisitedIds: string[];
  addRecentlyVisited: (id: string) => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

const CART_KEY = 'dealer_network_shortlist';
const SAVED_KEY = 'dealer_network_saved_properties';
const CITY_KEY = 'dealer_network_selected_city';
const FILTERS_KEY = 'dealer_network_global_filters';
const INQUIRIES_KEY = 'dealer_network_inquiries';
const RECENT_KEY = 'dealer_network_recently_visited';

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [shortlistItems, setShortlistItems] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recentlyVisitedIds, setRecentlyVisitedIds] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Panipat');
  
  // Search state
  const [query, setQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [budget, setBudget] = useState({ label: "Any Budget", value: 0 });
  const [propertyType, setPropertyType] = useState("Any Type");
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeSelectionSheet, setActiveSelectionSheet] = useState<'budget' | 'type' | 'area' | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [inquiries, setInquiries] = useState<Record<string, InquiryData>>({});
  const [inquiryProperty, setInquiryProperty] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, isFallback?: boolean} | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    const savedProps = localStorage.getItem(SAVED_KEY);
    const savedCity = localStorage.getItem(CITY_KEY);
    const savedInquiries = localStorage.getItem(INQUIRIES_KEY);
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    
    if (savedCart) {
      try { setShortlistItems(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    if (savedProps) {
      try { setSavedIds(JSON.parse(savedProps)); } catch (e) { console.error(e); }
    }
    const savedRecent = localStorage.getItem(RECENT_KEY);
    if (savedRecent) {
      try { setRecentlyVisitedIds(JSON.parse(savedRecent)); } catch (e) { console.error(e); }
    }
    if (savedCity) {
      setSelectedCity(savedCity);
    }
    if (savedInquiries) {
      try { 
        const parsed = JSON.parse(savedInquiries);
        // Migration logic for old string-based inquiries
        const migrated: Record<string, InquiryData> = {};
        Object.entries(parsed).forEach(([id, val]) => {
          if (typeof val === 'string') {
            migrated[id] = {
              wantSiteVisit: false,
              interestedInPurchase: false,
              haveQuestion: true,
              question: val
            };
          } else {
            migrated[id] = val as InquiryData;
          }
        });
        setInquiries(migrated);
      } catch (e) { console.error(e); }
    }
    if (savedFilters) {
      try { 
        const f = JSON.parse(savedFilters);
        if (f.query !== undefined) setQuery(f.query);
        if (f.keywords !== undefined) setKeywords(f.keywords);
        if (f.budget !== undefined) setBudget(f.budget);
        if (f.propertyType !== undefined) setPropertyType(f.propertyType);
        if (f.minSize !== undefined) setMinSize(f.minSize);
        if (f.maxSize !== undefined) setMaxSize(f.maxSize);
        if (f.selectedHighlights !== undefined) setSelectedHighlights(f.selectedHighlights);
      } catch (e) { console.error(e); }
    }
    
    // Check for shared shortlist in URL
    const searchParams = new URLSearchParams(window.location.search);
    const sharedShortlist = searchParams.get('shortlist');
    
    if (sharedShortlist) {
      try {
        const ids = sharedShortlist.split(',').filter(id => id.trim() !== '');
        if (ids.length > 0) {
          setShortlistItems(ids);
          const newRelativePathQuery = window.location.pathname;
          window.history.replaceState(null, '', newRelativePathQuery);
        }
      } catch (e) {
        console.error('Failed to parse shared shortlist', e);
      }
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (shortlistItems.length > 0 || localStorage.getItem(CART_KEY)) {
      localStorage.setItem(CART_KEY, JSON.stringify(shortlistItems));
    }
  }, [shortlistItems]);

  useEffect(() => {
    if (savedIds.length > 0 || localStorage.getItem(SAVED_KEY)) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    }
  }, [savedIds]);

  useEffect(() => {
    if (recentlyVisitedIds.length > 0 || localStorage.getItem(RECENT_KEY)) {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyVisitedIds));
    }
  }, [recentlyVisitedIds]);

  useEffect(() => {
    localStorage.setItem(CITY_KEY, selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  }, [inquiries]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      query,
      keywords,
      budget,
      propertyType,
      minSize,
      maxSize,
      selectedHighlights
    };
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [query, keywords, budget, propertyType, minSize, maxSize, selectedHighlights]);

  const clearFilters = () => {
    setQuery('');
    setKeywords('');
    setBudget({ label: "Any Budget", value: 0 });
    setPropertyType("Any Type");
    setMinSize('');
    setMaxSize('');
    setSelectedHighlights([]);
  };

  const addToShortlist = (property: any) => {
    const id = typeof property === 'string' ? property : property.property_id;
    if (!shortlistItems.includes(id)) {
      setShortlistItems(prev => [...prev, id]);
    }
  };

  const confirmAddToShortlist = (id: string, inquiryData: InquiryData) => {
    if (!shortlistItems.includes(id)) {
      setShortlistItems(prev => [...prev, id]);
    }
    setInquiries(prev => ({ ...prev, [id]: inquiryData }));
    setInquiryProperty(null);
  };

  const updateInquiry = (id: string, inquiryData: InquiryData) => {
    setInquiries(prev => ({ ...prev, [id]: inquiryData }));
  };

  const removeFromShortlist = (id: string) => {
    setShortlistItems(prev => prev.filter(item => item !== id));
    setInquiries(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const isInShortlist = (id: string) => shortlistItems.includes(id);
  const isSaved = (id: string) => savedIds.includes(id);
  const clearShortlist = () => {
    setShortlistItems([]);
    setInquiries({});
  };

  const addRecentlyVisited = (id: string) => {
    setRecentlyVisitedIds(prev => {
      const filtered = prev.filter(item => item !== id);
      return [id, ...filtered].slice(0, 10); // Keep latest 10
    });
  };

  return (
    <ShortlistContext.Provider value={{
      shortlistItems,
      savedIds,
      selectedCity,
      setSelectedCity,
      query,
      setQuery,
      budget,
      setBudget,
      propertyType,
      setPropertyType,
      keywords,
      setKeywords,
      minSize,
      setMinSize,
      maxSize,
      setMaxSize,
      selectedHighlights,
      setSelectedHighlights,
      clearFilters,
      addToShortlist,
      removeFromShortlist,
      toggleSave,
      isInShortlist,
      isSaved,
      clearShortlist,
      recentlyVisitedIds,
      addRecentlyVisited,
      isFilterModalOpen,
      setIsFilterModalOpen,
      activeSelectionSheet,
      setActiveSelectionSheet,
      inquiries,
      inquiryProperty,
      setInquiryProperty,
      updateInquiry,
      confirmAddToShortlist,
      isMobileSearchOpen,
      setIsMobileSearchOpen,
      userLocation,
      setUserLocation,
    }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (context === undefined) {
    throw new Error('useShortlist must be used within a ShortlistProvider');
  }
  return context;
}
