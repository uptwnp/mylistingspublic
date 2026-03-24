'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Building2, 
  Users,
  Trophy,
  Zap,
  Globe,
  IndianRupee
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';

export function ReferClient() {
  const brand = useBrand();
  const wa = encodeURIComponent("Hi, I want to refer a property buyer/seller.");

  return (
    <div className="bg-white">
      {/* ── ELITE REFER HERO ── */}
      <section className="relative pt-32 pb-24 sm:pt-48 sm:pb-40 px-6 overflow-hidden min-h-[75vh] flex items-center bg-white">
        {/* Subtle Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -bottom-10 -right-20 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary ty-micro font-bold tracking-widest uppercase mb-10 shadow-sm">
               <Trophy className="h-3.5 w-3.5 fill-brand-primary" /> Referral Program
             </span>
             <h1 className="ty-hero font-black tracking-tight text-zinc-900 uppercase mb-8">
               Share a Lead, <br />
               <span className="text-brand-primary">Earn up to ₹25 Lakh</span>
             </h1>
             <p className="mx-auto max-w-xl ty-subtitle font-medium text-zinc-500 mb-12 leading-relaxed">
               Help your network find their dream property. Share a verified contact and earn <span className="text-zinc-900 font-bold">25% of the deal's total commission</span> on closure.
             </p>
             <div className="flex flex-col items-center gap-4">
               <a 
                 href={`https://wa.me/919518091945?text=${wa}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="group relative inline-flex items-center gap-6 rounded-full bg-zinc-900 px-10 py-5 transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.99] shadow-2xl shadow-zinc-200"
               >
                 <span className="ty-title font-bold text-white uppercase tracking-tight">Refer on WhatsApp</span>
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 group-hover:bg-brand-primary transition-colors">
                   <ArrowRight className="h-4 w-4 text-white" />
                 </div>
               </a>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="ty-caption font-bold uppercase tracking-widest text-zinc-500">Free to Join & Refer</p>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── EARNING POTENTIAL ── */}
      <section className="py-24 sm:py-40 px-6 bg-zinc-50/50 border-y border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[100px] rounded-full -z-10" />
        
        <div className="mx-auto max-w-4xl text-center">
           <h2 className="ty-display font-black text-zinc-900 uppercase mb-4 tracking-tighter">Unlimited Reward Potential</h2>
           <p className="ty-subtitle text-zinc-500 mb-16 max-w-md mx-auto">From individual deals to corporate mandates — your referrals are worth lakhs.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-zinc-100 shadow-sm text-left group transition-all hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/5">
                 <div className="h-14 w-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center mb-10 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    <Users className="h-7 w-7" />
                 </div>
                 <h3 className="ty-title font-black text-zinc-900 uppercase mb-4 tracking-tight">Buyer referrals</h3>
                 <p className="ty-body text-zinc-500 leading-relaxed font-medium">Connect us with serious investors or home buyers with budgets above ₹1 Cr. You earn 25% of our profit from that transaction as soon as the deal closes.</p>
              </div>
              <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-zinc-100 shadow-sm text-left group transition-all hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/5">
                 <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-10 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                    <Building2 className="h-7 w-7" />
                 </div>
                 <h3 className="ty-title font-black text-zinc-900 uppercase mb-4 tracking-tight">Seller referrals</h3>
                 <p className="ty-body text-zinc-500 leading-relaxed font-medium">Refer property owners or developers looking to exit assets valued above ₹1 Cr. Receive 25% of our success fee for that mandate directly in your account.</p>
              </div>
           </div>
        </div>
      </section>

      {/* ── REVENUE SHARE ADVICE (ADVISORY STYLE) ── */}
      <section className="py-32 sm:py-48 px-6 overflow-hidden relative bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand-primary/[0.03] blur-[150px] -z-10" />
        
        <div className="mx-auto max-w-4xl text-center">
           <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 text-brand-primary ty-micro font-bold mb-10 uppercase tracking-[0.2em] border border-blue-100 shadow-sm">True Partnership</div>
           <h2 className="ty-hero font-black text-zinc-900 uppercase mb-10 leading-[1.05] tracking-tighter">
             Directly Earn 25% <br />
             <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent italic">Of That Lead's Revenue.</span>
           </h2>
           <p className="ty-subtitle font-medium text-zinc-500 max-w-2xl mx-auto leading-relaxed">
             No complicated payouts. When we complete a deal from your referral, you get a flat 25% share of the platform's total earnings from that specific transaction. Clear, transparent, and immediate.
           </p>
        </div>
      </section>

      {/* ── HOW IT WORKS (STAIRCASE FLOW) ── */}
      <section id="how-it-works" className="py-24 sm:py-40 px-6 bg-zinc-900 border-y border-zinc-800 relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[130px] rounded-full -z-10" />
        
        <div className="mx-auto max-w-5xl">
           <h2 className="ty-display font-black text-white uppercase mb-16 text-left tracking-tight">Your Path to Payout</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Share Content", desc: "Share the target buyer or seller's vision and contact details via WhatsApp in seconds.", icon: MessageCircle, step: "Step 01" },
                { title: "Global Execution", desc: "Our professional advisors handle the site visits, pricing strategy, and end-to-end paperwork.", icon: Zap, step: "Step 02" },
                { title: "Instant Earning", desc: "Receive your referral fee directly in your bank account as soon as the deal hits the 10% milestone.", icon: Wallet, step: "Step 03" },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 group">
                   <div className="ty-micro font-black text-zinc-500 uppercase tracking-widest mb-6">{item.step}</div>
                   <div className="h-12 w-12 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6" />
                   </div>
                   <h3 className="ty-title font-black text-white uppercase mb-4 tracking-tight leading-snug">{item.title}</h3>
                   <p className="ty-body text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── FINAL CALL ── */}
      <section className="py-32 sm:py-48 px-6 text-center relative bg-white">
        <div className="absolute inset-0 bg-brand-primary/[0.01] -z-10" />
        <div className="mx-auto max-w-4xl text-center">
           <h2 className="ty-display font-black text-zinc-900 uppercase mb-4 tracking-tight">Start Your Portfolio</h2>
           <p className="ty-subtitle text-zinc-500 mb-14 max-w-sm mx-auto leading-relaxed">Join the {brand.name} circle and monetize your professional network today.</p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="tel:+919518091945" className="inline-flex w-full sm:w-auto items-center justify-center gap-4 rounded-full bg-white border-2 border-zinc-100 px-10 py-5 ty-title font-bold text-zinc-900 transition-all hover:border-zinc-900  shadow-xl shadow-zinc-100/50">
                <Phone className="h-5 w-5 text-brand-primary" /> Call for Queries
              </a>
              <a 
                href={`https://wa.me/919518091945?text=${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-4 rounded-full bg-brand-primary px-10 py-5 ty-title font-bold text-white shadow-2xl shadow-brand-primary/20 transition-all hover:bg-blue-700 active:scale-[0.99]"
              >
                Join on WhatsApp <ArrowRight className="h-5 w-5" />
              </a>
           </div>
           <p className="mt-12 ty-micro font-black text-zinc-300 uppercase tracking-widest">Eligibility: Property Value above ₹1 Crore</p>
        </div>
      </section>

      {/* ── CLEAN FOOTER ── */}
      <footer className="py-16 border-t border-zinc-100 text-center bg-white">
        <p className="ty-micro font-black text-zinc-400 uppercase tracking-[0.4em] mb-2">{brand.name} REFERRAL NETWORK</p>
        <p className="ty-micro font-bold text-zinc-200 uppercase tracking-[0.2em]">© 2026 {brand.name} Technology Solutions.</p>
      </footer>
    </div>
  );
}
