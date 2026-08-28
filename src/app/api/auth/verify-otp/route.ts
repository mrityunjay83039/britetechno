import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { VerificationToken } from '@/models/VerificationToken';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Please provide both email and 6-digit verification code.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    await dbConnect();

    // Find verification token document for this email and OTP
    const tokenDoc = await VerificationToken.findOne({
      email: normalizedEmail,
      otp: cleanOtp,
    });

    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    if (new Date() > tokenDoc.expires) {
      return NextResponse.json(
        { success: false, error: 'The verification code has expired. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Find user and mark as verified
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    user.emailVerified = true;
    await user.save();

    // Clean up verification token after successful verification
    await VerificationToken.deleteMany({ email: normalizedEmail });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in to your account.',
    });
  } catch (error: unknown) {
    console.error('Error verifying OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
