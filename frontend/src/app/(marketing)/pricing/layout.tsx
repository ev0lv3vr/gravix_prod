import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for GRAVIX. Start free with 5 analyses per month. Upgrade to Pro for unlimited analyses and full reports.',
  openGraph: {
    title: 'Pricing | GRAVIX',
    description:
      'Simple, transparent pricing for GRAVIX. Start free with 5 analyses per month. Upgrade to Pro for unlimited analyses and full reports.',
    url: '/pricing',
  },
  twitter: {
    title: 'Pricing | GRAVIX',
    description:
      'Simple, transparent pricing for GRAVIX. Start free with 5 analyses per month.',
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
