'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminAiEnginePage() {
  const [range, setRange] = useState('7d');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setRange(sp.get('range') || '7d');
    setStartDate(sp.get('start_date') || undefined);
    setEndDate(sp.get('end_date') || undefined);
  }, []);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminMetricsAiEngine(range, startDate, endDate).then(setData).catch((e) => setError(e.message));
  }, [range, startDate, endDate]);

  if (error) return <div className="p-8 text-danger text-sm">{error}</div>;
  if (!data) return <div className="p-8 text-text-secondary text-sm animate-pulse">Loading AI engine metrics…</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-bold font-mono text-white mb-6">AI Engine</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Total calls" value={data.total_ai_calls} />
        <Card label="Success calls" value={data.successful_ai_calls} />
        <Card label="Avg latency (ms)" value={data.avg_latency_ms ?? '-'} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-brand-800 border border-brand-600 rounded p-4"><div className="text-xs text-text-secondary">{label}</div><div className="text-2xl text-white font-mono mt-2">{value}</div></div>;
}
