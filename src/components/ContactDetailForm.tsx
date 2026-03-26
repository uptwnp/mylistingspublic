'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Check, ArrowRight, ArrowLeft, Building2, Wallet } from 'lucide-react';
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

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Focus the first focusable input in the step after animation completes
  const focusActiveInput = () => {
    // Only auto-focus on non-touch (desktop) — on mobile the keyboard popping up causes layout shift
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-autofocus]');
      el?.focus();
    }
  };

  const TOTAL_STEPS = 5;

  const BUDGET_CHIPS = [
    "Under 50L",
    "50L - 1Cr",
    "1Cr - 2Cr",
    "2Cr - 5Cr",
    "5Cr+"
  ];

  useEffect(() => {
    if (isContactFormOpen) {
      // If user holds confirmed details, load those
      if (contactDetails && Object.values(contactDetails).some(v => v)) {
        setFormData({
          fullName: contactDetails.fullName || '',
          phoneNumber: contactDetails.phoneNumber || '',
          alternateNumber: contactDetails.alternateNumber || '',
          address: contactDetails.address || '',
          budget: contactDetails.budget || ''
        });
        setCurrentStep(0);
        setDirection(1);
      } else {
        // Otherwise, restore from draft if available
        try {
          const draft = localStorage.getItem('contactFormDraft');
          if (draft) {
             const parsed = JSON.parse(draft);
             if (parsed.formData) {
               setFormData(prev => ({ ...prev, ...parsed.formData }));
             }
             if (parsed.currentStep !== undefined) {
               setCurrentStep(parsed.currentStep);
             }
             setDirection(1);
          }
        } catch (e) {
          console.error("Failed to restore draft", e);
        }
      }
    }
  }, [contactDetails, isContactFormOpen]);

  // Persist draft on every change if the form is not yet submitted permanently
  useEffect(() => {
    if (isContactFormOpen && (!contactDetails || !Object.values(contactDetails).some(v => v))) {
      try {
        localStorage.setItem('contactFormDraft', JSON.stringify({ formData, currentStep }));
      } catch (e) {
        console.error("Failed to save draft", e);
      }
    }
  }, [formData, currentStep, isContactFormOpen, contactDetails]);

  // Auto-focus is now triggered via onAnimationComplete inside the motion.div (see JSX below)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.address || !formData.budget) return;
    setContactDetails(formData);
    
    // Clear draft on successful completion
    try {
      localStorage.removeItem('contactFormDraft');
    } catch (e) {}
    
    setIsContactFormOpen(false);
  };

  const isCurrentStepValid = () => {
    if (currentStep === 0) return formData.fullName.trim().length > 0;
    if (currentStep === 1) return formData.phoneNumber.trim().length > 0;
    if (currentStep === 2) return formData.address.trim().length > 0;
    if (currentStep === 3) return formData.budget.trim().length > 0;
    return true;
  };

  const nextStep = () => {
    if (!isCurrentStepValid()) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentStep === TOTAL_STEPS - 1) {
         handleSubmit();
      } else {
         nextStep();
      }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? -30 : 30,
      opacity: 0,
      scale: 0.98,
    }),
  };

  const progressPercentage = ((currentStep + 1) / TOTAL_STEPS) * 100;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full sm:max-w-3xl h-[100dvh] sm:h-[650px] overflow-hidden sm:rounded-[40px] bg-white shadow-2xl pointer-events-auto flex flex-col"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-100 z-10">
              <motion.div 
                className="h-full bg-zinc-900" 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </div>

            {/* Handle (mobile) */}
            <div className="flex justify-center p-3 sm:hidden mt-1 z-20">
              <div className="h-1.5 w-12 rounded-full bg-zinc-200" />
            </div>

            {/* Header / Close */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
               <button
                onClick={() => setIsContactFormOpen(false)}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-100/50 text-zinc-500 active:scale-[0.98] hover:bg-zinc-200 hover:text-zinc-900 transition-colors backdrop-blur-sm"
                title="Close (Esc)"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Main Interactive Area */}
            <div className="flex-1 relative flex flex-col justify-center px-6 sm:px-16 pt-12 pb-24 overflow-y-auto no-scrollbar">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  onAnimationComplete={(def) => { if (def === 'center') focusActiveInput(); }}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="w-full max-w-xl mx-auto"
                >
                  
                  {/* STEP 0: NAME */}
                  {currentStep === 0 && (
                     <div className="space-y-6 sm:space-y-10">
                        <div className="space-y-3">
                           <p className="text-zinc-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                              1 &rarr; Contact Info
                           </p>
                           <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 leading-[1.1]">
                              What's your full name?
                           </h2>
                        </div>
                        <div className="space-y-4 relative">
                           <input
                              data-autofocus
                              required
                              type="text"
                              placeholder="e.g. Rahul Sharma"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              onKeyDown={handleKeyDown}
                              autoComplete="name"
                              className="w-full text-2xl sm:text-4xl font-bold text-zinc-900 border-b-2 border-zinc-200 pb-4 outline-none placeholder:text-zinc-300 focus:border-zinc-900 bg-transparent transition-all"
                           />
                        </div>
                     </div>
                  )}

                  {/* STEP 1: PHONE */}
                  {currentStep === 1 && (
                     <div className="space-y-6 sm:space-y-10">
                        <div className="space-y-3">
                           <p className="text-zinc-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                              2 &rarr; Contact Details
                           </p>
                           <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 leading-[1.1]">
                              What's the best number to reach you at?
                           </h2>
                        </div>
                        <div className="space-y-8">
                           <div>
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Primary Number</label>
                              <input
                                 data-autofocus
                                 required
                                 type="tel"
                                 placeholder="98765 43210"
                                 value={formData.phoneNumber}
                                 onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                 onKeyDown={handleKeyDown}
                                 autoComplete="tel"
                                 className="w-full text-2xl sm:text-4xl font-bold text-zinc-900 border-b-2 border-zinc-200 pb-4 outline-none placeholder:text-zinc-300 focus:border-zinc-900 bg-transparent transition-all"
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Alternate Number (Optional)</label>
                              <input
                                 type="tel"
                                 placeholder="Optional"
                                 value={formData.alternateNumber}
                                 onChange={(e) => setFormData({ ...formData, alternateNumber: e.target.value })}
                                 onKeyDown={handleKeyDown}
                                 autoComplete="tel"
                                 className="w-full text-xl sm:text-2xl font-bold text-zinc-700 border-b-2 border-zinc-100 pb-3 outline-none placeholder:text-zinc-300 focus:border-zinc-400 bg-transparent transition-all"
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  {/* STEP 2: ADDRESS */}
                  {currentStep === 2 && (
                     <div className="space-y-6 sm:space-y-10">
                        <div className="space-y-3">
                           <p className="text-zinc-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                              3 &rarr; Location
                           </p>
                           <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 leading-[1.1]">
                              Where are you located?
                           </h2>
                        </div>
                        <div className="space-y-4">
                           <textarea
                              data-autofocus
                              required
                              placeholder="e.g. Sector 12, Panipat"
                              rows={2}
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              onKeyDown={handleKeyDown}
                              autoComplete="street-address"
                              spellCheck={false}
                              className="w-full text-2xl sm:text-4xl font-bold text-zinc-900 border-b-2 border-zinc-200 pb-4 outline-none placeholder:text-zinc-300 focus:border-zinc-900 bg-transparent transition-all resize-none"
                           />
                        </div>
                     </div>
                  )}

                  {/* STEP 3: BUDGET */}
                  {currentStep === 3 && (
                     <div className="space-y-6 sm:space-y-10">
                        <div className="space-y-3">
                           <p className="text-zinc-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                              4 &rarr; Preferences
                           </p>
                           <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 leading-[1.1]">
                              What's your budget range?
                           </h2>
                        </div>
                        <div className="flex flex-col gap-3 sm:gap-4">
                           {BUDGET_CHIPS.map((chip, i) => {
                             const isActive = formData.budget === chip;
                             return (
                               <button
                                 key={chip}
                                 type="button"
                                 onClick={() => {
                                    setFormData({ ...formData, budget: chip });
                                    setTimeout(() => {
                                       if (currentStep === 3) nextStep();
                                    }, 200);
                                 }}
                                 className={cn(
                                   "w-full px-6 py-4 sm:py-5 rounded-2xl text-left text-lg sm:text-xl font-bold transition-all border-2 flex items-center justify-between group",
                                   isActive 
                                     ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" 
                                     : "bg-zinc-50 border-zinc-100/50 text-zinc-600 hover:border-zinc-200 hover:bg-zinc-100"
                                 )}
                               >
                                 <div className="flex items-center gap-4">
                                    <div className={cn(
                                       "flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm transition-all",
                                       isActive ? "bg-white/20 text-white" : "bg-white border border-zinc-200 text-zinc-400 group-hover:text-zinc-600"
                                    )}>
                                       {String.fromCharCode(65 + i)}
                                    </div>
                                    {chip}
                                 </div>
                                 {isActive && <Check className="h-6 w-6" />}
                               </button>
                             );
                           })}
                        </div>
                     </div>
                  )}

                  {/* STEP 4: REVIEW */}
                  {currentStep === 4 && (
                     <div className="space-y-6 sm:space-y-10">
                        <div className="space-y-3">
                           <p className="text-zinc-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                              5 &rarr; Complete
                           </p>
                           <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 leading-[1.1]">
                              Review your details
                           </h2>
                        </div>
                        <div className="bg-zinc-50 p-6 sm:p-8 rounded-[32px] space-y-6 sm:space-y-8 border border-zinc-100">
                           <div className="flex items-center gap-5">
                              <div className="bg-white p-4 justify-center items-center flex rounded-2xl shadow-sm shrink-0 h-14 w-14"><User className="h-6 w-6 text-zinc-400" /></div>
                              <div>
                                 <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">Name</p>
                                 <p className="text-xl sm:text-2xl font-bold text-zinc-900 mt-0.5">{formData.fullName}</p>
                              </div>
                           </div>
                           <div className="h-px bg-zinc-200/50 w-full" />
                           <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                              <div className="flex items-center gap-5 flex-1">
                                 <div className="bg-white p-4 justify-center items-center flex rounded-2xl shadow-sm shrink-0 h-14 w-14"><Phone className="h-6 w-6 text-zinc-400" /></div>
                                 <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">Phone</p>
                                    <p className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">{formData.phoneNumber}</p>
                                    {formData.alternateNumber && (
                                       <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-0.5">Alt: {formData.alternateNumber}</p>
                                    )}
                                 </div>
                              </div>
                              <div className="h-px sm:h-auto sm:w-px bg-zinc-200/50 block" />
                              <div className="flex items-center gap-5 flex-1">
                                 <div className="bg-white p-4 justify-center items-center flex rounded-2xl shadow-sm shrink-0 h-14 w-14"><Wallet className="h-6 w-6 text-zinc-400" /></div>
                                 <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">Budget</p>
                                    <p className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">{formData.budget}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="h-px bg-zinc-200/50 w-full" />
                           <div className="flex items-center gap-5">
                              <div className="bg-white p-4 justify-center items-center flex rounded-2xl shadow-sm shrink-0 h-14 w-14"><MapPin className="h-6 w-6 text-zinc-400" /></div>
                              <div>
                                 <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">Location</p>
                                 <p className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">{formData.address}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-zinc-100 flex items-center justify-between z-20">
               <div className="flex items-center gap-3">
                  <button
                     onClick={prevStep}
                     disabled={currentStep === 0}
                     className={cn(
                        "flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 transition-all",
                        currentStep === 0 
                           ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed" 
                           : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 active:scale-[0.98]"
                     )}
                     title="Go Back"
                  >
                     <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
               </div>

               <div className="flex items-center gap-3">
                  {currentStep < TOTAL_STEPS - 1 && (
                     <div className="hidden sm:flex items-center gap-2 mr-4 opacity-50 text-xs sm:text-sm font-bold">
                        <span>Press</span>
                        <div className="bg-zinc-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-zinc-600 border-b-2 border-zinc-200 uppercase tracking-widest">Enter</div>
                     </div>
                  )}
                  {currentStep < TOTAL_STEPS - 1 ? (
                     <button
                        onClick={nextStep}
                        disabled={!isCurrentStepValid()}
                        className={cn(
                           "flex items-center justify-between gap-3 px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-bold text-base sm:text-lg transition-all min-w-[120px] sm:min-w-[140px]",
                           isCurrentStepValid()
                              ? "bg-zinc-900 text-white shadow-lg active:scale-[0.98] hover:bg-black"
                              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        )}
                     >
                        Next <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                     </button>
                  ) : (
                     <button
                        onClick={() => handleSubmit()}
                        className={cn(
                           "flex items-center gap-2 px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-bold text-base sm:text-lg transition-all bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] hover:bg-blue-600"
                        )}
                     >
                        Confirm Details <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
                     </button>
                  )}
               </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
