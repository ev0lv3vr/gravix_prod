import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { PlanProvider } from '@/contexts/PlanContext';
import { QueryProvider } from '@/contexts/QueryProvider';
import '@/styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gravix.com'),
  title: {
    default: 'GRAVIX — Industrial Adhesive Specification & Failure Analysis',
    template: '%s | GRAVIX',
  },
  description:
    'AI-powered platform for precise adhesive specification and failure analysis. Get instant recommendations for industrial bonding applications. Trusted by manufacturing engineers worldwide.',
  keywords: [
    'adhesive specification',
    'bond failure analysis',
    'industrial adhesives',
    'materials engineering',
    'manufacturing',
    'AI materials intelligence',
  ],
  authors: [{ name: 'GRAVIX' }],
  creator: 'GRAVIX',
  publisher: 'GRAVIX',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'GRAVIX',
    title: 'GRAVIX — Industrial Adhesive Specification & Failure Analysis',
    description:
      'AI-powered platform for precise adhesive specification and failure analysis. Trusted by manufacturing engineers worldwide.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GRAVIX — AI-Powered Adhesive Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GRAVIX — Industrial Adhesive Specification & Failure Analysis',
    description:
      'AI-powered platform for precise adhesive specification and failure analysis.',
    images: ['/og-image.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <QueryProvider>
          <AuthProvider>
            <PlanProvider>
              {children}
            </PlanProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
