'use client';

import React from 'react';
import Image from 'next/image';

interface LogoImageProps {
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  variant?: 'gold' | 'dark' | 'white';
  showTagline?: boolean;
}

export default function LogoImage({
  alt = 'BHAVATSYAM Logo',
  width = 280,
  height = 70,
  className = '',
  imageClassName = '',
}: LogoImageProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/logo.jpg"
        alt={alt}
        width={width}
        height={height}
        className={`w-auto h-auto max-h-16 sm:max-h-[72px] md:max-h-[82px] object-contain transition-transform duration-300 hover:scale-[1.02] ${imageClassName}`}
        priority
      />
    </div>
  );
}
