import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/SEO/JsonLd";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bscca.bandhannova.in'), // Assuming this or similar
  title: {
    default: "BSCCA - Beltala Supreme Council for Cricket Authority",
    template: "%s | BSCCA Cricket"
  },
  description: "Official platform of the Beltala Supreme Council for Cricket Authority (BSCCA). Real-time scores, player stats, team profiles, and match highlights from the heart of Beltala's cricket community.",
  keywords: ["Beltala Cricket", "BSCCA", "Beltala Supreme Council for Cricket Authority", "BandhanNova Platforms", "Cricket League Beltala", "Live Cricket Scores Beltala", "Beltala Sports", "Cricket Tournament", "Beltala"],
  authors: [{ name: "BandhanNova Platforms" }],
  creator: "BandhanNova Platforms",
  publisher: "BSCCA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "BSCCA - Beltala's Official Cricket Authority",
    description: "Experience world-class cricket from Beltala. Live scores, stats, and highlights.",
    url: 'https://bscca.bandhannova.in',
    siteName: 'BSCCA',
    images: [
      {
        url: '/og-image.jpg', // Should exist or fall back
        width: 1200,
        height: 630,
        alt: 'BSCCA - Beltala Cricket Authority',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BSCCA - Beltala Cricket Authority',
    description: 'Real-time cricket updates and highlights from Beltala.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico", // Using the existing ico
    apple: "/apple-touch-icon.png",
  },
};

import LayoutWrapper from "@/components/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "BSCCA - Beltala Supreme Council for Cricket Authority",
    "url": "https://bscca.bandhannova.in",
    "logo": "https://bscca.bandhannova.in/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Beltala",
      "addressRegion": "West Bengal",
      "addressCountry": "India"
    },
    "sameAs": [
      "https://facebook.com/bscca",
      "https://twitter.com/bscca",
      "https://instagram.com/bscca"
    ]
  };

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col bg-background font-sans`}
      >
        <JsonLd data={organizationJsonLd} />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
