import { Clock, Tag, Ruler, Locate, Trees, LandPlot, Home as HomeIcon, Store, Building2, Warehouse, HelpCircle } from 'lucide-react';

export const SORT_CATEGORIES = [
  { id: 'time', field: 'approved_on', defaultOrder: 'desc' as const, label: 'Time', icon: Clock, canToggle: false },
  { id: 'price', field: 'price_min', defaultOrder: 'asc' as const, label: 'Price', icon: Tag, canToggle: true },
  { id: 'size', field: 'size_min', defaultOrder: 'desc' as const, label: 'Size', icon: Ruler, canToggle: false },
];

export const NEARBY_SORT_CATEGORY = [
  { id: 'distance', field: 'distance', defaultOrder: 'asc' as const, label: 'Near Me', icon: Locate, canToggle: false },
];

export const PROPERTY_TYPES = [
  { label: "Residential Plot", value: "Residential Plot", icon: LandPlot },
  { label: "House", value: "House", icon: HomeIcon },
  { label: "Villa", value: "Villa", icon: HomeIcon },
  { label: "Floor", value: "Floor", icon: Building2 },
  { label: "Flat", value: "Flat", icon: Building2 },
  { label: "Penthouse", value: "Penthouse", icon: Building2 },
  { label: "Shop", value: "Shop", icon: Store },
  { label: "Showroom", value: "Showroom", icon: Store },
  { label: "Office", value: "Office", icon: Building2 },
  { label: "Warehouse", value: "Warehouse", icon: Warehouse },
  { label: "Factory", value: "Factory", icon: Warehouse },
  { label: "Industrial Plot", value: "Industrial Plot", icon: LandPlot },
  { label: "Agriculture Land", value: "Agriculture Land", icon: Trees },
  { label: "Farm House", value: "Farm House", icon: HomeIcon },
  { label: "Hotel", value: "Hotel", icon: Building2 },
  { label: "PG", value: "PG", icon: Building2 },
  { label: "Labour Quarter", value: "Labour Quarter", icon: Building2 },
  { label: "Other", value: "Other", icon: HelpCircle },
];

export const SEARCH_PROPERTY_GROUPS = [
  { label: "Any Type", values: ["Any Type"], icon: HomeIcon },
  { label: "Plot", values: ["Residential Plot"], icon: LandPlot },
  { label: "House / Villa", values: ["House", "Villa"], icon: HomeIcon },
  { label: "Flat / Apt", values: ["Flat", "Penthouse"], icon: Building2 },
  { label: "Floor", values: ["Floor"], icon: Building2 },
  { label: "Shop / Showroom", values: ["Shop", "Showroom"], icon: Store },
  { label: "Office", values: ["Office"], icon: Building2 },
  { label: "Whouse / Factory", values: ["Warehouse", "Factory"], icon: Warehouse },
  { label: "Indus. Plot", values: ["Industrial Plot"], icon: LandPlot },
  { label: "Farm Land", values: ["Agriculture Land"], icon: Trees },
  { label: "Farm House", values: ["Farm House"], icon: HomeIcon },
  { label: "Hotel / PG / Qtr", values: ["Hotel", "PG", "Labour Quarter"], icon: Building2 },
  { label: "Other", values: ["Other"], icon: HelpCircle },
];

