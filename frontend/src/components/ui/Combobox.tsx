'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SuggestionCategory, SuggestionItem } from '@/lib/substrate-suggestions';

export type { SuggestionCategory, SuggestionItem };

export interface ComboboxProps {
  label: string;
  placeholder: string;
  suggestions: SuggestionCategory[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  recentKey?: string;
  showTdsBadge?: boolean;
  error?: string;
  autoFocus?: boolean;
}

/** Compute Levenshtein distance between two strings. */
function levenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const dp: number[][] = Array.from({ length: al + 1 }, (_, i) =>
    Array.from({ length: bl + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[al][bl];
}

interface FlatItem {
  name: string;
  aliases: string[];
  category: string;
  hasTds?: boolean;
}

export function Combobox({
  label,
  placeholder,
  suggestions,
  value,
  onChange,
  required,
  recentKey,
  showTdsBadge,
  error,
  autoFocus,
}: ComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [recentSelections, setRecentSelections] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync external value → internal input
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Load recent selections from localStorage
  useEffect(() => {
    if (!recentKey) return;
    try {
      const stored = localStorage.getItem(recentKey);
      if (stored) setRecentSelections(JSON.parse(stored));
    } catch { /* noop */ }
  }, [recentKey]);

  const saveToRecent = useCallback((name: string) => {
    if (!recentKey || !name) return;
    const updated = [name, ...recentSelections.filter((s) => s !== name)].slice(0, 3);
    setRecentSelections(updated);
    try {
      localStorage.setItem(recentKey, JSON.stringify(updated));
    } catch { /* noop */ }
  }, [recentKey, recentSelections]);

  // Flatten all suggestions for searching
  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const cat of suggestions) {
      for (const item of cat.items) {
        items.push({ name: item.name, aliases: item.aliases, category: cat.category, hasTds: item.hasTds });
      }
    }
    return items;
  }, [suggestions]);

  // Filter & match logic
  const { matched, fuzzyMatched, hasExactMatch } = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    if (!query) {
      return { matched: flatItems, fuzzyMatched: [] as FlatItem[], hasExactMatch: false };
    }

    let exactMatch = false;
    const prefixMatches: FlatItem[] = [];
    const fuzzy: FlatItem[] = [];

    for (const item of flatItems) {
      const nameLower = item.name.toLowerCase();
      if (nameLower === query) exactMatch = true;

      // Check prefix match on name
      if (nameLower.includes(query)) {
        prefixMatches.push(item);
        continue;
      }

      // Check prefix match on aliases
      const aliasMatch = item.aliases.some((alias) => alias.toLowerCase().includes(query));
      if (aliasMatch) {
        prefixMatches.push(item);
        continue;
      }

      // Fuzzy: only when ≥3 chars
      if (query.length >= 3) {
        const nameDistance = levenshtein(query, nameLower.slice(0, query.length));
        const isSubstringOfAlias = item.aliases.some((alias) => alias.toLowerCase().includes(query));
        const isFuzzyNameMatch = nameDistance <= 3;

        if (isFuzzyNameMatch || isSubstringOfAlias) {
          fuzzy.push(item);
        }
      }
    }

    return {
      matched: prefixMatches.slice(0, 8),
      fuzzyMatched: fuzzy.slice(0, 4),
      hasExactMatch: exactMatch,
    };
  }, [inputValue, flatItems]);

  // Group matched items by category, with Recent pinned at top
  const groupedResults = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    const groups: { category: string; items: FlatItem[] }[] = [];

    // Recent pinned at top (when no search query, or matching)
    if (recentSelections.length > 0) {
      const recentItems = recentSelections
        .filter((r) => {
          if (!query) return true;
          return r.toLowerCase().includes(query);
        })
        .map((r) => {
          const found = flatItems.find((fi) => fi.name === r);
          return found || { name: r, aliases: [], category: 'Recent', hasTds: false };
        });
      if (recentItems.length > 0) {
        groups.push({ category: 'Recent', items: recentItems });
      }
    }

    // Group matched by category (excluding items already in Recent)
    const recentNames = new Set(groups[0]?.items.map((i) => i.name) || []);
    const catMap = new Map<string, FlatItem[]>();

    for (const item of matched) {
      if (recentNames.has(item.name)) continue;
      const existing = catMap.get(item.category);
      if (existing) {
        existing.push(item);
      } else {
        catMap.set(item.category, [item]);
      }
    }

    for (const [cat, items] of catMap) {
      groups.push({ category: cat, items });
    }

    return groups;
  }, [matched, recentSelections, inputValue, flatItems]);

  // Build a flat list of navigable items for keyboard
  const navigableItems = useMemo(() => {
    const items: { name: string; hasTds?: boolean }[] = [];
    for (const group of groupedResults) {
      for (const item of group.items) {
        items.push({ name: item.name, hasTds: item.hasTds });
      }
    }
    // Only add fuzzy matches when they'll be rendered (no exact/prefix matches)
    const showFuzzy = items.length === 0 && fuzzyMatched.length > 0;
    if (showFuzzy) {
      for (const item of fuzzyMatched) {
        if (!items.some((i) => i.name === item.name)) {
          items.push({ name: item.name, hasTds: item.hasTds });
        }
      }
    }
    // "Use as entered" row
    const query = inputValue.trim();
    if (query && !hasExactMatch) {
      items.push({ name: `__use_as_entered__` });
    }
    return items;
  }, [groupedResults, fuzzyMatched, inputValue, hasExactMatch]);

  const selectItem = useCallback((name: string) => {
    const actualName = name === '__use_as_entered__' ? inputValue.trim() : name;
    onChange(actualName);
    setInputValue(actualName);
    saveToRecent(actualName);
    setIsOpen(false);
    setHighlightIndex(-1);
  }, [onChange, inputValue, saveToRecent]);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // If user has typed something, accept it
        if (inputValue.trim() && inputValue.trim() !== value) {
          onChange(inputValue.trim());
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, inputValue, value, onChange]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, navigableItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < navigableItems.length) {
          selectItem(navigableItems[highlightIndex].name);
        } else if (inputValue.trim()) {
          // Accept as entered
          onChange(inputValue.trim());
          saveToRecent(inputValue.trim());
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
      case 'Tab':
        // Accept current value and close
        if (inputValue.trim()) {
          onChange(inputValue.trim());
          if (inputValue.trim() !== value) saveToRecent(inputValue.trim());
        }
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-combobox-item]');
    items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex]);

  const handleClear = () => {
    onChange('');
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightIndex(-1);
  };

  // Track the current navigable index for rendering highlights
  let navIndex = 0;

  const showUseAsEntered = inputValue.trim() && !hasExactMatch;
  const showFuzzySection = inputValue.trim() && matched.length === 0 && fuzzyMatched.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      <label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full h-11 pl-10 pr-10 bg-[#0F1629] border rounded text-sm text-white placeholder:text-[#64748B] outline-none transition-all',
            isOpen
              ? 'border-2 border-[#3B82F6] ring-0'
              : error
                ? 'border border-red-500'
                : 'border border-[#374151] hover:border-[#3B82F6]/50',
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-[#1E293B] border border-[#374151] rounded-b-lg shadow-lg max-h-[320px] overflow-y-auto"
        >
          {/* Grouped results */}
          {groupedResults.map((group) => (
            <div key={group.category}>
              <div className="px-3 pt-3 pb-1 text-[11px] font-medium text-[#64748B] uppercase tracking-wider select-none">
                {group.category}
              </div>
              {group.items.map((item) => {
                const currentNav = navIndex++;
                const isHighlighted = currentNav === highlightIndex;
                return (
                  <button
                    key={`${group.category}-${item.name}`}
                    type="button"
                    data-combobox-item
                    onClick={() => selectItem(item.name)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer flex items-center justify-between',
                      isHighlighted ? 'bg-[#334155] text-white' : 'text-[#CBD5E1] hover:bg-[#334155]'
                    )}
                  >
                    <span>{item.name}</span>
                    {showTdsBadge && item.hasTds && (
                      <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        ✓ TDS on file
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Fuzzy "Similar" section when no prefix matches */}
          {showFuzzySection && (
            <div>
              <div className="px-3 pt-3 pb-1 text-[11px] font-medium text-[#64748B] uppercase tracking-wider select-none">
                Similar
              </div>
              {fuzzyMatched.map((item) => {
                const currentNav = navIndex++;
                const isHighlighted = currentNav === highlightIndex;
                return (
                  <button
                    key={`fuzzy-${item.name}`}
                    type="button"
                    data-combobox-item
                    onClick={() => selectItem(item.name)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer pl-5',
                      isHighlighted ? 'bg-[#334155] text-white' : 'text-[#94A3B8] hover:bg-[#334155]'
                    )}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* "Use as entered" row — always at bottom when no exact match */}
          {showUseAsEntered && (
            <div className="border-t border-[#1F2937]">
              {(() => {
                const currentNav = navIndex++;
                const isHighlighted = currentNav === highlightIndex;
                return (
                  <button
                    type="button"
                    data-combobox-item
                    onClick={() => selectItem('__use_as_entered__')}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm transition-colors cursor-pointer',
                      isHighlighted ? 'bg-[#334155] text-[#3B82F6]' : 'text-[#3B82F6] hover:bg-[#334155]'
                    )}
                  >
                    ✓ Use &ldquo;{inputValue.trim()}&rdquo; as entered
                  </button>
                );
              })()}
            </div>
          )}

          {/* No results at all */}
          {groupedResults.length === 0 && fuzzyMatched.length === 0 && !showUseAsEntered && (
            <div className="px-3 py-4 text-sm text-[#64748B] text-center">
              Start typing to search substrates…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
