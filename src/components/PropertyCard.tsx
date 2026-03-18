import { useState } from 'react';
import Image from 'next/image';
import { Heart, Plus, Minus, MapPin, Ruler, ChevronRight, Share2, ExternalLink, Check, Navigation } from 'lucide-react';
import { Property } from '@/types';
import { useDiscussion } from '@/context/DiscussionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice, formatSizeRange } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { useRouter } from 'next/navigation';

interface PropertyCardProps {
  property: Property;
  isExpanded?: boolean;
  onToggle?: () => void;
  isNearbyFallback?: boolean;
  showDistance?: boolean;
}

export function PropertyCard({ property, isExpanded = false, onToggle, isNearbyFallback, showDistance }: PropertyCardProps) {
  const router = useRouter();
  const { isInCart, addToCart, removeFromCart, isSaved, toggleSave } = useDiscussion();

  const inCart = isInCart(property.property_id);
  const saved = isSaved(property.property_id);

  const handleCardToggle = (e: React.MouseEvent) => {
    if (onToggle) onToggle();
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
          className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-[14px] sm:rounded-[18px]"
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
            <div className={cn("flex h-full w-full items-center justify-center", config.bgColor)}>
              <Icon className={cn("h-6 w-6 sm:h-8 sm:w-8", config.color)} />
            </div>
          )}
          
          {/* Selection Indicator for Cart */}
          {inCart && (
            <motion.div layout className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center backdrop-blur-[1px]">
              <div className="bg-white rounded-full p-1 shadow-lg">
                <Check className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-zinc-900" strokeWidth={4} />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content Area */}
        <motion.div layout className="flex flex-1 flex-col min-w-0 py-0.5">
          <h3 className="ty-subtitle font-bold text-zinc-900 leading-tight truncate">
            {formatSizeRange(property.size_min, property.size_max, property.size_unit)} {property.type}
          </h3>

          <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 ty-caption font-medium text-zinc-500">
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">{property.area}, {property.city}</span>
          </div>

          {Array.isArray(property.tags) && property.tags.length > 0 ? (
            <p className="mt-1 ty-micro font-black text-emerald-600 truncate uppercase tracking-widest opacity-90">
              {property.tags.join(' • ')}
            </p>
          ) : property.description && (
            <p className="mt-1 ty-caption text-zinc-400 truncate w-full italic font-medium opacity-80">
              {property.description}
            </p>
          )}

          {showDistance && property.landmark_location_distance !== undefined && property.landmark_location_distance > 0 && (
            <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 ty-caption font-bold text-rose-500">
              <Navigation className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
              <span>
                {property.landmark_location_distance.toFixed(1)} km 
                {isNearbyFallback ? ' from city center' : ' away'}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div layout className="flex h-16 sm:h-20 flex-col items-end justify-between py-0.5 shrink-0">
          <span className="px-2 sm:px-3 py-1 bg-zinc-100 rounded-full ty-micro font-black text-zinc-900 shadow-sm border border-zinc-200">
            {formatPrice(property.price_min)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.share?.({
                        title: `${property.type} in ${property.area}`,
                        url: window.location.origin + `/property/${property.property_id}`
                      });
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleActionClick(e, () => inCart ? removeFromCart(property.property_id) : addToCart(property))}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 ty-caption font-bold shadow-lg transition-all active:scale-[0.98]",
                      inCart
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-zinc-900 text-white hover:bg-black shadow-black/10"
                    )}
                  >
                    {inCart ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={3} />
                        Discuss Now (Added)
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" strokeWidth={3} />
                        Add to Discussion
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
    <div className="flex items-center gap-4 border border-zinc-100 bg-white p-3 rounded-[24px] shadow-sm animate-pulse">
      <div className="h-20 w-20 shrink-0 rounded-[18px] bg-zinc-100" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-6 w-24 rounded bg-zinc-100" />
        <div className="h-4 w-32 rounded bg-zinc-50" />
        <div className="h-4 w-28 rounded bg-zinc-50" />
      </div>
      <div className="flex h-20 flex-col items-end justify-between py-1 shrink-0">
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-full bg-zinc-50" />
          <div className="h-9 w-9 rounded-full bg-zinc-50" />
        </div>
        <div className="h-6 w-16 rounded-full bg-zinc-50" />
      </div>
    </div>
  );
}
