'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminKnowledgePage() {
  const sp = useSearchParams();
  const range = sp.get('range') || '7d';
  const startDate = sp.get('start_date') || undefined;
  const endDate = sp.get('end_date') || undefined;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getAdminMetricsKnowledge(range, startDate, endDate).then(setData).catch(console.error);
  }, [range, startDate, endDate]);

  if (!data) return <div className="p-8 text-text-secondary text-sm animate-pulse">Loading knowledge metrics…</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-bold font-mono text-white mb-6">Knowledge</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Patterns total" value={data.knowledge_patterns_total} />
        <Card label="Patterns (window)" value={data.knowledge_patterns_recent} />
        <Card label="Feedback total" value={data.feedback_total} />
        <Card label="Feedback (window)" value={data.feedback_recent} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-brand-800 border border-brand-600 rounded p-4"><div className="text-xs text-text-secondary">{label}</div><div className="text-2xl text-white font-mono mt-2">{value}</div></div>;
}
