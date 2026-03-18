'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { InquiryModal } from '@/components/InquiryModal';
import { SelectionBottomSheet } from '@/components/SelectionBottomSheet';

export interface InquiryData {
  wantSiteVisit: boolean;
  interestedInPurchase: boolean;
  haveQuestion: boolean;
  question: string;
}

interface DiscussionContextType {
  cartItems: string[];
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
  addToCart: (property: any) => void;
  removeFromCart: (id: string) => void;
  toggleSave: (id: string) => void;
  isInCart: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  clearCart: () => void;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
  activeSelectionSheet: 'budget' | 'type' | 'area' | null;
  setActiveSelectionSheet: (type: 'budget' | 'type' | 'area' | null) => void;
  confirmAddToCart: (id: string, inquiryData: InquiryData) => void;
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (open: boolean) => void;
  userLocation: {lat: number, lng: number, isFallback?: boolean} | null;
  setUserLocation: (loc: {lat: number, lng: number, isFallback?: boolean} | null) => void;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

const CART_KEY = 'dealer_network_discussion_cart';
const SAVED_KEY = 'dealer_network_saved_properties';
const CITY_KEY = 'dealer_network_selected_city';
const FILTERS_KEY = 'dealer_network_global_filters';
const INQUIRIES_KEY = 'dealer_network_inquiries';

export function DiscussionProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
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
      try { setCartItems(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    if (savedProps) {
      try { setSavedIds(JSON.parse(savedProps)); } catch (e) { console.error(e); }
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
    
    // Check for shared cart in URL
    const searchParams = new URLSearchParams(window.location.search);
    const sharedCart = searchParams.get('cart');
    
    if (sharedCart) {
      try {
        const ids = sharedCart.split(',').filter(id => id.trim() !== '');
        if (ids.length > 0) {
          setCartItems(ids);
          const newRelativePathQuery = window.location.pathname;
          window.history.replaceState(null, '', newRelativePathQuery);
        }
      } catch (e) {
        console.error('Failed to parse shared cart', e);
      }
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem(CART_KEY)) {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (savedIds.length > 0 || localStorage.getItem(SAVED_KEY)) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    }
  }, [savedIds]);

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

  const addToCart = (property: any) => {
    const id = typeof property === 'string' ? property : property.property_id;
    if (!cartItems.includes(id)) {
      setInquiryProperty(property);
    }
  };

  const confirmAddToCart = (id: string, inquiryData: InquiryData) => {
    if (!cartItems.includes(id)) {
      setCartItems(prev => [...prev, id]);
    }
    setInquiries(prev => ({ ...prev, [id]: inquiryData }));
    setInquiryProperty(null);
  };

  const updateInquiry = (id: string, inquiryData: InquiryData) => {
    setInquiries(prev => ({ ...prev, [id]: inquiryData }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item !== id));
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

  const isInCart = (id: string) => cartItems.includes(id);
  const isSaved = (id: string) => savedIds.includes(id);
  const clearCart = () => {
    setCartItems([]);
    setInquiries({});
  };

  return (
    <DiscussionContext.Provider value={{
      cartItems,
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
      addToCart,
      removeFromCart,
      toggleSave,
      isInCart,
      isSaved,
      clearCart,
      isFilterModalOpen,
      setIsFilterModalOpen,
      activeSelectionSheet,
      setActiveSelectionSheet,
      inquiries,
      inquiryProperty,
      setInquiryProperty,
      updateInquiry,
      confirmAddToCart,
      isMobileSearchOpen,
      setIsMobileSearchOpen,
      userLocation,
      setUserLocation,
    }}>
      {children}
      <InquiryModal />
    </DiscussionContext.Provider>
  );
}

export function useDiscussion() {
  const context = useContext(DiscussionContext);
  if (context === undefined) {
    throw new Error('useDiscussion must be used within a DiscussionProvider');
  }
  return context;
}
