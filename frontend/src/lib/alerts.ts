/**
 * Pattern Alerts types and API client.
 * Enterprise plan only.
 */

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AlertSeverity = 'critical' | 'warning' | 'informational';
export type AlertStatus = 'active' | 'acknowledged';

export interface PatternAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  status: AlertStatus;
  detected_at: string;
  stats: string;
  hypothesis?: string | null;
  recommendations?: string | null;
  affected_organizations?: number | null;
  geographic_cluster?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  acknowledge_note?: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window !== 'undefined') {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const ref = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || '';
      if (ref) {
        const raw = localStorage.getItem(`sb-${ref}-auth-token`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const token = parsed?.access_token;
          const expiresAt = parsed?.expires_at;
          if (token && (!expiresAt || expiresAt > Math.floor(Date.now() / 1000) + 60)) {
            return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
          }
        }
      }
    } catch { /* fall through */ }
  }

  if (!supabase) return { 'Content-Type': 'application/json' };
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const alertsApi = {
  list(params?: { status?: AlertStatus | 'all' }): Promise<PatternAlert[]> {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    const q = qs.toString();
    return request<PatternAlert[]>(`/v1/alerts${q ? `?${q}` : ''}`).catch(() => []);
  },

  acknowledge(id: string, note?: string): Promise<PatternAlert> {
    return request<PatternAlert>(`/v1/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ note: note || '' }),
    });
  },
};
