import React from 'react';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { Landmark, ShoppingBag, Boxes } from 'lucide-react';
import { getSystemSettings } from '@/app/actions/admin';
import MaintenanceToggle from '@/components/MaintenanceToggle';

export const revalidate = 0; // force dynamic rendering

export default async function DashboardPage() {
  await dbConnect();

  // Fetch metrics
  const orders = await Order.find({});
  const totalOrders = orders.length;

  // Calculate total revenue from PAID orders
  const paidOrders = orders.filter((order) => order.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  // Alternatively, count total revenue across all orders if none are PAID yet
  const totalRevenueAll = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const revenueToDisplay = totalRevenue > 0 ? totalRevenue : totalRevenueAll;

  // Count active products
  const totalActiveProducts = await Product.countDocuments({ isPublished: true });

  // Fetch current system settings for maintenance mode
  const settings = await getSystemSettings();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="font-sans text-3xl font-bold text-[#1E3A8A] tracking-wide">
          Dashboard Overview
        </h2>
        <p className="font-sans text-xs text-[#64748B] mt-1 uppercase tracking-widest font-semibold">
          High-level statistics of your storefront
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-sm border border-[#1E3A8A]/15 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="font-sans text-3xl font-bold text-[#1E3A8A]">
              {formatCurrency(revenueToDisplay)}
            </p>
            {totalRevenue > 0 ? (
              <p className="text-[10px] text-green-600 font-sans font-medium">
                Calculated from PAID orders
              </p>
            ) : (
              <p className="text-[10px] text-[#64748B] font-sans">
                No orders marked as PAID yet
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-sm bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-sm border border-[#1E3A8A]/15 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Total Orders
            </p>
            <p className="font-sans text-3xl font-bold text-[#1E3A8A]">
              {totalOrders}
            </p>
            <p className="text-[10px] text-[#64748B] font-sans">
              All processed orders
            </p>
          </div>
          <div className="w-12 h-12 rounded-sm bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-6 rounded-sm border border-[#1E3A8A]/15 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-sans text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Active Products
            </p>
            <p className="font-sans text-3xl font-bold text-[#1E3A8A]">
              {totalActiveProducts}
            </p>
            <p className="text-[10px] text-[#64748B] font-sans">
              Published on storefront
            </p>
          </div>
          <div className="w-12 h-12 rounded-sm bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Maintenance Mode Administration Section */}
      <div className="space-y-4">
        <div className="border-b border-[#1E3A8A]/15 pb-2">
          <h3 className="font-sans text-xl font-bold text-[#1E3A8A]">System Configuration</h3>
          <p className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Configure global platform-wide constraints</p>
        </div>
        <MaintenanceToggle initialEnabled={settings.isMaintenanceModeEnabled} />
      </div>

      {/* Admin Quick Tips Card */}
      <div className="bg-white p-8 rounded-sm border border-[#1E3A8A]/15 shadow-xs">
        <h3 className="font-sans text-lg font-bold text-[#1E3A8A] mb-2">
          A Blend of Heritage & Modernity
        </h3>
        <p className="font-sans text-sm text-[#64748B] leading-relaxed max-w-3xl">
          Welcome back to the BHAVATSYAM single-seller dashboard. Here, you can monitor sales, keep your high-end inventory fresh, and manage order deliveries. Our aesthetic focuses on premium, artisanal apparel, and this management system allows you to maintain that high standard effortlessly.
        </p>
      </div>
    </div>
  );
}
