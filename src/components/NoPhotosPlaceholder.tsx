'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPropertyConfig } from '@/lib/property-icons';

interface NoPhotosPlaceholderProps {
  onClick?: () => void;
  className?: string;
  isMini?: boolean;
  propertyType?: string;
  title?: string;
  buttonText?: string;
}

export function NoPhotosPlaceholder({ 
  onClick, 
  className, 
  isMini = false, 
  propertyType = 'House',
  title = "Photos not shared publicly",
  buttonText = "Request Photos"
}: NoPhotosPlaceholderProps) {
  const config = getPropertyConfig(propertyType);
  const iconUrl = config.iconUrl;

  // Extract HEX color from tailwind class text-[#HEX]
  const hexColor = config.color.match(/\[#(.*?)\]/)?.[1] || '3B82F6';
  const bgHexColor = config.bgColor.match(/\[#(.*?)\]/)?.[1] || 'F0F7FF';
  const primaryColor = `#${hexColor}`;
  const secondaryColor = `#${bgHexColor}`;

  if (isMini) {
    return (
      <div 
        className={cn("flex h-full w-full items-center justify-center transition-all duration-300 relative overflow-hidden", className)}
        style={{ backgroundColor: secondaryColor }}
      >
         <div className="relative z-10">
             <img 
               src={iconUrl} 
               alt={propertyType}
               className="h-10 w-10 sm:h-12 sm:w-12 object-contain" 
             />
         </div>
      </div>
    );
  }

  return (
      <div 
        className={cn(
          "relative flex h-full w-full flex-col items-center justify-center overflow-hidden",
          className
        )}
        style={{ backgroundColor: secondaryColor }}
      >
        {/* Background soft glow */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${primaryColor} 0%, rgba(255,255,255,0) 70%)` }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Type-based Icon Illustration */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8 flex items-center justify-center"
        >
          {/* Animated sparkles */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-16 top-4"
            style={{ color: primaryColor }}
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-12 top-12 opacity-60"
            style={{ color: primaryColor }}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>

          {/* Large Dynamic Icon with Premium Styling */}
          <div className="relative">
            <div 
              className="absolute inset-0 scale-125 blur-2xl rounded-full animate-pulse opacity-20" 
              style={{ backgroundColor: primaryColor }}
            />
            <div 
              className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[20px] shadow-xl p-4 sm:p-5 border border-white/50 backdrop-blur-sm"
              style={{ background: `linear-gradient(135deg, white 0%, ${secondaryColor} 100%)` }}
            >
               <img 
                 src={iconUrl} 
                 alt={propertyType}
                 className="h-full w-full object-contain drop-shadow-lg" 
               />
            </div>
          </div>
        </motion.div>

        {/* Informational Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4 }}
          className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-center px-4"
          style={{ color: primaryColor }}
        >
          {title}
        </motion.p>

        {/* Button */}
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={onClick}
          className="group flex items-center gap-2 rounded-full border border-white bg-white px-4 py-1.5 shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-[0.98]"
          style={{ boxShadow: `0 4px 20px -5px ${primaryColor}30` }}
        >
          <span 
            className="text-xs font-bold sm:text-sm whitespace-nowrap"
            style={{ color: primaryColor }}
          >
            {buttonText}
          </span>
          <div 
            className="flex h-4 w-4 items-center justify-center rounded-full transition-colors group-hover:bg-zinc-900 group-hover:text-white"
            style={{ 
              backgroundColor: `${primaryColor}10`,
              color: primaryColor
            }}
          >
            <ChevronRight className="h-3 w-3" />
          </div>
        </motion.button>
      </div>

      {/* Decorative floating elements */}
      <motion.div 
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 15, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-[20%] h-4 w-4 rounded opacity-20" 
        style={{ backgroundColor: primaryColor }}
      />
      <motion.div 
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-24 left-[15%] h-6 w-6 rounded-full border-2 opacity-20" 
        style={{ borderColor: primaryColor }}
      />
    </div>
  );
}
