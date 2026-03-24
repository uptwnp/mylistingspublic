'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/context/ShortlistContext';

export function ContactDetailForm() {
  const { isContactFormOpen, setIsContactFormOpen, contactDetails, setContactDetails } = useShortlist();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternateNumber: '',
    address: '',
    budget: ''
  });

  const BUDGET_CHIPS = [
    "Under 50L",
    "50L - 1Cr",
    "1Cr - 2Cr",
    "2Cr - 5Cr",
    "5Cr+"
  ];

  useEffect(() => {
    if (contactDetails && isContactFormOpen) {
      setFormData({
        fullName: contactDetails.fullName || '',
        phoneNumber: contactDetails.phoneNumber || '',
        alternateNumber: contactDetails.alternateNumber || '',
        address: contactDetails.address || '',
        budget: contactDetails.budget || ''
      });
    }
  }, [contactDetails, isContactFormOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.address) return;
    setContactDetails(formData);
  };

  return (
    <AnimatePresence>
      {isContactFormOpen && (
        <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsContactFormOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full sm:max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[28px] bg-white shadow-2xl pointer-events-auto flex flex-col max-h-[95vh] sm:max-h-[600px]"
          >
            {/* Handle (mobile) */}
            <div className="flex justify-center p-3 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-zinc-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 pt-2 sm:pt-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Contact Details</h2>
                <p className="text-xs font-medium text-zinc-500 mt-1">Please provide your details to proceed</p>
              </div>
              <button
                onClick={() => setIsContactFormOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 active:scale-[0.98] hover:bg-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 pt-0 space-y-5 custom-scrollbar">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-zinc-900" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    autoComplete="name"
                    className="w-full h-12 rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-zinc-900" />
                    <input
                      required
                      type="tel"
                      placeholder="98765 43210"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      autoComplete="tel"
                      className="w-full h-12 rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    Alternate <span className="lowercase font-medium text-zinc-300">(opt)</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 transition-colors group-focus-within:text-zinc-900" />
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={formData.alternateNumber}
                      onChange={(e) => setFormData({ ...formData, alternateNumber: e.target.value })}
                      autoComplete="tel"
                      className="w-full h-12 rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  City / Address
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-zinc-900" />
                  <textarea
                    required
                    placeholder="e.g. Sector 12, Panipat"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    autoComplete="street-address"
                    spellCheck={false}
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-inner resize-none"
                  />
                </div>
              </div>

              {/* Budget Chips */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  Budget Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_CHIPS.map((chip) => {
                    const isActive = formData.budget === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setFormData({ ...formData, budget: chip })}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border-2",
                          isActive 
                            ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" 
                            : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 pb-6 sticky bottom-0 bg-white">
                <button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-bold text-base shadow-xl shadow-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-black group"
                >
                  Confirm & Save Details
                  <Check className="h-5 w-5 transition-transform group-hover:scale-110" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
