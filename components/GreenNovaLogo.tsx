import React from 'react';

export const GreenNovaLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Stylized Hexagonal S/Link Shape matching the reference image */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" /> 
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    
    <g stroke="url(#logoGradient)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
      {/* Top Right Bracket */}
      <path d="M60 20 H 75 A 15 15 0 0 1 90 35 V 50" />
      
      {/* Bottom Left Bracket */}
      <path d="M40 80 H 25 A 15 15 0 0 1 10 65 V 50" />
      
      {/* Center S Link Shape */}
      <path d="M35 35 H 55 A 10 10 0 0 1 65 45 V 55 A 10 10 0 0 1 55 65 H 45 A 10 10 0 0 0 35 75 V 75" />
      <path d="M65 25 V 25" stroke="none" fill="currentColor" /> {/* Dot accent top */}
      <path d="M35 75 V 75" stroke="none" fill="currentColor" /> {/* Dot accent bottom */}
      
      {/* Inner connecting lines */}
      <path d="M35 50 V 35" />
      <path d="M65 50 V 65" />
    </g>
  </svg>
);

export default GreenNovaLogo;