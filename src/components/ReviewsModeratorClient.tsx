'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Trash2, Eye, EyeOff, MessageSquare, ExternalLink, AlertCircle } from 'lucide-react';

interface ReviewUser {
  _id: string;
  name: string;
  email: string;
}

interface ReviewProduct {
  _id: string;
  title: string;
  slug: string;
}

interface AdminReview {
  _id: string;
  product: ReviewProduct | null;
  user: ReviewUser | null;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

interface ReviewsModeratorClientProps {
  initialReviews: AdminReview[];
}

export default function ReviewsModeratorClient({ initialReviews }: ReviewsModeratorClientProps) {
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>('');

  const handleToggleApproval = async (reviewId: string, currentApproved: boolean) => {
    setLoadingId(reviewId);
    setActionError('');

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          isApproved: !currentApproved,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionError(data.error || 'Failed to update review status.');
      } else {
        // Update local state
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isApproved: !currentApproved } : r))
        );
      }
    } catch (err) {
      console.error('Error toggling review approval:', err);
      setActionError('An error occurred. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this customer review? This action cannot be undone.')) {
      return;
    }

    setLoadingId(reviewId);
    setActionError('');

    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionError(data.error || 'Failed to delete review.');
      } else {
        // Remove from local state
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setActionError('An error occurred. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {actionError && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-sans">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white border border-slate-200 p-16 text-center rounded-xl flex flex-col items-center justify-center shadow-xs">
          <MessageSquare className="h-10 w-10 text-slate-300 mb-4" />
          <p className="font-sans text-base font-bold text-slate-900">No Reviews Found</p>
          <p className="font-sans text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
            There are currently no customer reviews submitted on the platform.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Reviewer</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-6">Submitted At</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((review) => {
                  const isActionLoading = loadingId === review._id;

                  return (
                    <tr key={review._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product details */}
                      <td className="py-4 px-6 font-semibold">
                        {review.product ? (
                          <Link
                            href={`/products/${review.product.slug}`}
                            target="_blank"
                            className="text-[#0066B4] hover:text-[#005293] font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <span className="line-clamp-2 max-w-[150px]">{review.product.title}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                          </Link>
                        ) : (
                          <span className="text-rose-500 italic">Deleted Product</span>
                        )}
                      </td>

                      {/* Reviewer details */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-900 font-bold">
                            {review.user ? review.user.name : 'Unknown User'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {review.user ? review.user.email : 'Deleted Email'}
                          </span>
                        </div>
                      </td>

                      {/* Rating details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Comment text */}
                      <td className="py-4 px-6 max-w-[250px]">
                        <p className="line-clamp-3 text-slate-700 leading-relaxed font-medium">
                          {review.comment}
                        </p>
                      </td>

                      {/* Created date */}
                      <td className="py-4 px-6 text-slate-600 font-medium whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString('en-CA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            review.isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 line-through'
                          }`}
                        >
                          {review.isApproved ? 'Approved' : 'Hidden'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Approval Button */}
                          <button
                            onClick={() => handleToggleApproval(review._id, review.isApproved)}
                            disabled={isActionLoading}
                            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer shadow-xs ${
                              review.isApproved
                                ? 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                : 'border-[#0066B4]/30 bg-[#0066B4]/10 text-[#0066B4] hover:bg-[#0066B4] hover:text-white'
                            }`}
                            title={review.isApproved ? 'Hide Review' : 'Approve Review'}
                          >
                            {review.isApproved ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            disabled={isActionLoading}
                            className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer shadow-xs"
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
