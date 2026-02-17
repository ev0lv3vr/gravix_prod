'use client';

import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VisualAnalysisItem {
  imageUrl: string;
  failureMode: string;
  confidence: number;
  description: string;
}

export interface VisualAnalysisSectionProps {
  items: VisualAnalysisItem[];
  /** The failure mode selected by the user in the form */
  userSelectedMode?: string;
}

/**
 * Visual Analysis Results Section — renders only when photos were uploaded.
 * Shows thumbnails with AI-detected failure mode, confidence %, and description.
 * Displays a contradiction warning if visual analysis disagrees with user input.
 */
export function VisualAnalysisSection({ items, userSelectedMode }: VisualAnalysisSectionProps) {
  if (!items || items.length === 0) return null;

  // Check for contradictions between visual analysis and user-selected failure mode
  const primaryVisual = items[0];
  const hasContradiction =
    userSelectedMode &&
    primaryVisual.failureMode &&
    userSelectedMode.toLowerCase() !== primaryVisual.failureMode.toLowerCase() &&
    primaryVisual.confidence >= 0.7;

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-5">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-accent-500" />
        <h3 className="text-sm font-semibold text-white">📸 Visual Analysis</h3>
      </div>

      {/* Visual analysis items */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-lg border border-[#374151] overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={`Visual analysis ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] text-[#64748B]">Failure Mode:</span>
                <span className="text-base text-white font-medium">{item.failureMode}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] text-[#64748B]">Confidence:</span>
                <span
                  className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded',
                    item.confidence >= 0.8
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : item.confidence >= 0.6
                        ? 'bg-accent-500/10 text-accent-500'
                        : 'bg-amber-500/10 text-amber-400',
                  )}
                >
                  {Math.round(item.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contradiction warning */}
      {hasContradiction && (
        <div className="mt-4 bg-amber-500/10 border-l-[3px] border-l-amber-500 rounded-r-lg p-4">
          <p className="text-sm text-amber-400 font-medium mb-1">⚠️ Contradiction Detected</p>
          <p className="text-xs text-[#94A3B8]">
            You selected &ldquo;{userSelectedMode}&rdquo; but visual analysis indicates &ldquo;
            {primaryVisual.failureMode}&rdquo; failure mode. Analysis adjusted to reflect visual
            classification.
          </p>
        </div>
      )}
    </div>
  );
}
