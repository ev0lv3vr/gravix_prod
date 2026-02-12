import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'GRAVIX Privacy Policy. Learn how we collect, use, and protect your data when using our industrial adhesive specification platform.',
  openGraph: {
    title: 'Privacy Policy | GRAVIX',
    description:
      'GRAVIX Privacy Policy. Learn how we collect, use, and protect your data.',
    url: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
