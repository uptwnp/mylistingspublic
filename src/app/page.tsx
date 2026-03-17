export const runtime = 'edge';
import { PropertyGrid } from "@/components/PropertyGrid";
import { HomeSearch } from "@/components/HomeSearch";
import { Search, MapPin, Calculator } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-48 sm:pb-32">
        <div className="absolute top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2 opacity-50 blur-[120px]">
          <div className="absolute top-0 left-1/4 h-[400px] w-[600px] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded-full bg-gradient-to-l from-rose-500 to-amber-500 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-black/5 bg-white/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-900 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Direct Internal Listings
            </div>
            
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl">
              Discover Your Next <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Premium</span> Property.
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600">
              Zero friction. No accounts. Instant filtering. The world's fastest discovery platform for high-end real estate listings.
            </p>

            <HomeSearch />
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
        <PropertyGrid />
      </section>
    </div>
  );
}

