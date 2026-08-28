import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { PromoCode } from '@/models/PromoCode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, cartTotal } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Promo code is required.' },
        { status: 400 }
      );
    }

    const subtotal = typeof cartTotal === 'number' && cartTotal > 0 ? cartTotal : 0;
    const sanitizedCode = code.trim().toUpperCase();

    await dbConnect();

    const promo = await PromoCode.findOne({ code: sanitizedCode });

    if (!promo) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo code.' },
        { status: 404 }
      );
    }

    if (!promo.isActive) {
      return NextResponse.json(
        { success: false, error: 'This promo code is no longer active.' },
        { status: 400 }
      );
    }

    if (promo.expiryDate && new Date() > new Date(promo.expiryDate)) {
      return NextResponse.json(
        { success: false, error: 'This promo code has expired.' },
        { status: 400 }
      );
    }

    if (
      typeof promo.usageLimit === 'number' &&
      promo.usageLimit > 0 &&
      promo.usedCount >= promo.usageLimit
    ) {
      return NextResponse.json(
        { success: false, error: 'This promo code usage limit has been reached.' },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (subtotal * promo.discountValue) / 100;
    } else if (promo.discountType === 'fixedAmount') {
      discountAmount = promo.discountValue;
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(subtotal, Math.max(0, discountAmount));
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return NextResponse.json({
      success: true,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
      },
      discountAmount,
      finalTotal,
    });
  } catch (error: unknown) {
    console.error('Error validating promo code:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to validate promo code.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
