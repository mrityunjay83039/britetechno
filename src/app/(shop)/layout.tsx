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
import { Mail } from 'lucide-react';

import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  let isConnected = false;
  try {
    await dbConnect();
    isConnected = mongoose.connection.readyState === 1;
  } catch (dbErr) {
    console.warn('Database connection unavailable in ShopLayout:', dbErr);
  }

  let settings = { isMaintenanceModeEnabled: false };
  let categories: Array<{ _id: string; name: string; slug: string; isActive: boolean }> = [];
  let session = null;
  let userName = '';

  if (isConnected) {
    try {
      const [settingsRes, rawCategoriesRes, sessionRes] = await Promise.all([
        getSystemSettings().catch(() => ({ isMaintenanceModeEnabled: false })),
        Category.find({ isActive: true }).select('name slug isActive').sort({ name: 1 }).lean().catch(() => []),
        getServerSession(authOptions).catch(() => null),
      ]);

      settings = settingsRes;
      categories = JSON.parse(JSON.stringify(rawCategoriesRes));
      session = sessionRes;

      if (session?.user?.id) {
        const dbUser = await User.findById(session.user.id).select('name').lean();
        userName = dbUser ? dbUser.name : (session.user.name || '');
      }
    } catch (err) {
      console.warn('Error fetching layout data:', err);
    }
  } else {
    try {
      session = await getServerSession(authOptions);
    } catch {
      // ignore
    }
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  // If maintenance mode is enabled and user is NOT an admin, block access
  if (settings?.isMaintenanceModeEnabled && !isAdmin) {
    return <MaintenanceMode />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      {/* Floating banner for maintenance mode admin bypass */}
      {settings?.isMaintenanceModeEnabled && isAdmin && (
        <div className="sticky top-0 z-50 bg-[#0066B4] text-white font-sans text-[10px] sm:text-xs font-bold tracking-widest text-center py-2 px-4 uppercase flex items-center justify-center gap-2 select-none shadow-md animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
          <span>Maintenance Mode Active - Admin View</span>
        </div>
      )}

      <Header categories={categories} session={session} userName={userName} />
      <main className="flex-1">
        {children}
      </main>
      <CartDrawer />

      {/* Expanded Premium Footer (BRITE Techno Lighting Inc.) */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-12 text-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
            {/* Column 1: Brand & Mission */}
            <div className="space-y-4">
              <FooterLogo width={220} height={55} />
              <p className="font-sans text-xs text-slate-400 leading-relaxed max-w-xs">
                BRITE Techno Lighting Inc. is a family-owned business providing lighting equipment across Canada and the United States. We guarantee customer satisfaction through product quality and unbeatable prices.
              </p>
              <span className="inline-block text-[10px] font-bold tracking-widest text-[#0066B4] uppercase bg-[#0066B4]/10 px-2.5 py-1 rounded border border-[#0066B4]/20">
                Canada & US Provider
              </span>
            </div>

            {/* Column 2: Lighting Catalog */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold tracking-[0.2em] text-[#0066B4] uppercase">
                Lighting Solutions
              </h4>
              <ul className="space-y-2.5 font-sans text-xs text-slate-300">
                <li>
                  <Link href="/products" className="hover:text-[#0066B4] transition-colors uppercase">
                    All Lighting Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-[#0066B4] transition-colors uppercase">
                    Industrial LED Fixtures
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-[#0066B4] transition-colors uppercase">
                    Home & Office Lighting
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-[#0066B4] transition-colors uppercase">
                    Original & Imported Fixtures
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Headquarters & Showroom */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold tracking-[0.2em] text-[#0066B4] uppercase">
                Showroom & Location
              </h4>
              <div className="space-y-2 font-sans text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white">BRITE Techno Lighting Inc.</p>
                <p>6068 Boul. Metropolitain E.</p>
                <p>Saint-Leonard, Quebec, H1S 1A9</p>
                <p className="font-semibold text-slate-400">CANADA</p>
              </div>
            </div>

            {/* Column 4: Contact & Legal */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold tracking-[0.2em] text-[#0066B4] uppercase">
                Sales & Quotes
              </h4>
              <ul className="space-y-2.5 font-sans text-xs text-slate-300">
                <li>
                  <Link href="/contact" className="hover:text-[#0066B4] transition-colors uppercase">
                    Contact Sales
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-[#0066B4] transition-colors uppercase">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="hover:text-[#0066B4] transition-colors uppercase">
                    Terms & Conditions
                  </Link>
                </li>
                <li className="pt-2 border-t border-slate-800 flex flex-col gap-1 text-[11px] font-sans">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Quote Inquiries:</span>
                  <a href="mailto:info@britetechno.com" className="text-[#0066B4] hover:underline flex items-center gap-1.5 mt-0.5 font-semibold">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-[#0066B4]" />
                    <span>info@britetechno.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
            <div className="font-sans text-xs text-slate-400">
              &copy; {new Date().getFullYear()} BRITE Techno Lighting Inc. All Rights Reserved.
            </div>
            <div className="flex gap-6 font-sans text-[10px] text-slate-400 tracking-wider uppercase">
              <Link href="/privacy-policy" className="hover:text-[#0066B4] transition-colors">PRIVACY POLICY</Link>
              <Link href="/terms-conditions" className="hover:text-[#0066B4] transition-colors">TERMS OF SERVICE</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
