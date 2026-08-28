import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { PromoCode } from '@/models/PromoCode';
import { Resend } from 'resend';
import { ReceiptEmail } from '@/emails/ReceiptEmail';
import { pushOrderToShiprocket } from '@/lib/shiprocket';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Signature header is missing.' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, error: 'Webhook secret is not configured on the server.' },
        { status: 500 }
      );
    }

    // CRITICAL SECURITY: Always get raw body text for webhook signature validation
    const rawBody = await request.text();

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isVerified = expectedSignature === signature;

    if (!isVerified) {
      return NextResponse.json(
        { success: false, error: 'Webhook signature verification failed.' },
        { status: 400 }
      );
    }

    // Signature verified! Parse the body payload safely
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // We look for payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json(
          { success: true, message: 'Webhook processed but no Razorpay order ID found.' },
          { status: 200 }
        );
      }

      await dbConnect();
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        {
          paymentStatus: 'PAID',
          razorpayPaymentId,
        },
        { new: true }
      );

      if (!order) {
        console.warn(`Webhook received for order ID ${razorpayOrderId} but no matching MongoDB Order was found.`);
      } else {
        console.log(`Order ${order._id} payment status set to PAID via Razorpay Webhook.`);

        // Increment usedCount on PromoCode if a promo code was applied to this order
        if (order.promoCode) {
          try {
            await PromoCode.findOneAndUpdate(
              { code: order.promoCode },
              { $inc: { usedCount: 1 } }
            );
            console.log(`Incremented usedCount for promo code '${order.promoCode}' on order ${order._id}.`);
          } catch (promoErr) {
            console.error(`Error incrementing promo code '${order.promoCode}' usedCount:`, promoErr);
          }
        }

        // Find associated user for both Shiprocket integration and receipt email
        const user = await User.findById(order.userId).lean();

        // Push order to Shiprocket for fulfillment
        try {
          if (user) {
            console.log(`Initiating Shiprocket automated order push for order ${order._id}...`);
            const shiprocketResult = await pushOrderToShiprocket(order, user);
            if (shiprocketResult && shiprocketResult.success) {
              order.shiprocketOrderId = shiprocketResult.shiprocketOrderId;
              order.shiprocketShipmentId = shiprocketResult.shiprocketShipmentId;
              if (shiprocketResult.awbCode) {
                order.awbCode = shiprocketResult.awbCode;
              }
              order.shippingStatus = 'Processing';
              await order.save();
              console.log(`Order ${order._id} successfully pushed to Shiprocket:`, shiprocketResult);
            }
          } else {
            console.warn(`User associated with order ${order._id} (ID: ${order.userId}) was not found. Skipping Shiprocket push.`);
          }
        } catch (srError) {
          console.error(`Error pushing order ${order._id} to Shiprocket:`, srError);
        }

        // Trigger Receipt Email to the customer
        try {
          if (user && user.email) {
            const resendApiKey = process.env.RESEND_API_KEY;
            if (!resendApiKey) {
              console.warn(`RESEND_API_KEY is not defined. Skipping sending receipt email to ${user.email} for order ${order._id}.`);
            } else {
              console.log(`Initializing Resend and sending receipt email to ${user.email} for order ${order._id}...`);
              const resend = new Resend(resendApiKey);
              const data = await resend.emails.send({
                from: 'BHAVATSYAM <info@bhavatsyam.com>',
                to: user.email,
                subject: `Your BHAVATSYAM Order Receipt [#${order._id.toString().slice(-6).toUpperCase()}]`,
                react: ReceiptEmail({
                  orderId: order._id.toString(),
                  customerName: user.name,
                  items: order.items.map(item => ({
                    title: item.title,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    priceAtPurchase: item.priceAtPurchase,
                  })),
                  totalAmount: order.totalAmount,
                  shippingAddress: order.shippingAddress,
                }),
              });
              console.log(`Receipt email sent successfully! Resend response details:`, data);
            }
          } else {
            console.warn(`User associated with order ${order._id} (ID: ${order.userId}) has no email address. Receipt email could not be sent.`);
          }
        } catch (emailError) {
          console.error(`Error occurred while sending receipt email for order ${order._id}:`, emailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully.',
    });
  } catch (error: unknown) {
    console.error('Error in Razorpay Webhook handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
