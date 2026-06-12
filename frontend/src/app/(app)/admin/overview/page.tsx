'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Brain, Clock, Cpu, Server } from 'lucide-react';

import {
  AdminSection,
  EmptyState,
  MetricCard,
  ProgressRow,
  StatusPill,
} from '@/components/admin/AdminDashboardPrimitives';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

type OverviewMetrics = Awaited<ReturnType<typeof api.getAdminMetricsOverview>>;
type EngagementMetrics = Awaited<ReturnType<typeof api.getAdminMetricsEngagement>>;
type AiMetrics = Awaited<ReturnType<typeof api.getAdminMetricsAiEngine>>;
type KnowledgeMetrics = Awaited<ReturnType<typeof api.getAdminMetricsKnowledge>>;
type SystemMetrics = Awaited<ReturnType<typeof api.getAdminMetricsSystem>>;

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

function formatPercent(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '-';
  return `${n.toFixed(1)}%`;
}

function formatLatency(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '-';
  return `${Math.round(n)}ms`;
}

function formatTime(value: string | null | undefined) {
  if (!value) return 'No recent run';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOverviewPage() {
  const [{ range, startDate, endDate }, setWindow] = useState(readRange);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [ai, setAi] = useState<AiMetrics | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeMetrics | null>(null);
  const [system, setSystem] = useState<SystemMetrics | null>(null);
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

    Promise.all([
      api.getAdminMetricsOverview(range, startDate, endDate),
      api.getAdminMetricsEngagement(range, startDate, endDate),
      api.getAdminMetricsAiEngine(range, startDate, endDate),
      api.getAdminMetricsKnowledge(range, startDate, endDate),
      api.getAdminMetricsSystem(range, startDate, endDate),
    ])
      .then(([overviewData, engagementData, aiData, knowledgeData, systemData]) => {
        if (cancelled) return;
        setOverview(overviewData);
        setEngagement(engagementData);
        setAi(aiData);
        setKnowledge(knowledgeData);
        setSystem(systemData);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [range, startDate, endDate]);

  const loading = !overview || !engagement || !ai || !knowledge || !system;

  const planTotal = useMemo(() => {
    if (!overview?.users_by_plan) return 0;
    return Object.values(overview.users_by_plan).reduce((sum, count) => sum + count, 0);
  }, [overview]);

  if (error) {
    return <div className="p-8 text-sm text-danger">{error}</div>;
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-text-secondary animate-pulse">
        Loading admin overview...
      </div>
    );
  }

  const paidUsers =
    (overview.users_by_plan.pro || 0) +
    (overview.users_by_plan.quality || 0) +
    (overview.users_by_plan.enterprise || 0) +
    (overview.users_by_plan.team || 0);

  const systemTone =
    system.server_errors > 0 || system.cron_failures > 0
      ? 'danger'
      : system.client_errors > 0
        ? 'warn'
        : 'good';

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">Overview</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={`Window ${range}`} />
          <StatusPill
            label={`${system.requests_total.toLocaleString()} requests`}
            tone={systemTone}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Analyses"
          value={overview.total_analyses.toLocaleString()}
          helper={`${overview.analyses_this_week.toLocaleString()} this week`}
          trend={`${overview.analyses_today.toLocaleString()} today`}
        />
        <MetricCard
          label="Specs"
          value={overview.total_specs.toLocaleString()}
          helper={`${engagement.specs.toLocaleString()} in window`}
        />
        <MetricCard
          label="Users"
          value={overview.total_users.toLocaleString()}
          helper={`${overview.signups_this_week.toLocaleString()} signups this week`}
          trend={`${paidUsers.toLocaleString()} paid`}
          tone={paidUsers > 0 ? 'good' : 'neutral'}
        />
        <MetricCard
          label="AI Health"
          value={ai.total_ai_calls.toLocaleString()}
          helper={`${ai.failed_ai_calls.toLocaleString()} failed calls`}
          tone={ai.failed_ai_calls > 0 ? 'warn' : 'good'}
          trend={formatLatency(ai.avg_latency_ms)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminSection
          title="Operating Signals"
          eyebrow="Current window"
          action={
            <Link
              href={`/admin/system?range=${range}`}
              className="inline-flex items-center gap-2 text-sm text-accent-500 hover:text-accent-600"
            >
              System detail
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <Card className="grid gap-5 p-5 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Server className="h-4 w-4 text-accent-500" />
                Runtime
              </div>
              <ProgressRow
                label="Server errors"
                value={system.server_errors}
                max={Math.max(system.requests_total, 1)}
                detail={`${system.server_errors.toLocaleString()} / ${system.requests_total.toLocaleString()}`}
                tone={system.server_errors > 0 ? 'danger' : 'good'}
              />
              <ProgressRow
                label="Client errors"
                value={system.client_errors}
                max={Math.max(system.requests_total, 1)}
                detail={`${system.client_errors.toLocaleString()} / ${system.requests_total.toLocaleString()}`}
                tone={system.client_errors > 0 ? 'warn' : 'good'}
              />
              <ProgressRow
                label="P95 latency"
                value={system.p95_latency_ms || 0}
                max={3000}
                detail={formatLatency(system.p95_latency_ms)}
                tone={(system.p95_latency_ms || 0) > 1500 ? 'warn' : 'good'}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Brain className="h-4 w-4 text-accent-500" />
                Knowledge
              </div>
              <ProgressRow
                label="Knowledge injection"
                value={ai.calls_with_knowledge}
                max={Math.max(ai.total_ai_calls, 1)}
                detail={formatPercent(ai.injection_rate_pct)}
                tone={(ai.injection_rate_pct || 0) > 0 ? 'good' : 'neutral'}
              />
              <ProgressRow
                label="Fresh patterns"
                value={knowledge.knowledge_patterns_recent}
                max={Math.max(knowledge.knowledge_patterns_total, 1)}
                detail={`${knowledge.knowledge_patterns_recent.toLocaleString()} recent`}
              />
              <ProgressRow
                label="Recent feedback"
                value={knowledge.feedback_recent}
                max={Math.max(knowledge.feedback_total, 1)}
                detail={`${knowledge.feedback_recent.toLocaleString()} recent`}
                tone={knowledge.feedback_recent > 0 ? 'good' : 'neutral'}
              />
            </div>
          </Card>
        </AdminSection>

        <AdminSection title="Plan Mix" eyebrow="Users by plan">
          <Card className="space-y-4 p-5">
            {Object.entries(overview.users_by_plan).length === 0 ? (
              <EmptyState label="No user plan data for this workspace." />
            ) : (
              Object.entries(overview.users_by_plan)
                .sort((a, b) => b[1] - a[1])
                .map(([plan, count]) => (
                  <ProgressRow
                    key={plan}
                    label={plan}
                    value={count}
                    max={Math.max(planTotal, 1)}
                    detail={`${count.toLocaleString()} users`}
                    tone={plan === 'free' ? 'neutral' : 'good'}
                  />
                ))
            )}
          </Card>
        </AdminSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminSection
          title="Recent Activity"
          eyebrow="Analyses and specs"
          action={
            <Link
              href="/admin/activity"
              className="inline-flex items-center gap-2 text-sm text-accent-500 hover:text-accent-600"
            >
              Full feed
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <Card className="overflow-hidden">
            {(engagement.recent_activity || []).length === 0 ? (
              <div className="p-5">
                <EmptyState label="No activity in this period." />
              </div>
            ) : (
              <div className="divide-y divide-brand-600">
                {(engagement.recent_activity || []).slice(0, 8).map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded border border-brand-600 bg-brand-900 text-accent-500">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {item.substrates || item.type}
                      </p>
                      <p className="truncate text-xs text-text-secondary">
                        {item.user_email || 'unknown user'} · {item.status || 'unknown'}
                      </p>
                    </div>
                    <StatusPill label={item.type} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </AdminSection>

        <AdminSection
          title="Engine Watch"
          eyebrow="Model and cron"
          action={
            <Link
              href={`/admin/ai-engine?range=${range}`}
              className="inline-flex items-center gap-2 text-sm text-accent-500 hover:text-accent-600"
            >
              AI detail
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <Card className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded border border-brand-600 bg-brand-900 p-3">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Cpu className="h-3.5 w-3.5" />
                  Success
                </div>
                <p className="mt-2 font-mono text-xl text-white">
                  {ai.successful_ai_calls.toLocaleString()}
                </p>
              </div>
              <div className="rounded border border-brand-600 bg-brand-900 p-3">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock className="h-3.5 w-3.5" />
                  Last cron
                </div>
                <p className="mt-2 truncate font-mono text-sm text-white">
                  {formatTime(ai.last_aggregation_run)}
                </p>
              </div>
              <div className="rounded border border-brand-600 bg-brand-900 p-3">
                <div className="text-xs text-text-secondary">Patterns</div>
                <p className="mt-2 font-mono text-xl text-white">
                  {ai.total_knowledge_patterns.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(ai.calls_by_engine || {}).length === 0 ? (
                <EmptyState label="No AI engine call data yet." />
              ) : (
                Object.entries(ai.calls_by_engine).map(([engine, count]) => (
                  <ProgressRow
                    key={engine}
                    label={engine}
                    value={count}
                    max={Math.max(ai.total_ai_calls, 1)}
                    detail={`${count.toLocaleString()} calls`}
                  />
                ))
              )}
            </div>
          </Card>
        </AdminSection>
      </div>
    </div>
  );
}
