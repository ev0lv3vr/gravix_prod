'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { alertsApi, type PatternAlert } from '@/lib/alerts';
import { ArrowRight, ShieldAlert } from 'lucide-react';

const SEVERITY_EMOJI: Record<string, string> = {
  critical: '🔴',
  warning: '🟡',
  informational: '🔵',
};

export function PatternAlertsCard() {
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await alertsApi.list({ status: 'active' });
        if (!cancelled) setAlerts(data);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const activeCount = alerts.length;
  const recentAlerts = alerts.slice(0, 2);

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-base font-semibold text-white">Pattern Alerts</h3>
        </div>
        <Link
          href="/alerts"
          className="text-sm text-accent-500 hover:text-accent-400 inline-flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-32 bg-[#1F2937] rounded" />
          <div className="h-12 bg-[#1F2937] rounded" />
        </div>
      ) : activeCount === 0 ? (
        <p className="text-sm text-[#64748B]">No active alerts</p>
      ) : (
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="py-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0">
                  {SEVERITY_EMOJI[alert.severity] || '🔵'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium">
                    <span className="capitalize">{alert.severity}:</span>{' '}
                    {alert.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {alert.stats} · Detected {new Date(alert.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {activeCount > 2 && (
            <p className="text-xs text-[#64748B]">
              +{activeCount - 2} more active alert{activeCount - 2 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
