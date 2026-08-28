import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { VerificationToken } from '@/models/VerificationToken';
import { Resend } from 'resend';
import { VerificationEmail } from '@/emails/VerificationEmail';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Please provide an email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'This account is already verified. Please sign in.' },
        { status: 400 }
      );
    }

    // Generate fresh OTP code and token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await VerificationToken.deleteMany({ email: normalizedEmail });
    await VerificationToken.create({
      email: normalizedEmail,
      token,
      otp,
      expires,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const verificationUrl = `https://bhavatsyam.com/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    if (!resendApiKey) {
      console.warn(`[DEV ENVIRONMENT] RESEND_API_KEY missing. Resent verification OTP for ${normalizedEmail}: ${otp}`);
    } else {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'BHAVATSYAM <info@bhavatsyam.com>',
          to: normalizedEmail,
          subject: 'Your New BHAVATSYAM Verification Code: ' + otp,
          react: VerificationEmail({
            customerName: user.name,
            verificationUrl,
            otpCode: otp,
          }),
        });
      } catch (emailError) {
        console.error(`Error resending verification email to ${normalizedEmail}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email address.',
      devOtp: !resendApiKey ? otp : undefined,
    });
  } catch (error: unknown) {
    console.error('Error resending OTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
