'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    isPublished: boolean;
    variants: Array<{
      size: string;
      color: string;
      stock: number;
      sku: string;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { title, slug, price, images, category, variants } = product;

  // Custom premium fallback image if actual file is missing or errors
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <rect width="100%" height="100%" fill="%23141416"/>
    <rect x="15" y="15" width="370" height="470" fill="none" stroke="%23C5A880" stroke-width="1" stroke-opacity="0.3"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="20" fill="%23C5A880" letter-spacing="4">BHAVATSYAM</text>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%238C857B" letter-spacing="2" font-weight="bold">${encodeURIComponent(category.toUpperCase())}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23FAF8F5" font-weight="300">${encodeURIComponent(title)}</text>
  </svg>`;

  const [imgSrc, setImgSrc] = useState(images[0] || fallbackSvg);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative flex flex-col bg-white border border-gray-100 overflow-hidden hover:border-[#1E3A8A]/35 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(255,111,97,0.06)]"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full bg-zinc-50 overflow-hidden">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={() => setImgSrc(fallbackSvg)}
          priority={false}
          unoptimized // Prevents next/image optimization errors during testing on missing filesystem assets
        />

        {/* Stock Badge (Vibrant joy and clear readability) */}
        {totalStock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="font-sans text-xs font-bold tracking-widest text-[#1E3A8A] border border-[#1E3A8A] px-4 py-1.5 bg-white">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="flex flex-col flex-1 p-4 bg-white text-[#0F172A]">
        {/* Category */}
        <span className="font-sans text-[10px] tracking-widest text-zinc-400 uppercase font-bold mb-1">
          {category}
        </span>

        {/* Title */}
        <h3 className="font-sans text-base font-medium tracking-wide text-[#0F172A] line-clamp-1 group-hover:text-[#1E3A8A] transition-colors duration-300">
          {title}
        </h3>

        {/* Price & Actions Row */}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-sans text-sm font-semibold text-[#1E3A8A]">
            {formatPrice(price)}
          </span>
          <span className="font-sans text-[11px] text-zinc-400 group-hover:text-[#1E3A8A] transition-colors duration-300 tracking-wider">
            VIEW DETAILS →
          </span>
        </div>
      </div>
    </Link>
  );
}
