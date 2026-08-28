import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'B2B Lighting Platform: Razorpay payment webhooks disabled.',
  });
}
