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
    <div className={cn('flex flex-col md:flex-row min-h-[calc(100vh-64px)]', className)}>
      {/* Form Panel - Left */}
      <div className="w-full md:w-[45%] bg-brand-800 p-6 md:p-8 overflow-y-auto">
        {formPanel}
      </div>

      {/* Divider - Desktop only */}
      <div className="hidden md:block w-px bg-brand-700" />

      {/* Results Panel - Right */}
      <div className="w-full md:w-[55%] bg-brand-900 p-6 md:p-8 overflow-y-auto">
        {resultsPanel}
      </div>
    </div>
  );
}
