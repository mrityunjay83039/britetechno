'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

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
  const { title, slug, images, category, variants } = product;

  // Custom fallback SVG if image fails to load
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="100%" height="100%" fill="%230F172A"/>
    <rect x="20" y="20" width="360" height="360" fill="none" stroke="%230066B4" stroke-width="2" stroke-opacity="0.4"/>
    <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%230066B4" letter-spacing="3" font-weight="bold">BRITE TECHNO</text>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2394A3B8" letter-spacing="1" font-weight="600">${encodeURIComponent(category.toUpperCase())}</text>
  </svg>`;

  const [imgSrc, setImgSrc] = useState(images[0] || fallbackSvg);

  const wattages = variants.map((v) => v.size).filter((s) => s && s !== 'Standard');
  const primarySpec = wattages.length > 0 ? wattages.join(' / ') : 'Commercial Spec';

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0066B4]/60 transition-all duration-300 hover:shadow-xl flex-1 justify-between"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden border-b border-slate-100">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgSrc(fallbackSvg)}
            priority={false}
            unoptimized
          />
        </div>

        {/* Info Container */}
        <div className="p-5 space-y-2">
          {/* Category */}
          <span className="font-sans text-[10px] tracking-widest text-[#0066B4] uppercase font-extrabold block">
            {category}
          </span>

          {/* Title */}
          <h3 className="font-sans text-sm font-bold tracking-tight text-slate-900 line-clamp-2 group-hover:text-[#0066B4] transition-colors duration-200 leading-snug">
            {title}
          </h3>

          {/* Spec Line */}
          <p className="font-sans text-[11px] text-slate-500 line-clamp-1">
            Available Specs: <span className="font-semibold text-slate-700">{primarySpec}</span>
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
        <span className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Pricing on Request
        </span>
        <span className="font-sans text-xs font-bold text-[#0066B4] group-hover:text-[#005293] transition-colors flex items-center gap-1">
          <span>REQUEST QUOTE</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
