'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

export default function InvestigationReportPage() {
  const params = useParams();
  const sp = useSearchParams();
  const id = params.id as string;
  const template = sp.get('template') || 'generic_8d';
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => `${API_URL}/api/investigations/${id}/report?template=${encodeURIComponent(template)}`,[id,template]);

  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const token = (() => {
          const key = Object.keys(localStorage).find(k => k.includes('auth-token'));
          if (!key) return null;
          try { return JSON.parse(localStorage.getItem(key) || '{}').access_token || null; } catch { return null; }
        })();
        const res = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to load PDF (${res.status})`);
        const blob = await res.blob();
        if (disposed) return;
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e: any) {
        if (!disposed) setError(e?.message || 'Failed to load report');
      }
    })();
    return () => {
      disposed = true;
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  if (error) return <div className="p-8 text-sm text-red-400">{error}</div>;
  if (!pdfUrl) return <div className="p-8 text-sm text-text-secondary">Generating report…</div>;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <iframe title="8D Report" src={pdfUrl} className="w-full h-full border-0" />
    </div>
  );
}
