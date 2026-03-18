'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, HelpCircle, MessageSquare } from 'lucide-react';
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInquiryProperty(null)}
            className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[151] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900">{isEdit ? 'Edit Inquiry' : 'Add to Discussion'}</h2>
                </div>
                <button
                  onClick={() => setInquiryProperty(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Compact Property Preview */}
                {property && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                      {property.image_urls?.[0] ? (
                        <Image
                          src={property.image_urls[0]}
                          alt={property.description || 'Property'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                         <div className="flex h-full w-full items-center justify-center font-bold text-zinc-400 text-[8px] uppercase text-center p-1">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-900 leading-none">
                         {formatPrice(property.price_min)}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 truncate mt-1">
                        {property.area}, {property.city}
                      </span>
                    </div>
                  </div>
                )}

                {/* Question Input */}
                <form id="inquiry-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <HelpCircle className="h-3 w-3" />
                      What's your question?
                    </label>
                    <textarea
                      autoFocus
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g. Is it open from two sides? Does it have a clear registry?"
                      className="w-full min-h-[100px] rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 text-sm font-medium text-zinc-900 outline-none ring-zinc-900 transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 placeholder:text-zinc-300"
                      required
                    />
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <button
                  type="submit"
                  form="inquiry-form"
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-black active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  {isEdit ? 'Update Discussion' : 'Add to Discussion Cart'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

