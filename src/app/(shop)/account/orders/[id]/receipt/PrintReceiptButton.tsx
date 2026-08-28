'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintReceiptButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center gap-2 bg-[#0F0F11] text-[#FAF8F5] border border-[#C5A880]/30 hover:bg-[#C5A880] hover:text-[#0F0F11] font-sans text-xs font-bold tracking-widest px-6 py-3 uppercase transition-all duration-300 rounded-sm cursor-pointer shadow-md"
    >
      <Printer className="h-4 w-4" />
      Print Receipt
    </button>
  );
}
