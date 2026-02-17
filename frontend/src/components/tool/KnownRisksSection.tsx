'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface KnownRiskData {
  productName: string;
  substratePair: string;
  totalFailures: number;
  failureRate: number;
  mostCommonCause: string;
  commonCausePercent: number;
  typicalTimeToFailure?: string;
  alternatives?: Array<{
    name: string;
    failureRate: number;
    caseCount: number;
  }>;
  linkedCases?: Array<{
    id: string;
    title: string;
    outcome?: string;
  }>;
}

/**
 * Known Risks Section — shown on spec engine results when recommended product
 * has documented failures in the database.
 */
export function KnownRisksSection({ data }: { data: KnownRiskData }) {
  const riskLevel =
    data.failureRate > 10 ? 'high' :
    data.failureRate > 2 ? 'moderate' :
    'low';

  const riskConfig = {
    high: { emoji: '🔴', label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    moderate: { emoji: '🟡', label: 'Moderate Risk', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    low: { emoji: '🟢', label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  }[riskLevel];

  return (
    <div className={cn('border rounded-lg p-5', riskConfig.bg, riskConfig.border)}>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className={cn('w-5 h-5', riskConfig.color)} />
        <h3 className="text-sm font-semibold text-white">
          ⚠️ Known Risks — {data.productName} on {data.substratePair}
        </h3>
      </div>

      {/* Risk summary */}
      <p className="text-sm text-[#94A3B8] mb-3">
        Our field data contains{' '}
        <span className="text-white font-medium">{data.totalFailures} documented failures</span>{' '}
        of {data.productName} on {data.substratePair} substrates.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-[#64748B] mb-1">Field failure rate</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-white">{data.failureRate}%</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', riskConfig.bg, riskConfig.color)}>
              {riskConfig.emoji} {riskConfig.label}
            </span>
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-[#64748B] mb-1">Most common root cause</div>
          <div className="text-sm text-white font-medium">
            {data.mostCommonCause} ({data.commonCausePercent}%)
          </div>
        </div>
        {data.typicalTimeToFailure && (
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-xs text-[#64748B] mb-1">Typical time to failure</div>
            <div className="text-sm text-white font-medium">{data.typicalTimeToFailure}</div>
          </div>
        )}
      </div>

      {/* Alternative products */}
      {data.alternatives && data.alternatives.length > 0 && (
        <div className="border-t border-[#1F2937] pt-3 mt-3">
          <p className="text-xs text-[#64748B] mb-2">Consider alternatives:</p>
          <div className="space-y-1">
            {data.alternatives.map((alt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-accent-500 font-medium">{alt.name}</span>
                <span className="text-[#64748B]">
                  ({alt.failureRate}% failure rate, {alt.caseCount} cases)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked failure cases */}
      {data.linkedCases && data.linkedCases.length > 0 && (
        <div className="border-t border-[#1F2937] pt-3 mt-3">
          <p className="text-xs text-[#64748B] mb-2">Related failure cases:</p>
          <div className="space-y-1">
            {data.linkedCases.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/history/failure/${c.id}`}
                className="flex items-center gap-2 text-sm text-accent-500 hover:text-accent-400 transition-colors"
              >
                <span>{c.title}</span>
                {c.outcome && (
                  <span className="text-xs text-[#64748B]">
                    {c.outcome === 'resolved' ? '✅' : c.outcome === 'partially_resolved' ? '🔶' : '📋'} {c.outcome}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
