'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  label: string;
  persistKey: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function ExpandableSection({
  label,
  persistKey,
  defaultExpanded = false,
  children,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [hasHydrated, setHasHydrated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Load persisted state from localStorage (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(persistKey);
      if (stored !== null) {
        setExpanded(stored === 'true');
      }
    } catch { /* noop */ }
    setHasHydrated(true);
  }, [persistKey]);

  // Save to localStorage when toggled
  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    try {
      localStorage.setItem(persistKey, String(next));
    } catch { /* noop */ }

    // Auto-scroll on expand
    if (next) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  return (
    <div>
      {/* Expand/collapse trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors py-2 w-full text-left"
      >
        <ChevronRight
          className={cn(
            'w-4 h-4 transition-transform duration-300 ease-out',
            expanded && 'rotate-90'
          )}
        />
        <span>{label}</span>
      </button>

      {/* Animated content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div ref={contentRef} className={cn('pt-4 space-y-5', !hasHydrated && 'invisible')}>
          {children}
        </div>
      </div>
    </div>
  );
}
