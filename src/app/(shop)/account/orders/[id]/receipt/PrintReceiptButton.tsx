'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintReceiptButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center gap-2 bg-[#1E3A8A] text-[#FFFFFF] border border-[#1E3A8A]/30 hover:bg-[#1E3A8A] hover:text-[#1E3A8A] font-sans text-xs font-bold tracking-widest px-6 py-3 uppercase transition-all duration-300 rounded-sm cursor-pointer shadow-md"
    >
      <Printer className="h-4 w-4" />
      Print Receipt
    </button>
  );
}
