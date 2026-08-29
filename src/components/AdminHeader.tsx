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
    <header className="h-16 border-b border-[#1E3A8A]/15 bg-white px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="font-sans text-sm font-semibold text-[#1E3A8A]">
          BHAVATSYAM <span className="text-[#1E3A8A] font-normal font-sans italic ml-1">Admin Portal</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-right hidden sm:flex">
          <div className="text-xs">
            <p className="font-sans font-medium text-[#1E3A8A]">{userName || 'Admin'}</p>
            <p className="font-sans text-[10px] text-[#64748B]">{userEmail || 'admin@bhavatsyam.com'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
            <UserIcon className="w-4 h-4" />
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-red-50 hover:bg-red-100 text-red-600 font-sans text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
