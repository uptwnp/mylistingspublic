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
      <section className="sm:hidden px-4 pt-8 pb-10 text-center">
        <h1 className="ty-hero font-extrabold tracking-tight text-zinc-900 leading-[1.1] mb-3">
          Find your dream property
        </h1>
        <p className="ty-subtitle text-zinc-600 font-medium max-w-[280px] mx-auto opacity-90">
          Choose from biggest property pool
        </p>
        <div className="mt-10 mb-8 px-0">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex w-full items-center gap-3 rounded-[24px] border border-blue-100 bg-white p-2 pl-6 shadow-2xl shadow-blue-900/10 transition-all active:scale-[0.98] text-left group"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className="ty-micro font-black text-brand-primary leading-none tracking-widest uppercase mb-1.5 opacity-80">Start your search</span>
              <span className="ty-body font-bold text-zinc-900 truncate leading-tight">
                {`Search plots, villas & more in ${selectedCity}`}
              </span>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-xl shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Search className="h-5 w-5" strokeWidth={3} />
            </div>
          </button>

        </div>
      </section>

      <ContinueExploringBanner />

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-8 pb-32 space-y-10 sm:space-y-16">
        <PropertySection 
          title={`Residential Plots for sale`} 
          city={selectedCity}
          type="Residential Plot" 
          initialData={selectedCity === serverCity ? initialPlots : undefined}
        />

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
