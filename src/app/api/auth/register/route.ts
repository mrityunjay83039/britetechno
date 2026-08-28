import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { VerificationToken } from '@/models/VerificationToken';
import { Resend } from 'resend';
import { VerificationEmail } from '@/emails/VerificationEmail';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, mobile, captchaValid } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide name, email, and password.' },
        { status: 400 }
      );
    }

    if (captchaValid === false) {
      return NextResponse.json(
        { success: false, error: 'CAPTCHA validation failed. Please solve the security puzzle.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Hash the password (minimum 10 salt rounds per security rules)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the User with emailVerified: false
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile ? mobile.trim() : undefined,
      passwordHash: hashedPassword,
      role: 'BUYER',
      emailVerified: false,
    });

    // Generate 6-digit OTP code and verification token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Remove existing verification tokens for this email
    await VerificationToken.deleteMany({ email: normalizedEmail });

    // Save token & OTP to database
    await VerificationToken.create({
      email: normalizedEmail,
      token,
      otp,
      expires,
    });

    // Send verification email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const verificationUrl = `https://bhavatsyam.com/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    if (!resendApiKey) {
      console.warn(`[DEV ENVIRONMENT] RESEND_API_KEY not found. Verification OTP for ${normalizedEmail} is: ${otp}. URL: ${verificationUrl}`);
    } else {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'BHAVATSYAM <info@bhavatsyam.com>',
          to: normalizedEmail,
          subject: 'Verify Your BHAVATSYAM Account - Verification Code: ' + otp,
          react: VerificationEmail({
            customerName: name,
            verificationUrl,
            otpCode: otp,
          }),
        });
      } catch (emailError) {
        console.error(`Error sending verification email to ${normalizedEmail}:`, emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! A 6-digit verification code has been sent to your email address.',
        email: normalizedEmail,
        devOtp: !resendApiKey ? otp : undefined, // Useful helper for local dev testing
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in registration handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
