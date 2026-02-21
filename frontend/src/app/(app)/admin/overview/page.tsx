'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminOverviewPage() {
  const sp = useSearchParams();
  const range = sp.get('range') || '7d';
  const startDate = sp.get('start_date') || undefined;
  const endDate = sp.get('end_date') || undefined;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminMetricsOverview(range, startDate, endDate)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [range, startDate, endDate]);

  if (error) return <div className="p-8 text-danger text-sm">{error}</div>;
  if (!data) return <div className="p-8 text-text-secondary text-sm animate-pulse">Loading overview…</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-bold font-mono text-white mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Total Users" value={data.total_users} />
        <Metric label="Total Analyses" value={data.total_analyses} />
        <Metric label="Total Specs" value={data.total_specs} />
        <Metric label="Signups (week)" value={data.signups_this_week} />
      </div>
      <div className="mt-6 bg-brand-800 border border-brand-600 rounded p-4">
        <h2 className="text-sm font-bold text-white mb-2">Users by plan</h2>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(data.users_by_plan || {}).map(([plan, count]) => (
            <span key={plan} className="text-xs px-2 py-1 rounded bg-brand-700 text-text-primary font-mono">
              {plan}: {String(count)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-brand-800 border border-brand-600 rounded p-4">
      <div className="text-xs uppercase tracking-wide text-text-secondary">{label}</div>
      <div className="text-2xl font-bold font-mono text-white mt-2">{value}</div>
    </div>
  );
}
