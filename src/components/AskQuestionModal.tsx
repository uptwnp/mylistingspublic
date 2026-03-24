'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircleQuestion, Check, ArrowRight, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShortlist } from '@/context/ShortlistContext';
import { Property } from '@/types';
import { useRouter } from 'next/navigation';

interface AskQuestionModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const PREDEFINED_QUESTIONS = [
  { id: 'available', label: 'Is it available?', emoji: '🏠' },
  { id: 'info', label: 'All info correct?', emoji: '✅' },
  { id: 'visit', label: 'Schedule site visit', emoji: '📅' },
  { id: 'other', label: 'Other question…', emoji: '💬' },
];

export function AskQuestionModal({ property, isOpen, onClose }: AskQuestionModalProps) {
  const router = useRouter();
  const { addToShortlist, isInShortlist, updateInquiry } = useShortlist();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Must be mounted on client before we can portal to document.body
  useEffect(() => { setMounted(true); }, []);

  const inCart = isInShortlist(property.property_id);

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setSelectedQuestion(null);
      setCustomText('');
      setSubmitted(false);
    }, 300);
  };

  const buildNoteText = (): string => {
    if (!selectedQuestion) return '';
    const found = PREDEFINED_QUESTIONS.find((q) => q.id === selectedQuestion);
    const label = found?.label ?? selectedQuestion;
    if (selectedQuestion === 'other') {
      return customText.trim() || 'Other question';
    }
    return label;
  };

  const saveNote = () => {
    const note = buildNoteText();
    if (!note) return;
    if (!inCart) addToShortlist(property);
    updateInquiry(property.property_id, {
      wantSiteVisit: selectedQuestion === 'visit',
      interestedInPurchase: false,
      haveQuestion: true,
      question: note,
    });
    setSubmitted(true);
  };

  const handleProceed = () => {
    saveNote();
    handleClose();
    router.push('/shortlist');
  };

  const handleExploreMore = () => {
    saveNote();
    if (!inCart) addToShortlist(property);
    handleClose();
  };

  const canSubmit = selectedQuestion !== null && (selectedQuestion !== 'other' || customText.trim().length > 0);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[150] bg-black/30 backdrop-blur-[4px]"
          />

          {/* Sheet / Modal */}
          <div className="fixed inset-0 z-[151] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full sm:max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[28px] bg-white shadow-2xl pointer-events-auto"
            >
              {/* Handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-10 rounded-full bg-zinc-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
                    <MessageCircleQuestion className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 leading-none">Ask a Question</h2>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5 leading-none">
                      {property.type} · {property.area}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 pb-2 space-y-2"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                      What would you like to ask?
                    </p>

                    {/* Predefined options */}
                    <div className="space-y-2">
                      {PREDEFINED_QUESTIONS.map((q) => {
                        const isSelected = selectedQuestion === q.id;
                        return (
                          <motion.button
                            key={q.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedQuestion(q.id);
                              if (q.id !== 'other') setCustomText('');
                            }}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-sm font-semibold text-left transition-all',
                              isSelected
                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                : 'border-zinc-100 bg-zinc-50 text-zinc-700 hover:border-zinc-200 hover:bg-white'
                            )}
                          >
                            <span className="text-base">{q.emoji}</span>
                            <span className="flex-1">{q.label}</span>
                            <div
                              className={cn(
                                'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                                isSelected ? 'border-white bg-white' : 'border-zinc-200 bg-white'
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3 text-zinc-900" strokeWidth={3.5} />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Custom text area — shown only when "other" is selected */}
                    <AnimatePresence>
                      {selectedQuestion === 'other' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <textarea
                            autoFocus
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Type your question here…"
                            rows={2}
                            spellCheck={false}
                            className="mt-2 w-full rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 text-sm font-medium text-zinc-900 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900/5 placeholder:text-zinc-300 resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mx-5 mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3"
                  >
                    <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Question noted!</p>
                      <p className="text-xs font-medium text-emerald-600 mt-0.5">
                        Your question has been saved with this property. Our team will follow up.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="mx-5 my-1 h-px bg-zinc-100" />

              {/* CTA Buttons */}
              <div className="px-5 pt-3 pb-6 space-y-2">
                <button
                  onClick={handleProceed}
                  disabled={!canSubmit && !submitted}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] shadow-lg',
                    canSubmit || submitted
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                      : 'bg-zinc-100 text-zinc-400 shadow-none cursor-not-allowed'
                  )}
                >
                  <ArrowRight className="h-4 w-4" />
                  Proceed with this Property
                </button>

                <button
                  onClick={handleExploreMore}
                  disabled={!canSubmit && !submitted}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-sm font-bold transition-all active:scale-[0.98]',
                    canSubmit || submitted
                      ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      : 'border-zinc-100 text-zinc-300 cursor-not-allowed'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Explore More &amp; Shortlist this
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
