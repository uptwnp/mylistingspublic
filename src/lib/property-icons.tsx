const R2_ICONS_BASE = 'https://pub-9e00030e294c40efa96642db5ba7f437.r2.dev/assets/icons';

interface PropertyTypeConfig {
  iconUrl: string;
  label: string;
  color: string;
  bgColor: string;
}

export const PROPERTY_TYPE_CONFIG: Record<string, PropertyTypeConfig> = {
  'Residential Plot': {
    iconUrl: `${R2_ICONS_BASE}/plot.svg`,
    label: 'Plot',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Plot': {
    iconUrl: `${R2_ICONS_BASE}/plot.svg`,
    label: 'Plot',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'House': {
    iconUrl: `${R2_ICONS_BASE}/house.svg`,
    label: 'House',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'Villa': {
    iconUrl: `${R2_ICONS_BASE}/house.svg`,
    label: 'Villa',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'House / Villa': {
    iconUrl: `${R2_ICONS_BASE}/house.svg`,
    label: 'House / Villa',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'Floor': {
    iconUrl: `${R2_ICONS_BASE}/flat.svg`,
    label: 'Floor',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Flat': {
    iconUrl: `${R2_ICONS_BASE}/flat.svg`,
    label: 'Flat',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Penthouse': {
    iconUrl: `${R2_ICONS_BASE}/flat.svg`,
    label: 'Penthouse',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Flat / Apt': {
    iconUrl: `${R2_ICONS_BASE}/flat.svg`,
    label: 'Flat / Apt',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Shop': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'Shop',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Showroom': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'Showroom',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Shop / Showroom': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'Shop / Showroom',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Office': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'Office',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Commercial Built-up': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'Commercial Built-up',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Hotel': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'Hotel',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'PG': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'PG',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Hotel / PG / Qtr': {
    iconUrl: `${R2_ICONS_BASE}/commercial.svg`,
    label: 'Hotel / PG / Qtr',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Warehouse': {
    iconUrl: `${R2_ICONS_BASE}/industrial.svg`,
    label: 'Warehouse',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Factory': {
    iconUrl: `${R2_ICONS_BASE}/industrial.svg`,
    label: 'Factory',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Whouse / Factory': {
    iconUrl: `${R2_ICONS_BASE}/industrial.svg`,
    label: 'Whouse / Factory',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Industrial Built-up': {
    iconUrl: `${R2_ICONS_BASE}/industrial.svg`,
    label: 'Industrial Built-up',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Industrial Plot': {
    iconUrl: `${R2_ICONS_BASE}/plot.svg`,
    label: 'Industrial Plot',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Indus. Plot': {
    iconUrl: `${R2_ICONS_BASE}/plot.svg`,
    label: 'Indus. Plot',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Agriculture Land': {
    iconUrl: `${R2_ICONS_BASE}/agriculture.svg`,
    label: 'Agriculture',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Farm Land': {
    iconUrl: `${R2_ICONS_BASE}/agriculture.svg`,
    label: 'Farm Land',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Farm House': {
    iconUrl: `${R2_ICONS_BASE}/house.svg`,
    label: 'Farm House',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'Labour Quarter': {
    iconUrl: `${R2_ICONS_BASE}/flat.svg`,
    label: 'Labour Quarter',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Other': {
    iconUrl: `${R2_ICONS_BASE}/other.svg`,
    label: 'Other',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-50'
  }
};


export function getPropertyConfig(type: string): PropertyTypeConfig {
  const defaultFallback: PropertyTypeConfig = {
    iconUrl: `${R2_ICONS_BASE}/other.svg`,
    label: 'Property',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-50'
  };

  if (!type) {
    return defaultFallback;
  }

  const normalizedType = type.trim();
  
  // Try exact match
  if (PROPERTY_TYPE_CONFIG[normalizedType]) {
    return PROPERTY_TYPE_CONFIG[normalizedType];
  }
  
  // Try case-insensitive match
  const found = Object.keys(PROPERTY_TYPE_CONFIG).find(
    key => key.toLowerCase() === normalizedType.toLowerCase()
  );
  
  if (found) {
    return PROPERTY_TYPE_CONFIG[found];
  }

  // Partial match
  const partialFound = Object.keys(PROPERTY_TYPE_CONFIG).find(
    key => normalizedType.toLowerCase().includes(key.toLowerCase())
  );

  if (partialFound) {
    return PROPERTY_TYPE_CONFIG[partialFound];
  }

  // Default fallback
  return {
    ...defaultFallback,
    label: normalizedType
  };
}
