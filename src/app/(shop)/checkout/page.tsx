'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FileText, Building2, User, Mail, Phone, MessageSquare, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useQuoteListStore, QuoteListState, QuoteListItem } from '@/store/useQuoteListStore';
import { useHydratedStore } from '@/hooks/useHydratedStore';

export default function CheckoutQuotePage() {
  const router = useRouter();
  const clearQuoteList = useQuoteListStore((state) => state.clearQuoteList);
  const items = useHydratedStore<QuoteListState, QuoteListItem[]>(useQuoteListStore, (state) => state.items) || [];
  const isHydrated = useHydratedStore<QuoteListState, boolean>(useQuoteListStore, () => true) || false;

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectDetails, setProjectDetails] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedQuoteId, setSubmittedQuoteId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!companyName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all required fields (Company Name, Contact Person, Email, and Phone).');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your Quote List is empty. Please add items to your quote list before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/quotes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          contactPerson,
          email,
          phone,
          projectDetails,
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            wattage: item.wattage || '30W',
            cct: item.cct || '4000K',
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit quote request.');
      }

      setSubmittedQuoteId(data.quoteId || 'QR-' + Date.now());
      clearQuoteList();
    } catch (err: unknown) {
      console.error('Quote submission error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred while submitting your quote request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-[70vh] bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="mt-4 font-sans text-sm text-slate-400">Loading Quote Builder...</p>
        </div>
      </div>
    );
  }

  if (submittedQuoteId) {
    return (
      <div className="min-h-[75vh] bg-slate-900 text-slate-100 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center space-y-6 border border-slate-800 bg-slate-850 p-8 sm:p-12 rounded-lg shadow-2xl backdrop-blur-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-400/10 p-4 border border-amber-400/30">
              <CheckCircle className="h-14 w-14 text-amber-400" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-sans text-xs tracking-[0.3em] text-amber-400 uppercase font-bold block">
              BRITE TECHNO LIGHTING
            </span>
            <h1 className="font-sans text-3xl font-bold text-white tracking-wide">
              Quote Request Submitted
            </h1>
            <p className="font-sans text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you for choosing BRITE Techno. Our industrial sales engineering team will review your specifications and issue a formal quotation shortly.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-4 text-center">
            <span className="font-sans text-xs text-slate-400 tracking-wider uppercase block">
              Quote Request ID
            </span>
            <span className="font-mono text-sm text-amber-400 select-all font-bold mt-1 block">
              {submittedQuoteId}
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="flex-1 bg-amber-500 text-slate-950 font-sans font-bold py-3 px-6 text-xs tracking-widest hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center rounded uppercase"
            >
              BROWSE MORE PRODUCTS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-sans text-slate-400 hover:text-amber-400 transition-colors uppercase font-semibold mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
            </Link>
            <h1 className="font-sans text-3xl font-bold text-white tracking-wide uppercase">
              Submit B2B Quote Request
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-slate-850 border border-slate-800 p-12 text-center rounded-lg max-w-lg mx-auto">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h2 className="font-sans text-xl font-bold text-white mb-2">Your Quote List is Empty</h2>
            <p className="font-sans text-sm text-slate-400 mb-6">
              Please browse our catalog and add items to your Quote List to request customized volume pricing.
            </p>
            <Link
              href="/products"
              className="inline-block bg-amber-500 text-slate-950 font-sans font-bold px-6 py-3 text-xs tracking-widest rounded uppercase hover:bg-amber-400 transition-all"
            >
              EXPLORE LIGHTING CATALOG
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Lead Capture Form */}
            <div className="lg:col-span-7 bg-slate-850 border border-slate-800 rounded-lg p-6 sm:p-8">
              <h2 className="font-sans text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400" /> Company & Contact Information
              </h2>

              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 rounded text-rose-300 text-xs font-sans flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Company Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Industrial Lighting Corp"
                      className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Contact Person <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. John Doe (Procurement Manager)"
                      className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@company.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Phone Number <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Project Details / Notes (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={3}
                      value={projectDetails}
                      onChange={(e) => setProjectDetails(e.target.value)}
                      placeholder="Specify installation timeline, delivery address, or technical requirements..."
                      className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 text-slate-950 font-sans font-bold py-3.5 text-xs tracking-widest hover:bg-amber-400 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 rounded uppercase cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      SUBMITTING QUOTE REQUEST...
                    </>
                  ) : (
                    'SUBMIT B2B QUOTE REQUEST'
                  )}
                </button>
              </form>
            </div>

            {/* Selected Quote Items Summary */}
            <div className="lg:col-span-5 bg-slate-850 border border-slate-800 rounded-lg p-6 sm:p-8 flex flex-col">
              <h2 className="font-sans text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center justify-between">
                <span>Quote List Items</span>
                <span className="text-amber-400 text-sm font-semibold">
                  ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                </span>
              </h2>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px] pr-2">
                {items.map((item) => {
                  const specWattage = item.wattage || '30W';
                  const specCCT = item.cct || '4000K';

                  return (
                    <div
                      key={`${item.productId}-${specWattage}-${specCCT}`}
                      className="flex items-center gap-4 border-b border-slate-800 pb-4"
                    >
                      <div className="relative h-16 w-16 bg-slate-800 border border-slate-700 rounded overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans text-xs font-semibold text-white truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>Wattage: <strong className="text-amber-400">{specWattage}</strong></span>
                          <span>•</span>
                          <span>CCT: <strong className="text-amber-400">{specCCT}</strong></span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          Qty: <span className="text-white font-bold">{item.quantity}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-900/60 rounded p-4">
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Notice: Standard prices are withheld for B2B requests. Direct volume discounts and shipping logistics will be calculated in your custom proposal.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
