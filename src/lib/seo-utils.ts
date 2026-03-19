
export const SEO_CITIES = [
  { slug: 'panipat', value: 'Panipat' },
  { slug: 'karnal', value: 'Karnal' },
  { slug: 'sonipat', value: 'Sonipat' },
  { slug: 'rohtak', value: 'Rohtak' },
  { slug: 'delhi', value: 'Delhi NCR' },
  { slug: 'gurgaon', value: 'Gurgaon' },
  { slug: 'noida', value: 'Noida' },
];

export const SEO_PROPERTY_TYPES = [
  { slug: 'plot', value: 'Residential Plot', synonyms: ['plots', 'land', 'residential-plot'] },
  { slug: 'house', value: 'Residential House', synonyms: ['houses', 'villas', 'villa', 'residential-house'] },
  { slug: 'flat', value: 'Flat', synonyms: ['flats', 'apartment', 'apartments'] },
  { slug: 'floor', value: 'Floor', synonyms: ['floors'] },
  { slug: 'shop', value: 'Shop', synonyms: ['shops', 'commercial-shop'] },
  { slug: 'office', value: 'Office', synonyms: ['offices', 'workspace'] },
  { slug: 'factory', value: 'Factory', synonyms: ['industrial', 'godown', 'factories'] },
  { slug: 'commercial', value: 'Commercial Built-up', synonyms: ['business', 'commercial-built-up', 'big-commercial'] },
  { slug: 'agriculture', value: 'Agriculture Land', synonyms: ['farm', 'farmland', 'agriculture-land'] },
];

export const BUDGET_MAPPINGS = [
  { pattern: /^under40lakh$/, label: 'Under 40 Lakh', slug: 'under-40-lakh' },
  { pattern: /^40to80lakh$/, label: '40 to 80 Lakh', slug: '40-to-80-lakh' },
  { pattern: /^80lakhto1.2cr$/, label: '80 Lakh to 1.2 Cr', slug: '80-lakh-to-1.2-cr' },
  { pattern: /^1.2crto1.6cr$/, label: '1.2 Cr to 1.6 Cr', slug: '1.2-cr-to-1.6-cr' },
  { pattern: /^1.6to2.5cr$/, label: '1.6 to 2.5 Cr', slug: '1.6-cr-to-2.5-cr' },
  { pattern: /^2.5crto5cr$/, label: '2.5 Cr to 5 Cr', slug: '2.5-cr-to-5-cr' },
  { pattern: /^5crto10cr$/, label: '5 Cr to 10 Cr', slug: '5-cr-to-10-cr' },
  { pattern: /^10crto50cr$/, label: '10 Cr to 50 cr', slug: '10-cr-to-50-cr' },
  { pattern: /^50crto100cr$/, label: '50 Cr to 100 cr', slug: '50-cr-to-100-cr' },
  { pattern: /^100crplus$/, label: '100 Cr+', slug: '100-cr-plus' },
];

export function parseSeoSlug(slug: string | string[]) {
    const partsArr = Array.isArray(slug) ? slug : slug.split('/').filter(Boolean);
    
    // CASE A: Hierarchical path (city/area/type/budget) - only if first segment matches a city
    if (partsArr.length > 1 || (typeof slug === 'string' && slug.includes('/'))) {
      const lowerParts = partsArr.map(p => p.toLowerCase());
      
      let city: string | undefined;
      let type: string | undefined;
      let area: string | undefined;
      let budget: string | undefined;

      // 1. Identify City (Must be the first segment)
      const cityMatch = SEO_CITIES.find(c => c.slug === lowerParts[0]);
      if (cityMatch) {
        city = cityMatch.value;
        const restOfParts = lowerParts.slice(1);
        
        restOfParts.forEach((part, index) => {
          // Check for Budget pattern
          const budgetMatch = BUDGET_MAPPINGS.find(b => b.slug === part || b.pattern.test(part.replace(/-/g, '')));
          if (budgetMatch && !budget) {
            budget = budgetMatch.label;
            return;
          }

          // Check for Property Type
          const typeMatch = SEO_PROPERTY_TYPES.find(t => t.slug === part || t.synonyms?.includes(part));
          if (typeMatch && !type && part !== 'anywhere' && part !== 'near-me') {
            type = typeMatch.value;
            return;
          }

          // If it's the first remaining part and not matched by type/budget/skip-words, it's the Area
          if (index === 0 && !area && part !== 'anywhere' && part !== 'all-types' && part !== 'any-budget') {
            if (part === 'near-me') {
              area = 'Near Me';
            } else {
              area = part.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
            }
            return;
          }

          // Fallback for unidentified segments if we still need area/type
          if (part !== 'anywhere' && part !== 'near-me' && part !== 'all-types' && part !== 'any-budget') {
            if (!type && index === 1) { // Likely type position
              type = part.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
            }
          }
        });

        return { city, type, area, budget };
      }
    }

  // Fallback to legacy hyphenated structure for singular slugs
  const slugStr = typeof slug === 'string' ? slug : slug[0];
  if (!slugStr) return null;
  const parts = slugStr.replace(/\.+$/, '').toLowerCase().split('-');
  
  let city: string | undefined;
  let type: string | undefined;
  let area: string | undefined;
  let budget: string | undefined;

  const usedIndices = new Set<number>();

  parts.forEach((part, index) => {
    for (const b of BUDGET_MAPPINGS) {
      if (b.pattern.test(part.replace(/-/g, ''))) {
        budget = b.label;
        usedIndices.add(index);
        break;
      }
    }
  });

  parts.forEach((part, index) => {
    if (usedIndices.has(index)) return;
    const match = SEO_CITIES.find(c => c.slug === part);
    if (match) {
      city = match.value;
      usedIndices.add(index);
    }
  });

  parts.forEach((part, index) => {
    if (usedIndices.has(index)) return;
    const match = SEO_PROPERTY_TYPES.find(t => t.slug === part || t.synonyms?.includes(part));
    if (match) {
      type = match.value;
      usedIndices.add(index);
    }
  });

  const remainingParts = parts.filter((_, i) => !usedIndices.has(i) && !['in', 'for', 'sale'].includes(_));
  
  if (remainingParts.length > 0) {
    const sectorMatch = remainingParts.find(p => /^sector\d+$/.test(p));
    if (sectorMatch) {
      area = sectorMatch.charAt(0).toUpperCase() + sectorMatch.slice(1).replace(/(\d+)/, ' $1');
    } else {
      area = remainingParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
  }

  if (!city && !type) return null;
  return { city, type, area, budget };
}

export function getSeoUrl(city?: string, type?: string, area?: string, budgetLabel?: string) {
  if (!city) return null;

  const cityMatch = SEO_CITIES.find(c => c.value === city);
  const citySlug = cityMatch ? cityMatch.slug : city.toLowerCase().replace(/\s+/g, '-');
  
  const finalArea = (!area || area.toLowerCase() === 'any' || area.toLowerCase() === 'anywhere') 
    ? 'anywhere' 
    : (area.toLowerCase() === 'near me' ? 'near-me' : area.toLowerCase().trim().replace(/\s+/g, '-'));
  
  const typeMatch = type ? SEO_PROPERTY_TYPES.find(t => t.value === type) : null;
  const finalType = typeMatch 
    ? typeMatch.slug 
    : (type && type !== 'Any Type' && type !== 'anything' && type !== 'all-types' ? type.toLowerCase().trim().replace(/\s+/g, '-') : 'all-types');
  
  const budgetMatch = budgetLabel ? BUDGET_MAPPINGS.find(b => b.label === budgetLabel) : null;
  const finalBudget = budgetMatch 
    ? (budgetMatch.slug || budgetMatch.pattern.source.replace(/[\\^$]/g, '')) 
    : (budgetLabel && budgetLabel !== 'Any Budget' && budgetLabel !== 'any-budget' ? budgetLabel.toLowerCase().trim().replace(/\s+/g, '-') : 'any-budget');

  return `/${citySlug}/${finalArea}/${finalType}/${finalBudget}`;
}
