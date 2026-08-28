import React from 'react';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import FooterLogo from '@/components/FooterLogo';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSystemSettings } from '@/app/actions/admin';
import { Category } from '@/models/Category';
import MaintenanceMode from '@/components/MaintenanceMode';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import Link from 'next/link';
import { Globe, Mail } from 'lucide-react';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSystemSettings();

  // Fetch active categories for dynamic storefront menu
  let categories = [];
  try {
    const rawCategories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    categories = JSON.parse(JSON.stringify(rawCategories));
  } catch (err) {
    console.error('Failed to fetch active categories for storefront layout:', err);
  }

  let session = null;
  let userName = '';
  try {
    session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await dbConnect();
      const dbUser = await User.findById(session.user.id).select('name').lean();
      if (dbUser) {
        userName = dbUser.name;
      } else {
        userName = session.user.name || '';
      }
    }
  } catch (error) {
    console.warn('NextAuth session decryption bypassed due to stale browser cookie:', error);
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  // If maintenance mode is enabled and user is NOT an admin, block access
  if (settings?.isMaintenanceModeEnabled && !isAdmin) {
    return <MaintenanceMode />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Floating banner for maintenance mode admin bypass */}
      {settings?.isMaintenanceModeEnabled && isAdmin && (
        <div className="sticky top-0 z-50 bg-[#FF6F61] text-white font-sans text-[10px] sm:text-xs font-bold tracking-widest text-center py-2 px-4 uppercase flex items-center justify-center gap-2 select-none shadow-md animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
          <span>Maintenance Mode Active - Admin View</span>
        </div>
      )}

      <Header categories={categories} session={session} userName={userName} />
      <main className="flex-1">
        {children}
      </main>
      <CartDrawer />

      {/* Expanded Premium Footer (Bright, Airy, and Spacious) */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-12 text-[#222222]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-gray-100">
            {/* Column 1: Brand */}
            <div className="space-y-6">
              <FooterLogo width={200} height={50} />
              <p className="font-sans text-xs text-zinc-600 leading-relaxed max-w-xs">
                A perfect blend of heritage and modernity. We create premium, hand-tailored garments built to transcend trends.
              </p>
              {/* Social Media Icons */}
              <div className="flex items-center gap-4.5 pt-2">
                {/* Custom Inline Instagram SVG */}
                <a
                  href="https://www.instagram.com/bhavatsyam/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-zinc-500 hover:text-[#FF6F61] hover:border-[#FF6F61] transition-all duration-300 group"
                  aria-label="Instagram Profile"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:scale-110"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                {/* Custom Inline Facebook SVG */}
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-zinc-500 hover:text-[#FF6F61] hover:border-[#FF6F61] transition-all duration-300 group"
                  aria-label="Facebook Page"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:scale-110"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://www.flipkart.com/clothing-and-accessories/coords/bhavatsyam~brand/pr?sid=clo,l1l&marketplace=FLIPKART"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-zinc-500 hover:text-[#FF6F61] hover:border-[#FF6F61] transition-all duration-300 group"
                  aria-label="Flipkart Brand Store"
                >
                  <Globe className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              </div>
            </div>

            {/* Column 2: Shop */}
            <div className="space-y-5">
              <h4 className="font-sans text-xs font-bold tracking-[0.2em] text-[#FF6F61] uppercase">
                Shop Collections
              </h4>
              <ul className="space-y-2.5 font-sans text-xs text-zinc-600">
                <li>
                  <Link href="/products" className="hover:text-[#FF6F61] transition-colors uppercase">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=co-ord-sets" className="hover:text-[#FF6F61] transition-colors uppercase">
                    Co-ord Sets
                  </Link>
                </li>
                <li>
                  <Link href="/products?sort=newest" className="hover:text-[#FF6F61] transition-colors uppercase">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div className="space-y-5">
              <h4 className="font-sans text-xs font-bold tracking-[0.2em] text-[#FF6F61] uppercase">
                Customer Care
              </h4>
              <ul className="space-y-2.5 font-sans text-xs text-zinc-600">
                <li>
                  <Link href="/about" className="hover:text-[#FF6F61] transition-colors uppercase">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#FF6F61] transition-colors uppercase">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-[#FF6F61] transition-colors uppercase">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-returns" className="hover:text-[#FF6F61] transition-colors uppercase">
                    Shipping & Returns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Contact */}
            <div className="space-y-5">
              <h4 className="font-sans text-xs font-bold tracking-[0.2em] text-[#FF6F61] uppercase">
                Legal & Atelier
              </h4>
              <ul className="space-y-2.5 font-sans text-xs text-zinc-600">
                <li>
                  <Link href="/privacy-policy" className="hover:text-[#FF6F61] transition-colors uppercase">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="hover:text-[#FF6F61] transition-colors uppercase">
                    Terms & Conditions
                  </Link>
                </li>
                <li className="pt-2 border-t border-gray-100 flex flex-col gap-1 text-[11px] font-sans">
                  <span className="text-zinc-500 uppercase tracking-wider font-semibold">Atelier Inquiries:</span>
                  <a href="mailto:info@bhavatsyam.com" className="text-[#FF6F61] hover:underline flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>info@bhavatsyam.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
            <div className="font-sans text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} BHAVATSYAM. All Rights Reserved.
            </div>
            <div className="flex gap-6 font-sans text-[10px] text-zinc-500 tracking-wider uppercase">
              <Link href="/privacy-policy" className="hover:text-[#FF6F61] transition-colors">PRIVACY POLICY</Link>
              <Link href="/terms-conditions" className="hover:text-[#FF6F61] transition-colors">TERMS OF SERVICE</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
