'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

type FailureDetail = any;

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function FailureHistoryDetailPage({ params }: { params: { id: string } }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FailureDetail | null>(null);

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
        const data = await api.getFailureAnalysis(params.id);
        if (!cancelled) setAnalysis(data as any);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load analysis');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser, params.id]);

  const substrateA = analysis?.substrate_a ?? analysis?.substrateA;
  const substrateB = analysis?.substrate_b ?? analysis?.substrateB;
  const status = analysis?.status;
  const confidence = analysis?.confidence_score ?? analysis?.confidenceScore;
  const rootCauses = useMemo(() => {
    return (analysis?.root_causes ?? analysis?.rootCauses ?? []) as any[];
  }, [analysis]);
  const recommendations = useMemo(() => {
    return (analysis?.recommendations ?? []) as any[];
  }, [analysis]);

  const pdfUrl = api.getAnalysisPdfUrl(params.id);

  if (authLoading || !authUser) return null;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Failure Analysis</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {substrateA && substrateB ? `${substrateA} → ${substrateB}` : (analysis?.failure_mode ?? analysis?.failureMode ?? '—')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          >
            Download PDF
          </Button>
          <Link href="/history" className="text-sm text-accent-500 hover:underline">
            Back to history
          </Link>
        </div>
      </div>

      {loading && <div className="text-sm text-[#94A3B8]">Loading…</div>}
      {error && <div className="text-sm text-warning">{error}</div>}

      {!loading && !error && analysis && (
        <div className="space-y-6">
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-[#64748B]">Status</div>
                <div className="text-sm text-white mt-1">{status ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B]">Confidence</div>
                <div className="text-sm text-white mt-1">{typeof confidence === 'number' ? `${Math.round(confidence * 100)}%` : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B]">Created</div>
                <div className="text-sm text-white mt-1">{formatDateTime(analysis?.created_at ?? analysis?.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Root Causes</h2>
            {rootCauses.length > 0 ? (
              <div className="space-y-3">
                {rootCauses.map((rc, idx) => (
                  <div key={idx} className="border border-[#1F2937] rounded-md p-4">
                    <div className="text-sm text-white font-medium">{rc.cause ?? '—'}</div>
                    <div className="text-xs text-[#94A3B8] mt-1">
                      Confidence: {typeof rc.confidence === 'number' ? `${Math.round(rc.confidence * 100)}%` : '—'}
                    </div>
                    {rc.explanation && (
                      <div className="text-sm text-[#94A3B8] mt-2">{rc.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#94A3B8]">No root causes available yet.</div>
            )}
          </div>

          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Recommendations</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="border border-[#1F2937] rounded-md p-4">
                    <div className="text-sm text-white font-medium">{rec.title ?? 'Recommendation'}</div>
                    {rec.priority && (
                      <div className="text-xs text-[#94A3B8] mt-1">Priority: {rec.priority}</div>
                    )}
                    {rec.description && (
                      <div className="text-sm text-[#94A3B8] mt-2">{rec.description}</div>
                    )}
                    {Array.isArray(rec.implementation_steps) && rec.implementation_steps.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-[#94A3B8] mt-2">
                        {rec.implementation_steps.map((s: string, sIdx: number) => (
                          <li key={sIdx}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#94A3B8]">No recommendations available yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
