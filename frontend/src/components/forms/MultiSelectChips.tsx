'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ChipOption {
  label: string;
  value: string;
  tooltip?: string;
  /** If true, selecting this chip deselects all non-exclusive chips, and selecting any non-exclusive chip deselects this one. */
  exclusive?: boolean;
  /** Mutually exclusive pairs — selecting this chip deselects chips whose values are in this array, and vice versa. */
  excludes?: string[];
}

interface MultiSelectChipsProps {
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

function ChipWithTooltip({
  option,
  isSelected,
  disabled,
  onToggle,
}: {
  option: ChipOption;
  isSelected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout>>();
  const chipRef = useRef<HTMLButtonElement>(null);

  const clearTimer = useCallback(() => {
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleMouseEnter = () => {
    if (!option.tooltip) return;
    clearTimer();
    tooltipTimeout.current = setTimeout(() => setShowTooltip(true), 200);
  };

  const handleMouseLeave = () => {
    clearTimer();
    setShowTooltip(false);
  };

  return (
    <span className="relative inline-block">
      <button
        ref={chipRef}
        type="button"
        onClick={onToggle}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-testid={`chip-${option.value}`}
        data-value={option.value}
        className={cn(
          'px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border whitespace-nowrap',
          disabled && 'opacity-50 cursor-not-allowed',
          isSelected
            ? 'bg-accent-500/20 border-[#3B82F6] text-accent-500'
            : 'bg-brand-800 border-[#374151] text-[#94A3B8] hover:border-accent-500 hover:text-white'
        )}
      >
        {option.label}
      </button>
      {showTooltip && option.tooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-brand-700 text-text-primary text-xs rounded shadow-lg max-w-[240px] whitespace-normal pointer-events-none animate-fadeIn">
          {option.tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-brand-700" />
        </div>
      )}
    </span>
  );
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  disabled = false,
}: MultiSelectChipsProps) {
  const handleToggle = (option: ChipOption) => {
    if (disabled) return;

    const isCurrentlySelected = selected.includes(option.value);

    if (isCurrentlySelected) {
      // Deselect
      onChange(selected.filter((v) => v !== option.value));
      return;
    }

    // Selecting this chip
    let next = [...selected];

    if (option.exclusive) {
      // Exclusive chip: deselect everything else
      next = [option.value];
    } else {
      // Non-exclusive chip: remove any exclusive chips
      const exclusiveValues = options
        .filter((o) => o.exclusive)
        .map((o) => o.value);
      next = next.filter((v) => !exclusiveValues.includes(v));

      // Handle pairwise mutual exclusion (excludes array)
      if (option.excludes && option.excludes.length > 0) {
        next = next.filter((v) => !option.excludes!.includes(v));
      }

      // Also remove any chip that lists THIS option in its excludes
      const reverseExcludes = options
        .filter((o) => o.excludes?.includes(option.value))
        .map((o) => o.value);
      next = next.filter((v) => !reverseExcludes.includes(v));

      next.push(option.value);
    }

    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <ChipWithTooltip
          key={option.value}
          option={option}
          isSelected={selected.includes(option.value)}
          disabled={disabled}
          onToggle={() => handleToggle(option)}
        />
      ))}
    </div>
  );
}
