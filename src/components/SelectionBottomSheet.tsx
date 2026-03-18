'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Home as HomeIcon, Trees, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: 0 },
  { label: "Under 50 Lakh", value: 50 },
  { label: "Under 1 Cr", value: 100 },
  { label: "Under 5 Cr", value: 500 },
  { label: "Under 10 Cr", value: 1000 },
  { label: "Above 10 Cr", value: 1001 },
];

const PROPERTY_TYPES = [
  { label: "Plots", value: "Residential Plot", icon: Trees },
  { label: "Houses", value: "Resi. House", icon: HomeIcon },
  { label: "Shops", value: "Shop", icon: Store },
  { label: "Villa", value: "Villa", icon: HomeIcon },
  { label: "Office", value: "Office", icon: Building2 },
  { label: "Apartment", value: "Apartment", icon: Building2 },
];
import { Building2 } from 'lucide-react';

interface SelectionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'budget' | 'propertyType';
  selectedValue: any;
  onSelect: (value: any) => void;
}

export function SelectionBottomSheet({
  isOpen,
  onClose,
  title,
  type,
  selectedValue,
  onSelect
}: SelectionBottomSheetProps) {
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full overflow-hidden rounded-t-[32px] bg-white shadow-2xl pointer-events-auto flex flex-col max-h-[80vh]"
            >
              {/* Handle */}
              <div className="flex justify-center p-3">
                <div className="h-1.5 w-12 rounded-full bg-zinc-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 pt-1">
                <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 pb-12">
                {type === 'budget' ? (
                  <div className="grid grid-cols-1 gap-3">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          onSelect(opt);
                          onClose();
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border-2 px-5 py-4 transition-all text-left",
                          selectedValue.label === opt.label 
                            ? "border-zinc-900 bg-zinc-50" 
                            : "border-zinc-100 active:border-zinc-300"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                            selectedValue.label === opt.label ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                          )}>
                            <Wallet className="h-5 w-5" />
                          </div>
                          <span className={cn("text-base font-bold", selectedValue.label === opt.label ? "text-zinc-900" : "text-zinc-500")}>
                            {opt.label}
                          </span>
                        </div>
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          selectedValue.label === opt.label ? "border-zinc-900" : "border-zinc-200"
                        )}>
                          {selectedValue.label === opt.label && <div className="h-2.5 w-2.5 rounded-full bg-zinc-900" />}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
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
                            "flex flex-col items-start gap-4 rounded-2xl border-2 p-5 transition-all text-left",
                            isActive 
                              ? "border-zinc-900 bg-zinc-50" 
                              : "border-zinc-100 active:border-zinc-300"
                          )}
                        >
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl mb-1 transition-colors",
                            isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={cn("text-xs font-bold uppercase tracking-widest", isActive ? "text-zinc-900" : "text-zinc-500")}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
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
