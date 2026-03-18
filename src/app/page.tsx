'use client';

export const runtime = 'edge';

import { Search } from 'lucide-react';
import { PropertyGrid } from "@/components/PropertyGrid";
import { PropertySection } from "@/components/PropertySection";
import { useDiscussion } from "@/context/DiscussionContext";

export default function Home() {
  const { selectedCity, setIsMobileSearchOpen } = useDiscussion();

  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for fixed Navbar — mobile is shorter because hero is in content now */}
      <div className="h-[72px] sm:h-[360px] lg:h-80" />

      {/* Mobile-only Hero Section — hidden on sm+ where navbar shows the full hero */}
      <section className="sm:hidden px-4 pt-8 pb-4 text-center">
        <h1 className="ty-hero font-bold tracking-tight text-zinc-900 leading-[1.05]">
          Find your perfect space in {selectedCity}
        </h1>
        <p className="mt-3 ty-label text-zinc-400 opacity-80">
          Curated listings for premium living
        </p>
        <div className="mt-8 px-0">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex w-full items-center gap-4 rounded-[32px] border border-zinc-200/80 bg-white p-4 shadow-2xl shadow-zinc-200/60 transition-all hover:scale-[1.02] active:scale-95 text-left"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Search className="h-5 w-5" strokeWidth={3} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="ty-body font-bold text-zinc-900 uppercase tracking-tighter">Start your search</span>
              <span className="ty-caption font-bold text-zinc-400 truncate tracking-tight">
                {`Nearby, ${selectedCity}`}
              </span>
            </div>
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pb-32 space-y-12 sm:space-y-24">
        <PropertySection 
          title={`Residential Plots for sale`} 
          city={selectedCity}
          type="Residential Plot" 
        />

        <PropertySection 
          title={`Apartments for sale`} 
          city={selectedCity}
          type="Flat/Apartment" 
        />

        <PropertySection 
          title={`Villas for sale`} 
          city={selectedCity}
          type="House/Villa" 
        />

        <PropertySection 
          title={`Commercial Space`} 
          city={selectedCity}
          type="Commercial" 
        />

        <div className="pt-24 border-t border-zinc-100">
          <div className="mb-12">
            <h2 className="ty-display font-black tracking-tight text-zinc-900">
              More Listings in {selectedCity}
            </h2>
            <p className="ty-caption text-zinc-500 mt-1">Explore the complete catalog of properties.</p>
          </div>
          <PropertyGrid />
        </div>
      </section>
    </div>
  );
}


