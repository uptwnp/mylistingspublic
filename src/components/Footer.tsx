'use client';

import Link from 'next/link';
import { Building2, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-zinc-900 p-1.5 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-zinc-900 uppercase">
                MyListing
              </span>
            </Link>
            <p className="text-zinc-500 text-sm max-w-sm leading-relaxed font-medium">
              Curating the most exclusive internal property listings. 
              Direct access to premium inventory, managed with architectural precision.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Discover</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Featured Estates</Link></li>
              <li><Link href="/map" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Map Search</Link></li>
              <li><Link href="/discussion-cart" className="text-sm font-bold text-zinc-600 hover:text-black transition-colors">Discussion Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            © 2026 MyListing Network. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
