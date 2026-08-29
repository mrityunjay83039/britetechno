'use client';

import React, { useState } from 'react';
import { updateQuoteStatus } from '@/app/actions/admin';
import { Calendar, Building, Phone, Mail, Package, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface QuoteItem {
  productId: string;
  title: string;
  quantity: number;
}

interface QuoteRequestData {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  } | string | null;
  companyName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  projectDetails?: string;
  items: QuoteItem[];
  status: 'Pending Review' | 'Quoted' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

interface OrdersClientProps {
  initialOrders: QuoteRequestData[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [quotes, setQuotes] = useState<QuoteRequestData[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedQuotes(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStatusChange = async (quoteId: string, newStatus: 'Pending Review' | 'Quoted' | 'Closed') => {
    setUpdatingId(quoteId);
    setFeedback(null);

    const res = await updateQuoteStatus(quoteId, newStatus);

    if (res.success && res.data) {
      setQuotes(prev =>
        prev.map(q => (q._id === quoteId ? { ...q, status: newStatus } : q))
      );
      setFeedback({
        type: 'success',
        message: `Quote status successfully updated to ${newStatus}.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update quote status.',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
    setUpdatingId(null);
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === 'ALL') return true;
    return quote.status === filterStatus;
  });

  const getStatusBadgeClass = (status: QuoteRequestData['status']) => {
    switch (status) {
      case 'Quoted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Pending Review':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Feedbacks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tab-style */}
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'Pending Review', 'Quoted', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 border rounded-sm font-sans text-xs font-bold tracking-wider transition-all cursor-pointer uppercase ${
                filterStatus === status
                  ? 'bg-[#1E3A8A] text-[#FFFFFF] border-[#1E3A8A]'
                  : 'bg-white text-[#64748B] border-[#1E3A8A]/15 hover:border-[#1E3A8A]/35 hover:text-[#1E3A8A]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Global Floating-style feedback */}
        {feedback && (
          <div className={`p-3 border rounded-sm flex items-center gap-2 max-w-md ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <p className="font-sans text-xs font-semibold">{feedback.message}</p>
          </div>
        )}
      </div>

      {/* Quote Requests List */}
      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <div className="bg-white border border-[#C5A880]/15 rounded-sm p-12 text-center text-[#8C857B] font-sans font-medium">
            No quote requests found matching status: <strong className="text-[#0F0F11] uppercase">{filterStatus}</strong>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const isExpanded = !!expandedQuotes[quote._id];
            const quoteDate = new Date(quote.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={quote._id}
                className="bg-white border border-[#C5A880]/15 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                {/* Card Header (always visible) */}
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#FAF8F5]/40 border-b border-[#C5A880]/10">
                  {/* Quote Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8C857B] font-bold uppercase tracking-wider block">Quote Ref</span>
                      <span className="font-mono text-xs font-bold text-[#0F0F11]">{quote._id}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8C857B] font-bold uppercase tracking-wider block">Company / Contact</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#0F0F11] font-semibold">
                        <Building className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{quote.companyName}</span>
                      </div>
                      <span className="text-[10px] text-[#8C857B] block">{quote.contactName}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8C857B] font-bold uppercase tracking-wider block">Contact Details</span>
                      <div className="flex items-center gap-1 text-xs text-[#0F0F11]">
                        <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{quote.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#8C857B]">
                        <Phone className="w-3 h-3 text-[#C5A880]" />
                        <span>{quote.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8C857B] font-bold uppercase tracking-wider block">Date & Time</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#0F0F11]">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{quoteDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status dropdown */}
                  <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#1E3A8A]/10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8C857B] font-bold uppercase tracking-wider block">Quote Status</span>
                      <div className="flex items-center gap-2">
                        <select
                          disabled={updatingId === quote._id}
                          value={quote.status}
                          onChange={(e) => handleStatusChange(quote._id, e.target.value as 'Pending Review' | 'Quoted' | 'Closed')}
                          className={`px-3 py-1.5 border border-[#C5A880]/20 rounded-sm font-sans text-xs font-bold uppercase tracking-wider outline-none bg-white text-[#0F0F11] cursor-pointer focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all ${
                            updatingId === quote._id ? 'opacity-50' : ''
                          }`}
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Closed">Closed</option>
                        </select>

                        {updatingId === quote._id ? (
                          <Loader2 className="w-4 h-4 text-[#C5A880] animate-spin" />
                        ) : (
                          <span className={`inline-block px-2 py-1 rounded-sm border text-[10px] font-bold tracking-wider ${getStatusBadgeClass(quote.status)}`}>
                            {quote.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(quote._id)}
                      className="p-2 border border-[#C5A880]/20 rounded-sm hover:bg-[#FAF8F5] text-[#8C857B] hover:text-[#0F0F11] transition-all cursor-pointer mt-4 self-end"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Card Expandable Body */}
                {isExpanded && (
                  <div className="p-6 bg-[#FFFFFF]/10 border-t border-[#1E3A8A]/10 space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Requested Products */}
                      <div className="md:col-span-7 space-y-3">
                        <h4 className="font-serif text-sm font-bold text-[#0F0F11] tracking-wide flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#C5A880]" /> Requested Line Items ({quote.items.length})
                        </h4>

                        <div className="border border-[#1E3A8A]/15 rounded-sm overflow-hidden bg-white">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-[#FAF8F5] text-[#8C857B] font-bold uppercase tracking-wider border-b border-[#C5A880]/10">
                                <th className="py-2 px-4">Product Title</th>
                                <th className="py-2 px-4 text-center">Quantity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#C5A880]/10 font-sans">
                              {quote.items.map((item, idx) => (
                                <tr key={idx} className="text-[#0F0F11]">
                                  <td className="py-2.5 px-4 font-semibold">{item.title}</td>
                                  <td className="py-2.5 px-4 text-center font-bold text-[#0F0F11]">{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="md:col-span-5 space-y-3">
                        <h4 className="font-serif text-sm font-bold text-[#0F0F11] tracking-wide">
                          Project Details & Notes
                        </h4>

                        <div className="bg-white p-4 border border-[#C5A880]/15 rounded-sm text-xs font-sans text-[#0F0F11] leading-relaxed">
                          {quote.projectDetails ? (
                            <p>{quote.projectDetails}</p>
                          ) : (
                            <p className="italic text-[#8C857B]">No additional project notes supplied.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
