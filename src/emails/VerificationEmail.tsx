import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface VerificationEmailProps {
  customerName: string;
  verificationUrl: string;
  otpCode?: string;
}

export function VerificationEmail({
  customerName,
  verificationUrl,
  otpCode,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your BHAVATSYAM account</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>BHAVATSYAM</Text>
            <Text style={taglineStyle}>Heritage & Modernity</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Content */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>Confirm Your Registration</Heading>
            <Text style={textStyle}>Dear {customerName},</Text>
            <Text style={textStyle}>
              Thank you for registering with BHAVATSYAM. To finalize your account
              creation and secure your access to our collections, please use your 6-digit verification code below:
            </Text>

            {/* OTP Display Box */}
            {otpCode && (
              <Section style={otpBoxStyle}>
                <Text style={otpLabelStyle}>YOUR 6-DIGIT VERIFICATION CODE</Text>
                <Text style={otpCodeStyle}>{otpCode}</Text>
              </Section>
            )}

            <Text style={textStyle}>
              Alternatively, click the button below to verify your email directly:
            </Text>

            {/* Button */}
            <Section style={buttonContainerStyle}>
              <Button href={verificationUrl} style={buttonStyle}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={mutedTextStyle}>
              This code and link are valid for 24 hours. If you did not create this account,
              please disregard this email.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              If you have any questions, please contact us at info@bhavatsyam.com
            </Text>
            <Text style={footerCopyrightStyle}>
              &copy; {new Date().getFullYear()} BHAVATSYAM. All Rights Reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Design System & Branding Inline Styles (BHAVATSYAM Brand Rules)
const mainStyle: React.CSSProperties = {
  backgroundColor: '#FAF8F5',
  fontFamily: 'Inter, "Plus Jakarta Sans", -apple-system, sans-serif',
  padding: '40px 0',
};

const containerStyle: React.CSSProperties = {
  margin: '0 auto',
  width: '560px',
  backgroundColor: '#0F0F11',
  color: '#FAF8F5',
  borderRadius: '0px',
  border: '1px solid rgba(197, 168, 128, 0.3)',
  padding: '40px 0',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '0 40px',
};

const logoStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '0.25em',
  color: '#C5A880',
  margin: '0',
  fontFamily: 'Georgia, serif',
  textTransform: 'uppercase',
};

const taglineStyle: React.CSSProperties = {
  fontSize: '8px',
  letterSpacing: '0.4em',
  color: '#8C857B',
  textTransform: 'uppercase',
  margin: '6px 0 0 0',
  fontWeight: 'bold',
};

const hrStyle: React.CSSProperties = {
  borderColor: 'rgba(197, 168, 128, 0.15)',
  margin: '30px 40px',
};

const contentStyle: React.CSSProperties = {
  padding: '0 40px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#C5A880',
  fontFamily: 'Georgia, serif',
  marginBottom: '20px',
  letterSpacing: '0.05em',
};

const textStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '22px',
  color: '#FAF8F5',
  margin: '0 0 16px 0',
};

const otpBoxStyle: React.CSSProperties = {
  backgroundColor: 'rgba(197, 168, 128, 0.08)',
  border: '1px border rgba(197, 168, 128, 0.3)',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const otpLabelStyle: React.CSSProperties = {
  fontSize: '9px',
  letterSpacing: '0.25em',
  color: '#8C857B',
  margin: '0 0 8px 0',
  fontWeight: 'bold',
};

const otpCodeStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '0.35em',
  color: '#C5A880',
  margin: '0',
  fontFamily: 'monospace',
};

const mutedTextStyle: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '18px',
  color: '#8C857B',
  margin: '24px 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#C5A880',
  color: '#0F0F11',
  borderRadius: '0px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
  fontFamily: 'Inter, "Plus Jakarta Sans", sans-serif',
};

const footerStyle: React.CSSProperties = {
  padding: '0 40px',
  textAlign: 'center',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '18px',
  color: '#8C857B',
  margin: '0 0 16px 0',
};

const footerCopyrightStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#8C857B',
  margin: '0',
};
