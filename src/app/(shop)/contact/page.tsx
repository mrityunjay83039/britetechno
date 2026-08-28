'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-[#FFFFFF] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-xs font-sans font-bold tracking-wider text-[#64748B] uppercase">
          <Link href="/" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1E3A8A]">Contact Us</span>
        </nav>

        {/* Content Header */}
        <header className="border-b border-[#1E3A8A]/15 pb-8 mb-10">
          <span className="font-sans text-xs tracking-[0.3em] text-[#1E3A8A] uppercase font-bold block mb-3">
            Atelier Relations
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#1E3A8A]">
            Contact BHAVATSYAM
          </h1>
          <p className="font-sans italic text-[#64748B] mt-3 text-lg">
            Our concierge team is at your complete disposal for styling, order queries, and custom requests.
          </p>
        </header>

        {/* Contact Information & Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
          {/* Direct Channels */}
          <div className="space-y-8">
            <h2 className="font-sans text-2xl font-light tracking-wide text-[#1E3A8A]">
              Get in Touch
            </h2>
            <p className="font-sans text-sm text-[#64748B] leading-relaxed">
              Whether you need guidance choosing the right co-ord set size, want to track your package, or desire to explore custom fabric fits, please feel free to reach out.
            </p>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#1E3A8A] text-white rounded-sm border border-[#1E3A8A]/20 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Email Inquiry
                  </h4>
                  <a href="mailto:info@bhavatsyam.com" className="font-sans text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors block mt-1">
                    info@bhavatsyam.com
                  </a>
                </div>
              </div>

              {/* Instagram direct links */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#1E3A8A] text-white rounded-sm border border-[#1E3A8A]/20 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Instagram Concierge
                  </h4>
                  <a
                    href="https://www.instagram.com/bhavatsyam/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-[#64748B] hover:text-[#1E3A8A] transition-colors block mt-1"
                  >
                    @bhavatsyam
                  </a>
                </div>
              </div>

              {/* Address / Atelier location */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#1E3A8A] text-white rounded-sm border border-[#1E3A8A]/20 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Atelier & Head Office
                  </h4>
                  <address className="font-sans text-sm text-[#64748B] not-italic mt-1 leading-relaxed">
                    BHAVATSYAM Clothing Private Limited<br />
                    New Delhi, India
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Placeholder Form */}
          <div className="bg-white border border-[#1E3A8A]/15 p-8 rounded-sm shadow-xs">
            <h3 className="font-sans text-xl font-medium tracking-wide text-[#1E3A8A] mb-6">
              Send a Message
            </h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#1E3A8A]/30 focus:border-[#1E3A8A] text-xs font-sans text-[#1E3A8A] outline-none rounded-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. eleanor@example.com"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#1E3A8A]/30 focus:border-[#1E3A8A] text-xs font-sans text-[#1E3A8A] outline-none rounded-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Size & Fit Advice"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#1E3A8A]/30 focus:border-[#1E3A8A] text-xs font-sans text-[#1E3A8A] outline-none rounded-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#1E3A8A]/30 focus:border-[#1E3A8A] text-xs font-sans text-[#1E3A8A] outline-none rounded-sm transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1E3A8A] text-[#FFFFFF] hover:bg-[#1E3A8A] hover:text-[#1E3A8A] font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm border border-[#1E3A8A]/35"
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
