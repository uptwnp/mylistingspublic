
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ExploreView } from '@/components/ExploreView';
import { parseSeoSlug } from '@/lib/seo-utils';
import { Metadata } from 'next';

export async function generateSeoMetadata(slug: string[]): Promise<Metadata> {
  const seoData = parseSeoSlug(slug);

  if (!seoData || !seoData.city) {
    return { title: 'Browse Properties | MyListings' };
  }

  const { city, type, area, budget } = seoData;
  const titleParts = [];
  
  // Property Type: e.g., "Plots", "Houses", or "Properties"
  const baseType = type ? type : "Properties";
  titleParts.push(baseType);

  titleParts.push("for Sale");

  // Location part: e.g., "in Raj Nagar, Panipat" or just "in Panipat"
  if (area && area.toLowerCase() !== 'anywhere') {
    titleParts.push(`in ${area}, ${city}`);
  } else {
    titleParts.push(`in ${city}`);
  }
  
  // Budget part: e.g., "Under 40 Lakh" or "in 1.6 to 2.5 Cr"
  if (budget && budget.toLowerCase() !== 'any budget') {
    titleParts.push(`${budget}`);
  }

  const title = titleParts.join(' ');

  return {
    title: `${title} | MyListings`,
    description: `Browse verified ${baseType.toLowerCase()} for sale in ${area || city}. Get instant maps, direct contact with owners, and premium internal listings with ${title}.`,
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
