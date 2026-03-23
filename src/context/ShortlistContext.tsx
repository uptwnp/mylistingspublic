'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getAreaCenters } from '@/lib/supabase';
import { syncShortlistAction, submitConsultationRequestAction } from '@/app/actions/leads';

import { SelectionBottomSheet } from '@/components/SelectionBottomSheet';

export interface InquiryData {
  wantSiteVisit: boolean;
  interestedInPurchase: boolean;
  haveQuestion: boolean;
  question: string;
}

export interface ContactDetails {
  fullName: string;
  phoneNumber: string;
  alternateNumber?: string;
  address: string;
  email?: string;
  budget?: string;
}

export interface ConsultationRequest {
  id: string;
  type: 'phone' | 'home' | 'office' | 'site';
  propertyIds: string[];
  contactDetails: ContactDetails;
  preferredTime?: string;
  preferredDate?: string;
  isSyncEnabled: boolean;
  timestamp: number;
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
  sortField: string;
  setSortField: (f: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
  
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
  
  contactDetails: ContactDetails | null;
  setContactDetails: (details: ContactDetails) => void;
  isContactFormOpen: boolean;
  setIsContactFormOpen: (open: boolean) => void;
  requireContactDetails: (callback: () => void, force?: boolean) => void;
  
  consultationRequests: ConsultationRequest[];
  addConsultationRequest: (request: Omit<ConsultationRequest, 'id' | 'timestamp'>) => void;
  updateConsultationRequest: (id: string, updates: Partial<ConsultationRequest>) => void;
  removeConsultationRequest: (id: string) => void;
  areaCenters: any[];
  loadAreaCentersOnce: () => Promise<void>;
  closeAllModals: (skipHistory?: boolean) => void;
  isInitialized: boolean;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

const CART_KEY = 'dealer_network_shortlist';
const SAVED_KEY = 'dealer_network_saved_properties';
const CITY_KEY = 'dealer_network_selected_city';
const FILTERS_KEY = 'dealer_network_global_filters';
const INQUIRIES_KEY = 'dealer_network_inquiries';
const RECENT_KEY = 'dealer_network_recently_visited';
const CONTACT_KEY = 'dealer_network_contact_details';
const REQUESTS_KEY = 'dealer_network_consultation_requests';

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
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
  const [sortField, setSortField] = useState('approved_on');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeSelectionSheet, setActiveSelectionSheet] = useState<'budget' | 'type' | 'area' | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [inquiries, setInquiries] = useState<Record<string, InquiryData>>({});
  const [inquiryProperty, setInquiryProperty] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, isFallback?: boolean} | null>(null);
  
  const [contactDetails, setContactDetailsState] = useState<ContactDetails | null>(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [onContactSuccess, setOnContactSuccess] = useState<(() => void) | null>(null);

  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [areaCenters, setAreaCenters] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    const savedProps = localStorage.getItem(SAVED_KEY);
    const savedRecent = localStorage.getItem(RECENT_KEY);
    const savedCity = localStorage.getItem(CITY_KEY);
    const savedInquiries = localStorage.getItem(INQUIRIES_KEY);
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    const savedContact = localStorage.getItem(CONTACT_KEY);
    const savedRequests = localStorage.getItem(REQUESTS_KEY);
    
    if (savedCart) {
      try { setShortlistItems(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    if (savedProps) {
      try { setSavedIds(JSON.parse(savedProps)); } catch (e) { console.error(e); }
    }
    if (savedRecent) {
      try { setRecentlyVisitedIds(JSON.parse(savedRecent)); } catch (e) { console.error(e); }
    }
    if (savedCity) {
      setSelectedCity(savedCity);
    }
    if (savedInquiries) {
      try { 
        const parsed = JSON.parse(savedInquiries);
        const migrated: Record<string, InquiryData> = {};
        Object.entries(parsed).forEach(([id, val]) => {
          if (typeof val === 'string') {
            migrated[id] = { wantSiteVisit: false, interestedInPurchase: false, haveQuestion: true, question: val };
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
    if (savedContact) {
      try { setContactDetailsState(JSON.parse(savedContact)); } catch (e) { console.error(e); }
    }
    if (savedRequests) {
      try { setConsultationRequests(JSON.parse(savedRequests)); } catch (e) { console.error(e); }
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
    setMounted(true);
  }, []);

  const loadAreaCentersOnce = React.useCallback(async () => {
    if (areaCenters.length === 0) {
      const data = await getAreaCenters();
      if (data) setAreaCenters(data);
    }
  }, [areaCenters.length]);

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
    // Also set a cookie so the server can read it for pre-fetching
    if (typeof document !== 'undefined') {
      document.cookie = `${CITY_KEY}=${selectedCity}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(consultationRequests));
  }, [consultationRequests]);

  // Prevent background scrolling when any modal/overlay is open
  useEffect(() => {
    if (!mounted) return;
    
    const isAnyModalOpen = 
      isFilterModalOpen || 
      activeSelectionSheet !== null || 
      isMobileSearchOpen || 
      inquiryProperty !== null || 
      isContactFormOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mounted, isFilterModalOpen, activeSelectionSheet, isMobileSearchOpen, inquiryProperty, isContactFormOpen]);

  // Device back button support for modals
  const modalHistoryRef = useRef({ pushed: 0, isInternal: false });

  useEffect(() => {
    if (!mounted) return;

    const openModals = [
      isFilterModalOpen,
      activeSelectionSheet !== null,
      isMobileSearchOpen,
      inquiryProperty !== null,
      isContactFormOpen
    ].filter(Boolean).length;

    const handlePopState = (event: PopStateEvent) => {
      if (modalHistoryRef.current.isInternal) {
        modalHistoryRef.current.isInternal = false;
        return;
      }

      // If we land on a "modal" state but no modals are actually open, 
      // it means we're passing through a stale history state from a previous jump.
      // Automatically go back one more time to reach the original page.
      if (!openModals && event.state?.modal) {
        modalHistoryRef.current.isInternal = true;
        window.history.back();
        return;
      }

      // If browser back is pressed, close the "top-most" logical modal
      if (activeSelectionSheet) {
        setActiveSelectionSheet(null);
      } else if (isContactFormOpen) {
        setIsContactFormOpen(false);
      } else if (isFilterModalOpen) {
        setIsFilterModalOpen(false);
      } else if (isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      } else if (inquiryProperty) {
        setInquiryProperty(null);
      }
      
      modalHistoryRef.current.pushed = Math.max(0, modalHistoryRef.current.pushed - 1);
    };

    if (openModals > modalHistoryRef.current.pushed) {
      // Something opened, push a state
      window.history.pushState({ modal: true }, '');
      modalHistoryRef.current.pushed++;
    } else if (openModals < modalHistoryRef.current.pushed) {
      // Something closed manually, pop a state if we have any
      if (modalHistoryRef.current.pushed > 0) {
        // Only call back() if the current state is actually our modal state.
        // If the user has already navigated away (changing history state), calling back()
        // would reverse that navigation.
        if (typeof window !== 'undefined' && window.history.state?.modal === true) {
          modalHistoryRef.current.isInternal = true;
          window.history.back();
        }
        modalHistoryRef.current.pushed--;
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    mounted, 
    isFilterModalOpen, 
    activeSelectionSheet, 
    isMobileSearchOpen, 
    inquiryProperty, 
    isContactFormOpen
  ]);

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

  // Sync visitor data (shortlist, notes, contact) to Supabase Cloud
  useEffect(() => {
    if (contactDetails) {
      const sync = async () => {
        try {
          await syncShortlistAction(contactDetails, shortlistItems, inquiries);
        } catch (e) {
          console.error('Visitor sync failed:', e);
        }
      };
      
      const timer = setTimeout(sync, 1000); // Debounce sync
      return () => clearTimeout(timer);
    }
  }, [contactDetails, shortlistItems, inquiries]);

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

  const setContactDetails = (details: ContactDetails) => {
    setContactDetailsState(details);
    localStorage.setItem(CONTACT_KEY, JSON.stringify(details));
    if (onContactSuccess) {
      onContactSuccess();
      setOnContactSuccess(null);
    }
    setIsContactFormOpen(false);
  };

  const requireContactDetails = (callback: () => void, force?: boolean) => {
    if (contactDetails && !force) {
      callback();
    } else {
      setOnContactSuccess(() => callback);
      setIsContactFormOpen(true);
    }
  };

  const addConsultationRequest = (request: Omit<ConsultationRequest, 'id' | 'timestamp'>) => {
    const newRequest: ConsultationRequest = {
      ...request,
      isSyncEnabled: request.isSyncEnabled ?? false,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
    };
    setConsultationRequests([newRequest]);

    // Also sync to Supabase (Lead generation) via Server Action
    submitConsultationRequestAction(newRequest).catch(e => console.error('Supabase lead sync failed', e));
  };

  const updateConsultationRequest = (id: string, updates: Partial<ConsultationRequest>) => {
    setConsultationRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const closeAllModals = (skipHistory = false) => {
    if (skipHistory) {
      modalHistoryRef.current.pushed = 0;
    }
    setIsFilterModalOpen(false);
    setActiveSelectionSheet(null);
    setIsMobileSearchOpen(false);
    setInquiryProperty(null);
    setIsContactFormOpen(false);
  };

  const removeConsultationRequest = (id: string) => {
    setConsultationRequests(prev => prev.filter(r => r.id !== id));
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
      sortField,
      setSortField,
      sortOrder,
      setSortOrder,
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
      contactDetails,
      setContactDetails,
      isContactFormOpen,
      setIsContactFormOpen,
      requireContactDetails,
      consultationRequests,
      addConsultationRequest,
      updateConsultationRequest,
      removeConsultationRequest,
      areaCenters,
      loadAreaCentersOnce,
      closeAllModals,
      isInitialized: mounted,
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
