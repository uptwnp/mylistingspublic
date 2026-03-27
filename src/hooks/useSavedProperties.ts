import { useState, useEffect } from 'react';

const SAVED_STORAGE_KEY = 'dealer_network_saved_properties';

export function useSavedProperties() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(SAVED_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved properties from localStorage', e);
      }
    }
    return [];
  });

  const toggleSave = (propertyId: string) => {
    setSavedIds((prev) => {
      let newSaved;
      if (prev.includes(propertyId)) {
        newSaved = prev.filter((id) => id !== propertyId);
      } else {
        newSaved = [...prev, propertyId];
      }
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const isSaved = (propertyId: string) => savedIds.includes(propertyId);

  return {
    savedIds,
    toggleSave,
    isSaved,
  };
}
