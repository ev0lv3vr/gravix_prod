type ExpertReviewKind = 'spec' | 'analysis';

interface ExpertReviewMailtoOptions {
  kind: ExpertReviewKind;
  id?: string | null;
  title?: string;
}

const REVIEW_LABELS: Record<ExpertReviewKind, string> = {
  spec: 'Spec',
  analysis: 'Analysis',
};

export function buildExpertReviewMailto({
  kind,
  id,
  title,
}: ExpertReviewMailtoOptions): string {
  const label = REVIEW_LABELS[kind];
  const subject = `Expert Review Request - ${label}${id ? ` ${id}` : ''}`;
  const bodyLines = [
    'Hi Gravix Team,',
    `I would like to request an expert review of this ${kind === 'spec' ? 'specification' : 'failure analysis'}.`,
    id ? `${label} ID: ${id}` : null,
    title ? `Summary: ${title}` : null,
    'Please let me know what additional context would help.',
  ].filter(Boolean);

  const params = new URLSearchParams({
    subject,
    body: bodyLines.join('\n\n'),
  });

  return `mailto:support@gravix.com?${params.toString()}`;
}
