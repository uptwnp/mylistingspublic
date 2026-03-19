
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
  { pattern: /40lakh/, label: 'Under 40 Lakh' },
  { pattern: /80lakh/, label: '40 to 80 Lakh' },
  { pattern: /1cr/, label: '80 Lakh to 1.2 Cr' },
  { pattern: /1.5cr/, label: '1.2 Cr to 1.6 Cr' },
  { pattern: /2cr/, label: '1.6 to 2.5 Cr' },
  { pattern: /5cr/, label: '2.5 Cr to 5 Cr' },
  { pattern: /10cr/, label: '5 Cr to 10 Cr' },
  { pattern: /50cr/, label: '10 Cr to 50 cr' },
  { pattern: /100cr/, label: '50 Cr to 100 cr' },
];

export function parseSeoSlug(slug: string) {
  // Trim dots and split by hyphens
  const parts = slug.replace(/\.+$/, '').toLowerCase().split('-');
  
  let city: string | undefined;
  let type: string | undefined;
  let area: string | undefined;
  let budget: string | undefined;

  const usedIndices = new Set<number>();

  // 1. Detect Budget (Regex based)
  parts.forEach((part, index) => {
    for (const b of BUDGET_MAPPINGS) {
      if (b.pattern.test(part)) {
        budget = b.label;
        usedIndices.add(index);
        break;
      }
    }
  });

  // 2. Detect City
  parts.forEach((part, index) => {
    if (usedIndices.has(index)) return;
    const match = SEO_CITIES.find(c => c.slug === part);
    if (match) {
      city = match.value;
      usedIndices.add(index);
    }
  });

  // 3. Detect Type (with synonyms)
  parts.forEach((part, index) => {
    if (usedIndices.has(index)) return;
    const match = SEO_PROPERTY_TYPES.find(t => t.slug === part || t.synonyms.includes(part));
    if (match) {
      type = match.value;
      usedIndices.add(index);
    }
  });

  // 4. Detect Area (Remaining parts that look like "sectorX" or "huda" etc)
  const remainingParts = parts.filter((_, i) => !usedIndices.has(i) && !['in', 'for', 'sale'].includes(_));
  
  if (remainingParts.length > 0) {
    // Check if any remaining part looks like 'sector18' or 'sector-18'
    const sectorMatch = remainingParts.find(p => /^sector\d+$/.test(p));
    if (sectorMatch) {
      area = sectorMatch.charAt(0).toUpperCase() + sectorMatch.slice(1).replace(/(\d+)/, ' $1'); // "sector18" -> "Sector 18"
    } else {
      // Just join remaining parts as area
      area = remainingParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
  }

  // At least city or type must be found to be a valid SEO route
  if (!city && !type) return null;

  return { city, type, area, budget };
}

export function getSeoUrl(city?: string, type?: string, area?: string, budgetLabel?: string) {
  const parts: string[] = [];

  if (type) {
    const match = SEO_PROPERTY_TYPES.find(t => t.value === type);
    if (match) parts.push(match.slug);
  }

  if (city) {
    const match = SEO_CITIES.find(c => c.value === city);
    if (match) parts.push(match.slug);
  }

  if (area && area.toLowerCase() !== 'any' && area.toLowerCase() !== 'near me') {
    parts.push(area.toLowerCase().replace(/\s+/g, ''));
  }

  if (budgetLabel) {
    const match = BUDGET_MAPPINGS.find(b => b.label === budgetLabel);
    if (match) {
      // Find the slug from pattern (extract literal part)
      const slug = match.pattern.source.replace(/[\\^$]/g, '');
      parts.push(slug);
    }
  }

  if (parts.length < 2) return null;
  return `/${parts.join('-')}`;
}
