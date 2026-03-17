'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, HelpCircle, MessageSquare, Info } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useDiscussion } from '@/context/DiscussionContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function InquiryModal() {
  const router = useRouter();
  const { inquiryProperty, setInquiryProperty, confirmAddToCart, inquiries, isInCart } = useDiscussion();
  const [question, setQuestion] = useState('');

  useEffect(() => {
    if (inquiryProperty) {
      const id = typeof inquiryProperty === 'string' ? inquiryProperty : inquiryProperty.property_id;
      setQuestion(inquiries[id] || '');
    }
  }, [inquiryProperty, inquiries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiryProperty) {
      const id = typeof inquiryProperty === 'string' ? inquiryProperty : inquiryProperty.property_id;
      confirmAddToCart(id, question);
      router.push('/discussion-cart');
    }
  };

  if (!inquiryProperty) return null;

  const property = typeof inquiryProperty === 'string' ? null : inquiryProperty;
  const isEdit = isInCart(property?.property_id || inquiryProperty);

  return (
    <AnimatePresence>
      {inquiryProperty && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInquiryProperty(null)}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[151] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 leading-none">{isEdit ? 'Edit Inquiry' : 'Add Inquiry'}</h2>
                    <p className="mt-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Discussion Detail</p>
                  </div>
                </div>
                <button
                  onClick={() => setInquiryProperty(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Property Preview */}
                {property && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                      {property.image_urls?.[0] ? (
                        <Image
                          src={property.image_urls[0]}
                          alt={property.description || 'Property'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                         <div className="flex h-full w-full items-center justify-center font-black text-zinc-400 text-[10px] uppercase text-center p-2">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black text-zinc-900 leading-tight truncate">
                         {formatPrice(property.price_min)}
                      </span>
                      <span className="text-xs font-bold text-zinc-500 truncate mt-0.5">
                        {property.area}, {property.city}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase mt-1 tracking-wider">
                        {property.type}
                      </span>
                    </div>
                  </div>
                )}

                {/* Question Input */}
                <form id="inquiry-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 label-info">
                      <HelpCircle className="h-3 w-3" />
                      What is your inquiry question?
                    </label>
                    <textarea
                      autoFocus
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g. Is it open from two sides? Does it have a clear registry? Any specific detail you want to know about this property..."
                      className="w-full min-h-[140px] rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm font-bold text-zinc-900 outline-none ring-zinc-900 transition-all focus:border-zinc-900 focus:bg-white focus:ring-1"
                      required
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-blue-600 leading-relaxed">
                      Your question will be sent along with your contact request to help us provide you with the most relevant information during the discussion.
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-100 p-6 bg-zinc-50/50">
                <button
                  type="submit"
                  form="inquiry-form"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-4 text-sm font-black text-white shadow-xl shadow-black/10 transition-all hover:bg-black active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  {isEdit ? 'Update & Save' : 'Confirm & Add to Discussion'}
                </button>
                <p className="mt-3 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                  Press enter to submit your inquiry
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
