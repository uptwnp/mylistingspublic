
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ExploreView } from '@/components/ExploreView';
import { parseSeoSlug, SEO_CITIES, SEO_PROPERTY_TYPES, BUDGET_MAPPINGS } from '@/lib/seo-utils';
import { getProperties } from '@/lib/supabase';
import { Metadata } from 'next';

export async function generateSeoMetadata(
  slug: string[]
): Promise<Metadata> {
  const seoData = parseSeoSlug(slug);

  if (!seoData || !seoData.city) {
    return { title: 'Browse Properties | MyListings' };
  }

  const { city, type, area, budget } = seoData;
  const titleParts = [];
  
  const isAnyType = !type || type.toLowerCase() === 'all-types' || type.toLowerCase() === 'any type' || type.toLowerCase() === 'any-type' || type.toLowerCase() === 'anything';
  const baseType = isAnyType ? "Properties" : type;
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

  // Canonical logic: Build the cleanest possible path by omitting 'any' parameters from the end
  const cityMatch = SEO_CITIES.find(c => c.value === city);
  const citySlug = cityMatch ? cityMatch.slug : city.toLowerCase().replace(/\s+/g, '-');
  
  const canonicalParts = [citySlug];
  
  const isAnyArea = !area || area.toLowerCase() === 'anywhere';
  const isAnyBudget = !budget || budget.toLowerCase() === 'any budget';

  if (!isAnyArea) {
    const areaSlug = area.toLowerCase().trim().replace(/\s+/g, '-');
    canonicalParts.push(areaSlug);
    
    if (!isAnyType) {
      const typeMatch = SEO_PROPERTY_TYPES.find(t => t.value === type);
      const typeSlug = typeMatch ? typeMatch.slug : type.toLowerCase().trim().replace(/\s+/g, '-');
      canonicalParts.push(typeSlug);
      
      if (!isAnyBudget) {
        const budgetMatch = BUDGET_MAPPINGS.find(b => b.label === budget);
        const budgetSlug = budgetMatch ? (budgetMatch.slug || budgetMatch.pattern.source.replace(/[\\^$]/g, '')) : budget.toLowerCase().trim().replace(/\s+/g, '-');
        canonicalParts.push(budgetSlug);
      }
    } else {
      // If type is Any but budget is NOT Any, we still need 'all-types' to maintain hierarchy
      if (!isAnyBudget) {
        canonicalParts.push('all-types');
        const budgetMatch = BUDGET_MAPPINGS.find(b => b.label === budget);
        const budgetSlug = budgetMatch ? (budgetMatch.slug || budgetMatch.pattern.source.replace(/[\\^$]/g, '')) : budget.toLowerCase().trim().replace(/\s+/g, '-');
        canonicalParts.push(budgetSlug);
      }
    }
  } else {
    // If area is Any, but type is NOT Any, we still need 'anywhere' to maintain hierarchy
    if (!isAnyType) {
      canonicalParts.push('anywhere');
      const typeMatch = SEO_PROPERTY_TYPES.find(t => t.value === type);
      const typeSlug = typeMatch ? typeMatch.slug : type.toLowerCase().trim().replace(/\s+/g, '-');
      canonicalParts.push(typeSlug);
      
      if (!isAnyBudget) {
        const budgetMatch = BUDGET_MAPPINGS.find(b => b.label === budget);
        const budgetSlug = budgetMatch ? (budgetMatch.slug || budgetMatch.pattern.source.replace(/[\\^$]/g, '')) : budget.toLowerCase().trim().replace(/\s+/g, '-');
        canonicalParts.push(budgetSlug);
      }
    } else if (!isAnyBudget) {
      // If area and type are Any, but budget is NOT Any
      canonicalParts.push('anywhere');
      canonicalParts.push('all-types');
      const budgetMatch = BUDGET_MAPPINGS.find(b => b.label === budget);
      const budgetSlug = budgetMatch ? (budgetMatch.slug || budgetMatch.pattern.source.replace(/[\\^$]/g, '')) : budget.toLowerCase().trim().replace(/\s+/g, '-');
      canonicalParts.push(budgetSlug);
    }
  }

  return {
    title: `${title} | MyListings`,
    description: `Browse verified ${baseType.toLowerCase()} for sale in ${area || city}. Get instant maps, direct contact with owners, and premium internal listings with ${title}.`,
    alternates: {
      canonical: `/${canonicalParts.join('/')}`,
    },
  };
}

export async function SeoExploreView({ slug }: { slug: string[] }) {
  const seoData = parseSeoSlug(slug);

  if (!seoData || !seoData.city) {
    notFound();
  }

  // Pre-fetch the first page of results on the Server for ISR
  const { data: initialProperties, count: initialTotalCount } = await getProperties(
    0, // page 0
    20, // 20 items
    false,
    seoData.city,
    seoData.type || undefined,
    'approved_on', // Default sort
    'desc',
    seoData.area || undefined,
    seoData.budget || undefined
  );

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
        initialProperties={initialProperties}
        initialTotalCount={initialTotalCount}
      />
    </Suspense>
  );
}
