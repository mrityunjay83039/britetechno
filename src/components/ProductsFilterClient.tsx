'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X, Search, RotateCcw, ChevronDown, Check } from 'lucide-react';

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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE'] as const;

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

export default function ProductsFilterClient({ products, categories }: ProductsFilterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Source of truth is derived directly from URL search parameters to avoid redundant states and useEffect lint issues
  const selectedCategorySlug = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const selectedSize = searchParams.get('size') || 'all';
  const sortBy = (searchParams.get('sort') as SortOption) || 'newest';

  // Local UI States (not bound directly to URL search params in real-time)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 20000 });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Update URL helper
  const updateUrlFilters = (newCategory: string, newSearch: string, newSize: string, newSort: SortOption) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    if (newSearch && newSearch.trim() !== '') params.set('q', newSearch.trim());
    if (newSize && newSize !== 'all') params.set('size', newSize);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products', { scroll: false });
  };

  const handleCategorySelect = (slug: string) => {
    updateUrlFilters(slug, searchQuery, selectedSize, sortBy);
  };

  const handleSizeSelect = (size: string) => {
    const nextSize = selectedSize === size ? 'all' : size;
    updateUrlFilters(selectedCategorySlug, searchQuery, nextSize, sortBy);
  };

  const handleSortChange = (sort: SortOption) => {
    updateUrlFilters(selectedCategorySlug, searchQuery, selectedSize, sort);
  };

  const handleSearchChange = (val: string) => {
    updateUrlFilters(selectedCategorySlug, val, selectedSize, sortBy);
  };

  const handleClearAll = () => {
    setPriceRange({ min: 0, max: 20000 });
    router.push('/products', { scroll: false });
  };

  // Active Category Document
  const activeCategoryDoc = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategorySlug);
  }, [categories, selectedCategorySlug]);

  // Filtered & Sorted Products calculation
  const filteredProducts = useMemo(() => {
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
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const titleMatch = prod.title.toLowerCase().includes(q);
          const descMatch = prod.description.toLowerCase().includes(q);
          const catMatch = prod.category.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !catMatch) return false;
        }

        // Size Filter
        if (selectedSize !== 'all') {
          const hasSize = prod.variants?.some((v) => v.size === selectedSize && v.stock > 0);
          if (!hasSize) return false;
        }

        // Price Filter
        if (prod.price < priceRange.min || prod.price > priceRange.max) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
        return 0; // Default newest order from server
      });
  }, [products, selectedCategorySlug, searchQuery, selectedSize, priceRange, sortBy, activeCategoryDoc]);

  const hasActiveFilters =
    selectedCategorySlug !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedSize !== 'all' ||
    priceRange.min > 0 ||
    priceRange.max < 20000;

  return (
    <div className="flex flex-col bg-[#FFFFFF] min-h-screen">
      {/* Luxury Collection Header (Bright & Airy) */}
      <section className="bg-white text-[#0F172A] py-16 sm:py-20 border-b border-gray-150 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,111,97,0.03)_0,transparent_100%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.35em] text-[#1E3A8A] uppercase block mb-3">
            {activeCategoryDoc ? 'Category Collection' : 'Atelier Couture'}
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#0F172A]">
            {activeCategoryDoc ? activeCategoryDoc.name : searchQuery ? `Search Results for "${searchQuery}"` : 'All Collections'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-3 max-w-xl mx-auto leading-relaxed">
            {activeCategoryDoc?.description ||
              'Explore hand-crafted tailoring blending heritage loom traditions with sharp minimalist silhouettes.'}
          </p>
        </div>
      </section>

      {/* Main Filter & Catalog Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        
        {/* Controls Bar: Search, Mobile Filter Toggle, Sort Selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-8">
          
          {/* Search Box & Mobile Filter Trigger */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by keyword, style or fabric..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 focus:border-[#1E3A8A] text-xs font-sans text-[#0F172A] font-semibold rounded-sm outline-none placeholder-[#64748B] transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#0F172A] p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button using Warm Coral accent */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-xs font-sans font-bold tracking-wider rounded-sm shrink-0 shadow-xs"
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
            <span className="font-sans text-xs text-zinc-400 font-semibold tracking-wider">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'PIECE' : 'PIECES'}
            </span>

            <div className="flex items-center gap-2">
              <label className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">
                Sort:
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-gray-200 px-3.5 py-2 pr-8 text-xs font-sans font-bold text-[#0F172A] rounded-sm outline-none focus:border-[#1E3A8A] cursor-pointer shadow-xs"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1E3A8A] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-gray-50 p-3 rounded-sm border border-gray-200">
            <span className="font-sans text-[11px] font-bold text-zinc-500 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {selectedCategorySlug !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E3A8A] text-white text-xs font-sans font-medium rounded-sm">
                <span>Category: {activeCategoryDoc ? activeCategoryDoc.name : selectedCategorySlug}</span>
                <button onClick={() => handleCategorySelect('all')} className="hover:text-red-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSize !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E3A8A] text-white text-xs font-sans font-medium rounded-sm">
                <span>Size: {selectedSize}</span>
                <button onClick={() => handleSizeSelect(selectedSize)} className="hover:text-red-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E3A8A] text-white text-xs font-sans font-medium rounded-sm">
                <span>Query: &quot;{searchQuery}&quot;</span>
                <button onClick={() => handleSearchChange('')} className="hover:text-red-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(priceRange.min > 0 || priceRange.max < 20000) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E3A8A] text-white text-xs font-sans font-medium rounded-sm">
                <span>Price: ₹{priceRange.min} - ₹{priceRange.max}</span>
                <button onClick={() => setPriceRange({ min: 0, max: 20000 })} className="hover:text-red-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[#1E3A8A] hover:underline ml-auto cursor-pointer"
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
            className={`md:w-64 shrink-0 font-sans space-y-8 ${
              isMobileFilterOpen
                ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
                : 'hidden md:block'
            }`}
          >
            {/* Mobile Close Header */}
            {isMobileFilterOpen && (
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 md:hidden">
                <h3 className="font-sans text-lg font-bold text-[#0F172A]">Filter Catalog</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-[#0F172A]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* 1. Category Filter List */}
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-[0.15em] border-b border-gray-150 pb-2">
                Categories
              </h4>
              <ul className="space-y-1.5 text-xs font-medium">
                <li>
                  <button
                    onClick={() => {
                      handleCategorySelect('all');
                      if (isMobileFilterOpen) setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-1.5 px-2.5 rounded-sm transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategorySlug === 'all'
                        ? 'bg-[#1E3A8A] text-white font-bold shadow-xs'
                        : 'text-[#0F172A] hover:bg-gray-100'
                    }`}
                  >
                    <span>All Products</span>
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
                        className={`w-full text-left py-1.5 px-2.5 rounded-sm transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E3A8A] text-white font-bold shadow-xs'
                            : 'text-[#0F172A] hover:bg-gray-100'
                        }`}
                      >
                        <span className="uppercase">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 2. Size Filter Selector */}
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-[0.15em] border-b border-gray-150 pb-2">
                Filter by Size
              </h4>
              <div className="grid grid-cols-4 gap-1.5">
                {SIZES.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => handleSizeSelect(sz)}
                      className={`py-2 text-xs font-sans font-bold border transition-all cursor-pointer rounded-sm ${
                        isSelected
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                          : 'bg-white text-[#0F172A] border-gray-200 hover:border-[#1E3A8A]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Price Filter Range */}
            <div className="space-y-3">
              <h4 className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-[0.15em] border-b border-gray-150 pb-2">
                Price Range (₹)
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-sans text-zinc-500">
                  <span>₹{priceRange.min}</span>
                  <span>₹{priceRange.max}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="500"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full accent-[#1E3A8A] cursor-pointer"
                />
              </div>
            </div>

            {/* Mobile Apply Button */}
            {isMobileFilterOpen && (
              <div className="pt-4 md:hidden">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#1E3A8A] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-sm shadow-md"
                >
                  Apply Filters ({filteredProducts.length} Results)
                </button>
              </div>
            )}
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-sm p-16 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-[#1E3A8A]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-sans text-xl font-bold text-[#0F172A]">No matching pieces found</h3>
                <p className="font-sans text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  We couldn&apos;t find any garments matching your applied filters. Try clearing your filters or search keywords to browse our full atelier.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-3 bg-[#1E3A8A] text-white border border-[#1E3A8A] hover:bg-[#1D4ED8] font-sans text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>

      </section>
    </div>
  );
}
