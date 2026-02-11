'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FailureModeCardsProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const FAILURE_MODES = [
  {
    value: 'adhesive',
    label: 'Adhesive Failure',
    description: 'Clean separation from surface',
    diagram: AdhesiveFailureSVG,
  },
  {
    value: 'cohesive',
    label: 'Cohesive Failure',
    description: 'Failure within adhesive itself',
    diagram: CohesiveFailureSVG,
  },
  {
    value: 'mixed',
    label: 'Mixed Mode',
    description: 'Both adhesive and cohesive',
    diagram: MixedFailureSVG,
  },
  {
    value: 'substrate',
    label: 'Substrate Failure',
    description: 'Substrate tears before bond',
    diagram: SubstrateFailureSVG,
  },
];

export function FailureModeCards({ value, onChange, error }: FailureModeCardsProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {FAILURE_MODES.map((mode) => {
          const isSelected = value === mode.value;
          const Diagram = mode.diagram;
          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onChange(mode.value)}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all text-left flex flex-col',
                isSelected
                  ? 'bg-[#0F1D32] border-accent-500'
                  : 'bg-brand-800 border-[#374151] hover:border-accent-500/50',
                error && !value && 'border-danger'
              )}
            >
              {/* SVG Diagram */}
              <div className="mb-3 flex items-center justify-center h-12">
                <Diagram selected={isSelected} />
              </div>

              {/* Label */}
              <h3 className={cn('text-sm font-semibold mb-1', isSelected ? 'text-accent-500' : 'text-white')}>
                {mode.label}
              </h3>
              <p className="text-xs text-[#64748B] leading-tight">{mode.description}</p>

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

/* SVG cross-section diagrams showing each failure pattern */

function AdhesiveFailureSVG({ selected }: { selected: boolean }) {
  const accent = selected ? '#3B82F6' : '#64748B';
  return (
    <svg viewBox="0 0 80 48" className="w-20 h-12">
      {/* Top substrate */}
      <rect x="5" y="2" width="70" height="12" rx="1" fill="#374151" />
      {/* Adhesive layer (separated from top) */}
      <rect x="5" y="20" width="70" height="6" rx="1" fill={accent} opacity="0.6" />
      {/* Bottom substrate */}
      <rect x="5" y="26" width="70" height="12" rx="1" fill="#374151" />
      {/* Gap arrow */}
      <line x1="40" y1="14" x2="40" y2="20" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" />
      <text x="52" y="18" fill="#EF4444" fontSize="6" fontFamily="monospace">gap</text>
    </svg>
  );
}

function CohesiveFailureSVG({ selected }: { selected: boolean }) {
  const accent = selected ? '#3B82F6' : '#64748B';
  return (
    <svg viewBox="0 0 80 48" className="w-20 h-12">
      {/* Top substrate */}
      <rect x="5" y="2" width="70" height="12" rx="1" fill="#374151" />
      {/* Adhesive top half (on top substrate) */}
      <rect x="5" y="14" width="70" height="3" rx="0" fill={accent} opacity="0.6" />
      {/* Crack line */}
      <path d="M 5 19 L 20 18 L 35 20 L 50 18 L 65 20 L 75 19" stroke="#EF4444" strokeWidth="1.5" fill="none" />
      {/* Adhesive bottom half (on bottom substrate) */}
      <rect x="5" y="21" width="70" height="3" rx="0" fill={accent} opacity="0.6" />
      {/* Bottom substrate */}
      <rect x="5" y="24" width="70" height="12" rx="1" fill="#374151" />
      <text x="52" y="44" fill="#EF4444" fontSize="6" fontFamily="monospace">split</text>
    </svg>
  );
}

function MixedFailureSVG({ selected }: { selected: boolean }) {
  const accent = selected ? '#3B82F6' : '#64748B';
  return (
    <svg viewBox="0 0 80 48" className="w-20 h-12">
      {/* Top substrate */}
      <rect x="5" y="2" width="70" height="12" rx="1" fill="#374151" />
      {/* Left portion: adhesive failure (gap from surface) */}
      <rect x="5" y="20" width="35" height="6" rx="0" fill={accent} opacity="0.4" />
      {/* Right portion: cohesive failure (adhesive on both) */}
      <rect x="40" y="14" width="35" height="3" rx="0" fill={accent} opacity="0.6" />
      <rect x="40" y="21" width="35" height="3" rx="0" fill={accent} opacity="0.6" />
      {/* Crack */}
      <path d="M 40 18 L 55 17 L 75 19" stroke="#EF4444" strokeWidth="1" fill="none" />
      {/* Separation line left */}
      <line x1="20" y1="14" x2="20" y2="20" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" />
      {/* Bottom substrate */}
      <rect x="5" y="26" width="70" height="12" rx="1" fill="#374151" />
      <text x="52" y="44" fill="#EF4444" fontSize="6" fontFamily="monospace">both</text>
    </svg>
  );
}

function SubstrateFailureSVG({ selected }: { selected: boolean }) {
  const accent = selected ? '#3B82F6' : '#64748B';
  return (
    <svg viewBox="0 0 80 48" className="w-20 h-12">
      {/* Top substrate (cracked) */}
      <rect x="5" y="2" width="30" height="12" rx="1" fill="#374151" />
      <rect x="42" y="2" width="33" height="12" rx="1" fill="#374151" />
      {/* Crack in substrate */}
      <path d="M 35 2 L 38 7 L 34 10 L 42 14" stroke="#EF4444" strokeWidth="1.5" fill="none" />
      {/* Adhesive layer (intact) */}
      <rect x="5" y="14" width="70" height="6" rx="0" fill={accent} opacity="0.6" />
      {/* Bottom substrate (intact) */}
      <rect x="5" y="20" width="70" height="12" rx="1" fill="#374151" />
      <text x="50" y="40" fill="#EF4444" fontSize="6" fontFamily="monospace">tear</text>
    </svg>
  );
}
