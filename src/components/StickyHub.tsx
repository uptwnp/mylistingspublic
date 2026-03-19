'use client';

import { useEffect, useState, useRef } from 'react';
import { useShortlist } from '@/context/ShortlistContext';
import { ShoppingCart, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StickyHub() {
  const { shortlistItems } = useShortlist();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isIconHovered, setIsIconHovered] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const prevShortlistCount = useRef(shortlistItems.length);

  useEffect(() => {
    // Delay readiness to avoid trigger during localStorage hydration
    const timer = setTimeout(() => setIsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only show the hub when a property is added AND we are past the initial load
    if (isReady && shortlistItems.length > prevShortlistCount.current) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (shortlistItems.length === 0) {
      setIsVisible(false);
    }
    prevShortlistCount.current = shortlistItems.length;
  }, [shortlistItems.length, isReady]);

  // Don't show on the cart page itself
  if (pathname === '/shortlist') return null;

  const shouldShow = shortlistItems.length > 0 && isVisible;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 100, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-1/2 z-[60] md:bottom-10"
        >
          <Link 
            href="/shortlist"
            className="flex items-center gap-4 rounded-full bg-zinc-900/90 hover:bg-zinc-900 px-6 py-3.5 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-white/10"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <ShoppingCart className="h-5 w-5 relative z-10" />
                <span className="absolute -top-2.5 -right-2.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#f43f5e] text-[11px] font-black text-white shadow-xl ring-2 ring-zinc-900">
                  {shortlistItems.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="ty-label leading-none mb-0.5 text-xs font-bold uppercase tracking-widest text-zinc-300">View</span>
                <span className="ty-micro font-black text-white leading-none">Shortlist</span>
              </div>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div 
              onMouseEnter={() => setIsIconHovered(true)}
              onMouseLeave={() => setIsIconHovered(false)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/10 active:scale-90"
            >
              {isIconHovered ? (
                <X className="h-4 w-4 text-zinc-400" />
              ) : (
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              )}
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
