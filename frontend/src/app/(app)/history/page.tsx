'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, isApiConfigured } from '@/lib/api';
import { Search, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  type: 'spec' | 'failure';
  substrates: string;
  result: string;
  outcome: string | null;
  date: string;
  pdfAvailable: boolean;
}

const MOCK_ANALYSES: HistoryItem[] = [
  { id: '1', type: 'spec', substrates: 'Aluminum 6061 → ABS', result: 'Two-Part Epoxy', outcome: 'confirmed', date: '2024-12-10', pdfAvailable: true },
  { id: '2', type: 'failure', substrates: 'Steel 304 → Polycarbonate', result: 'Surface Prep Issue', outcome: 'pending', date: '2024-12-09', pdfAvailable: true },
  { id: '3', type: 'spec', substrates: 'HDPE → HDPE', result: 'Structural Acrylic', outcome: null, date: '2024-12-08', pdfAvailable: true },
  { id: '4', type: 'failure', substrates: 'Copper → Glass', result: 'CTE Mismatch', outcome: 'confirmed', date: '2024-12-05', pdfAvailable: true },
  { id: '5', type: 'spec', substrates: 'Nylon 6 → Nylon 6', result: 'Cyanoacrylate', outcome: null, date: '2024-12-01', pdfAvailable: true },
  { id: '6', type: 'failure', substrates: 'Titanium → PEEK', result: 'Moisture Contamination', outcome: 'pending', date: '2024-11-28', pdfAvailable: false },
  { id: '7', type: 'spec', substrates: 'Brass → PBT', result: 'UV-Cure Acrylic', outcome: 'confirmed', date: '2024-11-20', pdfAvailable: false },
];

export default function HistoryPage() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState('all');
  const [substrateFilter, setSubstrateFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyses, setAnalyses] = useState<HistoryItem[]>(MOCK_ANALYSES);

  useEffect(() => {
    if (!user || !isApiConfigured()) return;

    Promise.all([
      api.listFailureAnalyses().catch(() => []),
      api.listSpecRequests().catch(() => []),
    ]).then(([rawAnalyses, rawSpecs]) => {
      const items: HistoryItem[] = [];

      const analysisList = Array.isArray(rawAnalyses)
        ? rawAnalyses
        : ((rawAnalyses as unknown as Record<string, unknown>)?.items as unknown[]) || [];
      (analysisList as Record<string, unknown>[]).forEach((a) => {
        items.push({
          id: a.id as string,
          type: 'failure',
          substrates: `${a.substrate_a || '?'} → ${a.substrate_b || '?'}`,
          result: (a.failure_mode as string) || 'Analysis',
          outcome: null,
          date: ((a.created_at as string) || '').slice(0, 10),
          pdfAvailable: (a.status as string) === 'completed',
        });
      });

      const specList = Array.isArray(rawSpecs)
        ? rawSpecs
        : ((rawSpecs as unknown as Record<string, unknown>)?.items as unknown[]) || [];
      (specList as Record<string, unknown>[]).forEach((s) => {
        items.push({
          id: s.id as string,
          type: 'spec',
          substrates: `${s.substrate_a || '?'} → ${s.substrate_b || '?'}`,
          result: (s.recommended_material_type as string) || 'Spec',
          outcome: null,
          date: ((s.created_at as string) || '').slice(0, 10),
          pdfAvailable: (s.status as string) === 'completed',
        });
      });

      if (items.length > 0) {
        items.sort((a, b) => b.date.localeCompare(a.date));
        setAnalyses(items);
      }
    });
  }, [user]);

  const isFreeUser = !user;
  const visibleLimit = isFreeUser ? 5 : analyses.length;

  const filtered = analyses.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (outcomeFilter !== 'all' && (a.outcome || 'none') !== outcomeFilter) return false;
    if (searchQuery && !a.substrates.toLowerCase().includes(searchQuery.toLowerCase()) && !a.result.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Analysis History</h1>

      {/* Component 7.1: Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <FilterSelect value={typeFilter} onChange={setTypeFilter} options={[
          { value: 'all', label: 'All Types' },
          { value: 'spec', label: 'Spec' },
          { value: 'failure', label: 'Failure' },
        ]} />
        <FilterSelect value={substrateFilter} onChange={setSubstrateFilter} options={[
          { value: 'all', label: 'All Substrates' },
        ]} />
        <FilterSelect value={outcomeFilter} onChange={setOutcomeFilter} options={[
          { value: 'all', label: 'All Outcomes' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'pending', label: 'Pending' },
          { value: 'none', label: 'No Feedback' },
        ]} />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#111827] border border-[#374151] rounded text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-accent-500"
          />
        </div>
      </div>

      {/* Component 7.2: History List */}
      <div className="space-y-3">
        {filtered.slice(0, visibleLimit).map((a) => (
          <div key={a.id} className="bg-brand-800 border border-[#1F2937] rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 hover:border-accent-500/50 transition-colors cursor-pointer">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium w-fit',
              a.type === 'spec' ? 'bg-accent-500/10 text-accent-500' : 'bg-warning/10 text-warning'
            )}>
              {a.type === 'spec' ? 'Spec' : 'Failure'}
            </span>
            <span className="text-sm text-white flex-1">{a.substrates}</span>
            <span className="text-sm text-[#94A3B8] hidden md:block">{a.result}</span>
            <span className={cn('text-xs font-medium hidden md:block',
              a.outcome === 'confirmed' ? 'text-success' : a.outcome === 'pending' ? 'text-warning' : 'text-[#64748B]'
            )}>
              {a.outcome || '—'}
            </span>
            <span className="text-xs text-[#64748B]">{a.date}</span>
            {a.pdfAvailable && (
              <button
                onClick={() => {
                  const url = a.type === 'failure'
                    ? api.getAnalysisPdfUrl(a.id)
                    : api.getSpecPdfUrl(a.id);
                  window.open(url, '_blank');
                }}
                className="text-[#94A3B8] hover:text-white transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Free user: blur + upgrade for items beyond limit */}
        {isFreeUser && filtered.length > visibleLimit && (
          <div className="relative">
            {/* Blurred cards */}
            <div className="filter blur-[6px] select-none pointer-events-none space-y-3">
              {filtered.slice(visibleLimit, visibleLimit + 2).map((a) => (
                <div key={a.id} className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">
                  <span className="text-sm text-white">{a.substrates}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#0A1628]/90 border border-accent-500/20 rounded-lg p-6 text-center max-w-sm">
                <Lock className="w-8 h-8 text-accent-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Upgrade to see full history</h3>
                <p className="text-sm text-[#94A3B8] mb-4">Free accounts can view the last 5 analyses.</p>
                <Link href="/pricing" className="inline-block bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Load more (for Pro users) */}
        {!isFreeUser && filtered.length > 10 && (
          <div className="text-center pt-4">
            <Button variant="outline">Load more</Button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#64748B]">No analyses found matching your filters.</div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 bg-[#111827] border border-[#374151] rounded text-sm text-white focus:outline-none focus:border-accent-500 appearance-none cursor-pointer"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
