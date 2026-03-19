'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPropertyById } from '@/lib/supabase';
import { Property } from '@/types';
import { useShortlist } from '@/context/ShortlistContext';
import { useRef } from 'react';
import { ArrowLeft, Heart, ShoppingCart, MapPin, Ruler, Calendar, CheckCircle2, ShieldCheck, Share2, Locate, Map as MapIcon, X, ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatPriceRange, formatSizeRange, cn, calculateDistance, getPropertyCoords } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { getProperties } from '@/lib/supabase';
import { PropertyCard } from '@/components/PropertyCard';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-zinc-100 flex items-center justify-center font-bold text-zinc-400">Loading Map...</div>
});

export const runtime = 'edge';

function PropertyDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { isInShortlist, addToShortlist, removeFromShortlist, isSaved, toggleSave, addRecentlyVisited, updateInquiry, inquiries } = useShortlist();
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const paginate = (newDirection: number) => {
    if (!property) return;
    const totalSlides = property.image_urls.length + 1; // +1 for the placeholder
    setDirection(newDirection);
    setHeroImageIndex((prev) => (prev + newDirection + totalSlides) % totalSlides);
  };

  useEffect(() => {
    // Attempt to get location for distance display
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        null,
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        const cleanId = Array.isArray(id) ? id[0] : id;
        const data = await getPropertyById(cleanId) as Property | null;
        if (data) {
          setProperty(data);
          addRecentlyVisited(data.property_id);
          // Fetch similar properties
          const { data: similar } = await getProperties(0, 5, false, data.city, data.type);
          setSimilarProperties(similar.filter((p: Property) => p.property_id !== data.property_id).slice(0, 4));
        }
      } catch (error: any) {
        console.error('Error in fetchProperty:', error?.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
    if (!property) return;
    setActivePhotoIndex((prev) => (prev + 1) % property.image_urls.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!property) return;
    setActivePhotoIndex((prev) => (prev - 1 + property.image_urls.length) % property.image_urls.length);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-black" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="ty-display font-black">Property Not Found</h1>
        <p className="ty-body text-zinc-500">The listing you're looking for might have been removed or is unavailable.</p>
        <Link href="/" className="rounded-full bg-black px-8 py-3 ty-caption font-bold text-white">
          Back to Listings
        </Link>
      </div>
    );
  }

  const inCart = isInShortlist(property.property_id);
  const saved = isSaved(property.property_id);
  const config = getPropertyConfig(property.type);
  const Icon = config.icon;
  const hasImage = Array.isArray(property.image_urls) && property.image_urls.length > 0;
  const [lat, lng] = getPropertyCoords(property, similarProperties);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Top Section: Only for Heading on Desktop, everything for Mobile */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-28 sm:pt-32 pb-4 sm:pb-6 lg:px-12">
        <div className="flex items-center gap-2 ty-label text-zinc-400 mb-3 sm:mb-4">
          <Link href={`/explore?city=${property.city}`} className="hover:text-zinc-900 transition-colors">
            {property.city}
          </Link>
          <span className="text-zinc-300 font-normal scale-125 px-1">&gt;</span>
          <Link href={`/explore?city=${property.city}&area=${property.area}`} className="hover:text-zinc-900 transition-colors">
            {property.area}
          </Link>
        </div>
        <h1 className="ty-title font-bold text-zinc-900 leading-tight">
          {formatSizeRange(property.size_min, property.size_max, property.size_unit)} {property.type} for sale in {property.area}, {property.city}
        </h1>
      </section>

      {/* Main Grid Content */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* COLUMN 1: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-2 text-zinc-400 ty-micro font-bold uppercase tracking-widest bg-zinc-50/50 w-fit px-3 py-1.5 rounded-lg border border-zinc-100">
                <Calendar className="h-4 w-4" />
                Last Updated: {formatDate(property.approved_on)}
            </div>
            {/* Photo Gallery Area */}
            <div className="relative overflow-hidden md:rounded-3xl aspect-[16/9] md:aspect-auto md:h-[500px] border-b md:border border-zinc-100 -mx-4 md:mx-0 bg-zinc-50">
              {hasImage ? (
                <div className="h-full relative group">
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
                          if (!isDragging) {
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
                            unoptimized
                            className="object-cover"
                            draggable={false}
                            priority
                          />
                        ) : (
                          // Extra Slide for Placeholder
                          <div 
                            onClick={() => setIsPhotoModalOpen(true)}
                            className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="h-16 w-16 mb-6 text-zinc-300" />
                            <p className="ty-title font-bold text-zinc-900 mb-2">Not enough to get idea?</p>
                            <p className="ty-caption text-zinc-500 max-w-sm mb-6">Request more exclusive photos and videos for this property.</p>
                            <button className="rounded-full bg-black px-8 py-3 ty-caption font-bold text-white shadow-xl shadow-black/10 active:scale-95 transition-all">
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
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-xl backdrop-blur-md transition-all hover:bg-white active:scale-90 pointer-events-auto border border-zinc-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          paginate(1);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-xl backdrop-blur-md transition-all hover:bg-white active:scale-90 pointer-events-auto border border-zinc-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full z-10">
                    {heroImageIndex < property.image_urls.length ? `${heroImageIndex + 1} / ${property.image_urls.length}` : 'Request More'}
                  </div>

                  {/* Desktop Thumbnail Strips (Subtle) */}
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
                          "relative h-12 w-16 overflow-hidden rounded-lg border-2 transition-all active:scale-95",
                          heroImageIndex === i ? "border-white shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={url}
                          alt={`Thumb ${i + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // No Photos at all
                <div 
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <Icon className={cn("h-32 w-32 opacity-20", config.color)} />
                    <div className="text-center mt-4">
                      <p className="ty-title font-bold text-zinc-900">No photos available</p>
                      <p className="mt-2 ty-caption text-zinc-500 max-w-sm mb-6">Owner has restricted public photos. You can request exclusive access.</p>
                      <button className="rounded-full bg-black px-8 py-3 ty-caption font-bold text-white shadow-xl shadow-black/10 transition-all active:scale-95">
                        Request photos
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Share and Save Buttons */}
            <div className="flex items-center gap-3 py-4 border-b border-zinc-100 overflow-x-auto no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
              <button 
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: `${property.type} in ${property.area}, ${property.city}`,
                        url: window.location.href
                      });
                    } catch (err) {
                      if (err instanceof Error && err.name !== 'AbortError') {
                        console.error('Error sharing:', err);
                      }
                    }
                  }
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 ty-caption font-bold border border-zinc-200 hover:bg-zinc-50 transition-colors whitespace-nowrap"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button 
                onClick={() => toggleSave(property.property_id)}
                className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 ty-caption font-bold border border-zinc-200 hover:bg-zinc-50 transition-colors whitespace-nowrap",
                    saved && "bg-rose-50 border-rose-100 text-rose-600"
                )}
              >
                <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={scrollToMap}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 ty-caption font-bold border border-zinc-200 hover:bg-zinc-50 transition-colors whitespace-nowrap"
              >
                <MapIcon className="h-4 w-4" />
                Map
              </button>
            </div>

            {/* Highlights Section */}
            {Array.isArray(property.highlights) && property.highlights.length > 0 && (
              <div className="space-y-4">
                <h2 className="ty-title font-bold">Key Highlights</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="ty-caption font-semibold">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-4 pt-4">
              <h2 className="ty-title font-bold">About this listing</h2>
              <p className="ty-body leading-relaxed text-zinc-600">
                {property.description}
              </p>
            </div>

            {/* Modern Details Table */}
            <div className="space-y-6 pt-8 border-t border-zinc-100">
                <h2 className="ty-title font-bold">Listing Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50">
                    {[
                        { label: 'Property Type', value: property.type },
                        { label: 'Listing ID', value: property.public_id },
                        { label: 'City', value: property.city },
                        { label: 'Area', value: property.area },
                        { label: 'Size', value: formatSizeRange(property.size_min, property.size_max, property.size_unit) },
                        { label: 'Price Range', value: formatPriceRange(property.price_min, property.price_max) },
                        { label: 'Status', value: (property.status || 'Active').charAt(0).toUpperCase() + (property.status || 'Active').slice(1) },
                        { label: 'Approved On', value: formatDate(property.approved_on) },
                        { label: 'Landmark', value: property.landmark_location || 'Not specified' },
                        { label: 'Photos', value: property.is_photos_public ? 'Publicly Visible' : 'Verified Request Only' },
                    ].map((item, i) => (
                        <div key={i} className={cn(
                            "flex items-center justify-between p-4 border-b border-zinc-100 md:odd:border-r",
                            i >= 8 ? "border-b-0" : ""
                        )}>
                            <span className="ty-caption font-medium text-zinc-500 uppercase tracking-wider">{item.label}</span>
                            <span className="ty-caption font-bold text-zinc-900">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Section */}
            <div ref={mapSectionRef} className="space-y-6 pt-10 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <h2 className="ty-title font-bold text-zinc-900">On Map</h2>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 ty-caption font-bold text-blue-600 hover:underline hover:underline-offset-4 transition-all"
                >
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="h-[400px] sm:h-[450px] w-full overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
                <MapComponent 
                  properties={[property]}
                  selectedProperty={property}
                  onSelectProperty={() => {}}
                  userLocation={userLocation}
                  showDistance={true}
                  disableCard={true}
                />
              </div>

              <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                {property.landmark_location_distance && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Ruler className="h-4 w-4 text-zinc-400" />
                    <span className="ty-caption font-bold">Within {(property.landmark_location_distance / 1000).toFixed(1)} km radius</span>
                  </div>
                )}

                {userLocation && (
                  <div className="flex items-center gap-6">
                    {property.landmark_location_distance && <div className="hidden sm:block h-4 w-px bg-zinc-200" />}
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Locate className="h-4 w-4 text-emerald-500" />
                      <span className="ty-caption font-bold">{calculateDistance(userLocation.lat, userLocation.lng, lat, lng).toFixed(1)} km from you</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                 <p className="text-[11px] text-zinc-400 italic leading-none font-medium">
                    Location shown is approximate for seller privacy. Exact details shared upon verification.
                 </p>
              </div>
            </div>

            {/* Similar Properties Section */}
            {similarProperties.length > 0 && (
              <div className="space-y-8 pt-12 border-t border-zinc-100">
                <h2 className="ty-display font-bold italic tracking-tight">Similar properties for you</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {similarProperties.map((p) => (
                    <PropertyCard key={p.property_id} property={p} />
                  ))}
                </div>
                
                <div className="pt-8 flex justify-center">
                  <Link 
                    href={`/explore?city=${property.city}&area=${property.area}&type=${property.type}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 ty-caption font-bold text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 md:w-auto md:px-12"
                  >
                    Show more {property.type}s in {property.area}
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: Sticky Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl shadow-black/5 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price Range</span>
                <p className="text-2xl font-bold">{formatPriceRange(property.price_min, property.price_max)}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => inCart ? removeFromShortlist(property.property_id) : addToShortlist(property)}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl py-3 ty-label transition-all active:scale-[0.98] ${inCart ? 'bg-zinc-100 text-black' : 'bg-black text-white'}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {inCart ? 'Remove from Shortlist' : 'Add to Shortlist'}
                </button>
                
                <button 
                  onClick={() => {
                    if (!inCart) {
                      addToShortlist(property);
                    }
                    router.push('/shortlist');
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 py-3 ty-label text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98]"
                >
                  {inCart ? 'Go to Shortlist' : 'Proceed with it'}
                </button>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="ty-label text-zinc-400">Listing Type</p>
                    <p className="ty-caption font-bold text-zinc-900">Direct Listing</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              {property.approved_on && (
                <div className="pt-4 border-t border-zinc-50 text-center ty-micro text-zinc-400 font-medium italic">
                    Last updated on {formatDate(property.approved_on)}
                </div>
              )}
            </div>
          </aside>
          
        </div>
      </section>

      {/* Sticky Bottom CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="ty-label text-zinc-400">Price</span>
            <p className="ty-subtitle font-bold text-zinc-900">{formatPriceRange(property.price_min, property.price_max)}</p>
          </div>
          <button 
            onClick={() => {
              if (!inCart) {
                addToShortlist(property);
              }
              router.push('/shortlist');
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 ty-label text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {inCart ? 'Go to Shortlist' : 'Proceed with it'}
          </button>
        </div>
      </div>



      {/* Photo/Video Request Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
                  <ShieldCheck className="h-8 w-8 text-amber-600" />
                </div>
                
                <h3 className="mb-4 ty-title font-bold text-zinc-900">
                  {hasImage ? 'Request More Photos & Videos' : 'Request Photos & Videos'}
                </h3>
                
                <div className="space-y-4 text-left">
                  <p className="ty-body text-zinc-600 leading-relaxed font-medium">
                    {hasImage 
                      ? "Want to see more details? We can help you get exclusive interior shots or specific area videos." 
                      : "Our platform is designed to be highly transparent. We link all available media, but some owners prefer to keep photos private until a serious interest is shown."}
                  </p>
                  
                  <div className="rounded-2xl bg-zinc-50 p-5 border border-zinc-100 italic">
                    <p className="ty-caption text-zinc-600 leading-relaxed">
                      "Many owners & Partners do not allow us to make their property photos public to protect their privacy and exclusivity."
                    </p>
                  </div>

                  <p className="ty-body text-zinc-600 leading-relaxed font-medium">
                    However, if you are <span className="text-zinc-900 font-bold underline">highly serious</span> about your purchase, we can help. By depositing a <span className="text-emerald-600 font-bold">fully refundable token</span> with us, we can arrange exclusive content for you.
                  </p>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3">
                  <button 
                    onClick={() => {
                      if (!inCart) {
                        addToShortlist(property);
                      }
                      
                      const existing = inquiries[property.property_id] || { 
                        wantSiteVisit: false, 
                        interestedInPurchase: false, 
                        haveQuestion: true, 
                        question: '' 
                      };
                      
                      updateInquiry(property.property_id, {
                        ...existing,
                        haveQuestion: true,
                        question: 'I need photos and video and I am ready to pay the token amount.'
                      });
                      
                      setIsPhotoModalOpen(false);
                      router.push('/shortlist');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 ty-caption font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
                  >
                    Proceed with Token Request
                  </button>
                  <button 
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="flex w-full items-center justify-center py-3 ty-caption font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  100% Refundable Guarantee
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Gallery Lightbox */}
      <AnimatePresence>
        {isGalleryOpen && property && (
          <div className="fixed inset-0 z-[200] flex flex-col bg-black">
            {/* Header / Top Bar */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-[210] flex items-center justify-between p-6 pointer-events-none"
            >
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full pointer-events-auto">
                <span className="text-white text-xs font-black uppercase tracking-widest">
                  {activePhotoIndex + 1} / {property.image_urls.length}
                </span>
              </div>
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90 pointer-events-auto"
              >
                <X className="h-6 w-6" />
              </button>
            </motion.div>

            {/* Main Image View */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhotoIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                    if (swipe) {
                      if (offset.x > 0) {
                        prevPhoto();
                      } else {
                        nextPhoto();
                      }
                    }
                  }}
                  onTap={() => {}}
                  className="relative h-full w-full max-w-5xl cursor-grab"
                >
                  <Image
                    src={property.image_urls[activePhotoIndex]}
                    alt={`Property Photo ${activePhotoIndex + 1}`}
                    fill
                    unoptimized
                    draggable={false}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {property.image_urls.length > 1 && (
                <>
                  <button 
                    onClick={prevPhoto}
                    className="absolute left-6 z-[210] flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={nextPhoto}
                    className="absolute right-6 z-[210] flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip (Bottom) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="mt-auto flex justify-center gap-2 overflow-x-auto p-8 no-scrollbar"
            >
              {property.image_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIndex(i)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all active:scale-95",
                    activePhotoIndex === i ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <Image
                    src={url}
                    alt={`Thumb ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PropertyDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
      </div>
    }>
      <PropertyDetailContent />
    </Suspense>
  );
}
