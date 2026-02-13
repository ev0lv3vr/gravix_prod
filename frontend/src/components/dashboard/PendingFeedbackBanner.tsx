'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, X } from 'lucide-react';
import { api, type PendingFeedbackItem } from '@/lib/api';

export function PendingFeedbackBanner() {
  const [pending, setPending] = useState<PendingFeedbackItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const items = await api.getPendingFeedback();
        if (!cancelled) setPending(items);
      } catch {
        // Silently fail — banner is non-critical
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || dismissed || pending.length === 0) return null;

  const oldest = pending[pending.length - 1];

  // Defensive: if backend returns an unexpected shape, don't crash the dashboard.
  if (!oldest?.analysis_id) return null;

  return (
    <div className="relative bg-accent-500/10 border border-accent-500/20 rounded-lg p-4 mb-8 hover:border-accent-500/40 transition-colors">
      <Link
        href={`/feedback/${oldest.analysis_id}`}
        className="flex items-center gap-3"
      >
        <MessageSquare className="w-5 h-5 text-accent-500 flex-shrink-0" />
        <p className="text-sm text-[#94A3B8]">
          You have{' '}
          <strong className="text-white">
            {pending.length} analys{pending.length === 1 ? 'is' : 'es'}
          </strong>{' '}
          waiting for feedback.
        </p>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          setDismissed(true);
        }}
        className="absolute top-3 right-3 text-[#64748B] hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
