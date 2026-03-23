'use client';

import { Search } from 'lucide-react';
import { PropertySection } from "@/components/PropertySection";
import { PropertyListSection } from "@/components/PropertyListSection";
import { ContinueExploringBanner } from "@/components/ContinueExploringBanner";
import { useShortlist } from "@/context/ShortlistContext";
import { Property } from "@/types";

interface HomeClientWrapperProps {
  initialPlots: { data: Property[], count: number };
  initialApartments?: { data: Property[], count: number };
  initialVillas?: { data: Property[], count: number };
  initialCommercial?: { data: Property[], count: number };
  serverCity: string;
}

export function HomeClientWrapper({
  initialPlots,
  initialApartments,
  initialVillas,
  initialCommercial,
  serverCity
}: HomeClientWrapperProps) {
  const { selectedCity, setIsMobileSearchOpen, recentlyVisitedIds, shortlistItems, savedIds } = useShortlist();

  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for fixed Navbar — mobile is shorter because hero is in content now */}
      <div className="h-[72px] sm:h-[360px] lg:h-80" />

      {/* Mobile-only Hero Section — hidden on sm+ where navbar shows the full hero */}
      <section className="sm:hidden px-4 pt-8 pb-4 text-center">
        <h1 className="ty-hero font-bold tracking-tight text-zinc-900 leading-[1.05]">
          Find your dream property
        </h1>
        <p className="mt-3 ty-label text-zinc-400 opacity-80">
          Choose from biggest property pool
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
                {`Near Me, ${selectedCity}`}
              </span>
            </div>
          </button>
        </div>
      </section>

      <ContinueExploringBanner />

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-8 pb-32 space-y-10 sm:space-y-16">
        {recentlyVisitedIds.length > 0 && (
          <PropertyListSection
            title="Recently Visited"
            propertyIds={recentlyVisitedIds}
          />
        )}

        {shortlistItems.length > 0 && (
          <PropertyListSection
            title="Your Shortlist"
            propertyIds={shortlistItems}
            viewAllLink="/shortlist"
          />
        )}

        {savedIds.length > 0 && (
          <PropertyListSection
            title="Saved Properties"
            propertyIds={savedIds}
          />
        )}

        <PropertySection 
          title={`Residential Plots for sale`} 
          city={selectedCity}
          type="Residential Plot" 
          initialData={selectedCity === serverCity ? initialPlots : undefined}
        />

        <PropertySection 
          title={`Apartments for sale`} 
          city={selectedCity}
          type="Flat/Apartment" 
          initialData={selectedCity === serverCity ? initialApartments : undefined}
        />

        <PropertySection 
          title={`Villas for sale`} 
          city={selectedCity}
          type="House/Villa" 
          initialData={selectedCity === serverCity ? initialVillas : undefined}
        />

        <PropertySection 
          title={`Commercial Space`} 
          city={selectedCity}
          type="Commercial" 
          initialData={selectedCity === serverCity ? initialCommercial : undefined}
        />
      </section>
    </div>
  );
}
