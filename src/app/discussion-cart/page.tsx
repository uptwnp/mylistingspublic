'use client';

import { useDiscussion } from '@/context/DiscussionContext';
import { Property } from '@/types';
import { getProperties } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Trash2, Phone, Home, ArrowLeft, Loader2, Building2, Calendar, MapPin, CheckCircle2, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatPriceRange, formatSizeRange } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { cn } from '@/lib/utils';


export default function DiscussionCartPage() {
  const { cartItems, removeFromCart, clearCart } = useDiscussion();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [discussionType, setDiscussionType] = useState<'phone' | 'home' | 'office'>('phone');
  const [isShared, setIsShared] = useState(false);

  const handleShare = () => {
    if (cartItems.length === 0) return;
    
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?cart=${cartItems.join(',')}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    });
  };

  useEffect(() => {
    const fetchCartProperties = async () => {
      if (cartItems.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      
      // For simplicity, we fetch all and filter client side. 
      // In production, we'd use a .in('property_id', cartItems) query.
      const data = await getProperties(0, 100, false);
      const filtered = (data as Property[]).filter(p => cartItems.includes(p.property_id));
      setProperties(filtered);
      setLoading(false);
    };

    fetchCartProperties();
  }, [cartItems]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="mb-6 rounded-full bg-zinc-100 p-6">
              <Home className="h-12 w-12 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-zinc-500">Add properties you're interested in to start a discussion.</p>
            <Link href="/" className="mt-8 rounded-full bg-black px-8 py-3 text-sm font-bold uppercase tracking-widest text-white">
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-3">
            {/* List of Properties */}
            <div className="lg:col-span-2 space-y-8">
              <div className="mb-8">
                <Link href="/" className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black">
                  <ArrowLeft className="h-4 w-4" /> Back to Discover
                </Link>
                <h1 className="text-5xl font-black tracking-tight text-zinc-900 leading-tight">
                  Discussion Cart
                </h1>
                <p className="mt-3 text-lg font-medium text-zinc-500">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} selected for consultation.
                </p>
              </div>
              <AnimatePresence>
                {properties.map((property) => (
                  <motion.div
                    key={property.property_id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md transition-shadow group/card"
                  >
                    {(() => {
                      const config = getPropertyConfig(property.type);
                      const Icon = config.icon;
                      const hasImage = Array.isArray(property.image_urls) && property.image_urls.length > 0;
                      return (
                        <Link href={`/property/${property.property_id}`} className="flex flex-1 gap-4 overflow-hidden">
                          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                            {hasImage ? (
                              <Image 
                                src={property.image_urls[0]} 
                                alt={property.description}
                                fill
                                className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                              />
                            ) : (
                              <div className={cn("flex h-full w-full items-center justify-center transition-colors", config.bgColor)}>
                                <Icon className={cn("h-10 w-10 opacity-30", config.color)} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-zinc-500">
                                ID: {property.property_id}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-400">{property.area}</span>
                            </div>
                            <h3 className="flex items-center gap-2 font-bold text-zinc-900 line-clamp-1 leading-tight group-hover/card:text-blue-600 transition-colors">
                              <Icon className={cn("h-3 w-3", config.color)} />
                              {property.type}
                            </h3>
                            <p className="text-sm font-black text-black mt-1">{formatPrice(property.price_min)}</p>
                          </div>
                        </Link>
                      );
                    })()}
                    <button 
                      onClick={() => removeFromCart(property.property_id)}
                      className="p-2 text-zinc-300 hover:text-rose-500 transition-colors self-center"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Discussion Options */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100 sticky top-32">
                <h2 className="mb-6 text-xl font-black tracking-tight">Consultation Type</h2>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => { setDiscussionType('phone'); setShowForm(true); }}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${discussionType === 'phone' ? 'border-black bg-zinc-50' : 'border-transparent bg-zinc-50 hover:border-zinc-200'}`}
                  >
                    <div className="rounded-full bg-blue-100 p-3 text-blue-600 group-hover:scale-110 transition-transform">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">Phone Callback</h3>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Expert call within 15 mins</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setDiscussionType('home'); setShowForm(true); }}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${discussionType === 'home' ? 'border-black bg-zinc-50' : 'border-transparent bg-zinc-50 hover:border-zinc-200'}`}
                  >
                    <div className="rounded-full bg-amber-100 p-3 text-amber-600 group-hover:scale-110 transition-transform">
                      <Home className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">At-Home Consultation</h3>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Physical visit by our expert</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setDiscussionType('office'); setShowForm(true); }}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${discussionType === 'office' ? 'border-black bg-zinc-50' : 'border-transparent bg-zinc-50 hover:border-zinc-200'}`}
                  >
                    <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">In-Office Meeting</h3>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Visit our HQ for briefing</p>
                    </div>
                  </button>
                </div>

                <div className="mt-8 border-t border-zinc-100 pt-6 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-zinc-500">Summary</span>
                    <span className="text-sm font-black">{properties.length} Items</span>
                  </div>

                  <button 
                    onClick={handleShare}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg ${isShared ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-zinc-900 text-white shadow-zinc-200'}`}
                  >
                    {isShared ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {isShared ? 'Link Copied!' : 'Share Cart'}
                  </button>

                  <button 
                    onClick={clearCart}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-3xl"
              >
                
                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-zinc-400 mb-1">
                        {discussionType === 'phone' && <Phone className="h-3 w-3" />}
                        {discussionType === 'home' && <Home className="h-3 w-3" />}
                        {discussionType === 'office' && <Building2 className="h-3 w-3" />}
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Quick Request</span>
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                        {discussionType === 'phone' ? 'Request Callback' : 
                         discussionType === 'home' ? 'Home Consultation' : 'Office Meeting'}
                      </h2>
                    </div>
                    <button 
                      onClick={() => setShowForm(false)} 
                      className="rounded-full bg-zinc-50 p-2 text-zinc-400 hover:bg-zinc-100 transition-all font-bold"
                    >
                      Close
                    </button>
                  </div>

                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Request Sent Successfully!'); setShowForm(false); clearCart(); }}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                        <input type="text" required className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white" placeholder="John Doe" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Phone Number</label>
                        <input type="tel" required className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white" placeholder="+91 98XXX XXXXX" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Budget Range</label>
                        <select className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white">
                          <option>1 - 3 Cr</option>
                          <option>3 - 5 Cr</option>
                          <option>5 - 10 Cr</option>
                          <option>10Cr+</option>
                        </select>
                      </div>
                      
                      {discussionType === 'office' ? (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Preferred Date</label>
                          <input type="date" required className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white" />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Preferred Time</label>
                          <select className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white">
                            <option>Morning (10 - 1)</option>
                            <option>Afternoon (1 - 4)</option>
                            <option>Evening (4 - 7)</option>
                            <option>Anytime</option>
                          </select>
                        </div>
                      )}
                    </div>

                     {discussionType === 'home' && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                          <MapPin className="h-3 w-3" /> Consultation Address
                        </label>
                        <textarea required className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white" rows={2} placeholder="Enter your full address..."></textarea>
                      </div>
                    )}

                    <div className="rounded-2xl border border-zinc-50 bg-zinc-50/50 p-4">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Items for Discussion ({properties.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {properties.map(p => {
                          const pConfig = getPropertyConfig(p.type);
                          const hasImage = Array.isArray(p.image_urls) && p.image_urls.length > 0;
                          const PIcon = pConfig.icon;
                          return (
                            <div key={p.property_id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm border border-zinc-100/50">
                              <div className="h-3 w-3 rounded overflow-hidden">
                                {hasImage ? (
                                  <Image src={p.image_urls[0]} alt="" width={12} height={12} className="object-cover" />
                                ) : (
                                  <div className={cn("flex h-full w-full items-center justify-center", pConfig.bgColor)}>
                                    <PIcon className={cn("h-full w-full p-[1px] opacity-40", pConfig.color)} />
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] font-bold text-zinc-500">#{p.property_id}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button className="w-full rounded-xl bg-zinc-900 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-black active:scale-[0.98] shadow-lg shadow-zinc-200">
                      Submit Consultation Request
                    </button>
                    
                    <p className="text-center text-[10px] text-zinc-400 font-medium">
                      By submitting, you agree to being contacted by our executive regarding these properties.
                    </p>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
