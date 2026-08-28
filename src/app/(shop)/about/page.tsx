import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-[#8C857B] uppercase">
          <Link href="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0F0F11]">About Us</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-[#C5A880]/15 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#C5A880] uppercase font-bold block mb-3">
            Our Heritage
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#0F0F11]">
            About BHAVATSYAM
          </h1>
          <p className="font-serif italic text-[#8C857B] mt-3 text-lg">
            Where tradition meets modern minimalism.
          </p>
        </header>

        {/* Text Body */}
        <div className="font-sans text-[#0F0F11] text-sm leading-relaxed space-y-6">
          <p>
            Welcome to <strong>BHAVATSYAM</strong>. We curate premium, hand-tailored clothing pieces designed for the discerning modern soul who values the perfect marriage of heritage textile traditions and sharp contemporary silhouettes.
          </p>
          <p>
            Our design philosophy lies at the intersection of &quot;Heritage and Modernity.&quot; By honoring age-old loom craft and combining it with sleek, minimalist visual sensibilities, we offer a unique wardrobe choice that transcends seasonal trends.
          </p>
          <p>
            Every piece in our limited-run collection is constructed with meticulous attention to detail, premium-quality materials, and a commitment to longevity. From our custom-tailored Co-ord sets to curated festive apparel, BHAVATSYAM offers elevated designs that fit effortlessly into your everyday style.
          </p>

          <div className="bg-[#0F0F11] text-[#FAF8F5] p-8 my-10 rounded-sm border border-[#C5A880]/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.05)_0,transparent_100%)] pointer-events-none" />
            <h3 className="font-serif text-xl font-medium tracking-wide text-[#C5A880] mb-3">Our Core Principles</h3>
            <ul className="space-y-4 font-sans text-xs sm:text-sm text-[#FAF8F5]/80">
              <li>
                <strong className="text-[#C5A880] block font-sans tracking-wide uppercase mb-1">1. Masterful Craftsmanship</strong>
                Collaborating closely with local master artisans to preserve traditional handweaving, embroidery, and textile dyeing methods.
              </li>
              <li>
                <strong className="text-[#C5A880] block font-sans tracking-wide uppercase mb-1">2. Contemporary Sophistication</strong>
                Sculpting relaxed-fit, modern patterns and sharp styles that define ease and elegance in daily life.
              </li>
              <li>
                <strong className="text-[#C5A880] block font-sans tracking-wide uppercase mb-1">3. Meticulous Quality</strong>
                Enforcing strict quality benchmarks across fabric selection, stitching precision, and final embellishments to deliver absolute durability.
              </li>
            </ul>
          </div>

          <p>
            We invite you to explore our collection and discover the rich narratives woven into every fiber of our clothing. Feel free to connect with our team for exclusive styling advice, size assistance, or general queries.
          </p>

          <div className="pt-6">
            <Link
              href="/products"
              className="inline-block border border-[#C5A880] px-8 py-3.5 font-sans text-xs font-bold tracking-widest text-[#C5A880] hover:bg-[#C5A880] hover:text-[#0F0F11] transition-all duration-300"
            >
              EXPLORE OUR COLLECTION
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
