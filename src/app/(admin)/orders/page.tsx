import React from 'react';
import dbConnect from '@/lib/db';
import { QuoteRequest } from '@/models/QuoteRequest';
import { User } from '@/models/User'; // ensure model registration
import OrdersClient from '@/components/OrdersClient';

// Ensure Mongoose registers the User model
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _modelReg = User;

export const revalidate = 0; // force dynamic rendering

export default async function OrdersPage() {
  await dbConnect();

  // Fetch all quote requests, populated with user info, sorted newest first
  const rawQuotes = await QuoteRequest.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // Serialize MongoDB documents so they pass React Server-Client boundary checks safely
  const quotes = JSON.parse(JSON.stringify(rawQuotes));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#0F0F11] tracking-wide">
          Quote Requests Management
        </h2>
        <p className="font-sans text-xs text-[#8C857B] mt-1 uppercase tracking-widest font-semibold">
          Review B2B lighting quotes, contact sales prospects, and update request statuses
        </p>
      </div>

      <OrdersClient initialOrders={quotes} />
    </div>
  );
}
