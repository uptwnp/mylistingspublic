'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, IndianRupee, Maximize2, User, Phone, ArrowRight, CheckCircle2, 
  Landmark, Home, Trees, Search, Locate, MessageCircle, ArrowLeft, Store, ShieldCheck, 
  Users, Globe, Zap, Clock, Briefcase, Trophy, X 
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
    { title: 'Contact', description: 'Confirm your details' },
    { title: 'Property Type', description: 'What are you selling?' },
    { title: 'Location', description: 'Where is it?' },
    { title: 'Scale', description: 'Size and Pricing' },
    { title: 'Details', description: 'Add a description' },
    { title: 'Coordinates', description: 'Pin point on map' },
  ];

  return (
    <>
      <section className="relative pt-24 sm:pt-40 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
             <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-brand-primary ty-micro font-black tracking-widest uppercase mb-6">Property Listing Network</span>
             <h1 className="ty-display font-black tracking-tight text-zinc-900 uppercase leading-[0.9] mb-8">
               Sell Your Property to a <br/> 
               <span className="text-zinc-400">Verified Investor Network.</span>
             </h1>
             <p className="mx-auto max-w-xl ty-subtitle font-medium text-zinc-500 leading-relaxed mb-10">
               Direct access to our specialized private investor network. List your property and receive serious inquiries from verified buyers.
             </p>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="inline-flex items-center gap-4 rounded-[28px] bg-zinc-900 px-12 py-6 ty-title font-bold text-white shadow-2xl shadow-zinc-300 transition-all hover:bg-black hover:scale-[1.05] active:scale-95"
             >
               Start Listing Now <ArrowRight className="h-5 w-5" />
             </button>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-20">
            {[
              { label: 'Verified Audience', value: 'Investors', icon: Users },
              { label: 'Prime Focus', value: 'Growth', icon: Globe },
              { label: 'Secure Hub', value: 'Protected', icon: ShieldCheck },
              { label: 'Fast Updates', value: 'Real-time', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-8 rounded-[40px] bg-zinc-50 border border-zinc-100 text-center">
                <stat.icon className="h-4 w-4 text-brand-primary mb-3" strokeWidth={3} />
                <span className="ty-title font-black text-zinc-900 uppercase tracking-tight">{stat.value}</span>
                <span className="ty-micro font-bold text-zinc-400 uppercase tracking-widest mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 sm:px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="ty-display font-black tracking-tight text-zinc-900 uppercase">List in 3 Minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-8 relative">
             {[
               { title: "Tell About You", desc: "Contact details for verification.", icon: User },
               { title: "Property Basics", desc: "Type, category, and city selection.", icon: Building2 },
               { title: "Size & Price", desc: "Sq.Yds, value, and description.", icon: Maximize2 },
               { title: "Exact Location", desc: "Mark the precise pin on the map.", icon: MapPin },
               { title: "Review & Visit", desc: "Final check and official site visit.", icon: ShieldCheck },
             ].map((step, i) => (
               <button key={i} onClick={() => setIsModalOpen(true)} className="group relative z-10 flex flex-col items-center text-center transition-all hover:translate-y-[-4px]">
                 <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-zinc-200 border border-zinc-100 relative group-hover:border-brand-primary transition-all">
                   <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center shadow-md">0{i + 1}</span>
                   <step.icon className="h-6 w-6 text-brand-primary" strokeWidth={2.5} />
                 </div>
                 <h3 className="ty-micro font-black text-zinc-900 uppercase tracking-widest mb-2 leading-tight px-1 group-hover:text-brand-primary transition-colors">{step.title}</h3>
                 <p className="ty-caption font-medium text-zinc-400 group-hover:text-zinc-500 transition-colors leading-tight">{step.desc}</p>
               </button>
             ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
            <div className="rounded-[40px] bg-zinc-900 p-8 sm:p-16 relative overflow-hidden text-white/90">
                <h2 className="ty-display font-black text-white uppercase tracking-tight mb-4">No Upfront Listing Fees</h2>
                <p className="ty-subtitle font-medium text-zinc-400 mb-10 max-w-2xl mx-auto">Listing and verification are free. We charge a 1% success fee once the booking is done.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/10"><p className="text-2xl font-black text-emerald-400">FREE</p></div>
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/10"><p className="text-2xl font-black text-emerald-400">FREE</p></div>
                   <div className="p-6 rounded-3xl bg-white/10 border border-brand-primary/50"><p className="text-2xl font-black text-brand-primary">1%</p></div>
                </div>
            </div>
        </div>
      </section>

      <section className="py-32 text-center px-4 sm:px-6">
         <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter mb-10">Ready to List?</h2>
         <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-4 rounded-full bg-zinc-900 px-12 py-5 ty-title font-bold text-white shadow-2xl transition-all hover:bg-black active:scale-95">
           Open Listing Console <ArrowRight className="h-5 w-5" />
         </button>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-10">
            <motion.div initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 10 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-3xl flex flex-col">
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10">
                 {isSubmitted ? (
                   <div className="text-center py-12">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl">
                        <CheckCircle2 className="h-8 w-8" strokeWidth={3} />
                      </div>
                      <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-2">Listing Submitted</h2>
                      <a href={`https://wa.me/919518091945?text=${encodeURIComponent(`Hi, I've listed my property on ${brand.name}.\nType: ${formData.type}\nLocation: ${formData.area}, ${formData.city}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-[#25D366] py-4 px-10 text-sm font-black text-white active:scale-95">
                        <MessageCircle className="h-5 w-5 fill-white" /> Send Photos on WhatsApp
                      </a>
                   </div>
                ) : (
                  <>
                    <div className="mb-10">
                       <div className="flex items-center justify-between mb-4">
                          <h1 className="text-lg font-black text-zinc-900 uppercase tracking-widest">List Your Property</h1>
                          <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 hover:text-zinc-900"><X className="h-4 w-4" /></button>
                       </div>
                       <div className="flex gap-1.5 mb-8">
                          {steps.map((_, i) => (
                            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", i <= activeStep ? "bg-brand-primary" : "bg-zinc-100")} />
                          ))}
                       </div>
                       <p className="ty-micro font-black text-zinc-400 uppercase tracking-widest">{steps[activeStep].description}</p>
                    </div>
                    <div className="min-h-[380px]">
                      <AnimatePresence mode="wait">
                        {activeStep === 0 && (
                          <motion.div key="st0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Identify Yourself</label>
                            {contactDetails ? (
                              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verified Name</p>
                                      <p className="font-black text-zinc-900">{contactDetails.fullName}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mobile Number</p>
                                      <p className="font-black text-zinc-900">{contactDetails.phoneNumber}</p>
                                   </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border-2 border-dashed border-zinc-100 p-10 text-center bg-zinc-50">
                                <button onClick={() => requireContactDetails(() => {})} className="rounded-xl bg-zinc-900 px-8 py-3.5 text-xs font-bold text-white shadow-lg">Enter Details</button>
                              </div>
                            )}
                          </motion.div>
                        )}
                        {/* Summary: Step 1-5 logic remains identical */}
                        {activeStep === 1 && (
                          <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {PROPERTY_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isActive = formData.type === type.label;
                                return (
                                  <button key={type.id} onClick={() => updateFormData('type', type.label)} className={cn("flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left", isActive ? "border-brand-primary bg-blue-50 text-brand-primary" : "border-zinc-100 bg-white text-zinc-500")}>
                                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg")}>{ <Icon className="h-5 w-5" /> }</div>
                                    <span className="text-sm font-black tracking-tight uppercase">{type.label}</span>
                                  </button>
                                );
                              })}
                          </motion.div>
                        )}
                        {/* Location, Pricing, Desc, Map continue... */}
                        {activeStep === 2 && (
                          <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                             <div className="flex flex-wrap gap-2">
                                {allCities.map(c => (
                                  <button key={c} onClick={() => { updateFormData('city', c); updateFormData('area', ''); }} className={cn("px-6 py-2.5 rounded-xl border-2 font-black uppercase text-xs", formData.city === c ? "border-brand-primary bg-blue-50" : "border-zinc-100")}>{c}</button>
                                ))}
                             </div>
                             <div className="relative group">
                                <input type="text" value={formData.area} onFocus={() => setShowAreaSuggestions(true)}
                                  onChange={(e) => { updateFormData('area', e.target.value); setAreaSearch(e.target.value); }}
                                  className="w-full rounded-2xl border-2 border-zinc-100 py-4 px-6 font-bold text-zinc-900 focus:border-brand-primary outline-none" placeholder="e.g. Model Town" />
                                {showAreaSuggestions && filteredAreas.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white shadow-2xl rounded-2xl border border-zinc-100 max-h-40 overflow-y-auto">
                                      {filteredAreas.map(a => (<button key={a} onClick={() => { updateFormData('area', a); setShowAreaSuggestions(false); }} className="w-full px-4 py-3 text-left font-bold hover:bg-zinc-50">{a}</button>))}
                                    </div>
                                )}
                             </div>
                          </motion.div>
                        )}
                        {activeStep === 3 && (
                            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-4">
                               <input type="number" step="0.01" value={formData.price} onChange={(e) => updateFormData('price', e.target.value)} className="rounded-2xl border-2 border-zinc-100 py-4 px-6 font-black" placeholder="Price (Cr)" />
                               <input type="number" value={formData.size} onChange={(e) => updateFormData('size', e.target.value)} className="rounded-2xl border-2 border-zinc-100 py-4 px-6 font-black" placeholder="Size (SqYd)" />
                            </motion.div>
                        )}
                        {activeStep === 4 && (
                            <motion.textarea rows={5} value={formData.description} onChange={(e) => updateFormData('description', e.target.value)} className="w-full rounded-2xl border-2 border-zinc-100 p-6 font-bold focus:border-brand-primary outline-none resize-none" placeholder="Property details..." />
                        )}
                        {activeStep === 5 && (
                           <div className="rounded-2xl overflow-hidden border-2 border-zinc-100"><MapPicker center={formData.location} onPick={(loc: any) => updateFormData('location', loc)} city={formData.city} /></div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-zinc-100">
                      <button onClick={handlePrev} className={cn("text-xs font-black text-zinc-400 uppercase", activeStep === 0 && "opacity-0 invisible")}>Back</button>
                      <button onClick={handleNext} 
                        disabled={isSubmitting || (!contactDetails && activeStep === 0)}
                        className="bg-zinc-900 text-white rounded-xl px-10 py-4 text-xs font-black shadow-xl active:scale-95 disabled:opacity-20">
                        {isSubmitting ? 'Sending...' : activeStep === 5 ? 'Finish listing' : 'Next Step'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
