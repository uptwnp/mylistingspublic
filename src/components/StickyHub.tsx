'use client';

import { useEffect, useState, useRef } from 'react';
import { useDiscussion } from '@/context/DiscussionContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StickyHub() {
  const { cartItems } = useDiscussion();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(pathname !== '/explore');
  const prevCartCount = useRef(cartItems.length);

  useEffect(() => {
    // If we're on the explore page and the cart count increased
    if (pathname === '/explore') {
      if (cartItems.length > prevCartCount.current) {
        setIsVisible(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
        return () => clearTimeout(timer);
      } else if (cartItems.length === 0) {
        setIsVisible(false);
      }
    } else {
      // On other pages, show it if there are items
      setIsVisible(cartItems.length > 0);
    }
    prevCartCount.current = cartItems.length;
  }, [cartItems.length, pathname]);

  // Don't show on the cart page itself
  if (pathname === '/discussion-cart') return null;

  const shouldShow = cartItems.length > 0 && (pathname !== '/explore' || isVisible);

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
            href="/discussion-cart"
            className="flex items-center gap-4 rounded-full bg-zinc-900/90 hover:bg-zinc-900 px-6 py-3.5 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 blur-md opacity-20 scale-150 rounded-full" />
                <ShoppingCart className="h-4 w-4 relative z-10" />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white shadow-lg shadow-rose-500/50">
                  {cartItems.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">Discuss</span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Out Now</span>
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
