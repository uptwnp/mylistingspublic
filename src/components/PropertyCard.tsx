import { useState } from 'react';
import Image from 'next/image';
import { Heart, Plus, Minus, MapPin, Ruler, ChevronRight, Share2, ExternalLink, Check, Locate } from 'lucide-react';
import { Property } from '@/types';
import { useShortlist } from '@/context/ShortlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice, formatSizeRange } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { useRouter } from 'next/navigation';
import { NoPhotosPlaceholder } from './NoPhotosPlaceholder';

interface PropertyCardProps {
  property: Property;
  isExpanded?: boolean;
  onToggle?: () => void;
  isNearMeFallback?: boolean;
  showDistance?: boolean;
}

export function PropertyCard({ property, isExpanded = false, onToggle, isNearMeFallback, showDistance }: PropertyCardProps) {
  const router = useRouter();
  const { isInShortlist, addToShortlist, removeFromShortlist, isSaved, toggleSave } = useShortlist();

  const inCart = isInShortlist(property.property_id);
  const saved = isSaved(property.property_id);

  const handleCardToggle = (e: React.MouseEvent) => {
    if (onToggle) {
      onToggle();
    } else {
      router.push(`/property/${property.property_id}`);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const navigateToDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/property/${property.property_id}`);
  };

  const config = getPropertyConfig(property.type);
  const Icon = config.icon;
  const hasImage = Array.isArray(property.image_urls) && property.image_urls.length > 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardToggle}
      className={cn(
        "group relative flex flex-col border bg-white p-3 rounded-[24px] shadow-sm cursor-pointer overflow-hidden",
        isExpanded ? "border-zinc-300 shadow-xl ring-1 ring-zinc-100" : "border-zinc-100 hover:shadow-md hover:border-zinc-200"
      )}
    >
      {/* Top Section - Always Visible */}
      <motion.div layout className="flex items-center gap-4">
        {/* Left Image/Icon Box */}
        <motion.div 
          layout
          className="group/image relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-[14px] sm:rounded-[18px]"
        >
          {hasImage ? (
            <Image
              src={property.image_urls[0]}
              alt={property.description || 'Property Image'}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 64px, 80px"
            />
          ) : (
            <NoPhotosPlaceholder isMini propertyType={property.type} />
          )}
          
          {/* Selection Indicator for Cart (Single Top-Right Badge) */}
          <AnimatePresence>
            {inCart && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0, x: 10, y: -10 }}
                  animate={{ scale: 1, x: 0, y: 0 }}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl ring-2 ring-white"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={5} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Open in New Tab Overlay (Visible on Hover, Above Cart State) */}
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 opacity-0 group-hover/image:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
            <a 
              href={`/property/${property.property_id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-zinc-900 p-2.5 rounded-full shadow-2xl transform scale-50 group-hover/image:scale-100 transition-all duration-300"
              title="View property details"
            >
              <ExternalLink className="h-[18px] w-[18px]" strokeWidth={3} />
            </a>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div layout className="flex flex-1 flex-col min-w-0 py-0.5">
          <h3 className="ty-subtitle font-bold text-zinc-900 leading-tight truncate">
            {formatSizeRange(property.size_min, property.size_max, property.size_unit, property.price_min)} {property.type}
          </h3>

          <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 ty-caption font-medium text-zinc-500">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">{property.area}, {property.city}</span>
          </div>

          {Array.isArray(property.tags) && property.tags.length > 0 ? (
            <p className="mt-1 ty-micro font-black text-brand-primary truncate uppercase tracking-widest opacity-90">
              {property.tags.join(' • ')}
            </p>
          ) : property.description && (
            <p className="mt-1 ty-caption text-zinc-400 truncate w-full italic font-medium opacity-80">
              {property.description}
            </p>
          )}

          {showDistance && property.landmark_location_distance !== undefined && property.landmark_location_distance > 0 && (
            <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 ty-caption font-bold text-rose-500">
              <Locate className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
              <span>
                {property.landmark_location_distance.toFixed(1)} km 
                {property.loc_fallback ? ' from area center' : ' away'}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div layout className="flex h-16 sm:h-20 flex-col items-end justify-between py-0.5 shrink-0">
          <span className="px-2 sm:px-3 py-1 bg-zinc-100 rounded-full ty-micro font-black text-zinc-900 shadow-sm border border-zinc-200">
            {property.formatted_price || formatPrice(property.price_min)}
          </span>

          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 items-center"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-zinc-400" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Expandable Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mt-4 pt-4 border-t border-zinc-50"
          >
            <div className="space-y-4">
              {/* Description */}
              {property.description && (
                <p className="ty-caption text-zinc-600 leading-relaxed line-clamp-3">
                  {property.description}
                </p>
              )}

              {/* Tags */}
              {Array.isArray(property.tags) && property.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 bg-zinc-50 ty-caption font-medium text-zinc-500 rounded-lg border border-zinc-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <a
                    href={`/property/${property.property_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 ty-caption font-bold text-zinc-900 transition-all hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Full Property Page
                  </a>
                  
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: `${property.type} in ${property.area}`,
                            url: window.location.origin + `/property/${property.property_id}`
                          });
                        } catch (err) {
                          // Only log errors that aren't user-cancellations
                          if (err instanceof Error && err.name !== 'AbortError') {
                            console.error('Error sharing:', err);
                          }
                        }
                      }
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleActionClick(e, () => inCart ? removeFromShortlist(property.property_id) : addToShortlist(property))}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 ty-caption font-bold shadow-lg transition-all active:scale-[0.98]",
                      inCart
                        ? "bg-brand-primary text-white shadow-blue-500/20"
                        : "bg-zinc-900 text-white hover:bg-black shadow-black/10"
                    )}
                  >
                    {inCart ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={3} />
                        Shortlisted
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" strokeWidth={3} />
                        Add to Shortlist
                      </>
                    )}
                  </button>

                  <button 
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl border transition-all active:scale-90",
                      saved 
                        ? "text-rose-500 bg-rose-50 border-rose-100" 
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                    onClick={(e) => handleActionClick(e, () => toggleSave(property.property_id))}
                  >
                    <Heart className={cn("h-5 w-5", saved && "fill-current")} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex items-center gap-4 border border-zinc-100 bg-white p-3 rounded-[24px] shadow-sm relative overflow-hidden">
      <div className="h-20 w-20 shrink-0 rounded-[18px] bg-zinc-100 shimmer-bg" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-6 w-3/4 rounded-lg bg-zinc-100 shimmer-bg" />
        <div className="h-4 w-1/2 rounded-md bg-zinc-50 shimmer-bg" />
        <div className="h-4 w-2/3 rounded-md bg-zinc-50 shimmer-bg" />
      </div>
      <div className="flex h-20 flex-col items-end justify-between py-1 shrink-0">
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-full bg-zinc-50 shimmer-bg" />
          <div className="h-9 w-9 rounded-full bg-zinc-50 shimmer-bg" />
        </div>
        <div className="h-6 w-16 rounded-full bg-zinc-50 shimmer-bg" />
      </div>
    </div>
  );
}
