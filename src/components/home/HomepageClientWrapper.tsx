'use client';

import React, { useState } from 'react';
import HomepageOption1 from './HomepageOption1';
import HomepageOption2 from './HomepageOption2';
import HomepageOption3 from './HomepageOption3';
import { Layout, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface SerializedVariant {
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface SerializedProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isPublished: boolean;
  variants: SerializedVariant[];
}

interface HomepageClientWrapperProps {
  products: SerializedProduct[];
}

export default function HomepageClientWrapper({ products }: HomepageClientWrapperProps) {
  // Option 1: Industrial Powerhouse (Clean Modern High Contrast) - Recommended
  // Option 2: Executive Showcase (Sleek Dark Luxe)
  // Option 3: Catalog First Matrix (Interactive Filters)
  const [activeOption, setActiveOption] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('britetechno_home_option');
        if (saved && ['1', '2', '3'].includes(saved)) {
          return Number(saved);
        }
      } catch {
        // Ignore
      }
    }
    return 1;
  });

  const handleSelectOption = (option: number) => {
    setActiveOption(option);
    try {
      localStorage.setItem('britetechno_home_option', String(option));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Interactive Sticky Top Switcher Bar */}
      <div className="sticky top-[80px] md:top-[96px] z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/30 text-white py-2.5 px-4 shadow-md transition-all">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold tracking-wider uppercase text-slate-200">
              Homepage Design Options:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSelectOption(1)}
              className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeOption === 1
                  ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Option 1: Industrial Powerhouse (Clean)</span>
            </button>

            <button
              onClick={() => handleSelectOption(2)}
              className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeOption === 2
                  ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Option 2: Executive Showcase (Dark Luxe)</span>
            </button>

            <button
              onClick={() => handleSelectOption(3)}
              className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeOption === 3
                  ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Option 3: Catalog Matrix (Filters)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Option */}
      <div className="flex-1">
        {activeOption === 1 && <HomepageOption1 products={products} />}
        {activeOption === 2 && <HomepageOption2 products={products} />}
        {activeOption === 3 && <HomepageOption3 products={products} />}
      </div>
    </div>
  );
}
