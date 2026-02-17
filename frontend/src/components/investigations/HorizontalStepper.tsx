'use client';

import { DISCIPLINES } from './InvestigationHelpers';
import type { InvestigationSignature } from '@/lib/investigations';
import { CheckCircle } from 'lucide-react';

interface HorizontalStepperProps {
  activeDiscipline: string;
  onSelect: (discipline: string) => void;
  signatures: InvestigationSignature[];
}

export function HorizontalStepper({
  activeDiscipline,
  onSelect,
  signatures,
}: HorizontalStepperProps) {
  const isSigned = (key: string) => signatures.some((s) => s.discipline === key);

  return (
    <div className="border-b border-[#1F2937] bg-brand-800 rounded-t-lg">
      {/* Desktop: horizontal tabs */}
      <div className="hidden md:flex items-center overflow-x-auto">
        {DISCIPLINES.map(({ key }) => {
          const signed = isSigned(key);
          const isActive = activeDiscipline === key;

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? 'border-accent-500 text-white'
                  : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {signed ? (
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              ) : (
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    isActive ? 'border-accent-500' : 'border-[#374151]'
                  }`}
                />
              )}
              <span>{key}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: select dropdown */}
      <div className="md:hidden px-4 py-3">
        <select
          value={activeDiscipline}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full bg-[#0F1A2E] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white"
        >
          {DISCIPLINES.map(({ key, title }) => {
            const signed = isSigned(key);
            return (
              <option key={key} value={key}>
                {signed ? '✓' : '○'} {title}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
