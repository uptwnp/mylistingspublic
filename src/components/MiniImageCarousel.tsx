'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiniImageCarouselProps {
  images: string[];
  alt: string;
  onTap?: () => void;
}

export function MiniImageCarousel({ images, alt, onTap }: MiniImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!images || images.length === 0) return null;

  const next = (e?: any) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setDirection(1);
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e?: any) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setDirection(-1);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-xl bg-zinc-100">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
            if (swipe) {
              if (offset.x > 0) {
                prev(e as any);
              } else {
                next(e as any);
              }
            }
            setTimeout(() => setIsDragging(false), 100);
          }}
          onTap={() => {
            if (!isDragging && onTap) {
              onTap();
            }
          }}
          className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        >
          <Image
            src={images[index]}
            alt={`${alt} - Image ${index + 1}`}
            fill
            className="object-cover select-none pointer-events-none"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          {/* Progress Dots */}
          <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-1 px-1.5 py-1 rounded-full bg-black/20 backdrop-blur-sm">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-1 rounded-full transition-all duration-300",
                  index === i ? "w-3 bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>

          {/* Navigation Overlay (Visible on Hover) */}
          <div className="absolute inset-0 z-40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prev}
              className="flex h-6 w-6 items-center justify-center rounded-r-full bg-white/80 text-zinc-900 shadow-sm transition-all hover:bg-white active:scale-[0.98]"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={next}
              className="flex h-6 w-6 items-center justify-center rounded-l-full bg-white/80 text-zinc-900 shadow-sm transition-all hover:bg-white active:scale-[0.98]"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
