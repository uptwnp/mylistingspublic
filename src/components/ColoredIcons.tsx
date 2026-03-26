import React from 'react';

const GradientDefs = () => (
  <defs>
    <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FB7185" />
      <stop offset="100%" stopColor="#E11D48" />
    </linearGradient>
    <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#4ADE80" />
      <stop offset="100%" stopColor="#22C55E" />
    </linearGradient>
    <linearGradient id="soilGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#92400E" />
      <stop offset="100%" stopColor="#78350F" />
    </linearGradient>
    <linearGradient id="flatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#64748B" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>
    <linearGradient id="commGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#3B82F6" />
      <stop offset="100%" stopColor="#2563EB" />
    </linearGradient>
  </defs>
);

interface IconProps {
  className?: string;
  size?: number | string;
}

export const ColoredHouseIcon = ({ className, size }: IconProps) => (
  <svg viewBox="0 0 512 512" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GradientDefs />
    
    {/* Main Drop Shadow */}
    <ellipse cx="256" cy="386" rx="160" ry="10" fill="#000000" fillOpacity="0.08"/>

    {/* Chimney Body */}
    <path d="M320 150 V80 H360 V150 Z" fill="url(#flatGradient)" />
    {/* Chimney Cap */}
    <rect x="312" y="70" width="56" height="12" rx="4" fill="#334155" />

    {/* House Body */}
    <rect x="140" y="140" width="232" height="230" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="8" />
    
    {/* Roof shadow on wall */}
    <path d="M144 144 L256 120 L368 144 V190 L256 100 L144 190 Z" fill="#E2E8F0" fillOpacity="0.5" />
    
    {/* White Foundation */}
    <rect x="124" y="370" width="264" height="20" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="8" />

    {/* Left Window */}
    <rect x="156" y="230" width="52" height="64" rx="8" fill="#F0F9FF" stroke="#94A3B8" strokeWidth="6" />
    <path d="M156 262 H208 M182 230 V294" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
    
    {/* Right Window */}
    <rect x="304" y="230" width="52" height="64" rx="8" fill="#F0F9FF" stroke="#94A3B8" strokeWidth="6" />
    <path d="M304 262 H356 M330 230 V294" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

    {/* Door */}
    <path d="M224 370 V244 A32 32 0 0 1 288 244 V370 Z" fill="url(#soilGradient)" stroke="#78350F" strokeWidth="6" />
    <circle cx="272" cy="310" r="5" fill="#FCD34D" />

    {/* Outer Roof Border */}
    <path d="M420 190 L256 60 L92 190" fill="none" stroke="#BE123C" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Inner Roof Gradient */}
    <path d="M420 190 L256 60 L92 190" fill="none" stroke="url(#roofGradient)" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ColoredFlatIcon = ({ className, size }: IconProps) => (
  <svg viewBox="0 0 512 512" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GradientDefs />
    <rect x="144" y="48" width="224" height="416" rx="20" fill="url(#flatGradient)"/>
    {[0, 1, 2, 3, 4, 5].map(row => (
      <React.Fragment key={row}>
        <rect x="176" y={80 + row*60} width="48" height="36" rx="4" fill="#94A3B8" fillOpacity="0.3"/>
        <rect x="288" y={80 + row*60} width="48" height="36" rx="4" fill="#94A3B8" fillOpacity="0.3"/>
      </React.Fragment>
    ))}
    <rect x="200" y="420" width="112" height="44" rx="4" fill="#1E293B"/>
  </svg>
);

export const ColoredPlotIcon = ({ className, size }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size || "100%"} 
    height={size || "100%"} 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <GradientDefs />
    {/* Plot Shadow */}
    <path d="M12 21 L2.5 16 L12 11 L21.5 16 Z" fill="#000000" fillOpacity="0.1"/>

    {/* Left Face (Soil) */}
    <path d="M2 13 L12 18 V20 L2 15 Z" fill="#92400E" />
    
    {/* Right Face (Soil) */}
    <path d="M12 18 L22 13 V15 L12 20 Z" fill="#78350F" />

    {/* Top Surface (Grass) with black boundary */}
    <path d="M12 8 L2 13 L12 18 L22 13 Z" fill="#16A34A" stroke="#1E293B" strokeWidth="0.15" strokeLinejoin="round"/>
    
    {/* 4 Portions grid lines in shade of black */}
    <path d="M7 10.5 L17 15.5 M17 10.5 L7 15.5" stroke="#1E293B" strokeWidth="0.15" strokeLinecap="round"/>

    {/* Flag Shadow in Portion 1 */}
    <ellipse cx="12" cy="10.5" rx="1.5" ry="0.6" fill="#022C22" fillOpacity="0.5" />

    {/* Flagpole */}
    <path d="M12 10.5 V4" stroke="#1E293B" strokeWidth="0.75" strokeLinecap="round"/>
    
    {/* Waving Flag in Portion 1 */}
    <path d="M12 4 L17 5.5 L12 7 Z" fill="url(#roofGradient)" stroke="#BE123C" strokeWidth="0.5" strokeLinejoin="round"/>
  </svg>
);

export const ColoredCommercialIcon = ({ className, size }: IconProps) => (
  <svg viewBox="0 0 512 512" width={size} height={size} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <GradientDefs />
    <rect x="80" y="128" width="352" height="320" rx="24" fill="url(#commGradient)"/>
    <rect x="120" y="170" width="272" height="160" rx="12" fill="#DBEAFE"/>
    <rect x="140" y="360" width="60" height="88" rx="4" fill="#1E40AF"/>
    <rect x="312" y="360" width="60" height="88" rx="4" fill="#1E40AF"/>
  </svg>
);
