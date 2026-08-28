'use client';

import React from 'react';
import Link from 'next/link';
import { Hammer, Sparkles, HelpCircle } from 'lucide-react';

export default function MaintenanceMode() {
  return (
    <div className="min-h-screen bg-[#0F0F11] flex flex-col justify-between p-6 sm:p-12 text-[#FAF8F5] relative overflow-hidden">
      {/* Background ambient lighting/decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#C5A880]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#C5A880]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header/Logo */}
      <header className="flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="font-serif text-2xl font-semibold tracking-[0.3em] text-[#C5A880]">
            BHAVATSYAM
          </span>
          <span className="font-sans text-[8px] tracking-[0.5em] text-[#8C857B] uppercase -mt-0.5 font-bold">
            Heritage & Modernity
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center py-20 z-10 space-y-8">
        <div className="w-20 h-20 rounded-full border border-[#C5A880]/20 bg-[#C5A880]/5 flex items-center justify-center text-[#C5A880] animate-pulse">
          <Hammer className="w-10 h-10" />
        </div>

        <div className="space-y-4">
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-wide text-[#FAF8F5] leading-tight">
            Refining Our Heritage
          </h1>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
            Scheduled Maintenance in Progress
          </p>
        </div>

        <div className="h-[1px] w-24 bg-[#C5A880]/30" />

        <div className="space-y-6 font-sans text-sm sm:text-base text-[#8C857B] leading-relaxed max-w-lg">
          <p>
            We are currently updating our digital atelier to elevate your shopping experience. Our physical collections are untouched, but our online storefront is undergoing scheduled care.
          </p>
          <p className="text-xs italic font-serif text-[#C5A880]/70">
            &quot;A Perfect Blend of Heritage and Modernity&quot;
          </p>
        </div>

        {/* Floating sparkles */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="font-sans text-[10px] uppercase tracking-wider text-[#FAF8F5]/80 font-medium">
            We will return shortly.
          </span>
        </div>
      </main>

      {/* Footer / Admin Bypass portal */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[#8C857B] font-sans text-xs border-t border-white/5 pt-8 z-10">
        <p>&copy; {new Date().getFullYear()} BHAVATSYAM. All Rights Reserved.</p>

        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-[#C5A880]/60" />
          <span>Are you an administrator?</span>
          <Link
            href="/login"
            className="text-[#C5A880] hover:text-[#FAF8F5] font-semibold transition-colors underline underline-offset-4 decoration-[#C5A880]/40 hover:decoration-[#FAF8F5]"
          >
            Sign In to Bypass
          </Link>
        </div>
      </footer>
    </div>
  );
}
