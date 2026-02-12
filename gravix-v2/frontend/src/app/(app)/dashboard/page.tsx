'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { api, type UsageResponse } from '@/lib/api';
import { FlaskConical, Search, ArrowRight } from 'lucide-react';
import { PendingFeedbackBanner } from '@/components/dashboard/PendingFeedbackBanner';

type HistoryType = 'spec' | 'failure';

type HistoryItem = {
  id: string;
  type: HistoryType;
  substrates: string;
  result: string;
  createdAt: string | null;
  status?: string;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const usageFallback = useUsageTracking();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<HistoryItem[]>([]);
  const [profilePlan, setProfilePlan] = useState<string>('free');
  const [usage, setUsage] = useState<UsageResponse | null>(null);

  useEffect(() => {
    if (!authLoading && !authUser) {
      window.location.href = '/';
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    if (authLoading || !authUser) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [profile, usageResp, specs, failures] = await Promise.all([
          api.getCurrentUser(),
          api.getCurrentUserUsage(),
          api.listSpecRequests(),
          api.listFailureAnalyses(),
        ]);

        if (cancelled) return;

        setProfilePlan(profile?.plan ?? 'free');
        setUsage(usageResp);

        const specItems: HistoryItem[] = (specs as any[]).map((s) => {
          const substrateA = s.substrate_a ?? s.substrateA;
          const substrateB = s.substrate_b ?? s.substrateB;
          const recommended = s.recommended_spec ?? s.recommendedSpec;
          const recommendedType = recommended?.material_type ?? recommended?.materialType;
          const recommendedTitle = recommended?.title;

          return {
            id: s.id,
            type: 'spec',
            substrates: substrateA && substrateB ? `${substrateA} → ${substrateB}` : '—',
            result: recommendedType ?? recommendedTitle ?? (s.material_category ?? s.materialCategory ?? 'Spec'),
            createdAt: s.created_at ?? s.createdAt ?? null,
            status: s.status,
          };
        });

        const failureItems: HistoryItem[] = (failures as any[]).map((f) => {
          const substrateA = f.substrate_a ?? f.substrateA;
          const substrateB = f.substrate_b ?? f.substrateB;
          const substrates = substrateA && substrateB ? `${substrateA} → ${substrateB}` : '—';
          const failureMode = f.failure_mode ?? f.failureMode;
          const materialSub = f.material_subcategory ?? f.materialSubcategory;

          return {
            id: f.id,
            type: 'failure',
            substrates,
            result: failureMode ?? materialSub ?? (f.material_category ?? f.materialCategory ?? 'Failure analysis'),
            createdAt: f.created_at ?? f.createdAt ?? null,
            status: f.status,
          };
        });

        const merged = [...specItems, ...failureItems].sort((a, b) => {
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bt - at;
        });

        setRecentAnalyses(merged.slice(0, 5));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser]);

  const greeting = authUser?.email
    ? `Welcome back, ${authUser.email.split('@')[0]}`
    : 'Welcome back';

  const usageText = useMemo(() => {
    if (usage) return `${usage.analyses_used}/${usage.analyses_limit} analyses used`;
    return `${usageFallback.used}/${usageFallback.limit} analyses used`;
  }, [usage, usageFallback.limit, usageFallback.used]);

  // pendingFeedback is now handled by PendingFeedbackBanner component

  if (authLoading || !authUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Component 6.1: Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <h1 className="text-2xl font-bold text-white mb-2 md:mb-0">{greeting}</h1>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-accent-500/10 text-accent-500 text-xs font-semibold rounded-full uppercase">
            {profilePlan}
          </span>
          <span className="text-sm text-[#94A3B8] font-mono">{usageText}</span>
        </div>
      </div>

      {/* Component 6.2: Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link href="/tool" className="group bg-brand-800 border border-[#1F2937] rounded-lg p-6 hover:border-accent-500 transition-colors">
          <FlaskConical className="w-8 h-8 text-accent-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">New Material Spec</h3>
          <p className="text-sm text-[#94A3B8]">Generate a vendor-neutral adhesive specification</p>
          <span className="text-sm text-accent-500 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Start <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
        <Link href="/failure" className="group bg-brand-800 border border-[#1F2937] rounded-lg p-6 hover:border-accent-500 transition-colors">
          <Search className="w-8 h-8 text-accent-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Diagnose a Failure</h3>
          <p className="text-sm text-[#94A3B8]">Get ranked root causes with confidence scores</p>
          <span className="text-sm text-accent-500 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Start <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Component 6.4: Pending Feedback Banner */}
      <PendingFeedbackBanner />

      {/* Component 6.3: Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
          <Link href="/history" className="text-sm text-accent-500 hover:underline">View All →</Link>
        </div>

        {loading && <div className="text-sm text-[#94A3B8] py-6">Loading…</div>}
        {error && <div className="text-sm text-warning py-6">{error}</div>}

        {!loading && !error && (
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="text-left text-xs text-[#64748B] font-medium p-4">Type</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4">Substrates</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden md:table-cell">Result</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937] transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/history/${a.type}/${a.id}`)}
                  >
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          a.type === 'spec'
                            ? 'bg-accent-500/10 text-accent-500'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {a.type === 'spec' ? 'Spec' : 'Failure'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-white">{a.substrates}</td>
                    <td className="p-4 text-sm text-[#94A3B8] hidden md:table-cell">{a.result}</td>
                    <td className="p-4 text-sm text-[#64748B]">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}

                {recentAnalyses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-sm text-[#94A3B8]">
                      No recent analyses yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
