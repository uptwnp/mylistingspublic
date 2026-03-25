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
      {/* ── GROWTH HERO ── */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-40 px-6 overflow-hidden min-h-[70vh] flex items-center bg-white border-b border-zinc-50">
        {/* Subtle Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -bottom-10 -right-20 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 text-brand-primary ty-micro font-bold uppercase tracking-[0.2em] shadow-sm">
              <Trophy className="h-3.5 w-3.5 fill-brand-primary" />Sell 2x Faster
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ty-hero font-black text-zinc-900 mb-8 uppercase tracking-tight leading-[1.05]"
          >
            <span className="text-brand-primary">Close More Deals with Less Effort.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="ty-subtitle font-medium text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Show your properties to more buyers and always have better options for your clients.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="ty-title font-black text-brand-primary uppercase tracking-tight mb-12"
          >
            👉 Never say “No options available” again.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full px-4"
          >
            <button 
              onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-zinc-900 text-white ty-title font-bold hover:bg-black transition-all shadow-xl uppercase active:scale-[0.97]"
            >
              Start Free Today
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── GROWTH PLATFORM (WHAT IS THIS?) ── */}
      <section className="py-24 sm:py-40 px-6 bg-zinc-50/50 border-y border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 blur-[100px] rounded-full -z-10" />
        <div className="mx-auto max-w-5xl">
           <div className="text-center mb-16 sm:mb-24">
              <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tight mb-4">A Growth Platform Built for Real Estate Agents</h2>
              <p className="ty-subtitle text-zinc-500 max-w-lg mx-auto leading-relaxed">Everything you need to scale your brokerage and serve your clients better.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              {[
                { title: "Give More Options to Your Clients", desc: "Access properties from other agents instantly and never lose a deal due to lack of inventory.", icon: Home, color: "bg-blue-500" },
                { title: "Sell Your Inventory Faster", desc: "Let other agents promote your listings to their buyers, multiplying your reach exponentially.", icon: TrendingUp, color: "bg-blue-500" },
                { title: "Safe & Controlled Sharing", desc: "Share only limited details — your full data stays protected and under your control at all times.", icon: ShieldCheck, color: "bg-orange-500" },
                { title: "Your Own Website — Free", desc: "Create a professional website to showcase your listings and build your digital brand authority.", icon: Globe, color: "bg-zinc-900" }
              ].map((card, i) => (
                <div key={i} className="group p-8 sm:p-12 rounded-[32px] bg-white border border-zinc-100 shadow-sm transition-all hover:border-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/5">
                   <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-md group-hover:scale-110 transition-transform duration-300", card.color)}>
                      <card.icon className="h-7 w-7" strokeWidth={2.5} />
                   </div>
                   <h3 className="ty-title font-black text-zinc-900 mb-4 uppercase tracking-tight">{card.title}</h3>
                   <p className="ty-body text-zinc-500 leading-relaxed font-medium">{card.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── COMMUNITY SECTION ── */}
      <section className="py-24 sm:py-32 px-6 bg-white overflow-hidden">
        <div className="mx-auto max-w-4xl text-center">
           <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 text-brand-primary ty-micro font-bold mb-10 uppercase tracking-[0.2em] border border-blue-100 shadow-sm">The Network</div>
           <h2 className="ty-display font-black text-zinc-900 uppercase mb-8 tracking-tighter">Join a Network of Smart Real Estate Agents</h2>
           <p className="ty-subtitle font-medium text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-12">
             Share deals. Get leads. Grow faster together. {brand.name} is more than a tool; it's your competitive advantage in a crowded market.
           </p>
           
           <div className="flex flex-wrap items-center justify-center gap-12 grayscale opacity-50">
              <div className="flex items-center gap-3">
                 <Users className="h-6 w-6" />
                 <span className="ty-body font-black uppercase tracking-widest">Collaborative</span>
              </div>
              <div className="flex items-center gap-3">
                 <Zap className="h-6 w-6" />
                 <span className="ty-body font-black uppercase tracking-widest">Instant Reach</span>
              </div>
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-6 w-6" />
                 <span className="ty-body font-black uppercase tracking-widest">Secure Data</span>
              </div>
           </div>
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section id="apply-form" className="py-24 sm:py-32 px-6 bg-zinc-900 relative overflow-hidden border-y border-zinc-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-primary/10 blur-[150px] -z-10" />
        <div className="mx-auto max-w-3xl">
            <div className="bg-white p-8 sm:p-16 rounded-[40px] border border-zinc-100 text-center shadow-2xl relative overflow-hidden">
               {isFormSubmitted ? (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10">
                    <div className="h-16 w-16 rounded-full bg-blue-500 text-white flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-100">
                       <CheckCircle2 className="h-8 w-8" strokeWidth={3} />
                    </div>
                    <h2 className="ty-display font-black text-zinc-900 mb-4 uppercase tracking-tighter">Application Sent</h2>
                    <p className="ty-subtitle text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">Our partner success team will contact you locally within 2 hours.</p>
                    <button onClick={() => setIsFormSubmitted(false)} className="ty-micro font-black text-zinc-400 uppercase tracking-widest hover:text-brand-primary transition-colors">Update Details</button>
                 </motion.div>
               ) : (
                 <>
                   <div className="mb-12">
                      <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter mb-4">Get Started</h2>
                      <p className="ty-subtitle text-zinc-500 max-w-md mx-auto leading-relaxed">Create your exclusive {brand.name} Storefront and start growing your business today.</p>
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
           <span className="ty-title font-black tracking-tighter text-zinc-900 uppercase">{brand.name} Agents</span>
         </div>
         <p className="ty-micro font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">Growth Platform for Smart Agents</p>
         <div className="flex flex-col gap-2">
           <p className="ty-micro font-bold text-zinc-200 uppercase tracking-[0.2em]">© 2026 {brand.name} Technology Solutions.</p>
         </div>
      </footer>
    </div>
  );
}
