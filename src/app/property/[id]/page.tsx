'use client';
export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPropertyById } from '@/lib/supabase';
import { Property } from '@/types';
import { useDiscussion } from '@/context/DiscussionContext';
import { useRef } from 'react';
import { ArrowLeft, Heart, ShoppingCart, MapPin, Ruler, Calendar, CheckCircle2, ShieldCheck, Share2, Navigation, Map as MapIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatPriceRange, formatSizeRange, cn, calculateDistance } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { getProperties } from '@/lib/supabase';
import { PropertyCard } from '@/components/PropertyCard';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-zinc-100 flex items-center justify-center font-bold text-zinc-400">Loading Map...</div>
});



export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { isInCart, addToCart, removeFromCart, isSaved, toggleSave } = useDiscussion();
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

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
          // Fetch similar properties
          const similar = await getProperties(0, 5, false, data.city, data.type) as Property[];
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
        <h1 className="text-3xl font-black">Property Not Found</h1>
        <p className="text-zinc-500">The listing you're looking for might have been removed or is unavailable.</p>
        <Link href="/" className="rounded-full bg-black px-8 py-3 font-bold text-white">
          Back to Listings
        </Link>
      </div>
    );
  }

  const inCart = isInCart(property.property_id);
  const saved = isSaved(property.property_id);
  const config = getPropertyConfig(property.type);
  const Icon = config.icon;
  const hasImage = Array.isArray(property.image_urls) && property.image_urls.length > 0;


  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Top Section: Only for Heading on Desktop, everything for Mobile */}
      <section className="mx-auto max-w-[1440px] px-6 pt-32 pb-6 lg:px-12">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
          <Link href={`/explore?city=${property.city}`} className="hover:text-zinc-900 transition-colors">
            {property.city}
          </Link>
          <span className="text-zinc-300 font-normal scale-125 px-1">&gt;</span>
          <Link href={`/explore?city=${property.city}&area=${property.area}`} className="hover:text-zinc-900 transition-colors">
            {property.area}
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          {formatSizeRange(property.size_min, property.size_max, '')} {property.size_unit} {property.type} for sale in {property.area}, {property.city}
        </h1>
      </section>

      {/* Main Grid Content */}
      <section className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* COLUMN 1: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Photo Gallery Area */}
            <div className="relative overflow-hidden rounded-3xl aspect-[16/9] md:aspect-auto md:h-[500px] border border-zinc-100">
               {/* Request Photo/Video Button - Always show on top right overlay */}
               <button 
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute top-6 right-6 z-10 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-md px-4 py-2.5 text-xs font-black shadow-xl transition-all hover:bg-white active:scale-95 border border-zinc-100 text-zinc-900 group"
                >
                  <ShoppingCart className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900" />
                  Request Photos & Videos
                </button>

              {hasImage ? (
                property.image_urls.length === 1 ? (
                  // Single Photo Full View
                  <div 
                    onClick={() => openGallery(0)}
                    className="relative h-full w-full bg-zinc-100 cursor-pointer group"
                  >
                    <Image
                      src={property.image_urls[0]}
                      alt={property.description || 'Property Image'}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>
                ) : (
                  // Multi Photo Grid (Airbnb Style)
                  <div className="grid grid-cols-2 grid-rows-2 h-full gap-2 md:grid-cols-4 lg:gap-3">
                    <div 
                      onClick={() => openGallery(0)}
                      className="relative col-span-2 row-span-2 bg-zinc-100 overflow-hidden cursor-pointer group"
                    >
                      <Image
                        src={property.image_urls[0]}
                        alt={property.description || 'Property Image'}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                    </div>
                    {property.image_urls.slice(1, 5).map((url, i) => (
                      <div 
                        key={i} 
                        onClick={() => openGallery(i + 1)}
                        className="relative hidden md:block bg-zinc-100 overflow-hidden cursor-pointer group"
                      >
                        <Image
                          src={url}
                          alt={`Property image ${i + 2}`}
                          unoptimized
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ))}
                    {property.image_urls.length < 5 && Array.from({ length: 5 - property.image_urls.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="hidden md:flex items-center justify-center bg-zinc-50/50 border border-zinc-100/50">
                        <Icon className="h-12 w-12 text-zinc-100" />
                      </div>
                    ))}
                    <button 
                      onClick={() => openGallery(0)}
                      className="absolute bottom-6 left-6 flex items-center gap-2 rounded-lg border border-black/10 bg-black/5 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-black/20 active:scale-95"
                    >
                      <svg viewBox="0 0 16 16" className="h-4 w-4 fill-white" aria-hidden="true" focusable="false"><path d="M5 2a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm6 0a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm-6 6a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm6 0a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm-6 6a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm6 0a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"></path></svg>
                      Show all {property.image_urls.length} photos
                    </button>
                  </div>
                )
              ) : (
                <div className={cn("flex h-full w-full flex-col items-center justify-center gap-6", config.bgColor)}>
                   <div className="flex flex-col items-center">
                    <Icon className={cn("h-32 w-32 opacity-20", config.color)} />
                    <div className="text-center mt-4">
                      <span className={cn("text-xs font-black uppercase tracking-[0.3em] opacity-40", config.color)}>Premium Listing</span>
                      <p className={cn("mt-2 text-sm font-bold opacity-30", config.color)}>No Property Photos Available</p>
                    </div>
                   </div>
                   <div className="h-10" /> {/* Spacer for the overlay button */}
                </div>
              )}
            </div>

            {/* Share and Save Buttons */}
            <div className="flex items-center gap-4 py-4 border-b border-zinc-100">
              <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border border-zinc-200 hover:bg-zinc-50 transition-colors">
                <Share2 className="h-4 w-4" />
                Share this property
              </button>
              <button 
                onClick={() => toggleSave(property.property_id)}
                className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border border-zinc-200 hover:bg-zinc-50 transition-colors",
                    saved && "bg-rose-50 border-rose-100 text-rose-600"
                )}
              >
                <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
                {saved ? 'Saved in Favorites' : 'Save to Favorites'}
              </button>
              <button 
                onClick={scrollToMap}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                <MapIcon className="h-4 w-4" />
                View on Map
              </button>
            </div>

            {/* Highlights Section */}
            {Array.isArray(property.highlights) && property.highlights.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Key Highlights</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="font-semibold text-sm">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold">About this listing</h2>
              <p className="text-lg leading-relaxed text-zinc-600">
                {property.description}
              </p>
            </div>

            {/* Modern Details Table */}
            <div className="space-y-6 pt-8 border-t border-zinc-100">
                <h2 className="text-xl font-bold">Listing Details</h2>
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
                            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{item.label}</span>
                            <span className="text-sm font-bold text-zinc-900">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Section */}
            <div ref={mapSectionRef} className="space-y-6 pt-8 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Where you'll be</h2>
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                      <MapPin className="h-4 w-4" />
                      <span>{property.area}, {property.city}</span>
                  </div>
              </div>
              <div className="h-[400px] w-full overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
                  <MapComponent 
                      properties={[property]}
                      selectedProperty={property}
                      onSelectProperty={() => {}}
                      userLocation={userLocation}
                  />
              </div>
              {property.landmark_location && (
                  <p className="text-sm text-zinc-500 font-medium">
                      Landmark: {property.landmark_location} {property.landmark_location_distance ? `(${property.landmark_location_distance} km away)` : ''}
                  </p>
              )}
              <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                * The location shown on the map is an approximate area for privacy reasons. The exact property location will be shared during the site visit or upon verification.
              </p>
            </div>

            {/* Similar Properties Section */}
            {similarProperties.length > 0 && (
              <div className="space-y-8 pt-12 border-t border-zinc-100">
                <h2 className="text-2xl font-bold italic tracking-tight">Similar properties for you</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {similarProperties.map((p) => (
                    <PropertyCard key={p.property_id} property={p} />
                  ))}
                </div>
                
                <div className="pt-8 flex justify-center">
                  <Link 
                    href={`/explore?city=${property.city}&area=${property.area}&type=${property.type}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-4 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 md:w-auto md:px-12"
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
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price Range</span>
                <p className="text-3xl font-black">{formatPriceRange(property.price_min, property.price_max)}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => inCart ? removeFromCart(property.property_id) : addToCart(property)}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black uppercase tracking-widest transition-all active:scale-[0.98] ${inCart ? 'bg-zinc-100 text-black' : 'bg-black text-white'}`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {inCart ? 'Remove from Discussion' : 'Add to Discussion'}
                </button>
                
                <button 
                  onClick={() => {
                    if (inCart) {
                      router.push('/discussion-cart');
                    } else {
                      addToCart(property);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 py-4 font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98]"
                >
                  Discuss Now
                </button>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Listing Type</p>
                    <p className="font-bold text-zinc-900">Direct Listing</p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              {property.approved_on && (
                <div className="pt-4 border-t border-zinc-50 text-center text-[10px] text-zinc-400 font-medium italic">
                    Last updated on {formatDate(property.approved_on)}
                </div>
              )}
            </div>
          </aside>
          
        </div>
      </section>

      {/* Floating View on Map for mobile */}
      <button 
        onClick={scrollToMap}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95 md:hidden"
      >
        <MapIcon className="h-4 w-4" />
        View on Map
      </button>

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
                
                <h3 className="mb-4 text-2xl font-black text-zinc-900">Request Photos & Videos</h3>
                
                <div className="space-y-4 text-left">
                  <p className="text-zinc-600 leading-relaxed font-medium">
                    Our platform is designed to be highly transparent. If it was possible for us to add photos and videos, we would have definitely linked them here.
                  </p>
                  
                  <div className="rounded-2xl bg-zinc-50 p-5 border border-zinc-100 italic">
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      "Many owners & Partners do not allow us to make their property photos public to protect their privacy and exclusivity."
                    </p>
                  </div>

                  <p className="text-zinc-600 leading-relaxed font-medium">
                    However, if you are <span className="text-zinc-900 font-bold underline">highly serious</span> about your purchase, we can help. By depositing a <span className="text-emerald-600 font-bold">fully refundable token</span> with us, we can arrange exclusive photos and videos for you without requiring a physical site visit.
                  </p>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3">
                  <button 
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
                  >
                    Proceed with Token Request
                  </button>
                  <button 
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="flex w-full items-center justify-center py-4 text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
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
                  className="relative h-full w-full max-w-5xl"
                >
                  <Image
                    src={property.image_urls[activePhotoIndex]}
                    alt={`Property Photo ${activePhotoIndex + 1}`}
                    fill
                    unoptimized
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
