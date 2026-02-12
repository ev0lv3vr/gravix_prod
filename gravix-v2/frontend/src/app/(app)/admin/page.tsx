'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, FlaskConical, FileText, TrendingUp, UserPlus } from 'lucide-react';

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

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminOverview().then(setData).catch((e) => setError(e.message));
  }, []);

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
    </div>
  );
}
