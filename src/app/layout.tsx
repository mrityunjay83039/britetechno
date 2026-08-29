import type { Metadata } from "next";
import "./globals.css";
import React from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://britetechno.com"),
  title: {
    default: "BRITE TECHNO | B2B Industrial & Commercial Lighting",
    template: "%s | BRITE TECHNO",
  },
  description: "BRITE TECHNO - Industrial & Commercial Lighting Equipment Provider across Canada & US.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "BRITE TECHNO | B2B Industrial Lighting",
    description: "BRITE TECHNO - Industrial & Commercial Lighting Equipment Provider across Canada & US.",
    url: "https://britetechno.com",
    siteName: "BRITE TECHNO",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BRITE TECHNO | B2B Industrial Lighting",
    description: "BRITE TECHNO - Industrial & Commercial Lighting Equipment Provider across Canada & US.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">{children}</body>
    </html>
  );
}
