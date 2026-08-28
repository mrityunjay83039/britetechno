'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, User, Search, ChevronDown } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useCartStore, CartState, CartItem } from '@/store/useCartStore';
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
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const items = useHydratedStore<CartState, CartItem[]>(useCartStore, (state) => state.items) || [];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const totalItemCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xs transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 md:h-28 items-center justify-between gap-6">
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-[#222222] hover:bg-gray-100 hover:text-[#FF6F61] transition-all cursor-pointer"
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
            <Link href="/" className="flex items-center py-1 group" aria-label="BHAVATSYAM Home">
              <LogoImage width={280} height={70} />
            </Link>
          </div>

          {/* Desktop Navigation (Center) */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/products"
              className="group relative py-1 font-sans text-xs font-bold tracking-[0.22em] text-[#222222] hover:text-[#FF6F61] transition-colors uppercase"
            >
              COLLECTIONS
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6F61] transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* Shop by Category Dropdown Menu */}
            <div className="relative group/dropdown">
              <button className="flex items-center gap-1.5 py-1 font-sans text-xs font-bold tracking-[0.22em] text-[#222222] group-hover/dropdown:text-[#FF6F61] hover:text-[#FF6F61] transition-colors uppercase outline-none cursor-pointer">
                <span>SHOP BY CATEGORY</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#FF6F61] transition-transform duration-200 group-hover/dropdown:rotate-180" />
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF6F61] transition-all duration-300 group-hover/dropdown:w-full" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-sm shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-50 py-2">
                <Link
                  href="/products"
                  className="block px-4 py-2.5 font-sans text-[11px] font-bold tracking-wider text-[#FF6F61] hover:bg-[#FF6F61]/5 transition-all duration-200 uppercase border-b border-gray-100"
                >
                  All Categories
                </Link>
                {activeCategories.length > 0 ? (
                  activeCategories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/products?category=${cat.slug}`}
                      className="block px-4 py-2.5 font-sans text-[11px] font-semibold tracking-wider text-[#222222]/80 hover:text-[#FF6F61] hover:bg-gray-50 transition-all duration-200 uppercase"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-[11px] font-sans text-[#8C857B]">
                    No active categories
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Right Actions: Search, Account & Cart */}
          <div className="flex items-center justify-end gap-3 md:gap-6">
            {/* Expandable Search Input */}
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 md:w-52 px-3.5 py-1.5 bg-gray-50 border border-gray-200 focus:border-[#FF6F61] text-[#222222] text-xs font-sans outline-none rounded-sm transition-all duration-300 animate-in slide-in-from-right-4"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 text-[#8C857B] hover:text-[#FF6F61] p-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-full text-[#222222] hover:text-[#FF6F61] hover:bg-gray-50 transition-all cursor-pointer"
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
                  className="flex items-center gap-1.5 py-1.5 px-3 font-sans text-xs font-bold tracking-[0.15em] text-[#222222] hover:text-[#FF6F61] hover:border-[#FF6F61]/60 transition-all uppercase outline-none cursor-pointer border border-gray-200 rounded-sm"
                >
                  <span>Hi, {firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#FF6F61] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2.5 w-48 bg-white border border-gray-200 rounded-sm shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-[#222222]/80 hover:text-[#FF6F61] hover:bg-gray-50 transition-all duration-200 uppercase"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/account/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-[#222222]/80 hover:text-[#FF6F61] hover:bg-gray-50 transition-all duration-200 uppercase"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-[#222222]/80 hover:text-[#FF6F61] hover:bg-gray-50 transition-all duration-200 uppercase"
                      >
                        My Orders
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 font-sans text-[11px] font-bold tracking-wider text-[#FF6F61] hover:bg-[#FF6F61]/5 transition-all duration-200 uppercase border-t border-gray-100 mt-1"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="block w-full text-left px-4 py-2 font-sans text-[11px] font-semibold tracking-wider text-rose-500 hover:bg-rose-50/50 transition-all duration-200 uppercase border-t border-gray-100 mt-1 cursor-pointer"
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
                className="inline-flex items-center justify-center p-2 rounded-full text-[#222222] hover:text-[#FF6F61] hover:bg-gray-50 transition-all"
                aria-label="Account details"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center justify-center rounded-full p-2.5 text-[#222222] hover:bg-gray-50 transition-all duration-300 cursor-pointer"
              aria-label="Open Cart Drawer"
            >
              <ShoppingBag className="h-6 w-6 text-[#222222] group-hover:text-[#FF6F61] group-hover:scale-110 transition-all duration-300" />
              
              {/* Cart Item Badge */}
              {totalItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6F61] text-[10px] font-bold text-white ring-2 ring-white transition-transform duration-300 animate-in zoom-in">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-2xl border-b border-gray-200 py-6 px-6 space-y-5 animate-in slide-in-from-top-4 duration-300 overflow-y-auto max-h-[calc(100vh-5rem)] shadow-lg">
          {/* Mobile Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-4">
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 focus:border-[#FF6F61] text-[#222222] text-xs font-sans outline-none rounded-sm"
            />
            <button
              type="submit"
              className="absolute right-3 text-[#8C857B] hover:text-[#FF6F61] p-1 cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-sans text-sm font-bold tracking-[0.25em] text-[#222222] hover:text-[#FF6F61] transition-colors border-b border-gray-100 pb-3"
          >
            COLLECTIONS
          </Link>

          {/* Mobile Category list */}
          <div className="border-b border-gray-100 pb-3">
            <span className="block font-sans text-[10px] font-bold tracking-[0.2em] text-[#8C857B] mb-2 uppercase">
              SHOP BY CATEGORY
            </span>
            <div className="grid grid-cols-2 gap-2.5 pl-2">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-sans text-xs font-bold tracking-wider text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors uppercase col-span-2"
              >
                All Categories
              </Link>
              {activeCategories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-semibold tracking-wider text-[#222222]/80 hover:text-[#FF6F61] transition-colors uppercase"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile User Profile Section */}
          {session?.user ? (
            <div className="border-t border-gray-100 pt-4">
              <span className="block font-sans text-[10px] font-bold tracking-[0.2em] text-[#8C857B] mb-2 uppercase">
                Welcome, {displayName}
              </span>
              <div className="space-y-3.5 pl-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-bold tracking-wider text-[#222222] hover:text-[#FF6F61] transition-colors uppercase"
                >
                  Dashboard
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-bold tracking-wider text-[#222222] hover:text-[#FF6F61] transition-colors uppercase"
                >
                  My Profile
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-sans text-xs font-bold tracking-wider text-[#222222] hover:text-[#FF6F61] transition-colors uppercase"
                >
                  My Orders
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-sans text-xs font-bold tracking-wider text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors uppercase"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block text-left w-full font-sans text-xs font-bold tracking-wider text-rose-500 hover:text-rose-600 transition-colors uppercase cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-sans text-sm font-bold tracking-[0.25em] text-[#FF6F61] hover:text-[#FF6F61]/80 transition-colors pt-1 uppercase"
            >
              ACCOUNT & ORDERS
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
