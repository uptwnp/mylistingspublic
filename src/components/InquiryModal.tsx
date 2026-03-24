'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCircle2, MapPin, ArrowRight, LayoutGrid, ChevronDown, ChevronUp, Bookmark, Home } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useShortlist } from '@/context/ShortlistContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getPropertyConfig } from '@/lib/property-icons';

export function InquiryModal() {
  const router = useRouter();
  const { inquiryProperty, setInquiryProperty, confirmAddToShortlist, inquiries, isInShortlist } = useShortlist();
  const [wantSiteVisit, setWantSiteVisit] = useState(false);
  const [note, setNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (inquiryProperty) {
      const id = typeof inquiryProperty === 'string' ? inquiryProperty : inquiryProperty.property_id;
      const existingInquiry = inquiries[id];
      if (existingInquiry) {
        setWantSiteVisit(existingInquiry.wantSiteVisit);
        setNote(existingInquiry.question || '');
        setIsAdded(true); // already in shortlist → show confirmed state
      } else {
        setWantSiteVisit(false);
        setNote('');
        setIsAdded(false);
      }
      setShowInfo(false);
    }
  }, [inquiryProperty, inquiries]);

  const handleAdd = () => {
    if (!inquiryProperty) return;
    const id = typeof inquiryProperty === 'string' ? inquiryProperty : inquiryProperty.property_id;
    confirmAddToShortlist(id, {
      wantSiteVisit,
      interestedInPurchase: false,
      haveQuestion: note.trim().length > 0,
      question: note.trim()
    });
    setIsAdded(true);
  };

  const handleUpdate = () => {
    if (!inquiryProperty) return;
    const id = typeof inquiryProperty === 'string' ? inquiryProperty : inquiryProperty.property_id;
    confirmAddToShortlist(id, {
      wantSiteVisit,
      interestedInPurchase: false,
      haveQuestion: note.trim().length > 0,
      question: note.trim()
    });
    setIsAdded(true);
  };

  if (!inquiryProperty) return null;

  const property = typeof inquiryProperty === 'string' ? null : inquiryProperty;
  const isEdit = isInShortlist(property?.property_id ?? (inquiryProperty as string));
  const config = property ? getPropertyConfig(property.type) : null;
  const Icon = config?.icon;
  const hasImage = Array.isArray(property?.image_urls) && property!.image_urls.length > 0;

  return (
    <AnimatePresence>
      {inquiryProperty && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInquiryProperty(null)}
            className="fixed inset-0 z-[150] bg-black/25 backdrop-blur-[3px]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[151] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full sm:max-w-sm overflow-hidden rounded-t-[32px] sm:rounded-[28px] bg-white shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Top handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-zinc-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                    isAdded ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"
                  )}>
                    {isAdded ? <CheckCircle2 className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 leading-none">
                      {isAdded ? 'Added to Shortlist' : isEdit ? 'Update Shortlist' : 'Add to Shortlist'}
                    </h2>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5 leading-none">
                      {isAdded ? 'Property saved for consultation' : 'Save & review before consulting'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInquiryProperty(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* What is shortlist — expandable info */}
              <div className="mx-5 mb-3 rounded-2xl border border-zinc-100 overflow-hidden">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="flex w-full items-center justify-between px-4 py-2.5 bg-zinc-50 text-left"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">What is Shortlist?</span>
                  {showInfo ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
                </button>
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-white border-t border-zinc-100 space-y-2 text-[11px] text-zinc-500 leading-relaxed font-medium">
                        <p>A <span className="text-zinc-900 font-bold">Shortlist</span> is your personal wish-list of properties you're interested in.</p>
                        <ul className="space-y-1.5 list-none">
                          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Browse freely, save what you like</li>
                          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Share your list with family or friends</li>
                          <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>Request a callback or site visit for all items at once</li>
                        </ul>
                        <p className="text-zinc-400 italic">No commitment required — just a convenient way to organize.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Body */}
              <div className="px-5 pb-1 space-y-4">

                {/* Property Card */}
                {property && (
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                    isAdded ? "border-emerald-100 bg-emerald-50/60" : "border-zinc-100 bg-zinc-50"
                  )}>
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                      {hasImage ? (
                        <Image
                          src={property.image_urls![0]}
                          alt={property.description || 'Property'}
                          fill
                          className="object-cover"
                        />
                      ) : Icon ? (
                        <div className={cn("flex h-full w-full items-center justify-center", config?.bgColor)}>
                          <Icon className={cn("h-6 w-6 opacity-50", config?.color)} />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-400 text-[8px] font-bold uppercase p-1 text-center">No Image</div>
                      )}
                      {isAdded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[1px]">
                          <div className="bg-emerald-500 rounded-full p-1">
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 leading-tight truncate">{property.type}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5 text-zinc-400 shrink-0" />
                        <span className="text-[10px] font-medium text-zinc-500 truncate">{property.area}, {property.city}</span>
                      </div>
                      <p className="text-xs font-black text-zinc-900 mt-1">{formatPrice(property.price_min)}</p>
                    </div>
                    {isAdded && (
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Saved</span>
                      </div>
                    )}
                  </div>
                )}

                {/* If not yet added — show options */}
                <AnimatePresence mode="wait">
                  {!isAdded ? (
                    <motion.div
                      key="add-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {/* Site Visit Checkbox */}
                      <button
                        type="button"
                        onClick={() => setWantSiteVisit(!wantSiteVisit)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 transition-all text-sm font-semibold text-left active:scale-[0.98]",
                          wantSiteVisit
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-100 bg-zinc-50 text-zinc-600 hover:border-zinc-200"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                          wantSiteVisit ? "bg-white border-white" : "bg-white border-zinc-200"
                        )}>
                          {wantSiteVisit && <Check className="h-3 w-3 text-zinc-900" strokeWidth={3.5} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block leading-none">Want Site Visit</span>
                          <span className={cn("text-[10px] font-medium block mt-0.5", wantSiteVisit ? "text-white/70" : "text-zinc-400")}>
                            We'll arrange a visit for you
                          </span>
                        </div>
                      </button>

                      {/* Optional Note */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                          Note <span className="text-zinc-300 normal-case font-medium tracking-normal">(optional)</span>
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="e.g. Open from two sides? Clear registry?"
                          rows={2}
                          spellCheck={false}
                          className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 text-sm font-medium text-zinc-900 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900/5 placeholder:text-zinc-300 resize-none"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="added-state"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800">Property added to your shortlist!</p>
                        <p className="text-xs font-medium text-emerald-600 mt-0.5">
                          {wantSiteVisit ? 'Site visit requested. ' : ''}
                          {note ? 'Your note is saved.' : 'Go to shortlist to request a callback or consultation.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Buttons */}
              <div className="px-5 pb-5 pt-3 space-y-2">
                {!isAdded ? (
                  <button
                    onClick={isEdit ? handleUpdate : handleAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-black active:scale-[0.98]"
                  >
                    <Bookmark className="h-4 w-4" />
                    {isEdit ? 'Update Shortlist' : 'Add to Shortlist'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setInquiryProperty(null);
                        router.push('/shortlist');
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-xs font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-black active:scale-[0.98]"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Proceed to Shortlist
                    </button>
                    <button
                      onClick={() => setInquiryProperty(null)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-zinc-200 py-3.5 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98]"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      View Properties
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
