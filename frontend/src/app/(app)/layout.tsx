'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isToolPage = pathname === '/tool' || pathname === '/failure';

  // Wake backend immediately on any authenticated page load
  // This fires a cheap /health ping so Render spins up while the user sees the UI
  useEffect(() => {
    fetch(`${API_URL}/health`, { method: 'GET', priority: 'low' as RequestPriority }).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!isToolPage && <Footer />}
    </div>
  );
}
