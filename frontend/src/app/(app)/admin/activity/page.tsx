'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type ActivityRow = Awaited<ReturnType<typeof api.getAdminActivity>>[number];

function TypeBadge({ type }: { type: string }) {
  const isAnalysis = type === 'analysis';
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-mono rounded ${
        isAnalysis ? 'bg-warning/20 text-warning' : 'bg-info/20 text-info'
      }`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-text-tertiary text-xs">—</span>;
  const color =
    status === 'completed'
      ? 'text-success'
      : status === 'failed'
      ? 'text-danger'
      : status === 'processing'
      ? 'text-warning'
      : 'text-text-secondary';
  return <span className={`text-xs font-mono ${color}`}>{status}</span>;
}

function formatTime(d: string | null | undefined) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminActivityPage() {
  const [items, setItems] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminActivity()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-bold font-mono text-white mb-6">Recent Activity</h1>

      <div className="bg-brand-800 border border-brand-600 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-600">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Substrates</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Confidence</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary text-sm">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary text-sm">
                  No activity yet
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-brand-700 hover:bg-brand-700/30">
                  <td className="px-4 py-3">
                    <TypeBadge type={item.type} />
                  </td>
                  <td className="px-4 py-3 text-white font-mono text-xs">{item.user_email || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{item.substrates || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                    {item.confidence_score != null ? `${(item.confidence_score * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-text-tertiary text-xs">{formatTime(item.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
