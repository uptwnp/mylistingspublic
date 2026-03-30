import React from 'react';
import { SellClient } from '@/components/SellClient';

// Enable ISR: Cache the marketing content of this page for 1 hour

// Use Edge runtime for global speed

export const metadata = {
  title: 'Sale your property faster | Verified Property Network',
  description: 'List your property on our exclusive network and connect with verified buyers instantly.',
};

export default function SellPropertyPage() {
  return (
    <main className="min-h-screen">
      {/* 
          This page is now a Server Component. 
          The marketing text above the fold will be cached and served instantly by Vercel.
          The interactive form logic is contained within SellClient.
      */}
      <SellClient />
      
      {/* 
          Additional Static Marketing / About sections can go here 
          to be indexed and cached even faster.
      */}
      <footer className="py-12 border-t border-zinc-100 text-center bg-zinc-50/50">
         <p className="ty-micro font-bold text-zinc-400 uppercase tracking-[0.2em]">Verified Property Network &copy; 2026</p>
      </footer>
    </main>
  );
}
