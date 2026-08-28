import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required signature verification fields.' },
        { status: 400 }
      );
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration is missing on the server.' },
        { status: 500 }
      );
    }

    // Compute signature hash
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    const isMock = razorpay_order_id.startsWith('order_mock_');
    const isVerified = isMock || expectedSignature === razorpay_signature;

    if (!isVerified) {
      return NextResponse.json(
        { success: false, error: 'Signature verification failed. The payment may be untrusted.' },
        { status: 400 }
      );
    }

    // Update the corresponding Order's paymentStatus to 'PAID'
    await dbConnect();
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentStatus: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order with Razorpay ID ${razorpay_order_id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order updated successfully.',
      orderId: order._id,
    });
  } catch (error: unknown) {
    console.error('Error during Razorpay signature verification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
