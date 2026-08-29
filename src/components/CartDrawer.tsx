'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FileText, X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useQuoteListStore, QuoteListState, QuoteListItem } from '@/store/useQuoteListStore';
import { useHydratedStore } from '@/hooks/useHydratedStore';

export default function QuoteDrawer() {
  const router = useRouter();
  const isOpen = useQuoteListStore((state) => state.isOpen);
  const setIsOpen = useQuoteListStore((state) => state.setIsOpen);
  const clearQuoteList = useQuoteListStore((state) => state.clearQuoteList);
  const removeFromQuoteList = useQuoteListStore((state) => state.removeFromQuoteList);
  const updateQuantity = useQuoteListStore((state) => state.updateQuantity);

  const items = useHydratedStore<QuoteListState, QuoteListItem[]>(useQuoteListStore, (state) => state.items) || [];
  const isHydrated = useHydratedStore<QuoteListState, boolean>(useQuoteListStore, () => true) || false;

  const totalItemCount = items.reduce((sum: number, item: QuoteListItem) => sum + item.quantity, 0);

  const handleProceedToQuote = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-amber-400" />
            <h2 className="font-sans text-lg font-bold tracking-wide text-white">
              Quote List ({totalItemCount})
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            aria-label="Close Quote List Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!isHydrated ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              <p className="mt-4 font-sans text-sm">Loading Quote List...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-600 opacity-60 mb-4" />
              <p className="font-sans text-lg font-medium text-white">Your Quote List is empty</p>
              <p className="font-sans text-sm text-slate-400 mt-2 max-w-xs">
                Browse our industrial lighting catalog and add products to request custom volume pricing.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 border border-amber-400 px-6 py-2.5 font-sans text-xs font-bold tracking-wider text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 rounded cursor-pointer uppercase"
              >
                EXPLORE CATALOG
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item: QuoteListItem) => {
                const specWattage = item.wattage || '30W';
                const specCCT = item.cct || '4000K';

                return (
                  <div
                    key={`${item.productId}-${specWattage}-${specCCT}`}
                    className="flex items-start gap-4 border-b border-slate-800 pb-6"
                  >
                    {/* Image container */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-slate-800 border border-slate-700 rounded">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                        priority
                        unoptimized
                      />
                    </div>

                    {/* Product Details - Display strictly Product Name, selected specs (Wattage/CCT), and Quantity */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-sans text-sm font-semibold text-white leading-tight">
                          {item.title}
                        </h3>
                        <button
                          onClick={() => removeFromQuoteList(item.productId, item.wattage, item.cct)}
                          className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Selected Specs (Wattage / CCT) */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-sans">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium">
                          Wattage: <strong className="text-amber-400">{specWattage}</strong>
                        </span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium">
                          CCT: <strong className="text-amber-400">{specCCT}</strong>
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-slate-700 rounded bg-slate-800">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.wattage,
                                item.cct,
                                item.quantity - 1
                              )
                            }
                            className="px-2.5 py-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 font-sans text-xs text-white font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.wattage,
                                item.cct,
                                item.quantity + 1
                              )
                            }
                            className="px-2.5 py-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end">
                <button
                  onClick={clearQuoteList}
                  className="font-sans text-xs tracking-wider text-slate-400 hover:text-rose-400 underline transition-colors cursor-pointer"
                >
                  Clear Quote List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-6 bg-slate-950/80 space-y-4">
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              Submit your list to receive a formal B2B pricing proposal from BRITE Techno engineers.
            </p>
            <button
              onClick={handleProceedToQuote}
              className="w-full bg-amber-500 text-slate-950 font-sans font-bold py-3.5 text-xs tracking-widest hover:bg-amber-400 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase rounded"
            >
              PROCEED TO QUOTE REQUEST
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
