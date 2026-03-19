
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
  { slug: 'plot', value: 'Residential Plot', synonyms: ['plots', 'land'] },
  { slug: 'house', value: 'Residential House', synonyms: ['houses', 'villas', 'villa'] },
  { slug: 'flat', value: 'Flat', synonyms: ['flats', 'apartment', 'apartments'] },
  { slug: 'floor', value: 'Floor', synonyms: ['floors'] },
  { slug: 'shop', value: 'Shop', synonyms: ['shops', 'commercial-shop'] },
  { slug: 'office', value: 'Office', synonyms: ['offices', 'workspace'] },
  { slug: 'factory', value: 'Factory', synonyms: ['industrial', 'godown'] },
  { slug: 'commercial', value: 'Commercial Built-up', synonyms: ['business'] },
  { slug: 'agriculture', value: 'Agriculture Land', synonyms: ['farm', 'farmland'] },
];

export const BUDGET_MAPPINGS = [
  { pattern: /40lakh/, label: 'Under 40 Lakh', slug: 'under-40-lakh' },
  { pattern: /80lakh/, label: '40 to 80 Lakh', slug: '40-to-80-lakh' },
  { pattern: /1cr|1.2cr/, label: '80 Lakh to 1.2 Cr', slug: '80-lakh-to-1.2-cr' },
  { pattern: /1.5cr|1.6cr/, label: '1.2 Cr to 1.6 Cr', slug: '1.2-cr-to-1.6-cr' },
  { pattern: /2cr|2.5cr/, label: '1.6 to 2.5 Cr', slug: '1.6-cr-to-2.5-cr' },
  { pattern: /5cr/, label: '2.5 Cr to 5 Cr', slug: '2.5-cr-to-5-cr' },
  { pattern: /10cr/, label: '5 Cr to 10 Cr', slug: '5-cr-to-10-cr' },
  { pattern: /50cr/, label: '10 Cr to 50 cr', slug: '10-cr-to-50-cr' },
  { pattern: /100cr/, label: '50 Cr to 100 cr', slug: '50-cr-to-100-cr' },
];

export function parseSeoSlug(slug: string | string[]) {
  if (Array.isArray(slug) || (typeof slug === 'string' && slug.includes('/'))) {
    const parts = Array.isArray(slug) ? slug : slug.split('/').filter(Boolean);
    
    // Attempt fixed hierarchical structure: [city, area, type, budget]
    // Allow variable lengths like [city, area, type]
    const [citySlug, areaSlug, typeSlug, budgetSlug] = parts;
    
    let city: string | undefined;
    let type: string | undefined;
    let area: string | undefined;
    let budget: string | undefined;

    // First part MUST be a city or property type to be valid as a SEO path
    const cityMatch = SEO_CITIES.find(c => c.slug === citySlug);
    const typeMatchAtIndex0 = SEO_PROPERTY_TYPES.find(t => t.slug === citySlug || t.synonyms?.includes(citySlug));

    if (cityMatch) {
      city = cityMatch.value;
    } else if (typeMatchAtIndex0) {
      type = typeMatchAtIndex0.value;
    } else {
      return null;
    }

    if (areaSlug && areaSlug !== 'anywhere') {
      area = areaSlug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    if (typeSlug && typeSlug !== 'anything' && typeSlug !== 'all-types' && !type) {
      const typeMatch = SEO_PROPERTY_TYPES.find(t => t.slug === typeSlug || t.synonyms?.includes(typeSlug));
      if (typeMatch) type = typeMatch.value;
      else type = typeSlug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    if (budgetSlug && budgetSlug !== 'any-budget') {
      // Clean budget slug for pattern testing (remove hyphens)
      const cleanBudget = budgetSlug.replace(/-/g, '');
      const budgetMatch = BUDGET_MAPPINGS.find(b => b.pattern.test(cleanBudget));
      if (budgetMatch) budget = budgetMatch.label;
    }

    // Special case: if 3 segments and 2nd was area, 3rd could be type OR budget
    if (parts.length === 3 && areaSlug && !typeSlug && !budgetSlug) {
      // Handled by above logic mostly, but let's be sure
    }

    return { city, type, area, budget };
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
  
  const finalArea = (!area || area.toLowerCase() === 'any' || area.toLowerCase() === 'near me' || area.toLowerCase() === 'anywhere') 
    ? 'anywhere' 
    : area.toLowerCase().trim().replace(/\s+/g, '-');
  
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
