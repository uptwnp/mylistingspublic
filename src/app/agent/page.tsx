'use client';

export const runtime = 'edge';

import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Trophy, 
  Star, 
  Zap, 
  ShieldCheck, 
  MessageCircle,
  Briefcase,
  TrendingUp,
  Globe,
  Store,
  Wallet,
  Home
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AgentPage() {
  const brand = useBrand();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-blue-100 selection:text-brand-primary font-sans">
      {/* ── BALANCED HERO ── */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-40 px-6 overflow-hidden min-h-[70vh] flex items-center bg-white border-b border-zinc-50">
        {/* Subtle Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -bottom-10 -right-20 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 text-brand-primary ty-micro font-bold uppercase tracking-[0.2em] shadow-sm">
              <Trophy className="h-3.5 w-3.5 fill-brand-primary" /> {brand.name} Founding Partner
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ty-hero font-black text-zinc-900 mb-8 uppercase tracking-tight leading-[1.05]"
          >
            THE NEW STANDARD FOR <br className="hidden sm:block" /> 
            <span className="text-brand-primary">PROFESSIONAL BROKERS</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="ty-subtitle font-medium text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Digitize your mandate portfolio in seconds. Showcase your inventory with professional {brand.name} links and build authority with verified buyers.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full px-4"
          >
            <button 
              onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-zinc-900 text-white ty-title font-bold hover:bg-black transition-all shadow-xl  uppercase"
            >
              Get Your Storefront
            </button>
            <a 
              href="https://wa.me/919518091945" 
              target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full border-2 border-zinc-100 ty-micro font-black text-zinc-900 bg-white hover:bg-zinc-50 transition-all uppercase tracking-widest "
            >
              <MessageCircle className="h-4 w-4 text-emerald-500 fill-emerald-500" />
              WhatsApp Support
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── KEY FEATURES (INFO SECTION) ── */}
      <section className="py-24 sm:py-40 px-6 bg-zinc-50/50 border-y border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 blur-[100px] rounded-full -z-10" />
        <div className="mx-auto max-w-5xl">
           <div className="text-center mb-16 sm:mb-24">
              <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tight mb-4">Why MyListings?</h2>
              <p className="ty-subtitle text-zinc-500 max-w-lg mx-auto leading-relaxed">Build authority and manage your mandates with professional digital tools.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
              {[
                { title: "Elite Visibility", desc: "Get a dedicated, professional digital storefront that commands trust and showcases your mandates elegantly.", icon: Globe, color: "bg-blue-500" },
                { title: "Command Center", desc: "Easily manage plots, commercial, and residential inventory with a precision-built mobile dashboard.", icon: Zap, color: "bg-emerald-500" },
                { title: "Verified Closure", desc: "Gain direct access to 1 Lakh+ verified investor requirements and close your mandates with absolute transparency.", icon: Users, color: "bg-orange-500" }
              ].map((card, i) => (
                <div key={i} className="group p-8 sm:p-10 rounded-[32px] bg-white border border-zinc-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/5">
                   <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white mb-8 shadow-md group-hover:scale-110 transition-transform duration-300", card.color)}>
                      <card.icon className="h-6 w-6" strokeWidth={3} />
                   </div>
                   <h3 className="ty-title font-black text-zinc-900 mb-4 uppercase tracking-tight">{card.title}</h3>
                   <p className="ty-body text-zinc-500 leading-relaxed font-medium">{card.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-24 sm:py-40 px-6 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-3xl">
           <h2 className="ty-display font-black text-zinc-900 uppercase mb-16 sm:mb-24 text-center tracking-tight">Common Questions</h2>
           <div className="space-y-4">
              {[
                { q: "What is the cost to join?", a: "The Founding Partner program is currently zero-cost for elite local dealers. We only charge a minimal success fee on successful platform closures." },
                { q: "Is there a limit on listings?", a: "No. As a verified partner, you can manage your entire mandate portfolio without any inventory caps." },
                { q: "How do I receive buyer leads?", a: "All inquiries are verified by our team and routed directly to your WhatsApp for instant action and closure." },
                { q: "Can I use MyListings for client presentations?", a: "Yes. Your storefront is designed to replace outdated PDFs and messy photo galleries with a high-end digital experience." },
              ].map((faq, i) => (
                <div key={i} className="p-8 sm:p-10 rounded-[32px] bg-zinc-50/50 border border-transparent transition-all hover:border-brand-primary/10 hover:bg-white hover:shadow-xl hover:shadow-zinc-100">
                   <h3 className="ty-title font-black text-zinc-900 uppercase mb-4 tracking-tight leading-snug">{faq.q}</h3>
                   <p className="ty-body text-zinc-500 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── PROFESSIONAL REGISTRATION FORM ── */}
      <section id="apply-form" className="py-24 sm:py-32 px-6 bg-zinc-900 relative overflow-hidden border-y border-zinc-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-primary/10 blur-[150px] -z-10" />
        <div className="mx-auto max-w-3xl">
            <div className="bg-white p-8 sm:p-16 rounded-[40px] border border-zinc-100 text-center shadow-2xl relative overflow-hidden">
               {isFormSubmitted ? (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10">
                    <div className="h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-6 mx-auto shadow-lg shadow-emerald-100">
                       <CheckCircle2 className="h-8 w-8" strokeWidth={3} />
                    </div>
                    <h2 className="ty-display font-black text-zinc-900 mb-4 uppercase tracking-tighter">Application Sent</h2>
                    <p className="ty-subtitle text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">Our partner success team will contact you locally within 2 hours.</p>
                    <button onClick={() => setIsFormSubmitted(false)} className="ty-micro font-black text-zinc-400 uppercase tracking-widest hover:text-brand-primary transition-colors">Update Details</button>
                 </motion.div>
               ) : (
                 <>
                   <div className="mb-12">
                      <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter mb-4">Partner Application</h2>
                      <p className="ty-subtitle text-zinc-500 max-w-md mx-auto leading-relaxed">Join our founding partner circle and get your exclusive {brand.name} Storefront.</p>
                   </div>
                   <form onSubmit={handleSubmit} className="text-left space-y-6 sm:space-y-8 max-w-xl mx-auto">
                      <div className="space-y-2">
                         <label className="ty-micro font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Agency Name</label>
                         <input required type="text" className="w-full px-6 py-4 rounded-xl bg-zinc-50 border border-zinc-100 outline-none focus:border-brand-primary focus:bg-white transition-all font-bold text-zinc-900 uppercase tracking-tight ty-body placeholder:text-zinc-200" placeholder="e.g. HARYANA REAL ESTATE" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="ty-micro font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Primary City</label>
                           <input required type="text" className="w-full px-6 py-4 rounded-xl bg-zinc-50 border border-zinc-100 outline-none focus:border-brand-primary focus:bg-white transition-all font-bold text-zinc-900 uppercase tracking-tight ty-body placeholder:text-zinc-200" placeholder="e.g. PANIPAT" />
                        </div>
                        <div className="space-y-2">
                           <label className="ty-micro font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">WhatsApp No.</label>
                           <input required type="tel" className="w-full px-6 py-4 rounded-xl bg-zinc-50 border border-zinc-100 outline-none focus:border-brand-primary focus:bg-white transition-all font-bold text-zinc-900 uppercase tracking-tight ty-body placeholder:text-zinc-200" placeholder="+91 ..." />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-5 rounded-xl bg-brand-primary text-white ty-title font-black shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.99] mt-2 flex items-center justify-center gap-4">
                         <span>SUBMIT REQUEST</span>
                         <ArrowRight className="h-5 w-5" strokeWidth={3} />
                      </button>
                   </form>
                 </>
               )}
            </div>
         </div>
      </section>

      {/* ── CLEAN FOOTER ── */}
      <footer className="py-24 sm:py-32 text-center bg-white">
         <div className="flex items-center justify-center gap-4 mb-8">
           <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg">
             <Briefcase className="h-5 w-5 text-white" strokeWidth={2.5} />
           </div>
           <span className="ty-title font-black tracking-tighter text-zinc-900 uppercase">{brand.name} Partners</span>
         </div>
         <p className="ty-micro font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">Official Broker Empowerment Program</p>
         <div className="flex flex-col gap-2">
           <p className="ty-micro font-bold text-zinc-200 uppercase tracking-[0.2em]">© 2026 {brand.name} Technology Solutions.</p>
         </div>
      </footer>
    </div>
  );
}
