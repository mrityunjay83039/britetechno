'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

function SuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-md w-full text-center space-y-8 border border-[#C5A880]/15 bg-black/40 p-8 sm:p-10 rounded-sm shadow-2xl backdrop-blur-md">

      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-[#C5A880]/10 p-4 border border-[#C5A880]/30">
          <CheckCircle className="h-12 w-12 text-[#C5A880]" />
        </div>
      </div>

      {/* Branded Message */}
      <div className="space-y-3">
        <span className="font-sans text-[10px] tracking-[0.4em] text-[#8C857B] uppercase font-bold block">
          BHAVATSYAM
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF8F5] tracking-wide">
          Thank You
        </h1>
        <p className="font-sans text-sm text-[#8C857B] max-w-sm mx-auto leading-relaxed">
          Your order has been successfully placed. We are preparing your hand-crafted piece with the finest care.
        </p>
      </div>

      {/* Order Details */}
      {orderId && (
        <div className="bg-[#FAF8F5]/5 border border-[#C5A880]/10 rounded-sm p-4 text-center">
          <span className="font-sans text-[10px] text-[#8C857B] tracking-wider uppercase block">
            Razorpay Order ID
          </span>
          <span className="font-mono text-xs text-[#C5A880] select-all font-medium mt-1 block">
            {orderId}
          </span>
        </div>
      )}

      <div className="border-t border-[#C5A880]/10 pt-6">
        <p className="font-sans text-xs text-[#8C857B] leading-relaxed">
          A confirmation email and shipping details will be shared with you shortly.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <Link
          href="/"
          className="w-full bg-[#C5A880] text-[#0F0F11] font-sans font-bold py-3 text-xs tracking-widest hover:bg-[#FAF8F5] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 rounded-sm cursor-pointer"
        >
          CONTINUE SHOPPING
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] bg-[#0F0F11] text-[#FAF8F5] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center text-[#8C857B]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent" />
          <p className="mt-4 font-sans text-sm">Processing confirmation...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
