'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Menu, X, User, Search, ChevronDown, ArrowRight, Lightbulb } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useQuoteListStore, QuoteListState, QuoteListItem } from '@/store/useQuoteListStore';
import { useHydratedStore } from '@/hooks/useHydratedStore';
import LogoImage from '@/components/LogoImage';

export interface HeaderProps {
  categories?: Array<{
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }>;
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
      id?: string | null;
    };
  } | null;
  userName?: string;
}

export default function Header({ categories = [], session, userName }: HeaderProps) {
  const router = useRouter();
  const setIsOpen = useQuoteListStore((state) => state.setIsOpen);
  const items = useHydratedStore<QuoteListState, QuoteListItem[]>(useQuoteListStore, (state) => state.items) || [];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const totalItemCount = items.reduce((sum: number, item: QuoteListItem) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const activeCategories = categories.filter((cat) => cat.isActive);
  const displayName = userName || session?.user?.name || 'User';
  const firstName = displayName.split(' ')[0];

  // Group categories for Mega Menu columns
  const indoorCategories = activeCategories.filter(
    (c) =>
      c.name.toLowerCase().includes('indoor') ||
      c.name.toLowerCase().includes('high bay') ||
      c.name.toLowerCase().includes('linear') ||
      c.name.toLowerCase().includes('troffer') ||
      c.name.toLowerCase().includes('office') ||
      c.name.toLowerCase().includes('bulb') ||
      c.name.toLowerCase().includes('cabinet')
  );

  const outdoorCategories = activeCategories.filter(
    (c) =>
      c.name.toLowerCase().includes('outdoor') ||
      c.name.toLowerCase().includes('parking') ||
      c.name.toLowerCase().includes('flood') ||
      c.name.toLowerCase().includes('wall') ||
      c.name.toLowerCase().includes('pole') ||
      c.name.toLowerCase().includes('vapor')
  );

  const specialtyCategories = activeCategories.filter(
    (c) =>
      !indoorCategories.includes(c) && !outdoorCategories.includes(c)
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800 shadow-md transition-all duration-300 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 md:h-24 items-center justify-between gap-6">
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-slate-800 hover:text-[#0066B4] transition-all cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Prominent Left Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center py-1 group" aria-label="BRITE TECHNO Home">
              <LogoImage width={240} height={60} />
            </Link>
          </div>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="group relative py-1 font-sans text-xs font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] transition-colors uppercase"
            >
              HOME
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#0066B4] transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* SHOP WITH MEGA MENU DROPDOWN */}
            <div className="relative group/megamenu">
              <Link
                href="/products"
                className="flex items-center gap-1 py-1 font-sans text-xs font-bold tracking-[0.15em] text-slate-200 group-hover/megamenu:text-[#0066B4] hover:text-[#0066B4] transition-colors uppercase cursor-pointer"
              >
                <span>SHOP</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#0066B4] transition-transform duration-200 group-hover/megamenu:rotate-180" />
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#0066B4] transition-all duration-300 group-hover/megamenu:w-full" />
              </Link>

              {/* MEGA MENU CONTAINER */}
              <div className="absolute -left-12 mt-2 w-[780px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover/megamenu:opacity-100 group-hover/megamenu:visible transition-all duration-300 z-50 p-6 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-4 gap-6">
                  
                  {/* Column 1: Indoor Lighting */}
                  <div>
                    <h4 className="font-sans text-[11px] font-extrabold tracking-wider text-[#0066B4] uppercase mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[#0066B4]" />
                      Indoor Lighting
                    </h4>
                    <ul className="space-y-2 text-xs font-sans">
                      {indoorCategories.slice(0, 6).map((cat) => (
                        <li key={cat._id}>
                          <Link
                            href={`/products?category=${cat.slug}`}
                            className="text-slate-300 hover:text-white transition-colors block py-0.5"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                      {indoorCategories.length === 0 && (
                        <li>
                          <Link href="/products" className="text-slate-400 hover:text-white">
                            High Bay & Panels
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Column 2: Outdoor Lighting */}
                  <div>
                    <h4 className="font-sans text-[11px] font-extrabold tracking-wider text-[#0066B4] uppercase mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[#0066B4]" />
                      Outdoor Lighting
                    </h4>
                    <ul className="space-y-2 text-xs font-sans">
                      {outdoorCategories.slice(0, 6).map((cat) => (
                        <li key={cat._id}>
                          <Link
                            href={`/products?category=${cat.slug}`}
                            className="text-slate-300 hover:text-white transition-colors block py-0.5"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                      {outdoorCategories.length === 0 && (
                        <li>
                          <Link href="/products" className="text-slate-400 hover:text-white">
                            Parking & Wall Packs
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Column 3: Emergency & Accessories */}
                  <div>
                    <h4 className="font-sans text-[11px] font-extrabold tracking-wider text-[#0066B4] uppercase mb-3 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[#0066B4]" />
                      Specialty & Safety
                    </h4>
                    <ul className="space-y-2 text-xs font-sans">
                      {specialtyCategories.slice(0, 6).map((cat) => (
                        <li key={cat._id}>
                          <Link
                            href={`/products?category=${cat.slug}`}
                            className="text-slate-300 hover:text-white transition-colors block py-0.5"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                      {specialtyCategories.length === 0 && (
                        <li>
                          <Link href="/products" className="text-slate-400 hover:text-white">
                            Emergency & Accessories
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Column 4: Mega Menu Featured Banner */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold tracking-widest text-[#0066B4] uppercase block mb-1">
                        Complete Catalog
                      </span>
                      <h5 className="font-sans text-xs font-bold text-white mb-2">
                        141+ Original & Imported Fixtures
                      </h5>
                      <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                        Browse technical specifications, wattages, lumens, and request volume pricing.
                      </p>
                    </div>

                    <Link
                      href="/products"
                      className="mt-4 bg-[#0066B4] hover:bg-[#005293] text-white text-center py-2 px-3 rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Shop</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>

            <Link
              href="/about"
              className="group relative py-1 font-sans text-xs font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] transition-colors uppercase"
            >
              ABOUT US
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#0066B4] transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link
              href="/contact"
              className="group relative py-1 font-sans text-xs font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] transition-colors uppercase"
            >
              CONTACT
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#0066B4] transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Right Actions: Search, Account & Quote List */}
          <div className="flex items-center justify-end gap-3 md:gap-6">
            {/* Expandable Search Input */}
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 md:w-52 px-3.5 py-1.5 bg-slate-800 border border-slate-700 focus:border-[#0066B4] text-slate-100 text-xs font-sans outline-none rounded-sm transition-all duration-300"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 text-slate-400 hover:text-[#0066B4] p-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-full text-slate-200 hover:text-[#0066B4] hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Search items"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Dynamic User Profile */}
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-3 font-sans text-xs font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] hover:border-[#0066B4]/60 transition-all uppercase outline-none cursor-pointer border border-slate-700 rounded-sm"
                >
                  <span>Hi, {firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#0066B4] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2.5 w-48 bg-slate-800 border border-slate-700 rounded-sm shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-slate-300 hover:text-[#0066B4] hover:bg-slate-700 transition-all duration-200 uppercase"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/account/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-slate-300 hover:text-[#0066B4] hover:bg-slate-700 transition-all duration-200 uppercase"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-slate-300 hover:text-[#0066B4] hover:bg-slate-700 transition-all duration-200 uppercase"
                      >
                        Quote Requests
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 font-sans text-[11px] font-bold tracking-wider text-[#0066B4] hover:bg-slate-700 transition-all duration-200 uppercase border-t border-slate-700 mt-1"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="block w-full text-left px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-rose-400 hover:bg-slate-700 transition-all duration-200 uppercase border-t border-slate-700 mt-1 cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center p-2 rounded-full text-slate-200 hover:text-[#0066B4] hover:bg-slate-800 transition-all"
                aria-label="Account details"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Quote List Trigger */}
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center justify-center rounded-lg p-2.5 text-slate-200 hover:bg-slate-800 transition-all duration-300 cursor-pointer"
              aria-label="Open Quote List"
            >
              <FileText className="h-6 w-6 text-slate-200 group-hover:text-[#0066B4] group-hover:scale-110 transition-all duration-300" />
              
              {/* Quote Item Badge */}
              {totalItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0066B4] text-[10px] font-bold text-white ring-2 ring-slate-900 transition-transform duration-300 animate-in zoom-in">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 py-6 px-6 space-y-5 animate-in slide-in-from-top-4 duration-300 overflow-y-auto max-h-[calc(100vh-5rem)] shadow-lg">
          {/* Mobile Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-4">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 focus:border-[#0066B4] text-slate-100 text-xs font-sans outline-none rounded-sm"
            />
            <button
              type="submit"
              className="absolute right-3 text-slate-400 hover:text-[#0066B4] p-1 cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-sans text-sm font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] transition-colors border-b border-slate-800 pb-3 uppercase"
          >
            HOME
          </Link>

          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-sans text-sm font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] transition-colors border-b border-slate-800 pb-3 uppercase"
          >
            SHOP / CATALOG
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-sans text-sm font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] transition-colors border-b border-slate-800 pb-3 uppercase"
          >
            ABOUT US
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-sans text-sm font-bold tracking-[0.15em] text-slate-200 hover:text-[#0066B4] transition-colors border-b border-slate-800 pb-3 uppercase"
          >
            CONTACT
          </Link>

          {/* Mobile Category List */}
          <div className="border-b border-slate-800 pb-3">
            <span className="block font-sans text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-2 uppercase">
              CATEGORIES
            </span>
            <div className="grid grid-cols-2 gap-2.5 pl-2">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-sans text-xs font-bold tracking-wider text-[#0066B4] hover:text-[#005293] transition-colors uppercase col-span-2"
              >
                All Categories
              </Link>
              {activeCategories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-semibold tracking-wider text-slate-300 hover:text-[#0066B4] transition-colors uppercase"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile User Profile Section */}
          {session?.user ? (
            <div className="border-t border-slate-800 pt-4">
              <span className="block font-sans text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-2 uppercase">
                Welcome, {displayName}
              </span>
              <div className="space-y-3.5 pl-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-bold tracking-wider text-slate-200 hover:text-[#0066B4] transition-colors uppercase"
                >
                  Dashboard
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-bold tracking-wider text-slate-200 hover:text-[#0066B4] transition-colors uppercase"
                >
                  My Profile
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-bold tracking-wider text-slate-200 hover:text-[#0066B4] transition-colors uppercase"
                >
                  Quote Requests
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-sans text-xs font-bold tracking-wider text-[#0066B4] hover:text-[#005293] transition-colors uppercase"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block text-left w-full font-sans text-xs font-bold tracking-wider text-rose-400 hover:text-rose-300 transition-colors uppercase cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-sans text-sm font-bold tracking-[0.2em] text-[#0066B4] hover:text-[#005293] transition-colors pt-1 uppercase"
            >
              ACCOUNT & QUOTES
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
