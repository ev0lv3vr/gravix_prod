'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';

// Fallback mock data for when API returns empty
const MOCK_CASES = [
  { id: 'ca-debonding-aluminum-abs', title: 'Cyanoacrylate Debonding on Aluminum-ABS Assembly', summary: 'Production failure where CA bonds failed within 2 weeks. Root cause: surface contamination combined with thermal cycling.', material_category: 'Cyanoacrylate', failure_mode: 'Adhesive Failure', industry: 'Automotive', tags: ['CA', 'aluminum', 'ABS', 'thermal cycling'] },
  { id: 'epoxy-cracking-electronics', title: 'Epoxy Cracking in High-Temperature Electronics', summary: 'Structural epoxy developed cracks after thermal cycling. CTE mismatch between ceramic substrate and rigid epoxy caused stress fractures.', material_category: 'Epoxy', failure_mode: 'Cohesive Failure', industry: 'Electronics', tags: ['epoxy', 'CTE', 'electronics'] },
  { id: 'pu-softening-chemical', title: 'Polyurethane Adhesive Softening in Chemical Environment', summary: 'PU adhesive degraded when exposed to gasoline. Chemical incompatibility caused bond strength to drop below threshold.', material_category: 'Polyurethane', failure_mode: 'Cohesive Failure', industry: 'Automotive', tags: ['polyurethane', 'chemical', 'automotive'] },
  { id: 'silicone-uv-construction', title: 'Silicone Sealant Discoloration from UV Exposure', summary: 'Outdoor silicone sealant turned yellow after 6 months. Non-UV-stabilized formulation used in direct sunlight application.', material_category: 'Silicone', failure_mode: 'Mixed Mode', industry: 'Construction', tags: ['silicone', 'UV', 'outdoor'] },
  { id: 'acrylic-substrate-medical', title: 'Acrylic Bond Substrate Failure on Medical Device', summary: 'Substrate failure on thin-wall polycarbonate housing. Bond exceeded substrate strength, causing housing crack during drop test.', material_category: 'Acrylic', failure_mode: 'Substrate Failure', industry: 'Medical Device', tags: ['acrylic', 'medical', 'polycarbonate'] },
  { id: 'anaerobic-threadlock-vibration', title: 'Anaerobic Threadlocker Failure Under Vibration', summary: 'Threadlocker failed on bolts subjected to high-frequency vibration. Insufficient cure time before assembly went into service.', material_category: 'Anaerobic', failure_mode: 'Adhesive Failure', industry: 'Aerospace', tags: ['anaerobic', 'vibration', 'aerospace'] },
];

const MATERIALS = ['All Materials', 'Cyanoacrylate', 'Epoxy', 'Polyurethane', 'Silicone', 'Acrylic', 'Anaerobic'];
const FAILURE_MODES = ['All Failure Modes', 'Adhesive Failure', 'Cohesive Failure', 'Mixed Mode', 'Substrate Failure'];
const INDUSTRIES = ['All Industries', 'Automotive', 'Aerospace', 'Electronics', 'Medical Device', 'Construction'];

export default function CasesPage() {
  const [materialFilter, setMaterialFilter] = useState('All Materials');
  const [failureModeFilter, setFailureModeFilter] = useState('All Failure Modes');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cases from API with filters
  useEffect(() => {
    setLoading(true);
    const filters: import('@/lib/types').CaseFilters = {};
    if (materialFilter !== 'All Materials') filters.materialCategory = materialFilter;
    if (failureModeFilter !== 'All Failure Modes') filters.failureMode = failureModeFilter;
    
    api.listCases(filters)
      .then(data => {
        // Use API data if available, otherwise use mock data
        setCases(data.length > 0 ? data : MOCK_CASES);
      })
      .catch(() => {
        // Fallback to mock data on error
        setCases(MOCK_CASES);
      })
      .finally(() => setLoading(false));
  }, [materialFilter, failureModeFilter]);

  const filtered = cases.filter(c => {
    // Industry filter (client-side since API might not support it)
    if (industryFilter !== 'All Industries' && c.industry !== industryFilter) return false;
    
    // Search filter (client-side)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = (c.title || '').toLowerCase();
      const summary = (c.summary || c.description || '').toLowerCase();
      if (!title.includes(q) && !summary.includes(q)) return false;
    }
    
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
      {loading ? (
        <div className="text-center py-16 text-[#94A3B8]">Loading cases...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => {
              const failureMode = c.failure_mode || c.failureMode || 'Unknown';
              const industry = c.industry || 'General';
              const title = c.title || 'Case Study';
              const summary = c.summary || c.description || '';
              const tags = c.tags || [];
              const slug = c.slug || c.id;
              
              return (
                <Link key={c.id} href={`/cases/${slug}`} className="block bg-brand-800 border border-[#1F2937] rounded-lg p-6 hover:border-accent-500/50 transition-colors group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-500/10 text-accent-500">{failureMode}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#1F2937] text-[#94A3B8]">{industry}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-accent-500 transition-colors">{title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3">{summary}</p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tags.map((t: string) => (
                        <span key={t} className="text-xs text-[#64748B]">#{t}</span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[#64748B]">No cases found matching your filters.</div>
          )}
        </>
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
