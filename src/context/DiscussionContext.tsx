'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DiscussionContextType {
  cartItems: string[];
  savedIds: string[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  toggleSave: (id: string) => void;
  isInCart: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  clearCart: () => void;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

const CART_KEY = 'dealer_network_discussion_cart';
const SAVED_KEY = 'dealer_network_saved_properties';

export function DiscussionProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load from localStorage and handle shared cart on mount
  useEffect(() => {
    // Check for shared cart in URL
    if (typeof window !== 'undefined') {
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
            
            // Load saved properties as usual
            const savedProps = localStorage.getItem(SAVED_KEY);
            if (savedProps) {
              try { setSavedIds(JSON.parse(savedProps)); } catch (e) { console.error(e); }
            }
            return; 
          }
        } catch (e) {
          console.error('Failed to parse shared cart', e);
        }
      }
    }

    const savedCart = localStorage.getItem(CART_KEY);
    const savedProps = localStorage.getItem(SAVED_KEY);
    
    if (savedCart) {
      try { setCartItems(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    if (savedProps) {
      try { setSavedIds(JSON.parse(savedProps)); } catch (e) { console.error(e); }
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  const addToCart = (id: string) => {
    if (!cartItems.includes(id)) {
      setCartItems(prev => [...prev, id]);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item !== id));
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
  const clearCart = () => setCartItems([]);

  return (
    <DiscussionContext.Provider value={{
      cartItems,
      savedIds,
      addToCart,
      removeFromCart,
      toggleSave,
      isInCart,
      isSaved,
      clearCart
    }}>
      {children}
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
