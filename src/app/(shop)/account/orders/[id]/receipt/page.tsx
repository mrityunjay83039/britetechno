import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import PrintReceiptButton from './PrintReceiptButton';

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const { id } = await params;

  await dbConnect();

  const order = await Order.findById(id).lean();

  if (!order) {
    notFound();
  }

  // Security check: Only the owner of the order OR an admin can view this receipt
  const isOwner = order.userId.toString() === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    redirect('/login');
  }

  // Fetch the customer details
  const customer = await User.findById(order.userId).select('name email mobile').lean();
  const customerName = customer?.name || session.user.name || 'Valued Customer';
  const customerEmail = customer?.email || session.user.email || '';
  const customerMobile = customer?.mobile || '';

  return (
    <div className="bg-[#FFFFFF] min-h-screen py-12 px-4 sm:px-6 lg:px-8">

      {/* Print styles inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .print-dark-bg {
            background-color: #1E3A8A !important;
            color: #FFFFFF !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      <div className="max-w-3xl mx-auto space-y-8">

        {/* Navigation / Back Button */}
        <div className="no-print flex justify-between items-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#64748B] hover:text-[#1E3A8A] uppercase tracking-widest transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <PrintReceiptButton />
        </div>

        {/* Invoice Card Container */}
        <div className="print-card bg-white border border-[#1E3A8A]/15 rounded-sm shadow-xl overflow-hidden">

          {/* Header Banner - Luxury Branded Dark Area */}
          <div className="print-dark-bg bg-[#1E3A8A] text-[#FFFFFF] px-8 py-10 border-b border-[#1E3A8A]/20 text-center space-y-2">
            <span className="font-sans text-[10px] tracking-[0.4em] text-[#64748B] uppercase font-bold block">
              Luxury Craftsmanship
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl font-bold text-[#1E3A8A] tracking-widest uppercase">
              BHAVATSYAM
            </h1>
            <p className="font-sans text-[9px] tracking-[0.25em] text-[#FFFFFF]/60 uppercase">
              Heritage & Modernity
            </p>
          </div>

          <div className="p-8 sm:p-10 space-y-8">

            {/* Invoice Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans border-b border-[#1E3A8A]/15 pb-6">
              <div className="space-y-1">
                <span className="text-[#64748B] uppercase tracking-wider block font-bold text-[10px]">
                  Order Details
                </span>
                <p className="text-[#1E3A8A]">
                  <strong className="font-semibold text-gray-500 uppercase">Receipt Reference:</strong><br />
                  <span className="font-mono text-xs font-bold text-[#1E3A8A]">#{order._id.toString().toUpperCase()}</span>
                </p>
                <p className="text-[#1E3A8A]">
                  <strong className="font-semibold text-gray-500 uppercase">Date of Purchase:</strong><br />
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[#64748B] uppercase tracking-wider block font-bold text-[10px]">
                  Customer Profile
                </span>
                <p className="text-[#1E3A8A] font-semibold text-sm">
                  {customerName}
                </p>
                <p className="text-gray-500 font-medium select-all">
                  {customerEmail}
                </p>
                {customerMobile && (
                  <p className="text-gray-500">
                    Phone: {customerMobile}
                  </p>
                )}
              </div>
            </div>

            {/* Items Ordered List Table */}
            <div className="space-y-3">
              <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider font-bold block mb-4">
                Items Commissioned
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-[#1E3A8A]/20 text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-2.5">Product Title</th>
                      <th className="py-2.5 text-center">Color</th>
                      <th className="py-2.5 text-center">Size</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Unit Price</th>
                      <th className="py-2.5 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item, index) => (
                      <tr key={index} className="text-[#1E3A8A]">
                        <td className="py-3 font-semibold text-sm">{item.title}</td>
                        <td className="py-3 text-center text-gray-500">{item.color}</td>
                        <td className="py-3 text-center text-gray-500">{item.size}</td>
                        <td className="py-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-500">₹{item.priceAtPurchase.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right font-sans text-sm font-semibold">
                          ₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="border-t border-[#1E3A8A]/15 pt-6 flex justify-end">
              <div className="w-full sm:w-64 space-y-2.5 text-xs font-sans text-right">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping & Delivery</span>
                  <span className="uppercase text-[10px] font-bold text-emerald-600">Complimentary</span>
                </div>
                <div className="flex justify-between border-t border-[#1E3A8A]/10 pt-2.5 font-sans text-base font-bold text-[#1E3A8A]">
                  <span>Total Amount Paid</span>
                  <span className="text-[#1E3A8A]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Shipping details and payment references */}
            <div className="border-t border-[#1E3A8A]/15 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">

              {/* Delivery destination */}
              <div className="space-y-2">
                <span className="text-[#64748B] uppercase tracking-wider block font-bold text-[10px]">
                  Shipping Address
                </span>
                <p className="text-[#1E3A8A] leading-relaxed">
                  <strong>{customerName}</strong><br />
                  {order.shippingAddress.street},<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode},<br />
                  {order.shippingAddress.country}
                </p>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <span className="text-[#64748B] uppercase tracking-wider block font-bold text-[10px]">
                  Payment Information
                </span>
                <div className="space-y-1.5 text-[#1E3A8A]">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <span className="font-bold text-emerald-600 tracking-wider uppercase text-[10px]">
                      {order.paymentStatus}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Commission Status:</span>
                    <span className="font-bold text-gray-700 tracking-wider uppercase text-[10px]">
                      {order.orderStatus}
                    </span>
                  </p>
                  {order.razorpayOrderId && (
                    <p className="flex justify-between">
                      <span className="text-gray-500">Razorpay Order ID:</span>
                      <span className="font-mono text-xs text-gray-700 select-all font-semibold">
                        {order.razorpayOrderId}
                      </span>
                    </p>
                  )}
                  {order.razorpayPaymentId && (
                    <p className="flex justify-between">
                      <span className="text-gray-500">Razorpay Payment ID:</span>
                      <span className="font-mono text-xs text-[#1E3A8A] select-all font-semibold">
                        {order.razorpayPaymentId}
                      </span>
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Quality assurance note / Footer */}
            <div className="border-t border-[#1E3A8A]/10 pt-8 text-center space-y-2">
              <p className="font-sans italic text-xs text-[#64748B]">
                &ldquo;A perfect blend of heritage and modernity.&rdquo;
              </p>
              <p className="font-sans text-[10px] text-gray-400">
                Each BHAVATSYAM piece is meticulously hand-crafted by master artisans with the finest care. Thank you for your commission.<br />
                For enquiries, please contact <a href="mailto:info@bhavatsyam.com" className="text-[#1E3A8A] underline">info@bhavatsyam.com</a>
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
