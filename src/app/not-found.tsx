'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-between text-[#0F172A]">
      {/* Top logo border area */}
      <header className="border-b border-gray-150 py-6 px-4 sm:px-6 lg:px-8 text-center bg-white">
        <Link href="/" className="font-sans text-2xl font-light tracking-[0.2em] text-[#0F172A] hover:text-[#1E3A8A] transition-colors">
          BHAVATSYAM
        </Link>
      </header>

      {/* Main Spacious Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto py-16">
        <span className="font-sans text-xs sm:text-sm font-bold tracking-[0.4em] text-[#1E3A8A] uppercase block mb-4">
          Error 404
        </span>
        <h1 className="font-sans text-4xl sm:text-5xl font-light tracking-wide text-[#0F172A] mb-6 leading-tight">
          Page Not Found
        </h1>
        <p className="font-sans text-xs sm:text-sm text-zinc-600 tracking-wide leading-relaxed mb-8">
          The curated couture piece or designer page you are looking for does not exist in our studio, or has been temporarily moved.
        </p>
        <Link
          href="/"
          className="font-sans text-xs tracking-widest font-bold bg-[#1E3A8A] text-white hover:bg-[#1D4ED8] px-8 py-4 transition-all duration-300 shadow-md uppercase rounded-sm"
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
