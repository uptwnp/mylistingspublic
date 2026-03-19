'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Maximize2, 
  User, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Landmark,
  Home,
  Trees,
  Search,
  Navigation,
  MessageCircle,
  ArrowLeft,
  Store,
  ShieldCheck,
  Users,
  Globe,
  Zap,
  Clock,
  Briefcase,
  Trophy,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/context/ShortlistContext';
import { useBrand } from '@/context/BrandContext';

import { getAreas, getCities, submitPropertyForSale } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Map component for location picking (Dynamic)
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

export default function SellPropertyPage() {
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

  // Load cities and areas for the form
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
        await submitPropertyForSale(formData, contactDetails);
        setIsSubmitted(true);
      } catch (error) {
        console.error('Submission failed:', error);
        // We could show a toast here, but alert is a safe fallback
        alert('Something went wrong during submission. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const filteredAreas = allAreas.filter(a => 
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const steps = [
    { title: 'Contact', description: 'Confirm your details' },
    { title: 'Property Type', description: 'What are you selling?' },
    { title: 'Location', description: 'Where is it?' },
    { title: 'Scale', description: 'Size and Pricing' },
    { title: 'Details', description: 'Add a description' },
    { title: 'Coordinates', description: 'Pin point on map' },
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 sm:pt-40 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
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
               Start Listing Now
               <ArrowRight className="h-5 w-5" />
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

      {/* 2. THE PROCESS (How it Works) */}
      <section className="py-32 px-4 sm:px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="ty-display font-black tracking-tight text-zinc-900 uppercase">List in 3 Minutes</h2>
            <p className="ty-body font-medium text-zinc-500 mt-3">A simplified 5-step process to get your property live.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-8 relative">
             {[
               { title: "Tell About You", desc: "Contact details for verification.", icon: User },
               { title: "Property Basics", desc: "Type, category, and city selection.", icon: Building2 },
               { title: "Size & Price", desc: "Sq.Yds, value, and description.", icon: Maximize2 },
               { title: "Exact Location", desc: "Mark the precise pin on the map.", icon: MapPin },
               { title: "Review & Visit", desc: "Final check and official site visit.", icon: ShieldCheck },
             ].map((step, i) => (
               <button 
                 key={i} 
                 onClick={() => setIsModalOpen(true)}
                 className="group relative z-10 flex flex-col items-center text-center transition-all hover:translate-y-[-4px]"
               >
                 <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-zinc-200 border border-zinc-100 relative group-hover:border-brand-primary group-hover:shadow-brand-primary/10 transition-all">
                   <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center shadow-md">0{i + 1}</span>
                   <step.icon className="h-6 w-6 text-brand-primary" strokeWidth={2.5} />
                 </div>
                 <h3 className="ty-micro font-black text-zinc-900 uppercase tracking-widest mb-2 leading-tight px-1 group-hover:text-brand-primary transition-colors">{step.title}</h3>
                 <p className="ty-caption font-medium text-zinc-400 group-hover:text-zinc-500 transition-colors leading-tight">{step.desc}</p>
                 <span className="mt-4 px-3 py-1 rounded-full bg-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Start Step</span>
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* 3. TRANSPARENT FEES */}
      <section className="py-32 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
           <div className="rounded-[40px] bg-zinc-900 p-8 sm:p-16 text-center relative overflow-hidden text-white/90">
              <div className="relative z-10">
                <h2 className="ty-display font-black text-white uppercase tracking-tight mb-4">No Upfront Listing Fees</h2>
                <div className="mx-auto w-16 h-0.5 bg-brand-primary mb-8" />
                <p className="ty-subtitle font-medium text-zinc-400 mb-10 max-w-2xl mx-auto">
                  Listing and verification are completely free. We only charge a <span className="text-white font-bold">1% success fee</span> once the property booking is done.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                      <p className="ty-caption font-black text-white uppercase mb-2">Listing</p>
                      <p className="text-2xl font-black text-emerald-400">FREE</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                      <p className="ty-caption font-black text-white uppercase mb-2">Verification</p>
                      <p className="text-2xl font-black text-emerald-400">FREE</p>
                   </div>
              <div className="p-6 rounded-3xl bg-white/10 border border-brand-primary/50">
                <p className="ty-caption font-black text-white uppercase mb-2">At Booking</p>
                <p className="text-2xl font-black text-brand-primary">1%</p>
              </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 h-40 w-40 bg-brand-primary/20 blur-[100px]" />
           </div>
        </div>
      </section>

      {/* 4. ABOUT US / MISSION */}
      <section className="py-32 px-4 sm:px-6 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-5xl">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <span className="ty-micro font-black text-brand-primary tracking-widest uppercase mb-4 block">About Us</span>
                <h2 className="ty-title font-black text-zinc-900 uppercase tracking-tight mb-6 leading-none">Haryana's Premier <br/> Property Network</h2>
                <div className="space-y-4">
                  <p className="ty-caption font-medium text-zinc-500 leading-relaxed">
                    Based in Panipat, {brand.name} is focused on creating a transparent real estate marketplace for the North Indian market.
                  </p>
                  <p className="ty-caption font-medium text-zinc-500 leading-relaxed">
                    We exclusively list premium plots, residences, and commercial assets. Our growing network of agents ensures that your listing reaches qualified buyers directly.
                  </p>
                </div>
                <div className="mt-10 flex gap-10">
                   <div>
                     <p className="text-3xl font-black text-zinc-900 leading-none mb-1">Growth</p>
                     <p className="ty-micro font-bold text-zinc-400 uppercase tracking-widest">Focused Hub</p>
                   </div>
                   <div>
                     <p className="text-3xl font-black text-zinc-900 leading-none mb-1">Haryana</p>
                     <p className="ty-micro font-bold text-zinc-400 uppercase tracking-widest">Base Network</p>
                   </div>
                </div>
              </div>
              <div className="relative">
                 <div className="aspect-[4/3] rounded-[48px] bg-zinc-200 overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000" 
                      className="h-full w-full object-cover grayscale opacity-80"
                      alt="Modern Architecture"
                    />
                 </div>
                 <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[40px] shadow-2xl border border-zinc-100 max-w-xs hidden sm:block">
                    <p className="ty-caption font-black text-zinc-900 leading-snug">"Bringing institutional standards to local property markets."</p>
                    <p className="ty-micro font-bold text-brand-primary uppercase mt-4">Founding Mission</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center px-4 sm:px-6">
         <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter mb-10">Ready to List?</h2>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="inline-flex items-center gap-4 rounded-full bg-zinc-900 px-12 py-5 ty-title font-bold text-white shadow-2xl shadow-zinc-300 transition-all hover:bg-black active:scale-95"
         >
           Open Listing Console
           <ArrowRight className="h-5 w-5" />
         </button>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-100 text-center">
         <p className="ty-micro font-bold text-zinc-400 uppercase tracking-[0.2em]">{brand.name} Private Property Network &copy; 2026</p>
      </footer>


      {/* --- LISTING FORM MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-10"
          >
            <motion.div 
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-3xl flex flex-col"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10">
                 {isSubmitted ? (
                   <div className="text-center py-12">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-100">
                        <CheckCircle2 className="h-8 w-8" strokeWidth={3} />
                      </div>
                      <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-2">Listing Submitted</h2>
                      <p className="mb-10 text-zinc-500 font-medium max-w-xs mx-auto">Please finalize your listing by sharing authentic property photos.</p>
                      <a 
                        href={`https://wa.me/919518091945?text=${encodeURIComponent(`Hi, I've listed my property on ${brand.name}.\nType: ${formData.type}\nLocation: ${formData.area}, ${formData.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-[#25D366] py-4 px-10 text-sm font-black text-white shadow-lg shadow-emerald-100 transition-all active:scale-95"
                      >
                        <MessageCircle className="h-5 w-5 fill-white" />
                        Send Photos on WhatsApp
                      </a>
                   </div>
                ) : (
                  <>
                    <div className="mb-10">
                       <div className="flex items-center justify-between mb-4">
                          <h1 className="text-lg font-black text-zinc-900 uppercase tracking-widest">List Your Property</h1>
                          <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-colors"><X className="h-4 w-4" /></button>
                       </div>
                       {/* Segmented Progress Bar */}
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
                                <div className="flex justify-between items-start mb-6">
                                   <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-brand-primary">
                                      <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
                                   </div>
                                   <button onClick={() => requireContactDetails(() => {}, true)} className="text-[10px] font-black text-brand-primary tracking-widest uppercase hover:underline">Change Account</button>
                                </div>
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
                                <User className="h-8 w-8 text-zinc-300 mx-auto mb-4" />
                                <button onClick={() => requireContactDetails(() => {})} className="rounded-xl bg-zinc-900 px-8 py-3.5 text-xs font-bold text-white shadow-lg transition-all active:scale-95">Enter Details</button>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {activeStep === 1 && (
                          <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Asset Category</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {PROPERTY_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isActive = formData.type === type.label;
                                return (
                                  <button
                                    key={type.id}
                                    onClick={() => updateFormData('type', type.label)}
                                    className={cn("group flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left", isActive ? "border-brand-primary bg-blue-50 text-brand-primary" : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200")}
                                  >
                                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors", isActive ? "bg-brand-primary text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200")}><Icon className="h-5 w-5" /></div>
                                    <span className="text-sm font-black tracking-tight uppercase">{type.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}

                        {activeStep === 2 && (
                          <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="space-y-2">
                              <label className="ty-micro font-black text-zinc-400 uppercase tracking-widest ml-1">City</label>
                              <div className="flex flex-wrap gap-2">
                                {allCities.map(c => (
                                  <button key={c} onClick={() => updateFormData('city', c)} className={cn("px-6 py-2.5 rounded-xl border-2 font-black uppercase transition-all text-xs", formData.city === c ? "border-brand-primary bg-blue-50 text-brand-primary" : "border-zinc-100 text-zinc-400")}>{c}</button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2 relative">
                              <label className="ty-micro font-black text-zinc-400 uppercase tracking-widest ml-1">Area / Sector</label>
                              <div className="relative group">
                                <MapPin className="absolute left-5 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-brand-primary transition-colors" />
                                <input type="text" value={formData.area} onFocus={() => setShowAreaSuggestions(true)}
                                  onChange={(e) => { updateFormData('area', e.target.value); setAreaSearch(e.target.value); setShowAreaSuggestions(true); }}
                                  className="w-full rounded-2xl border-2 border-zinc-100 py-4 pl-14 pr-6 font-bold text-zinc-900 outline-none focus:border-brand-primary transition-all" placeholder="e.g. Model Town"
                                />
                                <AnimatePresence>
                                  {showAreaSuggestions && filteredAreas.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-50 left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl p-2 max-h-[200px] overflow-y-auto no-scrollbar">
                                      {filteredAreas.map(a => (<button key={a} onClick={() => { updateFormData('area', a); setShowAreaSuggestions(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left ty-caption font-bold text-zinc-900 hover:bg-zinc-50 rounded-xl"><MapPin className="h-4 w-4 text-zinc-300" />{a}</button>))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeStep === 3 && (
                          <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                               <label className="ty-micro font-black text-zinc-400 uppercase tracking-widest ml-1">Price (Cr)</label>
                               <div className="relative group"><IndianRupee className="absolute left-5 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-brand-primary" />
                               <input type="number" step="0.01" value={formData.price} onChange={(e) => updateFormData('price', e.target.value)} className="w-full rounded-2xl border-2 border-zinc-100 py-4 pl-14 pr-6 font-bold text-zinc-900 outline-none focus:border-brand-primary" placeholder="e.g. 5.5" /></div>
                             </div>
                             <div className="space-y-2">
                               <label className="ty-micro font-black text-zinc-400 uppercase tracking-widest ml-1">Size (Sq.Yds)</label>
                               <div className="relative group"><Maximize2 className="absolute left-5 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-brand-primary" />
                               <input type="number" value={formData.size} onChange={(e) => updateFormData('size', e.target.value)} className="w-full rounded-2xl border-2 border-zinc-100 py-4 pl-14 pr-6 font-bold text-zinc-900 outline-none focus:border-brand-primary" placeholder="e.g. 500" /></div>
                             </div>
                          </motion.div>
                        )}

                        {activeStep === 4 && (
                          <motion.div key="st4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Property Description</label>
                            <textarea rows={6} value={formData.description} onChange={(e) => updateFormData('description', e.target.value)} className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-brand-primary resize-none placeholder:text-zinc-300" placeholder="Describe highlights (e.g. Park facing, wide road, specific amenities)..." />
                          </motion.div>
                        )}

                        {activeStep === 5 && (
                          <motion.div key="st5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                             <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-100 shadow-md">
                               <MapPicker center={formData.location} onPick={(loc: any) => updateFormData('location', loc)} city={formData.city} />
                               {!formData.location && <div className="absolute inset-0 z-10 bg-black/5 pointer-events-none flex items-center justify-center"><div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl border border-white"><Navigation className="h-3 w-3 animate-pulse text-brand-primary" /><span className="text-[10px] font-black uppercase text-zinc-900 tracking-widest">Mark Location</span></div></div>}
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-12 flex items-center justify-between border-t border-zinc-100 pt-8">
                      <button onClick={handlePrev} className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors", activeStep === 0 && "opacity-0 pointer-events-none")}>
                        <ArrowLeft className="h-3 w-3" /> Previous Step
                      </button>
                      <button onClick={handleNext} 
                        disabled={isSubmitting || (!contactDetails && activeStep === 0) || (activeStep === 1 && !formData.type) || (activeStep === 2 && (!formData.city || !formData.area)) || (activeStep === 3 && (!formData.price || !formData.size))}
                        className="flex items-center gap-3 rounded-xl bg-zinc-900 px-10 py-4 text-xs font-black text-white shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-20 disabled:grayscale">
                        {isSubmitting ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : activeStep === steps.length - 1 ? (
                          'Finish Listing'
                        ) : (
                          'Next Step'
                        )} 
                        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
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
