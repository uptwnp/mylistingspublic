'use client';

import { Suspense } from 'react';
import { ExploreView } from '@/components/ExploreView';

function ExploreSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-white pt-32">
       <div className="mx-auto max-w-[1440px] w-full px-6 lg:px-12 animate-pulse">
          <div className="h-4 w-48 bg-zinc-100 rounded-full mb-8" />
          <div className="h-12 w-64 bg-zinc-100 rounded-2xl mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-3xl" />
             ))}
          </div>
       </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreView />
    </Suspense>
  );
}
