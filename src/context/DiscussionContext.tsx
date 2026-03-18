'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { InquiryModal } from '@/components/InquiryModal';
import { SelectionBottomSheet } from '@/components/SelectionBottomSheet';

interface DiscussionContextType {
  cartItems: string[];
  savedIds: string[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  inquiries: Record<string, string>;
  inquiryProperty: any | null;
  setInquiryProperty: (property: any | null) => void;
  updateInquiry: (id: string, question: string) => void;
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
  confirmAddToCart: (id: string, question: string) => void;
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (open: boolean) => void;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

const CART_KEY = 'dealer_network_discussion_cart';
const SAVED_KEY = 'dealer_network_saved_properties';
const CITY_KEY = 'dealer_network_selected_city';
const INQUIRIES_KEY = 'dealer_network_inquiries';

export function DiscussionProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Panipat');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeSelectionSheet, setActiveSelectionSheet] = useState<'budget' | 'type' | 'area' | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [inquiries, setInquiries] = useState<Record<string, string>>({});
  const [inquiryProperty, setInquiryProperty] = useState<any | null>(null);

  // Initialize from localStorage on mount (to avoid SSR mismatch)
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    const savedProps = localStorage.getItem(SAVED_KEY);
    const savedCity = localStorage.getItem(CITY_KEY);
    const savedInquiries = localStorage.getItem(INQUIRIES_KEY);
    
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
      try { setInquiries(JSON.parse(savedInquiries)); } catch (e) { console.error(e); }
    }

    // Check for shared cart in URL
    const searchParams = new URLSearchParams(window.location.search);
    const sharedCart = searchParams.get('cart');
    
    if (sharedCart) {
      try {
        const ids = sharedCart.split(',').filter(id => id.trim() !== '');
        if (ids.length > 0) {
          setCartItems(ids);
          // Remove the cart param from URL to prevent accidental overrides on refresh
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

  const addToCart = (property: any) => {
    const id = typeof property === 'string' ? property : property.property_id;
    if (!cartItems.includes(id)) {
      setInquiryProperty(property);
    }
  };

  const confirmAddToCart = (id: string, question: string) => {
    if (!cartItems.includes(id)) {
      setCartItems(prev => [...prev, id]);
    }
    setInquiries(prev => ({ ...prev, [id]: question }));
    setInquiryProperty(null);
  };

  const updateInquiry = (id: string, question: string) => {
    setInquiries(prev => ({ ...prev, [id]: question }));
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
    }}>
      {children}
      <InquiryModal />
      
      {/* Global Selection Sheets - Managed by context but need props from caller if we want to sync state */}
      {/* NOTE: We'll keep the actual SelectionBottomSheet components in Navbar for now as it holds the search state, 
          OR we move search state here too. Let's move them to Navbar but use context to trigger. */}
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
