'use client';

import { useEffect, useState, useRef } from 'react';
import { useShortlist } from '@/context/ShortlistContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StickyHub() {
  const { shortlistItems } = useShortlist();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(pathname !== '/explore');
  const prevShortlistCount = useRef(shortlistItems.length);

  useEffect(() => {
    // If we're on the explore page and the shortlist count increased
    if (pathname === '/explore') {
      if (shortlistItems.length > prevShortlistCount.current) {
        setIsVisible(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
        return () => clearTimeout(timer);
      } else if (shortlistItems.length === 0) {
        setIsVisible(false);
      }
    } else {
      // On other pages, show it if there are items
      setIsVisible(shortlistItems.length > 0);
    }
    prevShortlistCount.current = shortlistItems.length;
  }, [shortlistItems.length, pathname]);

  // Don't show on the cart page itself
  if (pathname === '/shortlist') return null;

  const shouldShow = shortlistItems.length > 0 && (pathname !== '/explore' || isVisible);

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
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 blur-md opacity-20 scale-150 rounded-full" />
                <ShoppingCart className="h-4 w-4 relative z-10" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 ty-micro font-black text-white shadow-lg shadow-rose-500/50">
                  {shortlistItems.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="ty-label leading-none mb-0.5 text-xs font-bold uppercase tracking-widest text-zinc-300">View</span>
                <span className="ty-micro font-black text-white leading-none">Shortlist</span>
              </div>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
