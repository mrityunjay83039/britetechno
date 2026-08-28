import React from 'react';
import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-[#8C857B] uppercase">
          <Link href="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0F0F11]">Terms & Conditions</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-[#C5A880]/15 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#C5A880] uppercase font-bold block mb-3">
            Atelier Governance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#0F0F11]">
            Terms & Conditions
          </h1>
          <p className="font-serif italic text-[#8C857B] mt-3 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Terms and Conditions Content */}
        <div className="font-sans text-[#0F0F11] text-sm leading-relaxed space-y-8">

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, registering an account, or purchasing from the BHAVATSYAM website (<a href="https://bhavatsyam.com" className="text-[#C5A880] hover:underline">bhavatsyam.com</a>), you explicitly agree to be bound by these Terms and Conditions. If you object to any portion of these conditions, we kindly ask you to discontinue storefront use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              2. Intellectual Property Rights
            </h2>
            <p>
              All materials displayed on this platform, including clothing silhouettes, pattern designs, photographies, embroidery illustrations, brand logos (BHAVATSYAM), text blocks, and website codes are the exclusive intellectual property of BHAVATSYAM. Any unauthorized duplication, commercial extraction, or distribution of this content is strictly prohibited by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              3. Pricing and Product Display Accuracy
            </h2>
            <p>
              We make every premium effort to portray fabric textures, dyes, embellishments, and colors with maximum fidelity on our screens. However, minor variations might occur depending on your screen calibration.
            </p>
            <p>
              Prices shown on the product details pages are inclusive of domestic handling. We reserve the right to correct accidental pricing errors, update product descriptions, or withdraw limited collection items at our sole discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              4. Payment & Orders
            </h2>
            <p>
              All customer checkouts are processed securely over external API calls powered by Razorpay. An order is deemed accepted only after signature/transaction confirmation is received, and a formal receipt email is dispatched to your registered email address. We reserve the right to cancel checkouts suspected of being fraudulent, automated bot actions, or stock discrepancies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11]">
              5. Governing Jurisdiction
            </h2>
            <p>
              These Terms & Conditions are construed and governed in compliance with the laws of India. Any disputes arising directly from transactions on this website shall be subjected to the exclusive jurisdiction of the competent courts of New Delhi, India.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
