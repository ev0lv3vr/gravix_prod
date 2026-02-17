'use client';

import { Badge } from '@/components/ui/badge';
import type { InvestigationStatus, InvestigationSeverity } from '@/lib/investigations';

const STATUS_CONFIG: Record<InvestigationStatus, { label: string; variant: 'accent' | 'warning' | 'info' | 'success' | 'danger' | 'default' }> = {
  open: { label: 'Open', variant: 'accent' },
  containment: { label: 'Containment', variant: 'warning' },
  investigating: { label: 'Investigating', variant: 'info' },
  corrective_action: { label: 'Corrective Action', variant: 'warning' },
  verification: { label: 'Verification', variant: 'accent' },
  closed: { label: 'Closed', variant: 'success' },
};

const SEVERITY_CONFIG: Record<InvestigationSeverity, { label: string; variant: 'danger' | 'warning' | 'default' }> = {
  critical: { label: 'Critical', variant: 'danger' },
  major: { label: 'Major', variant: 'warning' },
  minor: { label: 'Minor', variant: 'default' },
};

export function StatusBadge({ status }: { status: InvestigationStatus }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SeverityBadge({ severity }: { severity: InvestigationSeverity }) {
  const config = SEVERITY_CONFIG[severity] || { label: severity, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function formatStatus(status: string): string {
  return STATUS_CONFIG[status as InvestigationStatus]?.label || status;
}

export function formatSeverity(severity: string): string {
  return SEVERITY_CONFIG[severity as InvestigationSeverity]?.label || severity;
}
