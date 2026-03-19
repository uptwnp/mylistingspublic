import { Clock, Tag, Ruler, Locate } from 'lucide-react';

export const SORT_CATEGORIES = [
  { id: 'time', field: 'approved_on', defaultOrder: 'desc' as const, label: 'Time', icon: Clock, canToggle: false },
  { id: 'price', field: 'price_min', defaultOrder: 'asc' as const, label: 'Price', icon: Tag, canToggle: true },
  { id: 'size', field: 'size_min', defaultOrder: 'desc' as const, label: 'Size', icon: Ruler, canToggle: false },
];

export const NEARBY_SORT_CATEGORY = [
  { id: 'distance', field: 'distance', defaultOrder: 'asc' as const, label: 'Near Me', icon: Locate, canToggle: false },
];
