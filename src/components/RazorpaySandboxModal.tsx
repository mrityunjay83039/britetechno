'use client';

import React, { useState } from 'react';
import { ShieldCheck, CreditCard, QrCode, Building2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface RazorpaySandboxModalProps {
  isOpen: boolean;
  orderId: string;
  amount: number; // in paise
  currency: string;
  onSuccess: (paymentId: string, signature: string) => Promise<void>;
  onDismiss: () => void;
}

export default function RazorpaySandboxModal({
  isOpen,
  orderId,
  amount,
  currency = 'INR',
  onSuccess,
  onDismiss,
}: RazorpaySandboxModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);

  const handleSimulateSuccess = async () => {
    setProcessing(true);
    setError(null);
    try {
      const mockPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const mockSignature = `sig_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await onSuccess(mockPaymentId, mockSignature);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Payment simulation failed.';
      setError(errMsg);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-[#0F0F11] w-full max-w-lg rounded-sm border border-[#C5A880]/30 shadow-2xl text-[#FAF8F5] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0A0A0C] px-6 py-4 border-b border-[#C5A880]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-[#C5A880] text-[#0F0F11] text-[10px] font-bold tracking-widest uppercase rounded-xs">
              TEST SANDBOX
            </div>
            <span className="font-serif text-sm font-semibold text-[#FAF8F5] tracking-wide">
              Razorpay Payment Gateway Simulation
            </span>
          </div>
          <button
            onClick={onDismiss}
            disabled={processing}
            className="text-[#8C857B] hover:text-[#FAF8F5] p-1 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Banner */}
        <div className="bg-[#FAF8F5]/5 px-6 py-4 border-b border-[#C5A880]/15 flex items-center justify-between">
          <div>
            <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider block">
              Order ID: <strong className="text-[#C5A880] font-mono select-all">{orderId}</strong>
            </span>
            <span className="font-sans text-xs text-[#FAF8F5] font-semibold mt-0.5 block">
              BHAVATSYAM Heritage Collection
            </span>
          </div>
          <div className="text-right">
            <span className="font-sans text-[10px] text-[#8C857B] uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="font-serif text-xl font-bold text-[#C5A880]">
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-950/60 border border-red-500/30 rounded-sm p-3.5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-red-200">{error}</p>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-[#8C857B] uppercase tracking-wider block">
              Select Test Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880]'
                    : 'bg-white/5 border-white/10 text-[#8C857B] hover:text-[#FAF8F5]'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-sans text-[11px] font-bold uppercase">Test Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'upi'
                    ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880]'
                    : 'bg-white/5 border-white/10 text-[#8C857B] hover:text-[#FAF8F5]'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="font-sans text-[11px] font-bold uppercase">Test UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'netbanking'
                    ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880]'
                    : 'bg-white/5 border-white/10 text-[#8C857B] hover:text-[#FAF8F5]'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-sans text-[11px] font-bold uppercase">NetBanking</span>
              </button>
            </div>
          </div>

          {/* Test Credentials Info Box */}
          <div className="bg-[#FAF8F5]/5 border border-[#C5A880]/20 p-4 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-[#C5A880] font-sans text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Sandbox Test Details</span>
            </div>

            {selectedMethod === 'card' && (
              <div className="font-mono text-xs text-[#8C857B] space-y-1">
                <p>Card Number: <span className="text-[#FAF8F5] select-all">4111 1111 1111 1111</span> (Razorpay Standard Test)</p>
                <p>Expiry: <span className="text-[#FAF8F5]">12/30</span> | CVV: <span className="text-[#FAF8F5]">123</span></p>
              </div>
            )}

            {selectedMethod === 'upi' && (
              <div className="font-mono text-xs text-[#8C857B] space-y-1">
                <p>VPA / UPI ID: <span className="text-[#FAF8F5] select-all">success@razorpay</span></p>
                <p>Instant UPI Sandbox Auto-Approval</p>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="font-mono text-xs text-[#8C857B] space-y-1">
                <p>Bank: <span className="text-[#FAF8F5]">HDFC / ICICI / SBI Test NetBanking</span></p>
                <p>Simulated NetBanking Auth</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0A0A0C] px-6 py-4 border-t border-[#C5A880]/15 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onDismiss}
            disabled={processing}
            className="px-4 py-2.5 border border-[#C5A880]/30 text-[#8C857B] hover:text-[#FAF8F5] font-sans text-xs font-bold tracking-wider uppercase rounded-sm transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSimulateSuccess}
            disabled={processing}
            className="flex-1 px-6 py-3 bg-[#C5A880] text-[#0F0F11] font-sans text-xs font-bold tracking-widest uppercase hover:bg-[#FAF8F5] transition-all rounded-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {processing ? (
              <>
                <span className="w-4 h-4 animate-spin rounded-full border-2 border-[#0F0F11] border-t-transparent" />
                <span>Simulating Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Successful Payment</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
