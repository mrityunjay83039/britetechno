import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Resend } from 'resend';
import { ResetPasswordEmail } from '@/emails/ResetPasswordEmail';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    await dbConnect();

    const user = await User.findOne({ email: normalizedEmail });

    // Generic success message to prevent email enumeration
    const genericSuccessResponse = NextResponse.json({
      success: true,
      message: 'If an account exists with that email address, we have sent a password reset link.',
    });

    if (!user) {
      return genericSuccessResponse;
    }

    // Generate secure random unhashed token
    const unhashedToken = crypto.randomBytes(32).toString('hex');

    // Hash the token using SHA-256 for secure database storage
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');

    // Expiry: 1 hour from now
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `https://bhavatsyam.com/reset-password?token=${unhashedToken}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn(
        `[DEV ENVIRONMENT] RESEND_API_KEY missing. Reset link for ${normalizedEmail}: ${resetUrl}`
      );
    } else {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'BHAVATSYAM <info@bhavatsyam.com>',
          to: normalizedEmail,
          subject: 'Reset Your BHAVATSYAM Password',
          react: ResetPasswordEmail({
            customerName: user.name || 'Valued Customer',
            resetUrl,
          }),
        });
      } catch (emailError) {
        console.error(`Error sending reset password email to ${normalizedEmail}:`, emailError);
      }
    }

    return genericSuccessResponse;
  } catch (error: unknown) {
    console.error('Error in forgot-password handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
