'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import {
  ShieldCheck,
  Zap,
  Award,
  MapPin,
  FileText,
  Search,
  CheckCircle2,
  Mail,
  ArrowRight,
  Building,
  Warehouse,
  Car,
  Sparkles,
} from 'lucide-react';

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

interface IndustrialB2BHomepageProps {
  products: SerializedProduct[];
}

// Applications Data Grid
const APPLICATIONS = [
  {
    title: 'Warehouses & Logistics',
    description: 'High ceiling LED UFO & Linear High Bays built for high-lumen, 24/7 durability.',
    icon: Warehouse,
    category: 'High Bay Lighting',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Parking Lots & Perimeters',
    description: 'Rugged IP65 Shoebox Area Lights and Wall Packs with photocell sensors.',
    icon: Car,
    category: 'Outdoor Lights',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Commercial Office & Retail',
    description: 'Low-glare 2x2 / 2x4 LED Backlit Troffers and architectural Flat Panels.',
    icon: Building,
    category: 'Indoor Lights',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Gas Stations & Canopies',
    description: 'Vapor-tight canopy lights engineered for extreme weather & washdown zones.',
    icon: Zap,
    category: 'Outdoor Lights',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800',
  },
];

export default function IndustrialB2BHomepage({ products }: IndustrialB2BHomepageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique category names
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))].slice(0, 8);

  // Filter products and limit to featured 8 products for homepage
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = filteredProducts.slice(0, 8);

  return (
    <div className="flex flex-col bg-slate-50 text-slate-900 min-h-screen">
      
      {/* 1. TOP ANNOUNCEMENT / CREDIBILITY BANNER */}
      <div className="bg-slate-950 text-slate-200 py-2.5 px-4 text-xs font-sans border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#0066B4] animate-pulse" />
            <span className="font-semibold text-slate-100">
              BRITE Techno Lighting Inc. — Family-Owned Enterprise Provider Across Canada & US
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="hidden md:inline">Showroom: 6068 Boul. Metropolitain E., Saint-Leonard, QC</span>
            <a href="mailto:info@britetechno.com" className="text-[#0066B4] hover:underline font-bold flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#0066B4]" />
              <span>info@britetechno.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION: ENTERPRISE B2B INDUSTRIAL LIGHTING */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        {/* Ambient Background Lighting Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,102,180,0.25),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-900/90 via-slate-900/60 to-transparent z-10 pointer-events-none" />
        
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000')` }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0066B4]/20 border border-[#0066B4]/40 text-blue-300 text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#0066B4]" />
                Original & Imported Industrial Equipment
              </div>

              <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                High-Efficiency LED Lighting Solutions <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-[#0066B4] to-blue-200">
                  For Commercial & Industrial Facilities
                </span>
              </h1>

              <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                We guarantee customer satisfaction through superior build quality, DLC Premium / cULus certifications, and unbeatable direct B2B quote pricing across Canada & the United States.
              </p>

              {/* Interactive Search & Filter Bar */}
              <div className="pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('catalog-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl"
                >
                  <div className="relative w-full flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Search fixtures by wattage, lumens, or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/90 text-white placeholder-slate-400 text-xs font-sans rounded-lg outline-none border border-slate-700 focus:border-[#0066B4]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#0066B4] hover:bg-[#005293] text-white px-6 py-3 rounded-lg font-sans text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shrink-0 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Search Catalog
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Key Quick Stats */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-xl">
                <div>
                  <span className="block font-sans text-2xl font-extrabold text-white">141+</span>
                  <span className="font-sans text-[11px] text-slate-400 uppercase tracking-wider">Fixtures in Stock</span>
                </div>
                <div>
                  <span className="block font-sans text-2xl font-extrabold text-blue-400">44</span>
                  <span className="font-sans text-[11px] text-slate-400 uppercase tracking-wider">Product Categories</span>
                </div>
                <div>
                  <span className="block font-sans text-2xl font-extrabold text-white">100%</span>
                  <span className="font-sans text-[11px] text-slate-400 uppercase tracking-wider">Price Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Right Hero Card: Quick B2B Quote Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="font-sans text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                      Fast Quotation Routing
                    </span>
                    <h3 className="font-sans text-lg font-bold text-white">Request a Bulk Quote</h3>
                  </div>
                  <FileText className="w-8 h-8 text-[#0066B4]" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0066B4] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-100 uppercase">Browse & Add to Quote</h4>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Select high bay, troffer, or outdoor fixtures directly into your quote list.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0066B4] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-100 uppercase">Specify Quantities & Voltage</h4>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Custom voltage (120-347V), wattage options, and CCT selections available.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0066B4] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-100 uppercase">Receive Dedicated Pricing</h4>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Our technical sales engineers review and email official quotes within 24 hours.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/products"
                    className="block w-full bg-[#0066B4] hover:bg-[#005293] text-white text-center font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-lg shadow-sm transition-all"
                  >
                    EXPLORE ALL FIXTURES &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITIONS & SHOWROOM BADGES */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="p-3 bg-blue-500/10 text-[#0066B4] rounded-lg shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Family-Owned Business
                </h4>
                <p className="font-sans text-xs text-slate-600 mt-1 leading-relaxed">
                  Dedicated customer service across Canada & the United States.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="p-3 bg-blue-500/10 text-[#0066B4] rounded-lg shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Unbeatable Prices
                </h4>
                <p className="font-sans text-xs text-slate-600 mt-1 leading-relaxed">
                  Factory-direct original & imported lighting equipment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="p-3 bg-blue-500/10 text-[#0066B4] rounded-lg shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider">
                  UL / cULus / DLC Certified
                </h4>
                <p className="font-sans text-xs text-slate-600 mt-1 leading-relaxed">
                  Engineered for commercial compliance & energy rebates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="p-3 bg-blue-500/10 text-[#0066B4] rounded-lg shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quebec Showroom
                </h4>
                <p className="font-sans text-xs text-slate-600 mt-1 leading-relaxed">
                  6068 Boul. Metropolitain E., Saint-Leonard, QC H1S 1A9.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SHOP BY APPLICATION (INDUSTRY SECTORS) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="font-sans text-xs font-bold tracking-[0.25em] text-[#0066B4] uppercase">
              Engineered Solutions
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Shop Lighting By Application
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-600">
              Tailored lighting fixtures designed for specific environmental requirements and architectural layouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {APPLICATIONS.map((app, idx) => {
              const IconComp = app.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(app.category);
                    const el = document.getElementById('catalog-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                    <Image
                      src={app.image}
                      alt={app.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-xs text-slate-900 rounded-lg shadow-sm">
                      <IconComp className="w-5 h-5 text-[#0066B4]" />
                    </div>
                  </div>

                  <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans text-base font-bold text-slate-900 group-hover:text-[#0066B4] transition-colors">
                        {app.title}
                      </h3>
                      <p className="font-sans text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#0066B4] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      <span>View Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FEATURED TECHNICAL CATALOG & PRODUCT GRID (LIMITED TO FEATURED 8 ITEMS) */}
      <section id="catalog-grid" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8 mb-10">
          <div>
            <span className="font-sans text-xs font-bold tracking-[0.2em] text-[#0066B4] uppercase block mb-1.5">
              Featured Lighting Equipment
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Commercial & Industrial Highlights
            </h2>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Filter featured fixtures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] text-slate-900 text-xs font-sans rounded-lg outline-none shadow-xs transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-slate-100 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0066B4] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {featuredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-sans text-lg font-bold text-slate-800">No Lighting Fixtures Found</h3>
            <p className="font-sans text-xs text-slate-500 max-w-sm mx-auto">
              No products match your current search or category filter. Try clearing your search parameters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="inline-block bg-[#0066B4] text-white px-6 py-2.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#005293] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* PROMINENT VIEW MORE PRODUCTS BUTTON */}
            <div className="text-center pt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#0066B4] hover:bg-[#005293] text-white font-sans text-xs font-extrabold uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <span>View All 141+ Catalog Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 6. SHOWROOM & HEADQUARTERS LOCATION BANNER */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="font-sans text-xs font-bold tracking-[0.25em] text-[#0066B4] uppercase block">
                Quebec Showroom & Distribution Center
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-white">
                Visit Us in Saint-Leonard, Quebec
              </h2>
              <p className="font-sans text-sm text-slate-300 leading-relaxed max-w-xl">
                Come see our vast selection of original and imported light fixtures in person. Our technical sales team is on-site to assist with project spec reviews and commercial volume quotes.
              </p>
              <address className="font-sans text-xs text-blue-300 not-italic font-semibold tracking-wide block">
                6068 Boul. Metropolitain E., Saint-Leonard, Quebec, H1S 1A9, CANADA
              </address>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <Link
                href="/contact"
                className="w-full bg-[#0066B4] hover:bg-[#005293] text-white font-sans text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xl text-center shadow-lg transition-all"
              >
                Schedule Showroom Visit
              </Link>
              <a
                href="mailto:info@britetechno.com"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xl text-center border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#0066B4]" />
                Email Sales Engineers
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
