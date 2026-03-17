'use client';

import { useDiscussion } from '@/context/DiscussionContext';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StickyHub() {
  const { cartItems } = useDiscussion();
  const pathname = usePathname();

  // Don't show on the cart page itself
  if (pathname === '/discussion-cart' || cartItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:bottom-10"
      >
        <Link 
          href="/discussion-cart"
          className="flex items-center gap-4 rounded-full bg-zinc-900 px-6 py-4 text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {cartItems.length}
              </span>
            </div>
            <span className="text-sm font-black uppercase tracking-widest">Discuss Out Now</span>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-400" />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
