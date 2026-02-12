'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type HistoryType = 'spec' | 'failure';

type HistoryItem = {
  id: string;
  type: HistoryType;
  substrates: string;
  result: string;
  outcome: 'confirmed' | 'pending' | null;
  status?: string;
  confidenceScore?: number | null;
  createdAt: string | null;
  pdfAvailable: boolean;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

function safeLower(s: string | null | undefined) {
  return (s ?? '').toLowerCase();
}

export default function HistoryPage() {
  const { user: authUser, loading: authLoading } = useAuth();

  const [typeFilter, setTypeFilter] = useState('all');
  const [substrateFilter, setSubstrateFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [analyses, setAnalyses] = useState<HistoryItem[]>([]);

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
        const [profile, specs, failures] = await Promise.all([
          api.getCurrentUser(),
          api.listSpecRequests(),
          api.listFailureAnalyses(),
        ]);

        if (cancelled) return;

        setPlan(profile?.plan ?? 'free');

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
            outcome: null,
            status: s.status,
            confidenceScore: s.confidence_score ?? s.confidenceScore ?? null,
            createdAt: s.created_at ?? s.createdAt ?? null,
            pdfAvailable: true,
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
            outcome: null,
            status: f.status,
            confidenceScore: f.confidence_score ?? f.confidenceScore ?? null,
            createdAt: f.created_at ?? f.createdAt ?? null,
            pdfAvailable: true,
          };
        });

        const merged = [...specItems, ...failureItems].sort((a, b) => {
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bt - at;
        });

        setAnalyses(merged);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load history');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser]);

  const isFreeUser = plan === 'free';
  const visibleLimit = isFreeUser ? 5 : analyses.length;

  const filtered = useMemo(() => {
    return analyses.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (outcomeFilter !== 'all' && (a.outcome || 'none') !== outcomeFilter) return false;

      if (substrateFilter !== 'all') {
        // Currently no substrate facet list from API; keep for future.
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay = `${safeLower(a.substrates)} ${safeLower(a.result)}`;
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [analyses, outcomeFilter, searchQuery, substrateFilter, typeFilter]);

  if (authLoading || !authUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Analysis History</h1>

      {/* Component 7.1: Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'spec', label: 'Spec' },
            { value: 'failure', label: 'Failure' },
          ]}
        />
        <FilterSelect
          value={substrateFilter}
          onChange={setSubstrateFilter}
          options={[{ value: 'all', label: 'All Substrates' }]}
        />
        <FilterSelect
          value={outcomeFilter}
          onChange={setOutcomeFilter}
          options={[
            { value: 'all', label: 'All Outcomes' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'pending', label: 'Pending' },
            { value: 'none', label: 'No Feedback' },
          ]}
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#111827] border border-[#374151] rounded text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-accent-500"
          />
        </div>
      </div>

      {/* Component 7.2: History List */}
      <div className="space-y-3">
        {loading && (
          <div className="text-sm text-[#94A3B8] py-6">Loading…</div>
        )}

        {error && (
          <div className="text-sm text-warning py-6">{error}</div>
        )}

        {!loading && !error && filtered.slice(0, visibleLimit).map((a) => {
          const href = `/history/${a.type}/${a.id}`;
          const pdfUrl = a.type === 'spec' ? api.getSpecPdfUrl(a.id) : api.getAnalysisPdfUrl(a.id);

          return (
            <Link
              key={a.id}
              href={href}
              className="bg-brand-800 border border-[#1F2937] rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 hover:border-accent-500/50 transition-colors"
            >
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium w-fit',
                  a.type === 'spec'
                    ? 'bg-accent-500/10 text-accent-500'
                    : 'bg-warning/10 text-warning'
                )}
              >
                {a.type === 'spec' ? 'Spec' : 'Failure'}
              </span>
              <span className="text-sm text-white flex-1">{a.substrates}</span>
              <span className="text-sm text-[#94A3B8] hidden md:block">{a.result}</span>
              <span
                className={cn(
                  'text-xs font-medium hidden md:block',
                  a.outcome === 'confirmed'
                    ? 'text-success'
                    : a.outcome === 'pending'
                      ? 'text-warning'
                      : 'text-[#64748B]'
                )}
              >
                {a.outcome || '—'}
              </span>
              <span className="text-xs text-[#64748B]">{formatDate(a.createdAt)}</span>
              {a.pdfAvailable && (
                <button
                  className="text-[#94A3B8] hover:text-white transition-colors"
                  title="Download PDF"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </Link>
          );
        })}

        {/* Free user: blur + upgrade for items beyond limit */}
        {isFreeUser && !loading && !error && filtered.length > visibleLimit && (
          <div className="relative">
            {/* Blurred cards */}
            <div className="filter blur-[6px] select-none pointer-events-none space-y-3">
              {filtered.slice(visibleLimit, visibleLimit + 2).map((a) => (
                <div key={a.id} className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">
                  <span className="text-sm text-white">{a.substrates}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#0A1628]/90 border border-accent-500/20 rounded-lg p-6 text-center max-w-sm">
                <Lock className="w-8 h-8 text-accent-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Upgrade to see full history</h3>
                <p className="text-sm text-[#94A3B8] mb-4">Free accounts can view the last 5 analyses.</p>
                <Link
                  href="/pricing"
                  className="inline-block bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Load more (for Pro users) */}
        {!isFreeUser && !loading && !error && filtered.length > 10 && (
          <div className="text-center pt-4">
            <Button variant="outline">Load more</Button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748B]">No analyses found matching your filters.</div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 bg-[#111827] border border-[#374151] rounded text-sm text-white focus:outline-none focus:border-accent-500 appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
