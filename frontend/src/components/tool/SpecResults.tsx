'use client';

import { useEffect, useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SpecResultsProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: SpecResultData | null;
  onNewAnalysis?: () => void;
  isFree?: boolean;
}

interface SpecResultData {
  recommendedSpec: {
    materialType: string;
    chemistry: string;
    subcategory: string;
    rationale: string;
  };
  productCharacteristics: {
    viscosityRange?: string;
    color?: string;
    cureTime?: string;
    expectedStrength?: string;
    temperatureResistance?: string;
    flexibility?: string;
    gapFillCapability?: string;
  };
  applicationGuidance: {
    surfacePreparation: string[];
    applicationTips: string[];
    curingNotes: string[];
    commonMistakesToAvoid: string[];
  };
  warnings: string[];
  alternatives: Array<{
    materialType: string;
    chemistry: string;
    advantages: string[];
    disadvantages: string[];
    whenToUse: string;
  }>;
  confidenceScore: number;
}

export function SpecResults({ status, data, onNewAnalysis, isFree: _isFree = true, analysisId }: SpecResultsProps & { analysisId?: string }) {
  const [loadingPhase, setLoadingPhase] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [expandedAlts, setExpandedAlts] = useState<number[]>([]);

  useEffect(() => {
    if (status !== 'loading') { setLoadingPhase(1); setElapsedTime(0); return; }
    const t1 = setTimeout(() => setLoadingPhase(2), 2000);
    const t2 = setTimeout(() => setLoadingPhase(3), 5000);
    const iv = setInterval(() => setElapsedTime(t => t + 0.1), 100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); };
  }, [status]);

  /* ===== Component 2.4: Empty State ===== */
  if (status === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <FileText className="w-12 h-12 text-brand-600 mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-[#94A3B8] mb-2">
          Your specification will appear here
        </h2>
        <p className="text-sm text-[#64748B]">
          Fill out the form to generate a vendor-neutral material spec with application guidance.
        </p>
      </div>
    );
  }

  /* ===== Component 2.5: Loading State ===== */
  if (status === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md space-y-6">
          <LoadingStep active={loadingPhase >= 1} done={loadingPhase > 1} label="Analyzing substrate pair..." />
          <LoadingStep active={loadingPhase >= 2} done={loadingPhase > 2} label="Processing requirements..." />
          <LoadingStep active={loadingPhase >= 3} done={false} label="Generating specification..." />

          {/* Progress bar */}
          <div className="w-full h-1 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 transition-all duration-500"
              style={{ width: `${Math.min(loadingPhase * 33, 95)}%` }}
            />
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-[#64748B]">{elapsedTime.toFixed(1)}s</span>
          </div>
        </div>
      </div>
    );
  }

  /* ===== Error State ===== */
  if (status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Analysis Failed</h2>
        <p className="text-sm text-[#94A3B8] mb-6">Something went wrong. Please try again.</p>
        {onNewAnalysis && <Button onClick={onNewAnalysis} variant="outline">Try Again</Button>}
      </div>
    );
  }

  /* ===== Component 2.6: Completed State ===== */
  if (status === 'success' && data) {
    const pct = Math.round(data.confidenceScore * 100);
    return (
      <div className="space-y-6 pb-24">
        {/* 1. Summary header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{data.recommendedSpec.materialType}</h2>
            <p className="text-sm text-[#94A3B8] mt-1">{data.recommendedSpec.chemistry}</p>
          </div>
          <ConfidenceBadge score={pct} />
        </div>

        {/* 2. Key properties */}
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Key Properties</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.productCharacteristics).map(([key, value]) => {
              if (!value) return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
              return (
                <div key={key} className="py-2 border-b border-[#1F2937] last:border-0">
                  <div className="text-xs text-[#64748B]">{label}</div>
                  <div className="text-sm font-mono text-white">{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Rationale */}
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Rationale</h3>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{data.recommendedSpec.rationale}</p>
        </div>

        {/* 4. Surface prep guidance */}
        {data.applicationGuidance.surfacePreparation.length > 0 && (
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Surface Preparation</h3>
            <ol className="space-y-2">
              {data.applicationGuidance.surfacePreparation.map((step, i) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-accent-500 font-semibold">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 5. Application tips */}
        {data.applicationGuidance.applicationTips.length > 0 && (
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Application Tips</h3>
            <ol className="space-y-2">
              {data.applicationGuidance.applicationTips.map((tip, i) => (
                <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                  <span className="text-accent-500 font-semibold">{i + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 6. Warnings */}
        {data.warnings.length > 0 && (
          <div className="bg-warning/5 border-l-[3px] border-l-warning rounded-r-lg p-4">
            <h3 className="text-sm font-semibold text-warning mb-2">⚠ Warnings</h3>
            <ul className="space-y-1">
              {data.warnings.map((w, i) => (
                <li key={i} className="text-sm text-[#94A3B8]">• {w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 7. Alternatives (collapsible) */}
        {data.alternatives.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white mb-2">Alternatives</h3>
            {data.alternatives.map((alt, i) => (
              <div key={i} className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedAlts(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1F2937] transition-colors"
                >
                  <div>
                    <span className="text-sm font-semibold text-white">{alt.chemistry}</span>
                    <span className="text-xs text-[#64748B] ml-2">{alt.materialType}</span>
                  </div>
                  {expandedAlts.includes(i) ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                </button>
                {expandedAlts.includes(i) && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#1F2937]">
                    <div className="pt-3">
                      <h5 className="text-xs font-semibold text-success mb-1">Advantages</h5>
                      {alt.advantages.map((a, j) => (
                        <div key={j} className="text-xs text-[#94A3B8]">+ {a}</div>
                      ))}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-danger mb-1">Disadvantages</h5>
                      {alt.disadvantages.map((d, j) => (
                        <div key={j} className="text-xs text-[#94A3B8]">− {d}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 8. Action bar */}
        <div className="fixed bottom-0 left-0 right-0 md:left-[45%] bg-[#0A1628] border-t border-[#1F2937] p-4 z-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => {
                if (analysisId) window.open(api.getSpecPdfUrl(analysisId), '_blank');
              }}
            >Export PDF</Button>
            <Button variant="outline" className="flex-1 min-h-[44px]">Request Expert Review</Button>
            <Button variant="outline" className="flex-1 min-h-[44px]" asChild>
              <a href="/failure">Run Failure Analysis</a>
            </Button>
            {onNewAnalysis && (
              <Button onClick={onNewAnalysis} className="flex-1 min-h-[44px]">New Spec</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function LoadingStep({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-3 h-3 rounded-full',
        done ? 'bg-success' : active ? 'bg-accent-500 animate-pulse' : 'bg-[#374151]'
      )} />
      <span className={cn('text-sm', active ? 'text-white' : 'text-[#64748B]')}>{label}</span>
    </div>
  );
}

export type { SpecResultData };
