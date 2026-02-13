/**
 * Generate a human-readable display ID from analysis/spec metadata.
 *
 * Format: {PREFIX}-{YYYYMMDD}-{SHORT_HASH}
 *   - FA = Failure Analysis, MS = Material Spec
 *   - Date from created_at
 *   - 4-char hash from the UUID for uniqueness
 *
 * Examples:
 *   FA-20260211-8dbc
 *   MS-20260210-a3f1
 */
export function displayId(
  type: 'failure' | 'spec',
  id: string,
  createdAt?: string | null,
): string {
  const prefix = type === 'failure' ? 'FA' : 'MS';

  let datePart = '00000000';
  if (createdAt) {
    try {
      const d = new Date(createdAt);
      if (!Number.isNaN(d.getTime())) {
        datePart =
          String(d.getFullYear()) +
          String(d.getMonth() + 1).padStart(2, '0') +
          String(d.getDate()).padStart(2, '0');
      }
    } catch {
      // keep default
    }
  }

  // First 4 hex chars from the UUID (strip hyphens)
  const shortHash = id.replace(/-/g, '').slice(0, 4);

  return `${prefix}-${datePart}-${shortHash}`;
}
