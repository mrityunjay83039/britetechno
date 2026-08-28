import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Review } from '@/models/Review';
import { Product } from '@/models/Product';
import mongoose from 'mongoose';

// Helper function to recalculate average rating and review count
async function recalculateProductRating(productId: mongoose.Types.ObjectId | string) {
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
}

// PATCH to toggle isApproved
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 403 }
      );
    }

    const { reviewId, isApproved } = await request.json();

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, error: 'A valid Review ID is required.' },
        { status: 400 }
      );
    }

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isApproved must be a boolean.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found.' },
        { status: 404 }
      );
    }

    review.isApproved = isApproved;
    await review.save();

    // Recalculate rating on the product
    await recalculateProductRating(review.product);

    return NextResponse.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'hidden'} successfully.`,
      data: review,
    });
  } catch (error: unknown) {
    console.error('Error in PATCH /api/admin/reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE to delete a review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 403 }
      );
    }

    // Try getting reviewId from query parameters first, then fall back to body
    const { searchParams } = new URL(request.url);
    let reviewId = searchParams.get('id');

    if (!reviewId) {
      try {
        const body = await request.json();
        reviewId = body.reviewId;
      } catch {
        // No body provided
      }
    }

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, error: 'A valid Review ID is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found.' },
        { status: 404 }
      );
    }

    const productId = review.product;

    await Review.findByIdAndDelete(reviewId);

    // Recalculate rating on the product
    await recalculateProductRating(productId);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/admin/reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
