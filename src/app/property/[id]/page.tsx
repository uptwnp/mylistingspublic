'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPropertyById } from '@/lib/supabase';
import { Property } from '@/types';
import { useDiscussion } from '@/context/DiscussionContext';
import { ArrowLeft, Heart, MessageSquare, MapPin, Ruler, Calendar, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatPrice, formatPriceRange, formatSizeRange, cn } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';



export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInCart, addToCart, removeFromCart, isSaved, toggleSave } = useDiscussion();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        const cleanId = Array.isArray(id) ? id[0] : id;
        const data = await getPropertyById(cleanId);
        setProperty(data as Property);
      } catch (error: any) {
        console.error('Error in fetchProperty:', error?.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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
      {/* Hero Gallery */}
      <section className="relative h-[60vh] w-full overflow-hidden bg-zinc-100">
        <div className="absolute inset-0">
          {hasImage ? (
            <Image
              src={property.image_urls[0]}
              alt={property.description || 'Property Image'}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className={cn("flex h-full w-full flex-col items-center justify-center gap-6", config.bgColor)}>
               <Icon className={cn("h-32 w-32 opacity-20", config.color)} />
               <div className="text-center">
                 <span className={cn("text-xs font-black uppercase tracking-[0.3em] opacity-40", config.color)}>
                   Premium Listing
                 </span>
                 <p className={cn("mt-2 text-sm font-bold opacity-30", config.color)}>No Property Photos Available</p>
               </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Floating Actions */}
        <div className="absolute top-24 left-4 right-4 z-10 mx-auto flex max-w-7xl items-center justify-between sm:px-6 lg:px-8">
          <button 
            onClick={() => router.back()}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="flex gap-3">
            <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20">
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => toggleSave(property.property_id)}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl backdrop-blur-xl transition-all ${saved ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Heart className={`h-6 w-6 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-4 right-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(property.tags) && property.tags.map((tag, i) => (
              <span key={i} className="rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 flex items-center gap-4 text-4xl font-black text-white sm:text-6xl">
            <Icon className="h-10 w-10 sm:h-16 sm:w-16 opacity-70" />
            {property.type} in {property.area}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-zinc-300">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{property.city} • {property.landmark_location}</span>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="mx-auto mt-12 max-w-7xl items-start gap-12 px-4 sm:px-6 lg:flex lg:px-8">
        <div className="flex-1 space-y-12">
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-zinc-100 p-8 sm:grid-cols-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {property.price_min === property.price_max ? 'Price' : 'Price Range'}
              </span>
              <p className="text-xl font-bold">{formatPriceRange(property.price_min, property.price_max)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Size ({property.size_unit})</span>
              <p className="text-xl font-bold">{formatSizeRange(property.size_min, property.size_max, '')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Listing ID</span>
              <p className="text-xl font-bold">{property.public_id}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black">About this listing</h2>
            <p className="text-lg leading-relaxed text-zinc-600">
              {property.description}
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black">Exclusive Highlights</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.isArray(property.highlights) && property.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="font-bold">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Actions */}
        <aside className="mt-12 lg:mt-0 lg:w-96 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-2xl shadow-black/5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Starting Price</span>
                <p className="text-3xl font-black">{formatPrice(property.price_min)}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => inCart ? removeFromCart(property.property_id) : addToCart(property.property_id)}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black uppercase tracking-widest transition-all active:scale-[0.98] ${inCart ? 'bg-zinc-100 text-black' : 'bg-black text-white'}`}
              >
                <MessageSquare className="h-5 w-5" />
                {inCart ? 'Remove from Discussion' : 'Add to Discussion'}
              </button>
              
              <Link 
                href="/discussion-cart"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 py-4 font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98]"
              >
                Discuss Now
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-400">
              No account required. Instant callback available.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
