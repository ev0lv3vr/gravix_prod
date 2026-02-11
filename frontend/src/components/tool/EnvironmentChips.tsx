'use client';

import { cn } from '@/lib/utils';

interface EnvironmentChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const ENVIRONMENT_OPTIONS = [
  { value: 'high_humidity', label: 'High humidity' },
  { value: 'chemical', label: 'Chemical exposure' },
  { value: 'uv_outdoor', label: 'UV/outdoor' },
  { value: 'thermal_cycling', label: 'Thermal cycling' },
  { value: 'submersion', label: 'Submersion' },
  { value: 'vibration', label: 'Vibration' },
];

export function EnvironmentChips({ value, onChange, disabled = false }: EnvironmentChipsProps) {
  const handleToggle = (optionValue: string) => {
    if (disabled) return;
    
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ENVIRONMENT_OPTIONS.map((option) => {
        const isSelected = value.includes(option.value);
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'border',
              disabled && 'opacity-50 cursor-not-allowed',
              isSelected
                ? 'bg-accent-500/15 border-accent-500 text-accent-500'
                : 'bg-surface-2 border-brand-600 text-text-secondary hover:border-accent-500 hover:text-text-primary'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { ENVIRONMENT_OPTIONS };
