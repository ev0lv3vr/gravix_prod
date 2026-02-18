'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, FlaskConical, FileText, TrendingUp, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';
import { getPatternAlerts, updatePatternAlert, type PatternAlert } from '@/lib/products';
import { cn } from '@/lib/utils';

type OverviewData = Awaited<ReturnType<typeof api.getAdminOverview>>;

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-brand-800 border border-brand-600 rounded p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</span>
        <div className={`p-2 rounded ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold font-mono text-white">{value}</div>
      {sub && <div className="text-xs text-text-tertiary mt-1">{sub}</div>}
    </div>
  );
}

// Sprint 11: Pattern Alert Components
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-danger/20 text-danger',
    warning: 'bg-warning/20 text-warning',
    informational: 'bg-info/20 text-info',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', styles[severity] || styles.informational)}>
      {severity}
    </span>
  );
}

function PatternAlertCard({
  alert,
  onAcknowledge,
  onResolve,
}: {
  alert: PatternAlert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-brand-800 border border-brand-600 rounded p-4 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge severity={alert.severity} />
            <span className="text-xs text-text-tertiary font-mono">{alert.alert_type}</span>
          </div>
          <h3 className="text-sm font-bold text-white">{alert.title}</h3>
          {alert.description && (
            <p className="text-xs text-text-secondary mt-1">{alert.description}</p>
          )}
        </div>
        <div className="flex gap-1 ml-3">
          {alert.status === 'active' && (
            <>
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="px-2 py-1 text-[10px] font-medium rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
              >
                Acknowledge
              </button>
              <button
                onClick={() => onResolve(alert.id)}
                className="px-2 py-1 text-[10px] font-medium rounded bg-success/10 text-success hover:bg-success/20 transition-colors"
              >
                Resolve
              </button>
            </>
          )}
          {alert.status === 'acknowledged' && (
            <button
              onClick={() => onResolve(alert.id)}
              className="px-2 py-1 text-[10px] font-medium rounded bg-success/10 text-success hover:bg-success/20 transition-colors"
            >
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Expandable details */}
      <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-accent-500 mt-2">
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-brand-700 space-y-2">
          {alert.affected_product && (
            <div className="text-xs"><span className="text-text-tertiary">Product:</span> <span className="text-white">{alert.affected_product}</span></div>
          )}
          {alert.affected_substrate && (
            <div className="text-xs"><span className="text-text-tertiary">Substrate:</span> <span className="text-white">{alert.affected_substrate}</span></div>
          )}
          {alert.failure_mode && (
            <div className="text-xs"><span className="text-text-tertiary">Failure Mode:</span> <span className="text-white">{alert.failure_mode}</span></div>
          )}
          {alert.statistical_confidence != null && (
            <div className="text-xs"><span className="text-text-tertiary">Confidence:</span> <span className="text-white">{(alert.statistical_confidence * 100).toFixed(0)}%</span></div>
          )}
          {alert.ai_explanation && (
            <div className="text-xs mt-2 p-2 bg-brand-900 rounded">
              <span className="text-text-tertiary block mb-1">AI Explanation:</span>
              <span className="text-text-primary">{alert.ai_explanation}</span>
            </div>
          )}
          {alert.affected_investigation_ids && alert.affected_investigation_ids.length > 0 && (
            <div className="text-xs"><span className="text-text-tertiary">Affected analyses:</span> <span className="text-white">{alert.affected_investigation_ids.length}</span></div>
          )}
        </div>
      )}
    </div>
  );
}

type EngineHealthData = Awaited<ReturnType<typeof api.getAdminEngineHealth>>;

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [engineHealth, setEngineHealth] = useState<EngineHealthData | null>(null);

  useEffect(() => {
    api.getAdminOverview().then(setData).catch((e) => setError(e.message));
    getPatternAlerts().then(setAlerts).catch((e) => setAlertsError(e.message));
    api.getAdminEngineHealth().then(setEngineHealth).catch(() => {});
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      const updated = await updatePatternAlert(id, 'acknowledged');
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
    } catch (e) { console.error(e); }
  };

  const handleResolve = async (id: string) => {
    try {
      await updatePatternAlert(id, 'resolved');
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  if (error) {
    return (
      <div className="p-8">
        <p className="text-danger text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-text-secondary text-sm animate-pulse">Loading overview…</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-xl font-bold font-mono text-white mb-6">Dashboard Overview</h1>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={data.total_users}
          icon={Users}
          color="bg-accent-500/20 text-accent-500"
        />
        <StatCard
          label="Pro Users"
          value={data.users_by_plan.pro ?? 0}
          sub={`${data.users_by_plan.team ?? 0} team`}
          icon={TrendingUp}
          color="bg-success/20 text-success"
        />
        <StatCard
          label="Analyses Today"
          value={data.analyses_today}
          sub={`${data.analyses_this_week} this week`}
          icon={FlaskConical}
          color="bg-warning/20 text-warning"
        />
        <StatCard
          label="Specs Today"
          value={data.total_specs}
          sub={`${data.total_analyses} total analyses`}
          icon={FileText}
          color="bg-info/20 text-info"
        />
      </div>

      {/* Signups row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Signups Today"
          value={data.signups_today}
          icon={UserPlus}
          color="bg-accent-500/20 text-accent-500"
        />
        <StatCard
          label="Signups This Week"
          value={data.signups_this_week}
          icon={UserPlus}
          color="bg-success/20 text-success"
        />
        <StatCard
          label="Total Analyses"
          value={data.total_analyses}
          sub={`${data.total_specs} total specs`}
          icon={FlaskConical}
          color="bg-warning/20 text-warning"
        />
      </div>

      {/* Plan breakdown */}
      <div className="bg-brand-800 border border-brand-600 rounded p-5">
        <h2 className="text-sm font-bold text-white mb-4">Users by Plan</h2>
        <div className="flex flex-wrap gap-6">
          {Object.entries(data.users_by_plan).map(([plan, count]) => (
            <div key={plan} className="flex items-center gap-3">
              <span
                className={`inline-block px-2 py-0.5 text-xs font-mono rounded ${
                  plan === 'pro'
                    ? 'bg-success/20 text-success'
                    : plan === 'team'
                    ? 'bg-info/20 text-info'
                    : 'bg-brand-700 text-text-secondary'
                }`}
              >
                {plan}
              </span>
              <span className="text-lg font-mono font-bold text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sprint 11: Pattern Alerts Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-bold text-white">Pattern Alerts</h2>
          {alerts.length > 0 && (
            <span className="bg-danger/20 text-danger text-xs font-medium px-2 py-0.5 rounded-full">
              {alerts.length} active
            </span>
          )}
        </div>

        {alertsError && (
          <p className="text-danger text-xs mb-4">{alertsError}</p>
        )}

        {alerts.length === 0 && !alertsError && (
          <div className="bg-brand-800 border border-brand-600 rounded p-6 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No active pattern alerts. All clear.</p>
          </div>
        )}

        {alerts.map((alert) => (
          <PatternAlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        ))}
      </div>

      {/* Engine Health Card */}
      {engineHealth && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-accent-500" />
            Engine Health (last 7 days)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="AI Calls" value={engineHealth.total_ai_calls}
              sub={`${engineHealth.failed_ai_calls} failed`}
              icon={FlaskConical} color="bg-accent-500/10 text-accent-500" />
            <StatCard label="Avg Latency" value={`${engineHealth.avg_latency_ms ?? 0}ms`}
              icon={TrendingUp} color="bg-emerald-500/10 text-emerald-500" />
            <StatCard label="Knowledge Injection" value={`${engineHealth.injection_rate_pct ?? 0}%`}
              sub={`${engineHealth.calls_with_knowledge} calls enriched`}
              icon={CheckCircle} color="bg-purple-500/10 text-purple-500" />
            <StatCard label="Knowledge Patterns" value={engineHealth.total_knowledge_patterns}
              sub={`${engineHealth.patterns_with_strong_evidence} with strong evidence`}
              icon={FileText} color="bg-blue-500/10 text-blue-500" />
          </div>

          {/* Feedback flywheel + Cron status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-brand-800 border border-brand-600 rounded p-5">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Feedback Flywheel</h3>
              <div className="text-2xl font-bold font-mono text-white">{engineHealth.total_feedback_entries}</div>
              <div className="text-xs text-text-tertiary mt-1">total feedback entries</div>
              <div className="mt-3 text-xs text-text-secondary">
                {engineHealth.total_feedback_entries === 0 ? (
                  <span className="text-warning">⚠ No feedback yet — engine running on zero empirical data</span>
                ) : (
                  <span className="text-emerald-400">✓ Flywheel active</span>
                )}
              </div>
            </div>
            <div className="bg-brand-800 border border-brand-600 rounded p-5">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Last Aggregation Cron</h3>
              <div className="text-sm font-mono text-white">
                {engineHealth.last_aggregation_run ?? "Never run"}
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                Status: {engineHealth.last_aggregation_status ?? "unknown"} •{' '}
                {engineHealth.last_aggregation_patterns_upserted} patterns upserted
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
