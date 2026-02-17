import type { InvestigationStatus } from '@/lib/investigations';

/**
 * Compute the number of full calendar days an investigation has been open.
 */
export function daysOpen(createdAt: string, closedAt?: string | null): number {
  const start = new Date(createdAt).getTime();
  const end = closedAt ? new Date(closedAt).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

/**
 * Format an ISO timestamp to a short human-readable date.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Relative time (e.g. "3 hours ago")
 */
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

/**
 * Map status to the next available status for transition.
 */
export const STATUS_ORDER: InvestigationStatus[] = [
  'open',
  'containment',
  'investigating',
  'corrective_action',
  'verification',
  'closed',
];

export function getNextStatus(current: InvestigationStatus): InvestigationStatus | null {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

/**
 * Human-readable status label.
 */
export function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    open: 'Open',
    containment: 'Containment',
    investigating: 'Investigating',
    corrective_action: 'Corrective Action',
    verification: 'Verification',
    closed: 'Closed',
  };
  return labels[status] || status;
}

/**
 * 8D Discipline definitions for the stepper.
 */
export const DISCIPLINES = [
  { key: 'D1', title: 'D1 — Establish the Team', description: 'Identify team members with relevant expertise.' },
  { key: 'D2', title: 'D2 — Describe the Problem', description: '5W2H problem description: Who, What, Where, When, Why, How, How Many.' },
  { key: 'D3', title: 'D3 — Interim Containment', description: 'Immediate actions to protect the customer.' },
  { key: 'D4', title: 'D4 — Root Cause Analysis', description: 'Identify and verify root cause(s) using AI analysis.' },
  { key: 'D5', title: 'D5 — Corrective Actions', description: 'Define and implement permanent corrective actions.' },
  { key: 'D6', title: 'D6 — Validate Corrections', description: 'Verify that corrective actions resolve the problem.' },
  { key: 'D7', title: 'D7 — Prevent Recurrence', description: 'Update systems and processes to prevent recurrence.' },
  { key: 'D8', title: 'D8 — Closure & Recognition', description: 'Close investigation, recognize team, document lessons learned.' },
] as const;
