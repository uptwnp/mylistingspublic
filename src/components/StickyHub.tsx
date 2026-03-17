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
            className="flex items-center gap-4 rounded-full bg-zinc-900 px-6 py-4 text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {cartItems.length}
                </span>
              </div>
              <span className="text-sm font-black uppercase tracking-widest">Discuss Out Now</span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
