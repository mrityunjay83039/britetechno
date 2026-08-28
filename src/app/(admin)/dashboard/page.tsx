import React from 'react';
import dbConnect from '@/lib/db';
import { QuoteRequest } from '@/models/QuoteRequest';
import { Product } from '@/models/Product';
import { FileText, Clock, Boxes } from 'lucide-react';
import { getSystemSettings } from '@/app/actions/admin';
import MaintenanceToggle from '@/components/MaintenanceToggle';

export const revalidate = 0; // force dynamic rendering

export default async function DashboardPage() {
  await dbConnect();

  // Fetch metrics
  const quotes = await QuoteRequest.find({});
  const totalQuoteRequests = quotes.length;
  const pendingQuotesCount = quotes.filter((q) => q.status === 'Pending Review').length;

  // Count active products
  const totalActiveProducts = await Product.countDocuments({ isPublished: true });

  // Fetch current system settings for maintenance mode
  const settings = await getSystemSettings();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#0F0F11] tracking-wide">
          Dashboard Overview
        </h2>
        <p className="font-sans text-xs text-[#8C857B] mt-1 uppercase tracking-widest font-semibold">
          High-level statistics of BRITE Techno Lighting catalog and quote pipeline
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Quote Requests */}
        <div className="bg-white p-6 rounded-sm border border-[#C5A880]/15 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-[#8C857B] uppercase tracking-wider">
              Total Quote Requests
            </p>
            <p className="font-sans text-3xl font-bold text-[#0F0F11]">
              {totalQuoteRequests}
            </p>
            <p className="text-[10px] text-[#8C857B] font-sans">
              All submitted B2B requests
            </p>
          </div>
          <div className="w-12 h-12 rounded-sm bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-6 rounded-sm border border-[#C5A880]/15 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-[#8C857B] uppercase tracking-wider">
              Pending Review
            </p>
            <p className="font-sans text-3xl font-bold text-[#0F0F11]">
              {pendingQuotesCount}
            </p>
            <p className="text-[10px] text-amber-600 font-sans font-medium">
              Requires sales response
            </p>
          </div>
          <div className="w-12 h-12 rounded-sm bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-6 rounded-sm border border-[#C5A880]/15 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-[#8C857B] uppercase tracking-wider">
              Active Products
            </p>
            <p className="font-sans text-3xl font-bold text-[#0F0F11]">
              {totalActiveProducts}
            </p>
            <p className="text-[10px] text-[#8C857B] font-sans">
              Published on storefront
            </p>
          </div>
          <div className="w-12 h-12 rounded-sm bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880]">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Maintenance Mode Administration Section */}
      <div className="space-y-4">
        <div className="border-b border-[#C5A880]/15 pb-2">
          <h3 className="font-serif text-xl font-bold text-[#0F0F11]">System Configuration</h3>
          <p className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider font-semibold">Configure global platform-wide constraints</p>
        </div>
        <MaintenanceToggle initialEnabled={settings.isMaintenanceModeEnabled} />
      </div>

      {/* Admin Quick Tips Card */}
      <div className="bg-white p-8 rounded-sm border border-[#C5A880]/15 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#0F0F11] mb-2">
          BRITE Techno Lighting B2B Platform
        </h3>
        <p className="font-sans text-sm text-[#8C857B] leading-relaxed max-w-3xl">
          Welcome back to the BRITE Techno Lighting administration portal. Here, you can manage industrial and commercial lighting products, inspect quote requests from contractors and enterprise clients, and respond to sales inquiries.
        </p>
      </div>
    </div>
  );
}
