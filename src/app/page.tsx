'use client';


export const runtime = 'edge';

import { PropertyGrid } from "@/components/PropertyGrid";
import { PropertySection } from "@/components/PropertySection";
import { useDiscussion } from "@/context/DiscussionContext";

export default function Home() {
  const { selectedCity } = useDiscussion();

  return (
    <div className="min-h-screen bg-white">
      {/* Spacer for fixed Navbar */}
      <div className="h-[520px] sm:h-[400px] lg:h-80" />

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pb-32 mt-12 sm:mt-16 space-y-12 sm:space-y-24">
        <PropertySection 
          title={`Residential Plots for sale in ${selectedCity}`} 
          city={selectedCity}
          type="Residential Plot" 
        />

        <PropertySection 
          title={`Apartments for sale in ${selectedCity}`} 
          city={selectedCity}
          type="Flat/Apartment" 
        />

        <PropertySection 
          title={`Villas for sale in ${selectedCity}`} 
          city={selectedCity}
          type="House/Villa" 
        />

        <PropertySection 
          title={`Commercial Space in ${selectedCity}`} 
          city={selectedCity}
          type="Commercial" 
        />

        <div className="pt-24 border-t border-zinc-100">
          <div className="mb-12">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">
              More Listings in {selectedCity}
            </h2>
            <p className="text-sm text-zinc-500">Explore the complete catalog of properties.</p>
          </div>
          <PropertyGrid />
        </div>
      </section>
    </div>
  );
}


