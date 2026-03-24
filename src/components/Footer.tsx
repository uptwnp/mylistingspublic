'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';


export default function Footer() {
  const brand = useBrand();

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 pt-16 pb-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid gap-12 md:grid-cols-4 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 shadow-lg shadow-black/10 transition-transform group-hover:scale-105">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="ty-subtitle font-black tracking-tighter text-zinc-900 uppercase">
                {brand.logoText.styled ? (
                  <>
                    {brand.logoText.prefix}<span className="text-zinc-400 font-medium">{brand.logoText.suffix}</span>
                  </>
                ) : (
                  <span>{brand.logoText.text}</span>
                )}
              </span>
            </Link>
            <p className="text-zinc-500 ty-caption max-w-sm leading-relaxed font-medium">
              Direct access to premium inventory, managed with architectural precision. 
              The most exclusive internal property listings curated for you.
            </p>
          </div>

          <div>
            <h4 className="ty-label text-zinc-900 mb-6">Discover</h4>
            <ul className="space-y-4">
              <li><Link href="/shortlist" className="ty-caption font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Shortlisted</Link></li>
              <li><Link href="/explore?view=map" className="ty-caption font-bold text-zinc-500 hover:text-rose-500 transition-colors">Explore Map</Link></li>
              <li><Link href="/favorites" className="ty-caption font-bold text-zinc-500 hover:text-rose-500 transition-colors">Saved Properties</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="ty-label text-zinc-900 mb-6">Network</h4>
            <ul className="space-y-4">
              <li><Link href="/agent" className="ty-caption font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Agent Portal</Link></li>
              <li><Link href="/sell" className="ty-caption font-bold text-zinc-500 hover:text-zinc-900 transition-colors">List Your Property</Link></li>
              <li><Link href="/refer" className="ty-caption font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Partner Program</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-6 ty-label text-zinc-400">
            <span>© 2026 {brand.name} Network</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-900 transition-colors">T&C</Link>
              <Link href="/sitemap.xml" className="hover:text-zinc-900 transition-colors">Sitemap</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
          </div>
        </div>
      </div>
    </footer>
  );
}


