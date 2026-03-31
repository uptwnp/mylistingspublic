import { useState } from 'react';
import Image from 'next/image';
import { Heart, Plus, Minus, MapPin, Ruler, ChevronRight, Share2, ExternalLink, Check, Locate, MessageCircleQuestion } from 'lucide-react';
import { Property } from '@/types';
import { useShortlist } from '@/context/ShortlistContext';
import { trackEvent } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice, formatPriceRange, formatSizeRange } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { useRouter } from 'next/navigation';
import { NoPhotosPlaceholder } from './NoPhotosPlaceholder';
import { AskQuestionModal } from './AskQuestionModal';
import { ClickableText } from './ClickableText';

interface PropertyCardProps {
  property: Property;
  isExpanded?: boolean;
  onToggle?: () => void;
  isNearMeFallback?: boolean;
  showDistance?: boolean;
  isSimilar?: boolean;
}

export function PropertyCard({ property, isExpanded = false, onToggle, isNearMeFallback, showDistance, isSimilar }: PropertyCardProps) {
  const router = useRouter();
  const { isInShortlist, addToShortlist, removeFromShortlist, isSaved, toggleSave } = useShortlist();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  const inCart = isInShortlist(property.property_id);
  const saved = isSaved(property.property_id);

  const handleCardToggle = (e: React.MouseEvent) => {
    if (isSimilar) {
      trackEvent('used_similar_properties', {
        property_id: property.property_id,
        type: property.type
      });
    }
    
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
  const iconUrl = config.iconUrl;
  const hasImage = Array.isArray(property.image_urls) && property.image_urls.length > 0;

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardToggle}
      className={cn(
        "group relative flex flex-col border p-3 rounded-[28px] transition-all duration-300 cursor-pointer overflow-hidden",
        isExpanded 
          ? "border-zinc-300 bg-white shadow-2xl ring-1 ring-zinc-100" 
          : "border-zinc-100 bg-white hover:shadow-xl hover:border-zinc-200"
      )}
    >
      {/* Top Section - Always Visible */}
      <div className="flex gap-4">
        {/* Left Image/Icon Box - Larger and more defined */}
        <motion.div 
          className="group/image group relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-[18px] sm:rounded-[22px] shadow-sm ring-1 ring-black/5"
        >
          {hasImage ? (
            <Image
              src={property.image_urls[0]}
              alt={property.description || 'Property Image'}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 80px, 96px"
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
                className="absolute inset-0 z-40 pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0, x: 10, y: -10 }}
                  animate={{ scale: 1, x: 0, y: 0 }}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl ring-2 ring-white"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={5} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Open in New Tab Overlay */}
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 opacity-0 group-hover/image:opacity-100 transition-all duration-300 backdrop-blur-[2px] pointer-events-none">
            <a 
              href={`/property/${property.property_id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-zinc-900 p-2.5 rounded-full shadow-2xl transform scale-50 group-hover/image:scale-100 transition-all duration-300 pointer-events-auto"
              title="View property details"
            >
              <ExternalLink className="h-[18px] w-[18px]" strokeWidth={3} />
            </a>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col justify-center min-w-0 py-0.5">
          {/* Header Row: Title & Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="ty-subtitle font-bold text-zinc-900 leading-tight">
              {formatSizeRange(property.size_min, property.size_max, property.size_unit, property.price_min)} {property.type}
            </h3>
            <div className="shrink-0">
               <span className="ty-subtitle font-black text-brand-primary whitespace-nowrap">
                {formatPriceRange(property.price_min, property.price_max)}
              </span>
            </div>
          </div>

          {/* Location & Distance Row */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 ty-caption font-semibold text-zinc-600">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">{property.area}, {property.city}</span>
            </div>
            
            {showDistance && property.landmark_location_distance !== undefined && property.landmark_location_distance > 0 && (
              <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md font-bold text-[10px] border border-rose-100">
                <Locate className="h-2.5 w-2.5" />
                <span>{property.landmark_location_distance.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* Highlights or Description - Now always visible and cleaner */}
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex-1 flex gap-1.5 overflow-hidden">
              {Array.isArray(property.highlights) && property.highlights.length > 0 ? (
                property.highlights.slice(0, 2).map((h, i) => (
                <span key={i} className="px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-lg ty-micro text-zinc-600 font-bold whitespace-nowrap shadow-sm">
                  {h}
                </span>
                ))
              ) : property.description && (
                <div className="ty-caption text-zinc-400 truncate italic opacity-80 break-words">
                  <ClickableText text={property.description} />
                </div>
              )}
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0, scale: isExpanded ? 1.1 : 1 }}
              className="bg-zinc-100 p-1 rounded-full shadow-inner-sm shrink-0"
            >
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-500" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expandable Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mt-4 pt-4 border-t border-zinc-100"
          >
            <div className="space-y-4">
              {/* Additional Highlights */}
              {Array.isArray(property.highlights) && property.highlights.length > 2 && (
                <div className="flex flex-wrap gap-1.5">
                  {property.highlights.map((h, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50/50 ty-micro font-bold text-blue-700 rounded-lg border border-blue-100">
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Full description */}
              {property.description && (
                <div className="ty-caption text-zinc-600 leading-relaxed bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100/50 break-words">
                  <ClickableText text={property.description} />
                </div>
              )}

              {/* Action Grid */}
              <div className="flex flex-col gap-3 pt-2">
                {/* Primary Conversion Section */}
                <div className="flex gap-2.5">
                  <button
                    onClick={(e) => handleActionClick(e, () => inCart ? removeFromShortlist(property.property_id) : addToShortlist(property))}
                    className={cn(
                      "flex-[2] flex items-center justify-center gap-2 rounded-xl py-3 ty-caption font-bold shadow-lg transition-all active:scale-[0.98]",
                      inCart
                        ? "bg-brand-primary text-white shadow-brand-primary/20"
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
                    onClick={(e) => handleActionClick(e, () => setIsAskModalOpen(true))}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white py-3 ty-caption font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98]"
                  >
                    <MessageCircleQuestion className="h-4 w-4" />
                    Ask
                  </button>
                </div>

                {/* Secondary Actions Row */}
                <div className="flex items-center gap-2.5">
                  <a
                    href={`/property/${property.property_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 ty-caption font-bold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Full Details
                  </a>
                  
                  <div className="flex gap-2">
                    <button 
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl border transition-all active:scale-[0.98]",
                        saved 
                          ? "text-rose-500 bg-rose-50 border-rose-100" 
                          : "border-zinc-200 text-zinc-500 bg-white hover:bg-zinc-50"
                      )}
                      onClick={(e) => handleActionClick(e, () => toggleSave(property.property_id))}
                    >
                      <Heart className={cn("h-5 w-5", saved && "fill-current")} />
                    </button>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: `${property.type} in ${property.area}`,
                              url: window.location.origin + `/property/${property.property_id}`
                            });
                            trackEvent('shared', {
                                property_id: property.property_id,
                                method: 'web_share'
                            });
                          } catch (err) {
                            if (err instanceof Error && err.name !== 'AbortError') {
                              console.error('Error sharing:', err);
                            }
                          }
                        }
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-all hover:bg-zinc-50 active:scale-[0.98]"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ask Question Modal */}
      <AskQuestionModal
        property={property}
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </motion.div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col border border-zinc-100 bg-white p-3 rounded-[24px] shadow-sm relative overflow-hidden">
      <div className="flex gap-4">
        {/* Match the new larger image size */}
        <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-[18px] sm:rounded-[22px] bg-zinc-100 shimmer-bg" />
        
        <div className="flex flex-1 flex-col justify-center gap-2 py-1">
          {/* Header Row Skeleton */}
          <div className="flex justify-between items-start gap-4">
            <div className="h-5 sm:h-6 w-1/2 rounded-lg bg-zinc-100 shimmer-bg" />
            <div className="h-5 sm:h-6 w-20 rounded-lg bg-zinc-100 shimmer-bg" />
          </div>
          
          {/* Location Row Skeleton */}
          <div className="h-4 w-1/3 rounded-md bg-zinc-50 shimmer-bg" />
          
          {/* Highlights Row Skeleton */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-md bg-zinc-50 shimmer-bg" />
              <div className="h-5 w-16 rounded-md bg-zinc-50 shimmer-bg" />
            </div>
            <div className="h-5 w-5 rounded-full bg-zinc-50 shimmer-bg" />
          </div>
        </div>
      </div>
    </div>
  );
}
