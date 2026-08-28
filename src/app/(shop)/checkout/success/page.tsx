'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useQuoteListStore } from '@/store/useQuoteListStore';

function SuccessContent() {
  const clearQuoteList = useQuoteListStore((state) => state.clearQuoteList);
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') || searchParams.get('orderId');

  useEffect(() => {
    // Clear the quote list on success page
    clearQuoteList();
  }, [clearQuoteList]);

  return (
    <div className="max-w-md w-full text-center space-y-8 border border-slate-800 bg-slate-850 p-8 sm:p-10 rounded-lg shadow-2xl backdrop-blur-md text-slate-100">

      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-amber-400/10 p-4 border border-amber-400/30">
          <CheckCircle className="h-12 w-12 text-amber-400" />
        </div>
      </div>

      {/* Branded Message */}
      <div className="space-y-3">
        <span className="font-sans text-[10px] tracking-[0.4em] text-amber-400 uppercase font-bold block">
          BRITE TECHNO LIGHTING
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold text-white tracking-wide">
          Thank You
        </h1>
        <p className="font-sans text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
          Your quote request has been successfully submitted. Our B2B engineering sales team will reach out with a detailed proposal.
        </p>
      </div>

      {/* Quote Details */}
      {quoteId && (
        <div className="bg-slate-800 border border-slate-700 rounded-sm p-4 text-center">
          <span className="font-sans text-[10px] text-slate-400 tracking-wider uppercase block">
            Quote Reference ID
          </span>
          <span className="font-mono text-xs text-amber-400 select-all font-medium mt-1 block">
            {quoteId}
          </span>
        </div>
      )}

      <div className="border-t border-slate-800 pt-6">
        <p className="font-sans text-xs text-slate-400 leading-relaxed">
          A confirmation and formal proposal will be sent to your registered business email.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <Link
          href="/products"
          className="w-full bg-amber-500 text-slate-950 font-sans font-bold py-3 text-xs tracking-widest hover:bg-amber-400 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 rounded cursor-pointer uppercase"
        >
          BROWSE CATALOG
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] bg-slate-900 text-slate-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="mt-4 font-sans text-sm">Processing confirmation...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
