'use client';

import { useShortlist } from '@/context/ShortlistContext';
import { SORT_CATEGORIES, NEARBY_SORT_CATEGORY } from '@/lib/constants';
import { SlidersHorizontal, MapPin, Wallet, Home as HomeIcon, ArrowUpDown, ChevronDown, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FilterChips({ onToggleMap, hasResults }: { onToggleMap?: () => void, hasResults?: boolean }) {
  const { 
    query, budget, propertyType,
    keywords, minSize, maxSize, selectedHighlights,
    setIsFilterModalOpen,
    setActiveSelectionSheet,
    sortField, sortOrder, setSortField, setSortOrder,
    userLocation
  } = useShortlist();

  const additionalFiltersCount = [
    keywords,
    minSize,
    maxSize,
    selectedHighlights.length > 0 ? 'true' : ''
  ].filter(Boolean).length;

  const allSortCategories = [...SORT_CATEGORIES, ...(query === 'Near Me' || userLocation ? NEARBY_SORT_CATEGORY : [])];
  const activeSort = allSortCategories.find(c => c.field === sortField) || SORT_CATEGORIES[0];

  const chips = [
    { 
      id: 'area', 
      label: query || 'Area', 
      icon: MapPin, 
      onClick: () => setActiveSelectionSheet('area') 
    },
    { 
      id: 'budget', 
      label: budget.label === 'Any Budget' ? 'Budget' : budget.label, 
      icon: Wallet, 
      onClick: () => setActiveSelectionSheet('budget') 
    },
    { 
      id: 'type', 
      label: propertyType === 'Any Type' ? 'Type' : propertyType, 
      icon: HomeIcon, 
      onClick: () => setActiveSelectionSheet('type') 
    },
    { 
      id: 'filters', 
      label: additionalFiltersCount > 0 ? `Filters (${additionalFiltersCount})` : 'More Filters', 
      icon: SlidersHorizontal, 
      onClick: () => setIsFilterModalOpen(true) 
    },
    { 
      id: 'sort', 
      label: activeSort.label, 
      icon: ArrowUpDown, 
      onClick: () => {
        const currentIndex = allSortCategories.findIndex(c => c.field === sortField);
        const nextIndex = (currentIndex + 1) % allSortCategories.length;
        const nextSort = allSortCategories[nextIndex];
        setSortField(nextSort.field);
        setSortOrder(nextSort.defaultOrder);
      }
    }
  ];

  return (
    <div className="w-full bg-white border-b border-zinc-100 sm:hidden">
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar">


        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={chip.onClick}
              className="flex items-center gap-2 rounded-full px-4 py-2 ty-caption transition-all active:scale-[0.98] shrink-0 border bg-white border-zinc-200 text-zinc-600 font-medium"
            >
              <Icon className="h-3.5 w-3.5 text-zinc-400" />
              <span className="whitespace-nowrap">{chip.label}</span>
              {chip.id !== 'filters' && chip.id !== 'sort' && <ChevronDown className="h-3 w-3 text-zinc-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}


