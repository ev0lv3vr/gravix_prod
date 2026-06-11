'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { AlertTriangle, Brain, Clock, Cpu, Database, Gauge } from 'lucide-react';

import {
  AdminSection,
  EmptyState,
  MetricCard,
  ProgressRow,
  StatusPill,
} from '@/components/admin/AdminDashboardPrimitives';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

type AiMetrics = Awaited<ReturnType<typeof api.getAdminMetricsAiEngine>>;

function readRange() {
  if (typeof window === 'undefined') {
    return { range: '7d', startDate: undefined, endDate: undefined };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    range: params.get('range') || '7d',
    startDate: params.get('start_date') || undefined,
    endDate: params.get('end_date') || undefined,
  };
}

function formatLatency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '-';
  return `${Math.round(value)}ms`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '-';
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '-';
  return value.toLocaleString();
}

function formatConfidence(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '-';
  return value <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`;
}

function formatTime(value: string | null | undefined) {
  if (!value) return 'No recent aggregation';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function aggregationTone(status?: string | null) {
  if (!status) return 'neutral';
  return ['ok', 'success', 'completed'].includes(status.toLowerCase())
    ? 'good'
    : 'danger';
}

export default function AdminAiEnginePage() {
  const [{ range, startDate, endDate }, setWindow] = useState(readRange);
  const [data, setData] = useState<AiMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setWindow(readRange());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    api
      .getAdminMetricsAiEngine(range, startDate, endDate)
      .then((metrics) => {
        if (!cancelled) setData(metrics);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [range, startDate, endDate]);

  if (error) {
    return <div className="p-8 text-sm text-danger">{error}</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-sm text-text-secondary animate-pulse">
        Loading AI engine metrics...
      </div>
    );
  }

  const totalCalls = Math.max(data.total_ai_calls, 1);
  const parseTone = data.failed_ai_calls > 0 ? 'warn' : 'good';
  const knowledgeTone = (data.injection_rate_pct || 0) > 0 ? 'good' : 'neutral';
  const engines = Object.entries(data.calls_by_engine).sort((a, b) => b[1] - a[1]);
  const maxEngineCalls = Math.max(...engines.map(([, count]) => count), 1);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">AI Engine</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={`Window ${range}`} />
          <StatusPill
            label={`${formatNumber(data.failed_ai_calls)} failed calls`}
            tone={data.failed_ai_calls > 0 ? 'warn' : 'good'}
          />
          <StatusPill
            label={data.last_aggregation_status || 'Aggregation idle'}
            tone={aggregationTone(data.last_aggregation_status)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="AI Calls"
          value={data.total_ai_calls.toLocaleString()}
          helper={`${data.successful_ai_calls.toLocaleString()} successful`}
          trend={formatPercent((data.successful_ai_calls / totalCalls) * 100)}
          tone={data.total_ai_calls > 0 ? 'neutral' : 'warn'}
        />
        <MetricCard
          label="Avg Latency"
          value={formatLatency(data.avg_latency_ms)}
          helper="Claude round trip"
          tone={(data.avg_latency_ms || 0) > 3000 ? 'warn' : 'good'}
        />
        <MetricCard
          label="Knowledge Injection"
          value={formatPercent(data.injection_rate_pct)}
          helper={`${data.calls_with_knowledge.toLocaleString()} calls with context`}
          tone={knowledgeTone}
        />
        <MetricCard
          label="Strong Evidence"
          value={data.patterns_with_strong_evidence.toLocaleString()}
          helper={`${data.total_knowledge_patterns.toLocaleString()} total patterns`}
          tone={data.patterns_with_strong_evidence > 0 ? 'good' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminSection title="Reliability" eyebrow="Parse and latency signals">
          <Card className="space-y-5 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Gauge className="h-4 w-4 text-accent-500" />
              Engine health
            </div>
            <ProgressRow
              label="Successful calls"
              value={data.successful_ai_calls}
              max={totalCalls}
              detail={`${formatNumber(data.successful_ai_calls)} / ${formatNumber(data.total_ai_calls)}`}
              tone={parseTone}
            />
            <ProgressRow
              label="Failed calls"
              value={data.failed_ai_calls}
              max={totalCalls}
              detail={formatPercent((data.failed_ai_calls / totalCalls) * 100)}
              tone={data.failed_ai_calls > 0 ? 'danger' : 'good'}
            />
            <ProgressRow
              label="Knowledge coverage"
              value={data.calls_with_knowledge}
              max={totalCalls}
              detail={formatPercent(data.injection_rate_pct)}
              tone={knowledgeTone}
            />
          </Card>
        </AdminSection>

        <AdminSection title="Aggregation" eyebrow="Knowledge pipeline">
          <Card className="space-y-5 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Database className="h-4 w-4 text-accent-500" />
              Last run
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded border border-brand-600 bg-brand-900/40 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-secondary">
                  <Clock className="h-3.5 w-3.5" />
                  Completed
                </div>
                <p className="mt-2 text-sm text-white">{formatTime(data.last_aggregation_run)}</p>
              </div>
              <div className="rounded border border-brand-600 bg-brand-900/40 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-secondary">
                  <Brain className="h-3.5 w-3.5" />
                  Patterns upserted
                </div>
                <p className="mt-2 font-mono text-xl text-white">
                  {data.last_aggregation_patterns_upserted.toLocaleString()}
                </p>
              </div>
            </div>
            <ProgressRow
              label="Average patterns per call"
              value={data.avg_patterns_per_call || 0}
              max={5}
              detail={formatNumber(data.avg_patterns_per_call)}
              tone={(data.avg_patterns_per_call || 0) > 0 ? 'good' : 'neutral'}
            />
          </Card>
        </AdminSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminSection title="Model Mix" eyebrow="Calls by engine">
          <Card className="space-y-4 p-5">
            {engines.length === 0 ? (
              <EmptyState label="No AI calls have been logged for this period." />
            ) : (
              engines.map(([engine, count]) => (
                <ProgressRow
                  key={engine}
                  label={engine}
                  value={count}
                  max={maxEngineCalls}
                  detail={count.toLocaleString()}
                />
              ))
            )}
          </Card>
        </AdminSection>

        <AdminSection title="Calibration" eyebrow="Raw vs calibrated confidence">
          <Card className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded border border-brand-600 bg-brand-900/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Cpu className="h-4 w-4 text-accent-500" />
                Raw confidence
              </div>
              <p className="mt-3 font-mono text-3xl font-bold text-white">
                {formatConfidence(data.avg_confidence_raw)}
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Average confidence directly from model output.
              </p>
            </div>
            <div className="rounded border border-brand-600 bg-brand-900/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Calibrated confidence
              </div>
              <p className="mt-3 font-mono text-3xl font-bold text-white">
                {formatConfidence(data.avg_confidence_calibrated)}
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Post-feedback confidence after knowledge adjustment.
              </p>
            </div>
          </Card>
        </AdminSection>
      </div>
    </div>
  );
}
