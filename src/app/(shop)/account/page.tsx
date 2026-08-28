import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, User as UserIcon, Calendar, ArrowRight } from 'lucide-react';
import dbConnect from '@/lib/db';
import { QuoteRequest } from '@/models/QuoteRequest';
import { User as UserModel } from '@/models/User';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/account');
  }

  const { id: userId, role } = session.user;

  await dbConnect();

  // Fetch the latest user info from the database
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    redirect('/login');
  }

  const name = user.name || session.user.name || 'Customer';
  const email = user.email || session.user.email || '';
  const mobile = user.mobile || '';

  // Fetch metrics using .lean()
  const quotes = await QuoteRequest.find({ userId }).sort({ createdAt: -1 }).limit(3).lean();
  const totalQuotesCount = await QuoteRequest.countDocuments({ userId });

  return (
    <div className="space-y-8">
      {/* Overview Title */}
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#0F0F11] tracking-wide">
          Dashboard Overview
        </h2>
        <p className="font-sans text-xs text-[#8C857B] mt-1">
          Monitor your quote requests, account status, and submitted lighting inquiries.
        </p>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats 1: Total Quote Requests */}
        <div className="bg-[#FAF8F5] border border-[#C5A880]/15 p-6 rounded-sm shadow-sm flex items-center gap-5">
          <div className="bg-[#C5A880]/10 p-3 border border-[#C5A880]/30 rounded-sm">
            <FileText className="h-6 w-6 text-[#C5A880]" />
          </div>
          <div>
            <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider block font-bold">
              Total Quote Requests
            </span>
            <span className="font-serif text-2xl font-bold text-[#0F0F11] mt-0.5 block">
              {totalQuotesCount}
            </span>
          </div>
        </div>

        {/* Stats 2: Account Status */}
        <div className="bg-[#FAF8F5] border border-[#C5A880]/15 p-6 rounded-sm shadow-sm flex items-center gap-5">
          <div className="bg-[#C5A880]/10 p-3 border border-[#C5A880]/30 rounded-sm">
            <UserIcon className="h-6 w-6 text-[#C5A880]" />
          </div>
          <div>
            <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider block font-bold">
              Account Status
            </span>
            <span className="font-sans text-xs font-bold text-[#0F0F11] mt-1 block uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Profile Card Column */}
        <div className="bg-[#FAF8F5] border border-[#C5A880]/15 p-6 rounded-sm shadow-sm space-y-4 md:col-span-1">
          <h3 className="font-serif text-lg font-semibold text-[#0F0F11] tracking-wide border-b border-[#C5A880]/15 pb-3">
            Profile summary
          </h3>
          <div className="space-y-3.5">
            <div>
              <span className="font-sans text-[9px] text-[#8C857B] uppercase tracking-wider block font-bold">
                Full Name
              </span>
              <span className="font-sans text-sm text-[#0F0F11] mt-1 block font-semibold">
                {name}
              </span>
            </div>
            <div>
              <span className="font-sans text-[9px] text-[#8C857B] uppercase tracking-wider block font-bold">
                Email Address
              </span>
              <span className="font-sans text-xs text-[#0F0F11] mt-1 block font-medium select-all">
                {email}
              </span>
            </div>
            <div>
              <span className="font-sans text-[9px] text-[#8C857B] uppercase tracking-wider block font-bold">
                Phone Number
              </span>
              <span className="font-sans text-xs text-[#0F0F11] mt-1 block font-medium">
                {mobile || <span className="italic text-[#8C857B]/60">Not provided</span>}
              </span>
            </div>
            <div>
              <Link
                href="/account/profile"
                className="inline-block mt-2 font-sans text-[10px] font-bold text-[#C5A880] hover:text-[#0F0F11] tracking-widest uppercase transition-colors"
              >
                Edit Profile &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Quotes Column */}
        <div className="bg-[#FAF8F5] border border-[#C5A880]/15 p-6 rounded-sm shadow-sm md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-[#C5A880]/15 pb-3">
            <h3 className="font-serif text-lg font-semibold text-[#0F0F11] tracking-wide">
              Recent Quote Requests
            </h3>
            {totalQuotesCount > 0 && (
              <Link
                href="/account/orders"
                className="font-sans text-[10px] font-bold text-[#C5A880] hover:text-[#0F0F11] tracking-widest uppercase transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {quotes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-sans text-xs text-[#8C857B]">
                You haven&apos;t submitted any quote requests yet.
              </p>
              <Link
                href="/products"
                className="inline-block mt-4 bg-[#0F0F11] text-[#FAF8F5] font-sans text-[10px] font-bold tracking-widest uppercase border border-[#C5A880]/30 hover:bg-[#C5A880] hover:text-[#0F0F11] px-5 py-2.5 transition-all duration-300 rounded-sm"
              >
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote._id.toString()}
                  className="border border-[#C5A880]/10 bg-white p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:border-[#C5A880]/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0F0F11]">
                        #{quote._id.toString().slice(-6).toUpperCase()}
                      </span>
                      <span className="font-sans text-[10px] text-[#8C857B] flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(quote.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#8C857B] line-clamp-1">
                      {quote.items.map((item) => `${item.title} (${item.quantity})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                    <span className={`font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm border ${
                      quote.status === 'Quoted'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : quote.status === 'Closed'
                        ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
