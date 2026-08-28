import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';
import { QuoteRequest } from '@/models/QuoteRequest';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { items, companyName, contactName, phoneNumber, email, projectDetails } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quote items are required.' },
        { status: 400 }
      );
    }

    if (!companyName || !contactName || !phoneNumber || !email) {
      return NextResponse.json(
        { success: false, error: 'Company name, contact name, phone number, and email are required.' },
        { status: 400 }
      );
    }

    const quoteItems = [];
    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid item data in quote request.' },
          { status: 400 }
        );
      }

      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product with ID ${item.productId} not found.` },
          { status: 404 }
        );
      }

      quoteItems.push({
        productId: dbProduct._id,
        title: dbProduct.title,
        quantity: item.quantity,
      });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const quoteRequest = await QuoteRequest.create({
      userId: userId || undefined,
      companyName,
      contactName,
      phoneNumber,
      email,
      projectDetails,
      items: quoteItems,
      status: 'Pending Review',
    });

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully.',
      quoteRequestId: quoteRequest._id,
    });
  } catch (error: unknown) {
    console.error('Error submitting quote request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
