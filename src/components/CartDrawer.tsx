'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, X, Plus, Minus, Tag, Check, AlertCircle } from 'lucide-react';
import { useCartStore, CartState, CartItem, AppliedPromo } from '@/store/useCartStore';
import { useHydratedStore } from '@/hooks/useHydratedStore';
import RazorpaySandboxModal from '@/components/RazorpaySandboxModal';

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface WindowWithRazorpay extends Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

export default function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((state) => state.isOpen);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const items = useHydratedStore<CartState, CartItem[]>(useCartStore, (state) => state.items) || [];
  const appliedPromo = useHydratedStore<CartState, AppliedPromo | null>(useCartStore, (state) => state.appliedPromo) || null;
  const setAppliedPromo = useCartStore((state) => state.setAppliedPromo);
  const isHydrated = useHydratedStore<CartState, boolean>(useCartStore, () => true) || false;

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const [sandboxOrderData, setSandboxOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
  } | null>(null);

  // Helper to load external scripts dynamically
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as unknown as WindowWithRazorpay).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyPaymentAndComplete = async (razorpayOrderId: string, paymentId: string, signature: string) => {
    const verifyRes = await fetch('/api/checkout/razorpay/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    });

    const verifyData = await verifyRes.json();

    if (verifyRes.ok && verifyData.success) {
      clearCart();
      setIsOpen(false);
      setSandboxOrderData(null);
      setIsCheckingOut(false);
      router.push(`/checkout/success?orderId=${razorpayOrderId}`);
    } else {
      throw new Error(verifyData.error || 'Payment verification failed. Please contact support.');
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    setPromoError(null);
    setPromoSuccess(null);

    const subtotalPrice = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

    try {
      const res = await fetch('/api/cart/apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), cartTotal: subtotalPrice }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedPromo({
          code: data.promo.code,
          discountType: data.promo.discountType,
          discountValue: data.promo.discountValue,
          discountAmount: data.discountAmount,
        });
        setPromoSuccess(`Promo code '${data.promo.code}' applied successfully!`);
        setPromoInput('');
      } else {
        setPromoError(data.error || 'Invalid promo code.');
      }
    } catch (err) {
      console.error('Error applying promo code:', err);
      setPromoError('Failed to apply promo code.');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
    setPromoSuccess(null);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // 1. Initialize order on backend API
      const response = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          promoCode: appliedPromo?.code,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to initialize checkout.');
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_bhavatsyam_sandbox_key';

      // Check if we should open the interactive Sandbox Modal or the native Razorpay Popup
      const isTestSandbox = keyId.startsWith('rzp_test_bhavatsyam') || keyId.startsWith('rzp_test_mock');

      if (isTestSandbox) {
        setSandboxOrderData({
          orderId: resData.orderId,
          amount: resData.amount,
          currency: resData.currency || 'INR',
        });
        return;
      }

      // Native Razorpay Script flow for real Razorpay credentials
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        // Fallback to sandbox modal if script loading is blocked
        setSandboxOrderData({
          orderId: resData.orderId,
          amount: resData.amount,
          currency: resData.currency || 'INR',
        });
        return;
      }

      const options: RazorpayOptions = {
        key: keyId,
        amount: resData.amount,
        currency: resData.currency || 'INR',
        name: 'BHAVATSYAM',
        description: 'Heritage & Modernity Checkout',
        order_id: resData.orderId,
        handler: async function (resp: RazorpayResponse) {
          try {
            await verifyPaymentAndComplete(
              resp.razorpay_order_id,
              resp.razorpay_payment_id,
              resp.razorpay_signature
            );
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Payment verification failed.';
            alert(msg);
            setIsCheckingOut(false);
          }
        },
        prefill: {
          name: 'Guest Customer',
          email: 'guest@bhavatsyam.com',
          contact: '9999999999',
        },
        theme: {
          color: '#C5A880',
        },
        modal: {
          ondismiss: function () {
            setIsCheckingOut(false);
          },
        },
      };

      const rzp = new (window as unknown as WindowWithRazorpay).Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred during checkout.';
      alert(errorMessage);
      setIsCheckingOut(false);
    }
  };

  const totalItemCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const subtotalPrice = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  // Recalculate dynamic discount amount based on current subtotal if percentage or fixed
  let currentDiscountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      currentDiscountAmount = (subtotalPrice * appliedPromo.discountValue) / 100;
    } else {
      currentDiscountAmount = appliedPromo.discountValue;
    }
    currentDiscountAmount = Math.min(subtotalPrice, Math.max(0, currentDiscountAmount));
  }

  const finalTotalPrice = Math.max(0, subtotalPrice - currentDiscountAmount);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Panel */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#0F0F11] border-l border-[#C5A880]/20 text-[#FAF8F5] shadow-2xl transition-transform duration-300 ease-out">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#C5A880]/15 px-6 py-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#C5A880]" />
              <h2 className="font-serif text-xl font-semibold tracking-wide text-[#FAF8F5]">
                Shopping Bag ({totalItemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-[#8C857B] hover:bg-white/10 hover:text-[#FAF8F5] transition-all"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!isHydrated ? (
              <div className="flex h-full flex-col items-center justify-center text-[#8C857B]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent" />
                <p className="mt-4 font-sans text-sm">Loading bag...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-[#8C857B] opacity-50 mb-4" />
                <p className="font-serif text-lg font-medium text-[#FAF8F5]">Your bag is empty</p>
                <p className="font-sans text-sm text-[#8C857B] mt-2 max-w-xs">
                  Add beautiful hand-crafted pieces from our collection to get started.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 border border-[#C5A880] px-6 py-2.5 font-sans text-sm font-semibold tracking-wider text-[#C5A880] hover:bg-[#C5A880] hover:text-[#0F0F11] transition-all duration-300"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item: CartItem) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex items-start gap-4 border-b border-[#C5A880]/10 pb-6"
                  >
                    {/* Image container */}
                    <div className="relative h-24 w-18 flex-shrink-0 overflow-hidden bg-zinc-900 border border-[#C5A880]/15">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover object-center"
                        sizes="72px"
                        priority
                        unoptimized
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-serif text-sm font-medium text-[#FAF8F5] leading-tight">
                          {item.title}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-[#8C857B] hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-1 font-sans text-xs text-[#8C857B]">
                        Size: <span className="text-[#FAF8F5] font-medium">{item.size}</span> | Color:{' '}
                        <span className="text-[#FAF8F5] font-medium">{item.color}</span>
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-[#C5A880]/30 rounded bg-black/40">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )
                            }
                            className="px-2 py-1 text-[#8C857B] hover:text-[#FAF8F5] disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 font-sans text-xs text-[#FAF8F5] font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )
                            }
                            className="px-2 py-1 text-[#8C857B] hover:text-[#FAF8F5] disabled:opacity-30"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price subtotal */}
                        <span className="font-sans text-sm font-semibold text-[#C5A880]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {item.quantity >= item.stock && (
                        <p className="mt-1 font-sans text-[10px] text-[#C5A880]/80">
                          Max stock limit reached ({item.stock})
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="font-sans text-xs tracking-wider text-[#8C857B] hover:text-red-400 underline transition-colors"
                  >
                    Clear Bag
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-[#C5A880]/15 px-6 py-6 bg-black/40 space-y-4">
              {/* Promo Code Input / Applied Badge */}
              <div className="border-b border-[#C5A880]/10 pb-4">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-[#C5A880]/10 border border-[#C5A880]/30 rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#C5A880]" />
                      <div>
                        <p className="font-mono text-xs font-bold text-[#C5A880]">
                          {appliedPromo.code}
                        </p>
                        <p className="font-sans text-[10px] text-[#8C857B]">
                          {appliedPromo.discountType === 'percentage'
                            ? `${appliedPromo.discountValue}% discount applied`
                            : `₹${appliedPromo.discountValue} discount applied`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-[#8C857B] hover:text-red-400 transition-colors p-1"
                      aria-label="Remove promo code"
                      title="Remove Promo Code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-[#8C857B] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="Have a Promo Code?"
                          className="w-full bg-black/50 border border-[#C5A880]/20 rounded pl-9 pr-3 py-2 text-xs font-mono tracking-wider text-[#FAF8F5] placeholder:font-sans placeholder:text-[#8C857B] focus:outline-none focus:border-[#C5A880] uppercase"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplyingPromo || !promoInput.trim()}
                        className="bg-[#C5A880] text-[#0F0F11] font-sans font-bold px-4 py-2 text-xs tracking-wider hover:bg-[#FAF8F5] disabled:opacity-40 transition-all rounded"
                      >
                        {isApplyingPromo ? '...' : 'APPLY'}
                      </button>
                    </form>
                    {promoError && (
                      <p className="font-sans text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {promoError}
                      </p>
                    )}
                    {promoSuccess && (
                      <p className="font-sans text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" /> {promoSuccess}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-sans text-[#8C857B]">
                  <span>SUBTOTAL</span>
                  <span className={appliedPromo ? 'line-through text-[#8C857B]' : 'text-[#FAF8F5] font-medium'}>
                    {formatPrice(subtotalPrice)}
                  </span>
                </div>

                {appliedPromo && currentDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs font-sans text-emerald-400 font-medium">
                    <span>DISCOUNT ({appliedPromo.code})</span>
                    <span>- {formatPrice(currentDiscountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#C5A880]/15">
                  <span className="font-sans text-sm font-bold text-[#FAF8F5] tracking-wide">FINAL TOTAL</span>
                  <span className="font-serif text-xl font-bold text-[#C5A880]">
                    {formatPrice(finalTotalPrice)}
                  </span>
                </div>
              </div>

              <p className="font-sans text-[11px] text-[#8C857B] leading-relaxed">
                Shipping and taxes calculated at checkout.
              </p>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-[#C5A880] text-[#0F0F11] font-sans font-bold py-3 text-sm tracking-widest hover:bg-[#FAF8F5] hover:text-[#0F0F11] disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCheckingOut ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F0F11] border-t-transparent" />
                    PROCESSING...
                  </>
                ) : (
                  'PROCEED TO CHECKOUT'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Razorpay Interactive Test Sandbox Modal */}
      {sandboxOrderData && (
        <RazorpaySandboxModal
          isOpen={!!sandboxOrderData}
          orderId={sandboxOrderData.orderId}
          amount={sandboxOrderData.amount}
          currency={sandboxOrderData.currency}
          onSuccess={async (paymentId, signature) => {
            await verifyPaymentAndComplete(sandboxOrderData.orderId, paymentId, signature);
          }}
          onDismiss={() => {
            setSandboxOrderData(null);
            setIsCheckingOut(false);
          }}
        />
      )}
    </>
  );
}
