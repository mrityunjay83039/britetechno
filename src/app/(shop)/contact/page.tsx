'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Globe, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-slate-500 uppercase">
          <Link href="/" className="hover:text-[#0066B4] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0066B4]">Contact Us</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-slate-200 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#0066B4] uppercase font-bold block mb-3">
            Sales & Technical Inquiries
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Contact BRITE Techno Lighting Inc.
          </h1>
          <p className="font-sans italic text-slate-600 mt-3 text-lg">
            Our lighting sales team is at your service for volume quote requests, technical spec sheets, and project estimates.
          </p>
        </header>

        {/* Contact Information & Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
          {/* Direct Channels */}
          <div className="space-y-8">
            <h2 className="font-sans text-2xl font-bold tracking-wide text-slate-900">
              Head Office & Showroom
            </h2>
            <p className="font-sans text-sm text-slate-600 leading-relaxed">
              Whether you are looking for imported lighting or a Brite Techno Inc. original, we have it all! Visit our showroom in Saint-Leonard, Quebec or contact our sales team online.
            </p>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0066B4] text-white rounded-lg shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                    Showroom & Location
                  </h4>
                  <address className="font-sans text-sm text-slate-600 not-italic mt-1 leading-relaxed">
                    <strong>BRITE Techno Lighting Inc.</strong><br />
                    6068 Boul. Metropolitain E.<br />
                    Saint-Leonard, Quebec, H1S 1A9<br />
                    CANADA
                  </address>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0066B4] text-white rounded-lg shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                    Email Inquiry
                  </h4>
                  <a href="mailto:info@britetechno.com" className="font-sans text-sm text-[#0066B4] hover:underline transition-colors block mt-1 font-semibold">
                    info@britetechno.com
                  </a>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0066B4] text-white rounded-lg shrink-0 shadow-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                    Official Website
                  </h4>
                  <a href="https://britetechno.com" target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-[#0066B4] hover:underline transition-colors block mt-1 font-semibold">
                    britetechno.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
            <h3 className="font-sans text-xl font-bold tracking-wide text-slate-900 mb-6">
              Send a Message / Project Request
            </h3>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-sans text-base font-bold text-slate-900">Inquiry Submitted Successfully</h4>
                <p className="font-sans text-xs text-slate-600 leading-relaxed">
                  Thank you for reaching out to BRITE Techno Lighting Inc. A sales representative will review your inquiry and follow up shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 font-sans text-xs font-bold text-[#0066B4] hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Send Another Message &rarr;
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Company / Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Industrial Corp"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] text-xs font-sans text-slate-900 outline-none rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. procurement@acme.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] text-xs font-sans text-slate-900 outline-none rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (514) 555-0199"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] text-xs font-sans text-slate-900 outline-none rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Project Details & Inquiries *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your lighting requirements, fixture models, quantity estimates, or site specifications..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] text-xs font-sans text-slate-900 outline-none rounded-lg transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0066B4] text-white hover:bg-[#005293] font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-lg shadow-sm cursor-pointer"
                >
                  SUBMIT INQUIRY
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
