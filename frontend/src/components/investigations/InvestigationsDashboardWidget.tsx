'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { investigationsApi } from '@/lib/investigations';
import { ClipboardList, ArrowRight, AlertTriangle } from 'lucide-react';

export function InvestigationsDashboardWidget() {
  const [stats, setStats] = useState<{ open: number; overdue: number; awaitingClosure: number }>({
    open: 0,
    overdue: 0,
    awaitingClosure: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const investigations = await investigationsApi.list();
        if (cancelled) return;

        const open = investigations.filter((i) => i.status !== 'closed').length;
        const awaitingClosure = investigations.filter((i) => i.status === 'verification').length;

        // Overdue: open investigations older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const overdue = investigations.filter(
          (i) => i.status !== 'closed' && new Date(i.created_at).getTime() < thirtyDaysAgo
        ).length;

        setStats({ open, overdue, awaitingClosure });
      } catch {
        // Silently fail — dashboard widget is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Link
      href="/investigations"
      className="group bg-brand-800 border border-[#1F2937] rounded-lg p-6 hover:border-accent-500 transition-colors"
    >
      <ClipboardList className="w-8 h-8 text-accent-500 mb-3" />
      <h3 className="text-lg font-semibold text-white mb-1">Investigations</h3>
      <p className="text-sm text-[#94A3B8] mb-3">8D quality investigations</p>

      {loading ? (
        <div className="flex gap-4 animate-pulse">
          <div className="h-4 w-16 bg-[#1F2937] rounded" />
          <div className="h-4 w-20 bg-[#1F2937] rounded" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-accent-500 font-semibold">{stats.open} open</span>
          {stats.overdue > 0 && (
            <span className="text-warning flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {stats.overdue} overdue
            </span>
          )}
          {stats.awaitingClosure > 0 && (
            <span className="text-[#94A3B8]">{stats.awaitingClosure} awaiting closure</span>
          )}
        </div>
      )}

      <span className="text-sm text-accent-500 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        View All <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}
