import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Package, FileText, Building, Mail, Phone } from 'lucide-react';
import dbConnect from '@/lib/db';
import { QuoteRequest } from '@/models/QuoteRequest';

export default async function AccountQuotesPage() {
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

  // Fetch all user's quote requests using .lean()
  const quotes = await QuoteRequest.find({ userId }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#0F0F11] tracking-wide">
          Your Quote Requests
        </h2>
        <p className="font-sans text-xs text-[#8C857B] mt-1">
          Track the status and details of all your submitted industrial lighting quote requests.
        </p>
      </div>

      {/* Quotes Listing */}
      {quotes.length === 0 ? (
        <div className="bg-[#FAF8F5] border border-[#C5A880]/15 rounded-sm p-12 text-center shadow-sm">
          <Package className="h-12 w-12 text-[#C5A880]/40 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-medium text-[#0F0F11]">No Quote Requests Submitted Yet</h3>
          <p className="font-sans text-xs text-[#8C857B] max-w-xs mx-auto mt-2 leading-relaxed">
            Browse our industrial lighting catalog and submit quote requests for project volume pricing.
          </p>
          <Link
            href="/products"
            className="inline-block mt-6 bg-[#0F0F11] text-[#FAF8F5] font-sans text-xs font-bold tracking-widest uppercase border border-[#C5A880]/30 hover:bg-[#C5A880] hover:text-[#0F0F11] px-6 py-3 transition-all duration-300 rounded-sm cursor-pointer"
          >
            Explore Lighting Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote) => (
            <div
              key={quote._id.toString()}
              className="bg-white border border-[#C5A880]/15 rounded-sm shadow-sm overflow-hidden"
            >
              {/* Quote Top Bar / Summary */}
              <div className="bg-[#0F0F11] text-[#FAF8F5] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C5A880]/15">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div>
                    <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider block">
                      Submitted Date
                    </span>
                    <span className="font-sans text-xs text-[#FAF8F5] font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-[#C5A880]" />
                      {new Date(quote.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="sm:border-l sm:border-white/10 sm:pl-4">
                    <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider block">
                      Quote Reference
                    </span>
                    <span className="font-mono text-xs font-bold text-[#C5A880] mt-0.5 block select-all">
                      #{quote._id.toString().toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider block mb-1">
                    Status
                  </span>
                  <span className={`font-sans text-[10px] font-bold tracking-widest uppercase inline-block border px-2.5 py-1 rounded-sm ${
                    quote.status === 'Quoted'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : quote.status === 'Closed'
                      ? 'bg-zinc-100 text-zinc-800 border-zinc-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {quote.status}
                  </span>
                </div>
              </div>

              {/* Quote Body / Items List */}
              <div className="p-6 divide-y divide-[#C5A880]/10">
                <div className="pb-6">
                  <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider font-bold block mb-4">
                    Requested Items
                  </span>
                  <div className="space-y-4">
                    {quote.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="font-sans text-sm font-semibold text-[#0F0F11] block">
                            {item.title}
                          </span>
                        </div>
                        <span className="font-sans text-xs font-semibold text-[#0F0F11]">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company & Lead Details */}
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider font-bold flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-[#C5A880]" />
                      Company Info
                    </span>
                    <p className="font-sans text-xs text-[#0F0F11] leading-relaxed mt-1 font-semibold">
                      {quote.companyName}
                    </p>
                    <p className="font-sans text-xs text-[#8C857B]">
                      Contact: {quote.contactName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#8C857B] pt-1">
                      <Mail className="h-3 w-3 text-[#C5A880]" />
                      <span>{quote.email}</span>
                      <Phone className="h-3 w-3 text-[#C5A880] ml-2" />
                      <span>{quote.phoneNumber}</span>
                    </div>
                  </div>

                  {quote.projectDetails && (
                    <div className="space-y-1 md:border-l md:border-[#C5A880]/10 md:pl-6">
                      <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider font-bold flex items-center gap-1 mb-1">
                        <FileText className="h-3.5 w-3.5 text-[#C5A880]" />
                        Project Details
                      </span>
                      <p className="font-sans text-xs text-[#0F0F11] leading-relaxed">
                        {quote.projectDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
