'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { FeedbackPrompt } from '../results/FeedbackPrompt';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FailureResultsProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: FailureResultData | null;
  analysisId?: string | null;
  errorMessage?: string | null;
  onNewAnalysis?: () => void;
  onRunSpecAnalysis?: () => void;
  isFree?: boolean;
}

interface SimilarCaseItem {
  id: string;
  title?: string;
  industry?: string;
  substrate_a?: string;
  substrate_b?: string;
  failure_mode?: string;
  root_cause_category?: string;
  confidence_score?: number;
  outcome?: string;
}

interface FailureResultData {
  diagnosis: {
    topRootCause: string;
    confidence: number;
    explanation: string;
  };
  rootCauses: Array<{
    rank: number;
    cause: string;
    category: string;
    confidence: number;
    explanation: string;
    mechanism: string;
    gravixData?: string;
  }>;
  contributingFactors: string[];
  immediateActions: string[];
  longTermSolutions: string[];
  preventionPlan: string[];
  similarCases?: SimilarCaseItem[];
  confidenceScore: number;
  knowledgeEvidenceCount?: number;
}

export function FailureResults({ status, data, analysisId, errorMessage, onNewAnalysis, onRunSpecAnalysis, isFree: _isFree = true }: FailureResultsProps) {
  const [loadingPhase, setLoadingPhase] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (status !== 'loading') { setLoadingPhase(1); setElapsedTime(0); return; }
    const t1 = setTimeout(() => setLoadingPhase(2), 2000);
    const t2 = setTimeout(() => setLoadingPhase(3), 5000);
    const iv = setInterval(() => setElapsedTime(t => t + 0.1), 100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); };
  }, [status]);

  /* Empty State */
  if (status === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <Search className="w-12 h-12 text-brand-600 mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-[#94A3B8] mb-2">Your analysis will appear here</h2>
        <p className="text-sm text-[#64748B]">Fill out the form to diagnose your adhesive failure with ranked root causes.</p>
      </div>
    );
  }

  /* Loading State */
  if (status === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md space-y-6">
          <LoadStep active={loadingPhase >= 1} done={loadingPhase > 1} label="Analyzing failure patterns..." />
          <LoadStep active={loadingPhase >= 2} done={loadingPhase > 2} label="Cross-referencing failure modes..." />
          <LoadStep active={loadingPhase >= 3} done={false} label="Generating recommendations..." />
          <div className="w-full h-1 bg-[#1F2937] rounded-full overflow-hidden">
            <div className="h-full bg-accent-500 transition-all duration-500" style={{ width: `${Math.min(loadingPhase * 33, 95)}%` }} />
          </div>
          <div className="text-right"><span className="text-xs font-mono text-[#64748B]">{elapsedTime.toFixed(1)}s</span></div>
        </div>
      </div>
    );
  }

  /* Error State */
  if (status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚠️</span>
              <h2 className="text-base font-semibold text-red-400">Analysis Failed</h2>
            </div>
            <p className="text-sm text-[#94A3B8]">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>
          </div>
          {onNewAnalysis && (
            <Button onClick={onNewAnalysis} variant="outline" className="w-full">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* Completed State (Component 3.2) */
  if (status === 'success' && data) {
    const pct = Math.round(data.confidenceScore * 100);
    return (
      <div className="space-y-6 pb-24">
        {/* 1. Diagnosis summary */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-[#64748B] mb-1">Primary root cause</div>
            <h2 className="text-2xl font-bold text-white">{data.diagnosis.topRootCause}</h2>
            <p className="text-sm text-[#94A3B8] mt-2">{data.diagnosis.explanation}</p>
          </div>
          <ConfidenceBadge score={pct} caseCount={data.knowledgeEvidenceCount} />
        </div>

        {/* 2. Root cause cards (ranked) */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Root Causes (Ranked)</h3>
          {data.rootCauses.map((rc) => (
            <div key={rc.rank} className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white',
                  rc.rank === 1 ? 'bg-accent-500' : 'bg-[#374151]'
                )}>{rc.rank}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{rc.cause}</span>
                    <span className={cn('text-xs font-mono px-2 py-0.5 rounded',
                      rc.confidence >= 0.8 ? 'bg-success/10 text-success' :
                      rc.confidence >= 0.6 ? 'bg-accent-500/10 text-accent-500' :
                      'bg-warning/10 text-warning'
                    )}>{Math.round(rc.confidence * 100)}%</span>
                  </div>
                  {rc.gravixData && (
                    <p className="text-xs text-accent-500 mb-1">Gravix Data: {rc.gravixData}</p>
                  )}
                  <p className="text-xs text-[#94A3B8] mb-1">{rc.explanation}</p>
                  <p className="text-xs text-[#64748B] font-mono">{rc.mechanism}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Contributing factors */}
        {data.contributingFactors.length > 0 && (
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Contributing Factors</h3>
            <ul className="space-y-1">
              {data.contributingFactors.map((f, i) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-accent-500">•</span>{f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Immediate actions (red border) */}
        {data.immediateActions.length > 0 && (
          <div className="border-l-[3px] border-l-danger bg-danger/5 rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-danger mb-3">Do This Now</h3>
            <ol className="space-y-2">
              {data.immediateActions.map((a, i) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-danger font-semibold">{i + 1}.</span>{a}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 5. Long-term solutions (blue border) */}
        {data.longTermSolutions.length > 0 && (
          <div className="border-l-[3px] border-l-accent-500 bg-accent-500/5 rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-accent-500 mb-3">Long-Term Fixes</h3>
            <ul className="space-y-2">
              {data.longTermSolutions.map((s, i) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-accent-500">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Prevention plan (green border) */}
        {data.preventionPlan.length > 0 && (
          <div className="border-l-[3px] border-l-success bg-success/5 rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-success mb-3">Prevention Plan</h3>
            <ul className="space-y-2">
              {data.preventionPlan.map((p, i) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-success">•</span>{p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 7. Similar cases (Sprint 6: enriched from knowledge engine) */}
        {data.similarCases && data.similarCases.length > 0 && (
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">
              Similar Cases
              <span className="text-xs text-[#64748B] ml-2 font-normal">from Gravix knowledge base</span>
            </h3>
            <div className="space-y-2">
              {data.similarCases.map((c, i) => {
                const displayTitle = c.title || [c.substrate_a, c.substrate_b].filter(Boolean).join(' → ') || 'Related Case';
                const displayMeta = c.industry || c.failure_mode || c.root_cause_category || '';
                const outcomeLabel = c.outcome === 'resolved' ? '✅ Resolved'
                  : c.outcome === 'partially_resolved' ? '🔶 Partial'
                  : c.outcome ? `📋 ${c.outcome}` : null;
                return (
                  <a key={i} href={`/history/failure/${c.id}`} className="block p-3 rounded-lg hover:bg-[#1F2937] transition-colors border border-transparent hover:border-[#374151]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-accent-500 font-medium">{displayTitle}</span>
                      {c.confidence_score != null && (
                        <span className="text-xs font-mono text-[#64748B]">{Math.round(c.confidence_score * 100)}%</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {displayMeta && <span className="text-xs text-[#64748B]">{displayMeta}</span>}
                      {outcomeLabel && <span className="text-xs text-[#94A3B8]">{outcomeLabel}</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. Feedback prompt */}
        {analysisId && <FeedbackPrompt analysisId={analysisId} />}

        {/* 9. Action bar */}
        <div className="fixed bottom-0 left-0 right-0 md:left-[45%] bg-[#0A1628] border-t border-[#1F2937] p-4 z-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 min-h-[44px]">Export PDF</Button>
            <Button variant="outline" className="flex-1 min-h-[44px]">Request Expert Review</Button>
            {onRunSpecAnalysis && (
              <Button onClick={onRunSpecAnalysis} variant="outline" className="flex-1 min-h-[44px]">Run Spec Analysis →</Button>
            )}
            {onNewAnalysis && (
              <Button onClick={onNewAnalysis} className="flex-1 min-h-[44px]">New Analysis</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function LoadStep({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-3 h-3 rounded-full', done ? 'bg-success' : active ? 'bg-accent-500 animate-pulse' : 'bg-[#374151]')} />
      <span className={cn('text-sm', active ? 'text-white' : 'text-[#64748B]')}>{label}</span>
    </div>
  );
}

export type { FailureResultData };
