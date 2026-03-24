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
        <div className="mt-10 px-0">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex w-full items-center gap-3 rounded-full border border-blue-100 bg-blue-50/30 p-1.5 pl-6 shadow-xl shadow-blue-900/5 transition-all active:scale-[0.98] text-left"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-black text-brand-primary leading-none tracking-tight uppercase mb-1">Start your search</span>
              <span className="text-[12px] font-bold text-zinc-400 truncate leading-none tracking-tight">
                {`Search plots, villas & more in ${selectedCity}`}
              </span>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg shadow-blue-200">
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
