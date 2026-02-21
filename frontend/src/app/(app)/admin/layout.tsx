'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Shield, BarChart3, Cpu, Users, Brain, Server } from 'lucide-react';

const sidebarLinks = [
  { href: '/admin/overview', label: 'Overview', icon: BarChart3 },
  { href: '/admin/ai-engine', label: 'AI Engine', icon: Cpu },
  { href: '/admin/engagement', label: 'Engagement', icon: Users },
  { href: '/admin/knowledge', label: 'Knowledge', icon: Brain },
  { href: '/admin/system', label: 'System', icon: Server },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const range = searchParams.get('range') || '7d';
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';

  const updateRange = (nextRange: string, nextStart?: string, nextEnd?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', nextRange);
    if (nextRange === 'custom') {
      if (nextStart) params.set('start_date', nextStart);
      if (nextEnd) params.set('end_date', nextEnd);
    } else {
      params.delete('start_date');
      params.delete('end_date');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    api.getCurrentUser().then((u) => {
      setAuthorized(u?.role === 'admin');
    }).catch(() => {
      setAuthorized(false);
    });
  }, []);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-secondary text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="h-12 w-12 text-danger" />
        <h1 className="text-xl font-bold text-white">Access Denied</h1>
        <p className="text-text-secondary text-sm">You don&apos;t have permission to access the admin dashboard.</p>
        <Link href="/dashboard" className="text-accent-500 hover:text-accent-600 text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-brand-600 bg-brand-900 hidden md:block">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-4 w-4 text-accent-500" />
            <span className="text-sm font-bold font-mono text-white">ADMIN</span>
          </div>
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive =
                link.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={`${link.href}?${searchParams.toString()}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-700 text-white'
                      : 'text-text-secondary hover:text-white hover:bg-brand-800'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="border-b border-brand-600 bg-brand-900/40 px-4 py-3 flex items-center gap-3">
          <span className="text-xs text-text-secondary uppercase tracking-wide">Date range</span>
          <select
            value={range}
            onChange={(e) => updateRange(e.target.value)}
            className="bg-brand-800 border border-brand-600 text-white text-sm rounded px-2 py-1"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom</option>
          </select>
          {range === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => updateRange('custom', e.target.value, endDate)}
                className="bg-brand-800 border border-brand-600 text-white text-sm rounded px-2 py-1"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => updateRange('custom', startDate, e.target.value)}
                className="bg-brand-800 border border-brand-600 text-white text-sm rounded px-2 py-1"
              />
            </>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
