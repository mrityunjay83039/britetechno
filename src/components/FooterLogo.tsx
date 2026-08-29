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
  alt = 'BRITE Techno Lighting Inc. Logo',
  width = 220,
  height = 55,
  className = '',
  imageClassName = '',
}: FooterLogoProps) {
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:border-amber-400 transition-all duration-300">
        <Image
          src="https://britetechno.com/wp-content/uploads/2023/05/logo.png"
          alt={alt}
          width={width}
          height={height}
          className={`w-auto h-auto max-h-10 sm:max-h-12 object-contain ${imageClassName}`}
          unoptimized
        />
      </div>
    </div>
  );
}
