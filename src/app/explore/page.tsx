import { Suspense } from 'react';
import { ExploreView } from '@/components/ExploreView';
import { getProperties } from '@/lib/supabase';
import { cookies } from 'next/headers';

const CITY_KEY = 'dealer_network_selected_city';

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
    <ExploreView 
      initialProperties={initialProperties}
      initialTotalCount={initialTotalCount}
    />
  );
}
