'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { displayId } from '@/lib/display-id';
import { FeedbackPrompt } from '@/components/results/FeedbackPrompt';
import type { FailureAnalysis } from '@/lib/types';

export default function FeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const analysisId = params.id as string;
  const defaultOutcome = searchParams.get('outcome') ?? undefined;

  const [analysis, setAnalysis] = useState<FailureAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.getFailureAnalysis(analysisId);
        if (!cancelled) setAnalysis(data);
      } catch {
        if (!cancelled) setError('Could not load analysis');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-[560px] text-center">
          <h1 className="text-xl font-bold text-white mb-3">
            {error ?? 'Analysis not found'}
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-accent-500 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Build substrate display
  const substrates =
    analysis.substrateA && analysis.substrateB
      ? `${analysis.substrateA} → ${analysis.substrateB}`
      : null;

  // Primary cause (first root cause if available)
  const primaryCause =
    analysis.rootCauses?.[0]?.cause ?? analysis.failureMode ?? 'Analysis';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-10">
      <div className="max-w-[560px] w-full">
        {/* Analysis Summary — links to full analysis detail */}
        <Link
          href={`/history/failure/${analysisId}`}
          className="block bg-brand-800 border border-[#1F2937] rounded-lg p-6 mb-8 hover:border-accent-500/40 transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#64748B]">
              {displayId('failure', analysisId, analysis.createdAt)}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            {primaryCause}
          </h2>
          <div className="flex items-center gap-3 text-sm text-[#94A3B8] flex-wrap">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">
              Failure Analysis
            </span>
            {substrates && <span>{substrates}</span>}
            {analysis.createdAt && (
              <span className="text-[#64748B]">
                {new Date(analysis.createdAt).toISOString().slice(0, 10)}
              </span>
            )}
          </div>
        </Link>

        {/* Feedback Prompt */}
        <h1 className="text-xl font-bold text-white mb-6">
          How did it go?
        </h1>

        <FeedbackPrompt
          analysisId={analysisId}
          defaultOutcome={defaultOutcome}
          feedbackSource={defaultOutcome ? 'email' : 'in_app'}
        />

        <p className="text-xs text-[#64748B] text-center mt-4">
          Your feedback is anonymized and helps improve analysis accuracy for
          everyone.
        </p>
      </div>
    </div>
  );
}
