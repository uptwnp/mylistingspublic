'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, IndianRupee, Maximize2, User, Phone, ArrowRight, CheckCircle2, 
  Landmark, Home, Trees, Search, Locate, MessageCircle, ArrowLeft, Store, ShieldCheck, 
  Users, Globe, Zap, Clock, Briefcase, Trophy, X, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/context/ShortlistContext';
import { useBrand } from '@/context/BrandContext';
import { getAreas, getCities } from '@/lib/supabase';
import { submitPropertyForSaleAction } from '@/app/actions/leads';
import dynamic from 'next/dynamic';

const MapPicker = dynamic<any>(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full items-center justify-center rounded-2xl bg-zinc-100 flex flex-col gap-2">
      <div className="h-6 w-6 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Map...</span>
    </div>
  ),
});

const PROPERTY_TYPES = [
  { id: 'residential_plot', label: 'Residential Plot', icon: Trees },
  { id: 'flat', label: 'Flat/Apartment', icon: Building2 },
  { id: 'house', label: 'House/Villa', icon: Home },
  { id: 'commercial', label: 'Commercial', icon: Store },
  { id: 'other', label: 'Other', icon: Landmark },
];

export function SellClient() {
  const { contactDetails, requireContactDetails, selectedCity: globalCity } = useShortlist();
  const brand = useBrand();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    city: globalCity || 'Panipat',
    area: '',
    price: '',
    size: '',
    description: '',
    location: null as { lat: number; lng: number } | null,
  });

  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  useEffect(() => {
    async function loadData() {
      const cities = await getCities();
      setAllCities(cities);
      const areas = await getAreas(formData.city);
      setAllAreas(areas);
    }
    loadData();
  }, [formData.city]);

  const handleNext = async () => {
    if (activeStep < 5) {
      setActiveStep(prev => prev + 1);
    } else {
      if (!contactDetails) {
        requireContactDetails(() => {});
        return;
      }
      setIsSubmitting(true);
      try {
        await submitPropertyForSaleAction(formData, contactDetails);
        setIsSubmitted(true);
      } catch (error) {
        alert('Something went wrong during submission. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => { if (activeStep > 0) setActiveStep(prev => prev - 1); };
  const updateFormData = (key: string, value: any) => { setFormData(prev => ({ ...prev, [key]: value })); };
  const filteredAreas = allAreas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()));

  const steps = [
    { title: 'Contact', description: 'Confirm your identity' },
    { title: 'Property Type', description: 'What type of property?' },
    { title: 'Location', description: 'City and Area' },
    { title: 'Details', description: 'Size and Pricing' },
    { title: 'Description', description: 'Brief overview' },
    { title: 'Map Pin', description: 'Mark exact location' },
  ];

  return (
    <div className="bg-white">
      {/* ── ELITE HERO ── */}
      <section className="relative pt-32 pb-24 sm:pt-48 sm:pb-40 px-6 overflow-hidden min-h-[75vh] flex items-center bg-white">
        {/* Colorful Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -bottom-10 -right-20 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary ty-micro font-bold tracking-widest uppercase mb-10 shadow-sm">
               <Zap className="h-3.5 w-3.5 fill-brand-primary" /> Skip the Portals
             </span>
             <h1 className="ty-hero font-black tracking-tight text-zinc-900 uppercase mb-8">
               The Direct Route to a <span className="text-brand-primary">Premium Exit</span>
             </h1>
             <p className="mx-auto max-w-xl ty-subtitle font-medium text-zinc-500 mb-12 leading-relaxed">
               Generic portals are crowded and noisy. {brand.name} connects you directly to a private circle of 1 Lakh+ verified, ready investors.
             </p>
             <div className="flex flex-col items-center gap-4">
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="group relative inline-flex items-center gap-6 rounded-full bg-zinc-900 px-10 py-5 transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.99] shadow-2xl shadow-zinc-200"
               >
                 <span className="ty-title font-bold text-white uppercase tracking-tight">Post Your Listing</span>
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 group-hover:bg-brand-primary transition-colors">
                   <ArrowRight className="h-4 w-4 text-white" />
                 </div>
               </button>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="ty-caption font-bold uppercase tracking-widest text-zinc-500">Investor Pool Live</p>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── INCENTIVIZED BY SUCCESS ── */}
      <section className="py-24 sm:py-40 px-6 bg-zinc-50/50 border-y border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[100px] rounded-full -z-10" />
        
        <div className="mx-auto max-w-4xl text-center">
           <h2 className="ty-display font-black text-zinc-900 uppercase mb-4 tracking-tighter">Purely Success-Based.</h2>
           <p className="ty-subtitle text-zinc-500 mb-16 max-w-md mx-auto">Zero listing fees. Zero upfront risk. We only earn when you successfully exit.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-zinc-100 shadow-sm text-left group transition-all hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/5">
                 <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-10 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-7 w-7" />
                 </div>
                 <h3 className="ty-title font-black text-zinc-900 uppercase mb-4 tracking-tight">Verified Listing (Free)</h3>
                 <p className="ty-body text-zinc-500 leading-relaxed font-medium">Get a professional verification and high-authority display for your property without paying a single rupee today.</p>
              </div>
              <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-zinc-100 shadow-sm text-left group transition-all hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/5">
                 <div className="h-14 w-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center mb-10 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    <IndianRupee className="h-7 w-7" />
                 </div>
                 <h3 className="ty-title font-black text-zinc-900 uppercase mb-4 tracking-tight">1% Achievement Fee</h3>
                 <p className="ty-body text-zinc-500 leading-relaxed font-medium">A standardized 1% fee is only payable after you clear the 10% payment milestone with your buyer.</p>
              </div>
           </div>
        </div>
      </section>

      {/* ── PRICE MOMENTUM ── */}
      <section className="py-32 sm:py-48 px-6 overflow-hidden relative bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-orange-500/[0.03] blur-[150px] -z-10" />
        
        <div className="mx-auto max-w-4xl text-center">
           <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 ty-micro font-bold mb-10 uppercase tracking-[0.2em] border border-orange-200/50 shadow-sm">Insider Insight</div>
           <h2 className="ty-hero font-black text-zinc-900 uppercase mb-10 leading-[1.05] tracking-tighter">
             Bad Pricing Kills Momentum, <br/> 
             <span className="bg-gradient-to-r from-orange-400 to-yellow-600 bg-clip-text text-transparent italic">Even for Prime Listings.</span>
           </h2>
           <p className="ty-subtitle font-medium text-zinc-500 max-w-2xl mx-auto leading-relaxed">
             The market never waits for an unrealistic price. Overpricing wastes the critical "New Listing" period. We help you find the sweet spot that triggers immediate, competitive buyer intent.
           </p>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-24 sm:py-40 px-6 bg-zinc-900 border-y border-zinc-800 relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[130px] rounded-full -z-10" />
        
        <div className="mx-auto max-w-3xl">
           <h2 className="ty-display font-black text-white uppercase mb-16 text-center tracking-tight">Common Questions</h2>
           <div className="space-y-4">
              {[
                { q: "What does 'Verified' mean on {brand.name}?", a: "Every listing is cross-checked by our team to ensure the location, ownership status, and property details are 100% accurate before it goes live." },
                { q: "Is the 1% fee negotiable?", a: "To maintain the highest platform quality and provide direct access to thousands of verified buyers, our success fee is standardized at 1% for all residential and commercial properties." },
                { q: "How long does a typical sale take?", a: "Properties priced at market rates typically see serious movement within 14-21 days of listing on the {brand.name} portal." },
                { q: "Can I list multiple properties?", a: "Absolutely. Whether you're an individual owner or an investor, you can manage your entire portfolio from your {brand.name} dashboard." },
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20">
                   <h3 className="ty-title font-black text-white uppercase mb-4 tracking-tight leading-snug">{faq.q}</h3>
                   <p className="ty-body text-zinc-400 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── FINAL CALL ── */}
      <section className="py-32 sm:py-48 px-6 text-center relative bg-white">
        <div className="absolute inset-0 bg-brand-primary/[0.01] -z-10" />
        <div className="mx-auto max-w-4xl text-center">
           <h2 className="ty-display font-black text-zinc-900 uppercase mb-4 tracking-tight">Unlock Market Access</h2>
           <p className="ty-subtitle text-zinc-500 mb-14 max-w-sm mx-auto leading-relaxed">Join the circle of homeowners who skipped the noise and exited successfully on {brand.name}.</p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="tel:+919518091945" className="inline-flex w-full sm:w-auto items-center justify-center gap-4 rounded-full bg-white border-2 border-zinc-100 px-10 py-5 ty-title font-bold text-zinc-900 transition-all hover:border-zinc-900  shadow-xl shadow-zinc-100/50">
                <Phone className="h-5 w-5 text-brand-primary" /> Consult Our Advisors
              </a>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-4 rounded-full bg-brand-primary px-10 py-5 ty-title font-bold text-white shadow-2xl shadow-brand-primary/20 transition-all hover:bg-blue-700 "
              >
                Launch Your Listing <ArrowRight className="h-5 w-5" />
              </button>
           </div>
        </div>
      </section>

      {/* ── CONSOLE MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 sm:p-6"
          >
            <motion.div initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 10 }} 
              className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                 {isSubmitted ? (
                   <div className="text-center py-12">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 className="h-8 w-8" strokeWidth={3} />
                      </div>
                      <h2 className="ty-title font-black text-zinc-900 uppercase tracking-tight mb-2">Listing Submitted</h2>
                      <p className="ty-body text-zinc-500 mb-8 max-w-xs mx-auto">Our team will verify the details and contact you shortly.</p>
                      <a href={`https://wa.me/919518091945?text=${encodeURIComponent(`Hi, I've listed my property on ${brand.name}.\nType: ${formData.type}\nLocation: ${formData.area}, ${formData.city}`)}`} 
                        target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center gap-3 rounded-xl bg-[#25D366] py-4 px-8 ty-micro font-black text-white active:scale-[0.99]"
                      >
                        <MessageCircle className="h-4 w-4 fill-white" /> Continue on WhatsApp
                      </a>
                   </div>
                ) : (
                  <>
                    <div className="mb-10">
                       <div className="flex items-center justify-between mb-8">
                          <div>
                            <p className="ty-micro font-black text-brand-primary tracking-widest">{steps[activeStep].title}</p>
                            <h2 className="ty-title font-black text-zinc-900 uppercase tracking-tight mt-1">{steps[activeStep].description}</h2>
                          </div>
                          <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                       </div>
                       
                       <div className="flex gap-1.5 px-0.5">
                          {steps.map((_, i) => (
                            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500", i <= activeStep ? "bg-brand-primary" : "bg-zinc-100")} />
                          ))}
                       </div>
                    </div>

                    <div className="min-h-[300px]">
                      <AnimatePresence mode="wait">
                        {activeStep === 0 && (
                          <motion.div key="st0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            {contactDetails ? (
                              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6">
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                      <p className="ty-micro font-bold text-zinc-400">Name</p>
                                      <p className="ty-title font-black text-zinc-900">{contactDetails.fullName}</p>
                                   </div>
                                   <div>
                                      <p className="ty-micro font-bold text-zinc-400">Phone</p>
                                      <p className="ty-title font-black text-zinc-900">{contactDetails.phoneNumber}</p>
                                   </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-3xl border-2 border-dashed border-zinc-100 p-12 text-center bg-zinc-50/30">
                                <p className="ty-body text-zinc-400 mb-6">Verification required to proceed.</p>
                                <button onClick={() => requireContactDetails(() => {})} className="rounded-xl bg-zinc-900 px-8 py-4 ty-micro font-black text-white shadow-xl">Contact Information</button>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {activeStep === 1 && (
                          <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 gap-2.5">
                              {PROPERTY_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isActive = formData.type === type.label;
                                return (
                                  <button key={type.id} onClick={() => updateFormData('type', type.label)} 
                                    className={cn("flex items-center justify-between gap-4 rounded-2xl border-2 p-5 transition-all text-left", 
                                    isActive ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-zinc-50 bg-white text-zinc-500 hover:border-zinc-200")}>
                                    <div className="flex items-center gap-4">
                                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400", isActive && "bg-brand-primary/10 text-brand-primary")}>
                                        <Icon className="h-5 w-5" />
                                      </div>
                                      <span className="ty-body font-black tracking-tight uppercase">{type.label}</span>
                                    </div>
                                    <ChevronRight className={cn("h-4 w-4 opacity-0 transition-all", isActive && "opacity-100 translate-x-1")} />
                                  </button>
                                );
                              })}
                          </motion.div>
                        )}

                        {activeStep === 2 && (
                          <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                             <div className="flex flex-wrap gap-2">
                                {allCities.map(c => (
                                  <button key={c} onClick={() => { updateFormData('city', c); updateFormData('area', ''); }} 
                                    className={cn("px-6 py-3 rounded-xl border-2 font-black uppercase ty-micro transition-all", 
                                    formData.city === c ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-zinc-50 hover:border-zinc-100 text-zinc-400")}>
                                    {c}
                                  </button>
                                ))}
                             </div>
                             <div className="relative group">
                                <label className="ty-micro font-black text-zinc-400 mb-2 block">Search Area</label>
                                <input type="text" value={formData.area} onFocus={() => setShowAreaSuggestions(true)}
                                  onChange={(e) => { updateFormData('area', e.target.value); setAreaSearch(e.target.value); }}
                                  className="w-full rounded-2xl border-2 border-zinc-100 py-4 px-6 font-bold text-zinc-900 focus:border-brand-primary outline-none bg-zinc-50/20 transition-all" 
                                  placeholder="e.g. Model Town" />
                                {showAreaSuggestions && filteredAreas.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white shadow-2xl rounded-2xl border border-zinc-100 max-h-48 overflow-y-auto no-scrollbar">
                                      {filteredAreas.map(a => (
                                        <button key={a} onClick={() => { updateFormData('area', a); setShowAreaSuggestions(false); }} 
                                          className="w-full px-6 py-4 text-left font-bold text-zinc-600 hover:bg-zinc-50 hover:text-brand-primary transition-colors border-b border-zinc-50 last:border-0"
                                        >
                                          {a}
                                        </button>
                                      ))}
                                    </div>
                                )}
                             </div>
                          </motion.div>
                        )}

                        {activeStep === 3 && (
                            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <label className="ty-micro font-black text-zinc-400">Asking Price (Cr)</label>
                                 <input type="number" step="0.01" value={formData.price} onChange={(e) => updateFormData('price', e.target.value)} 
                                   className="w-full rounded-2xl border-2 border-zinc-100 py-4 px-6 font-black text-zinc-900 focus:border-brand-primary outline-none" placeholder="0.00" />
                               </div>
                               <div className="space-y-2">
                                 <label className="ty-micro font-black text-zinc-400">Size (Sq. Yards)</label>
                                 <input type="number" value={formData.size} onChange={(e) => updateFormData('size', e.target.value)} 
                                   className="w-full rounded-2xl border-2 border-zinc-100 py-4 px-6 font-black text-zinc-900 focus:border-brand-primary outline-none" placeholder="0" />
                               </div>
                            </motion.div>
                        )}

                        {activeStep === 4 && (
                            <motion.div key="st4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                               <label className="ty-micro font-black text-zinc-400">Short Description</label>
                               <textarea rows={5} value={formData.description} onChange={(e) => updateFormData('description', e.target.value)} 
                                 className="w-full rounded-2xl border-2 border-zinc-100 p-6 font-bold text-zinc-900 focus:border-brand-primary outline-none resize-none bg-zinc-50/20" 
                                 placeholder="Mention key highlights..." />
                            </motion.div>
                        )}

                        {activeStep === 5 && (
                           <div className="rounded-2xl overflow-hidden border-2 border-zinc-100 shadow-inner">
                             <MapPicker center={formData.location} onPick={(loc: any) => updateFormData('location', loc)} city={formData.city} />
                           </div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                      <button onClick={handlePrev} className={cn("ty-micro font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors", activeStep === 0 && "opacity-0 invisible")}>Back</button>
                      <button onClick={handleNext} 
                        disabled={isSubmitting || (!contactDetails && activeStep === 0) || (activeStep === 1 && !formData.type) || (activeStep === 2 && !formData.area) || (activeStep === 3 && (!formData.price || !formData.size))}
                        className="bg-zinc-900 text-white rounded-2xl px-10 py-4 ty-micro font-black shadow-xl transition-all hover:bg-black active:scale-[0.99] disabled:opacity-30">
                        {isSubmitting ? 'Processing...' : activeStep === 5 ? 'Confirm Listing' : 'Continue'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
