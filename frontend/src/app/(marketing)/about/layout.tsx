import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'About',
  description:
    'GRAVIX is an AI-powered industrial materials intelligence platform built for engineers and manufacturers who need precise adhesive specifications and failure analysis.',
  openGraph: {
    title: 'About GRAVIX',
    description:
      'GRAVIX is an AI-powered industrial materials intelligence platform built for engineers and manufacturers who need precise adhesive specifications and failure analysis.',
    url: '/about',
  },
  twitter: {
    title: 'About GRAVIX',
    description:
      'AI-powered industrial materials intelligence platform built for engineers and manufacturers.',
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
