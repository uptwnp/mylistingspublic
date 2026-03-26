import React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Spacer matching HomeClientWrapper */}
      <div className="h-[72px] sm:h-[360px] lg:h-80" />
      
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pt-8 pb-32 space-y-16 animate-pulse">
        {/* Section 1 */}
        <div className="space-y-6">
          <div className="h-6 w-64 bg-zinc-100 rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-3xl" />
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-6">
          <div className="h-6 w-48 bg-zinc-100 rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
