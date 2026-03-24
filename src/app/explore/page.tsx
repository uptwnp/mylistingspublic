import { Suspense } from 'react';
import { ExploreView } from '@/components/ExploreView';
import { getProperties } from '@/lib/supabase';
import { cookies } from 'next/headers';

const CITY_KEY = 'dealer_network_selected_city';

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

export default async function ExplorePage({ searchParams }: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  
  const city = (params.city as string) || cookieStore.get(CITY_KEY)?.value || 'Panipat';
  const type = params.type as string;
  const area = params.area as string;
  const budget = params.budget as string;
  const minSize = params.minSize as string;
  const maxSize = params.maxSize as string;
  const highlights = params.highlights as string;
  const keywords = (params.q as string) || (params.keywords as string);

  // Pre-fetch first page on the server
  const { data: initialProperties, count: initialTotalCount } = await getProperties(
    0, 20, false,
    city === 'All' ? undefined : city,
    type,
    'approved_on',
    'desc',
    area,
    budget,
    minSize,
    maxSize,
    highlights,
    keywords
  );

  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreView 
        initialProperties={initialProperties}
        initialTotalCount={initialTotalCount}
      />
    </Suspense>
  );
}
