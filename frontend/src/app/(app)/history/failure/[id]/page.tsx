'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FeedbackPrompt } from '@/components/results/FeedbackPrompt';
import { cn } from '@/lib/utils';

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
  const contributingFactors = useMemo(() => {
    return (analysis?.contributing_factors ?? analysis?.contributingFactors ?? []) as string[];
  }, [analysis]);
  const preventionPlan = useMemo(() => {
    const plan = analysis?.prevention_plan ?? analysis?.preventionPlan;
    if (!plan) return [];
    if (typeof plan === 'string') return plan.split('\n').filter(Boolean);
    if (Array.isArray(plan)) return plan;
    return [];
  }, [analysis]);
  const similarCases = useMemo(() => {
    return (analysis?.similar_cases ?? analysis?.similarCases ?? []) as any[];
  }, [analysis]);
  const knowledgeEvidenceCount = analysis?.knowledge_evidence_count ?? analysis?.knowledgeEvidenceCount ?? undefined;

  // Split recommendations into immediate and long-term
  const immediateRecs = useMemo(() => {
    if (Array.isArray(recommendations)) {
      return recommendations.filter((r: any) => r.priority === 'immediate' || r.priority === 'short_term');
    }
    if (recommendations && typeof recommendations === 'object' && !Array.isArray(recommendations)) {
      return (recommendations as any).immediate || [];
    }
    return [];
  }, [recommendations]);

  const longTermRecs = useMemo(() => {
    if (Array.isArray(recommendations)) {
      return recommendations.filter((r: any) => r.priority === 'long_term');
    }
    if (recommendations && typeof recommendations === 'object' && !Array.isArray(recommendations)) {
      return (recommendations as any).longTerm || (recommendations as any).long_term || [];
    }
    return [];
  }, [recommendations]);

  // Any recommendations that don't have a priority category
  const uncategorizedRecs = useMemo(() => {
    if (Array.isArray(recommendations)) {
      return recommendations.filter(
        (r: any) => r.priority !== 'immediate' && r.priority !== 'short_term' && r.priority !== 'long_term'
      );
    }
    return [];
  }, [recommendations]);

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
          {/* Meta info card */}
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-[#64748B]">Status</div>
                <div className="text-sm text-white mt-1">{status ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B]">Confidence</div>
                <div className="text-sm text-white mt-1">
                  {typeof confidence === 'number' ? `${Math.round(confidence * 100)}%` : '—'}
                  {knowledgeEvidenceCount != null && knowledgeEvidenceCount > 0 && (
                    <span className="ml-2 text-xs text-accent-500">
                      Empirically Validated ({knowledgeEvidenceCount})
                    </span>
                  )}
                  {(knowledgeEvidenceCount == null || knowledgeEvidenceCount === 0) && typeof confidence === 'number' && (
                    <span className="ml-2 text-xs text-[#64748B]">AI Estimated</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#64748B]">Created</div>
                <div className="text-sm text-white mt-1">{formatDateTime(analysis?.created_at ?? analysis?.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Root Causes with rank badges */}
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Root Causes</h2>
            {rootCauses.length > 0 ? (
              <div className="space-y-3">
                {rootCauses.map((rc, idx) => (
                  <div key={idx} className="border border-[#1F2937] rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white',
                        idx === 0 ? 'bg-accent-500' : 'bg-[#374151]'
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{rc.cause ?? '—'}</span>
                          {typeof rc.confidence === 'number' && (
                            <span className={cn('text-xs font-mono px-2 py-0.5 rounded',
                              rc.confidence >= 0.8 ? 'bg-green-500/10 text-green-400' :
                              rc.confidence >= 0.6 ? 'bg-accent-500/10 text-accent-500' :
                              'bg-yellow-500/10 text-yellow-400'
                            )}>
                              {Math.round(rc.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        {rc.explanation && (
                          <p className="text-sm text-[#94A3B8] mt-1">{rc.explanation}</p>
                        )}
                        {Array.isArray(rc.evidence) && rc.evidence.length > 0 && (
                          <p className="text-xs text-[#64748B] mt-1 font-mono">
                            {rc.evidence.join('. ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#94A3B8]">No root causes available yet.</div>
            )}
          </div>

          {/* Contributing Factors */}
          {contributingFactors.length > 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Contributing Factors</h2>
              <ul className="space-y-2">
                {contributingFactors.map((f, i) => (
                  <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                    <span className="text-accent-500 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Immediate Recommendations (red left border) */}
          {immediateRecs.length > 0 && (
            <div className="border-l-[3px] border-l-red-500 bg-red-500/5 rounded-r-lg p-5">
              <h2 className="text-lg font-semibold text-red-400 mb-3">Immediate Actions</h2>
              <div className="space-y-3">
                {immediateRecs.map((rec: any, idx: number) => (
                  <div key={idx}>
                    <div className="text-sm text-white font-medium">{rec.title ?? 'Recommendation'}</div>
                    {rec.description && (
                      <div className="text-sm text-[#94A3B8] mt-1">{rec.description}</div>
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
            </div>
          )}

          {/* Long-term Recommendations (blue left border) */}
          {longTermRecs.length > 0 && (
            <div className="border-l-[3px] border-l-accent-500 bg-accent-500/5 rounded-r-lg p-5">
              <h2 className="text-lg font-semibold text-accent-500 mb-3">Long-Term Solutions</h2>
              <div className="space-y-3">
                {longTermRecs.map((rec: any, idx: number) => (
                  <div key={idx}>
                    <div className="text-sm text-white font-medium">{rec.title ?? 'Recommendation'}</div>
                    {rec.description && (
                      <div className="text-sm text-[#94A3B8] mt-1">{rec.description}</div>
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
            </div>
          )}

          {/* Uncategorized recommendations (fallback) */}
          {uncategorizedRecs.length > 0 && immediateRecs.length === 0 && longTermRecs.length === 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Recommendations</h2>
              <div className="space-y-3">
                {uncategorizedRecs.map((rec: any, idx: number) => (
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
            </div>
          )}

          {/* Prevention Plan (green left border) */}
          {preventionPlan.length > 0 && (
            <div className="border-l-[3px] border-l-green-500 bg-green-500/5 rounded-r-lg p-5">
              <h2 className="text-lg font-semibold text-green-400 mb-3">Prevention Plan</h2>
              <ul className="space-y-2">
                {preventionPlan.map((p: string, i: number) => (
                  <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Similar Cases */}
          {similarCases.length > 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Similar Cases</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {similarCases.map((c: any, i: number) => (
                  <Link
                    key={i}
                    href={c.slug ? `/cases/${c.slug}` : `/cases/${c.id}`}
                    className="block border border-[#1F2937] rounded-lg p-4 hover:border-accent-500/50 transition-colors"
                  >
                    <div className="text-sm font-medium text-accent-500">{c.title}</div>
                    {c.industry && (
                      <div className="text-xs text-[#64748B] mt-1">{c.industry}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Prompt */}
          <FeedbackPrompt analysisId={params.id} />
        </div>
      )}
    </div>
  );
}
