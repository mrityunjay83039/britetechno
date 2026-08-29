'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileFormProps {
  initialName: string;
  initialMobile: string;
  email: string;
}

export default function ProfileForm({ initialName, initialMobile, email }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Full Name is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccess('Profile updated successfully!');
      router.refresh(); // Triggers Server Components to reload layout/nav names
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans px-4 py-3 rounded-sm flex items-center gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans px-4 py-3 rounded-sm flex items-center gap-2.5">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Email - Read-Only */}
        <div>
          <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
            Email Address (Read-Only)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]/50">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#1E3A8A]/15 text-[#64748B] text-xs font-sans rounded-sm select-all outline-none cursor-not-allowed"
            />
          </div>
          <span className="block font-sans text-[10px] text-[#64748B]/70 mt-1">
            Email address verification is linked to authentication and cannot be changed.
          </span>
        </div>

        {/* Full Name */}
        <div>
          <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
              <User className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
              <Phone className="h-4 w-4" />
            </span>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-[#1E3A8A] text-[#FFFFFF] border border-[#1E3A8A]/30 hover:bg-[#1E3A8A] hover:text-[#1E3A8A] font-sans text-xs font-bold tracking-widest py-3 px-8 uppercase transition-all duration-300 flex items-center justify-center gap-2 rounded-sm cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving Changes...
          </>
        ) : (
          'Save Profile'
        )}
      </button>

    </form>
  );
}
