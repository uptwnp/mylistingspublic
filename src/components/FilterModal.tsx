'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Ruler, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const AMENITIES = [
  "Approved", "Corner", "East Facing", "West Face", "Park Facing", "Main Road", "On Road", "Parking", "Fresh Built", "Luxury Builtup", "Urgent Sale", "Very High Rental"
];

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: string;
  setKeywords: (k: string) => void;
  minSize: string;
  setMinSize: (s: string) => void;
  maxSize: string;
  setMaxSize: (s: string) => void;
  selectedHighlights: string[];
  setSelectedHighlights: (h: string[]) => void;
  onApply: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  keywords,
  setKeywords,
  minSize,
  setMinSize,
  maxSize,
  setMaxSize,
  selectedHighlights,
  setSelectedHighlights,
  onApply
}: FilterModalProps) {
  const [localKeywords, setLocalKeywords] = useState(keywords);
  const [localMinSize, setLocalMinSize] = useState(minSize);
  const [localMaxSize, setLocalMaxSize] = useState(maxSize);
  const [localHighlights, setLocalHighlights] = useState<string[]>(selectedHighlights);

  useEffect(() => {
    if (isOpen) {
      setLocalKeywords(keywords);
      setLocalMinSize(minSize);
      setLocalMaxSize(maxSize);
      setLocalHighlights(selectedHighlights);
    }
  }, [isOpen, keywords, minSize, maxSize, selectedHighlights]);

  const toggleHighlight = (h: string) => {
    setLocalHighlights(prev => 
      prev.includes(h) ? prev.filter(item => item !== h) : [...prev, h]
    );
  };

  const handleApply = () => {
    setKeywords(localKeywords);
    setMinSize(localMinSize);
    setMaxSize(localMaxSize);
    setSelectedHighlights(localHighlights);
    onApply();
    onClose();
  };

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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: '100%' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl pointer-events-auto flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 p-5 sm:p-6">
                <div>
                  <h2 className="ty-title font-black text-zinc-900">Filters</h2>
                  <p className="ty-label text-zinc-400">Fine-tune your search</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-all hover:bg-zinc-200 active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                {/* Search Keywords */}
                <div>
                  <label className="mb-4 block ty-label text-secondary/50">Keywords</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={localKeywords}
                      onChange={(e) => setLocalKeywords(e.target.value)}
                      placeholder="e.g. Near Market, Corner, 3BHK"
                      className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 py-3 pl-12 pr-4 ty-body font-bold text-zinc-900 outline-none ring-zinc-900 transition-all focus:border-zinc-900 focus:bg-white focus:ring-1"
                    />
                  </div>
                </div>

                {/* Size Range */}
                <div>
                  <label className="mb-4 block ty-label text-secondary/50">Area / Size (Sq. Yards)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="number"
                        value={localMinSize}
                        onChange={(e) => setLocalMinSize(e.target.value)}
                        placeholder="Min Size"
                        className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 py-3 pl-10 pr-4 ty-body font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="number"
                        value={localMaxSize}
                        onChange={(e) => setLocalMaxSize(e.target.value)}
                        placeholder="Max Size"
                        className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 py-3 pl-10 pr-4 ty-body font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Highlights / Amenities */}
                <div>
                  <label className="mb-4 block ty-label text-secondary/50">Property Highlights</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((h) => (
                      <button
                        key={h}
                        onClick={() => toggleHighlight(h)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all text-left group",
                          localHighlights.includes(h)
                            ? "border-brand-primary bg-blue-50 text-brand-primary font-bold shadow-sm shadow-blue-500/10"
                            : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200"
                        )}
                      >
                        <Sparkles className={cn("h-3.5 w-3.5", localHighlights.includes(h) ? "text-brand-primary" : "text-zinc-300")} />
                        <span className="ty-caption">{h}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-100 p-6 bg-zinc-50/50">
                <button
                  onClick={handleApply}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-3.5 ty-label text-white shadow-xl shadow-black/10 transition-all hover:bg-black active:scale-[0.98]"
                >
                  <Search className="h-5 w-5" />
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
