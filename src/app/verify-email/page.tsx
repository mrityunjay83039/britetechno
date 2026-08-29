'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Mail, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import BhavatsyamLogo from '@/components/BhavatsyamLogo';

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const urlEmail = searchParams.get('email') || '';
  const urlToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(urlEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown === 0;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatic verification if token URL parameter is present
  useEffect(() => {
    if (urlToken && !success) {
      const verifyToken = async () => {
        setLoading(true);
        try {
          // Token legacy verification
          const res = await fetch(`/api/auth/verify-token?token=${urlToken}`);
          const data = await res.json();
          if (data.success) {
            setSuccess(true);
          }
        } catch {
          // Fallback to manual entry if token API isn't handling token param directly
        } finally {
          setLoading(false);
        }
      };
      verifyToken();
    }
  }, [urlToken, success]);

  // Countdown timer for Resend OTP button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus management for 6-digit OTP input boxes
  const handleDigitChange = (index: number, val: string) => {
    const digit = val.slice(-1); // Take last character entered
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto focus next box if digit typed
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: fullOtp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed. Please check the OTP code.');
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred during OTP verification. Please try again.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setError(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setError('Please provide your email address to resend OTP.');
      return;
    }

    setResending(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to resend verification code.');
      } else {
        setInfoMessage('A new 6-digit OTP verification code has been sent to your email.');
        setCountdown(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Error resending verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto w-full max-w-md text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <BhavatsyamLogo variant="dark" width={240} height={60} />
        </Link>
        <h2 className="mt-4 font-sans text-2xl font-bold text-[#1E3A8A] tracking-wide">
          Email Verification
        </h2>
        <p className="font-sans text-xs text-[#64748B] mt-1 tracking-wider uppercase">
          Enter 6-digit OTP code sent to your email
        </p>
      </div>

      {/* Main Content Box */}
      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-[#1E3A8A] text-[#FFFFFF] py-8 px-6 shadow-2xl border border-[#1E3A8A]/30 rounded-sm sm:px-10">
          {success ? (
            /* Successful Verification State */
            <div className="space-y-6 text-center animate-in zoom-in duration-300">
              <div className="flex justify-center">
                <div className="bg-[#1E3A8A]/15 p-4 rounded-full border border-[#1E3A8A]/40">
                  <CheckCircle2 className="w-14 h-14 text-[#1E3A8A]" />
                </div>
              </div>
              <h3 className="font-sans text-2xl font-bold text-[#1E3A8A] tracking-wide">
                Email Verified Successfully!
              </h3>
              <p className="font-sans text-xs text-[#FFFFFF]/80 leading-relaxed">
                Thank you for verifying your email. Your account is now fully active,
                and you can proceed to sign in to access your profile and our collections.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3.5 bg-[#1E3A8A] text-white hover:bg-slate-100 hover:text-[#1E3A8A] font-sans text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer uppercase rounded-sm flex items-center justify-center gap-2 font-bold shadow-lg"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* OTP Code Entry Form */
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3.5 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-red-200 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {infoMessage && (
                <div className="bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 rounded-sm p-3.5 flex items-start gap-2.5 animate-in fade-in">
                  <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-[#1E3A8A] font-medium leading-relaxed">{infoMessage}</p>
                </div>
              )}

              {/* Email Address Display / Edit */}
              <div className="space-y-1">
                <label className="font-sans text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white text-[#1E3A8A] font-semibold text-xs font-sans rounded-sm outline-none border border-[#1E3A8A]/30 focus:border-[#1E3A8A] placeholder-[#64748B]"
                    placeholder="yourname@example.com"
                  />
                </div>
              </div>

              {/* 6-Digit OTP Box Entry */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-sans text-xs font-bold text-[#FFFFFF] uppercase tracking-wider block">
                    6-Digit Verification Code (OTP)
                  </label>
                  <span className="text-[10px] text-[#64748B] font-sans">
                    Check your inbox & spam folder
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="w-11 h-12 text-center text-xl font-mono font-bold bg-white text-[#1E3A8A] border border-[#1E3A8A]/60 rounded-sm focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Verify OTP Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-50 font-sans text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer uppercase rounded-sm shadow-md"
                >
                  {loading ? 'Verifying OTP Code...' : 'Verify & Activate Account'}
                </button>
              </div>

              {/* Resend OTP Section with Countdown Timer */}
              <div className="pt-4 border-t border-[#1E3A8A]/15 text-center flex items-center justify-between">
                <span className="font-sans text-xs text-[#64748B]">
                  Didn&apos;t receive the code?
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || resending}
                  className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-[#1E3A8A] hover:text-[#FFFFFF] disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {canResend ? 'Resend OTP Code' : `Resend OTP in ${countdown}s`}
                </button>
              </div>

              {/* Login link */}
              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="font-sans text-xs text-[#64748B] hover:text-[#1E3A8A] transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
          <p className="font-sans text-[#1E3A8A] text-lg font-bold animate-pulse">
            Loading BHAVATSYAM Verification...
          </p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
