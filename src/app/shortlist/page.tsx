'use client';

import { useShortlist } from '@/context/ShortlistContext';
import { Property } from '@/types';
import { getPropertiesByIds } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Trash2, Phone, Home, ArrowLeft, Building2, MapPin, CheckCircle2, Share2, Pencil, Plus, Check, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';
import { MiniImageCarousel } from '@/components/MiniImageCarousel';
import { useRouter } from 'next/navigation';


export default function ShortlistPage() {
  const router = useRouter();
  const { shortlistItems, inquiries, updateInquiry, removeFromShortlist, clearShortlist, requireContactDetails, contactDetails, consultationRequests, addConsultationRequest, updateConsultationRequest, removeConsultationRequest, isInitialized } = useShortlist();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinalStep, setShowFinalStep] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [preferredTime, setPreferredTime] = useState('Anytime');
  const [preferredDate, setPreferredDate] = useState('');
  const [shortlistType, setShortlistType] = useState<'phone' | 'home' | 'office' | 'site'>('phone');
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    if (shortlistItems.length === 0) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?shortlist=${shortlistItems.join(',')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Property Shortlist',
          text: `Check out the ${shortlistItems.length} ${shortlistItems.length === 1 ? 'property' : 'properties'} I shortlisted`,
          url: shareUrl,
        });
      } catch {
        // user cancelled or share failed — silently ignore
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      });
    }
  };



  useEffect(() => {
    if (!isInitialized) return;

    const fetchShortlistProperties = async () => {
      if (shortlistItems.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      
      try {
        const data = await getPropertiesByIds(shortlistItems.slice(0, 20));
        setProperties(data as Property[]);
      } catch (err) {
        console.error('Failed to fetch shortlist properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShortlistProperties();
  }, [shortlistItems, isInitialized]);

  if (!isInitialized || (loading && shortlistItems.length > 0)) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-3">
             <div className="lg:col-span-2 space-y-6 animate-pulse">
                <div className="h-4 w-48 bg-zinc-200 rounded-full mb-8" />
                <div className="h-12 w-64 bg-zinc-200 rounded-2xl mb-8" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 w-full bg-white rounded-2xl p-4 shadow-sm border border-zinc-100" />
                ))}
             </div>
             <div className="h-[500px] w-full bg-white rounded-3xl animate-pulse shadow-sm border border-zinc-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 sm:pt-32 pb-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">


        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 sm:p-12 text-center shadow-sm">
            <div className="mb-4 sm:mb-6 rounded-full bg-zinc-100 p-4 sm:p-6">
              <Home className="h-8 w-8 sm:h-12 sm:w-12 text-zinc-400" />
            </div>
            <h2 className="ty-title font-bold">Your shortlist is empty</h2>
            <p className="mt-2 ty-caption text-zinc-500">Add properties you're interested in to your shortlist.</p>
            <Link href="/explore" className="mt-6 sm:mt-8 rounded-full bg-black px-6 sm:px-8 py-2.5 sm:py-3 ty-caption font-bold uppercase tracking-widest text-white">
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
            {/* List of Properties */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="mb-4 sm:mb-8 px-2 sm:px-0">
                <Link href="/explore" className="mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-500 hover:text-black">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Discover
                </Link>
                 <div>
                   <div className="flex items-center justify-between gap-3">
                     <h1 className="ty-display font-bold tracking-tight text-zinc-900 leading-tight">
                       Shortlist
                     </h1>
                     <button 
                       onClick={handleShare}
                       title={isShared ? 'Link Copied!' : 'Share Shortlist'}
                       className={cn(
                         "flex items-center justify-center p-1.5 transition-all active:scale-[0.98]",
                         isShared ? "text-emerald-500" : "text-zinc-400 hover:text-zinc-700"
                       )}
                     >
                       {isShared ? <CheckCircle2 className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                     </button>
                   </div>
                   <p className="mt-1.5 ty-caption font-medium text-zinc-500">
                     {properties.length} {properties.length === 1 ? 'property' : 'properties'} selected for consultation.
                   </p>
                 </div>
               </div>

               <AnimatePresence mode="popLayout">
                 {properties.map((property) => {
                  const inquiry = inquiries[property.property_id];
                  return (
                    <motion.div
                      key={property.property_id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-3 rounded-2xl bg-white p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-shadow group/card border border-zinc-100/50"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        {(() => {
                          const config = getPropertyConfig(property.type);
                          const Icon = config.icon;
                          const hasImage = Array.isArray(property.image_urls) && property.image_urls.length > 0;
                          return (
                            <div className="flex flex-1 gap-3 sm:gap-4 overflow-hidden">
                              <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                                {hasImage ? (
                                  <MiniImageCarousel 
                                    images={property.image_urls} 
                                    alt={property.description} 
                                    onTap={() => router.push(`/property/${property.property_id}`)}
                                  />
                                ) : (
                                  <div 
                                    onClick={() => router.push(`/property/${property.property_id}`)}
                                    className={cn("flex h-full w-full items-center justify-center transition-colors cursor-pointer", config.bgColor)}
                                  >
                                    <Icon className={cn("h-8 w-8 sm:h-10 sm:w-10 opacity-30", config.color)} />
                                  </div>
                                )}
                              </div>
                              <Link href={`/property/${property.property_id}`} className="flex flex-1 flex-col justify-center min-w-0">
                                <h3 className="font-bold text-zinc-900 text-sm sm:text-base line-clamp-1 leading-tight group-hover/card:text-blue-600 transition-colors">
                                  {property.type}
                                </h3>
                                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 truncate mt-0.5">{property.area}{property.city ? `, ${property.city}` : ''}</p>
                                <p className="ty-caption font-bold text-black mt-0.5 sm:mt-1">{formatPrice(property.price_min)}</p>
                                <span className="mt-1 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-zinc-500 w-fit">
                                  ID: {property.property_id}
                                </span>
                              </Link>
                            </div>
                          );
                        })()}
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this property from your shortlist?')) {
                              removeFromShortlist(property.property_id);
                            }
                          }}
                          className="p-1.5 sm:p-2 text-zinc-300 hover:text-rose-500 transition-colors self-center"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>

                      {/* Note Section */}
                      {(() => {
                        const hasNote = inquiries[property.property_id]?.question;
                        const isEditing = editingNoteId === property.property_id;
                        return (
                          <div className="mx-1 mb-1">
                            <AnimatePresence mode="wait">
                              {isEditing ? (
                                <motion.div
                                  key="editing"
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="flex flex-col gap-2"
                                >
                                  <textarea
                                    autoFocus
                                    rows={2}
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="e.g. Open from two sides? Clear registry available?"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-medium text-zinc-900 outline-none resize-none transition-all focus:border-zinc-900 focus:bg-white placeholder:text-zinc-300"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        const existing = inquiries[property.property_id] || { wantSiteVisit: false, interestedInPurchase: false, haveQuestion: false, question: '' };
                                        updateInquiry(property.property_id, {
                                          ...existing,
                                          haveQuestion: noteText.trim().length > 0,
                                          question: noteText.trim(),
                                        });
                                        setEditingNoteId(null);
                                      }}
                                      className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[10px] font-bold text-white transition-all active:scale-[0.98]"
                                    >
                                      <Check className="h-3 w-3" strokeWidth={3} />
                                      Save Note
                                    </button>
                                    <button
                                      onClick={() => setEditingNoteId(null)}
                                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[10px] font-bold text-zinc-500 transition-all hover:bg-zinc-50 active:scale-[0.98]"
                                    >
                                      <X className="h-3 w-3" />
                                      Cancel
                                    </button>
                                  </div>
                                </motion.div>
                              ) : hasNote ? (
                                <motion.div
                                  key="has-note"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-start justify-between gap-2 rounded-xl bg-blue-50/60 border border-blue-100/70 px-3 py-2.5"
                                >
                                  <p className="text-[11px] font-medium text-blue-800 leading-relaxed italic flex-1">
                                    "{inquiries[property.property_id].question}"
                                  </p>
                                  <button
                                    onClick={() => {
                                      setNoteText(inquiries[property.property_id]?.question || '');
                                      setEditingNoteId(property.property_id);
                                    }}
                                    className="shrink-0 flex items-center gap-1 rounded-lg border border-blue-100 bg-white px-2 py-1 text-[9px] font-bold text-blue-500 shadow-sm transition-all hover:border-blue-200 active:scale-[0.98]"
                                  >
                                    <Pencil className="h-2.5 w-2.5" />
                                    Edit
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  key="add-note"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  onClick={() => {
                                    setNoteText('');
                                    setEditingNoteId(property.property_id);
                                  }}
                                  className="flex w-full items-center gap-1.5 rounded-xl border border-dashed border-zinc-200 px-3 py-2 text-[10px] font-bold text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 transition-all active:scale-[0.98]"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add a note for this property
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })()}
                    </motion.div>
                  );
                 })}

                 <motion.div 
                   key="clear-all"
                   layout
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="flex justify-center mt-8"
                 >
                   <button 
                     onClick={() => {
                       if (window.confirm('Are you sure you want to clear your entire shortlist?')) {
                         clearShortlist();
                       }
                     }}
                     className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all border border-dashed border-zinc-200 hover:border-rose-100"
                   >
                     <Trash2 className="h-3.5 w-3.5" />
                     Clear Entire Shortlist
                   </button>
                 </motion.div>
               </AnimatePresence>
            </div>

            {/* Shortlist Options */}
            <div className="space-y-6 lg:block pb-24 lg:pb-0">
              <aside className="rounded-3xl bg-white p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100 lg:sticky lg:top-32">
                 
                 {consultationRequests.length > 0 ? (
                   <div className="space-y-6">
                     <div className="flex items-center justify-between">
                       <h2 className="ty-title font-bold tracking-tight">Active Request</h2>
                       <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              const req = consultationRequests[0];
                              setShortlistType(req.type);
                              setPreferredTime(req.preferredTime || 'Anytime');
                              setPreferredDate(req.preferredDate || '');
                              setEditingRequestId(req.id);
                              setShowFinalStep(true);
                            }}
                            className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => removeConsultationRequest(consultationRequests[0].id)}
                            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                     </div>

                     <div className="rounded-2xl bg-zinc-50 p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2.5 rounded-xl bg-white shadow-sm border border-zinc-100",
                            consultationRequests[0].type === 'phone' ? "text-blue-600" :
                            consultationRequests[0].type === 'home' ? "text-amber-600" : "text-zinc-900"
                          )}>
                            {consultationRequests[0].type === 'phone' && <Phone className="h-5 w-5" />}
                            {consultationRequests[0].type === 'home' && <Home className="h-5 w-5" />}
                            {consultationRequests[0].type === 'office' && <Building2 className="h-5 w-5" />}
                            {consultationRequests[0].type === 'site' && <MapPin className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {consultationRequests[0].type === 'phone' ? 'Call Discussion' :
                               consultationRequests[0].type === 'home' ? 'Meeting at Place' :
                               consultationRequests[0].type === 'office' ? 'Office Visit' : 'Site Visit'}
                            </p>
                            <p className="text-xs font-bold text-zinc-900">
                              {consultationRequests[0].preferredDate ? `Date: ${consultationRequests[0].preferredDate}` : `Time: ${consultationRequests[0].preferredTime}`}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-200/50">
                           <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Properties ({consultationRequests[0].propertyIds.length})</p>
                           <div className="flex flex-wrap gap-1.5">
                              {consultationRequests[0].propertyIds.slice(0, 5).map(id => (
                                <span key={id} className="text-[9px] font-bold text-zinc-500 bg-white px-2 py-0.5 rounded-lg border border-zinc-100">#{id}</span>
                              ))}
                              {consultationRequests[0].propertyIds.length > 5 && (
                                <span className="text-[9px] font-bold text-zinc-400">+{consultationRequests[0].propertyIds.length - 5}</span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-start gap-3 p-1">
                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse shrink-0" />
                        <div className="flex-1">
                           <p className="text-[11px] font-bold text-zinc-900">Sync Shortlist Live</p>
                           <p className="text-[9px] font-medium text-zinc-400">Agent sees changes as you add items</p>
                        </div>
                     </div>

                     <div className="bg-blue-50 rounded-2xl p-4 flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-900 leading-tight">Request Logged</p>
                          <p className="text-[10px] font-medium text-blue-700/80 mt-1">Our agent will contact you shortly to confirm details.</p>
                        </div>
                     </div>
                     
                     <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                        <p className="text-[10px] font-bold text-rose-600 leading-relaxed italic">
                           * Please confirm before leaving your place for any site visit, meeting etc. as without prior confirmation agent might not be available to attend you.
                        </p>
                     </div>
                   </div>
                 ) : (
                   <>
                    <h2 className="mb-6 ty-title font-bold tracking-tight">Proceed with</h2>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setShortlistType('phone');
                          requireContactDetails(() => setShowFinalStep(true));
                        }}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${shortlistType === 'phone' ? 'border-zinc-900 bg-zinc-50 shadow-sm' : 'border-transparent bg-zinc-50/70 hover:border-zinc-200'}`}
                      >
                        <div className="rounded-full bg-blue-100 p-3 text-blue-600 group-hover:scale-110 transition-transform">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">Call Discussion</h3>
                          <p className="text-[10px] font-medium text-zinc-500">Time to get callback or our contact info</p>
                        </div>
                      </button>
  
                      <button 
                        onClick={() => {
                          setShortlistType('home');
                          requireContactDetails(() => setShowFinalStep(true));
                        }}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${shortlistType === 'home' ? 'border-zinc-900 bg-zinc-50 shadow-sm' : 'border-transparent bg-zinc-50/70 hover:border-zinc-200'}`}
                      >
                        <div className="rounded-full bg-amber-100 p-3 text-amber-600 group-hover:scale-110 transition-transform">
                          <Home className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">Meeting at your Place</h3>
                          <p className="text-[10px] font-medium text-zinc-500">add exact home address, time</p>
                        </div>
                      </button>
  
                      <button 
                        onClick={() => {
                          setShortlistType('office');
                          requireContactDetails(() => setShowFinalStep(true));
                        }}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${shortlistType === 'office' ? 'border-zinc-900 bg-zinc-50 shadow-sm' : 'border-transparent bg-zinc-50/70 hover:border-zinc-200'}`}
                      >
                        <div className="rounded-full bg-blue-100 p-3 text-brand-primary group-hover:scale-110 transition-transform">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">Visit our Office</h3>
                          <p className="text-[10px] font-medium text-zinc-500">get our office address and fix a time</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setShortlistType('site');
                          requireContactDetails(() => setShowFinalStep(true));
                        }}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${shortlistType === 'site' ? 'border-zinc-900 bg-zinc-50 shadow-sm' : 'border-transparent bg-zinc-50/70 hover:border-zinc-200'}`}
                      >
                        <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 group-hover:scale-110 transition-transform">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">Site Visits</h3>
                          <p className="text-[10px] font-medium text-zinc-500">take their time and schedule</p>
                        </div>
                      </button>
                    </div>
                    
                    <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
                        <p className="text-[9px] font-bold text-rose-500/80 leading-relaxed uppercase tracking-wider mb-2">Important Disclaimer:</p>
                        <p className="text-[10px] font-medium text-rose-600 leading-relaxed">
                          Please confirm before leaving your place for any site visit, meeting etc. as without prior confirmation agent might not be available to attend you.
                        </p>
                    </div>
                   </>
                 )}
               </aside>
             </div>
            
            {/* Sticky Mobile Bottom Bar for Shortlist */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-zinc-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:hidden">
              <button 
                onClick={() => requireContactDetails(() => setShowFinalStep(true))}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-zinc-200 active:scale-[0.98] transition-all"
              >
                Proceed to Consultation ({properties.length})
              </button>
            </div>
          </div>
        )}

        {/* Final Detail Form (Preferred Time/Date) */}
        <AnimatePresence>
          {showFinalStep && contactDetails && (
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
                        {shortlistType === 'phone' && <Phone className="h-3 w-3" />}
                        {shortlistType === 'home' && <Home className="h-3 w-3" />}
                        {shortlistType === 'office' && <Building2 className="h-3 w-3" />}
                        {shortlistType === 'site' && <MapPin className="h-3 w-3" />}
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Final Details</span>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Confirm Consultation
                      </h2>
                    </div>
                    <button 
                      onClick={() => { setShowFinalStep(false); setEditingRequestId(null); }} 
                      className="rounded-full bg-zinc-50 p-2 text-zinc-400 hover:bg-zinc-100 transition-all font-bold"
                    >
                      Close
                    </button>
                  </div>
 
                  <form 
                    className="space-y-6" 
                    onSubmit={(e) => { 
                      e.preventDefault(); 
                      if (editingRequestId) {
                        updateConsultationRequest(editingRequestId, {
                          type: shortlistType,
                          preferredTime: shortlistType !== 'office' ? preferredTime : undefined,
                          preferredDate: shortlistType === 'office' ? preferredDate : undefined,
                        });
                      } else {
                        addConsultationRequest({
                          type: shortlistType,
                          propertyIds: shortlistItems,
                          contactDetails: contactDetails!,
                          preferredTime: shortlistType !== 'office' && shortlistType !== 'site' ? preferredTime : undefined,
                          preferredDate: shortlistType === 'office' || shortlistType === 'site' ? preferredDate : undefined,
                          isSyncEnabled: true, // Default ON
                        });
                      }
                      alert(editingRequestId ? 'Request Updated Successfully!' : 'Consultation Request Sent!'); 
                      setShowFinalStep(false); 
                      setEditingRequestId(null);
                    }}
                  >
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact Details</p>
                          <p className="text-sm font-bold text-zinc-900 mt-1">{contactDetails.fullName}</p>
                          <p className="text-xs font-medium text-zinc-500">{contactDetails.phoneNumber} • {contactDetails.address}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => { setShowFinalStep(false); requireContactDetails(() => setShowFinalStep(true), true); }}
                          className="text-[10px] font-black uppercase tracking-widest text-brand-primary"
                        >
                          Change
                        </button>
                      </div>
                    </div>
 
                    <div className="grid gap-4 sm:grid-cols-1">
                      {(shortlistType === 'office' || shortlistType === 'site') ? (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Preferred Date</label>
                          <input 
                            type="date" 
                            required 
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white" 
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Preferred Time</label>
                          <select 
                            value={preferredTime}
                            onChange={(e) => setPreferredTime(e.target.value)}
                            className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white"
                          >
                            <option>Morning (10 - 1)</option>
                            <option>Afternoon (1 - 4)</option>
                            <option>Evening (4 - 7)</option>
                            <option>Anytime</option>
                          </select>
                        </div>
                      )}
                    </div>
 
                    <div className="rounded-2xl border border-zinc-50 bg-zinc-50/50 p-4">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Items in Shortlist ({properties.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {properties.map(p => {
                          const pConfig = getPropertyConfig(p.type);
                          const hasImage = Array.isArray(p.image_urls) && p.image_urls.length > 0;
                          const PIcon = pConfig.icon;
                          return (
                            <div key={p.property_id} className="group relative">
                              <div className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm border border-zinc-100/50">
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
 
                    <button className="w-full rounded-xl bg-zinc-900 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-black active:scale-[0.98] shadow-lg shadow-zinc-200">
                      Submit Consultation Request
                    </button>
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
