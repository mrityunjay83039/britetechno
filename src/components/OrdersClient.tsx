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
        <div className="flex flex-wrap gap-2">
          {['ALL', 'Pending Review', 'Quoted', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-sans text-xs font-bold tracking-wider transition-all cursor-pointer uppercase shadow-xs ${
                filterStatus === status
                  ? 'bg-[#0066B4] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Global Floating-style feedback */}
        {feedback && (
          <div className={`p-3 border rounded-lg flex items-center gap-2 max-w-md ${
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
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 font-sans font-medium shadow-xs">
            No quote requests found matching status: <strong className="text-slate-900 uppercase">{filterStatus}</strong>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const isExpanded = !!expandedQuotes[quote._id];
            const quoteDate = new Date(quote.createdAt).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={quote._id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header (always visible) */}
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/50 border-b border-slate-100">
                  {/* Quote Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Quote Ref</span>
                      <span className="font-mono text-xs font-bold text-slate-900">{quote._id}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Company / Contact</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                        <Building className="w-3.5 h-3.5 text-[#0066B4]" />
                        <span>{quote.companyName}</span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium block">{quote.contactName}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Contact Details</span>
                      <div className="flex items-center gap-1 text-xs text-slate-800 font-medium">
                        <Mail className="w-3.5 h-3.5 text-[#0066B4]" />
                        <span>{quote.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <Phone className="w-3 h-3 text-[#0066B4]" />
                        <span>{quote.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Date & Time</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#0066B4]" />
                        <span>{quoteDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status dropdown */}
                  <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-200">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Quote Status</span>
                      <div className="flex items-center gap-2">
                        <select
                          disabled={updatingId === quote._id}
                          value={quote.status}
                          onChange={(e) => handleStatusChange(quote._id, e.target.value as 'Pending Review' | 'Quoted' | 'Closed')}
                          className={`px-3 py-1.5 border border-slate-300 rounded-lg font-sans text-xs font-bold uppercase tracking-wider outline-none bg-white text-slate-900 cursor-pointer focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] transition-all shadow-xs ${
                            updatingId === quote._id ? 'opacity-50' : ''
                          }`}
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Closed">Closed</option>
                        </select>

                        {updatingId === quote._id ? (
                          <Loader2 className="w-4 h-4 text-[#0066B4] animate-spin" />
                        ) : (
                          <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase ${getStatusBadgeClass(quote.status)}`}>
                            {quote.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(quote._id)}
                      className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer mt-4 self-end shadow-xs"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Card Expandable Body */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Requested Products */}
                      <div className="md:col-span-7 space-y-3">
                        <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#0066B4]" /> Requested Line Items ({quote.items.length})
                        </h4>

                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                                <th className="py-2.5 px-4">Fixture / Product Title</th>
                                <th className="py-2.5 px-4 text-center">Requested Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans">
                              {quote.items.map((item, idx) => (
                                <tr key={idx} className="text-slate-900 hover:bg-slate-50/60 transition-colors">
                                  <td className="py-3 px-4 font-semibold text-slate-800">{item.title}</td>
                                  <td className="py-3 px-4 text-center font-bold text-[#0066B4]">{item.quantity} units</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="md:col-span-5 space-y-3">
                        <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Project Details & Notes
                        </h4>

                        <div className="bg-white p-4 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 leading-relaxed shadow-xs">
                          {quote.projectDetails ? (
                            <p className="whitespace-pre-wrap">{quote.projectDetails}</p>
                          ) : (
                            <p className="italic text-slate-400">No additional project notes supplied by contractor.</p>
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
