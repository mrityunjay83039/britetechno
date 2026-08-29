'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, User as UserIcon } from 'lucide-react';

interface AdminHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

export default function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2">
        <h1 className="font-sans text-sm font-bold text-slate-900">
          BRITE TECHNO <span className="text-[#0066B4] font-semibold ml-1">Admin Portal</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-right hidden sm:flex">
          <div className="text-xs">
            <p className="font-sans font-bold text-slate-900">{userName || 'Admin'}</p>
            <p className="font-sans text-[11px] text-slate-500 font-medium">{userEmail || 'admin@britetechno.com'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#0066B4]/10 border border-[#0066B4]/20 flex items-center justify-center text-[#0066B4]">
            <UserIcon className="w-4 h-4" />
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-sans text-xs font-bold transition-colors cursor-pointer border border-rose-200 shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
