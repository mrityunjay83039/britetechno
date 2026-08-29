import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-slate-500 uppercase">
          <Link href="/" className="hover:text-[#0066B4] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0066B4]">About Us</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-slate-200 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#0066B4] uppercase font-bold block mb-3">
            Company Overview
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            About BRITE Techno Lighting Inc.
          </h1>
          <p className="font-sans italic text-slate-600 mt-3 text-lg">
            Your Trusted Family-Owned Lighting Provider Across Canada & The United States.
          </p>
        </header>

        {/* Text Body */}
        <div className="font-sans text-slate-800 text-sm leading-relaxed space-y-6">
          <p>
            <strong>BRITE Techno Lighting Inc.</strong> is a family-owned business that provides lighting equipment across Canada and the United States. We guarantee the satisfaction of our customers by the quality of our products and our unbeatable prices.
          </p>
          <p>
            We have a vast selection of original and imported light fixtures made for industrial use, as well as home and office use.
          </p>
          <p>
            Whether you are looking for imported lighting or a Brite Techno Inc. original, we have it all! Visit our website at <strong>britetechno.com</strong> or come see us at <strong>6068 Boul. Metropolitain E., Saint-Leonard, Quebec, H1S 1A9, CANADA</strong>.
          </p>

          <div className="bg-slate-900 text-white p-8 my-10 rounded-2xl border border-slate-800 relative overflow-hidden shadow-xl">
            <h3 className="font-sans text-xl font-bold tracking-wide text-[#0066B4] mb-4">Why Choose BRITE Techno Lighting?</h3>
            <ul className="space-y-4 font-sans text-xs sm:text-sm text-slate-200">
              <li>
                <strong className="text-blue-300 block font-sans tracking-wide uppercase mb-1">1. Family-Owned Commitment</strong>
                Personalized service, integrity, and long-standing dedication to client satisfaction across Canada & US.
              </li>
              <li>
                <strong className="text-blue-300 block font-sans tracking-wide uppercase mb-1">2. Unbeatable Quality & Pricing</strong>
                High-efficiency LED fixtures and equipment guaranteed to offer unbeatable commercial & industrial pricing.
              </li>
              <li>
                <strong className="text-blue-300 block font-sans tracking-wide uppercase mb-1">3. Original & Imported Selection</strong>
                Complete catalog for industrial facilities, high bay installations, commercial office spaces, and residential applications.
              </li>
            </ul>
          </div>

          <p className="font-semibold text-slate-900">
            Visit our showroom at 6068 Boul. Metropolitain E., Saint-Leonard, Quebec, H1S 1A9, CANADA, or submit a B2B quote request online.
          </p>

          <div className="pt-6">
            <Link
              href="/products"
              className="inline-block bg-[#0066B4] hover:bg-[#005293] text-white px-8 py-3.5 font-sans text-xs font-bold tracking-widest transition-all duration-300 rounded-lg shadow-md"
            >
              EXPLORE LIGHTING CATALOG
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
