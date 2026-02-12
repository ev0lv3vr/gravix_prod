'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { Shield, Users, Activity, FileText, BarChart3 } from 'lucide-react';

const sidebarLinks = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/activity', label: 'Activity', icon: Activity },
  { href: '/admin/logs', label: 'Request Logs', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

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
                  href={link.href}
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
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
