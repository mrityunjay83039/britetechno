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
        <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-wide">
          Dashboard Overview
        </h2>
        <p className="font-sans text-xs text-slate-500 mt-1">
          Monitor your quote requests, account status, and submitted lighting inquiries.
        </p>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats 1: Total Quote Requests */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex items-center gap-5">
          <div className="bg-[#0066B4]/10 p-3.5 border border-[#0066B4]/20 rounded-lg">
            <FileText className="h-6 w-6 text-[#0066B4]" />
          </div>
          <div>
            <span className="font-sans text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Total Quote Requests
            </span>
            <span className="font-sans text-2xl font-bold text-slate-900 mt-0.5 block">
              {totalQuotesCount}
            </span>
          </div>
        </div>

        {/* Stats 2: Account Status */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex items-center gap-5">
          <div className="bg-[#0066B4]/10 p-3.5 border border-[#0066B4]/20 rounded-lg">
            <UserIcon className="h-6 w-6 text-[#0066B4]" />
          </div>
          <div>
            <span className="font-sans text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Account Status
            </span>
            <span className="font-sans text-xs font-bold text-[#0066B4] mt-1 block uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Profile Card Column */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4 md:col-span-1">
          <h3 className="font-sans text-lg font-bold text-slate-900 tracking-wide border-b border-slate-100 pb-3">
            Profile Summary
          </h3>
          <div className="space-y-3.5">
            <div>
              <span className="font-sans text-[9px] text-slate-500 uppercase tracking-wider block font-bold">
                Full Name
              </span>
              <span className="font-sans text-sm text-slate-900 mt-1 block font-bold">
                {name}
              </span>
            </div>
            <div>
              <span className="font-sans text-[9px] text-slate-500 uppercase tracking-wider block font-bold">
                Email Address
              </span>
              <span className="font-sans text-xs text-slate-800 mt-1 block font-medium select-all">
                {email}
              </span>
            </div>
            <div>
              <span className="font-sans text-[9px] text-slate-500 uppercase tracking-wider block font-bold">
                Phone Number
              </span>
              <span className="font-sans text-xs text-slate-800 mt-1 block font-medium">
                {mobile || <span className="italic text-slate-400">Not provided</span>}
              </span>
            </div>
            <div>
              <Link
                href="/account/profile"
                className="inline-block mt-2 font-sans text-xs font-bold text-[#0066B4] hover:underline uppercase tracking-wider"
              >
                Edit Profile &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Quotes Column */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-sans text-lg font-bold text-slate-900 tracking-wide">
              Recent Quote Requests
            </h3>
            {totalQuotesCount > 0 && (
              <Link
                href="/account/orders"
                className="font-sans text-xs font-bold text-[#0066B4] hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {quotes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-sans text-xs text-slate-500">
                You haven&apos;t submitted any quote requests yet.
              </p>
              <Link
                href="/products"
                className="inline-block mt-4 bg-[#0066B4] text-white font-sans text-xs font-bold tracking-wider uppercase hover:bg-[#005293] px-6 py-2.5 transition-all duration-300 rounded-lg shadow-xs"
              >
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote._id.toString()}
                  className="border border-slate-200 bg-slate-50/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:border-[#0066B4]/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        #{quote._id.toString().slice(-6).toUpperCase()}
                      </span>
                      <span className="font-sans text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(quote.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-600 line-clamp-1">
                      {quote.items.map((item) => `${item.title} (${item.quantity})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                    <span className={`font-sans text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                      quote.status === 'Quoted'
                        ? 'bg-blue-50 text-[#0066B4] border-blue-200'
                        : quote.status === 'Closed'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-blue-50 text-[#0066B4] border-blue-200'
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
