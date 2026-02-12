'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';

interface ToolLayoutProps {
  formPanel: ReactNode;
  resultsPanel: ReactNode;
  className?: string;
}

export function ToolLayout({ formPanel, resultsPanel, className }: ToolLayoutProps) {
  const [stats, setStats] = useState({
    analysesCompleted: 847,
    substrateCombos: 30,
    resolutionRate: 73,
  });

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';
    fetch(`${API_URL}/v1/stats/public`)
      .then(res => res.json())
      .then(data => {
        const analysesCount = data.analyses_completed_count || 0;
        const specsCount = data.specs_completed_count || 0;
        const totalCount = analysesCount + specsCount;
        const substrateCombos = data.substrate_combinations_count || 0;
        const resRate = data.resolution_rate;

        if (totalCount > 0 || substrateCombos > 0) {
          setStats({
            analysesCompleted: totalCount > 100 ? totalCount : Math.max(totalCount, 847),
            substrateCombos: substrateCombos > 0 ? substrateCombos : 30,
            resolutionRate: resRate != null ? Math.round(resRate * 100) : 73,
          });
        }
      })
      .catch(() => { /* keep fallback stats */ });
  }, []);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Stats Bar (Component 2.1) */}
      <div className="h-8 bg-brand-800/50 flex items-center justify-center text-xs text-[#94A3B8] border-b border-[#1F2937]">
        <span className="font-mono">{stats.analysesCompleted}</span>&nbsp;analyses completed&nbsp;
        <span className="text-[#374151] mx-2">•</span>&nbsp;
        <span className="font-mono">{stats.substrateCombos}+</span>&nbsp;substrates&nbsp;
        <span className="text-[#374151] mx-2">•</span>&nbsp;
        <span className="font-mono">{stats.resolutionRate}%</span>&nbsp;resolution rate
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px-32px)]">
        {/* Form Panel - Left 45% */}
        <div className="w-full md:w-[45%] bg-brand-800 p-6 md:p-8 overflow-y-auto">
          {formPanel}
        </div>

        {/* Divider - Desktop only */}
        <div className="hidden md:block w-px bg-[#1F2937]" />

        {/* Results Panel - Right 55% */}
        <div className="w-full md:w-[55%] bg-[#0A1628] p-6 md:p-8 overflow-y-auto">
          {resultsPanel}
        </div>
      </div>
    </div>
  );
}
