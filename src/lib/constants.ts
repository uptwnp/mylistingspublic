import { Clock, Tag, Ruler, Locate, Trees, Home as HomeIcon, Store, Building2 } from 'lucide-react';

export const SORT_CATEGORIES = [
  { id: 'time', field: 'approved_on', defaultOrder: 'desc' as const, label: 'Time', icon: Clock, canToggle: false },
  { id: 'price', field: 'price_min', defaultOrder: 'asc' as const, label: 'Price', icon: Tag, canToggle: true },
  { id: 'size', field: 'size_min', defaultOrder: 'desc' as const, label: 'Size', icon: Ruler, canToggle: false },
];

export const NEARBY_SORT_CATEGORY = [
  { id: 'distance', field: 'distance', defaultOrder: 'asc' as const, label: 'Near Me', icon: Locate, canToggle: false },
];

export const PROPERTY_TYPES = [
  { label: "Plots", value: "Residential Plot", icon: Trees },
  { label: "Houses", value: "Residential House", icon: HomeIcon },
  { label: "Shop", value: "Shop", icon: Store },
  { label: "Factory", value: "Factory", icon: Building2 },
  { label: "Commercial", value: "Commercial Built-up", icon: Building2 },
  { label: "Industrial", value: "Industrial Land", icon: Trees },
  { label: "Agriculture", value: "Agriculture Land", icon: Trees },
  { label: "Office", value: "Office", icon: Building2 },
];

