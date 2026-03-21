import { MetadataRoute } from 'next'
import { SEO_CITIES } from '@/lib/seo-utils'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mylistings.in'

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/explore',
    '/sell',
    '/refer',
    '/favorites',
    '/shortlist',
    '/privacy',
    '/terms',
    '/agent',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // 2. City Specific Landing Pages
  // Start with predefined SEO cities for guaranteed correct slugs (like 'delhi' for 'Delhi NCR')
  const cityRoutes: MetadataRoute.Sitemap = SEO_CITIES.map((city) => ({
    url: `${baseUrl}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // 3. Auto-add new cities from the database
  if (supabase) {
    try {
      const { data } = await supabase
        .from('website_public_listing')
        .select('city')
      
      if (data) {
        const uniqueCities = Array.from(new Set(data.map((d: { city: string }) => d.city))).filter((c): c is string => !!c)
        const existingValues = new Set(SEO_CITIES.map(c => c.value.toLowerCase()))
        const existingSlugs = new Set(SEO_CITIES.map(c => c.slug))

        uniqueCities.forEach((city: string) => {
          const lowerCity = city.toLowerCase()
          // Check if this city isn't already handled by SEO_CITIES
          if (!existingValues.has(lowerCity)) {
            const slug = lowerCity.trim().replace(/\s+/g, '-')
            if (!existingSlugs.has(slug)) {
              cityRoutes.push({
                url: `${baseUrl}/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'daily' as const,
                priority: 0.85,
              })
              existingSlugs.add(slug)
            }
          }
        })
      }
    } catch (e) {
      console.error('Error fetching dynamic cities for sitemap:', e)
    }
  }

  // Combined sitemap
  return [...staticRoutes, ...cityRoutes]
}
