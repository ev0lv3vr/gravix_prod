'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FeedbackPrompt } from '@/components/results/FeedbackPrompt';
import { usePlanGate } from '@/hooks/usePlanGate';

type SpecDetail = any;

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function SpecHistoryDetailPage({ params }: { params: { id: string } }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const { allowed: canExportPdf } = usePlanGate('history.export_pdf');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<SpecDetail | null>(null);
  const [expandedAlts, setExpandedAlts] = useState<number[]>([]);

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
        const data = await api.getSpecRequest(params.id);
        if (!cancelled) setSpec(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load spec');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser, params.id]);

  const substrateA = spec?.substrate_a ?? spec?.substrateA;
  const substrateB = spec?.substrate_b ?? spec?.substrateB;
  const status = spec?.status;
  const confidence = spec?.confidence_score ?? spec?.confidenceScore;
  const recommended = spec?.recommended_spec ?? spec?.recommendedSpec;

  // Application guidance
  const guidance = useMemo(() => {
    return spec?.application_guidance ?? spec?.applicationGuidance ?? null;
  }, [spec]);

  const surfacePrep = useMemo(() => {
    if (!guidance) return [];
    return guidance.surface_prep ?? guidance.surfacePrep ?? guidance.surfacePreparation ?? guidance.surface_preparation ?? [];
  }, [guidance]);

  const applicationTips = useMemo(() => {
    if (!guidance) return [];
    return guidance.application_tips ?? guidance.applicationTips ?? [];
  }, [guidance]);

  const curingNotes = useMemo(() => {
    if (!guidance) return [];
    return guidance.curing_notes ?? guidance.curingNotes ?? [];
  }, [guidance]);

  const mistakesToAvoid = useMemo(() => {
    if (!guidance) return [];
    return guidance.mistakes_to_avoid ?? guidance.mistakesToAvoid ?? guidance.commonMistakesToAvoid ?? [];
  }, [guidance]);

  // Product characteristics
  const prodChars = useMemo(() => {
    return spec?.product_characteristics ?? spec?.productCharacteristics ?? null;
  }, [spec]);

  const charEntries = useMemo(() => {
    if (!prodChars || typeof prodChars !== 'object') return [];
    return Object.entries(prodChars).filter(([, value]) => value != null && value !== '');
  }, [prodChars]);

  // Alternatives
  const alternatives = useMemo(() => {
    return spec?.alternatives ?? [];
  }, [spec]);

  if (authLoading || !authUser) return null;

  const formatLabel = (key: string) =>
    key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Spec Request</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{substrateA && substrateB ? `${substrateA} → ${substrateB}` : '—'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={!canExportPdf}
            onClick={() => canExportPdf && api.downloadSpecPdf(params.id)}
          >
            {canExportPdf ? 'Download PDF' : 'PDF (Pro)'}
          </Button>
          <Link href="/history" className="text-sm text-accent-500 hover:underline">
            Back to history
          </Link>
        </div>
      </div>

      {loading && <div className="text-sm text-[#94A3B8]">Loading…</div>}
      {error && <div className="text-sm text-warning">{error}</div>}

      {!loading && !error && spec && (
        <div className="space-y-6">
          {/* Meta info */}
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
                <div className="text-sm text-white mt-1">{formatDateTime(spec?.created_at ?? spec?.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Recommended Spec */}
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Recommended Spec</h2>
            {recommended ? (
              <div className="space-y-2">
                {recommended.title && <div className="text-sm text-white font-medium">{recommended.title}</div>}
                {recommended.chemistry && <div className="text-sm text-[#94A3B8]">Chemistry: {recommended.chemistry}</div>}
                {recommended.rationale && <div className="text-sm text-[#94A3B8] mt-2">{recommended.rationale}</div>}
              </div>
            ) : (
              <div className="text-sm text-[#94A3B8]">No recommendation available yet.</div>
            )}
          </div>

          {/* Product Characteristics — 2-column grid */}
          {charEntries.length > 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Characteristics</h2>
              <div className="grid grid-cols-2 gap-3">
                {charEntries.map(([key, value]) => (
                  <div key={key} className="py-2 border-b border-[#1F2937] last:border-0">
                    <div className="text-xs text-[#64748B]">{formatLabel(key)}</div>
                    <div className="text-sm font-mono text-white mt-0.5">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surface Preparation — cards per substrate */}
          {surfacePrep.length > 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Surface Preparation</h2>
              {typeof surfacePrep[0] === 'object' && surfacePrep[0] !== null ? (
                // Object format: [{substrate: string, steps: string[]}]
                <div className="grid sm:grid-cols-2 gap-4">
                  {surfacePrep.map((item: any, i: number) => (
                    <div key={i} className="border border-[#1F2937] rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-accent-500 mb-2">
                        {item.substrate || item.material || `Substrate ${i + 1}`}
                      </h4>
                      <ol className="space-y-1">
                        {(item.steps || item.instructions || [item.description]).filter(Boolean).map((step: string, j: number) => (
                          <li key={j} className="text-sm text-[#94A3B8] flex items-start gap-2">
                            <span className="text-accent-500 font-semibold">{j + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              ) : (
                // String array format
                <div className="grid sm:grid-cols-2 gap-4">
                  {substrateA && substrateB ? (
                    <>
                      <div className="border border-[#1F2937] rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-accent-500 mb-2">{substrateA}</h4>
                        <ol className="space-y-1">
                          {surfacePrep.map((step: string, i: number) => (
                            <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                              <span className="text-accent-500 font-semibold">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="border border-[#1F2937] rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-accent-500 mb-2">{substrateB}</h4>
                        <p className="text-sm text-[#94A3B8]">Same preparation steps as {substrateA} unless substrates differ significantly.</p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <ol className="space-y-2">
                        {surfacePrep.map((step: string, i: number) => (
                          <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                            <span className="text-accent-500 font-semibold">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Application Tips — numbered list */}
          {applicationTips.length > 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Application Tips</h2>
              <ol className="space-y-2">
                {applicationTips.map((tip: string, i: number) => (
                  <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                    <span className="text-accent-500 font-semibold">{i + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Curing Notes */}
          {curingNotes.length > 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Curing Notes</h2>
              <ul className="space-y-2">
                {curingNotes.map((note: string, i: number) => (
                  <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                    <span className="text-accent-500 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes to Avoid */}
          {mistakesToAvoid.length > 0 && (
            <div className="bg-yellow-500/5 border-l-[3px] border-l-yellow-500 rounded-r-lg p-5">
              <h2 className="text-lg font-semibold text-yellow-400 mb-3">⚠ Common Mistakes to Avoid</h2>
              <ul className="space-y-2">
                {mistakesToAvoid.map((m: string, i: number) => (
                  <li key={i} className="text-sm text-[#94A3B8] flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {(spec?.warnings?.length ?? 0) > 0 && (
            <div className="bg-red-500/5 border-l-[3px] border-l-red-500 rounded-r-lg p-5">
              <h2 className="text-lg font-semibold text-red-400 mb-3">⚠ Warnings</h2>
              <ul className="space-y-1">
                {spec.warnings.map((w: string, idx: number) => (
                  <li key={idx} className="text-sm text-[#94A3B8] flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternatives — collapsible cards (default collapsed) */}
          {alternatives.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white mb-2">Alternatives</h2>
              {alternatives.map((alt: any, i: number) => {
                const isExpanded = expandedAlts.includes(i);
                const altName = alt.name || alt.chemistry || alt.materialType || `Alternative ${i + 1}`;
                return (
                  <div key={i} className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedAlts(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1F2937] transition-colors"
                    >
                      <span className="text-sm font-semibold text-white">{altName}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#64748B]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#64748B]" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-[#1F2937]">
                        {(alt.pros || alt.advantages) && (alt.pros || alt.advantages).length > 0 && (
                          <div className="pt-3">
                            <h5 className="text-xs font-semibold text-green-400 mb-1">Advantages</h5>
                            {(alt.pros || alt.advantages).map((a: string, j: number) => (
                              <div key={j} className="text-xs text-[#94A3B8]">+ {a}</div>
                            ))}
                          </div>
                        )}
                        {(alt.cons || alt.disadvantages) && (alt.cons || alt.disadvantages).length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-red-400 mb-1">Disadvantages</h5>
                            {(alt.cons || alt.disadvantages).map((d: string, j: number) => (
                              <div key={j} className="text-xs text-[#94A3B8]">− {d}</div>
                            ))}
                          </div>
                        )}
                        {alt.whenToUse && (
                          <div>
                            <h5 className="text-xs font-semibold text-[#94A3B8] mb-1">When to Use</h5>
                            <div className="text-xs text-[#94A3B8]">{alt.whenToUse}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback Prompt */}
          <FeedbackPrompt specId={params.id} />
        </div>
      )}
    </div>
  );
}
