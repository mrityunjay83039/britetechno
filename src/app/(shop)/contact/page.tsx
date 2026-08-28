'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-[#8C857B] uppercase">
          <Link href="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0F0F11]">Contact Us</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-[#C5A880]/15 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#C5A880] uppercase font-bold block mb-3">
            Atelier Relations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#0F0F11]">
            Contact BHAVATSYAM
          </h1>
          <p className="font-serif italic text-[#8C857B] mt-3 text-lg">
            Our concierge team is at your complete disposal for styling, order queries, and custom requests.
          </p>
        </header>

        {/* Contact Information & Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
          {/* Direct Channels */}
          <div className="space-y-8">
            <h2 className="font-serif text-2xl font-light tracking-wide text-[#0F0F11]">
              Get in Touch
            </h2>
            <p className="font-sans text-sm text-[#8C857B] leading-relaxed">
              Whether you need guidance choosing the right co-ord set size, want to track your package, or desire to explore custom fabric fits, please feel free to reach out.
            </p>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0F0F11] text-[#C5A880] rounded-sm border border-[#C5A880]/20 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#0F0F11]">
                    Email Inquiry
                  </h4>
                  <a href="mailto:info@bhavatsyam.com" className="font-sans text-sm text-[#8C857B] hover:text-[#C5A880] transition-colors block mt-1">
                    info@bhavatsyam.com
                  </a>
                </div>
              </div>

              {/* Instagram direct links */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0F0F11] text-[#C5A880] rounded-sm border border-[#C5A880]/20 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#0F0F11]">
                    Instagram Concierge
                  </h4>
                  <a
                    href="https://www.instagram.com/bhavatsyam/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-[#8C857B] hover:text-[#C5A880] transition-colors block mt-1"
                  >
                    @bhavatsyam
                  </a>
                </div>
              </div>

              {/* Address / Atelier location */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0F0F11] text-[#C5A880] rounded-sm border border-[#C5A880]/20 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#0F0F11]">
                    Atelier & Head Office
                  </h4>
                  <address className="font-sans text-sm text-[#8C857B] not-italic mt-1 leading-relaxed">
                    BHAVATSYAM Clothing Private Limited<br />
                    New Delhi, India
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Placeholder Form */}
          <div className="bg-white border border-[#C5A880]/15 p-8 rounded-sm shadow-xs">
            <h3 className="font-serif text-xl font-medium tracking-wide text-[#0F0F11] mb-6">
              Send a Message
            </h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#8C857B] mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans text-[#0F0F11] outline-none rounded-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#8C857B] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. eleanor@example.com"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans text-[#0F0F11] outline-none rounded-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#8C857B] mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Size & Fit Advice"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans text-[#0F0F11] outline-none rounded-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#8C857B] mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#C5A880]/30 focus:border-[#C5A880] text-xs font-sans text-[#0F0F11] outline-none rounded-sm transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F0F11] text-[#FAF8F5] hover:bg-[#C5A880] hover:text-[#0F0F11] font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm border border-[#C5A880]/35"
              >
                SEND INQUIRY
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
