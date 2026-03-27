import { 
  Home, 
  Building2, 
  Map, 
  LandPlot,
  Warehouse,
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { ColoredHouseIcon, ColoredFlatIcon, ColoredPlotIcon, ColoredCommercialIcon } from '@/components/ColoredIcons';

interface PropertyTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
}

export const PROPERTY_TYPE_CONFIG: Record<string, PropertyTypeConfig> = {
  'Residential Plot': {
    icon: ColoredPlotIcon as LucideIcon,
    label: 'Plot',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Plot': {
    icon: ColoredPlotIcon as LucideIcon,
    label: 'Plot',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'House': {
    icon: ColoredHouseIcon as LucideIcon,
    label: 'House',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'Villa': {
    icon: ColoredHouseIcon as LucideIcon,
    label: 'Villa',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'House / Villa': {
    icon: ColoredHouseIcon as LucideIcon,
    label: 'House / Villa',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'Floor': {
    icon: ColoredFlatIcon as LucideIcon,
    label: 'Floor',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Flat': {
    icon: ColoredFlatIcon as LucideIcon,
    label: 'Flat',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Penthouse': {
    icon: ColoredFlatIcon as LucideIcon,
    label: 'Penthouse',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Flat / Apt': {
    icon: ColoredFlatIcon as LucideIcon,
    label: 'Flat / Apt',
    color: 'text-[#7B1FA2]',
    bgColor: 'bg-[#F3E5F5]'
  },
  'Shop': {
    icon: ColoredCommercialIcon as LucideIcon,
    label: 'Shop',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Showroom': {
    icon: ColoredCommercialIcon as LucideIcon,
    label: 'Showroom',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Shop / Showroom': {
    icon: ColoredCommercialIcon as LucideIcon,
    label: 'Shop / Showroom',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Office': {
    icon: ColoredCommercialIcon as LucideIcon,
    label: 'Office',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Warehouse': {
    icon: Warehouse,
    label: 'Warehouse',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Factory': {
    icon: Warehouse,
    label: 'Factory',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Whouse / Factory': {
    icon: Warehouse,
    label: 'Whouse / Factory',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Industrial Plot': {
    icon: LandPlot,
    label: 'Industrial Plot',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Indus. Plot': {
    icon: LandPlot,
    label: 'Indus. Plot',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Agriculture Land': {
    icon: Map,
    label: 'Agriculture',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Farm Land': {
    icon: Map,
    label: 'Farm Land',
    color: 'text-[#2E7D32]',
    bgColor: 'bg-[#E8F5E9]'
  },
  'Farm House': {
    icon: Home,
    label: 'Farm House',
    color: 'text-[#F57C00]',
    bgColor: 'bg-[#FFF3E0]'
  },
  'Hotel': {
    icon: Building2,
    label: 'Hotel',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'PG': {
    icon: Home,
    label: 'PG',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Labour Quarter': {
    icon: Home,
    label: 'Labour Quarter',
    color: 'text-[#424242]',
    bgColor: 'bg-[#F5F5F5]'
  },
  'Hotel / PG / Qtr': {
    icon: Building2,
    label: 'Hotel / PG / Qtr',
    color: 'text-[#1976D2]',
    bgColor: 'bg-[#E3F2FD]'
  },
  'Other': {
    icon: HelpCircle,
    label: 'Other',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-50'
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
