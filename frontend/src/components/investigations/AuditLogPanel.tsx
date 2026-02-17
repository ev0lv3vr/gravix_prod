'use client';

import type { AuditLogEntry } from '@/lib/investigations';
import { timeAgo } from './InvestigationHelpers';
import { getTeamMemberName } from '@/lib/mock-investigations';
import { Badge } from '@/components/ui/badge';
import { X, History, User } from 'lucide-react';

interface AuditLogPanelProps {
  entries: AuditLogEntry[];
  onClose: () => void;
}

const EVENT_ICONS: Record<string, string> = {
  investigation_created: '📋',
  status_changed: '🔄',
  team_assigned: '👤',
  discipline_signed: '✅',
  action_created: '📝',
  action_completed: '✓',
  attachment_uploaded: '📎',
  ai_analysis: '🤖',
  comment_added: '💬',
  share_created: '🔗',
};

export function AuditLogPanel({ entries, onClose }: AuditLogPanelProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-end">
      <div className="bg-brand-900 border-l border-[#1F2937] h-full w-full max-w-lg overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-brand-900 border-b border-[#1F2937] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-accent-500" />
            <h2 className="text-lg font-semibold text-white">Audit Log</h2>
            <Badge variant="outline" className="text-[10px]">{entries.length}</Badge>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entries */}
        <div className="px-6 py-4">
          {entries.length === 0 ? (
            <p className="text-sm text-[#64748B] text-center py-8">No activity recorded yet.</p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-[#1F2937]" />

              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex gap-4 relative">
                    {/* Dot */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-800 border border-[#1F2937] flex items-center justify-center text-xs z-10">
                      {EVENT_ICONS[entry.event_type] || '•'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <p className="text-sm text-white leading-relaxed">
                        {entry.event_detail || entry.event_type.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {entry.actor_user_id && (
                          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                            <User className="w-2.5 h-2.5" />
                            {getTeamMemberName(entry.actor_user_id)}
                          </span>
                        )}
                        {entry.discipline && (
                          <Badge variant="default" className="text-[9px] py-0">
                            {entry.discipline}
                          </Badge>
                        )}
                        <span className="text-[10px] text-[#64748B]">
                          {timeAgo(entry.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
