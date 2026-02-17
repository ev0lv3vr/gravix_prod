'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { alertsApi, type PatternAlert, type AlertStatus } from '@/lib/alerts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Loader2,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

type PlanTier = 'free' | 'pro' | 'quality' | 'enterprise';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  informational: '#3B82F6',
};

const SEVERITY_EMOJI: Record<string, string> = {
  critical: '🔴',
  warning: '🟡',
  informational: '🔵',
};

const STATUS_FILTERS: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'all', label: 'All' },
];

export default function AlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<PlanTier>('free');
  const [planLoading, setPlanLoading] = useState(true);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('active');
  const [ackingId, setAckingId] = useState<string | null>(null);
  const [ackNotes, setAckNotes] = useState<Record<string, string>>({});
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  // Fetch plan
  useEffect(() => {
    if (authLoading || !user) return;
    api
      .getCurrentUser()
      .then((u) => {
        const p = (u?.plan || 'free').toLowerCase();
        if (p === 'team' || p === 'quality') setPlan('quality');
        else if (p === 'enterprise') setPlan('enterprise');
        else if (p === 'pro') setPlan('pro');
        else setPlan('free');
      })
      .catch(() => setPlan('free'))
      .finally(() => setPlanLoading(false));
  }, [authLoading, user]);

  const isEnterprise = plan === 'enterprise';

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!isEnterprise) return;
    setLoading(true);
    try {
      const data = await alertsApi.list({ status: statusFilter });
      setAlerts(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isEnterprise, statusFilter]);

  useEffect(() => {
    if (!planLoading && isEnterprise) {
      fetchAlerts();
    } else if (!planLoading) {
      setLoading(false);
    }
  }, [planLoading, isEnterprise, fetchAlerts]);

  const handleAcknowledge = async (id: string) => {
    setAckingId(id);
    try {
      const note = ackNotes[id] || '';
      const updated = await alertsApi.acknowledge(id, note);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      setShowNoteFor(null);
    } catch {
      // silently fail
    } finally {
      setAckingId(null);
    }
  };

  if (authLoading || !user) return null;

  // Upgrade prompt for non-enterprise users
  if (!planLoading && !isEnterprise) {
    return (
      <div className="container mx-auto px-6 py-10 max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-[#94A3B8] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Dashboard
        </Link>

        <div className="bg-brand-800 border border-[#1F2937] rounded-xl p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-3">Pattern Alerts</h1>
          <p className="text-[#94A3B8] mb-6 max-w-md mx-auto">
            Pattern alerts use AI to detect cross-case anomalies — product lot issues, seasonal patterns,
            and geographic clusters — before scattered incidents become systematic quality events.
          </p>
          <p className="text-sm text-[#64748B] mb-6">
            Available on the Enterprise plan.
          </p>
          <Link href="/pricing">
            <Button className="bg-accent-500 hover:bg-accent-600 text-white">
              View Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-[#94A3B8] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-[#F59E0B]" />
          <h1 className="text-2xl font-bold text-white">Pattern Alerts</h1>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-accent-500 text-white'
                : 'bg-brand-800 text-[#94A3B8] hover:text-white border border-[#1F2937]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {loading || planLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#64748B]" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-12 text-center">
          <ShieldAlert className="w-10 h-10 text-[#374151] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">
            {statusFilter === 'active'
              ? 'No active alerts'
              : statusFilter === 'acknowledged'
                ? 'No acknowledged alerts'
                : 'No alerts yet'}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            Pattern alerts are generated automatically when cross-case anomalies are detected.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-brand-800 border border-[#1F2937] rounded-lg p-6"
              style={{ borderLeftWidth: '4px', borderLeftColor: SEVERITY_COLORS[alert.severity] || '#3B82F6' }}
            >
              {/* Severity + title */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <Badge
                    variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}
                    className="text-xs uppercase shrink-0"
                  >
                    {SEVERITY_EMOJI[alert.severity]} {alert.severity}
                  </Badge>
                  <div>
                    <h3 className="text-base font-semibold text-white">{alert.title}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Detected: {new Date(alert.detected_at).toLocaleDateString()} · {alert.stats}
                    </p>
                  </div>
                </div>
                {alert.status === 'acknowledged' && (
                  <Badge variant="success" className="text-[10px] shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Acknowledged
                  </Badge>
                )}
              </div>

              {/* Hypothesis */}
              {alert.hypothesis && (
                <p className="text-sm text-[#94A3B8] mb-2">
                  <span className="font-medium text-white">Hypothesis:</span> {alert.hypothesis}
                </p>
              )}

              {/* Affected / geography */}
              {(alert.affected_organizations || alert.geographic_cluster) && (
                <p className="text-xs text-[#64748B] mb-2">
                  {alert.affected_organizations && (
                    <span>Affected organizations: {alert.affected_organizations}</span>
                  )}
                  {alert.affected_organizations && alert.geographic_cluster && <span> · </span>}
                  {alert.geographic_cluster && (
                    <span>Geographic cluster: {alert.geographic_cluster}</span>
                  )}
                </p>
              )}

              {/* Recommendations */}
              {alert.recommendations && (
                <p className="text-sm text-[#94A3B8] mb-4">
                  <span className="font-medium text-white">Recommended:</span> {alert.recommendations}
                </p>
              )}

              {/* Acknowledge action */}
              {alert.status === 'active' && (
                <div>
                  {showNoteFor === alert.id ? (
                    <div className="flex items-end gap-3 mt-3">
                      <div className="flex-1">
                        <label className="text-xs text-[#64748B] mb-1 block">Note (optional)</label>
                        <textarea
                          value={ackNotes[alert.id] || ''}
                          onChange={(e) =>
                            setAckNotes((prev) => ({ ...prev, [alert.id]: e.target.value }))
                          }
                          placeholder="Add a note about the actions taken..."
                          className="w-full bg-[#111827] border border-[#374151] rounded p-2 text-sm text-white placeholder-[#64748B] resize-none h-16 focus:outline-none focus:border-accent-500"
                        />
                      </div>
                      <div className="flex gap-2 pb-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#94A3B8]"
                          onClick={() => setShowNoteFor(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent-500 hover:bg-accent-600 text-white"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={ackingId === alert.id}
                        >
                          {ackingId === alert.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : null}
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNoteFor(alert.id)}
                      className="mt-2"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              )}

              {/* Acknowledge info */}
              {alert.status === 'acknowledged' && alert.acknowledged_at && (
                <div className="mt-3 pt-3 border-t border-[#1F2937]">
                  <p className="text-xs text-[#64748B]">
                    Acknowledged {new Date(alert.acknowledged_at).toLocaleDateString()}
                    {alert.acknowledged_by && ` by ${alert.acknowledged_by}`}
                  </p>
                  {alert.acknowledge_note && (
                    <p className="text-xs text-[#94A3B8] mt-1 italic">&ldquo;{alert.acknowledge_note}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
