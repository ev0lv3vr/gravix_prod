'use client';

import type { Investigation, InvestigationAction, InvestigationSignature, InvestigationAttachment } from '@/lib/investigations';
import { StatusBadge } from './StatusBadge';
import { formatStatus, STATUS_ORDER, daysOpen, formatDate } from './InvestigationHelpers';
import { getTeamMemberName } from '@/lib/mock-investigations';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  AlertTriangle,
  Plus,
  History,
  Share2,
  Loader2,
  Image as ImageIcon,
  Copy,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface InvestigationSidebarProps {
  investigation: Investigation;
  actions: InvestigationAction[];
  signatures: InvestigationSignature[];
  attachments: InvestigationAttachment[];
  onStatusChange: (newStatus: string) => Promise<void>;
  onShowAuditLog: () => void;
  onShare: () => void;
  onUploadPhoto: () => void;
  shareUrl: string | null;
  transitioning?: boolean;
  sharing: boolean;
}

export function InvestigationSidebar({
  investigation,
  actions,
  signatures,
  attachments,
  onStatusChange,
  onShowAuditLog,
  onShare,
  onUploadPhoto,
  shareUrl,
  sharing,
}: InvestigationSidebarProps) {

  const openActions = actions.filter((a) => a.status === 'open' || a.status === 'in_progress').length;
  const overdueActions = actions.filter(
    (a) => a.status !== 'complete' && a.due_date && new Date(a.due_date).getTime() < Date.now()
  ).length;

  // Team members from investigation
  const teamMembers = [
    { userId: investigation.team_lead_user_id, role: 'Team Lead' },
    { userId: investigation.champion_user_id, role: 'Champion' },
    { userId: investigation.approver_user_id, role: 'Approver' },
  ].filter((m) => m.userId);

  const photoAttachments = attachments.filter((a) => a.content_type.startsWith('image/'));

  return (
    <aside className="w-full lg:w-[240px] lg:flex-shrink-0 bg-brand-900 lg:border-r border-[#1F2937] lg:min-h-[calc(100vh-64px)] lg:sticky lg:top-16">
      <div className="p-4 space-y-5 lg:space-y-6">
        {/* Status */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">Status</p>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={investigation.status} />
          </div>
          {investigation.status !== 'closed' && (
            <Select
              value=""
              onValueChange={async (v) => {
                if (v) await onStatusChange(v);
              }}
            >
              <SelectTrigger className="bg-brand-800 border-[#1F2937] text-white text-xs h-8">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.filter((s) => s !== investigation.status).map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {formatStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Team Members */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">
            Team
          </p>
          <div className="space-y-2">
            {teamMembers.map(({ userId, role }) => (
              <div key={userId} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center text-[10px] text-accent-500 font-semibold flex-shrink-0">
                  {getTeamMemberName(userId).charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white truncate">{getTeamMemberName(userId)}</p>
                  <p className="text-[10px] text-[#64748B]">{role}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1 text-xs text-accent-500 hover:text-accent-400 mt-2 transition-colors">
            <UserPlus className="w-3 h-3" />
            Add Member
          </button>
        </div>

        {/* Actions Summary */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">
            Actions
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Open</span>
              <span className={openActions > 0 ? 'text-warning font-semibold' : 'text-[#64748B]'}>
                {openActions}
              </span>
            </div>
            {overdueActions > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-danger flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
                <span className="text-danger font-semibold">{overdueActions}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Complete</span>
              <span className="text-success">{actions.filter((a) => a.status === 'complete').length}</span>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">
            Photos
          </p>
          {photoAttachments.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 mb-2">
              {photoAttachments.slice(0, 6).map((att) => (
                <div
                  key={att.id}
                  className="aspect-square rounded bg-brand-800 border border-[#1F2937] overflow-hidden flex items-center justify-center"
                >
                  {att.file_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={att.file_url} alt={att.filename} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#374151]" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-[#64748B] mb-2">No photos yet</p>
          )}
          <button
            onClick={onUploadPhoto}
            className="flex items-center gap-1 text-xs text-accent-500 hover:text-accent-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Photo
          </button>
        </div>

        {/* Audit Log */}
        <div>
          <button
            onClick={onShowAuditLog}
            className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-white transition-colors w-full"
          >
            <History className="w-3.5 h-3.5" />
            Audit Log
            <ExternalLink className="w-3 h-3 ml-auto" />
          </button>
        </div>

        {/* Share */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">
            Share
          </p>
          {shareUrl ? (
            <div className="space-y-2">
              <div className="bg-success/10 border border-success/20 rounded p-2">
                <p className="text-[10px] text-success flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3 h-3" />
                  Link created
                </p>
                <code className="text-[9px] text-[#94A3B8] break-all block">{shareUrl}</code>
              </div>
              <button
                onClick={() => {
                  if (shareUrl) navigator.clipboard.writeText(shareUrl);
                }}
                className="flex items-center gap-1 text-xs text-accent-500 hover:text-accent-400 transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copy Link
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-[#94A3B8] hover:text-white text-xs h-7 px-2"
              onClick={onShare}
              disabled={sharing}
            >
              {sharing ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Share2 className="w-3 h-3 mr-1" />
              )}
              Generate Link
            </Button>
          )}
        </div>

        {/* Meta */}
        <div className="text-[10px] text-[#64748B] space-y-1 pt-2 border-t border-[#1F2937]">
          <div className="flex justify-between">
            <span>Created</span>
            <span>{formatDate(investigation.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Days Open</span>
            <span>{daysOpen(investigation.created_at, investigation.closed_at)}d</span>
          </div>
          <div className="flex justify-between">
            <span>Signatures</span>
            <span>{signatures.length}/8</span>
          </div>
          {investigation.report_template && (
            <div className="flex justify-between">
              <span>Template</span>
              <span className="capitalize">{investigation.report_template.replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
