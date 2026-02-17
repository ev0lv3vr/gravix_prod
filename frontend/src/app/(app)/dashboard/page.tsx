'use client';

import { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';
import { FlaskConical, Search, ArrowRight, X, CheckCircle, Info } from 'lucide-react';
import { PendingFeedbackBanner } from '@/components/dashboard/PendingFeedbackBanner';
import { InvestigationsDashboardWidget } from '@/components/investigations/InvestigationsDashboardWidget';
import { InvestigationsSummaryCard } from '@/components/dashboard/InvestigationsSummaryCard';
import { PatternAlertsCard } from '@/components/dashboard/PatternAlertsCard';

type HistoryType = 'spec' | 'failure';

type HistoryItem = {
  id: string;
  type: HistoryType;
  substrates: string;
  result?: string;
  createdAt?: string | null;
  status?: string;
  date?: string;
  title?: string;
  confidenceScore?: number | null;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { plan: profilePlan, usage, refreshPlan } = usePlan();
  const usageFallback = useUsageTracking();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<HistoryItem[]>([]);

  // Hydrate recentAnalyses from cache immediately so returning users see data while API loads
  useEffect(() => {
    try {
      const cached = localStorage.getItem('gravix_dashboard_cache');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.recentAnalyses?.length > 0) setRecentAnalyses(data.recentAnalyses);
      }
    } catch { /* ignore */ }
  }, []);
  const [checkoutBanner, setCheckoutBanner] = useState<'success' | 'cancel' | null>(null);

  // Checkout success/cancel URL param handling
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success' || checkout === 'cancel') {
      setCheckoutBanner(checkout);
      // Clean the URL param
      router.replace('/dashboard', { scroll: false });

      if (checkout === 'success') {
        // Force-refresh plan data after successful checkout
        refreshPlan();
        const timer = setTimeout(() => setCheckoutBanner(null), 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, router, refreshPlan]);

  const dismissBanner = useCallback(() => setCheckoutBanner(null), []);

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
      try {
        // Fetch analyses — plan + usage are handled by PlanContext
        const [specs, failures] = await Promise.all([
          api.listSpecRequests().catch(() => [] as any[]),
          api.listFailureAnalyses().catch(() => [] as any[]),
        ]);

        if (cancelled) return;

        const specItems: import('@/lib/types').HistoryItem[] = specs.map((s: any) => {
          const substrateA = s.substrate_a ?? s.substrateA;
          const substrateB = s.substrate_b ?? s.substrateB;
          const recommended = s.recommended_spec ?? s.recommendedSpec;
          const recommendedType = recommended?.material_type ?? recommended?.materialType;
          const recommendedTitle = recommended?.title;

          return {
            id: s.id,
            type: 'spec' as const,
            substrates: substrateA && substrateB ? `${substrateA} → ${substrateB}` : '—',
            status: s.status,
            date: s.created_at ?? s.createdAt ?? '',
            title: recommendedType ?? recommendedTitle ?? (s.material_category ?? s.materialCategory ?? 'Spec'),
            confidenceScore: s.confidence_score ?? s.confidenceScore,
          };
        });

        const failureItems: import('@/lib/types').HistoryItem[] = failures.map((f: any) => {
          const substrateA = f.substrate_a ?? f.substrateA;
          const substrateB = f.substrate_b ?? f.substrateB;
          const substrates = substrateA && substrateB ? `${substrateA} → ${substrateB}` : '—';
          const failureMode = f.failure_mode ?? f.failureMode;
          const materialSub = f.material_subcategory ?? f.materialSubcategory;

          return {
            id: f.id,
            type: 'failure' as const,
            substrates,
            status: f.status,
            date: f.created_at ?? f.createdAt ?? '',
            title: failureMode ?? materialSub ?? (f.material_category ?? f.materialCategory ?? 'Failure analysis'),
            confidenceScore: f.confidence_score ?? f.confidenceScore,
          };
        });

        const merged = [...specItems, ...failureItems].sort((a, b) => {
          const at = a.date ? new Date(a.date).getTime() : 0;
          const bt = b.date ? new Date(b.date).getTime() : 0;
          return bt - at;
        });

        const recent = merged.slice(0, 5);
        setRecentAnalyses(recent);

        // Cache recentAnalyses for instant hydration on next visit
        // (plan + usage are cached separately by PlanContext)
        try {
          localStorage.setItem('gravix_dashboard_cache', JSON.stringify({
            recentAnalyses: recent,
            cachedAt: Date.now(),
          }));
        } catch { /* quota exceeded, ignore */ }
      } catch {
        // Individual calls already handle their own errors
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
      {/* Checkout banners */}
      {checkoutBanner === 'success' && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <p className="text-sm text-white">
              🎉 Welcome to Pro! Your subscription is active.
            </p>
          </div>
          <button onClick={dismissBanner} className="text-[#94A3B8] hover:text-white ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {checkoutBanner === 'cancel' && (
        <div
          className="bg-[#1F2937]/50 border border-[#374151] rounded-lg p-4 mb-6 flex items-center justify-between cursor-pointer"
          onClick={dismissBanner}
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
            <p className="text-sm text-[#94A3B8]">
              Checkout cancelled. You can upgrade anytime from{' '}
              <Link href="/settings" className="text-accent-500 hover:underline">Settings</Link>.
            </p>
          </div>
          <X className="w-4 h-4 text-[#64748B]" />
        </div>
      )}

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
      <div className="grid md:grid-cols-3 gap-6 mb-10">
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
        <InvestigationsDashboardWidget />
      </div>

      {/* Component 6.4: Pending Feedback Banner */}
      <PendingFeedbackBanner />

      {/* Component 6.5 & 6.6: Investigations Summary + Pattern Alerts (plan-gated) */}
      {(profilePlan === 'quality' || profilePlan === 'enterprise' || profilePlan === 'admin') && (
        <div className={`grid gap-6 mb-10 ${(profilePlan === 'enterprise' || profilePlan === 'admin') ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          <InvestigationsSummaryCard />
          {(profilePlan === 'enterprise' || profilePlan === 'admin') && <PatternAlertsCard />}
        </div>
      )}

      {/* Component 6.3: Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
          <Link href="/history" className="text-sm text-accent-500 hover:underline">View All →</Link>
        </div>

        {loading && (
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-5 w-16 bg-[#1F2937] rounded" />
                  <div className="h-4 w-40 bg-[#1F2937] rounded flex-1" />
                  <div className="h-4 w-24 bg-[#1F2937] rounded hidden md:block" />
                  <div className="h-4 w-20 bg-[#1F2937] rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
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
                    className="relative border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937] transition-colors"
                  >
                    <td className="p-4">
                      {/* Stretched link covers the entire row for correct hover URL + accessibility */}
                      <Link
                        href={`/history/${a.type}/${a.id}`}
                        className="absolute inset-0 z-10"
                        aria-label={`View ${a.type === 'spec' ? 'spec' : 'failure analysis'}: ${a.substrates}`}
                      />
                      <span
                        className={`relative z-0 px-2 py-0.5 rounded text-xs font-medium ${
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
                    <td className="p-4 text-sm text-[#64748B]">{formatDate(a.date)}</td>
                  </tr>
                ))}

                {recentAnalyses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <p className="text-sm text-[#94A3B8] mb-1">No analyses yet</p>
                      <p className="text-xs text-[#64748B]">Run your first spec or failure analysis to see results here.</p>
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
