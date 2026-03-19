'use client';

export const runtime = 'edge';

import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowRight, 
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  Zap,
  BarChart3,
  CheckCircle2,
  Star
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { cn } from '@/lib/utils';

export default function ReferAndEarnPage() {
  const brand = useBrand();

  const steps = [
    {
      title: "Share Info",
      desc: "Tell us about a Buyer/Seller & mention us to them.",
      icon: MessageCircle,
    },
    {
      title: "We Close",
      desc: "Our team manages negotiation and paper work.",
      icon: Zap,
    },
    {
      title: "You Earn",
      desc: "Referral money transferred on deal closure.",
      icon: Wallet,
    }
  ];

  const whatsappMessage = encodeURIComponent("Hi, I want to refer a buyer/seller for a high-value property deal.");

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 sm:pt-48 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="mx-auto max-w-5xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-brand-primary ty-micro font-black tracking-widest uppercase mb-6">Partner Program</span>
            <h1 className="ty-hero font-black tracking-tighter text-zinc-900 uppercase mb-8 leading-[0.9]">
              Refer a <span className="text-brand-primary">Buyer</span> or <br className="sm:hidden" />
              <span className="text-zinc-400">Seller</span>. <br/> 
              Earn in Lakhs.
            </h1>
            <p className="mx-auto max-w-xl ty-subtitle font-medium text-zinc-500 leading-relaxed mb-10">
              Direct access to our specialized private investor network. Share potential buyer or seller details and we do the rest.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={`https://wa.me/919518091945?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-4 rounded-full bg-zinc-900 px-12 py-6 ty-title font-bold text-white shadow-2xl shadow-zinc-300 transition-all hover:bg-black hover:scale-[1.05] active:scale-95"
              >
                Join on WhatsApp
                <MessageCircle className="h-5 w-5" />
              </a>
              <div className="flex items-center gap-3 px-8 py-6 rounded-full border border-zinc-100 bg-zinc-50/50">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-zinc-200" />
                    ))}
                 </div>
                 <span className="ty-caption font-black text-zinc-900 uppercase">250+ Partners</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Brand Background accents */}
        <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      </section>

      {/* ── EARNING POTENTIAL CARDS ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Buyer Side */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-10 sm:p-14 rounded-[48px] bg-zinc-900 text-white relative overflow-hidden group"
              >
                 <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary ty-micro mb-6">High Value Buyer</span>
                    <h3 className="ty-display font-black uppercase mb-4 tracking-tighter">Refer a <br/> Verified Investor</h3>
                    <p className="ty-caption text-zinc-400 mb-10 max-w-[280px]">Active buyer network with a minimum investment budget of <span className="text-white font-bold">1 Crore+</span>.</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black tabular-nums">₹25K - 25L</span>
                       <span className="ty-micro text-zinc-500">per deal</span>
                    </div>
                 </div>
                 <BarChart3 className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 -rotate-12 transition-transform group-hover:scale-110" />
              </motion.div>

              {/* Seller Side */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-10 sm:p-14 rounded-[48px] bg-zinc-50 border border-zinc-100 text-zinc-900 relative overflow-hidden group"
              >
                 <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-zinc-200 text-zinc-500 ty-micro mb-6">High Value Seller</span>
                    <h3 className="ty-display font-black uppercase mb-4 tracking-tighter">Refer an <br/> Asset Owner</h3>
                    <p className="ty-caption text-zinc-500 mb-10 max-w-[280px]">Listing referral for properties with a verified market value of <span className="text-zinc-900 font-bold">1 Crore+</span>.</p>
                    <div className="flex items-baseline gap-2 text-brand-primary">
                       <span className="text-4xl font-black tabular-nums">Up to 25L</span>
                       <span className="ty-micro text-zinc-400">commission</span>
                    </div>
                 </div>
                 <Building2 className="absolute -bottom-10 -right-10 h-64 w-64 text-black/5 -rotate-12 transition-transform group-hover:scale-110" />
              </motion.div>
           </div>
        </div>
      </section>

      {/* ── PROCEDURE SECTION ── */}
      <section className="py-32 px-4 sm:px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl">
           <div className="text-center mb-20">
              <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter">The Procedure</h2>
              <p className="ty-body font-medium text-zinc-400 mt-3">Simple 3-step process to get rewarded.</p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6 relative">
              {/* Desktop Connecting horizontal line */}
              <div className="hidden sm:block absolute top-12 left-[15%] right-[15%] h-px bg-zinc-200" />
              
              {[
                { title: "Share Info", desc: "Buyer/Seller details & tell them about us.", icon: MessageCircle, step: "01" },
                { title: "We Close", desc: "Negotiation, visiting and paper work.", icon: Zap, step: "02" },
                { title: "You Earn", desc: "Payout directly on deal closure.", icon: Wallet, step: "03" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center relative z-10">
                   <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-xl shadow-zinc-200 border border-zinc-100 relative group transition-all hover:border-brand-primary">
                      <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center shadow-lg">{item.step}</span>
                      <item.icon className="h-8 w-8 text-brand-primary" strokeWidth={2.5} />
                   </div>
                   <h4 className="ty-title font-black text-zinc-900 uppercase tracking-widest mb-2">{item.title}</h4>
                   <p className="ty-caption font-medium text-zinc-400 leading-tight max-w-[180px]">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── ELIGIBILITY BANNER ── */}
      <section className="py-32 px-4 sm:px-6">
         <div className="mx-auto max-w-4xl">
            <div className="rounded-[40px] bg-zinc-900 p-8 sm:p-20 text-center relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="ty-display font-black text-white uppercase tracking-tighter mb-4">Network Eligibility</h2>
                  <div className="mx-auto w-12 h-1 bg-brand-primary mb-12" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 mx-auto text-brand-primary shadow-2xl">
                           <TrendingUp className="h-6 w-6" />
                        </div>
                        <p className="ty-micro font-black text-white uppercase tracking-[0.2em]">Budget Over 1 Cr</p>
                        <p className="ty-caption text-zinc-400">Targeting high-intent <br/> property investors.</p>
                     </div>
                     <div className="space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 mx-auto text-emerald-400 shadow-2xl">
                           <ShieldCheck className="h-6 w-6" />
                        </div>
                        <p className="ty-micro font-black text-white uppercase tracking-[0.2em]">Value Over 1 Cr</p>
                        <p className="ty-caption text-zinc-400">Exclusive verified premium <br/> property listings.</p>
                     </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 h-64 w-64 bg-brand-primary/20 blur-[100px]" />
            </div>
         </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="pb-32 pt-10 text-center px-4 sm:px-6">
         <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter mb-10">Start Referring Today.</h2>
         <a 
           href={`https://wa.me/919518091945?text=${whatsappMessage}`}
           target="_blank"
           rel="noopener noreferrer"
           className="inline-flex items-center gap-4 rounded-[28px] bg-zinc-900 px-14 py-6 ty-title font-bold text-white shadow-3xl shadow-zinc-300 transition-all hover:bg-black hover:scale-[1.05] active:scale-95"
         >
           Contact via WhatsApp
           <MessageCircle className="h-5 w-5 fill-white" />
         </a>
         <div className="mt-12 flex justify-center items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-black text-zinc-900 mb-0.5 tracking-tighter">500+</p>
              <p className="ty-micro text-zinc-400">Deals Closed</p>
            </div>
            <div className="h-8 w-px bg-zinc-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-zinc-900 mb-0.5 tracking-tighter">₹5 Cr+</p>
              <p className="ty-micro text-zinc-400">Payouts Shared</p>
            </div>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-zinc-100 text-center">
         <p className="ty-micro font-bold text-zinc-400 tracking-[0.2em]">{brand.name} Partner Network &copy; 2026</p>
      </footer>
    </div>
  );
}
