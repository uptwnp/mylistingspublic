
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ExploreView } from '@/components/ExploreView';
import { parseSeoSlug } from '@/lib/seo-utils';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seoData = parseSeoSlug(slug);

  if (!seoData) {
    return {};
  }

  const { city, type, area, budget } = seoData;
  const titleParts = [];
  if (type) titleParts.push(type);
  if (area) {
     titleParts.push(`in ${area}`);
  } else if (city) {
     titleParts.push(`in ${city}`);
  }
  if (budget) titleParts.push(`(${budget})`);

  const title = titleParts.join(' ') || 'Properties';

  return {
    title: `${title} | Dealer Network`,
    description: `Explore verified listings of ${title}. Find your dream property with instant maps and premium selection.`,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default async function SeoExplorePage({ params }: Props) {
  const { slug } = await params;
  const seoData = parseSeoSlug(slug);

  if (!seoData) {
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
        overrideType={seoData.type} 
        overrideArea={seoData.area} 
        overrideBudget={seoData.budget} 
      />
    </Suspense>
  );
}
