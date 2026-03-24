'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { getPropertyById } from '@/lib/supabase';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useShortlist } from '@/context/ShortlistContext';
import { BUDGET_OPTIONS } from '@/components/HeaderSearch';
import { getSeoUrl } from '@/lib/seo-utils';

export function ContinueExploringBanner() {
  const { recentlyVisitedIds } = useShortlist();
  const [lastProperty, setLastProperty] = useState<Property | null>(null);

  useEffect(() => {
    async function fetchLastProperty() {
      if (recentlyVisitedIds.length > 0) {
        const id = recentlyVisitedIds[0];
        const property = await getPropertyById(id) as Property | null;
        if (property) {
          setLastProperty(property);
        }
      }
    }
    fetchLastProperty();
  }, [recentlyVisitedIds]);

  if (recentlyVisitedIds.length === 0) return null;

  if (!lastProperty) {
    return (
      <div className="flex w-full justify-center px-4 sm:px-0 py-1 sm:py-2">
        <div className="h-[44px] sm:h-[50px] w-64 rounded-full bg-zinc-50/50 shimmer-bg" />
      </div>
    );
  }

  const hasImage = Array.isArray(lastProperty.image_urls) && lastProperty.image_urls.length > 0;
  
  // Formatting strings
  const typeParts = (lastProperty.type || '').split(/[/\s]/);
  let baseType = typeParts[typeParts.length - 1] || 'property';
  if (!baseType.endsWith('s')) baseType += 's'; // e.g., 'plots', 'apartments', 'villas'

  let priceText = "";
  let budgetQuery = "";

  if (lastProperty.price_max) {
      const match = BUDGET_OPTIONS.find(opt => opt.value >= lastProperty.price_max && opt.value > 0);
      if (match) {
          budgetQuery = match.label;
          if (match.label.toLowerCase().startsWith('under')) {
             priceText = match.label.toLowerCase();
          } else if (match.label.includes('+')) {
             priceText = "over " + match.label.replace('+', '').toLowerCase();
          } else {
             priceText = "in " + match.label.toLowerCase(); // "in 40 to 80 lakh"
          }
      }
  }

  // Create search URL based on last property
  const queryParams = new URLSearchParams();
  if (lastProperty.city) queryParams.set('city', lastProperty.city);
  if (lastProperty.area) queryParams.set('area', lastProperty.area);
  if (lastProperty.type) queryParams.set('type', lastProperty.type);
  if (budgetQuery) queryParams.set('budget', budgetQuery);

  const seoUrl = getSeoUrl(lastProperty.city, lastProperty.type, lastProperty.area, budgetQuery);
  const searchUrl = seoUrl || `/explore?${queryParams.toString()}`;

  return (
    <div className="flex w-full justify-center px-4 sm:px-0 py-1 sm:py-2">
      <Link 
        href={searchUrl}
        className="flex items-center gap-2 sm:gap-3 rounded-full border border-zinc-100 bg-white/60 p-1 pl-4 sm:pl-5 transition-all hover:bg-white hover:border-zinc-200 active:scale-[0.98] group max-w-fit backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 py-1">
             <span className="text-[12px] sm:text-[13px] font-bold text-zinc-900 tracking-tight capitalize">
                {baseType.toLowerCase()} {priceText} in {lastProperty.area}
             </span>
             <span className="hidden sm:inline-block text-zinc-200 text-lg mx-1">•</span>
             <span className="hidden sm:inline-block text-[12px] font-semibold text-zinc-500 whitespace-nowrap">
               {lastProperty.city}
             </span>
        </div>
        
        <div className="flex items-center justify-center text-zinc-300 ml-1">
          <ChevronRight className="h-4 w-4 group-hover:text-zinc-600 transition-colors" />
        </div>
        
        {hasImage && (
          <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-full ml-1 border border-zinc-100/50">
            <Image
              src={lastProperty.image_urls[0]}
              alt="Property preview"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}
      </Link>
    </div>
  );
}
