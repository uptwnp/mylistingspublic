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
  Wallet
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

  const agentBenefits = [
    {
      title: "Verified Inventory",
      desc: "Gain exclusive access to properties that have been pre-vetted for authenticity.",
      icon: ShieldCheck,
      color: "text-brand-primary",
      bg: "bg-blue-50"
    },
    {
      title: "High Intent Leads",
      desc: "Connect with serious buyers and investors from our private network.",
      icon: Zap,
    },
    {
      title: "Zero Setup Cost",
      desc: "List your property and start using our premium suite at no upfront cost.",
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    }
  ];

  // Manual icons to avoid issues with dynamic Zap
  const benefits = [
    { title: "Verified Inventory", desc: "Pre-vetted, direct property listings.", icon: ShieldCheck },
    { title: "High Intent Leads", desc: "Serious buyers from our private network.", icon: Zap },
    { title: "Cloud Listing", desc: "List and manage assets from anywhere.", icon: Globe }
  ];

  const agentStats = [
    { label: "Active Brokers", value: "250+", icon: Users },
    { label: "Closed Volume", value: "₹450 Cr+", icon: TrendingUp },
    { label: "Partner Rating", value: "4.9/5", icon: Star },
    { label: "Market Reach", value: "Haryana", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 sm:pt-48 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-brand-primary ty-micro font-black tracking-widest uppercase mb-6">Expert Partnership</span>
              <h1 className="ty-hero font-black tracking-tighter text-zinc-900 uppercase leading-[0.9] mb-8">
                The Network for <br/> 
                <span className="text-brand-primary">Winning Agents.</span>
              </h1>
              <p className="ty-subtitle font-medium text-zinc-500 leading-relaxed mb-10 max-w-lg">
                Join our premium broker network and get direct access to hundreds of verified investors. Close deals faster with our specialized property marketplace.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  className="rounded-[28px] bg-zinc-900 px-10 py-5 ty-title font-bold text-white shadow-2xl shadow-zinc-300 transition-all hover:bg-black hover:scale-[1.05] active:scale-95"
                  onClick={() => {
                    const el = document.getElementById('registration-form');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join the Network
                </button>
                <a 
                  href="https://wa.me/919518091945?text=Hi, I'm an agent looking to join the Network."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-8 py-5 ty-caption font-bold text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                  Talk to Coordinator
                </a>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="relative lg:block hidden"
            >
               <div className="aspect-[4/5] rounded-[48px] bg-zinc-100 overflow-hidden shadow-3xl border border-zinc-200 rotate-2">
                  <img 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" 
                    className="h-full w-full object-cover grayscale opacity-90 transition-transform duration-700 hover:scale-110"
                    alt="Success Partner"
                  />
               </div>
               <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[32px] shadow-2xl border border-zinc-100 max-w-xs">
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="ty-caption font-black text-zinc-900 leading-snug italic">"The level of transparency and high-intent leads is unmatched."</p>
                  <p className="ty-micro font-bold text-brand-primary uppercase mt-4 tracking-widest">Verified Partner</p>
               </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-24 px-4 sm:px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
              {agentStats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center p-8 text-center transition-all">
                  <stat.icon className="h-4 w-4 text-brand-primary mb-4 opacity-40" strokeWidth={3} />
                  <span className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter tabular-nums mb-1">{stat.value}</span>
                  <span className="ty-micro font-black text-zinc-400 uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── BENEFITS SECTION ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="ty-display font-black tracking-tighter text-zinc-900 uppercase mb-4">Partner Suite</h2>
            <p className="ty-subtitle font-medium text-zinc-500">Professional tools for professional agents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div 
                key={i}
                className="group p-10 rounded-[40px] border border-zinc-100 bg-white transition-all hover:border-brand-primary hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50"
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:bg-brand-primary group-hover:text-white transition-all">
                   <benefit.icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <h3 className="ty-title font-black text-zinc-900 uppercase tracking-widest mb-3">{benefit.title}</h3>
                <p className="ty-caption font-medium text-zinc-400 leading-relaxed group-hover:text-zinc-500">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK FEATURES BANNER ── */}
      <section className="py-32 px-4 sm:px-6 bg-zinc-900 text-white rounded-[48px] mx-4 sm:mx-10 my-10 overflow-hidden relative">
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div>
                <span className="ty-micro font-black text-brand-primary tracking-widest uppercase mb-4 block">Platform Advantage</span>
                <h2 className="ty-display font-black text-white uppercase tracking-tighter mb-8 leading-tight">Institutional <br/> Standards for Agents.</h2>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-brand-primary mt-0.5" />
                      <div>
                         <p className="ty-title font-black uppercase text-white">Direct Communication</p>
                         <p className="ty-caption text-zinc-400">Zero middlemen between you and property owners.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-brand-primary mt-0.5" />
                      <div>
                         <p className="ty-title font-black uppercase text-white">Real-time Updates</p>
                         <p className="ty-caption text-zinc-400">Instant notifications for new inventory matching your area.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="relative">
                <div className="aspect-video sm:aspect-square bg-white/5 rounded-[32px] border border-white/10 p-4 relative overflow-hidden">
                   <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full text-white/5" />
                   <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden grayscale">
                      <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" 
                        className="w-full h-full object-cover" 
                        alt="Office" 
                      />
                   </div>
                </div>
                <div className="absolute -top-6 -right-6 h-12 w-12 bg-brand-primary rounded-full animate-pulse shadow-2xl shadow-brand-primary/50" />
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-96 w-96 bg-brand-primary/10 blur-[100px]" />
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section id="registration-form" className="py-32 px-4 sm:px-6">
         <div className="mx-auto max-w-3xl">
            <div className="rounded-[40px] bg-white p-8 sm:p-20 shadow-3xl shadow-zinc-200/50 border border-zinc-100">
               {isFormSubmitted ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="text-center py-10"
                 >
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-100">
                      <CheckCircle2 className="h-10 w-10" strokeWidth={3} />
                    </div>
                    <h2 className="ty-display font-black text-zinc-900 uppercase tracking-tight mb-4">Application Sent</h2>
                    <p className="mb-12 text-zinc-500 font-medium max-w-sm mx-auto">Your partnership request is being reviewed. Expect a call within 2 hours.</p>
                    <button 
                      onClick={() => setIsFormSubmitted(false)}
                      className="px-10 py-4 rounded-xl border-2 border-zinc-900 ty-micro text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all uppercase"
                    >
                      Apply for Another
                    </button>
                 </motion.div>
               ) : (
                 <>
                   <div className="text-center mb-12">
                      <h2 className="ty-display font-black text-zinc-900 uppercase tracking-widest mb-3">Partner Application</h2>
                      <p className="ty-subtitle text-zinc-400">Join Haryana's elite property network.</p>
                   </div>
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="ty-micro font-black text-zinc-400 uppercase ml-1">Full Name</label>
                          <input required type="text" name="fullName" autoComplete="name" className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 p-4 font-bold text-zinc-900 outline-none focus:border-brand-primary transition-all" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <label className="ty-micro font-black text-zinc-400 uppercase ml-1">Work City</label>
                          <input required type="text" name="workCity" autoComplete="address-level2" className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 p-4 font-bold text-zinc-900 outline-none focus:border-brand-primary transition-all" placeholder="e.g. Panipat" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="ty-micro font-black text-zinc-400 uppercase ml-1">Phone Number</label>
                        <input required type="tel" name="phone" autoComplete="tel" className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 p-4 font-bold text-zinc-900 outline-none focus:border-brand-primary transition-all" placeholder="+91 00000 00000" />
                      </div>
                      <div className="space-y-2">
                        <label className="ty-micro font-black text-zinc-400 uppercase ml-1">Company (Optional)</label>
                        <input type="text" name="company" autoComplete="organization" className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 p-4 font-bold text-zinc-900 outline-none focus:border-brand-primary transition-all" placeholder="Company Name" />
                      </div>
                      <div className="pt-6">
                         <button type="submit" className="w-full rounded-[24px] bg-zinc-900 py-6 ty-title font-black text-white uppercase tracking-widest shadow-2xl transition-all hover:bg-black active:scale-[0.98]">
                            Submit Application
                         </button>
                      </div>
                      <p className="text-center ty-micro text-zinc-400 uppercase tracking-widest mt-6">By submitting, you agree to our <span className="text-zinc-900 underline underline-offset-2 hover:text-brand-primary">Terms</span>.</p>
                   </form>
                 </>
               )}
            </div>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-zinc-100 text-center">
         <p className="ty-micro font-bold text-zinc-400 uppercase tracking-[0.2em]">{brand.name} Broker Network &copy; 2026</p>
      </footer>
    </div>
  );
}
