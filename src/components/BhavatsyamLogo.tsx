'use client';

import React from 'react';

interface BhavatsyamLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  variant?: 'gold' | 'dark' | 'white';
  showTagline?: boolean;
}

export default function BhavatsyamLogo({
  width = 260,
  height = 65,
  className = '',
  variant = 'gold',
  showTagline = true,
}: BhavatsyamLogoProps) {
  let strokeColor = '#C5A880'; // Gold
  let textColor = '#C5A880';
  let taglineColor = '#8C857B';

  if (variant === 'dark') {
    strokeColor = '#0F0F11';
    textColor = '#0F0F11';
    taglineColor = '#4A4640';
  } else if (variant === 'white') {
    strokeColor = '#FAF8F5';
    textColor = '#FAF8F5';
    taglineColor = '#C5A880';
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 460 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-full max-h-14 transition-transform duration-300 hover:scale-[1.02]"
      >
        {/* Flower Illustration Line Art */}
        <g stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Outer Petal 1 (Top Left) */}
          <path d="M 42 38 C 35 24, 48 10, 62 16 C 72 20, 75 30, 68 40" />
          <path d="M 48 20 C 52 26, 56 32, 60 36" strokeWidth="0.8" opacity="0.75" />
          <path d="M 54 18 C 57 24, 60 29, 63 34" strokeWidth="0.8" opacity="0.6" />

          {/* Outer Petal 2 (Top Right) */}
          <path d="M 68 40 C 78 28, 96 32, 94 48 C 92 58, 80 64, 68 62" />
          <path d="M 85 36 C 79 42, 74 48, 70 52" strokeWidth="0.8" opacity="0.75" />
          <path d="M 88 44 C 81 48, 76 52, 72 55" strokeWidth="0.8" opacity="0.6" />

          {/* Outer Petal 3 (Bottom Right) */}
          <path d="M 68 62 C 78 72, 70 88, 54 84 C 44 80, 42 68, 48 58" />
          <path d="M 66 78 C 60 72, 54 66, 50 62" strokeWidth="0.8" opacity="0.75" />
          <path d="M 58 82 C 54 75, 51 69, 49 63" strokeWidth="0.8" opacity="0.6" />

          {/* Outer Petal 4 (Bottom Left) */}
          <path d="M 48 58 C 36 68, 18 62, 22 46 C 25 36, 36 34, 42 38" />
          <path d="M 28 58 C 34 52, 38 48, 43 45" strokeWidth="0.8" opacity="0.75" />
          <path d="M 24 50 C 31 47, 36 44, 42 42" strokeWidth="0.8" opacity="0.6" />

          {/* Center Stamen Pistil details */}
          <circle cx="55" cy="49" r="6" strokeWidth="1.2" />
          <circle cx="55" cy="49" r="2" fill={strokeColor} />
          
          {/* Stamen filaments */}
          <line x1="55" y1="43" x2="55" y2="37" strokeWidth="1" />
          <circle cx="55" cy="36" r="1" fill={strokeColor} />

          <line x1="60" y1="46" x2="65" y2="42" strokeWidth="1" />
          <circle cx="66" cy="41" r="1" fill={strokeColor} />

          <line x1="61" y1="51" x2="67" y2="53" strokeWidth="1" />
          <circle cx="68" cy="54" r="1" fill={strokeColor} />

          <line x1="56" y1="55" x2="57" y2="61" strokeWidth="1" />
          <circle cx="57" cy="62" r="1" fill={strokeColor} />

          <line x1="50" y1="53" x2="45" y2="57" strokeWidth="1" />
          <circle cx="44" cy="58" r="1" fill={strokeColor} />

          <line x1="49" y1="47" x2="43" y2="44" strokeWidth="1" />
          <circle cx="42" cy="43" r="1" fill={strokeColor} />
        </g>

        {/* Brand Text: BHAVATSYAM */}
        <text
          x="106"
          y="52"
          fill={textColor}
          fontFamily="'Cormorant Garamond', 'Cinzel', 'Playfair Display', 'Georgia', serif"
          fontSize="36"
          fontWeight="600"
          letterSpacing="4"
        >
          BHAVATSYAM
        </text>

        {/* Tagline Text */}
        {showTagline && (
          <text
            x="108"
            y="74"
            fill={taglineColor}
            fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
            fontSize="10"
            fontWeight="500"
            letterSpacing="1.5"
          >
            A Perfect Blend of Heritage and Modernity.
          </text>
        )}
      </svg>
    </div>
  );
}
