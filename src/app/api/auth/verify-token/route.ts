import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { VerificationToken } from '@/models/VerificationToken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is missing.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const tokenDoc = await VerificationToken.findOne({ token });

    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, error: 'Verification token is invalid or expired.' },
        { status: 400 }
      );
    }

    if (new Date() > tokenDoc.expires) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: tokenDoc.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    user.emailVerified = true;
    await user.save();

    await VerificationToken.deleteMany({ email: tokenDoc.email });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error: unknown) {
    console.error('Error verifying token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
