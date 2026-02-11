'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { api, isApiConfigured } from '@/lib/api';

// Mock data (fallback)
const CASES = [
  { id: 'ca-debonding-aluminum-abs', title: 'Cyanoacrylate Debonding on Aluminum-ABS Assembly', summary: 'Production failure where CA bonds failed within 2 weeks. Root cause: surface contamination combined with thermal cycling.', material: 'Cyanoacrylate', failureMode: 'Adhesive Failure', industry: 'Automotive', tags: ['CA', 'aluminum', 'ABS', 'thermal cycling'] },
  { id: 'epoxy-cracking-electronics', title: 'Epoxy Cracking in High-Temperature Electronics', summary: 'Structural epoxy developed cracks after thermal cycling. CTE mismatch between ceramic substrate and rigid epoxy caused stress fractures.', material: 'Epoxy', failureMode: 'Cohesive Failure', industry: 'Electronics', tags: ['epoxy', 'CTE', 'electronics'] },
  { id: 'pu-softening-chemical', title: 'Polyurethane Adhesive Softening in Chemical Environment', summary: 'PU adhesive degraded when exposed to gasoline. Chemical incompatibility caused bond strength to drop below threshold.', material: 'Polyurethane', failureMode: 'Cohesive Failure', industry: 'Automotive', tags: ['polyurethane', 'chemical', 'automotive'] },
  { id: 'silicone-uv-construction', title: 'Silicone Sealant Discoloration from UV Exposure', summary: 'Outdoor silicone sealant turned yellow after 6 months. Non-UV-stabilized formulation used in direct sunlight application.', material: 'Silicone', failureMode: 'Mixed Mode', industry: 'Construction', tags: ['silicone', 'UV', 'outdoor'] },
  { id: 'acrylic-substrate-medical', title: 'Acrylic Bond Substrate Failure on Medical Device', summary: 'Substrate failure on thin-wall polycarbonate housing. Bond exceeded substrate strength, causing housing crack during drop test.', material: 'Acrylic', failureMode: 'Substrate Failure', industry: 'Medical Device', tags: ['acrylic', 'medical', 'polycarbonate'] },
  { id: 'anaerobic-threadlock-vibration', title: 'Anaerobic Threadlocker Failure Under Vibration', summary: 'Threadlocker failed on bolts subjected to high-frequency vibration. Insufficient cure time before assembly went into service.', material: 'Anaerobic', failureMode: 'Adhesive Failure', industry: 'Aerospace', tags: ['anaerobic', 'vibration', 'aerospace'] },
];

const MATERIALS = ['All Materials', 'Cyanoacrylate', 'Epoxy', 'Polyurethane', 'Silicone', 'Acrylic', 'Anaerobic'];
const FAILURE_MODES = ['All Failure Modes', 'Adhesive Failure', 'Cohesive Failure', 'Mixed Mode', 'Substrate Failure'];
const INDUSTRIES = ['All Industries', 'Automotive', 'Aerospace', 'Electronics', 'Medical Device', 'Construction'];

interface CaseItem {
  id: string;
  title: string;
  summary: string;
  material: string;
  failureMode: string;
  industry: string;
  tags: string[];
}

export default function CasesPage() {
  const [materialFilter, setMaterialFilter] = useState('All Materials');
  const [failureModeFilter, setFailureModeFilter] = useState('All Failure Modes');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<CaseItem[]>(CASES);

  useEffect(() => {
    if (!isApiConfigured()) return;
    api
      .listCases()
      .then((data) => {
        // Handle paginated response
        const items = Array.isArray(data) ? data : ((data as unknown as Record<string, unknown>)?.items as unknown[]) || [];
        if ((items as Record<string, unknown>[]).length > 0) {
          setCases(
            (items as Record<string, unknown>[]).map((c) => ({
              id: (c.slug as string) || (c.id as string),
              title: (c.title as string) || '',
              summary: (c.summary as string) || '',
              material: (c.material_category as string) || (c.material_subcategory as string) || '',
              failureMode: (c.failure_mode as string) || '',
              industry: (c.industry as string) || '',
              tags: (c.tags as string[]) || [],
            }))
          );
        }
      })
      .catch(() => {
        // Keep mock data as fallback
      });
  }, []);

  const filtered = cases.filter(c => {
    if (materialFilter !== 'All Materials' && c.material !== materialFilter) return false;
    if (failureModeFilter !== 'All Failure Modes' && c.failureMode !== failureModeFilter) return false;
    if (industryFilter !== 'All Industries' && c.industry !== industryFilter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.summary.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Component 8.1: Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Failure Case Library</h1>
        <p className="text-base text-[#94A3B8]">
          Real-world adhesive failure cases, anonymized and shared to help engineers learn faster.
        </p>
      </div>

      {/* Component 8.2: Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <FilterSelect value={materialFilter} onChange={setMaterialFilter} options={MATERIALS} />
        <FilterSelect value={failureModeFilter} onChange={setFailureModeFilter} options={FAILURE_MODES} />
        <FilterSelect value={industryFilter} onChange={setIndustryFilter} options={INDUSTRIES} />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search cases…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#111827] border border-[#374151] rounded text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-accent-500"
          />
        </div>
      </div>

      {/* Component 8.3: Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <Link key={c.id} href={`/cases/${c.id}`} className="block bg-brand-800 border border-[#1F2937] rounded-lg p-6 hover:border-accent-500/50 transition-colors group">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-500/10 text-accent-500">{c.failureMode}</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#1F2937] text-[#94A3B8]">{c.industry}</span>
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-accent-500 transition-colors">{c.title}</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3">{c.summary}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {c.tags.map(t => (
                <span key={t} className="text-xs text-[#64748B]">#{t}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#64748B]">No cases found matching your filters.</div>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 bg-[#111827] border border-[#374151] rounded text-sm text-white focus:outline-none focus:border-accent-500 appearance-none cursor-pointer"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
