'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { getPropertyById } from '@/lib/supabase';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useShortlist } from '@/context/ShortlistContext';

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

  if (!lastProperty) return null;

  const hasImage = Array.isArray(lastProperty.image_urls) && lastProperty.image_urls.length > 0;
  
  // Create search URL based on last property
  const searchUrl = `/explore?city=${lastProperty.city}&area=${lastProperty.area}&type=${lastProperty.type}`;

  // Formatting strings
  const typeParts = (lastProperty.type || '').split(/[/\s]/);
  let baseType = typeParts[typeParts.length - 1] || 'property';
  if (!baseType.endsWith('s')) baseType += 's'; // e.g., 'plots', 'apartments', 'villas'

  let priceText = "";
  if (lastProperty.price_max) {
      if (lastProperty.price_max < 100) {
          priceText = `under ${lastProperty.price_max} Lakh`;
      } else {
          const cr = (lastProperty.price_max / 100).toFixed(1).replace('.0', '');
          priceText = `under ${cr} Cr`;
      }
  }

  return (
    <div className="flex w-full justify-center px-4 sm:px-0 py-2 sm:py-4">
      <Link 
        href={searchUrl}
        className="flex items-center gap-2 sm:gap-4 rounded-full border border-zinc-200/80 bg-white p-2 pl-6 sm:pl-8 shadow-xl shadow-black-[0.03] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/5 hover:border-zinc-300 active:scale-95 group max-w-fit"
      >
        <div className="flex items-center gap-2 sm:gap-3 py-1">
             <span className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight capitalize">
               Continue exploring {baseType.toLowerCase()} {priceText} in {lastProperty.area}
             </span>
             <span className="hidden sm:inline-block text-zinc-200 text-lg mx-1">•</span>
             <span className="hidden sm:inline-block text-sm font-semibold text-zinc-500 whitespace-nowrap">
               {lastProperty.city}
             </span>
        </div>
        
        <div className="flex items-center justify-center text-zinc-300 ml-1 sm:ml-2">
          <ChevronRight className="h-5 w-5 group-hover:text-zinc-600 transition-colors" />
        </div>
        
        {hasImage && (
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-full ml-1 border border-zinc-100/50 shadow-sm">
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
