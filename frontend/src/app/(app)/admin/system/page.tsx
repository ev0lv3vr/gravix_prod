'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Server,
} from 'lucide-react';

import {
  AdminSection,
  EmptyState,
  MetricCard,
  ProgressRow,
  StatusPill,
} from '@/components/admin/AdminDashboardPrimitives';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

type SystemMetrics = Awaited<ReturnType<typeof api.getAdminMetricsSystem>>;
type EndpointRow = SystemMetrics['endpoint_performance'][number];
type ErrorRow = SystemMetrics['recent_errors'][number];
type CronRun = SystemMetrics['recent_cron_runs'][number];

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

function formatTime(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDetail(value: unknown) {
  if (typeof value === 'string') return value;
  if (value == null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function statusTone(statusCode?: number | null) {
  if (!statusCode) return 'neutral';
  if (statusCode >= 500) return 'danger';
  if (statusCode >= 400) return 'warn';
  return 'good';
}

function cronTone(status?: string | null) {
  if (!status) return 'neutral';
  return ['ok', 'success', 'completed'].includes(status) ? 'good' : 'danger';
}

export default function AdminSystemPage() {
  const [{ range, startDate, endDate }, setWindow] = useState(readRange);
  const [data, setData] = useState<SystemMetrics | null>(null);
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
      .getAdminMetricsSystem(range, startDate, endDate)
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
        Loading system metrics...
      </div>
    );
  }

  const systemTone =
    data.server_errors > 0 || data.cron_failures > 0
      ? 'danger'
      : data.client_errors > 0
        ? 'warn'
        : 'good';
  const maxHourlyRequests = Math.max(
    ...data.hourly_traffic.map((row) => row.requests),
    1
  );

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">System Health</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={`Window ${range}`} />
          <StatusPill label="API request logs" tone={systemTone} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Requests"
          value={data.requests_total.toLocaleString()}
          helper="Logged API traffic"
          tone={data.requests_total > 0 ? 'neutral' : 'warn'}
        />
        <MetricCard
          label="Server Errors"
          value={data.server_errors.toLocaleString()}
          helper="HTTP 5xx responses"
          tone={data.server_errors > 0 ? 'danger' : 'good'}
        />
        <MetricCard
          label="Client Errors"
          value={data.client_errors.toLocaleString()}
          helper="HTTP 4xx responses"
          tone={data.client_errors > 0 ? 'warn' : 'good'}
        />
        <MetricCard
          label="P95 Latency"
          value={formatLatency(data.p95_latency_ms)}
          helper="Across logged requests"
          tone={(data.p95_latency_ms || 0) > 1500 ? 'warn' : 'good'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminSection title="Endpoint Performance" eyebrow="Top endpoints">
          <Card className="overflow-x-auto p-0">
            {data.endpoint_performance.length === 0 ? (
              <div className="p-5">
                <EmptyState label="No endpoint traffic for this period." />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-600">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Endpoint
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Requests
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Avg
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-secondary">
                      P95
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Errors
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.endpoint_performance.map((endpoint: EndpointRow) => (
                    <tr
                      key={`${endpoint.method}-${endpoint.path}`}
                      className="border-b border-brand-700 hover:bg-brand-700/30"
                    >
                      <td className="max-w-[320px] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-accent-500">
                            {endpoint.method}
                          </span>
                          <span className="truncate font-mono text-xs text-white">
                            {endpoint.path}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {endpoint.requests.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {formatLatency(endpoint.avg_latency_ms)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {formatLatency(endpoint.p95_latency_ms)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                        {endpoint.error_rate_pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </AdminSection>

        <AdminSection title="Hourly Traffic" eyebrow="Last 24 buckets">
          <Card className="space-y-4 p-5">
            {data.hourly_traffic.length === 0 ? (
              <EmptyState label="No hourly traffic buckets for this period." />
            ) : (
              data.hourly_traffic.map((row) => (
                <ProgressRow
                  key={row.hour}
                  label={formatTime(row.hour)}
                  value={row.requests}
                  max={maxHourlyRequests}
                  detail={`${row.requests.toLocaleString()} req / ${row.errors.toLocaleString()} err`}
                  tone={row.errors > 0 ? 'warn' : 'neutral'}
                />
              ))
            )}
          </Card>
        </AdminSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection title="Recent Errors" eyebrow="HTTP 4xx / 5xx">
          <Card className="space-y-3 p-5">
            {data.recent_errors.length === 0 ? (
              <EmptyState label="No recent request errors in this period." />
            ) : (
              data.recent_errors.map((row: ErrorRow, index: number) => (
                <div
                  key={`${row.method}-${row.path}-${row.created_at}-${index}`}
                  className="flex items-start justify-between gap-4 border-b border-brand-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                      <span className="font-mono text-xs text-accent-500">
                        {row.method}
                      </span>
                      <span className="truncate font-mono text-xs text-white">
                        {row.path}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-text-secondary">
                      {formatDetail(row.error) || 'No error detail recorded'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusPill
                      label={String(row.status_code || '-')}
                      tone={statusTone(row.status_code)}
                    />
                    <p className="mt-1 font-mono text-[11px] text-text-secondary">
                      {formatTime(row.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </AdminSection>

        <AdminSection title="Cron Runs" eyebrow="Latest jobs">
          <Card className="space-y-3 p-5">
            {data.recent_cron_runs.length === 0 ? (
              <EmptyState label="No cron run records are available." />
            ) : (
              data.recent_cron_runs.map((run: CronRun, index: number) => (
                <div
                  key={`${run.job_name}-${run.created_at}-${index}`}
                  className="flex items-start justify-between gap-4 border-b border-brand-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {cronTone(run.status) === 'good' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <Activity className="h-4 w-4 shrink-0 text-warning" />
                      )}
                      <span className="truncate text-sm font-medium text-white">
                        {run.job_name || 'Unnamed job'}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-text-secondary">
                      {formatDetail(run.error) ||
                        formatDetail(run.result) ||
                        'No run detail recorded'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusPill
                      label={run.status || 'unknown'}
                      tone={cronTone(run.status)}
                    />
                    <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary">
                      <Clock className="h-3 w-3" />
                      {formatLatency(run.duration_ms)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </AdminSection>
      </div>

      <Card className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-5 w-5 text-accent-500" />
          <div>
            <p className="text-sm font-semibold text-white">
              System route parity is active
            </p>
            <p className="text-xs text-text-secondary">
              This page uses the existing admin metrics API and respects the
              shared date range selector.
            </p>
          </div>
        </div>
        <StatusPill
          label={`${data.cron_failures.toLocaleString()} cron failures`}
          tone={data.cron_failures > 0 ? 'danger' : 'good'}
        />
      </Card>
    </div>
  );
}
