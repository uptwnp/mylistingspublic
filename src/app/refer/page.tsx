'use client';

export const runtime = 'edge';

import { motion } from 'framer-motion';
import { MessageCircle, Wallet, ArrowRight, CheckCircle2, Phone, Building2, Users } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';

export default function ReferAndEarnPage() {
  const brand = useBrand();
  const wa = encodeURIComponent("Hi, I want to refer a property buyer/seller.");

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="pt-32 sm:pt-48 pb-20 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-brand-primary ty-micro font-black tracking-widest uppercase mb-6">
            Any Type Property
          </span>
          <h1 className="ty-hero font-black tracking-tighter text-zinc-900 uppercase leading-[0.9] mb-6">
            Anyone Buying <br />
            <span className="text-brand-primary">or Selling</span>{' '}
            <span className="text-zinc-400">Property?</span>
          </h1>
          <p className="ty-display font-black text-zinc-900 uppercase tracking-tighter mb-4">
            Share Details &amp; Earn up to ₹25 Lakhs.
          </p>
          <p className="ty-subtitle font-medium text-zinc-400 mb-3 max-w-md mx-auto leading-relaxed">
            We share <span className="text-zinc-900 font-bold">25% of our earnings</span> just for sharing the contact info of a potential buyer or seller.
          </p>


          <a
            href={`https://wa.me/919518091945?text=${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-[28px] bg-zinc-900 px-12 py-5 ty-title font-bold text-white shadow-2xl shadow-zinc-300 transition-all hover:bg-black hover:scale-[1.04] active:scale-95"
          >
            <MessageCircle className="h-5 w-5" />
            Join Free on WhatsApp
          </a>
        </motion.div>
      </section>


      {/* EARNING HIGHLIGHT */}
      <section className="py-20 px-4 sm:px-6 bg-zinc-900 text-white rounded-[48px] mx-4 sm:mx-10 mb-10 relative overflow-hidden">
        <div className="mx-auto max-w-5xl relative z-10 text-center">
          <p className="ty-micro font-black text-zinc-500 uppercase tracking-widest mb-4">Your Earning Potential</p>
          <h2 className="ty-hero font-black tracking-tighter text-white uppercase mb-3 leading-[0.9]">
            ₹25,000 – ₹25 Lakh
          </h2>
          <p className="ty-subtitle text-zinc-400 font-medium mb-12">Per successfully closed deal.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 text-left">
              <Users className="h-6 w-6 text-brand-primary mb-4" />
              <p className="ty-title font-black uppercase text-white mb-1">Refer a Buyer</p>
              <p className="ty-caption text-zinc-500">Budget above ₹1 Cr. Active investor looking to purchase.</p>
            </div>
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 text-left">
              <Building2 className="h-6 w-6 text-brand-primary mb-4" />
              <p className="ty-title font-black uppercase text-white mb-1">Refer a Seller</p>
              <p className="ty-caption text-zinc-500">Property value above ₹1 Cr. Owner looking to sell.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/10 blur-[100px]" />
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 sm:px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter">How it Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 relative">
            <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-px bg-zinc-200 -z-0" />

            {[
              { step: "01", title: "Share Info", desc: "Tell us about the buyer or seller via WhatsApp." },
              { step: "02", title: "We Handle It", desc: "Our team manages site visits, offers & paperwork." },
              { step: "03", title: "You Get Paid", desc: "Commission transferred on deal closure." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 relative">
                  <span className="text-3xl font-black text-zinc-900 tabular-nums">{item.step}</span>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-primary text-white text-[9px] font-black flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                </div>
                <h4 className="ty-title font-black text-zinc-900 uppercase tracking-widest mb-2">{item.title}</h4>
                <p className="ty-caption font-medium text-zinc-400 max-w-[180px] leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-4 sm:px-6 text-center">
        <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tighter mb-10">
          Start Referring Today.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`https://wa.me/919518091945?text=${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-[28px] bg-zinc-900 px-12 py-5 ty-title font-bold text-white shadow-2xl shadow-zinc-300 transition-all hover:bg-black hover:scale-[1.04] active:scale-95"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Us
          </a>
          <a
            href="tel:+919518091945"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white px-10 py-5 ty-caption font-bold text-zinc-900 hover:bg-zinc-50 transition-colors active:scale-95"
          >
            <Phone className="h-4 w-4 text-zinc-400" />
            Call Us
          </a>
        </div>
        <p className="mt-8 ty-micro text-zinc-400 uppercase tracking-widest">Eligibility: Buyer Budget or Property Value above ₹1 Cr</p>
      </section>

      <p className="text-center ty-micro text-zinc-300 pb-8 px-4">*Subject to deal closure help if needed which is rare.</p>

      <footer className="py-10 border-t border-zinc-100 text-center">
        <p className="ty-micro font-bold text-zinc-400 uppercase tracking-[0.2em]">{brand.name} Referral Program &copy; 2026</p>
      </footer>
    </div>
  );
}
