'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  investigationsApi,
  type Investigation,
  type InvestigationAction,
  type InvestigationSignature,
  type AuditLogEntry,
} from '@/lib/investigations';
import { StatusBadge, SeverityBadge } from '@/components/investigations/StatusBadge';
import { DisciplineStepper } from '@/components/investigations/DisciplineStepper';
import { AddActionDialog } from '@/components/investigations/AddActionDialog';
import { CommentPanel } from '@/components/investigations/CommentPanel';
import { daysOpen, formatDate, timeAgo, getNextStatus, formatStatus } from '@/components/investigations/InvestigationHelpers';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileText,
  Share2,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  Copy,
  ClipboardList,
} from 'lucide-react';

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const investigationId = params.id as string;

  // Data state
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [actions, setActions] = useState<InvestigationAction[]>([]);
  const [signatures, setSignatures] = useState<InvestigationSignature[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [analyzing, setAnalyzing] = useState(false);
  const [signing, setSigning] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDiscipline, setActionDiscipline] = useState('D3');

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, acts, sigs, audit] = await Promise.all([
        investigationsApi.get(investigationId),
        investigationsApi.listActions(investigationId),
        investigationsApi.listSignatures(investigationId),
        investigationsApi.getAuditLog(investigationId).catch(() => [] as AuditLogEntry[]),
      ]);
      setInvestigation(inv);
      setActions(acts);
      setSignatures(sigs);
      setAuditLog(audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load investigation');
    } finally {
      setLoading(false);
    }
  }, [investigationId]);

  useEffect(() => {
    if (!authLoading && user && investigationId) {
      fetchAll();
    }
  }, [authLoading, user, investigationId, fetchAll]);

  // Handlers
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await investigationsApi.analyze(investigationId);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSign = async (discipline: string) => {
    setSigning(discipline);
    try {
      await investigationsApi.signDiscipline(investigationId, discipline);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-off failed');
    } finally {
      setSigning(null);
    }
  };

  const handleAddAction = (discipline: string) => {
    setActionDiscipline(discipline);
    setActionDialogOpen(true);
  };

  const handleActionSubmit = async (data: { discipline: string; description: string; priority?: string; due_date?: string }) => {
    await investigationsApi.createAction(investigationId, data);
    await fetchAll();
  };

  const handleTransition = async () => {
    if (!investigation) return;
    const next = getNextStatus(investigation.status);
    if (!next) return;

    setTransitioning(true);
    try {
      const result = await investigationsApi.transitionStatus(investigationId, next);
      if (!result.transition_allowed) {
        setError(result.validation_errors?.join('. ') || result.message);
      } else {
        await fetchAll();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await investigationsApi.downloadReport(investigationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const result = await investigationsApi.createShareLink(investigationId);
      setShareUrl(result.share_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 bg-[#1F2937] rounded" />
          <div className="h-8 w-96 bg-[#1F2937] rounded" />
          <div className="h-64 bg-[#1F2937] rounded-lg" />
        </div>
      </div>
    );
  }

  if (error && !investigation) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-6 text-center">
          <p className="text-danger mb-4">{error}</p>
          <Button variant="ghost" onClick={() => router.push('/investigations')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Investigations
          </Button>
        </div>
      </div>
    );
  }

  if (!investigation) return null;

  const nextStatus = getNextStatus(investigation.status);

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Back */}
      <Link
        href="/investigations"
        className="inline-flex items-center text-sm text-[#94A3B8] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        All Investigations
      </Link>

      {/* Error banner */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6 text-sm text-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-danger/60 hover:text-danger ml-4">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-accent-500">{investigation.investigation_number}</span>
            <StatusBadge status={investigation.status} />
            <SeverityBadge severity={investigation.severity} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{investigation.title}</h1>
          <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
            {investigation.customer_oem && <span>{investigation.customer_oem}</span>}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {daysOpen(investigation.created_at, investigation.closed_at)} days open
            </span>
            <span>Created {formatDate(investigation.created_at)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Transition */}
          {nextStatus && (
            <Button
              size="sm"
              className="bg-accent-500 hover:bg-accent-600 text-white"
              onClick={handleTransition}
              disabled={transitioning}
            >
              {transitioning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Advance to {formatStatus(nextStatus)}
            </Button>
          )}

          {/* Generate Report */}
          <Button
            size="sm"
            variant="ghost"
            className="text-[#94A3B8] hover:text-white"
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            {generatingReport ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Report
          </Button>

          {/* Share */}
          <Button
            size="sm"
            variant="ghost"
            className="text-[#94A3B8] hover:text-white"
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            Share
          </Button>
        </div>
      </div>

      {/* Share URL */}
      {shareUrl && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white mb-1">Shareable link created</p>
            <code className="text-xs text-[#94A3B8] break-all">{shareUrl}</code>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopyShareUrl}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main Content: Stepper + Sidebar */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mb-8">
        {/* Discipline Stepper */}
        <DisciplineStepper
          investigation={investigation}
          actions={actions}
          signatures={signatures}
          onAnalyze={handleAnalyze}
          onSign={handleSign}
          onAddAction={handleAddAction}
          analyzing={analyzing}
          signing={signing}
        />

        {/* Sidebar Info + Comments */}
        <div className="space-y-4">
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Investigation Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Status</span>
                <StatusBadge status={investigation.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Severity</span>
                <SeverityBadge severity={investigation.severity} />
              </div>
              {investigation.customer_oem && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Customer</span>
                  <span className="text-[#94A3B8]">{investigation.customer_oem}</span>
                </div>
              )}
              {investigation.product_part_number && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Part #</span>
                  <span className="text-[#94A3B8]">{investigation.product_part_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#64748B]">Created</span>
                <span className="text-[#94A3B8]">{formatDate(investigation.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Days Open</span>
                <span className="text-[#94A3B8]">{daysOpen(investigation.created_at, investigation.closed_at)}d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Signatures</span>
                <span className="text-[#94A3B8]">{signatures.length}/8</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Actions Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Total</span>
                <span className="text-[#94A3B8]">{actions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Open</span>
                <span className="text-warning">{actions.filter((a) => a.status === 'open').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">In Progress</span>
                <span className="text-accent-500">{actions.filter((a) => a.status === 'in_progress').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Complete</span>
                <span className="text-success">{actions.filter((a) => a.status === 'complete').length}</span>
              </div>
            </div>
          </div>

          {/* Comment Panel */}
          <CommentPanel
            investigationId={investigationId}
            currentUserId={user.id}
            isLeadOrChampion={
              investigation.team_lead_user_id === user.id ||
              investigation.champion_user_id === user.id
            }
          />
        </div>
      </div>

      {/* Tabs: Actions + History */}
      <Tabs defaultValue="actions" className="mt-8">
        <TabsList className="bg-brand-800 border border-[#1F2937]">
          <TabsTrigger value="actions" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-[#94A3B8]">
            <ClipboardList className="w-4 h-4 mr-2" />
            All Actions ({actions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#1F2937] data-[state=active]:text-white text-[#94A3B8]">
            <Clock className="w-4 h-4 mr-2" />
            History ({auditLog.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="mt-4">
          {actions.length === 0 ? (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-8 text-center">
              <p className="text-sm text-[#94A3B8]">No actions yet. Add actions from the discipline steps above.</p>
            </div>
          ) : (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1F2937]">
                    <th className="text-left text-xs text-[#64748B] font-medium p-4">Discipline</th>
                    <th className="text-left text-xs text-[#64748B] font-medium p-4">Description</th>
                    <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden md:table-cell">Priority</th>
                    <th className="text-left text-xs text-[#64748B] font-medium p-4">Status</th>
                    <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden md:table-cell">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action) => (
                    <tr key={action.id} className="border-b border-[#1F2937] last:border-0">
                      <td className="p-4">
                        <Badge variant="default" className="font-mono">{action.discipline}</Badge>
                      </td>
                      <td className="p-4 text-sm text-white max-w-xs truncate">{action.description}</td>
                      <td className="p-4 hidden md:table-cell">
                        {action.priority ? (
                          <Badge
                            variant={action.priority === 'P1' ? 'danger' : action.priority === 'P2' ? 'warning' : 'default'}
                          >
                            {action.priority}
                          </Badge>
                        ) : (
                          <span className="text-[#64748B]">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            action.status === 'complete'
                              ? 'success'
                              : action.status === 'in_progress'
                              ? 'accent'
                              : 'default'
                          }
                        >
                          {action.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[#64748B] hidden md:table-cell">
                        {action.due_date || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {auditLog.length === 0 ? (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-8 text-center">
              <p className="text-sm text-[#94A3B8]">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-4 space-y-3">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#374151] mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{entry.event_detail || entry.event_type}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {entry.discipline && (
                        <Badge variant="default" className="text-[10px] py-0">{entry.discipline}</Badge>
                      )}
                      <span className="text-xs text-[#64748B]">{timeAgo(entry.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Action Dialog */}
      <AddActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        discipline={actionDiscipline}
        onSubmit={handleActionSubmit}
      />
    </div>
  );
}
