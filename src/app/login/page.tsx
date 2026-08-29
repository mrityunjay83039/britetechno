'use client';

import React, { useState, useRef, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import CaptchaChallenge, { CaptchaHandle } from '@/components/CaptchaChallenge';
import LogoImage from '@/components/LogoImage';

function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<CaptchaHandle>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);

    // Validate Captcha
    if (captchaRef.current && !captchaRef.current.validate()) {
      setError('Security CAPTCHA verification failed. Please check your answer.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        const errorMsg = res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error;
        setError(errorMsg);

        // Check if error is due to unverified email
        if (errorMsg.toLowerCase().includes('verify') || errorMsg.toLowerCase().includes('unverified')) {
          setUnverifiedEmail(email);
        }

        if (captchaRef.current) captchaRef.current.refresh();
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      if (captchaRef.current) captchaRef.current.refresh();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#0F172A]">
      {/* Brand Header */}
      <div className="sm:mx-auto w-full max-w-md text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <LogoImage width={220} height={55} />
        </Link>
        <h2 className="mt-4 font-sans text-2xl font-bold text-[#0F172A] tracking-wide">
          B2B Account Sign In
        </h2>
        <p className="font-sans text-xs text-slate-500 mt-1 tracking-wider uppercase">
          Welcome to BRITE Techno Lighting Inc.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-xl sm:px-10">
          {resetSuccess && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-emerald-800 font-medium leading-relaxed">
                Your password has been reset successfully. Please sign in with your new password.
              </p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-red-800 font-medium leading-relaxed">{error}</p>
                </div>

                {/* Quick Link to OTP verification if unverified */}
                {unverifiedEmail && (
                  <div className="pt-2 border-t border-red-200 text-right">
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                      className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-red-700 hover:text-red-900 underline"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Verify Email with OTP Now &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#0066B4]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-[#0F172A] font-semibold text-sm font-sans outline-none rounded-lg placeholder-slate-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-sans text-xs text-[#0066B4] hover:text-[#005293] font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#0066B4]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-[#0F172A] font-semibold text-sm font-sans outline-none rounded-lg placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Bot Protection CAPTCHA Challenge */}
            <div className="pt-2 border-t border-slate-100">
              <CaptchaChallenge ref={captchaRef} />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0066B4] text-white border border-[#0066B4] hover:bg-[#005293] disabled:opacity-50 font-sans text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer uppercase rounded-lg flex items-center justify-center gap-2 group shadow-md"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link to Register */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="font-sans text-xs text-slate-500">
              Don&apos;t have a business account?{' '}
              <Link
                href="/register"
                className="font-bold text-[#0066B4] hover:text-[#005293] transition-colors underline underline-offset-4"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500">
          Loading login page...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
