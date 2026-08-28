import React from 'react';
import dbConnect from '@/lib/db';
import { Review } from '@/models/Review';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Product } from '@/models/Product'; // Ensure models are loaded
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from '@/models/User';
import ReviewsModeratorClient from '@/components/ReviewsModeratorClient';

export const revalidate = 0; // force dynamic rendering

export default async function ReviewsPage() {
  await dbConnect();

  // Load all reviews from database populated with user and product information
  const rawReviews = await Review.find({})
    .populate('user', 'name email')
    .populate('product', 'title slug')
    .sort({ createdAt: -1 })
    .lean();

  const reviews = JSON.parse(JSON.stringify(rawReviews));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#0F0F11] tracking-wide">
          Customer Reviews
        </h2>
        <p className="font-sans text-xs text-[#8C857B] mt-1 uppercase tracking-widest font-semibold">
          Moderate customer feedback, approve genuine opinions, and remove spam or inappropriate comments
        </p>
      </div>

      <ReviewsModeratorClient initialReviews={reviews} />
    </div>
  );
}
