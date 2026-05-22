import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Minus,
  TrendingUp,
} from 'lucide-react';
import type React from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AdminSection({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs uppercase tracking-wide text-text-secondary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-base font-bold text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  tone = 'neutral',
  trend,
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'neutral' | 'good' | 'warn' | 'danger';
  trend?: string;
}) {
  const Icon =
    tone === 'good' ? CheckCircle2 : tone === 'warn' || tone === 'danger' ? AlertTriangle : TrendingUp;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-text-secondary">
            {label}
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-white">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded border',
            tone === 'good' && 'border-success/40 bg-success/10 text-success',
            tone === 'warn' && 'border-warning/40 bg-warning/10 text-warning',
            tone === 'danger' && 'border-danger/40 bg-danger/10 text-danger',
            tone === 'neutral' && 'border-accent-500/40 bg-accent-500/10 text-accent-500'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-text-secondary">{helper || 'Current window'}</span>
        {trend ? (
          <span className="inline-flex items-center gap-1 font-mono text-accent-500">
            {trend}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        ) : null}
      </div>
    </Card>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded border border-dashed border-brand-600 bg-brand-900/40 px-4 text-center text-sm text-text-secondary">
      {label}
    </div>
  );
}

export function ProgressRow({
  label,
  value,
  max,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  max: number;
  detail?: string;
  tone?: 'neutral' | 'good' | 'warn' | 'danger';
}) {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-white">{label}</span>
        <span className="font-mono text-xs text-text-secondary">
          {detail || value.toLocaleString()}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-brand-700">
        <div
          className={cn(
            'h-full rounded',
            tone === 'good' && 'bg-success',
            tone === 'warn' && 'bg-warning',
            tone === 'danger' && 'bg-danger',
            tone === 'neutral' && 'bg-accent-500'
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'good' | 'warn' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium',
        tone === 'good' && 'border-success/40 bg-success/10 text-success',
        tone === 'warn' && 'border-warning/40 bg-warning/10 text-warning',
        tone === 'danger' && 'border-danger/40 bg-danger/10 text-danger',
        tone === 'neutral' && 'border-brand-600 bg-brand-800 text-text-secondary'
      )}
    >
      {tone === 'neutral' ? <Minus className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}
