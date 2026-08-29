'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Search, Layers } from 'lucide-react';

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

interface HomepageOption3Props {
  products: SerializedProduct[];
}

export default function HomepageOption3({ products }: HomepageOption3Props) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesQuery =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col bg-white text-slate-900 min-h-screen">
      {/* Top Banner Matrix */}
      <div className="bg-slate-900 text-slate-200 py-3 px-4 border-b border-slate-800 text-center text-xs font-sans font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>BRITE Techno Lighting Inc. — Family-Owned B2B Lighting Equipment Across Canada & US</span>
      </div>

      {/* Hero Interactive Search Matrix */}
      <section className="bg-slate-100 border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-amber-600">
                Catalog Matrix Navigation
              </span>
              <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Search 141+ Original & Imported Lighting Fixtures
              </h1>
              <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
                Filter by wattage, lumens, voltage, and category to select equipment for your quote request.
              </p>
            </div>

            {/* Direct Interactive Search Box */}
            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Filter catalog by keyword, SKU or spec (e.g. High Bay)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-lg text-xs font-sans text-slate-900 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider self-center mr-1">
                  Popular Specs:
                </span>
                {['High Bay', 'Wall Pack', 'Slim Panel', 'Troffer', 'Vapor Tight'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearch(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Matrix Area */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="font-sans text-lg font-bold text-slate-900 uppercase tracking-wide">
              {selectedCat === 'All' ? 'All Catalog Categories' : selectedCat}
            </h3>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {filtered.length} Items
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCat === cat
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
