'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Search } from 'lucide-react';

type LogRow = Awaited<ReturnType<typeof api.getAdminRequestLogs>>[number];

function StatusCodeBadge({ code }: { code: number | null | undefined }) {
  if (!code) return <span className="text-text-tertiary text-xs">—</span>;
  const color =
    code < 300
      ? 'text-success'
      : code < 400
      ? 'text-info'
      : code < 500
      ? 'text-warning'
      : 'text-danger';
  return <span className={`font-mono text-xs ${color}`}>{code}</span>;
}

function formatTime(d: string | null | undefined) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [pathFilter, setPathFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadLogs = useCallback((filter?: string) => {
    setLoading(true);
    api
      .getAdminRequestLogs(filter || undefined)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilter = (value: string) => {
    setPathFilter(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadLogs(value), 300);
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-mono text-white">Request Logs</h1>
        <span className="text-xs text-text-tertiary font-mono">{logs.length} entries</span>
      </div>

      {/* Filter */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Filter by path…"
          value={pathFilter}
          onChange={(e) => handleFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-brand-800 border border-brand-600 rounded text-sm text-white placeholder:text-text-tertiary focus:outline-none focus:border-accent-500"
        />
      </div>

      {/* Table */}
      <div className="bg-brand-800 border border-brand-600 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-600">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Time</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Method</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Path</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">User</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary text-sm">
                  Loading…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary text-sm">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={log.id ?? i} className="border-b border-brand-700 hover:bg-brand-700/30">
                  <td className="px-4 py-3 text-text-tertiary text-xs whitespace-nowrap">{formatTime(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-accent-500">{log.method || '—'}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary max-w-[200px] truncate">
                    {log.path || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusCodeBadge code={log.status_code} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                    {log.duration_ms != null ? `${log.duration_ms}ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-white font-mono text-xs">{log.user_email || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
