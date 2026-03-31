'use client';

import { useShortlist } from '@/context/ShortlistContext';
import { Property } from '@/types';
import { getPropertiesByIds } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { Trash2, Phone, Home, ArrowLeft, Building2, MapPin, CheckCircle2, Share2, Pencil, Plus, Check, X, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice, formatPriceRange } from '@/lib/utils';
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
  const [shortlistType, setShortlistType] = useState<'phone' | 'office' | 'site'>('phone');
  const [selectedOfficeAddress, setSelectedOfficeAddress] = useState(0);
  const [isShared, setIsShared] = useState(false);
  const [showCallNowSheet, setShowCallNowSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPricingCard, setShowPricingCard] = useState(true);
  const [isMobileDeskOpen, setIsMobileDeskOpen] = useState(false);

  // Load pricing card preference
  useEffect(() => {
    const hidden = localStorage.getItem('hide_pricing_card_shortlist');
    if (hidden === 'true') {
      setShowPricingCard(false);
    } else {
      trackEvent('viewed_pricing_card', { page: 'shortlist' });
    }
  }, []);

  // Lock body scroll when mobile desk/modals are open
  useEffect(() => {
    if (isMobileDeskOpen || showCallNowSheet || showFinalStep) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileDeskOpen, showCallNowSheet, showFinalStep]);

  const OFFICE_ADDRESSES = [
    { label: 'Panipat – Sector 18', address: 'SCO 83, Sector 18', nearby: 'Nearby Toll' },
    { label: 'Panipat – Sanoli Road', address: 'Opp CNG Pump, Sanoli Road, Panipat', nearby: 'Nearby Sector 24' },
    { label: 'Panipat – Virat Nagar', address: 'Bal Vikash Road, Virat Nagar', nearby: 'Near Modal Town' },
  ];

  // Reusable Consultation Desk Content
  const ConsultationDesk = ({ isOverlay = false, onClose = () => {} }: { isOverlay?: boolean, onClose?: () => void }) => (
    <div className={cn("flex flex-col h-full", isOverlay ? "p-6 sm:p-8" : "")}>
      {isOverlay && (
            <div className="flex items-center justify-between mb-8 shrink-0">
           <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-800 shadow-xl shadow-blue-800/20">
                <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
             </div>
             <h2 className="text-xl font-black tracking-tight text-zinc-900 leading-none">Proceed to Next</h2>
           </div>
           <button 
             onClick={onClose}
             className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-all active:scale-90"
           >
             <X className="h-5 w-5" strokeWidth={3} />
           </button>
        </div>
      )}

      {!isOverlay && (
        <div className="pb-6">
          <h2 className="text-xl font-black leading-tight tracking-tight text-zinc-900">Proceed Next</h2>
          <p className="mt-1.5 text-[11px] font-medium text-zinc-500 leading-relaxed max-w-[200px]">
            Pick your preferred way to discuss this shortlist.
          </p>
        </div>
      )}

      <div className="space-y-2 flex-1 overflow-y-auto overscroll-contain pr-1 py-1 min-h-0 no-scrollbar">
        {/* ── Quick Next Action ── */}
        <div className="flex items-center gap-3 pb-2 pt-1 border-t border-zinc-50 mt-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 shrink-0 flex items-center gap-2 mt-4">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-900 animate-pulse" />
            Quickly Proceed
          </p>
          <div className="h-px flex-1 bg-zinc-100 mt-4" />
        </div>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/919518091945?text=${encodeURIComponent(
            `Hi! I'd like to discuss my shortlist.\n\n` +
            (contactDetails ? `*My Details:*\nName: ${contactDetails.fullName}\nPhone: ${contactDetails.phoneNumber}\nAddress: ${contactDetails.address}\n\n` : '') +
            `*My Shortlist (${properties.length} ${properties.length === 1 ? 'property' : 'properties'}):*\n` +
            properties.map((p, i) => {
              const note = inquiries[p.property_id]?.question;
              return `${i + 1}. ${p.type} – ${p.area}${p.city ? `, ${p.city}` : ''} (#${p.property_id})${note ? `\n   Note: ${note}` : ''}`;
            }).join('\n') +
            `\n\n*View Shortlist:* ${typeof window !== 'undefined' ? window.location.origin : ''}/shortlist?shortlist=${shortlistItems.join(',')}${(() => {
                const notesToShare: Record<string, string> = {};
                shortlistItems.forEach(id => { if (inquiries[id]?.question) notesToShare[id] = inquiries[id].question; });
                return Object.keys(notesToShare).length > 0 ? `&notes=${encodeURIComponent(JSON.stringify(notesToShare))}` : '';
            })()}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('proceed_to_whatsapp', { property_count: properties.length })}
          className="group flex w-full items-center gap-3 sm:gap-4 rounded-xl bg-[#128C7E] px-4 sm:px-5 py-4 text-white hover:bg-[#0e7268] active:scale-[0.99] transition-all shadow-xl shadow-[#128C7E]/20"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.857L.054 23.447a.75.75 0 00.943.897l5.878-1.88A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.71 9.71 0 01-4.95-1.354l-.355-.212-3.686 1.179 1.13-3.573-.232-.369A9.75 9.75 0 1112 21.75z"/></svg>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black leading-tight">WhatsApp</p>
            <p className="text-[10px] sm:text-[11px] font-bold opacity-70 mt-0.5">Send list + chat</p>
          </div>
          <svg className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </a>

        {/* ── Preferred ── */}
        <div className="flex items-center gap-3 pt-4 sm:pt-6 pb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400 shrink-0">Preferred Way</p>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        <button
          onClick={() => { setShortlistType('phone'); requireContactDetails(() => { setShowFinalStep(true); onClose(); }); }}
          className="group relative flex w-full items-center gap-3 sm:gap-4 rounded-xl border border-[#88aaff] bg-blue-50/40 px-4 sm:px-5 py-4.5 text-zinc-900 transition-all active:scale-[0.99] shadow-lg shadow-blue-500/10 overflow-hidden shimmer-premium-loop"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black leading-tight text-blue-900">Get Call Back</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-blue-600/60 mt-0.5">We&apos;ll call to discuss</p>
          </div>
          <svg className="h-4 w-4 text-blue-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>

        {/* ── Also Available ── */}
        <div className="flex items-center gap-3 pt-4 sm:pt-6 pb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-zinc-400 shrink-0">Also Available</p>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        {/* Site Visit */}
        <button
          onClick={() => { setShortlistType('site'); requireContactDetails(() => { setShowFinalStep(true); onClose(); }); }}
          className="group flex w-full items-center gap-3 sm:gap-4 rounded-xl border-2 border-zinc-100 bg-white px-4 sm:px-5 py-4.5 text-zinc-900 hover:border-zinc-200 hover:bg-zinc-50 active:scale-[0.99] transition-all"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black leading-tight text-zinc-900">Schedule Site Visit</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 mt-0.5">Visit in person</p>
          </div>
          <svg className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>

        {/* Office Visit */}
        <button
          onClick={() => { setShortlistType('office'); requireContactDetails(() => { setShowFinalStep(true); onClose(); }); }}
          className="group flex w-full items-center gap-3 sm:gap-4 rounded-xl border-2 border-zinc-100 bg-white px-4 sm:px-5 py-4.5 text-zinc-900 hover:border-zinc-200 hover:bg-zinc-50 active:scale-[0.99] transition-all"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black leading-tight text-zinc-900">Visit Our Office</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 mt-0.5">Meet us at location</p>
          </div>
          <svg className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>

        {/* Direct Call */}
        <button
          onClick={() => { setShowCallNowSheet(true); if(isOverlay) onClose(); }}
          className="group flex w-full items-center gap-3 sm:gap-4 rounded-xl border-2 border-zinc-100 bg-white px-4 sm:px-5 py-4.5 text-zinc-900 hover:border-zinc-200 hover:bg-zinc-50 active:scale-[0.99] transition-all"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-50">
            <Phone className="h-5 w-5 text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black leading-tight text-zinc-900">Direct Call</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 mt-0.5">Instant connection</p>
          </div>
          <svg className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );

  const handleShare = async () => {
    if (shortlistItems.length === 0) return;

    const baseUrl = window.location.origin + window.location.pathname;
    
    // Encode notes for sharing
    const notesToShare: Record<string, string> = {};
    shortlistItems.forEach(id => {
      if (inquiries[id]?.question) {
        notesToShare[id] = inquiries[id].question;
      }
    });
    
    let shareUrl = `${baseUrl}?shortlist=${shortlistItems.join(',')}`;
    if (Object.keys(notesToShare).length > 0) {
      shareUrl += `&notes=${encodeURIComponent(JSON.stringify(notesToShare))}`;
    }

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
        // Deduplicate by property_id — guards against stale duplicate IDs in localStorage
        const seen = new Set<string>();
        const unique = (data as Property[]).filter(p => {
          if (seen.has(p.property_id)) return false;
          seen.add(p.property_id);
          return true;
        });
        setProperties(unique);
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
    <div className="min-h-screen bg-zinc-50 pt-24 sm:pt-32 pb-20 overflow-x-hidden">
      <div className="mx-auto max-w-[1440px] px-3.5 sm:px-6 lg:px-12">


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
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
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
                         isShared ? "text-blue-500" : "text-zinc-400 hover:text-zinc-700"
                       )}
                     >
                       {isShared ? <CheckCircle2 className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                     </button>
                   </div>
                    <p className="mt-1.5 ty-caption font-medium text-zinc-500">
                      {properties.length} {properties.length === 1 ? 'property' : 'properties'} saved · review and take action below.
                    </p>
                  </div>
               </div>

               {consultationRequests.length > 0 && (
                  <div className="mb-8 overflow-hidden rounded-3xl bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50">
                    {/* Status Header */}
                    <div className="border-b border-zinc-50 bg-zinc-50/50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-normal sm:tracking-wider text-zinc-900 leading-none">Active Consultation Request</h2>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 tracking-tight">Live Sync Active</span>
                        </div>
                        <div className="w-px h-4 bg-zinc-200 mx-1" />
                        <button 
                          onClick={() => {
                            const req = consultationRequests[0];
                            setShortlistType(req.type as 'phone' | 'office' | 'site');
                            setPreferredTime(req.preferredTime || 'Anytime');
                            setPreferredDate(req.preferredDate || '');
                            setEditingRequestId(req.id);
                            setShowFinalStep(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => removeConsultationRequest(consultationRequests[0].id)}
                          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                      {/* Method */}
                      <div className="p-4 sm:p-6 flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl bg-zinc-100/50 flex-shrink-0",
                          consultationRequests[0].type === 'phone' ? "text-blue-600" :
                          consultationRequests[0].type === 'office' ? "text-blue-600" : "text-blue-600"
                        )}>
                          {consultationRequests[0].type === 'phone' && <Phone className="h-5 w-5" />}
                          {consultationRequests[0].type === 'office' && <Building2 className="h-5 w-5" />}
                          {consultationRequests[0].type === 'site' && <MapPin className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Method</p>
                          <p className="text-sm font-black text-zinc-900 leading-none truncate">
                            {consultationRequests[0].type === 'phone' ? 'Phone Discussion' :
                             consultationRequests[0].type === 'office' ? 'Office Visit' : 'Site Visit'}
                          </p>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="p-4 sm:p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-zinc-100/50 text-zinc-900 flex-shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Preferred Time</p>
                          <p className="text-sm font-black text-zinc-900 leading-none truncate">
                            {consultationRequests[0].preferredDate ? consultationRequests[0].preferredDate : consultationRequests[0].preferredTime}
                          </p>
                        </div>
                      </div>

                      {/* Selection */}
                      <div className="p-4 sm:p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-zinc-100/50 text-zinc-900 flex-shrink-0">
                          <Home className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Selected Items</p>
                          <p className="text-sm font-black text-zinc-900 leading-none truncate">
                            {consultationRequests[0].propertyIds.length} Properties
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-50 border-t border-zinc-100 px-4 sm:px-6 py-3">
                      <p className="text-[10px] font-bold text-zinc-400 italic">
                        An agent will contact you shortly to confirm and proceed with your selected properties.
                      </p>
                    </div>
                  </div>
                )}
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
                          const iconUrl = config.iconUrl;
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
                                    <img 
                                      src={iconUrl} 
                                      alt={property.type} 
                                      className="h-8 w-8 sm:h-10 sm:w-10 object-contain" 
                                    />
                                  </div>
                                )}
                              </div>
                              <Link href={`/property/${property.property_id}`} className="flex flex-1 flex-col justify-center min-w-0">
                                <h3 className="font-bold text-zinc-900 text-sm sm:text-base line-clamp-1 leading-tight group-hover/card:text-blue-600 transition-colors">
                                  {property.type}
                                </h3>
                                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 truncate mt-0.5">{property.area}{property.city ? `, ${property.city}` : ''}</p>
                                <p className="ty-caption font-bold text-black mt-0.5 sm:mt-1">{formatPriceRange(property.price_min, property.price_max)}</p>
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
                                    // Save any open note first to avoid silent discard
                                    if (editingNoteId && editingNoteId !== property.property_id) {
                                      const existing = inquiries[editingNoteId] || { wantSiteVisit: false, interestedInPurchase: false, haveQuestion: false, question: '' };
                                      updateInquiry(editingNoteId, { ...existing, haveQuestion: noteText.trim().length > 0, question: noteText.trim() });
                                    }
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
               </AnimatePresence>

               <AnimatePresence>
                 {showPricingCard && (
                    <motion.div 
                      key="pricing-card"
                      layout
                      initial={{ opacity: 0, scale: 0.98, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1, y: 15 }}
                      whileHover={{ scale: 1.002 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                      className="relative w-full overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white p-5 sm:p-7 text-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.05)] my-6 group border border-zinc-100"
                    >
                      {/* Premium Accent Glow (Light) */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.04),transparent_75%)] pointer-events-none" />
                      
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pr-8 sm:pr-0">
                          <div className="space-y-2 min-w-0 flex-1">
                             <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 backdrop-blur-3xl mb-0.5">
                                <Zap className="h-2.5 w-2.5 text-blue-500 fill-blue-500/10" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-600">
                                   Pricing Structure
                                </span>
                             </div>
                             <h2 className="text-lg sm:text-xl font-black leading-tight text-zinc-900 tracking-tight">
                                Zero Upfront Fees ⚡
                             </h2>
                             <p className="text-xs sm:text-sm font-medium text-zinc-500 leading-relaxed max-w-md">
                                Pay only <span className="text-zinc-900 font-black underline underline-offset-4 decoration-blue-200">1% brokerage</span> — payable after booking. No upfront costs. 🤝
                             </p>
                          </div>
                          <button 
                          onClick={() => {
                            trackEvent('dismissed_pricing_card', { page: 'shortlist' });
                            setShowPricingCard(false);
                            localStorage.setItem('hide_pricing_card_shortlist', 'true');
                          }}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[20] p-2 sm:p-3 rounded-xl bg-zinc-100/50 hover:bg-zinc-100 transition-all border border-zinc-200/50 active:scale-95 group/close"
                          >
                            <X className="h-3.5 w-3.5 sm:h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className="flex items-center gap-6 pt-6 mt-6 border-t border-zinc-100 overflow-x-auto no-scrollbar pb-2 w-full">
                           <div className="flex items-center gap-3 group/item shrink-0">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 shrink-0 group-hover/item:bg-blue-100 transition-all">
                                 <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover/item:text-zinc-900 transition-colors whitespace-nowrap">Free Site Visits</p>
                           </div>
                           <div className="flex items-center gap-3 group/item shrink-0">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 shrink-0 group-hover/item:bg-blue-100 transition-all">
                                 <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover/item:text-zinc-900 transition-colors whitespace-nowrap">Legal Support</p>
                           </div>
                           <div className="flex items-center gap-3 group/item shrink-0">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 shrink-0 group-hover/item:bg-blue-100 transition-all">
                                 <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover/item:text-zinc-900 transition-colors whitespace-nowrap">Loan Support</p>
                           </div>
                        </div>
                      </div>

                      {/* Premium Accent */}
                      <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" />
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none" />
                      <div className="absolute right-4 bottom-4 opacity-[0.03] rotate-[15deg] pointer-events-none group-hover:opacity-[0.05] transition-all">
                         <Zap className="h-32 w-32 fill-zinc-900" />
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>

               <AnimatePresence>
                 {properties.length > 10 && (
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
                 )}
               </AnimatePresence>
             </div>

             {/* Consultation Desk (Desktop Sidebar) */}
             <aside className="hidden lg:block lg:col-span-1">
               <div className="sticky top-32 rounded-3xl bg-white p-8 border border-zinc-100 shadow-xl shadow-zinc-200/40">
                  <ConsultationDesk />
               </div>
             </aside>
           </div>
         )}

         {/* Mobile Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] block p-4 lg:hidden">
              <div className="mx-auto max-w-lg">
                <button
                  onClick={() => setIsMobileDeskOpen(true)}
                  className="flex w-full items-center justify-between rounded-3xl border border-[#88aaff] bg-white px-6 py-5 text-zinc-900 shadow-[0_15px_45px_rgba(37,99,235,0.08)] transition-all active:scale-[0.98] shimmer-premium-loop relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
                      <Zap className="h-5 w-5 text-blue-600 fill-blue-600/10" />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1.5">Call/Whatsapp/Meeting</p>
                      <p className="text-sm font-black leading-none text-zinc-900">Proceed Next Step</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-blue-50 p-2">
                    <ArrowLeft className="h-4 w-4 rotate-180 text-blue-600" />
                  </div>
                </button>
              </div>
            </div>

        {/* Mobile Consultation Desk Overlay */}
        <AnimatePresence>
          {isMobileDeskOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDeskOpen(false)}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col h-[70vh] max-h-[70vh] rounded-t-[2.5rem] bg-white shadow-2xl overflow-hidden shadow-black/50 no-scrollbar"
              >
                <ConsultationDesk isOverlay onClose={() => setIsMobileDeskOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Call Now Bottom Sheet */}
        <AnimatePresence>
          {showCallNowSheet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-900/60 backdrop-blur-sm p-4 sm:items-center"
              onClick={() => setShowCallNowSheet(false)}
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-zinc-200" />
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <div className="mt-0.5 shrink-0 rounded-lg bg-amber-100 p-1.5 text-amber-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-800 leading-snug">Heads up before you call</p>
                    <p className="text-[10px] font-medium text-amber-700/80 mt-1 leading-relaxed">
                       The agent <span className="font-bold">won&apos;t know your shortlist</span> on call — they don&apos;t have the inventory details in front of them. We recommend <button onClick={() => { setShowCallNowSheet(false); setShortlistType('phone'); requireContactDetails(() => setShowFinalStep(true)); }} className="text-blue-600 font-bold underline underline-offset-2">&quot;Get Call Back&quot;</button> so you can share the list first.
                    </p>
                  </div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-3">Still want to call?</p>
                <a
                  href="tel:+919518091945"
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 py-4 text-sm font-bold text-white shadow-lg hover:bg-black active:scale-[0.99] transition-all"
                >
                  <Phone className="h-4 w-4" />
                  Call Now — +91 95180 91945
                </a>
                <button
                  onClick={() => setShowCallNowSheet(false)}
                  className="mt-3 w-full rounded-2xl border border-zinc-100 py-3 text-xs font-bold text-zinc-400 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



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
                  {!showSuccess && (
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {shortlistType === 'phone' && <Phone className="h-3 w-3 text-blue-500" />}
                        {shortlistType === 'office' && <Building2 className="h-3 w-3 text-zinc-500" />}
                        {shortlistType === 'site' && <MapPin className="h-3 w-3 text-blue-500" />}
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                          {shortlistType === 'phone' ? 'Call Back Request' : shortlistType === 'office' ? 'Office Visit' : 'Site Visit'}
                        </span>
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-zinc-900 leading-tight">
                        {shortlistType === 'phone' ? 'Schedule a Call Back' : shortlistType === 'office' ? 'Visit our Office' : 'Schedule Site Visit'}
                      </h2>
                      <p className="text-[10px] font-medium text-zinc-400 mt-1 leading-relaxed">
                        {shortlistType === 'phone' ? "We'll call you to discuss your shortlisted properties." : shortlistType === 'office' ? "Fix a time and we'll share our office address." : "Pick a date and we'll arrange the property visit."}
                      </p>
                    </div>
                    <button 
                      onClick={() => { setShowFinalStep(false); setEditingRequestId(null); }} 
                      className="rounded-full bg-zinc-50 p-2 text-zinc-400 hover:bg-zinc-100 transition-all font-bold shrink-0"
                    >
                      Close
                    </button>
                  </div>
                  )}

                  {/* ── SUCCESS STATE ── */}
                  <AnimatePresence mode="wait">
                  {showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center pt-2 pb-4 gap-5"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border-2 border-blue-100">
                        <CheckCircle2 className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-zinc-900 leading-tight">
                          {editingRequestId
                            ? 'Request Updated!'
                            : shortlistType === 'phone'
                              ? 'Call Back Scheduled!'
                              : 'Request Sent — Pending Confirmation'}
                        </p>
                        <p className="text-xs font-medium text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                          {shortlistType === 'phone'
                            ? "Our agent will call you shortly. You can also ping us on WhatsApp."
                            : shortlistType === 'office'
                              ? "We'll confirm your office visit on a call or WhatsApp before you come."
                              : "We'll confirm your site visit on a call or WhatsApp before you head out."}
                        </p>
                      </div>

                      {/* Disclaimer for physical visits */}
                      {(shortlistType === 'site' || shortlistType === 'office') && (
                        <div className="w-full flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-left">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                          </svg>
                          <p className="text-[10px] font-medium text-rose-600 leading-relaxed text-left">
                            <span className="font-bold">Important:</span> Please confirm before leaving your place for any site visit, meeting etc. as without prior confirmation agent might not be available to attend you.
                          </p>
                        </div>
                      )}

                      <a
                        href={`https://wa.me/919518091945?text=${encodeURIComponent(
                          `Hi! I've submitted a *${shortlistType === 'phone' ? 'Call Back Request' : shortlistType === 'office' ? 'Office Visit Booking' : 'Site Visit Request'}*.\n\n` +
                          `*My Details:*\n` +
                          `Name: ${contactDetails?.fullName || ''}\n` +
                          `Phone: ${contactDetails?.phoneNumber || ''}\n` +
                          `Address: ${contactDetails?.address || ''}\n\n` +
                          `*Request Details:*\n` +
                          (shortlistType === 'office'
                            ? `Office Location: ${OFFICE_ADDRESSES[selectedOfficeAddress].address} (${OFFICE_ADDRESSES[selectedOfficeAddress].nearby})\nPreferred Date & Time: ${preferredDate || 'Not specified'}`
                            : shortlistType === 'site'
                              ? `Preferred Date & Time: ${preferredDate || 'Not specified'}`
                              : `Preferred Time: ${preferredTime}`) + `\n\n` +
                          `*My Shortlist (${properties.length} ${properties.length === 1 ? 'property' : 'properties'}):*\n` +
                          properties.map((p, i) => `${i + 1}. ${p.type} – ${p.area}${p.city ? `, ${p.city}` : ''} (#${p.property_id})`).join('\n') +
                          `\n\n*View Shortlist:* ${typeof window !== 'undefined' ? window.location.origin : ''}/shortlist?shortlist=${shortlistItems.join(',')}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#128C7E] py-4 text-sm font-bold text-white hover:bg-[#0e7268] active:scale-[0.99] transition-all shadow-md shadow-[#128C7E]/15"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.857L.054 23.447a.75.75 0 00.943.897l5.878-1.88A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.71 9.71 0 01-4.95-1.354l-.355-.212-3.686 1.179 1.13-3.573-.232-.369A9.75 9.75 0 1112 21.75z"/></svg>
                        Say Hi on WhatsApp
                      </a>
                      <button
                        onClick={() => { setShowFinalStep(false); setEditingRequestId(null); setShowSuccess(false); }}
                        className="w-full rounded-2xl border border-zinc-100 py-3 text-xs font-bold text-zinc-400 hover:bg-zinc-50 transition-all"
                      >
                        Done
                      </button>
                    </motion.div>
                  ) : (
 
                  <form 
                    className="space-y-6" 
                    onSubmit={(e) => { 
                      e.preventDefault();
                      if (editingRequestId) {
                        updateConsultationRequest(editingRequestId, {
                          type: shortlistType,
                          preferredTime: shortlistType === 'phone' ? preferredTime : undefined,
                          preferredDate: shortlistType !== 'phone' ? preferredDate : undefined,
                        });
                      } else {
                        addConsultationRequest({
                          type: shortlistType,
                          propertyIds: shortlistItems,
                          contactDetails: contactDetails!,
                          preferredTime: shortlistType === 'phone' ? preferredTime : undefined,
                          preferredDate: shortlistType !== 'phone' ? preferredDate : undefined,
                          isSyncEnabled: true,
                          ...(shortlistType === 'office' ? { officeAddress: OFFICE_ADDRESSES[selectedOfficeAddress].address } : {}),
                        } as any);
                      }
                      setShowSuccess(true); setEditingRequestId(null);
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
                        <div className="space-y-3">
                          {shortlistType === 'office' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Select Office Location</label>
                              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
                                {OFFICE_ADDRESSES.map((office, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedOfficeAddress(idx)}
                                    className={cn(
                                      'flex-shrink-0 w-44 flex flex-col gap-2 rounded-xl border-2 px-3 py-3 text-left transition-all snap-start',
                                      selectedOfficeAddress === idx
                                        ? 'border-zinc-900 bg-zinc-900 text-white'
                                        : 'border-zinc-100 bg-zinc-50 text-zinc-700 hover:border-zinc-300'
                                    )}
                                  >
                                    <div className={cn(
                                      'h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
                                      selectedOfficeAddress === idx ? 'border-white' : 'border-zinc-300'
                                    )}>
                                      {selectedOfficeAddress === idx && <div className="h-2 w-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-black leading-tight">{office.label}</p>
                                      <p className={cn('text-[10px] font-medium mt-1 leading-snug', selectedOfficeAddress === idx ? 'text-zinc-300' : 'text-zinc-500')}>{office.address}</p>
                                      <p className={cn('text-[9px] font-bold mt-1', selectedOfficeAddress === idx ? 'text-zinc-400' : 'text-zinc-400')}>{office.nearby}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Preferred Date &amp; Time</label>
                            <input 
                              type="datetime-local" 
                              required 
                              value={preferredDate}
                              onChange={(e) => setPreferredDate(e.target.value)}
                              className="w-full rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-zinc-900 focus:bg-white" 
                            />
                          </div>
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
                          return (
                            <div key={p.property_id} className="group relative">
                              <div className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm border border-zinc-100/50">
                                <div className="h-3 w-3 rounded overflow-hidden">
                                  {hasImage ? (
                                    <Image src={p.image_urls[0]} alt="" width={12} height={12} className="object-cover" />
                                  ) : (
                                    <div className={cn("flex h-full w-full items-center justify-center", pConfig.bgColor)}>
                                      <img 
                                        src={pConfig.iconUrl} 
                                        alt={p.type} 
                                        className="h-full w-full p-[1px] object-contain" 
                                      />
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
                      {shortlistType === 'phone' ? 'Request Call Back' : shortlistType === 'office' ? 'Book Office Visit' : 'Confirm Site Visit'}
                    </button>
                   </form>
                  )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
