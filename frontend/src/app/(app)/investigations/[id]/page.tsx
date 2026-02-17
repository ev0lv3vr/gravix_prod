'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  investigationsApi,
  type Investigation,
  type InvestigationAction,
  type InvestigationSignature,
  type AuditLogEntry,
  type InvestigationAttachment,
} from '@/lib/investigations';
import {
  MOCK_INVESTIGATION_DETAIL,
  MOCK_ACTIONS,
  MOCK_SIGNATURES,
  MOCK_AUDIT_LOG,
  MOCK_ATTACHMENTS,
  isValidTransition,
} from '@/lib/mock-investigations';
import { SeverityBadge, StatusBadge } from '@/components/investigations/StatusBadge';
import { InvestigationSidebar } from '@/components/investigations/InvestigationSidebar';
import { HorizontalStepper } from '@/components/investigations/HorizontalStepper';
import { DisciplineContent } from '@/components/investigations/DisciplineContent';
import { AddActionDialog } from '@/components/investigations/AddActionDialog';
import { CommentPanel } from '@/components/investigations/CommentPanel';
import { AuditLogPanel } from '@/components/investigations/AuditLogPanel';

const PhotoAnnotation = dynamic(
  () => import('@/components/investigations/PhotoAnnotation'),
  { ssr: false }
);

import { formatStatus } from '@/components/investigations/InvestigationHelpers';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
} from 'lucide-react';

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const investigationId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data state
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [actions, setActions] = useState<InvestigationAction[]>([]);
  const [signatures, setSignatures] = useState<InvestigationSignature[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [attachments, setAttachments] = useState<InvestigationAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeDiscipline, setActiveDiscipline] = useState('D1');
  const [analyzing, setAnalyzing] = useState(false);
  const [signing, setSigning] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDiscipline, setActionDiscipline] = useState('D3');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [annotatingAttachment, setAnnotatingAttachment] = useState<InvestigationAttachment | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, acts, sigs, audit, atts] = await Promise.all([
        investigationsApi.get(investigationId).catch(() => null),
        investigationsApi.listActions(investigationId).catch(() => [] as InvestigationAction[]),
        investigationsApi.listSignatures(investigationId).catch(() => [] as InvestigationSignature[]),
        investigationsApi.getAuditLog(investigationId).catch(() => [] as AuditLogEntry[]),
        investigationsApi.listAttachments(investigationId).catch(() => [] as InvestigationAttachment[]),
      ]);

      // Use real data or fall back to mock
      setInvestigation(inv || MOCK_INVESTIGATION_DETAIL);
      setActions(acts.length > 0 ? acts : MOCK_ACTIONS);
      setSignatures(sigs.length > 0 ? sigs : MOCK_SIGNATURES);
      setAuditLog(audit.length > 0 ? audit : MOCK_AUDIT_LOG);
      setAttachments(atts.length > 0 ? atts : MOCK_ATTACHMENTS);
    } catch (err) {
      // Fallback to mock data
      setInvestigation(MOCK_INVESTIGATION_DETAIL);
      setActions(MOCK_ACTIONS);
      setSignatures(MOCK_SIGNATURES);
      setAuditLog(MOCK_AUDIT_LOG);
      setAttachments(MOCK_ATTACHMENTS);
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

  const handleActionSubmit = async (data: {
    discipline: string;
    description: string;
    priority?: string;
    due_date?: string;
  }) => {
    await investigationsApi.createAction(investigationId, data);
    await fetchAll();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!investigation) return;

    if (!isValidTransition(investigation.status, newStatus as typeof investigation.status)) {
      setError(
        `Cannot transition from "${formatStatus(investigation.status)}" to "${formatStatus(newStatus)}". Status must advance sequentially.`
      );
      return;
    }

    setTransitioning(true);
    try {
      const result = await investigationsApi.transitionStatus(investigationId, newStatus);
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

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await investigationsApi.uploadAttachment(investigationId, file);
      await fetchAll();
    } catch {
      // ignore
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 bg-[#1F2937] rounded" />
          <div className="h-8 w-96 bg-[#1F2937] rounded" />
          <div className="h-96 bg-[#1F2937] rounded-lg" />
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

  return (
    <div className="min-h-screen">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top bar: back + title + report button */}
      <div className="border-b border-[#1F2937] bg-[#0A1628]">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-4">
              <Link
                href="/investigations"
                className="text-[#94A3B8] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-accent-500">
                    {investigation.investigation_number}
                  </span>
                  <SeverityBadge severity={investigation.severity} />
                  <StatusBadge status={investigation.status} />
                </div>
                <h1 className="text-lg font-bold text-white">{investigation.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                  <Download className="w-4 h-4 mr-2" />
                )}
                PDF Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 bg-danger/10 border border-danger/20 rounded-lg p-3 text-sm text-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-danger/60 hover:text-danger ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <InvestigationSidebar
          investigation={investigation}
          actions={actions}
          signatures={signatures}
          attachments={attachments}
          onStatusChange={handleStatusChange}
          onShowAuditLog={() => setShowAuditLog(true)}
          onShare={handleShare}
          onUploadPhoto={handleUploadPhoto}
          shareUrl={shareUrl}
          transitioning={transitioning}
          sharing={sharing}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Horizontal Stepper */}
          <HorizontalStepper
            activeDiscipline={activeDiscipline}
            onSelect={setActiveDiscipline}
            signatures={signatures}
          />

          {/* Discipline Content */}
          <div className="bg-brand-800 border-b border-[#1F2937] min-h-[400px]">
            <DisciplineContent
              discipline={activeDiscipline}
              investigation={investigation}
              actions={actions}
              signatures={signatures}
              analyzing={analyzing}
              signing={signing}
              onAnalyze={handleAnalyze}
              onSign={handleSign}
              onAddAction={handleAddAction}
            />
          </div>

          {/* Comments (collapsible) */}
          <div className="border-t border-[#1F2937]">
            <button
              onClick={() => setShowComments(!showComments)}
              className="w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Comments — {activeDiscipline}
              {showComments ? (
                <ChevronUp className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-auto" />
              )}
            </button>
            {showComments && (
              <div className="px-6 pb-6">
                <CommentPanel
                  investigationId={investigationId}
                  currentUserId={user.id}
                  isLeadOrChampion={
                    investigation.team_lead_user_id === user.id ||
                    investigation.champion_user_id === user.id
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Panel (slide-in) */}
      {showAuditLog && (
        <AuditLogPanel entries={auditLog} onClose={() => setShowAuditLog(false)} />
      )}

      {/* Photo Annotation Modal */}
      {annotatingAttachment && (
        <PhotoAnnotation
          attachment={annotatingAttachment}
          investigationId={investigationId}
          onClose={() => setAnnotatingAttachment(null)}
          onSaved={() => {
            setAnnotatingAttachment(null);
            fetchAll();
          }}
        />
      )}

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
