import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { QuoteRequest } from '@/models/QuoteRequest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { companyName, contactPerson, contactName, email, phone, phoneNumber, projectDetails, items } = body;
    const contactNameInput = contactPerson || contactName;
    const phoneInput = phone || phoneNumber;

    if (!companyName || !contactNameInput || !email || !phoneInput) {
      return NextResponse.json(
        { success: false, error: 'Company Name, Contact Person, Email, and Phone are required.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quote list items are required.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions).catch(() => null);

    const formattedItems = items.map((item: { productId: string; title: string; wattage?: string; cct?: string; quantity: number }) => ({
      productId: item.productId,
      title: item.title,
      wattage: item.wattage || '',
      cct: item.cct || '',
      quantity: Number(item.quantity) || 1,
    }));

    const quoteRequest = await QuoteRequest.create({
      companyName: companyName.trim(),
      contactName: contactNameInput.trim(),
      email: email.trim(),
      phoneNumber: phoneInput.trim(),
      projectDetails: projectDetails ? projectDetails.trim() : '',
      items: formattedItems,
      userId: session?.user?.id || undefined,
      status: 'Pending Review',
    });

    return NextResponse.json(
      {
        success: true,
        data: quoteRequest,
        quoteId: String(quoteRequest._id),
        message: 'Quote request submitted successfully.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Submit Quote API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
