'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Phone, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import CaptchaChallenge, { CaptchaHandle } from '@/components/CaptchaChallenge';
import LogoImage from '@/components/LogoImage';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<CaptchaHandle>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Client Validations
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Validate Captcha
    if (captchaRef.current && !captchaRef.current.validate()) {
      setError('Security CAPTCHA verification failed. Please check your answer.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          captchaValid: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        if (captchaRef.current) captchaRef.current.refresh();
        setLoading(false);
      } else {
        // Registration successful! Redirect to OTP verification page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch {
      setError('An unexpected error occurred during registration. Please try again.');
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
          Register Business Account
        </h2>
        <p className="font-sans text-xs text-slate-500 mt-1 tracking-wider uppercase">
          BRITE Techno Lighting Inc. — Commercial & Industrial Solutions
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-red-800 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                Full Name / Company Representative <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-[#0066B4]" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-[#0F172A] font-semibold text-sm font-sans outline-none rounded-lg placeholder-slate-400"
                  placeholder="e.g. John Doe (Acme Contracting)"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Mobile Number */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                  Contact Phone Number
                </label>
                <span className="font-sans text-[10px] text-slate-500 font-medium">
                  (For quote updates)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-[#0066B4]" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-[#0F172A] font-semibold text-sm font-sans outline-none rounded-lg placeholder-slate-400"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                Password <span className="text-red-500">*</span>
              </label>
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
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="font-sans text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#0066B4]" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-[#0F172A] font-semibold text-sm font-sans outline-none rounded-lg placeholder-slate-400"
                  placeholder="Re-enter password"
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
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link to Login */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="font-sans text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-[#0066B4] hover:text-[#005293] transition-colors underline underline-offset-4"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
