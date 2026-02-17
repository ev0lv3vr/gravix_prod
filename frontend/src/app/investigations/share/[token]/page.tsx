'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { investigationsApi, type SharedInvestigation } from '@/lib/investigations';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/components/investigations/InvestigationHelpers';
import { StatusBadge, SeverityBadge } from '@/components/investigations/StatusBadge';
import type { InvestigationStatus, InvestigationSeverity } from '@/lib/investigations';
import { Lock } from 'lucide-react';

export default function SharedInvestigationPage() {
  const params = useParams();
  const token = params.token as string;

  const [investigation, setInvestigation] = useState<SharedInvestigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    investigationsApi
      .getShared(token)
      .then(setInvestigation)
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-6">
          <div className="h-8 w-64 bg-[#1F2937] rounded" />
          <div className="h-6 w-96 bg-[#1F2937] rounded" />
          <div className="h-48 bg-[#1F2937] rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6">
        <div className="text-center">
          <Lock className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Link unavailable</h1>
          <p className="text-sm text-[#94A3B8]">
            {error === 'Share link has expired'
              ? 'This shared link has expired. Ask the investigation owner for a new link.'
              : 'This investigation link is invalid or has been removed.'}
          </p>
        </div>
      </div>
    );
  }

  if (!investigation) return null;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Header bar */}
      <header className="bg-[#0A1628] border-b border-[#1F2937] py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <span className="text-lg font-bold font-mono text-white">GRAVIX</span>
          <Badge variant="default" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Read-only
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-4xl">
        {/* Investigation header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-accent-500">{investigation.investigation_number}</span>
            <StatusBadge status={investigation.status as InvestigationStatus} />
            <SeverityBadge severity={investigation.severity as InvestigationSeverity} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{investigation.title}</h1>
          <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
            {investigation.customer_oem && <span>{investigation.customer_oem}</span>}
            <span>Created {formatDate(investigation.created_at)}</span>
            {investigation.closed_at && <span>Closed {formatDate(investigation.closed_at)}</span>}
          </div>
        </div>

        {/* Problem description */}
        {investigation.problem_description && (
          <Section title="Problem Description">
            <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">{investigation.problem_description}</p>
          </Section>
        )}

        {/* Root Causes */}
        {investigation.root_causes && investigation.root_causes.length > 0 && (
          <Section title="Root Cause Analysis">
            <div className="space-y-2">
              {investigation.root_causes.map((rc, i) => (
                <div key={i} className="bg-[#0A1628] border border-[#1F2937] rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-accent-500">#{i + 1}</span>
                    <span className="text-sm font-medium text-white">{rc.cause}</span>
                    <Badge variant="accent" className="text-[10px] py-0 ml-auto">
                      {Math.round(rc.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-[#94A3B8]">{rc.explanation}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 5-Why Chain */}
        {investigation.five_why_chain && investigation.five_why_chain.length > 0 && (
          <Section title="5-Why Chain">
            <div className="space-y-1">
              {investigation.five_why_chain.map((item, i) => (
                <p key={i} className="text-sm text-[#94A3B8]">
                  <span className="text-accent-500 font-mono">Why {i + 1}:</span>{' '}
                  {item.why || item.answer}
                </p>
              ))}
            </div>
          </Section>
        )}

        {/* Escape Point */}
        {investigation.escape_point && (
          <Section title="Escape Point">
            <p className="text-sm text-[#94A3B8]">{investigation.escape_point}</p>
          </Section>
        )}

        {/* Actions */}
        {investigation.actions && investigation.actions.length > 0 && (
          <Section title="Actions">
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1F2937]">
                    <th className="text-left text-xs text-[#64748B] font-medium p-3">Discipline</th>
                    <th className="text-left text-xs text-[#64748B] font-medium p-3">Description</th>
                    <th className="text-left text-xs text-[#64748B] font-medium p-3">Status</th>
                    <th className="text-left text-xs text-[#64748B] font-medium p-3 hidden md:table-cell">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {investigation.actions.map((a, i) => (
                    <tr key={i} className="border-b border-[#1F2937] last:border-0">
                      <td className="p-3">
                        <Badge variant="default" className="font-mono">{a.discipline}</Badge>
                      </td>
                      <td className="p-3 text-sm text-white">{a.description}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            a.status === 'complete'
                              ? 'success'
                              : a.status === 'in_progress'
                              ? 'accent'
                              : 'default'
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-[#64748B] hidden md:table-cell">{a.due_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Closure Summary */}
        {investigation.closure_summary && (
          <Section title="Closure Summary">
            <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">{investigation.closure_summary}</p>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#1F2937] text-center">
          <p className="text-xs text-[#64748B]">
            Shared via Gravix Quality. This is a read-only view.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-4">{children}</div>
    </div>
  );
}
