'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ExploreView } from '@/components/ExploreView';

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
      </div>
    }>
      <ExploreView />
    </Suspense>
  );
}
