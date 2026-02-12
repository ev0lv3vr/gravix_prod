'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

type SpecDetail = any;

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function SpecHistoryDetailPage({ params }: { params: { id: string } }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<SpecDetail | null>(null);

  useEffect(() => {
    if (!authLoading && !authUser) {
      window.location.href = '/';
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    if (authLoading || !authUser) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getSpecRequest(params.id);
        if (!cancelled) setSpec(data as any);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load spec');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser, params.id]);

  if (authLoading || !authUser) return null;

  const substrateA = spec?.substrate_a ?? spec?.substrateA;
  const substrateB = spec?.substrate_b ?? spec?.substrateB;
  const status = spec?.status;
  const confidence = spec?.confidence_score ?? spec?.confidenceScore;
  const recommended = spec?.recommended_spec ?? spec?.recommendedSpec;
  const pdfUrl = api.getSpecPdfUrl(params.id);

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Spec Request</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{substrateA && substrateB ? `${substrateA} → ${substrateB}` : '—'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          >
            Download PDF
          </Button>
          <Link href="/history" className="text-sm text-accent-500 hover:underline">
            Back to history
          </Link>
        </div>
      </div>

      {loading && <div className="text-sm text-[#94A3B8]">Loading…</div>}
      {error && <div className="text-sm text-warning">{error}</div>}

      {!loading && !error && spec && (
        <div className="space-y-6">
          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-[#64748B]">Status</div>
                <div className="text-sm text-white mt-1">{status ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B]">Confidence</div>
                <div className="text-sm text-white mt-1">{typeof confidence === 'number' ? `${Math.round(confidence * 100)}%` : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B]">Created</div>
                <div className="text-sm text-white mt-1">{formatDateTime(spec?.created_at ?? spec?.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Recommended Spec</h2>
            {recommended ? (
              <div className="space-y-2">
                {recommended.title && <div className="text-sm text-white">{recommended.title}</div>}
                {recommended.chemistry && <div className="text-sm text-[#94A3B8]">Chemistry: {recommended.chemistry}</div>}
                {recommended.rationale && <div className="text-sm text-[#94A3B8]">{recommended.rationale}</div>}
              </div>
            ) : (
              <div className="text-sm text-[#94A3B8]">No recommendation available yet.</div>
            )}
          </div>

          {(spec?.application_guidance || spec?.applicationGuidance) && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Application Guidance</h2>
              <pre className="text-sm text-[#94A3B8] whitespace-pre-wrap">
                {JSON.stringify(spec?.application_guidance ?? spec?.applicationGuidance, null, 2)}
              </pre>
            </div>
          )}

          {(spec?.warnings?.length ?? 0) > 0 && (
            <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Warnings</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-[#94A3B8]">
                {spec.warnings.map((w: string, idx: number) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
