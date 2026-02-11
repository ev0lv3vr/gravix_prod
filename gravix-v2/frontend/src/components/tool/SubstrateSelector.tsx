'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Substrate {
  name: string;
  category: string;
}

const SUBSTRATES: Substrate[] = [
  // Plastics
  { name: 'ABS', category: 'Plastics' },
  { name: 'Polycarbonate', category: 'Plastics' },
  { name: 'Nylon 6', category: 'Plastics' },
  { name: 'Nylon 6/6', category: 'Plastics' },
  { name: 'PBT', category: 'Plastics' },
  { name: 'PET', category: 'Plastics' },
  { name: 'PMMA', category: 'Plastics' },
  { name: 'PP', category: 'Plastics' },
  { name: 'HDPE', category: 'Plastics' },
  { name: 'LDPE', category: 'Plastics' },
  { name: 'PVC', category: 'Plastics' },
  { name: 'PTFE', category: 'Plastics' },
  // Metals
  { name: 'Steel (mild)', category: 'Metals' },
  { name: 'Steel (stainless 304)', category: 'Metals' },
  { name: 'Steel (stainless 316)', category: 'Metals' },
  { name: 'Aluminum 6061', category: 'Metals' },
  { name: 'Aluminum 7075', category: 'Metals' },
  { name: 'Brass', category: 'Metals' },
  { name: 'Copper', category: 'Metals' },
  { name: 'Titanium', category: 'Metals' },
  // Elastomers
  { name: 'Rubber (natural)', category: 'Elastomers' },
  { name: 'Rubber (silicone)', category: 'Elastomers' },
  { name: 'Rubber (EPDM)', category: 'Elastomers' },
  // Composites
  { name: 'Carbon fiber composite', category: 'Composites' },
  { name: 'Fiberglass', category: 'Composites' },
  // Natural
  { name: 'Glass', category: 'Natural' },
  { name: 'Ceramic', category: 'Natural' },
  { name: 'Wood (hardwood)', category: 'Natural' },
  { name: 'Wood (softwood)', category: 'Natural' },
  { name: 'Leather', category: 'Natural' },
  { name: 'Fabric/textile', category: 'Natural' },
];

const RECENT_KEY = 'gravix_recent_substrates';

interface SubstrateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string;
}

export function SubstrateSelector({
  value,
  onChange,
  placeholder = 'Select substrate',
  autoFocus = false,
  disabled = false,
  error,
}: SubstrateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSubstrates, setRecentSubstrates] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load recent substrates from localStorage
  useEffect(() => {
    try {
      const recent = localStorage.getItem(RECENT_KEY);
      if (recent) setRecentSubstrates(JSON.parse(recent));
    } catch (e) {
      // Ignore errors
    }
  }, []);

  // Save to recent when selection changes
  const saveToRecent = (substrate: string) => {
    if (!substrate || substrate.startsWith('Other:')) return;
    
    const updated = [substrate, ...recentSubstrates.filter(s => s !== substrate)].slice(0, 5);
    setRecentSubstrates(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      // Ignore errors
    }
  };

  // Fuzzy search logic
  const filteredSubstrates = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return SUBSTRATES;

    return SUBSTRATES.filter(s => {
      const name = s.name.toLowerCase();
      const category = s.category.toLowerCase();
      return name.includes(query) || category.includes(query);
    });
  }, [searchQuery]);

  // Group by category
  const groupedSubstrates = useMemo(() => {
    const groups: Record<string, Substrate[]> = {};
    filteredSubstrates.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSubstrates]);

  // Recent substrates that match search
  const filteredRecent = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return recentSubstrates;
    return recentSubstrates.filter(s => s.toLowerCase().includes(query));
  }, [recentSubstrates, searchQuery]);

  const handleSelect = (substrate: string) => {
    onChange(substrate);
    saveToRecent(substrate);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCustomInput = () => {
    const custom = searchQuery.trim();
    if (custom) {
      onChange(`Other: ${custom}`);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const renderDropdown = () => (
    <div className="bg-surface-2 border border-brand-600 rounded-md shadow-lg max-h-[400px] overflow-y-auto">
      {/* Search input */}
      <div className="sticky top-0 bg-surface-2 p-3 border-b border-brand-600">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search substrates..."
            className="w-full h-10 pl-10 pr-10 bg-brand-800 border border-brand-600 rounded text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500"
            autoFocus={!isMobile}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recent selections */}
      {filteredRecent.length > 0 && !searchQuery && (
        <div className="p-2 border-b border-brand-600">
          <div className="px-3 py-1 text-xs font-medium text-text-tertiary uppercase tracking-wide">
            Recent
          </div>
          {filteredRecent.map((substrate) => (
            <button
              key={substrate}
              onClick={() => handleSelect(substrate)}
              className={cn(
                'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                value === substrate
                  ? 'bg-[#1E3A5F] text-accent-500'
                  : 'hover:bg-brand-600 text-text-primary'
              )}
            >
              <div className="flex items-center justify-between">
                <span>{substrate}</span>
                {value === substrate && <Check className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Grouped substrates */}
      <div className="p-2">
        {Object.entries(groupedSubstrates).map(([category, substrates]) => (
          <div key={category} className="mb-1">
            <div className="px-3 py-1 text-xs font-medium text-text-tertiary uppercase tracking-wide">
              {category}
            </div>
            {substrates.map((substrate) => (
              <button
                key={substrate.name}
                onClick={() => handleSelect(substrate.name)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                  value === substrate.name
                    ? 'bg-[#1E3A5F] text-accent-500'
                    : 'hover:bg-brand-600 text-text-primary'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{substrate.name}</span>
                  {value === substrate.name && <Check className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Custom option */}
      {searchQuery && (
        <div className="p-2 border-t border-brand-600">
          <button
            onClick={handleCustomInput}
            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-brand-600 text-text-primary"
          >
            Other: <span className="font-medium">{searchQuery}</span>
          </button>
        </div>
      )}

      {/* No results */}
      {filteredSubstrates.length === 0 && !searchQuery && (
        <div className="p-4 text-center text-sm text-text-tertiary">
          No substrates found
        </div>
      )}
    </div>
  );

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full h-11 px-4 flex items-center justify-between bg-brand-800 border rounded text-sm text-left transition-colors',
          error ? 'border-danger' : 'border-brand-600',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent-500',
          isOpen && 'border-accent-500 ring-2 ring-accent-500/20'
        )}
      >
        <span className={value ? 'text-text-primary' : 'text-text-tertiary'}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-text-tertiary transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}

      {/* Desktop: inline dropdown */}
      {isOpen && !isMobile && (
        <div className="absolute z-50 w-full mt-1">
          {renderDropdown()}
        </div>
      )}

      {/* Mobile: full-screen modal */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-50 bg-brand-900/95 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-brand-600">
              <h2 className="text-lg font-semibold text-text-primary">Select Substrate</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderDropdown()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
