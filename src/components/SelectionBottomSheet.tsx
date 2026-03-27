import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Home as HomeIcon, Trees, LandPlot, Store, Building2, Search, MapPin, Locate, Globe, LayoutGrid, Warehouse, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/context/ShortlistContext';
import { getAreas } from '@/lib/supabase';
import { getPropertyConfig } from '@/lib/property-icons';

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: 0 },
  { label: "Under 40 Lakh", value: 40 },
  { label: "40 to 80 Lakh", value: 80 },
  { label: "80 Lakh to 1.2 Cr", value: 120 },
  { label: "1.2 Cr to 1.6 Cr", value: 160 },
  { label: "1.6 to 2.5 Cr", value: 250 },
  { label: "2.5 Cr to 5 Cr", value: 500 },
  { label: "5 Cr to 10 Cr", value: 1000 },
  { label: "10 Cr to 50 cr", value: 5000 },
  { label: "50 Cr to 100 cr", value: 10000 },
  { label: "100 Cr+", value: 10001 },
];

const PROPERTY_TYPES = [
  { label: "Any Type", value: "Any Type", icon: LayoutGrid },
  { label: "Residential Plot", value: "Residential Plot", icon: LandPlot },
  { label: "House", value: "House", icon: HomeIcon },
  { label: "Floor", value: "Floor", icon: Building2 },
  { label: "Flat", value: "Flat", icon: Building2 },
  { label: "Commercial Plot", value: "Commercial Plot", icon: LandPlot },
  { label: "Commercial Built-up", value: "Commercial Built-up", icon: Building2 },
  { label: "Office", value: "Office", icon: Building2 },
  { label: "Industrial Plot", value: "Industrial Plot", icon: LandPlot },
  { label: "Industrial Built-up", value: "Industrial Built-up", icon: Warehouse },
  { label: "Agriculture Land", value: "Agriculture Land", icon: Trees },
  { label: "Farm House", value: "Farm House", icon: HomeIcon },
  { label: "Labour Quarter", value: "Labour Quarter", icon: Building2 },
  { label: "Other", value: "Other", icon: HelpCircle },
];

interface SelectionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'budget' | 'propertyType' | 'area';
  selectedValue: any;
  onSelect: (value: any) => void;
  data?: string[]; 
  selectedCity?: string;
}

export function SelectionBottomSheet({
  isOpen,
  onClose,
  title,
  type,
  selectedValue,
  onSelect,
  data: areaData = [],
  selectedCity,
}: SelectionBottomSheetProps) {
  const { setUserLocation } = useShortlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicAreas, setDynamicAreas] = useState<string[]>(areaData);
  const [isSearching, setIsSearching] = useState(false);

  // Reaction: When query changes, search the DB instead of filtering local-only list
  useEffect(() => {
    if (type !== 'area') return;
    
    let active = true;
    const search = async () => {
      setIsSearching(true);
      try {
        const results = await getAreas(selectedCity || 'All', searchQuery);
        if (active) {
          setDynamicAreas(results);
        }
      } catch (err) {
        console.error('Search areas failed:', err);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(search, searchQuery ? 300 : 0);
    return () => { active = false; clearTimeout(timeoutId); };
  }, [searchQuery, type, selectedCity, areaData]);

  // Sync with prop data if it changes externally
  useEffect(() => {
    if (areaData.length > 0 && !searchQuery) {
      setDynamicAreas(areaData);
    }
  }, [areaData, searchQuery]);

  const showNearby = !searchQuery || 'near me'.includes(searchQuery.toLowerCase());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm sm:hidden"
          />

          {/* Sheet Container */}
          <div className="fixed inset-0 z-[1101] flex items-end justify-center pointer-events-none sm:hidden">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 350, mass: 0.8 }}
                className={cn(
                "relative w-full overflow-hidden bg-white shadow-2xl pointer-events-auto flex flex-col",
                type === 'area' ? "h-full" : "rounded-t-[32px] max-h-[80vh]"
              )}
            >
              {/* Handle */}
              {type !== 'area' && (
                <div className="flex justify-center p-3">
                  <div className="h-1.5 w-12 rounded-full bg-zinc-200" />
                </div>
              )}

              {/* Header */}
              <div className={cn(
                "flex items-center justify-between px-5 pb-3",
                type === 'area' ? "pt-10" : "pt-1"
              )}>
                <h2 className="text-lg font-bold text-zinc-900">
                  {type === 'area' ? `Where in ${selectedCity}?` : title}
                </h2>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 active:scale-[0.98]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-2">
                {type === 'budget' && (
                  <div className="grid grid-cols-1 gap-3">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          onSelect(opt);
                          onClose();
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all text-left",
                          selectedValue.label === opt.label 
                            ? "border-zinc-900 bg-zinc-50" 
                            : "border-zinc-100 active:border-zinc-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            selectedValue.label === opt.label ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                          )}>
                            <Wallet className="h-4 w-4" />
                          </div>
                          <span className={cn("text-sm font-bold", selectedValue.label === opt.label ? "text-zinc-900" : "text-zinc-500")}>
                            {opt.label}
                          </span>
                        </div>
                        <div className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                          selectedValue.label === opt.label ? "border-zinc-900" : "border-zinc-200"
                        )}>
                          {selectedValue.label === opt.label && <div className="h-2 w-2 rounded-full bg-zinc-900" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {type === 'propertyType' && (
                  <div className="grid grid-cols-1 gap-3">
                    {PROPERTY_TYPES.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = selectedValue === cat.value;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => {
                            onSelect(cat.value);
                            onClose();
                          }}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border-2 p-3.5 transition-all text-left",
                            isActive 
                              ? "border-zinc-900 bg-zinc-50" 
                              : "border-zinc-100 active:border-zinc-300"
                          )}
                        >
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            isActive ? "bg-zinc-900 text-white" : getPropertyConfig(cat.value).bgColor
                          )}>
                            <Icon className={cn("h-4 w-4", isActive ? "text-white" : getPropertyConfig(cat.value).color)} />
                          </div>
                          <span className={cn("text-sm font-bold", isActive ? "text-zinc-900" : "text-zinc-500")}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {type === 'area' && (
                  <div className="flex flex-col h-full min-h-0 flex-1">
                    {/* Search Area Input */}
                    <div className="relative px-1 mb-2">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search areas..."
                        value={searchQuery}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        className="w-full h-11 rounded-xl border border-zinc-100 bg-zinc-50 pl-11 pr-11 ty-body font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-inner"
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-zinc-200 transition-colors"
                        >
                          <X className="h-4 w-4 text-zinc-400" />
                        </button>
                      )}
                    </div>

                    <div id="area-list" className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                      {showNearby && (
                        /* Near Me Button logic remains same */
                        <button
                          onClick={() => {
                            if ('geolocation' in navigator) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  setUserLocation({
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                    isFallback: false
                                  });
                                },
                                (error) => {
                                  console.error("Error getting location:", error);
                                }
                              );
                            }
                            onSelect('Near Me');
                            onClose();
                          }}
                          className={cn(
                            "flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left transition-all",
                            selectedValue === 'Near Me' 
                              ? "border-zinc-900 bg-zinc-50" 
                              : "border-zinc-100 active:border-zinc-200"
                          )}
                        >
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            selectedValue === 'Near Me' ? "bg-zinc-200 text-zinc-900" : "bg-zinc-50 text-zinc-400"
                          )}>
                            <Locate className="h-4 w-4" />
                          </div>
                          <span className={cn("text-sm font-bold", selectedValue === 'Near Me' ? "text-zinc-900" : "text-zinc-500")}>
                            Near Me
                          </span>
                        </button>
                      )}

                      {!searchQuery && (
                        <button
                          onClick={() => {
                            onSelect('');
                            onClose();
                          }}
                          className={cn(
                            "flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left transition-all",
                            !selectedValue 
                              ? "border-zinc-300 bg-zinc-50/50 shadow-sm" 
                              : "border-zinc-100 active:border-zinc-200"
                          )}
                        >
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            !selectedValue ? "bg-zinc-200 text-zinc-900" : "bg-zinc-50 text-zinc-400"
                          )}>
                            <Globe className="h-4 w-4" />
                          </div>
                          <span className={cn("text-sm font-bold", !selectedValue ? "text-zinc-900" : "text-zinc-500")}>
                            {`Anywhere in ${selectedCity}`}
                          </span>
                        </button>
                      )}

                      {isSearching ? (
                        <div className="text-center py-12 text-zinc-400">Searching...</div>
                      ) : (
                        <>
                          {dynamicAreas.map((area) => (
                            <button
                              key={area}
                              onClick={() => {
                                onSelect(area);
                                onClose();
                              }}
                              className={cn(
                                "flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left transition-all",
                                selectedValue === area 
                                  ? "border-zinc-900 bg-zinc-50" 
                                  : "border-zinc-100 active:border-zinc-200"
                              )}
                            >
                              <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                selectedValue === area ? "bg-zinc-200 text-zinc-900" : "bg-zinc-50 text-zinc-400"
                              )}>
                                <MapPin className="h-4 w-4" />
                              </div>
                              <span className={cn("text-sm font-bold", selectedValue === area ? "text-zinc-900" : "text-zinc-500")}>
                                {area}
                              </span>
                            </button>
                          ))}

                          {searchQuery && !dynamicAreas.some(a => a.toLowerCase() === searchQuery.toLowerCase()) && (
                            <button
                              onClick={() => {
                                // This is a trick: We pass the search query as the area, 
                                // then components like HomeSearch will see it's not a known area and treat it as a keyword.
                                // Or better, we can have onSelect handle an object if needed, but for now just string.
                                onSelect(searchQuery);
                                onClose();
                              }}
                              className="flex items-center gap-3 w-full rounded-xl border border-blue-100 bg-blue-50/30 px-4 py-3 text-left transition-all active:bg-blue-50"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Search className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-blue-900">Search for "{searchQuery}"</span>
                                <span className="text-[10px] font-medium text-blue-500/70 uppercase tracking-wider">Search in all areas</span>
                              </div>
                            </button>
                          )}

                          {dynamicAreas.length === 0 && !searchQuery.trim() && (
                            <div className="text-center py-12 text-zinc-400">
                              No areas available
                            </div>
                          )}
                          
                          {dynamicAreas.length === 0 && searchQuery.trim() && !searchQuery.toLowerCase().includes('near me') && (
                             <div className="text-center py-6 text-zinc-400 ty-micro px-6">
                               No specific area matches. You can search for the text above.
                             </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
