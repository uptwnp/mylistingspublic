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
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-blue-100 selection:text-brand-primary">
      {/* ── MINIMAL HERO ── */}
      <section className="pt-32 pb-40 px-6 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="px-5 py-2 rounded-full bg-zinc-50 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-100">
              Dealer Founding Partner Program
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-7xl font-black tracking-tighter text-zinc-900 mb-10 leading-[1.1] uppercase max-w-4xl mx-auto"
          >
            Your Personal <br className="hidden sm:block" /> 
            <span className="text-brand-primary">Property Website</span> Link.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl font-medium text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-16 tracking-tight"
          >
            The digital storefront for professional dealers. Showcase your inventory elegantly, share on WhatsApp instantly, and close deals faster.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full"
          >
            <button 
              onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-12 py-6 rounded-3xl bg-zinc-900 text-white font-black text-xl hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-tighter"
            >
              Request Access
            </button>
            <a 
              href="https://wa.me/919518091945" 
              target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-6 rounded-3xl border-2 border-zinc-100 text-sm font-black text-zinc-900 hover:bg-zinc-50 transition-all uppercase tracking-widest"
            >
              <MessageCircle className="h-5 w-5 text-emerald-500 fill-emerald-500" />
              Chat with RM
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── CLEAN VALUE PROPS ── */}
      <section className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "Personal URL", desc: "A dedicated website link to showcase your complete verified inventory.", icon: Globe },
                { title: "Smart Sync", desc: "Easily manage plots, kothis and commercial space from your mobile.", icon: Zap },
                { title: "Network Pool", desc: "Satisfy any buyer requirement by leveraging our shared dealer network.", icon: Users }
              ].map((card, i) => (
                <div key={i} className="group">
                   <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-900 mb-8 shadow-sm group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                      <card.icon className="h-6 w-6" strokeWidth={3} />
                   </div>
                   <h3 className="text-xl font-black text-zinc-900 mb-4 uppercase tracking-tighter">{card.title}</h3>
                   <p className="text-base font-medium text-zinc-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section id="apply-form" className="py-32 px-6">
         <div className="mx-auto max-w-3xl">
            <div className="bg-white p-8 sm:p-20 rounded-[56px] border border-zinc-100 text-center shadow-2xl shadow-zinc-200/50">
               {isFormSubmitted ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
                    <div className="h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-10 mx-auto">
                       <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900 mb-4 uppercase tracking-tighter">Applied.</h2>
                    <p className="text-lg font-medium text-zinc-500 mb-14 max-w-xs mx-auto">We'll reach out to you on WhatsApp within 2 hours.</p>
                    <button onClick={() => setIsFormSubmitted(false)} className="text-zinc-300 font-black tracking-widest text-[10px] uppercase underline underline-offset-4">Update Details</button>
                 </motion.div>
               ) : (
                 <>
                   <div className="mb-14">
                      <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter mb-4">Request Access</h2>
                      <p className="text-lg font-medium text-zinc-500">Join the founding circle of professional brokers.</p>
                   </div>
                   <form onSubmit={handleSubmit} className="text-left space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Dealer Name</label>
                         <input required type="text" className="w-full px-8 py-6 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:border-brand-primary transition-all font-black text-zinc-900 uppercase tracking-tight text-sm placeholder:text-zinc-200" placeholder="e.g. Haryana Properties" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Working City</label>
                           <input required type="text" className="w-full px-8 py-6 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:border-brand-primary transition-all font-black text-zinc-900 uppercase tracking-tight text-sm placeholder:text-zinc-200" placeholder="PANIPAT" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">WhatsApp No.</label>
                           <input required type="tel" className="w-full px-8 py-6 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:border-brand-primary transition-all font-black text-zinc-900 uppercase tracking-tight text-sm placeholder:text-zinc-200" placeholder="+91 ..." />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-7 rounded-2xl bg-zinc-900 text-white font-black text-xl shadow-2xl transition-all hover:bg-black active:scale-[0.98] mt-4 flex items-center justify-center gap-4">
                         <span>SEND REQUEST</span>
                         <ArrowRight className="h-6 w-6" />
                      </button>
                   </form>
                 </>
               )}
            </div>
         </div>
      </section>

      {/* ── MINIMAL FOOTER ── */}
      <footer className="py-24 text-center border-t border-zinc-50 bg-white">
         <div className="flex items-center justify-center gap-4 mb-6">
           <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
             <Home className="h-4 w-4 text-white" strokeWidth={3} />
           </div>
           <span className="text-xl font-black tracking-tighter text-zinc-900 uppercase">{brand.name} Broker</span>
         </div>
         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Made with Integrity • Verified Partners Only</p>
         <p className="text-[10px] font-bold text-zinc-200 uppercase tracking-[0.2em] mt-4">© 2026 {brand.name} Network.</p>
      </footer>
    </div>

  );
}
