'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import LogoImage from '@/components/LogoImage';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to request password reset. Please try again.');
      } else {
        setMessage(data.message || 'If an account exists with that email address, we have sent a password reset link.');
        setEmail('');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#0F172A]">
      {/* Brand Header */}
      <div className="sm:mx-auto w-full max-w-md text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <LogoImage width={200} height={50} />
        </Link>
        <h2 className="mt-4 font-sans text-2xl font-bold text-[#0F172A] tracking-wide">
          Forgot Password
        </h2>
        <p className="font-sans text-xs text-zinc-500 mt-1 tracking-wider uppercase">
          Enter your email to receive a password reset link
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-150 rounded-sm sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-red-800 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-4 flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-emerald-800 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#1E3A8A]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] text-[#0F172A] font-semibold text-sm font-sans outline-none rounded-sm placeholder-zinc-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1E3A8A] text-white border border-[#1E3A8A] hover:bg-[#1D4ED8] hover:border-[#1D4ED8] disabled:opacity-50 font-sans text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer uppercase rounded-sm flex items-center justify-center gap-2 group shadow-md"
              >
                {loading ? (
                  <span>Sending Link...</span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-zinc-600 hover:text-[#1E3A8A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
