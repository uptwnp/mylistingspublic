'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { useShortlist } from '@/context/ShortlistContext';
import { trackEvent } from '@/lib/analytics';
import { ArrowLeft, Heart, ShoppingCart, MapPin, Ruler, Calendar, CheckCircle2, ShieldCheck, Share2, Locate, Map as MapIcon, X, ChevronLeft, ChevronRight, ExternalLink, MessageCircleQuestion, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatPriceRange, formatSizeRange, cn, calculateDistance, getPropertyCoords } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { getProperties } from '@/lib/supabase';
import { PropertyCard } from '@/components/PropertyCard';
import dynamic from 'next/dynamic';
import { AskQuestionModal } from '@/components/AskQuestionModal';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-50 animate-pulse">
      <div className="text-center">
        <MapIcon className="mx-auto h-8 w-8 text-zinc-200 mb-3" />
        <span className="ty-micro font-black text-zinc-400 uppercase tracking-widest">Locating properties for you...</span>
      </div>
    </div>
  )

});

interface PropertyDetailViewProps {
  initialProperty: Property;
}

export function PropertyDetailView({ initialProperty }: PropertyDetailViewProps) {
  const router = useRouter();
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const { isInShortlist, addToShortlist, removeFromShortlist, isSaved, toggleSave, addRecentlyVisited, updateInquiry, inquiries, cachedProperties, userLocation: globalUserLocation } = useShortlist();
  
  // Try to use cached data for instant initial render if we have it
  const [property] = useState<Property>(() => {
    const cached = cachedProperties[initialProperty.property_id];
    // Only use cache if it was more detailed or if we have it
    return cached || initialProperty;
  });

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(globalUserLocation || null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  const paginate = (newDirection: number) => {
    const totalSlides = property.image_urls.length + 1;
    setDirection(newDirection);
    setHeroImageIndex((prev) => (prev + newDirection + totalSlides) % totalSlides);
  };

  useEffect(() => {
    addRecentlyVisited(property.property_id);
    trackEvent('viewed_pricing_card', {
        property_id: property.property_id,
        price: formatPriceRange(property.price_min, property.price_max)
    });

    const fetchSimilar = async () => {
      setLoadingSimilar(true);
      try {
        const { data: similar } = await getProperties(0, 5, false, property.city, property.type);
        setSimilarProperties(similar.filter((p: Property) => p.property_id !== property.property_id).slice(0, 4));
      } catch (error) {
        console.error('Similar fetch error:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };
    fetchSimilar();
  }, [property]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGalleryOpen) {
        if (e.key === 'ArrowRight') nextPhoto();
        if (e.key === 'ArrowLeft') prevPhoto();
        if (e.key === 'Escape') setIsGalleryOpen(false);
      } else if (!isPhotoModalOpen) {
        if (e.key === 'ArrowRight') paginate(1);
        if (e.key === 'ArrowLeft') paginate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, isPhotoModalOpen, property, activePhotoIndex, heroImageIndex]);

  const scrollToMap = () => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const openGallery = (index: number) => {
    setActivePhotoIndex(index);
    setIsGalleryOpen(true);
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % property.image_urls.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + property.image_urls.length) % property.image_urls.length);
  };

  const inCart = isInShortlist(property.property_id);
  const saved = isSaved(property.property_id);
  const config = getPropertyConfig(property.type);
  const iconUrl = config.iconUrl;
  const hasImage = Array.isArray(property.image_urls) && property.image_urls.length > 0;
  const [lat, lng] = getPropertyCoords(property, similarProperties);
  // Stable array ref so MapComponent doesn't re-render on every keystroke
  const mapProperties = React.useMemo(() => [property], [property.property_id]);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Top Section: Only for Heading on Desktop, everything for Mobile */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-28 sm:pt-32 pb-4 sm:pb-6 lg:px-12">
        <div className="flex items-center gap-2 ty-micro font-bold tracking-widest text-zinc-500 mb-3 sm:mb-4 uppercase">
          <Link href={`/explore?city=${property.city}`} className="hover:text-brand-primary transition-colors">
            {property.city}
          </Link>
          <span className="text-zinc-300 font-normal scale-125 px-1 opacity-50">&gt;</span>
          <Link href={`/explore?city=${property.city}&area=${property.area}`} className="hover:text-brand-primary transition-colors">
            {property.area}
          </Link>
        </div>
        <h1 className="ty-title font-bold text-zinc-900 leading-tight">
          {formatSizeRange(property.size_min, property.size_max, property.size_unit, property.price_min)} {property.type} for sale in {property.area}, {property.city}
        </h1>
      </section>

      {/* Main Grid Content */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          
          {/* COLUMN 1: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-2 text-zinc-600 ty-micro font-black uppercase tracking-widest bg-zinc-50/80 w-fit px-4 py-2 rounded-xl border border-zinc-200/50 shadow-sm">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-400">Last Updated:</span>
                <span className="text-zinc-900">{formatDate(property.approved_on)}</span>
            </div>
            {/* Photo Gallery Area */}
            <div className="relative overflow-hidden rounded-3xl aspect-[16/9] md:aspect-auto md:h-[500px] border border-zinc-200 bg-zinc-50 shadow-inner-sm">
              {hasImage ? (
                <div className="h-full relative group">
                  {/* ... rest unchanged ... */}
                  <div className="relative h-full w-full overflow-hidden">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.div
                        key={heroImageIndex}
                        custom={direction}
                        variants={{
                          enter: (direction: number) => ({
                            x: direction > 0 ? '100%' : '-100%',
                            opacity: 0,
                          }),
                          center: {
                            zIndex: 1,
                            x: 0,
                            opacity: 1,
                          },
                          exit: (direction: number) => ({
                            zIndex: 0,
                            x: direction < 0 ? '100%' : '-100%',
                            opacity: 0,
                          })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={(e, { offset, velocity }) => {
                          const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                          if (swipe) {
                            if (offset.x > 0) {
                              paginate(-1);
                            } else {
                              paginate(1);
                            }
                          }
                          // Delay resetting isDragging to catch subsequent tap events
                          setTimeout(() => setIsDragging(false), 100);
                        }}
                        onTap={() => {
                          if (!isDragging && heroImageIndex < property.image_urls.length) {
                            openGallery(heroImageIndex);
                          }
                        }}
                        whileDrag={{ cursor: 'grabbing' }}
                        className="absolute inset-0 h-full w-full bg-zinc-100 cursor-grab"
                      >
                        {heroImageIndex < property.image_urls.length ? (
                          <Image
                            src={property.image_urls[heroImageIndex]}
                            alt={property.description || 'Property Image'}
                            fill
                            className="object-cover"
                            draggable={false}
                            priority
                          />
                        ) : (
                          <div 
                            className="flex h-full w-full flex-col items-center justify-center p-6 sm:p-8 text-center bg-zinc-50"
                          >
                            <ShieldCheck className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6 text-zinc-300" />
                            <p className="ty-subtitle md:ty-title font-bold text-zinc-900 mb-1 md:mb-2">Not enough to get idea?</p>
                            <p className="ty-caption text-zinc-500 max-w-[280px] sm:max-w-sm mb-4 md:mb-6">Request more exclusive photos and videos for this property.</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsPhotoModalOpen(true);
                              }}
                              className="rounded-full bg-black px-6 py-2 md:px-8 md:py-3 ty-caption font-bold text-white shadow-xl shadow-black/10 active:scale-[0.98] transition-all cursor-pointer"
                            >
                              Request more photos
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-[50] flex justify-between pointer-events-none">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          paginate(-1);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-xl backdrop-blur-md transition-all hover:bg-white active:scale-[0.98] pointer-events-auto border border-zinc-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          paginate(1);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-xl backdrop-blur-md transition-all hover:bg-white active:scale-[0.98] pointer-events-auto border border-zinc-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full z-10">
                    {heroImageIndex < property.image_urls.length ? `${heroImageIndex + 1} / ${property.image_urls.length}` : 'Request More'}
                  </div>

                  {/* Thumbnail Strips */}
                  <div className="absolute bottom-4 left-4 hidden md:flex gap-2 z-10">
                    {property.image_urls.slice(0, 4).map((url, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDirection(i > heroImageIndex ? 1 : -1);
                          setHeroImageIndex(i);
                        }}
                        className={cn(
                          "relative h-12 w-16 overflow-hidden rounded-lg border-2 transition-all active:scale-[0.98]",
                          heroImageIndex === i ? "border-white shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={url}
                          alt={`Thumb ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="flex h-full w-full flex-col items-center justify-center p-6 sm:p-8 text-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col items-center scale-90 sm:scale-100">
                    <img 
                      src={iconUrl} 
                      alt={property.type} 
                      className="h-20 w-20 md:h-32 md:w-32 object-contain" 
                    />
                    <div className="text-center mt-3 md:mt-4">
                      <p className="ty-subtitle md:ty-title font-normal text-zinc-400 mb-4">No photos available</p>
                      <button className="rounded-full bg-black px-6 py-2 md:px-8 md:py-3 ty-caption font-bold text-white shadow-xl shadow-black/10 transition-all active:scale-[0.98]">
                        Request photos
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 py-6 border-b border-zinc-100 overflow-x-auto no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
              <button 
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: `${property.type} in ${property.area}, ${property.city}`,
                        url: window.location.href
                      });
                      trackEvent('shared', {
                          property_id: property.property_id,
                          method: 'web_share'
                      });
                    } catch (err) {}
                  }
                }}
                className="flex items-center gap-2.5 rounded-2xl px-5 py-3 ty-caption font-bold border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 transition-all hover:border-zinc-300 active:scale-95 whitespace-nowrap shadow-sm"
              >
                <Share2 className="h-4 w-4 text-zinc-400" />
                Share
              </button>
              <button 
                onClick={() => toggleSave(property.property_id)}
                className={cn(
                    "flex items-center gap-2.5 rounded-2xl px-5 py-3 ty-caption font-bold border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 transition-all hover:border-zinc-300 active:scale-95 whitespace-nowrap shadow-sm",
                    saved && "bg-rose-50 border-rose-100 text-rose-600"
                )}
              >
                <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button onClick={scrollToMap} className="flex items-center gap-2.5 rounded-2xl px-5 py-3 ty-caption font-bold border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 transition-all hover:border-zinc-300 active:scale-95 whitespace-nowrap shadow-sm">
                <MapIcon className="h-4 w-4 text-zinc-400" />
                Map
              </button>
              <button
                onClick={() => setIsAskModalOpen(true)}
                className="flex items-center gap-2.5 rounded-2xl px-5 py-3 ty-caption font-bold border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 transition-all hover:border-zinc-300 active:scale-95 whitespace-nowrap shadow-sm"
              >
                <MessageCircleQuestion className="h-4 w-4 text-zinc-400" />
                Ask Question
              </button>
            </div>

            {/* Highlights */}
            {Array.isArray(property.highlights) && property.highlights.length > 0 && (
              <div className="space-y-4">
                <h2 className="ty-title font-bold">Key Highlights</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <span className="ty-caption font-semibold">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4 pt-4">
              <h2 className="ty-title font-bold">About this listing</h2>
              <p className="ty-body leading-relaxed text-zinc-600">{property.description}</p>
            </div>

            {/* Details Table */}
            <div className="space-y-6 pt-8 border-t border-zinc-100">
                <h2 className="ty-title font-bold">Listing Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50">
                    {[
                        { label: 'Property Type', value: property.type },
                        { label: 'Listing ID', value: property.public_id },
                        { label: 'City', value: property.city },
                        { label: 'Area', value: property.area },
                        { label: 'Size', value: formatSizeRange(property.size_min, property.size_max, property.size_unit, property.price_min) },
                        { label: 'Price Range', value: formatPriceRange(property.price_min, property.price_max) },
                        { label: 'Status', value: (property.status || 'Active').charAt(0).toUpperCase() + (property.status || 'Active').slice(1) },
                        { label: 'Approved On', value: formatDate(property.approved_on) },
                        { label: 'Landmark', value: property.landmark_location || 'Not specified' },
                    ].map((item, i) => (
                        <div key={i} className={cn("flex items-center justify-between p-4 border-b border-zinc-100 md:odd:border-r")}>
                            <span className="ty-caption font-medium text-zinc-500 uppercase tracking-wider">{item.label}</span>
                            <span className="ty-caption font-bold text-zinc-900">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div ref={mapSectionRef} className="space-y-6 pt-10 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <h2 className="ty-title font-bold text-zinc-900">On Map</h2>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 ty-caption font-bold text-blue-600 hover:underline"
                >
                  Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="h-[400px] w-full rounded-2xl border border-zinc-100 bg-zinc-50 overflow-hidden">
                <MapComponent 
                  properties={mapProperties} 
                  selectedProperty={property} 
                  onSelectProperty={() => {}}
                  userLocation={userLocation} 
                  showDistance={true} 
                  disableCard={true} 
                />
              </div>
              {userLocation && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Locate className="h-4 w-4 text-blue-500" />
                  <span className="ty-caption font-bold">{calculateDistance(userLocation.lat, userLocation.lng, lat, lng).toFixed(1)} km from you</span>
                </div>
              )}
            </div>

            {/* Similar Properties */}
            <div className="space-y-8 pt-12 border-t border-zinc-100">
              <h2 className="ty-display font-bold italic tracking-tight">Similar properties for you</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {loadingSimilar ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] w-full bg-zinc-50 rounded-3xl animate-pulse flex flex-col p-6 space-y-4">
                        <div className="h-full w-full bg-zinc-100 rounded-2xl" />
                        <div className="h-4 w-3/4 bg-zinc-100 rounded-full" />
                        <div className="h-6 w-1/2 bg-zinc-100 rounded-full" />
                    </div>
                  ))
                ) : (
                  similarProperties.map((p) => <PropertyCard key={p.property_id} property={p} isSimilar />)
                )}
              </div>

              {!loadingSimilar && similarProperties.length > 0 && (
                <div className="pt-8 flex justify-center">
                  <Link 
                    href={`/explore?city=${property.city}&area=${property.area}&type=${property.type}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 ty-caption font-bold text-zinc-900 hover:bg-zinc-50 md:w-auto md:px-12"
                  >
                    Show more {property.type}s in {property.area} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl shadow-black/5 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price Range</span>
                <p className="text-2xl font-bold">{formatPriceRange(property.price_min, property.price_max)}</p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => inCart ? removeFromShortlist(property.property_id) : addToShortlist(property)}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 ty-body font-black transition-all active:scale-[0.98] ${inCart ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/10'}`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {inCart ? 'Remove from Shortlist' : 'Add to Shortlist'}
                </button>
                <button 
                  onClick={() => {
                    if (!inCart) addToShortlist(property);
                    router.push('/shortlist');
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-primary py-4 ty-body font-black text-white shadow-2xl shadow-blue-500/20 active:scale-[0.98] hover:bg-blue-700 transition-all shimmer-premium"
                >
                  {inCart ? 'Go to Shortlist' : 'Proceed with it'}
                </button>
                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 py-4 ty-body font-bold text-zinc-700 hover:bg-zinc-100 transition-all active:scale-[0.98]"
                >
                  <MessageCircleQuestion className="h-5 w-5 text-zinc-400" />
                  Ask a Question
                </button>
              </div>
              <div className="h-px bg-zinc-100" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <p className="ty-label text-zinc-400">Listing Type</p>
                    <p className="ty-caption font-bold text-zinc-900">Preferred</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-zinc-100 px-4 pt-4 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] md:hidden rounded-t-[32px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-zinc-200 bg-white py-4 ty-body font-bold text-zinc-900 shadow-sm transition-all active:scale-[0.98]"
          >
            <MessageCircleQuestion className="h-5 w-5 text-zinc-400" />
            <span>Ask Question</span>
          </button>
          
          <button 
             onClick={() => {
              if (!inCart) addToShortlist(property);
              else router.push('/shortlist');
            }}
            className="flex-[1.5] flex items-center justify-center gap-3 rounded-2xl bg-brand-primary py-4.5 ty-body font-black text-white shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all shimmer-premium"
          >
            {inCart ? (
              <>
                <span>Proceed with it</span>
                <ChevronRight className="h-5 w-5" />
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Shortlist</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        property={property}
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />

      {/* Photo Request Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPhotoModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50"><ShieldCheck className="h-8 w-8 text-amber-600" /></div>
                <h3 className="mb-4 ty-title font-bold text-zinc-900">Request Photos & Videos</h3>
                <p className="ty-body text-zinc-600 mb-8">Some owners prefer to keep photos private. We can help you get exclusive access by depositing a refundable token.</p>
                <div className="flex flex-col w-full gap-3">
                  <button onClick={() => {
                    if (!inCart) addToShortlist(property);
                    updateInquiry(property.property_id, {
                        wantSiteVisit: false,
                        interestedInPurchase: false,
                        haveQuestion: true,
                        question: 'I need photos and video and I am ready to pay the token amount.'
                    });
                    setIsPhotoModalOpen(false);
                    router.push('/shortlist');
                  }} className="bg-zinc-900 text-white rounded-2xl py-3.5 ty-caption font-bold">Request Photos</button>
                  <button onClick={() => setIsPhotoModalOpen(false)} className="ty-caption font-bold text-zinc-400">Maybe later</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[200] flex flex-col bg-black">
            <div className="flex items-center justify-between p-6">
              <div className="bg-white/10 px-4 py-2 rounded-full text-white text-xs font-black">{activePhotoIndex + 1} / {property.image_urls.length}</div>
              <button onClick={() => setIsGalleryOpen(false)} className="h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center"><X className="h-6 w-6" /></button>
            </div>
            <div className="relative flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={activePhotoIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full w-full max-w-5xl">
                  <Image src={property.image_urls[activePhotoIndex]} alt="Gallery" fill className="object-contain" />
                </motion.div>
              </AnimatePresence>
              <button onClick={prevPhoto} className="absolute left-6 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronLeft className="h-6 w-6" /></button>
              <button onClick={nextPhoto} className="absolute right-6 h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center"><ChevronRight className="h-6 w-6" /></button>
            </div>
            <div className="flex justify-center gap-2 p-8 overflow-x-auto">
              {property.image_urls.map((url, i) => (
                <button key={i} onClick={() => setActivePhotoIndex(i)} className={cn("relative h-16 w-16 rounded-xl border-2 transition-all", activePhotoIndex === i ? "border-white" : "border-transparent opacity-40")}>
                  <Image src={url} alt="Thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
