'use client';

import Link from 'next/link';
import { Heart, MessageSquare, Home, Menu, X, PlusCircle, Users, ShoppingCart } from 'lucide-react';
import { useDiscussion } from '@/context/DiscussionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CitySelector } from './CitySelector';

export default function Navbar() {
  const { cartItems, savedIds } = useDiscussion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "border-b border-zinc-200 bg-white/80 backdrop-blur-xl py-3" 
        : "border-transparent bg-transparent py-5"
    )}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Logo & City */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shadow-lg shadow-black/10 transition-transform group-hover:scale-105">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-zinc-900 sm:text-2xl">
              My<span className="text-zinc-400 font-medium">Listing</span>
            </span>
          </Link>

          <div className="hidden sm:block">
            <CitySelector />
          </div>
        </div>

        {/* Middle Section: Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-8">
          <Link href="/explore" className="text-sm font-bold text-zinc-500 hover:text-black transition-colors">
            Explore Properties
          </Link>

          <Link href="#" className="flex items-center gap-1.5 text-sm font-bold text-zinc-500 hover:text-black transition-colors">
            <PlusCircle className="h-4 w-4" />
            Sell Property
          </Link>
          <Link href="#" className="flex items-center gap-1.5 text-sm font-bold text-zinc-500 hover:text-black transition-colors">
            <Users className="h-4 w-4" />
            Join as Agent
          </Link>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            href="/favorites" 
            className="group relative flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 transition-all hover:border-zinc-300 hover:text-black"
          >
            <Heart className={cn("h-4 w-4 transition-all", savedIds.length > 0 && "fill-rose-500 text-rose-500")} />
            <span className="hidden sm:inline">Saved</span>
            {savedIds.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {savedIds.length}
              </span>
            )}
          </Link>
          
          <Link 
            href="/discussion-cart" 
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-5 py-2.5 text-white transition-all hover:bg-zinc-800 hover:shadow-lg shadow-xl shadow-black/10"
          >
            <div className="relative">
              <ShoppingCart className="h-4 w-4" />
              <AnimatePresence mode="wait">
                {cartItems.length > 0 && (
                  <motion.span
                    key="cart-count-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] hidden sm:inline">Discuss Cart</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-600"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-zinc-100"
          >
            <div className="flex flex-col p-4 space-y-4">
              <div className="pb-2">
                <CitySelector />
              </div>
              <Link href="/explore" className="text-lg font-bold p-2 text-zinc-900" onClick={() => setIsMobileMenuOpen(false)}>Explore Properties</Link>

              <Link href="#" className="text-lg font-bold p-2 text-zinc-900" onClick={() => setIsMobileMenuOpen(false)}>Sell Property</Link>
              <Link href="#" className="text-lg font-bold p-2 text-zinc-900" onClick={() => setIsMobileMenuOpen(false)}>Join as Agent</Link>
              <Link href="/favorites" className="text-lg font-bold p-2 text-zinc-900" onClick={() => setIsMobileMenuOpen(false)}>Saved Properties ({savedIds.length})</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

