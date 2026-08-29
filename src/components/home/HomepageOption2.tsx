'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Sparkles, MapPin, ChevronRight, PhoneCall, Building2, CheckCircle2 } from 'lucide-react';

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

interface HomepageOption2Props {
  products: SerializedProduct[];
}

export default function HomepageOption2({ products }: HomepageOption2Props) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))].slice(0, 7);

  const filteredProducts = products.filter(
    (p) => activeCategory === 'All' || p.category === activeCategory
  );

  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* 1. Dark Luxe Glassmorphic Executive Hero */}
      <section className="relative w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Family-Owned Industrial Lighting Specialists
            </span>
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Premium Commercial & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Industrial LED Fixtures</span>
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              BRITE Techno Lighting Inc. provides high-performance original and imported light fixtures across Canada and the United States. Unbeatable B2B volume pricing and guaranteed customer satisfaction.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/products"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-sans text-xs font-extrabold uppercase tracking-widest px-8 py-4 rounded-lg shadow-lg shadow-amber-500/20 transition-all duration-300 flex items-center gap-2"
              >
                Browse Full Catalog
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="border border-slate-700 hover:border-amber-400/60 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-sans text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-lg transition-all duration-300"
              >
                Request Quotation
              </Link>
            </div>
          </div>

          {/* Right Glass Card Showcase */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <h3 className="font-sans text-lg font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Showroom & Headquarters
            </h3>
            <div className="space-y-3 font-sans text-xs text-slate-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>6068 Boul. Metropolitain E., Saint-Leonard, Quebec, H1S 1A9, CANADA</span>
              </p>
              <p className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <span>B2B Sales & Project Quote Support Available</span>
              </p>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>141+ High Bay, Troffer & Vapor Tight Fixtures in Stock</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Canada & United States Fast Delivery Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>UL / cULus / DLC Premium Certified Specs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Catalog Display */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6 mb-10">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Industrial Catalog Showcase
            </h2>
            <p className="font-sans text-xs text-slate-400 mt-1 uppercase tracking-wider">
              Browse technical lighting equipment for warehouses, factories, and offices
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-md font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
