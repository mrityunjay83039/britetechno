'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X, Search, RotateCcw, ChevronDown, Check, Zap, Layers } from 'lucide-react';

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface SerializedVariant {
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface SerializedProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  categorySlug?: string;
  isPublished: boolean;
  variants: SerializedVariant[];
  averageRating?: number;
  reviewCount?: number;
}

interface ProductsFilterClientProps {
  products: SerializedProduct[];
  categories: CategoryItem[];
}

type SortOption = 'newest' | 'title-asc' | 'title-desc';

const POPULAR_WATTAGES = ['50W', '100W', '150W', '200W', '240W', '300W'];

export default function ProductsFilterClient({ products, categories }: ProductsFilterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Synchronized filter states initialized from URL params
  const urlCategory = searchParams.get('category') || 'all';
  const urlWattage = searchParams.get('wattage') || 'all';
  const urlSort = (searchParams.get('sort') as SortOption) || 'newest';
  const urlSearch = searchParams.get('q') || '';

  const [selectedCategorySlug, setSelectedCategorySlug] = useState(urlCategory);
  const [selectedWattage, setSelectedWattage] = useState(urlWattage);
  const [sortBy, setSortBy] = useState<SortOption>(urlSort);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const PAGE_SIZE = 18;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sync state if URL query params change (e.g. from Mega Menu navigation or browser Back/Forward)
  React.useEffect(() => {
    setSelectedCategorySlug(urlCategory);
    setSelectedWattage(urlWattage);
    setSortBy(urlSort);
    setSearchQuery(urlSearch);
    setVisibleCount(PAGE_SIZE);
  }, [urlCategory, urlWattage, urlSort, urlSearch]);

  // Synchronize browser URL smoothly without triggering an RSC Server Component re-fetch
  const updateUrl = (cat: string, q: string, w: string, s: SortOption) => {
    const params = new URLSearchParams();
    if (cat && cat !== 'all') params.set('category', cat);
    if (q && q.trim() !== '') params.set('q', q.trim());
    if (w && w !== 'all') params.set('wattage', w);
    if (s && s !== 'newest') params.set('sort', s);

    const query = params.toString();
    const newUrl = query ? `/products?${query}` : '/products';
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    setVisibleCount(PAGE_SIZE);
    updateUrl(slug, searchQuery, selectedWattage, sortBy);
  };

  const handleWattageSelect = (w: string) => {
    const nextW = selectedWattage === w ? 'all' : w;
    setSelectedWattage(nextW);
    setVisibleCount(PAGE_SIZE);
    updateUrl(selectedCategorySlug, searchQuery, nextW, sortBy);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setVisibleCount(PAGE_SIZE);
    updateUrl(selectedCategorySlug, searchQuery, selectedWattage, sort);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setVisibleCount(PAGE_SIZE);
    updateUrl(selectedCategorySlug, val, selectedWattage, sortBy);
  };

  const handleClearAll = () => {
    setSelectedCategorySlug('all');
    setSelectedWattage('all');
    setSortBy('newest');
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
    updateUrl('all', '', 'all', 'newest');
  };

  // Active Category Document
  const activeCategoryDoc = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategorySlug);
  }, [categories, selectedCategorySlug]);

  // Filtered & Sorted Products calculation
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products
      .filter((prod) => {
        // Category Filter
        if (selectedCategorySlug !== 'all') {
          const catMatch =
            prod.categorySlug === selectedCategorySlug ||
            prod.category.toLowerCase() === activeCategoryDoc?.name.toLowerCase() ||
            prod.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedCategorySlug;
          if (!catMatch) return false;
        }

        // Search Query Filter
        if (q !== '') {
          const titleMatch = prod.title.toLowerCase().includes(q);
          const descMatch = prod.description.toLowerCase().includes(q);
          const catMatch = prod.category.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !catMatch) return false;
        }

        // Wattage Filter
        if (selectedWattage !== 'all') {
          const hasWattage =
            prod.variants?.some((v) => v.size.toLowerCase().includes(selectedWattage.toLowerCase())) ||
            prod.title.toLowerCase().includes(selectedWattage.toLowerCase()) ||
            prod.description.toLowerCase().includes(selectedWattage.toLowerCase());
          if (!hasWattage) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
        return 0; // Default order
      });
  }, [products, selectedCategorySlug, searchQuery, selectedWattage, sortBy, activeCategoryDoc]);

  const hasActiveFilters =
    selectedCategorySlug !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedWattage !== 'all';

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen text-slate-900">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-12 sm:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#0066B4] uppercase block mb-2">
            {activeCategoryDoc ? 'Category Catalog' : 'Commercial & Industrial Equipment'}
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            {activeCategoryDoc ? activeCategoryDoc.name : searchQuery ? `Search Results for "${searchQuery}"` : 'All Lighting Products'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-slate-300 mt-3 max-w-2xl mx-auto leading-relaxed">
            {activeCategoryDoc?.description ||
              'High-efficiency original and imported commercial LED fixtures for warehouses, parking lots, offices, and industrial facilities.'}
          </p>
        </div>
      </section>

      {/* Main Filter & Catalog Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        
        {/* Controls Bar: Search, Mobile Filter Toggle, Sort Selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          
          {/* Search Box & Mobile Filter Trigger */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search fixtures by keyword, SKU or spec..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] text-xs font-sans text-slate-900 rounded-lg outline-none placeholder-slate-400 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-[#0066B4] hover:bg-[#005293] text-white text-xs font-sans font-bold tracking-wider rounded-lg shrink-0 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-white" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>

          {/* Sort By Dropdown & Count */}
          <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
            <span className="font-sans text-xs text-slate-500 font-bold tracking-wider">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'FIXTURE' : 'FIXTURES'}
            </span>

            <div className="flex items-center gap-2">
              <label className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Sort:
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-slate-300 px-3.5 py-2 pr-8 text-xs font-sans font-bold text-slate-900 rounded-lg outline-none focus:border-[#0066B4] cursor-pointer shadow-xs"
                >
                  <option value="newest">Featured / Newest</option>
                  <option value="title-asc">Product Title (A - Z)</option>
                  <option value="title-desc">Product Title (Z - A)</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0066B4] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {selectedCategorySlug !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0066B4] text-white text-xs font-sans font-semibold rounded-md">
                <span>Category: {activeCategoryDoc ? activeCategoryDoc.name : selectedCategorySlug}</span>
                <button onClick={() => handleCategorySelect('all')} className="hover:text-blue-200 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedWattage !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0066B4] text-white text-xs font-sans font-semibold rounded-md">
                <span>Wattage: {selectedWattage}</span>
                <button onClick={() => handleWattageSelect(selectedWattage)} className="hover:text-blue-200 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0066B4] text-white text-xs font-sans font-semibold rounded-md">
                <span>Query: &quot;{searchQuery}&quot;</span>
                <button onClick={() => handleSearchChange('')} className="hover:text-blue-200 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[#0066B4] hover:underline ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          </div>
        )}

        {/* Layout Container: Desktop Sidebar + Product Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filter Panel (Desktop & Mobile Drawer) */}
          <aside
            className={`md:w-64 shrink-0 font-sans space-y-6 ${
              isMobileFilterOpen
                ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
                : 'hidden md:block'
            }`}
          >
            {/* Mobile Close Header */}
            {isMobileFilterOpen && (
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 md:hidden">
                <h3 className="font-sans text-lg font-bold text-slate-900">Filter Products</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* 1. Category Filter List */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-[#0066B4]" />
                Categories
              </h4>
              <ul className="space-y-1 text-xs font-medium max-h-72 overflow-y-auto pr-1">
                <li>
                  <button
                    onClick={() => {
                      handleCategorySelect('all');
                      if (isMobileFilterOpen) setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-2 px-2.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategorySlug === 'all'
                        ? 'bg-[#0066B4] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Fixtures ({products.length})</span>
                    {selectedCategorySlug === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </li>
                {categories.map((cat) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <li key={cat._id}>
                      <button
                        onClick={() => {
                          handleCategorySelect(cat.slug);
                          if (isMobileFilterOpen) setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-[#0066B4] text-white font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 2. Wattage Quick Spec Filter */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Zap className="w-4 h-4 text-[#0066B4]" />
                Filter by Wattage
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {POPULAR_WATTAGES.map((w) => {
                  const isSelected = selectedWattage === w;
                  return (
                    <button
                      key={w}
                      onClick={() => handleWattageSelect(w)}
                      className={`py-1.5 px-2 text-xs font-sans font-bold border transition-all cursor-pointer rounded-md ${
                        isSelected
                          ? 'bg-[#0066B4] text-white border-[#0066B4] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#0066B4]'
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Apply Button */}
            {isMobileFilterOpen && (
              <div className="pt-2 md:hidden">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#0066B4] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
                >
                  Apply Filters ({filteredProducts.length} Results)
                </button>
              </div>
            )}
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-[#0066B4]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-sans text-xl font-bold text-slate-900">No matching fixtures found</h3>
                <p className="font-sans text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  We couldn&apos;t find any products matching your applied filters. Try clearing your filters or search keywords.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-3 bg-[#0066B4] text-white border border-[#0066B4] hover:bg-[#005293] font-sans text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-lg shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {filteredProducts.length > visibleCount && (
                  <div className="flex flex-col items-center justify-center pt-6 pb-2 space-y-3">
                    <p className="font-sans text-xs text-slate-500 font-semibold tracking-wider">
                      Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} commercial fixtures
                    </p>
                    <button
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="px-8 py-3.5 bg-white border-2 border-[#0066B4] text-[#0066B4] hover:bg-[#0066B4] hover:text-white font-sans text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      Load More Fixtures ({filteredProducts.length - visibleCount} Remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </section>
    </div>
  );
}
