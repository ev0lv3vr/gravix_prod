'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { listGuidedSessions, type GuidedSessionListItem } from '@/lib/products';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-accent-500/20 text-accent-500',
    abandoned: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[status] || 'bg-[#1F2937] text-[#94A3B8]'}`}>
      {status}
    </span>
  );
}

export function GuidedSessionsCard() {
  const [sessions, setSessions] = useState<GuidedSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGuidedSessions(5)
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent-500" />
          Guided Investigations
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-[#1F2937] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent-500" />
          Guided Investigations
        </h3>
        <p className="text-sm text-[#94A3B8]">No guided sessions yet.</p>
        <Link
          href="/failure"
          className="text-sm text-accent-500 hover:underline mt-2 inline-block"
        >
          Start your first investigation →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
      <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-accent-500" />
        Guided Investigations
      </h3>
      <div className="space-y-2">
        {sessions.map((s) => (
          <Link
            key={s.id}
            href={`/guided/${s.id}`}
            className="flex items-center justify-between p-2 rounded hover:bg-[#1F2937] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {statusBadge(s.status)}
              <span className="text-sm text-white truncate">
                {s.summary_preview || `Session ${s.id.slice(0, 8)}…`}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] text-[#64748B]">
                {s.message_count} msgs
              </span>
              <span className="text-xs text-[#64748B]">
                {formatDate(s.updated_at || s.created_at)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
