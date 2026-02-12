'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ToolLayoutProps {
  formPanel: ReactNode;
  resultsPanel: ReactNode;
  className?: string;
}

export function ToolLayout({ formPanel, resultsPanel, className }: ToolLayoutProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* Stats Bar (Component 2.1) */}
      <div className="h-8 bg-brand-800/50 flex items-center justify-center text-xs text-[#94A3B8] border-b border-[#1F2937]">
        <span className="font-mono">847</span>&nbsp;analyses completed&nbsp;
        <span className="text-[#374151] mx-2">•</span>&nbsp;
        <span className="font-mono">30+</span>&nbsp;substrates&nbsp;
        <span className="text-[#374151] mx-2">•</span>&nbsp;
        <span className="font-mono">73%</span>&nbsp;resolution rate
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
