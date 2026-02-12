import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'GRAVIX Terms of Service. Read the terms and conditions for using our industrial adhesive specification and failure analysis platform.',
  openGraph: {
    title: 'Terms of Service | GRAVIX',
    description:
      'GRAVIX Terms of Service. Read the terms and conditions for using our platform.',
    url: '/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
