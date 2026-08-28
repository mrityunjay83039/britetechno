'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between text-[#222222]">
      {/* Top logo border area */}
      <header className="border-b border-gray-150 py-6 px-4 sm:px-6 lg:px-8 text-center bg-white">
        <Link href="/" className="font-serif text-2xl font-light tracking-[0.2em] text-[#222222] hover:text-[#FF6F61] transition-colors">
          BHAVATSYAM
        </Link>
      </header>

      {/* Main Spacious Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto py-16">
        <span className="font-sans text-xs sm:text-sm font-bold tracking-[0.4em] text-[#FF6F61] uppercase block mb-4">
          Error 404
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-wide text-[#222222] mb-6 leading-tight">
          Page Not Found
        </h1>
        <p className="font-sans text-xs sm:text-sm text-zinc-600 tracking-wide leading-relaxed mb-8">
          The curated couture piece or designer page you are looking for does not exist in our studio, or has been temporarily moved.
        </p>
        <Link
          href="/"
          className="font-sans text-xs tracking-widest font-bold bg-[#FF6F61] text-white hover:bg-[#E05A47] px-8 py-4 transition-all duration-300 shadow-md uppercase rounded-sm"
        >
          Return to Atelier
        </Link>
      </main>

      {/* Branded Footer */}
      <footer className="border-t border-gray-150 py-8 px-4 sm:px-6 lg:px-8 text-center text-zinc-500 font-sans text-xs tracking-wider bg-white">
        &copy; {new Date().getFullYear()} BHAVATSYAM. All Rights Reserved.
      </footer>
    </div>
  );
}
