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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#222222]">
      {/* Brand Header */}
      <div className="sm:mx-auto w-full max-w-md text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <LogoImage width={200} height={50} />
        </Link>
        <h2 className="mt-4 font-serif text-2xl font-bold text-[#222222] tracking-wide">
          Account Sign In
        </h2>
        <p className="font-sans text-xs text-zinc-500 mt-1 tracking-wider uppercase">
          Welcome back to BHAVATSYAM
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-150 rounded-sm sm:px-10">
          {resetSuccess && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-sm p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-emerald-800 font-medium leading-relaxed">
                Your password has been reset successfully. Please sign in with your new password.
              </p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-3.5 space-y-2 animate-in fade-in duration-200">
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
              <label className="font-sans text-xs font-bold text-[#222222] uppercase tracking-wider block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#FF6F61]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-[#222222] font-semibold text-sm font-sans outline-none rounded-sm placeholder-zinc-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs font-bold text-[#222222] uppercase tracking-wider block">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-sans text-xs text-[#FF6F61] hover:text-[#E05A47] font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#FF6F61]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] text-[#222222] font-semibold text-sm font-sans outline-none rounded-sm placeholder-zinc-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Bot Protection CAPTCHA Challenge */}
            <div className="pt-2 border-t border-gray-100">
              <CaptchaChallenge ref={captchaRef} />
            </div>

            {/* Submit Button (Vibrant Coral accent) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FF6F61] text-white border border-[#FF6F61] hover:bg-[#E05A47] hover:border-[#E05A47] disabled:opacity-50 font-sans text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer uppercase rounded-sm flex items-center justify-center gap-2 group shadow-md"
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
          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
            <p className="font-sans text-xs text-zinc-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-[#FF6F61] hover:text-[#E05A47] transition-colors underline underline-offset-4"
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
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans text-xs text-zinc-500">
          Loading login page...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
