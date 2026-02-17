'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { investigationsApi, type InvestigationListItem, type InvestigationStatus } from '@/lib/investigations';
import { StatusBadge, SeverityBadge } from '@/components/investigations/StatusBadge';
import { daysOpen, timeAgo, STATUS_ORDER, formatStatus } from '@/components/investigations/InvestigationHelpers';
import {
  MOCK_INVESTIGATIONS,
  getTeamMemberName,
  getOpenActionCount,
  getOverdueActionCount,
  isValidTransition,
} from '@/lib/mock-investigations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  ClipboardList,
  List,
  Columns3,
  Clock,
  AlertTriangle,
  Users,
  Lock,
} from 'lucide-react';

// ─── Plan gate: Quality+ only ────────────────────────────────────────────────

function UpgradePrompt() {
  return (
    <div className="container mx-auto px-6 py-20 text-center">
      <div className="max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[#8B5CF6]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          8D Investigation Management
        </h1>
        <p className="text-[#94A3B8] mb-6 leading-relaxed">
          Manage 8D quality investigations with your team. AI-powered root cause analysis,
          photo annotation, audit logging, and OEM-ready report generation.
        </p>
        <p className="text-sm text-[#64748B] mb-8">
          Available on Quality ($299/mo) and Enterprise ($799/mo) plans.
        </p>
        <Link href="/pricing">
          <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
            Upgrade to Quality →
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({
  inv,
  onDragStart,
}: {
  inv: InvestigationListItem;
  onDragStart: (e: React.DragEvent, inv: InvestigationListItem) => void;
}) {
  const openActions = getOpenActionCount(inv.id);
  const overdueActions = getOverdueActionCount(inv.id);

  return (
    <Link href={`/investigations/${inv.id}`}>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, inv)}
        className="bg-brand-800 border border-[#1F2937] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent-500/50 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-accent-500">{inv.investigation_number}</span>
          <SeverityBadge severity={inv.severity} />
        </div>
        <p className="text-sm text-white font-medium leading-snug mb-2 line-clamp-2">
          {inv.title}
        </p>
        {inv.customer_oem && (
          <p className="text-xs text-[#64748B] mb-2">{inv.customer_oem}</p>
        )}
        <div className="flex items-center justify-between text-[10px] text-[#64748B]">
          <span>{daysOpen(inv.created_at)}d open</span>
          <div className="flex items-center gap-2">
            {openActions > 0 && (
              <span className="text-warning">{openActions} open</span>
            )}
            {overdueActions > 0 && (
              <span className="text-danger">{overdueActions} overdue</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  investigations,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  status: InvestigationStatus;
  investigations: InvestigationListItem[];
  onDragStart: (e: React.DragEvent, inv: InvestigationListItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: InvestigationStatus) => void;
  isDragOver: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-[220px] max-w-[280px] flex flex-col rounded-lg transition-colors ${
        isDragOver ? 'bg-accent-500/5 ring-1 ring-accent-500/30' : ''
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          {formatStatus(status)}
        </span>
        <Badge variant="outline" className="text-[10px] py-0">
          {investigations.length}
        </Badge>
      </div>
      <div className="flex-1 space-y-2 px-1 pb-2 min-h-[200px]">
        {investigations.map((inv) => (
          <KanbanCard key={inv.id} inv={inv} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

// ─── List Card ────────────────────────────────────────────────────────────────

function InvestigationListCard({ inv }: { inv: InvestigationListItem }) {
  const openActions = getOpenActionCount(inv.id);
  const overdueActions = getOverdueActionCount(inv.id);
  const teamLead = getTeamMemberName(inv.team_lead_user_id);

  return (
    <Link href={`/investigations/${inv.id}`}>
      <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-4 hover:border-accent-500/50 transition-colors">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-accent-500">
                {inv.investigation_number}
              </span>
              <SeverityBadge severity={inv.severity} />
              <StatusBadge status={inv.status} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 truncate">
              {inv.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
              {inv.customer_oem && <span>{inv.customer_oem}</span>}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {teamLead}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1">
            {openActions > 0 && (
              <span className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {openActions} open
              </span>
            )}
            {overdueActions > 0 && (
              <span className="text-xs text-danger flex items-center gap-1">
                {overdueActions} overdue
              </span>
            )}
            <span className="text-[10px] text-[#64748B]">{timeAgo(inv.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = 'list' | 'kanban';

export default function InvestigationsListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [investigations, setInvestigations] = useState<InvestigationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Drag state for Kanban
  const [dragOverColumn, setDragOverColumn] = useState<InvestigationStatus | null>(null);
  const [dragItem, setDragItem] = useState<InvestigationListItem | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // TODO: Check user plan — for now, always show (plan gating placeholder)
  const hasQualityPlan = true;

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

      let data: InvestigationListItem[];
      try {
        data = await investigationsApi.list(params);
      } catch {
        // Fallback to mock data in development
        data = MOCK_INVESTIGATIONS;
      }
      setInvestigations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load investigations');
      // Fallback to mock
      setInvestigations(MOCK_INVESTIGATIONS);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, search]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchInvestigations();
    }
  }, [authLoading, user, fetchInvestigations]);

  // Get unique customers for filter
  const customers = useMemo(() => {
    const set = new Set(investigations.map((i) => i.customer_oem).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [investigations]);

  // Client-side filter
  const filtered = useMemo(() => {
    return investigations.filter((inv) => {
      if (customerFilter !== 'all' && inv.customer_oem !== customerFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          inv.title.toLowerCase().includes(q) ||
          inv.investigation_number.toLowerCase().includes(q) ||
          (inv.customer_oem || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [investigations, customerFilter, search]);

  // Kanban grouping
  const kanbanColumns = useMemo(() => {
    const groups: Record<InvestigationStatus, InvestigationListItem[]> = {
      open: [],
      containment: [],
      investigating: [],
      corrective_action: [],
      verification: [],
      closed: [],
    };
    filtered.forEach((inv) => {
      if (groups[inv.status]) {
        groups[inv.status].push(inv);
      }
    });
    return groups;
  }, [filtered]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, inv: InvestigationListItem) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragItem(inv);
    setTransitionError(null);
  };

  const handleDragOver = (e: React.DragEvent, status: InvestigationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: InvestigationStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!dragItem || dragItem.status === targetStatus) {
      setDragItem(null);
      return;
    }

    // Validate transition
    if (!isValidTransition(dragItem.status, targetStatus)) {
      setTransitionError(
        `Cannot move from "${formatStatus(dragItem.status)}" to "${formatStatus(targetStatus)}". Status must advance sequentially.`
      );
      setDragItem(null);
      setTimeout(() => setTransitionError(null), 4000);
      return;
    }

    // Optimistic update
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === dragItem.id ? { ...inv, status: targetStatus } : inv
      )
    );

    try {
      await investigationsApi.transitionStatus(dragItem.id, targetStatus);
    } catch {
      // Revert on error
      setInvestigations((prev) =>
        prev.map((inv) =>
          inv.id === dragItem.id ? { ...inv, status: dragItem.status } : inv
        )
      );
      setTransitionError('Status transition failed. Please try again.');
      setTimeout(() => setTransitionError(null), 4000);
    }

    setDragItem(null);
  };

  const handleDragEnd = () => {
    setDragOverColumn(null);
    setDragItem(null);
  };

  if (authLoading || !user) return null;
  if (!hasQualityPlan) return <UpgradePrompt />;

  return (
    <div className="container mx-auto px-6 py-10" onDragEnd={handleDragEnd}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Investigations</h1>
          <p className="text-sm text-[#94A3B8] mt-1">8D quality investigations</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {/* View Toggle */}
          <div className="flex bg-brand-800 border border-[#1F2937] rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent-500 text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-accent-500 text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <Button
            className="bg-accent-500 hover:bg-accent-600 text-white"
            onClick={() => router.push('/investigations/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Investigation
          </Button>
        </div>
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
        {customers.length > 0 && (
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[200px] bg-brand-800 border-[#1F2937] text-white">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Error / Transition Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6 text-sm text-danger">
          {error}
        </div>
      )}
      {transitionError && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6 text-sm text-danger flex items-center justify-between">
          <span>{transitionError}</span>
          <button onClick={() => setTransitionError(null)} className="text-danger/60 hover:text-danger ml-4">✕</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-brand-800 border border-[#1F2937] rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-4 w-24 bg-[#1F2937] rounded" />
                <div className="h-5 w-16 bg-[#1F2937] rounded" />
                <div className="h-5 w-20 bg-[#1F2937] rounded" />
              </div>
              <div className="h-4 w-64 bg-[#1F2937] rounded mb-2" />
              <div className="h-3 w-48 bg-[#1F2937] rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-12 text-center">
          <ClipboardList className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No investigations found</h3>
          <p className="text-sm text-[#94A3B8] mb-6">
            {search || statusFilter !== 'all' || severityFilter !== 'all' || customerFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first 8D investigation to get started.'}
          </p>
          {statusFilter === 'all' && severityFilter === 'all' && !search && customerFilter === 'all' && (
            <Button
              className="bg-accent-500 hover:bg-accent-600 text-white"
              onClick={() => router.push('/investigations/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Investigation
            </Button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* ─── List View ────────────────────────────────────────────── */
        <div className="space-y-3">
          {filtered.map((inv) => (
            <InvestigationListCard key={inv.id} inv={inv} />
          ))}
        </div>
      ) : (
        /* ─── Kanban View ──────────────────────────────────────────── */
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              investigations={kanbanColumns[status] || []}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={handleDrop}
              isDragOver={dragOverColumn === status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
