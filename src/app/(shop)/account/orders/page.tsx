import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Package, FileText } from 'lucide-react';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/account/orders');
  }

  const { id: userId, role } = session.user;

  // Protect double authorization
  if (role !== 'BUYER' && role !== 'ADMIN') {
    redirect('/login');
  }

  await dbConnect();

  // Fetch all user's orders using .lean()
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div>
        <h2 className="font-sans text-2xl font-semibold text-[#1E3A8A] tracking-wide">
          Your Order History
        </h2>
        <p className="font-sans text-xs text-[#64748B] mt-1">
          View status and receipts of all your hand-crafted commissions.
        </p>
      </div>

      {/* Orders Listing */}
      {orders.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#1E3A8A]/15 rounded-sm p-12 text-center shadow-sm">
          <Package className="h-12 w-12 text-[#1E3A8A]/40 mx-auto mb-4" />
          <h3 className="font-sans text-lg font-medium text-[#1E3A8A]">No Orders Placed Yet</h3>
          <p className="font-sans text-xs text-[#64748B] max-w-xs mx-auto mt-2 leading-relaxed">
            When you commission our hand-crafted pieces, your complete order history will be displayed here.
          </p>
          <Link
            href="/products"
            className="inline-block mt-6 bg-[#1E3A8A] text-[#FFFFFF] font-sans text-xs font-bold tracking-widest uppercase border border-[#1E3A8A]/30 hover:bg-[#1E3A8A] hover:text-[#1E3A8A] px-6 py-3 transition-all duration-300 rounded-sm cursor-pointer"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id.toString()}
              className="bg-white border border-[#1E3A8A]/15 rounded-sm shadow-sm overflow-hidden"
            >
              {/* Order Top Bar / Summary */}
              <div className="bg-[#1E3A8A] text-[#FFFFFF] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1E3A8A]/15">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div>
                    <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider block">
                      Order Placed
                    </span>
                    <span className="font-sans text-xs text-[#FFFFFF] font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-[#1E3A8A]" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="sm:border-l sm:border-white/10 sm:pl-4">
                    <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider block">
                      Commission Reference
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1E3A8A] mt-0.5 block select-all">
                      #{order._id.toString().toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider block">
                    Total Amount Paid
                  </span>
                  <span className="font-sans text-base font-semibold text-[#1E3A8A] flex items-center sm:justify-end gap-0.5 mt-0.5">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Order Body / Items List */}
              <div className="p-6 divide-y divide-[#1E3A8A]/10">
                <div className="pb-6">
                  <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider font-bold block mb-4">
                    Items In Order
                  </span>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="font-sans text-sm font-semibold text-[#1E3A8A] block">
                            {item.title}
                          </span>
                          <span className="font-sans text-xs text-[#64748B] block">
                            Variant: <strong className="text-[#1E3A8A] font-medium">{item.color}</strong> &bull; Size: <strong className="text-[#1E3A8A] font-medium">{item.size}</strong> &bull; Qty: <strong className="text-[#1E3A8A] font-medium">{item.quantity}</strong>
                          </span>
                        </div>
                        <span className="font-sans text-sm font-medium text-[#1E3A8A]">
                          ₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Delivery Info */}
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider font-bold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#1E3A8A]" />
                        Delivery Destination
                      </span>
                      <p className="font-sans text-xs text-[#1E3A8A] leading-relaxed mt-2">
                        {order.shippingAddress.street},<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode},<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>

                    <div className="pt-4">
                      <Link
                        href={`/account/orders/${order._id.toString()}/receipt`}
                        className="inline-flex items-center gap-2 bg-[#1E3A8A] text-[#FFFFFF] border border-[#1E3A8A]/30 hover:bg-[#1E3A8A] hover:text-[#1E3A8A] font-sans text-[10px] font-bold tracking-widest py-2.5 px-4 uppercase transition-all duration-300 rounded-sm cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View Full Receipt
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3 md:border-l md:border-[#1E3A8A]/10 md:pl-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider font-bold block mb-1">
                          Payment Status
                        </span>
                        <span className={`font-sans text-[10px] font-bold tracking-widest uppercase inline-block border px-2.5 py-1 rounded-sm ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            : order.paymentStatus === 'FAILED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                            : 'bg-amber-50 text-amber-800 border-amber-200/60'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div>
                        <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider font-bold block mb-1">
                          Delivery Status
                        </span>
                        <span className={`font-sans text-[10px] font-bold tracking-widest uppercase inline-block border px-2.5 py-1 rounded-sm ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            : order.orderStatus === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200/60'
                            : order.orderStatus === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                            : 'bg-zinc-100 text-zinc-800 border-zinc-200/60'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {order.razorpayPaymentId && (
                      <div className="bg-[#FFFFFF] border border-[#1E3A8A]/10 rounded-sm p-3">
                        <span className="font-sans text-[9px] text-[#64748B] uppercase tracking-wider block font-bold">
                          Razorpay Payment reference
                        </span>
                        <span className="font-mono text-[10px] text-[#1E3A8A] mt-0.5 block select-all font-semibold">
                          {order.razorpayPaymentId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
