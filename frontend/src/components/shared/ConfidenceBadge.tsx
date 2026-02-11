'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ConfidenceBadgeProps {
  score: number; // 0-100
  caseCount?: number;
  className?: string;
}

export function ConfidenceBadge({ score, caseCount, className }: ConfidenceBadgeProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (v: number) => {
    if (v >= 90) return '#10B981'; // green
    if (v >= 70) return '#3B82F6'; // blue
    if (v >= 50) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const color = getColor(score);
  const diameter = 48;
  const strokeWidth = 4;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  const hasKnowledge = caseCount !== undefined && caseCount > 0;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg width={diameter} height={diameter} className="transform -rotate-90">
          <circle cx={diameter / 2} cy={diameter / 2} r={radius} fill="none" stroke="#374151" strokeWidth={strokeWidth} />
          <circle
            cx={diameter / 2} cy={diameter / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-[600ms] ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-sm" style={{ color }}>{Math.round(score)}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-center" style={{ color }}>
        {hasKnowledge ? `Empirically Validated (${caseCount})` : 'AI Estimated'}
      </span>
    </div>
  );
}
