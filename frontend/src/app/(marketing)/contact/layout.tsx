import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with GRAVIX. Have questions about adhesive specifications or failure analysis? Contact our team for support and enterprise inquiries.',
  openGraph: {
    title: 'Contact Us | GRAVIX',
    description:
      'Get in touch with GRAVIX. Have questions about adhesive specifications or failure analysis? Contact our team.',
    url: '/contact',
  },
  twitter: {
    title: 'Contact Us | GRAVIX',
    description: 'Get in touch with GRAVIX for support and enterprise inquiries.',
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
