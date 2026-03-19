
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ExploreView } from '@/components/ExploreView';
import { parseSeoSlug } from '@/lib/seo-utils';
import { Metadata } from 'next';

export async function generateSeoMetadata(slug: string[]): Promise<Metadata> {
  const seoData = parseSeoSlug(slug);

  if (!seoData || !seoData.city) {
    return { title: 'Properties | Dealer Network' };
  }

  const { city, type, area, budget } = seoData;
  const titleParts = [];
  
  if (type) titleParts.push(type);
  else titleParts.push("Properties");

  if (area) titleParts.push(`in ${area}`);
  else if (city) titleParts.push(`in ${city}`);
  
  if (budget) titleParts.push(`(${budget})`);

  return {
    title: `${titleParts.join(' ')} | Dealer Network`,
    description: `Explore verified listings in ${city}. Find your dream property with instant maps and premium selection.`,
    alternates: {
      canonical: `/${slug.join('/')}`,
    },
  };
}

export function SeoExploreView({ slug }: { slug: string[] }) {
  const seoData = parseSeoSlug(slug);

  if (!seoData || !seoData.city) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
      </div>
    }>
      <ExploreView 
        overrideCity={seoData.city} 
        overrideType={seoData.type || undefined} 
        overrideArea={seoData.area || undefined} 
        overrideBudget={seoData.budget || undefined} 
      />
    </Suspense>
  );
}
