import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';

/**
 * Maps Shiprocket status string/code to our local Order's shippingStatus enum
 */
function mapShiprocketStatus(status: string | undefined): 'Processing' | 'Shipped' | 'In Transit' | 'Delivered' | 'RTO' {
  if (!status) return 'Processing';

  const normalized = status.toLowerCase().trim();

  if (normalized.includes('delivered')) {
    return 'Delivered';
  }
  if (normalized.includes('rto') || normalized.includes('return') || normalized.includes('undelivered')) {
    return 'RTO';
  }
  if (normalized.includes('shipped') || normalized.includes('out for delivery') || normalized.includes('dispatched') || normalized.includes('manifest')) {
    return 'Shipped';
  }
  if (normalized.includes('transit') || normalized.includes('in-transit') || normalized.includes('reached') || normalized.includes('customs')) {
    return 'In Transit';
  }

  // Fallback default state
  return 'Processing';
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Shiprocket Webhook received payload:', JSON.stringify(payload, null, 2));

    const {
      order_id,
      shipment_id,
      awb,
      status,
      current_status,
    } = payload;

    if (!order_id && !shipment_id) {
      return NextResponse.json(
        { success: false, error: 'Neither order_id nor shipment_id was provided in payload.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Look up the order in MongoDB
    let order = null;

    if (order_id) {
      order = await Order.findOne({ shiprocketOrderId: String(order_id) });
      if (!order && mongoose.Types.ObjectId.isValid(order_id)) {
        order = await Order.findById(order_id);
      }
    }

    if (!order && shipment_id) {
      order = await Order.findOne({ shiprocketShipmentId: String(shipment_id) });
    }

    if (!order) {
      console.warn(`Shiprocket Webhook: No order found for order_id: ${order_id} or shipment_id: ${shipment_id}`);
      return NextResponse.json(
        { success: false, error: 'Order not found in database.' },
        { status: 404 }
      );
    }

    // Determine new statuses from the payload
    const rawStatus = current_status || status;
    const mappedShippingStatus = mapShiprocketStatus(rawStatus);

    console.log(`Shiprocket Webhook: Order ${order._id} matching raw status "${rawStatus}" mapped to: ${mappedShippingStatus}`);

    order.shippingStatus = mappedShippingStatus;

    // Keep top-level orderStatus in sync with actual fulfillment updates
    if (mappedShippingStatus === 'Delivered') {
      order.orderStatus = 'DELIVERED';
    } else if (mappedShippingStatus === 'Shipped' || mappedShippingStatus === 'In Transit') {
      order.orderStatus = 'SHIPPED';
    }

    if (awb) {
      order.awbCode = String(awb);
    }

    await order.save();

    console.log(`Shiprocket Webhook: Successfully updated Order ${order._id}. shippingStatus: ${order.shippingStatus}, orderStatus: ${order.orderStatus}`);

    return NextResponse.json({
      success: true,
      message: 'Shiprocket tracking status updated successfully.',
      orderId: order._id,
      shippingStatus: order.shippingStatus,
      orderStatus: order.orderStatus,
    });
  } catch (error: unknown) {
    console.error('Error in Shiprocket Webhook handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
