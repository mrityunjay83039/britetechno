'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import PremiumHero from '@/components/PremiumHero';
import { ShieldCheck, Award, MapPin, Zap, FileText } from 'lucide-react';

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

interface HomepageOption1Props {
  products: SerializedProduct[];
}

export default function HomepageOption1({ products }: HomepageOption1Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))].slice(0, 8);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCat = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Hero Section */}
      <PremiumHero />

      {/* 2. Trust Pillars Bar */}
      <section className="bg-slate-900 text-white border-y border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-amber-400">
                  Family-Owned Business
                </h4>
                <p className="font-sans text-xs text-slate-300 mt-0.5">
                  Trusted lighting provider across Canada & the United States.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-amber-400">
                  Unbeatable Prices & Quality
                </h4>
                <p className="font-sans text-xs text-slate-300 mt-0.5">
                  Guaranteed customer satisfaction & factory-direct volume pricing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-amber-400">
                  Original & Imported Fixtures
                </h4>
                <p className="font-sans text-xs text-slate-300 mt-0.5">
                  Industrial, commercial, office, and residential applications.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-amber-400">
                  Quebec Showroom
                </h4>
                <p className="font-sans text-xs text-slate-300 mt-0.5">
                  6068 Boul. Metropolitain E., Saint-Leonard, QC H1S 1A9.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catalog Section with Interactive Spec Filtering */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8 mb-10">
          <div>
            <span className="font-sans text-xs font-bold tracking-[0.25em] text-amber-600 uppercase block mb-2">
              Commercial & Industrial Fixtures
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Technical Lighting Catalog
            </h2>
          </div>

          {/* Quick Filter Search */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by fixture or spec (e.g. 150W)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-amber-500 text-slate-900 text-xs font-sans rounded-md shadow-xs outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-md font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-amber-400 shadow-sm border border-slate-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-xs">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-sans text-lg font-bold text-slate-800">No Matching Fixtures Found</h3>
            <p className="font-sans text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or explore our complete catalog categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-5 inline-block bg-slate-900 text-amber-400 px-6 py-2.5 rounded-md font-sans text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
