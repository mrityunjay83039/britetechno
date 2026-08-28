'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 font-sans text-xs font-bold tracking-widest text-[#8C857B] hover:text-red-500 transition-colors uppercase border border-[#C5A880]/15 hover:border-red-500/30 px-4 py-2 rounded-sm cursor-pointer"
    >
      <LogOut className="h-4.5 w-4.5" />
      Log Out
    </button>
  );
}
