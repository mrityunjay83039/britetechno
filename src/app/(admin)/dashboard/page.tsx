import React from 'react';
import dbConnect from '@/lib/db';
import { QuoteRequest } from '@/models/QuoteRequest';
import { Product } from '@/models/Product';
import { FileText, Clock, Boxes } from 'lucide-react';
import { getSystemSettings } from '@/app/actions/admin';
import MaintenanceToggle from '@/components/MaintenanceToggle';

import mongoose from 'mongoose';

export const revalidate = 0; // force dynamic rendering

export default async function DashboardPage() {
  let quotes: unknown[] = [];
  let totalActiveProducts = 0;
  let settings = { isMaintenanceModeEnabled: false };

  try {
    await dbConnect();
    if (mongoose.connection.readyState === 1) {
      quotes = await QuoteRequest.find({});
      totalActiveProducts = await Product.countDocuments({ isPublished: true });
      settings = await getSystemSettings();
    }
  } catch (err) {
    console.warn('Database connection or query failed in DashboardPage:', err);
  }

  const totalQuoteRequests = quotes.length;
  const pendingQuotesCount = (quotes as Array<{ status?: string }>).filter((q) => q.status === 'Pending Review').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="font-sans text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
          High-level statistics of BRITE Techno Lighting catalog and quote pipeline
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Quote Requests */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Quote Requests
            </p>
            <p className="font-sans text-3xl font-extrabold text-slate-900">
              {totalQuoteRequests}
            </p>
            <p className="text-xs text-slate-500 font-sans font-medium">
              All submitted B2B requests
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#0066B4]/10 border border-[#0066B4]/20 flex items-center justify-center text-[#0066B4]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Review
            </p>
            <p className="font-sans text-3xl font-extrabold text-slate-900">
              {pendingQuotesCount}
            </p>
            <p className="text-xs text-amber-700 font-sans font-semibold">
              Requires sales response
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Products
            </p>
            <p className="font-sans text-3xl font-extrabold text-slate-900">
              {totalActiveProducts}
            </p>
            <p className="text-xs text-slate-500 font-sans font-medium">
              Published on storefront
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Maintenance Mode Administration Section */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="font-sans text-lg font-bold text-slate-900">System Configuration</h3>
          <p className="font-sans text-xs text-slate-500 font-medium">Configure global platform-wide constraints</p>
        </div>
        <MaintenanceToggle initialEnabled={settings.isMaintenanceModeEnabled} />
      </div>

      {/* Admin Quick Tips Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-sans text-lg font-bold text-slate-900 mb-2">
          BRITE Techno Lighting B2B Platform
        </h3>
        <p className="font-sans text-sm text-slate-600 leading-relaxed max-w-3xl font-medium">
          Welcome back to the BRITE Techno Lighting administration portal. Here, you can manage industrial and commercial lighting products, inspect quote requests from contractors and enterprise clients, and respond to sales inquiries.
        </p>
      </div>
    </div>
  );
}
