'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminEngagementPage() {
  const sp = useSearchParams();
  const range = sp.get('range') || '7d';
  const startDate = sp.get('start_date') || undefined;
  const endDate = sp.get('end_date') || undefined;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getAdminMetricsEngagement(range, startDate, endDate).then(setData).catch(console.error);
  }, [range, startDate, endDate]);

  if (!data) return <div className="p-8 text-text-secondary text-sm animate-pulse">Loading engagement metrics…</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-bold font-mono text-white mb-6">Engagement</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card label="New users" value={data.new_users} />
        <Card label="Analyses" value={data.analyses} />
        <Card label="Specs" value={data.specs} />
      </div>
      <div className="bg-brand-800 border border-brand-600 rounded p-4">
        <h2 className="text-sm font-bold text-white mb-3">Recent activity</h2>
        <div className="space-y-2">
          {(data.recent_activity || []).slice(0, 10).map((a: any) => (
            <div key={`${a.type}-${a.id}`} className="text-xs text-text-secondary">
              <span className="text-white font-mono">{a.type}</span> · {a.user_email || 'unknown'} · {a.status || '-'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-brand-800 border border-brand-600 rounded p-4"><div className="text-xs text-text-secondary">{label}</div><div className="text-2xl text-white font-mono mt-2">{value}</div></div>;
}
