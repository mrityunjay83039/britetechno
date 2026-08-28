import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Building, Mail, Phone } from 'lucide-react';
import dbConnect from '@/lib/db';
import { QuoteRequest } from '@/models/QuoteRequest';
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

  const quote = await QuoteRequest.findById(id).lean();

  if (!quote) {
    notFound();
  }

  // Security check: Only the owner of the quote OR an admin can view this details page
  const isOwner = quote.userId ? quote.userId.toString() === session.user.id : false;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    redirect('/login');
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 px-4 sm:px-6 lg:px-8">

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
            background-color: #0F0F11 !important;
            color: #FAF8F5 !important;
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
            className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#8C857B] hover:text-[#C5A880] uppercase tracking-widest transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Quotes
          </Link>

          <PrintReceiptButton />
        </div>

        {/* Invoice / Details Card Container */}
        <div className="print-card bg-white border border-[#C5A880]/15 rounded-sm shadow-xl overflow-hidden">

          {/* Header Banner - BRITE TECHNO Branding */}
          <div className="print-dark-bg bg-[#0F0F11] text-[#FAF8F5] px-8 py-10 border-b border-[#C5A880]/20 text-center space-y-2">
            <span className="font-sans text-[10px] tracking-[0.4em] text-[#8C857B] uppercase font-bold block">
              Industrial & Commercial Lighting
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#C5A880] tracking-widest uppercase">
              BRITE TECHNO LIGHTING
            </h1>
            <p className="font-sans text-[9px] tracking-[0.25em] text-[#FAF8F5]/60 uppercase">
              Official B2B Quotation Request Summary
            </p>
          </div>

          <div className="p-8 sm:p-10 space-y-8">

            {/* Quote Reference & Customer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans border-b border-[#C5A880]/15 pb-6">
              <div className="space-y-1">
                <span className="text-[#8C857B] uppercase tracking-wider block font-bold text-[10px]">
                  Quote Details
                </span>
                <p className="text-[#0F0F11]">
                  <strong className="font-semibold text-gray-500 uppercase">Quote Reference:</strong><br />
                  <span className="font-mono text-xs font-bold text-[#C5A880]">#{quote._id.toString().toUpperCase()}</span>
                </p>
                <p className="text-[#0F0F11]">
                  <strong className="font-semibold text-gray-500 uppercase">Submission Date:</strong><br />
                  {new Date(quote.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-[#0F0F11]">
                  <strong className="font-semibold text-gray-500 uppercase">Status:</strong><br />
                  <span className="font-bold text-[#0F0F11] uppercase">{quote.status}</span>
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[#8C857B] uppercase tracking-wider block font-bold text-[10px]">
                  Company / Lead Profile
                </span>
                <p className="text-[#0F0F11] font-semibold text-sm flex items-center sm:justify-end gap-1">
                  <Building className="h-3.5 w-3.5 text-[#C5A880]" />
                  {quote.companyName}
                </p>
                <p className="text-gray-700 font-medium">
                  Contact: {quote.contactName}
                </p>
                <p className="text-gray-500 font-medium flex items-center sm:justify-end gap-1">
                  <Mail className="h-3 w-3 text-[#C5A880]" />
                  {quote.email}
                </p>
                <p className="text-gray-500 flex items-center sm:justify-end gap-1">
                  <Phone className="h-3 w-3 text-[#C5A880]" />
                  {quote.phoneNumber}
                </p>
              </div>
            </div>

            {/* Requested Line Items Table */}
            <div className="space-y-3">
              <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider font-bold block mb-4">
                Requested Products
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-[#C5A880]/20 text-[#8C857B] uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-2.5">Product Title</th>
                      <th className="py-2.5 text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quote.items.map((item, index) => (
                      <tr key={index} className="text-[#0F0F11]">
                        <td className="py-3 font-semibold text-sm">{item.title}</td>
                        <td className="py-3 text-center font-bold text-sm">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Details */}
            {quote.projectDetails && (
              <div className="border-t border-[#C5A880]/15 pt-6 space-y-2">
                <span className="text-[#8C857B] uppercase tracking-wider block font-bold text-[10px]">
                  Project Specifications & Notes
                </span>
                <p className="text-[#0F0F11] text-xs leading-relaxed bg-[#FAF8F5] p-4 rounded border border-[#C5A880]/15">
                  {quote.projectDetails}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-[#C5A880]/10 pt-8 text-center space-y-2">
              <p className="font-serif italic text-xs text-[#8C857B]">
                &ldquo;BRITE Techno Lighting Inc. - Industrial & Commercial Lighting Solutions&rdquo;
              </p>
              <p className="font-sans text-[10px] text-gray-400">
                For urgent quote updates, please email <a href="mailto:quotes@brite.com" className="text-[#C5A880] underline">quotes@brite.com</a>
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
