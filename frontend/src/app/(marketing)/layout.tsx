import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';

/**
 * Layout for marketing pages.
 * Sprint 10.4: Metadata is set per page.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
