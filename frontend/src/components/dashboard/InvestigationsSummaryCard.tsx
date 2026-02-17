'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { investigationsApi, type InvestigationListItem } from '@/lib/investigations';
import { ArrowRight, ClipboardList, AlertTriangle } from 'lucide-react';

const STATUS_DOT_COLORS: Record<string, string> = {
  open: 'bg-accent-500',
  containment: 'bg-warning',
  investigating: 'bg-[#8B5CF6]',
  corrective: 'bg-success',
  verification: 'bg-[#14B8A6]',
  closed: 'bg-[#64748B]',
};

export function InvestigationsSummaryCard() {
  const [investigations, setInvestigations] = useState<InvestigationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await investigationsApi.list();
        if (!cancelled) setInvestigations(data);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const openInvestigations = investigations.filter((i) => i.status !== 'closed');
  const openCount = openInvestigations.length;

  // Overdue: open investigations older than 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const overdueCount = openInvestigations.filter(
    (i) => new Date(i.created_at).getTime() < thirtyDaysAgo
  ).length;

  const awaitingClosure = investigations.filter((i) => i.status === 'verification').length;

  // Show top 3 recent open
  const recentOpen = openInvestigations.slice(0, 3);

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-accent-500" />
          <h3 className="text-base font-semibold text-white">Investigations</h3>
        </div>
        <Link
          href="/investigations"
          className="text-sm text-accent-500 hover:text-accent-400 inline-flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-48 bg-[#1F2937] rounded" />
          <div className="h-10 bg-[#1F2937] rounded" />
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-4">
            <span className="text-accent-500 font-semibold">{openCount} open</span>
            {overdueCount > 0 && (
              <span className="text-warning flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overdueCount} overdue actions
              </span>
            )}
            {awaitingClosure > 0 && (
              <span className="text-[#94A3B8]">{awaitingClosure} awaiting closure</span>
            )}
          </div>

          {/* Recent investigations list */}
          {recentOpen.length > 0 ? (
            <div className="space-y-2">
              {recentOpen.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/investigations/${inv.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded hover:bg-[#1F2937]/50 transition-colors -mx-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-[#64748B] font-mono shrink-0">
                      {inv.investigation_number}
                    </span>
                    <span className="text-sm text-[#94A3B8] truncate">
                      {inv.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#64748B] capitalize">
                      {inv.status.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[inv.status] || 'bg-[#64748B]'}`}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">No open investigations</p>
          )}
        </>
      )}
    </div>
  );
}
