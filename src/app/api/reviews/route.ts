import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Review } from '@/models/Review';
import { Product } from '@/models/Product';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to leave a review.' },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: 'A valid Product ID is required.' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5 || !Number.isInteger(numericRating)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5.' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'A review comment is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    // Create the review
    const newReview = await Review.create({
      product: new mongoose.Types.ObjectId(productId),
      user: new mongoose.Types.ObjectId(session.user.id),
      rating: numericRating,
      comment: comment.trim(),
      isApproved: true, // Approved by default as per requirements
    });

    // Recalculate average rating and review count
    const approvedReviews = await Review.find({
      product: new mongoose.Types.ObjectId(productId),
      isApproved: true,
    });

    const reviewCount = approvedReviews.length;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = reviewCount > 0 ? parseFloat((sum / reviewCount).toFixed(1)) : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully!',
        data: newReview,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error submitting review:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
