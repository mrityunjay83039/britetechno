'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Ticket, AlertCircle } from 'lucide-react';
import {
  createPromoCode,
  updatePromoCode,
  togglePromoCodeActive,
  deletePromoCode,
  PromoCodeInput,
} from '@/app/actions/admin';

export interface SerializedPromoCode {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixedAmount';
  discountValue: number;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface PromosClientProps {
  initialPromos: SerializedPromoCode[];
}

export default function PromosClient({ initialPromos }: PromosClientProps) {
  const [promos, setPromos] = useState<SerializedPromoCode[]>(initialPromos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<SerializedPromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixedAmount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  const handleOpenCreateModal = () => {
    setEditingPromo(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setIsActive(true);
    setUsageLimit('');
    setExpiryDate('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: SerializedPromoCode) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue);
    setIsActive(promo.isActive);
    setUsageLimit(promo.usageLimit ? String(promo.usageLimit) : '');
    setExpiryDate(promo.expiryDate ? new Date(promo.expiryDate).toISOString().split('T')[0] : '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (promo: SerializedPromoCode) => {
    const newStatus = !promo.isActive;
    // Optimistic UI update
    setPromos((prev) =>
      prev.map((p) => (p._id === promo._id ? { ...p, isActive: newStatus } : p))
    );

    const res = await togglePromoCodeActive(promo._id, newStatus);
    if (!res.success) {
      alert(res.error || 'Failed to toggle promo active status.');
      // Revert optimistic update
      setPromos((prev) =>
        prev.map((p) => (p._id === promo._id ? { ...p, isActive: promo.isActive } : p))
      );
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    setIsLoading(true);
    const res = await deletePromoCode(promoId);
    setIsLoading(false);

    if (res.success) {
      setPromos((prev) => prev.filter((p) => p._id !== promoId));
    } else {
      alert(res.error || 'Failed to delete promo code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Promo code is required.');
      return;
    }
    if (discountValue < 0) {
      setErrorMsg('Discount value cannot be negative.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const payload: PromoCodeInput = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      isActive,
      usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
      expiryDate: expiryDate ? expiryDate : null,
    };

    if (editingPromo) {
      const res = await updatePromoCode(editingPromo._id, payload);
      setIsLoading(false);
      if (res.success && res.data) {
        setPromos((prev) =>
          prev.map((p) => (p._id === editingPromo._id ? res.data : p))
        );
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Failed to update promo code.');
      }
    } else {
      const res = await createPromoCode(payload);
      setIsLoading(false);
      if (res.success && res.data) {
        setPromos((prev) => [res.data, ...prev]);
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Failed to create promo code.');
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C5A880]/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-[#FAF8F5] flex items-center gap-3">
            <Ticket className="w-8 h-8 text-[#C5A880]" /> Promo Codes
          </h1>
          <p className="font-sans text-xs text-[#8C857B] mt-1">
            Generate and manage promotional discounts and coupon codes for checkout campaigns.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-[#C5A880] text-[#0F0F11] font-sans font-bold px-5 py-2.5 rounded-sm text-xs tracking-wider hover:bg-[#FAF8F5] transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> CREATE PROMO CODE
        </button>
      </div>

      {/* Promo Codes Data Table */}
      <div className="bg-[#0F0F11] border border-[#C5A880]/15 rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#C5A880]/15 bg-black/40 font-sans text-[11px] tracking-wider text-[#C5A880] uppercase">
                <th className="py-4 px-6 font-bold">Code</th>
                <th className="py-4 px-6 font-bold">Discount</th>
                <th className="py-4 px-6 font-bold">Usage</th>
                <th className="py-4 px-6 font-bold">Expiry Date</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A880]/10 font-sans text-xs">
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C857B]">
                    No promo codes created yet. Click &quot;Create Promo Code&quot; to generate one.
                  </td>
                </tr>
              ) : (
                promos.map((promo) => {
                  const isExpired =
                    promo.expiryDate && new Date() > new Date(promo.expiryDate);
                  const isLimitReached =
                    promo.usageLimit && promo.usedCount >= promo.usageLimit;

                  return (
                    <tr
                      key={promo._id}
                      className="hover:bg-white/5 transition-colors text-[#FAF8F5]"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-sm tracking-wider text-[#C5A880]">
                        {promo.code}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold">
                          {promo.discountType === 'percentage'
                            ? `${promo.discountValue}% OFF`
                            : `₹${promo.discountValue} OFF`}
                        </span>
                        <span className="block text-[10px] text-[#8C857B] uppercase mt-0.5">
                          {promo.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">
                          {promo.usedCount}{' '}
                          <span className="text-[#8C857B]">
                            / {promo.usageLimit ? promo.usageLimit : '∞'}
                          </span>
                        </span>
                        {isLimitReached && (
                          <span className="block text-[10px] text-amber-400 font-bold mt-0.5">
                            Limit Reached
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {promo.expiryDate ? (
                          <div>
                            <span>{new Date(promo.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {isExpired && (
                              <span className="block text-[10px] text-red-400 font-bold mt-0.5">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8C857B]">No Expiry</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(promo)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                            promo.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                          title="Click to toggle status"
                        >
                          {promo.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-400" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-zinc-400" /> Paused
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(promo)}
                          className="p-1.5 text-[#8C857B] hover:text-[#C5A880] transition-colors rounded hover:bg-white/5"
                          title="Edit Promo Code"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo._id)}
                          className="p-1.5 text-[#8C857B] hover:text-red-400 transition-colors rounded hover:bg-white/5"
                          title="Delete Promo Code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F0F11] border border-[#C5A880]/30 rounded-lg max-w-lg w-full p-6 text-[#FAF8F5] shadow-2xl relative">
            <h2 className="font-serif text-xl font-bold tracking-wide text-[#C5A880] mb-4">
              {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-bold text-[#8C857B] tracking-wider uppercase mb-1">
                  Promo Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INSTA10"
                  className="w-full bg-black/50 border border-[#C5A880]/30 rounded px-3 py-2 text-sm font-mono tracking-wider focus:outline-none focus:border-[#C5A880] uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-[#8C857B] tracking-wider uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as 'percentage' | 'fixedAmount')
                    }
                    className="w-full bg-black/50 border border-[#C5A880]/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixedAmount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-[#8C857B] tracking-wider uppercase mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="10 or 500"
                    className="w-full bg-black/50 border border-[#C5A880]/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-[#8C857B] tracking-wider uppercase mb-1">
                    Global Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="e.g. 100 (Blank = Unlimited)"
                    className="w-full bg-black/50 border border-[#C5A880]/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-[#8C857B] tracking-wider uppercase mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-black/50 border border-[#C5A880]/30 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A880]"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="font-sans text-xs font-medium text-[#FAF8F5] cursor-pointer"
                >
                  Campaign Active (Uncheck to pause immediately)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#C5A880]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#8C857B]/30 rounded text-xs font-bold text-[#8C857B] hover:text-[#FAF8F5] transition-colors"
                  disabled={isLoading}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-[#C5A880] text-[#0F0F11] rounded text-xs font-bold tracking-wider hover:bg-[#FAF8F5] transition-all flex items-center gap-2"
                >
                  {isLoading && (
                    <span className="w-3.5 h-3.5 border-2 border-[#0F0F11] border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingPromo ? 'UPDATE PROMO' : 'CREATE PROMO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
