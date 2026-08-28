import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bhavatsyam.com"),
  title: {
    default: "BHAVATSYAM | Heritage and Modernity",
    template: "%s | BHAVATSYAM",
  },
  description: "BHAVATSYAM - A Perfect Blend of Heritage and Modernity. Minimalist, premium, and luxury designer clothing.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "BHAVATSYAM | Heritage and Modernity",
    description: "BHAVATSYAM - A Perfect Blend of Heritage and Modernity. Minimalist, premium, and luxury designer clothing.",
    url: "https://bhavatsyam.com",
    siteName: "BHAVATSYAM",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BHAVATSYAM | Heritage and Modernity",
    description: "BHAVATSYAM - A Perfect Blend of Heritage and Modernity. Minimalist, premium, and luxury designer clothing.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
