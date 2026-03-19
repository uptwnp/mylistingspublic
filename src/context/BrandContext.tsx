'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBrandConfig, BrandConfig } from '@/lib/brand';

const BrandContext = createContext<BrandConfig>(getBrandConfig(null));

export function BrandProvider({ 
  children, 
  initialHost 
}: { 
  children: React.ReactNode, 
  initialHost: string | null 
}) {
  // Use config from initial host (passed from server)
  const [brand, setBrand] = useState<BrandConfig>(getBrandConfig(initialHost));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname;
      // Re-calculate if current window host is different (e.g. hydration or local host differences)
      setBrand(getBrandConfig(currentHost));
    }
  }, []);

  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => useContext(BrandContext);
