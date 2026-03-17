import { 
  Home, 
  Building2, 
  Map, 
  Store, 
  Briefcase, 
  ShoppingBag, 
  Warehouse,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

interface PropertyTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
}

export const PROPERTY_TYPE_CONFIG: Record<string, PropertyTypeConfig> = {
  'Apartment': {
    icon: Building2,
    label: 'Apartment',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Flat': {
    icon: Building2,
    label: 'Flat',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Villa': {
    icon: Home,
    label: 'Villa',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'House': {
    icon: Home,
    label: 'House',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'Plot': {
    icon: Map,
    label: 'Plot',
    color: 'text-[#4CAF50]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Land': {
    icon: Map,
    label: 'Land',
    color: 'text-[#4CAF50]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Commercial': {
    icon: Store,
    label: 'Commercial',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Shop': {
    icon: ShoppingBag,
    label: 'Shop',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Office': {
    icon: Briefcase,
    label: 'Office',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Showroom': {
    icon: Store,
    label: 'Showroom',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Industrial': {
    icon: Warehouse,
    label: 'Industrial',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Warehouse': {
    icon: Warehouse,
    label: 'Warehouse',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  }
};

export function getPropertyConfig(type: string): PropertyTypeConfig {
  if (!type) {
    return {
      icon: HelpCircle,
      label: 'Property',
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-50'
    };
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
    icon: HelpCircle,
    label: normalizedType,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-50'
  };
}
