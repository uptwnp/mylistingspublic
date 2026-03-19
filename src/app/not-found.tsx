'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrand } from '@/context/BrandContext';

export default function NotFound() {
  const brand = useBrand();

  return (
    <div className="min-h-[85vh] flex flex-col bg-white overflow-hidden relative">
      {/* Spacer for fixed Navbar */}
      <div className="h-[140px] sm:h-[180px] lg:h-[220px]" />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 relative">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square pointer-events-none opacity-[0.03] select-none">
          <div className="absolute inset-0 bg-zinc-900 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8 sm:mb-12"
        >
          <h1 className="text-[140px] md:text-[220px] font-black tracking-tighter text-zinc-900/5 leading-none select-none">
            404
          </h1>
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-3xl bg-zinc-900 shadow-2xl shadow-black/30 flex transform -rotate-12">
              <Home className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center z-10"
        >
          <h1 className="ty-hero font-black text-zinc-900 mb-4 tracking-tight leading-tight">
            Oops! This property is <br />
            <span className="text-gradient">Off the Market</span>.
          </h1>
          <p className="ty-subtitle text-zinc-500 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
            The page you're looking for doesn't exist or has been moved to a more exclusive location.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="group flex w-full sm:w-auto items-center justify-center gap-3 px-10 py-4 bg-zinc-900 text-white rounded-2xl ty-caption font-black uppercase tracking-wider hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/10"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
            <Link 
              href="/explore"
              className="flex w-full sm:w-auto items-center justify-center gap-3 px-10 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-2xl ty-caption font-black uppercase tracking-wider hover:border-zinc-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              Browse Network
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3 text-zinc-400 ty-micro tracking-[0.2em] font-black">
            <span className="h-px w-10 bg-zinc-100" />
            {brand.name} SECURED CONTENT
            <span className="h-px w-10 bg-zinc-100" />
          </div>
          <div className="flex gap-8 opacity-40">
            <div className="h-1 w-1 rounded-full bg-zinc-400" />
            <div className="h-1 w-1 rounded-full bg-zinc-400" />
            <div className="h-1 w-1 rounded-full bg-zinc-400" />
          </div>
        </motion.div>
      </div>

      {/* Additional bottom spacer for better centering in min-h-screen */}
      <div className="h-24 sm:h-32" />
    </div>
  );
}
