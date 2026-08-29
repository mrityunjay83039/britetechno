import React from 'react';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';
import { User } from '@/models/User'; // ensure model registration
import OrdersClient from '@/components/OrdersClient';

// Ensure Mongoose registers the User model
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _modelReg = User;

export const revalidate = 0; // force dynamic rendering

export default async function OrdersPage() {
  await dbConnect();

  // Fetch all orders, populated with user info, sorted newest first
  const rawOrders = await Order.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // Serialize MongoDB documents so they pass React Server-Client boundary checks safely
  const orders = JSON.parse(JSON.stringify(rawOrders));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-sans text-3xl font-bold text-[#1E3A8A] tracking-wide">
          Order Management
        </h2>
        <p className="font-sans text-xs text-[#64748B] mt-1 uppercase tracking-widest font-semibold">
          Fulfill customer purchases, monitor payment states, and update shipping status
        </p>
      </div>

      <OrdersClient initialOrders={orders} />
    </div>
  );
}
