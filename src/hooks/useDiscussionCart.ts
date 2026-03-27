import { useState, useEffect } from 'react';

const CART_STORAGE_KEY = 'dealer_network_discussion_cart';

export function useDiscussionCart() {
  const [cartItems, setCartItems] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
    return [];
  });

  const addToCart = (propertyId: string) => {
    setCartItems((prev) => {
      if (prev.includes(propertyId)) return prev;
      const newCart = [...prev, propertyId];
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (propertyId: string) => {
    setCartItems((prev) => {
      const newCart = prev.filter((id) => id !== propertyId);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return newCart;
    });
  };

  const isInCart = (propertyId: string) => cartItems.includes(propertyId);

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    isInCart,
    clearCart,
  };
}
