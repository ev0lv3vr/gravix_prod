'use client';

import { Layers, Split, GitMerge, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FailureModeCardsProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const FAILURE_MODES = [
  {
    value: 'adhesive',
    icon: Split,
    label: 'Adhesive Failure',
    description: 'Bond released at interface between adhesive and substrate',
  },
  {
    value: 'cohesive',
    icon: Layers,
    label: 'Cohesive Failure',
    description: 'Adhesive itself split apart while bonded to both surfaces',
  },
  {
    value: 'mixed',
    icon: GitMerge,
    label: 'Mixed Mode',
    description: 'Partial interface + partial bulk failure',
  },
  {
    value: 'substrate',
    icon: AlertTriangle,
    label: 'Substrate Failure',
    description: 'Substrate material failed before the adhesive bond',
  },
];

export function FailureModeCards({ value, onChange, error }: FailureModeCardsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FAILURE_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.value;

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onChange(mode.value)}
              className={cn(
                'relative h-[120px] p-4 rounded-md border-2 transition-all text-left',
                'flex flex-col items-start justify-between',
                isSelected
                  ? 'bg-[#0F1D32] border-accent-500'
                  : 'bg-brand-800 border-brand-600 hover:border-accent-500/50',
                error && !value && 'border-danger'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded-md flex items-center justify-center transition-colors',
                  isSelected ? 'bg-accent-500/20 text-accent-500' : 'bg-brand-700 text-text-tertiary'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Label and description */}
              <div className="flex-1 mt-2">
                <h3
                  className={cn(
                    'text-sm font-semibold mb-1 transition-colors',
                    isSelected ? 'text-accent-500' : 'text-text-primary'
                  )}
                >
                  {mode.label}
                </h3>
                <p className="text-xs text-text-tertiary leading-tight">{mode.description}</p>
              </div>

              {/* Checkmark overlay */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
