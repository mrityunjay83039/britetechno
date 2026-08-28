import {
  Body,
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

interface ReceiptEmailProps {
  orderId: string;
  customerName: string;
  items: Array<{
    title: string;
    size: string;
    color: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export function ReceiptEmail({
  orderId,
  customerName,
  items,
  totalAmount,
  shippingAddress,
}: ReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your BHAVATSYAM Order Receipt</Preview>
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
            <Heading style={headingStyle}>Order Confirmation</Heading>
            <Text style={textStyle}>Dear {customerName},</Text>
            <Text style={textStyle}>
              Thank you for your purchase. Your payment has been successfully processed.
              Our artisans are now preparing your hand-crafted piece with the finest care.
            </Text>

            <Text style={orderIdLabelStyle}>Order Reference</Text>
            <Text style={orderIdStyle}>{orderId}</Text>

            <Heading style={subheadingStyle}>Items Ordered</Heading>
            <Section style={itemsContainerStyle}>
              {items && items.map((item, index) => (
                <div key={index} style={itemRowStyle}>
                  <div style={itemDetailsColStyle}>
                    <Text style={itemTitleStyle}>{item.title}</Text>
                    <Text style={itemSubtitleStyle}>
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </Text>
                  </div>
                  <div style={itemPriceColStyle}>
                    <Text style={itemPriceStyle}>
                      ₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                    </Text>
                  </div>
                </div>
              ))}
            </Section>

            <Hr style={hrStyle} />

            {/* Total */}
            <div style={totalContainerStyle}>
              <Text style={totalLabelStyle}>Total Amount Paid</Text>
              <Text style={totalValueStyle}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </Text>
            </div>

            <Hr style={hrStyle} />

            {/* Shipping Address */}
            <Heading style={subheadingStyle}>Shipping Details</Heading>
            <Text style={addressStyle}>
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}
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
  backgroundColor: '#FFFFFF',
  fontFamily: 'Inter, "Plus Jakarta Sans", -apple-system, sans-serif',
  padding: '40px 0',
};

const containerStyle: React.CSSProperties = {
  margin: '0 auto',
  width: '560px',
  backgroundColor: '#1E3A8A',
  color: '#FFFFFF',
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
  color: '#1E3A8A',
  margin: '0',
  fontFamily: 'Georgia, serif',
  textTransform: 'uppercase',
};

const taglineStyle: React.CSSProperties = {
  fontSize: '8px',
  letterSpacing: '0.4em',
  color: '#64748B',
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
  color: '#1E3A8A',
  fontFamily: 'Georgia, serif',
  marginBottom: '20px',
  letterSpacing: '0.05em',
};

const subheadingStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1E3A8A',
  fontFamily: 'Georgia, serif',
  marginTop: '30px',
  marginBottom: '15px',
  letterSpacing: '0.05em',
};

const textStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '22px',
  color: '#FFFFFF',
  margin: '0 0 16px 0',
};

const orderIdLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#64748B',
  margin: '16px 0 4px 0',
  fontWeight: 'bold',
};

const orderIdStyle: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'monospace',
  color: '#1E3A8A',
  margin: '0 0 24px 0',
  fontWeight: 'bold',
};

const itemsContainerStyle: React.CSSProperties = {
  margin: '10px 0',
};

const itemRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid rgba(197, 168, 128, 0.1)',
};

const itemDetailsColStyle: React.CSSProperties = {
  flex: 1,
};

const itemPriceColStyle: React.CSSProperties = {
  textAlign: 'right',
  paddingLeft: '15px',
};

const itemTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#FFFFFF',
  margin: '0 0 4px 0',
};

const itemSubtitleStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748B',
  margin: '0',
};

const itemPriceStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#1E3A8A',
  margin: '0',
};

const totalContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
};

const totalLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#FFFFFF',
  margin: '0',
};

const totalValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1E3A8A',
  margin: '0',
};

const addressStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#FFFFFF',
  margin: '0',
};

const footerStyle: React.CSSProperties = {
  padding: '0 40px',
  textAlign: 'center',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '11px',
  lineHeight: '18px',
  color: '#64748B',
  margin: '0 0 16px 0',
};

const footerCopyrightStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#64748B',
  margin: '0',
};
