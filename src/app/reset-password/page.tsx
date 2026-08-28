'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import LogoImage from '@/components/LogoImage';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError('Password reset token is missing from URL.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset password. Please try again or request a new reset link.');
      } else {
        setSuccessMessage(data.message || 'Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 1500);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white py-8 px-6 shadow-xl border border-gray-150 rounded-sm sm:px-10 text-center">
        <div className="bg-red-50 border border-red-200 rounded-sm p-4 flex items-center justify-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="font-sans text-xs text-red-800 font-medium">
            Invalid password reset link. No token provided.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-[#FF6F61] hover:text-[#E05A47] underline uppercase tracking-wider"
        >
          Request New Reset Link &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-6 shadow-xl border border-gray-150 rounded-sm sm:px-10">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-red-800 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-4 flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-emerald-800 font-medium leading-relaxed">
              {successMessage}
            </p>
          </div>
        )}

        {/* New Password Field */}
        <div className="space-y-1">
          <label className="font-sans text-xs font-bold text-[#222222] uppercase tracking-wider block">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[#FF6F61]" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-[#222222] font-semibold text-sm font-sans outline-none rounded-sm placeholder-zinc-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-1">
          <label className="font-sans text-xs font-bold text-[#222222] uppercase tracking-wider block">
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ShieldCheck className="h-4 w-4 text-[#FF6F61]" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-[#222222] font-semibold text-sm font-sans outline-none rounded-sm placeholder-zinc-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="w-full py-3.5 bg-[#FF6F61] text-white border border-[#FF6F61] hover:bg-[#E05A47] hover:border-[#E05A47] disabled:opacity-50 font-sans text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer uppercase rounded-sm flex items-center justify-center gap-2 group shadow-md"
          >
            {loading ? <span>Resetting Password...</span> : <span>Reset Password</span>}
          </button>
        </div>
      </form>

      {/* Back to Login Link */}
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-zinc-600 hover:text-[#FF6F61] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#222222]">
      {/* Brand Header */}
      <div className="sm:mx-auto w-full max-w-md text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <LogoImage width={200} height={50} />
        </Link>
        <h2 className="mt-4 font-serif text-2xl font-bold text-[#222222] tracking-wide">
          Reset Password
        </h2>
        <p className="font-sans text-xs text-zinc-500 mt-1 tracking-wider uppercase">
          Create a new secure password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <Suspense
          fallback={
            <div className="bg-white py-8 px-6 shadow-xl border border-gray-150 rounded-sm sm:px-10 text-center font-sans text-xs text-zinc-500">
              Loading password reset form...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
