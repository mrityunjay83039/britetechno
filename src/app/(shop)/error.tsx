'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Captured by shop error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-[#FAFAFA] flex flex-col justify-center items-center px-4 py-16 text-center max-w-xl mx-auto">
      <span className="font-sans text-xs tracking-[0.4em] text-[#FF6F61] uppercase font-bold mb-4">
        TEMPORARY ERROR
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-wide text-[#222222] mb-6 leading-tight">
        Something Went Wrong
      </h1>
      <div className="w-16 h-[1px] bg-[#FF6F61] mb-8"></div>
      <p className="font-sans text-sm text-zinc-600 leading-relaxed mb-10 max-w-md">
        We encountered an error while retrieving the collection. This might be a temporary database connection issue. Please try refreshing or return to the main shop.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button
          onClick={() => reset()}
          className="font-sans text-xs tracking-widest font-bold bg-[#FF6F61] text-white hover:bg-[#E05A47] px-8 py-4 transition-all duration-300 shadow-md uppercase cursor-pointer rounded-sm"
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="font-sans text-xs tracking-widest font-bold border border-gray-200 text-[#222222] bg-white hover:bg-gray-50 px-8 py-4 transition-all duration-300 shadow-sm uppercase flex items-center justify-center cursor-pointer rounded-sm"
        >
          RETURN TO HOME
        </Link>
      </div>
    </div>
  );
}
