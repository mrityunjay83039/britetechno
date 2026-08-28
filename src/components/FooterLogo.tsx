'use client';

import React from 'react';
import Image from 'next/image';

interface FooterLogoProps {
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
}

export default function FooterLogo({
  alt = 'BHAVATSYAM Logo',
  width = 260,
  height = 65,
  className = '',
  imageClassName = '',
}: FooterLogoProps) {
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <Image
        src="/logo.jpg"
        alt={alt}
        width={width}
        height={height}
        className={`w-auto h-auto max-h-16 sm:max-h-20 object-contain transition-transform duration-300 hover:scale-[1.02] ${imageClassName}`}
      />
    </div>
  );
}
