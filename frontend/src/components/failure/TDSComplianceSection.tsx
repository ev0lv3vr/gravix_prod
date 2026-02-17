'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TDSComplianceItem {
  parameter: string;
  actual: string;
  spec: string;
  status: 'violation' | 'pass' | 'warning';
}

export interface TDSComplianceSectionProps {
  productName: string;
  items: TDSComplianceItem[];
}

const STATUS_CONFIG = {
  violation: { icon: '❌', color: 'text-red-400', label: 'violation' },
  pass: { icon: '✅', color: 'text-emerald-400', label: 'pass' },
  warning: { icon: '⚠️', color: 'text-amber-400', label: 'warning' },
} as const;

/**
 * TDS Compliance Results Section — renders only when product from TDS database selected.
 * Shows spec compliance items with violations (red), passes (green), warnings (amber).
 * Collapsible if >5 items.
 */
export function TDSComplianceSection({ productName, items }: TDSComplianceSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const violations = items.filter(i => i.status === 'violation').length;
  const warnings = items.filter(i => i.status === 'warning').length;
  const passes = items.filter(i => i.status === 'pass').length;

  const shouldCollapse = items.length > 5;
  const displayItems = shouldCollapse && !expanded ? items.slice(0, 5) : items;

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-5">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-accent-500" />
        <h3 className="text-sm font-semibold text-white">
          📋 Specification Compliance — {productName}
        </h3>
      </div>

      {/* Compliance items */}
      <div className="space-y-2">
        {displayItems.map((item, i) => {
          const config = STATUS_CONFIG[item.status];
          return (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2 text-sm',
                item.status === 'violation' && 'text-red-400',
                item.status === 'pass' && 'text-emerald-400',
                item.status === 'warning' && 'text-amber-400',
              )}
            >
              <span className="flex-shrink-0">{config.icon}</span>
              <span className={config.color}>
                {item.parameter}: {item.actual}
                {item.spec && (
                  <span className="text-[#94A3B8]"> (spec: {item.spec})</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Collapse toggle */}
      {shouldCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-accent-500 hover:text-accent-400 transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>{violations} violation{violations !== 1 ? 's' : ''}, {warnings} warning{warnings !== 1 ? 's' : ''}, {passes} pass{passes !== 1 ? 'es' : ''} <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-[#1F2937]">
        <p className="text-xs text-[#94A3B8]">
          {violations > 0 || warnings > 0 ? (
            <>
              <span className="font-medium text-white">
                {violations} specification violation{violations !== 1 ? 's' : ''} and {warnings} warning{warnings !== 1 ? 's' : ''} detected.
              </span>{' '}
              These deviations are factored into root cause ranking above.
            </>
          ) : (
            <span className="text-emerald-400">All parameters within specification. No deviations detected.</span>
          )}
        </p>
      </div>
    </div>
  );
}
