'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Maximize2, 
  User, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Landmark,
  Home,
  Briefcase,
  Trees
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const PROPERTY_TYPES = [
  { id: 'residential_plot', label: 'Residential Plot', icon: Trees },
  { id: 'flat', label: 'Flat/Apartment', icon: Building2 },
  { id: 'house', label: 'House/Villa', icon: Home },
  { id: 'commercial', label: 'Commercial', icon: Briefcase },
  { id: 'other', label: 'Other', icon: Landmark },
];

const STEPS = [
  { title: 'Property Highlights', subtitle: 'Basic details' },
  { title: 'Market Value', subtitle: 'Size & Price' },
  { title: 'Owner Identity', subtitle: 'Contact info' },
];

export default function SellPropertyPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    city: '',
    area: '',
    price: '',
    size: '',
    name: '',
    phone: '',
    email: '',
  });

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 shadow-2xl shadow-zinc-200">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-zinc-900">Listing Received!</h1>
          <p className="mb-10 text-lg font-medium text-zinc-500 leading-relaxed">
            Our architectural consultants will review your property within 24 hours to ensure it meets our premium catalog standards.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-black hover:shadow-xl active:scale-95"
          >
            Back to Catalog
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden lg:h-[70vh]">
        <Image 
          src="/sell-hero.png"
          alt="Luxury Property Hero"
          fill
          className="object-cover brightness-[0.8]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-zinc-50/50" />
        
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-center justify-center px-6 text-center lg:px-12 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-6 inline-block rounded-full bg-white/10 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-white backdrop-blur-md">
              The Architecture of Selling
            </span>
            <h1 className="mb-8 text-5xl font-black tracking-tighter text-white sm:text-7xl lg:text-8xl">
              Showcase your <span className="text-zinc-400">Masterpiece.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-bold text-zinc-200 opacity-90 leading-relaxed">
              Join our exclusive network of premium properties. We connect architectural landmarks with the most discerning buyers in the country.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative -mt-32 px-6 pb-32">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-[40px] border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/50 flex flex-col md:flex-row">
            
            {/* Sidebar State */}
            <div className="w-full md:w-80 bg-zinc-900 p-8 lg:p-12 shrink-0">
              <div className="mb-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 mb-6">
                  <Building2 className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Sell with MyListing</h3>
                <p className="text-zinc-400 text-sm font-bold mt-2 leading-relaxed">Only 3 steps away from reaching 1M+ active investors.</p>
              </div>

              <div className="space-y-8">
                {STEPS.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-black tracking-tighter",
                      activeStep >= idx 
                        ? "bg-white border-white text-zinc-900 shadow-lg shadow-white/10" 
                        : "border-zinc-700 text-zinc-500"
                    )}>
                      {activeStep > idx ? <CheckCircle2 className="h-4 w-4" /> : `0${idx + 1}`}
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-[11px] font-black uppercase tracking-widest leading-none mb-1",
                        activeStep >= idx ? "text-white" : "text-zinc-600"
                      )}>{step.title}</h4>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">{step.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-20 pt-12 border-t border-zinc-800">
                <div className="flex items-center gap-3 text-white/50 hover:text-white transition-colors cursor-pointer group">
                  <span className="text-[10px] font-black uppercase tracking-widest">Need help?</span>
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 p-8 lg:p-16">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">What kind of masterpiece is this?</h2>
                      <p className="text-sm font-bold text-zinc-400">Select the property category to get started.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {PROPERTY_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => updateFormData('type', type.label)}
                            className={cn(
                              "flex flex-col items-center gap-4 rounded-[24px] border-2 p-6 transition-all text-center",
                              formData.type === type.label 
                                ? "border-zinc-900 bg-zinc-900 text-white shadow-xl shadow-zinc-200" 
                                : "border-zinc-100 hover:border-zinc-300 bg-white text-zinc-600"
                            )}
                          >
                            <Icon className={cn("h-8 w-8", formData.type === type.label ? "text-white" : "text-zinc-400")} />
                            <span className="text-[11px] font-black uppercase tracking-tight">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">City</label>
                        <div className="relative group">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                          <input 
                            type="text" 
                            placeholder="e.g. Panipat"
                            value={formData.city}
                            onChange={(e) => updateFormData('city', e.target.value)}
                            className="w-full rounded-2xl border-2 border-zinc-100 bg-white py-4 pl-14 pr-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Area / Landmark</label>
                        <div className="relative group">
                          <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                          <input 
                            type="text" 
                            placeholder="e.g. Model Town"
                            value={formData.area}
                            onChange={(e) => updateFormData('area', e.target.value)}
                            className="w-full rounded-2xl border-2 border-zinc-100 bg-white py-4 pl-14 pr-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">The Scale & Value</h2>
                      <p className="text-sm font-bold text-zinc-400">Help us understand the architectural magnitude.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Expected Price (Cr)</label>
                        <div className="relative group">
                          <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                          <input 
                            type="number" 
                            placeholder="e.g. 5.5"
                            value={formData.price}
                            onChange={(e) => updateFormData('price', e.target.value)}
                            className="w-full rounded-2xl border-2 border-zinc-100 bg-white py-4 pl-14 pr-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Plot / Built Area (Sq.Yds)</label>
                        <div className="relative group">
                          <Maximize2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                          <input 
                            type="number" 
                            placeholder="e.g. 500"
                            value={formData.size}
                            onChange={(e) => updateFormData('size', e.target.value)}
                            className="w-full rounded-2xl border-2 border-zinc-100 bg-white py-4 pl-14 pr-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[32px] bg-zinc-50 p-8 border border-zinc-100">
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-4">
                        <CheckCircle2 className="h-4 w-4" />
                        Professional Appraisal
                      </h4>
                      <p className="text-sm font-bold text-zinc-500 leading-relaxed">
                        Our internal pricing engine will analyze these details against current market trends in <span className="text-zinc-900">{formData.city || "your city"}</span> to provide an accurate valuation.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div>
                      <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">The Host Details</h2>
                      <p className="text-sm font-bold text-zinc-400">Discretion is our priority. Your info remains private.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                          <input 
                            type="text" 
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            className="w-full rounded-2xl border-2 border-zinc-100 bg-white py-4 pr-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900 pl-14"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Phone Number</label>
                          <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                            <input 
                              type="tel" 
                              placeholder="+91 98765 43210"
                              value={formData.phone}
                              onChange={(e) => updateFormData('phone', e.target.value)}
                              className="w-full rounded-2xl border-2 border-zinc-100 bg-white py-4 pl-14 pr-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Email (Optional)</label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                            <input 
                              type="email" 
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={(e) => updateFormData('email', e.target.value)}
                              className="w-full rounded-2xl border-2 border-zinc-100 bg-white py-4 pl-14 pr-6 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 rounded-2xl border border-rose-100 bg-rose-50/30">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-rose-100 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-rose-600" />
                      </div>
                      <p className="text-[11px] font-bold text-rose-900 leading-tight">
                        By listing, you agree to our <span className="underline cursor-pointer">Premium Listing Agreement</span> and represent that you are the rightful owner/authorized agent.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-16 flex items-center justify-between border-t border-zinc-100 pt-10">
                <button
                  onClick={handlePrev}
                  className={cn(
                    "px-8 py-3 text-sm font-black uppercase tracking-widest text-zinc-400 transition-all hover:text-zinc-900",
                    activeStep === 0 && "opacity-0 pointer-events-none"
                  )}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeStep === 0 && !formData.type}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl bg-zinc-900 px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black hover:shadow-xl active:scale-95 disabled:opacity-30 disabled:pointer-events-none",
                  )}
                >
                  {activeStep === STEPS.length - 1 ? 'Finish Listing' : 'Next Step'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mx-auto max-w-[1440px] px-6 lg:px-12 py-32">
        <div className="mb-20 text-center">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">Network Advantage</h2>
          <h3 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">Why Sell with MyListing?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "1M+ Active Network",
              desc: "Your property is presented directly to our verified network of high-net-worth investors and genuine seekers.",
              icon: Building2
            },
            {
              title: "Expert Curation",
              desc: "We don't just list; we curate. Our professional copywriters and consultants highlight the architectural soul of your home.",
              icon: Landmark
            },
            {
              title: "Zero Ad Friction",
              desc: "No public comments, No random cold calls. We manage every lead with privacy and precision before it reaches you.",
              icon: Trees
            }
          ].map((item, idx) => (
            <div key={idx} className="group">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[24px] bg-zinc-100 transition-colors group-hover:bg-zinc-900">
                <item.icon className="h-7 w-7 text-zinc-900 transition-colors group-hover:text-white" />
              </div>
              <h4 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">{item.title}</h4>
              <p className="text-sm font-bold text-zinc-500 leading-relaxed group-hover:text-zinc-700 transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
