'use client';

import React from 'react';
import Image from 'next/image';

interface LogoImageProps {
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  variant?: 'gold' | 'dark' | 'white' | 'badge';
  showTagline?: boolean;
}

export default function LogoImage({
  alt = 'BRITE Techno Lighting Inc. Logo',
  width = 220,
  height = 55,
  className = '',
  imageClassName = '',
  variant = 'badge',
}: LogoImageProps) {
  // Container styling to ensure 100% contrast and clear visibility regardless of header background
  const containerClasses =
    variant === 'badge'
      ? 'bg-white px-3.5 py-1.5 rounded-lg shadow-sm border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-300'
      : 'relative';

  return (
    <div className={`relative flex items-center justify-center ${containerClasses} ${className}`}>
      <Image
        src="https://britetechno.com/wp-content/uploads/2023/05/logo.png"
        alt={alt}
        width={width}
        height={height}
        className={`w-auto h-auto max-h-9 sm:max-h-11 md:max-h-12 object-contain transition-transform duration-300 hover:scale-[1.02] ${imageClassName}`}
        priority
        unoptimized
      />
    </div>
  );
}
