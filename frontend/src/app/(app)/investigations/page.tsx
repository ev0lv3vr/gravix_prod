'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { investigationsApi, type InvestigationListItem } from '@/lib/investigations';
import { StatusBadge, SeverityBadge } from '@/components/investigations/StatusBadge';
import { daysOpen, timeAgo } from '@/components/investigations/InvestigationHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ClipboardList } from 'lucide-react';

export default function InvestigationsListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [investigations, setInvestigations] = useState<InvestigationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const fetchInvestigations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: string; severity?: string; search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (search.trim()) params.search = search.trim();
      const data = await investigationsApi.list(params);
      setInvestigations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load investigations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, search]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchInvestigations();
    }
  }, [authLoading, user, fetchInvestigations]);

  // Filter client-side for search (backend may not support text search on title)
  const filtered = search.trim()
    ? investigations.filter(
        (inv) =>
          inv.title.toLowerCase().includes(search.toLowerCase()) ||
          inv.investigation_number.toLowerCase().includes(search.toLowerCase()) ||
          (inv.customer_oem || '').toLowerCase().includes(search.toLowerCase())
      )
    : investigations;

  if (authLoading || !user) return null;

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Investigations</h1>
          <p className="text-sm text-[#94A3B8] mt-1">8D quality investigations</p>
        </div>
        <Button
          className="mt-4 md:mt-0 bg-accent-500 hover:bg-accent-600 text-white"
          onClick={() => router.push('/investigations/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Investigation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <Input
            placeholder="Search investigations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-brand-800 border-[#1F2937] text-white">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="containment">Containment</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="corrective_action">Corrective Action</SelectItem>
            <SelectItem value="verification">Verification</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[160px] bg-brand-800 border-[#1F2937] text-white">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="major">Major</SelectItem>
            <SelectItem value="minor">Minor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-5 w-24 bg-[#1F2937] rounded" />
                <div className="h-4 w-48 bg-[#1F2937] rounded flex-1" />
                <div className="h-5 w-20 bg-[#1F2937] rounded" />
                <div className="h-5 w-16 bg-[#1F2937] rounded hidden md:block" />
                <div className="h-4 w-24 bg-[#1F2937] rounded hidden md:block" />
                <div className="h-4 w-16 bg-[#1F2937] rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-12 text-center">
          <ClipboardList className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No investigations found</h3>
          <p className="text-sm text-[#94A3B8] mb-6">
            {search || statusFilter !== 'all' || severityFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first 8D investigation to get started.'}
          </p>
          {statusFilter === 'all' && severityFilter === 'all' && !search && (
            <Button
              className="bg-accent-500 hover:bg-accent-600 text-white"
              onClick={() => router.push('/investigations/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Investigation
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="text-left text-xs text-[#64748B] font-medium p-4">Investigation #</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4">Title</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4">Status</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden md:table-cell">Severity</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden lg:table-cell">Customer</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden md:table-cell">Days Open</th>
                  <th className="text-left text-xs text-[#64748B] font-medium p-4">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="relative border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937] transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        href={`/investigations/${inv.id}`}
                        className="absolute inset-0 z-10"
                        aria-label={`View investigation ${inv.investigation_number}`}
                      />
                      <span className="relative z-0 text-sm font-mono text-accent-500">
                        {inv.investigation_number}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-white">{inv.title}</span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <SeverityBadge severity={inv.severity} />
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-[#94A3B8]">{inv.customer_oem || '—'}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-[#94A3B8]">{daysOpen(inv.created_at)}d</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-[#64748B]">{timeAgo(inv.updated_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
