import { supabase } from './supabase';
import type { FailureAnalysis, SpecRequest, Case, User } from './types';

/**
 * API error with HTTP status code preserved.
 * Allows callers to distinguish 429 (rate limit) / 403 (plan gate) from other errors.
 */
export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

// Feedback types
export type FeedbackSubmitData = {
  analysis_id?: string;
  spec_id?: string;
  was_helpful: boolean;
  root_cause_confirmed?: number;
  outcome?: string;
  recommendation_implemented?: string[];
  actual_root_cause?: string;
  what_worked?: string;
  what_didnt_work?: string;
  time_to_resolution?: string;
  estimated_cost_saved?: number;
  substrate_corrections?: { field: string; original?: string; corrected: string }[];
  feedback_source?: string;
};

export type FeedbackCreateResponse = {
  id: string;
  message: string;
  cases_improved: number;
};

export type FeedbackResponse = {
  id: string;
  analysis_id?: string;
  spec_id?: string;
  user_id: string;
  was_helpful: boolean;
  root_cause_confirmed: number;
  outcome?: string;
  recommendation_implemented: string[];
  actual_root_cause?: string;
  what_worked?: string;
  what_didnt_work?: string;
  time_to_resolution?: string;
  estimated_cost_saved?: number;
  substrate_corrections: Record<string, unknown>[];
  feedback_source?: string;
  created_at?: string;
  updated_at?: string;
};

export type PendingFeedbackItem = {
  analysis_id: string;
  material_category?: string;
  failure_mode?: string;
  substrate_a?: string;
  substrate_b?: string;
  created_at?: string;
  status?: string;
};

type ApiUserProfile = {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
  role?: string | null;
  plan?: string;
  analyses_this_month?: number;
  specs_this_month?: number;
  analyses_reset_date?: string | null;
  specs_reset_date?: string | null;
  stripe_customer_id?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type UsageResponse = {
  analyses_used: number;
  analyses_limit: number;
  specs_used: number;
  specs_limit: number;
  plan: string;
  reset_date?: string | null;
};

function mapUserProfile(u: ApiUserProfile): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? undefined,
    company: u.company ?? undefined,
    role: u.role ?? undefined,
    plan: (u.plan as User['plan']) ?? 'free',
    analysesThisMonth: u.analyses_this_month ?? 0,
    specsThisMonth: u.specs_this_month ?? 0,
    analysesResetDate: u.analyses_reset_date ?? null,
    specsResetDate: u.specs_reset_date ?? null,
    stripeCustomerId: u.stripe_customer_id ?? undefined,
    avatarUrl: u.avatar_url ?? undefined,
    createdAt: u.created_at ?? null,
    updatedAt: u.updated_at ?? null,
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

export class ApiClient {
  // Cache the session promise to avoid redundant getSession() calls
  // within the same tick (e.g., 4 parallel API calls on dashboard load)
  private _sessionPromise: Promise<Record<string, string>> | null = null;
  private _sessionCacheMs = 0;

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const now = Date.now();
    // Reuse cached session for 5 seconds — covers parallel call bursts
    if (this._sessionPromise && now - this._sessionCacheMs < 5000) {
      return this._sessionPromise;
    }
    this._sessionPromise = this._fetchAuthHeaders();
    this._sessionCacheMs = now;
    return this._sessionPromise;
  }

  /**
   * Try to read the Supabase access token directly from localStorage.
   * This avoids the async getSession() round-trip on initial page load.
   * Falls back to getSession() if localStorage token is unavailable.
   */
  private _getTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      // Supabase stores session under sb-<ref>-auth-token
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const ref = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || '';
      if (!ref) return null;
      const raw = localStorage.getItem(`sb-${ref}-auth-token`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token;
      if (!token) return null;
      // Check if token is expired (with 60s buffer)
      const expiresAt = parsed?.expires_at;
      if (expiresAt && expiresAt < Math.floor(Date.now() / 1000) + 60) {
        return null; // Expired — let getSession() handle refresh
      }
      return token;
    } catch {
      return null;
    }
  }

  private async _fetchAuthHeaders(): Promise<Record<string, string>> {
    // Fast path: read token from localStorage (no async, no network)
    const cachedToken = this._getTokenFromStorage();
    if (cachedToken) {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cachedToken}`,
      };
    }

    // Slow path: full Supabase getSession (may trigger token refresh)
    if (!supabase) {
      return { 'Content-Type': 'application/json' };
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Backfill localStorage so future page loads use the fast path
    if (session?.access_token && typeof window !== 'undefined') {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const ref = supabaseUrl.match(/\/\/([^.]+)\./)?.[1] || '';
        if (ref) {
          localStorage.setItem(
            `sb-${ref}-auth-token`,
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              token_type: session.token_type,
              user: session.user,
            }),
          );
        }
      } catch {
        /* quota exceeded — ignore */
      }
    }

    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
    };
  }

  // Failure Analysis
  async createFailureAnalysis(
    data: Partial<FailureAnalysis>
  ): Promise<FailureAnalysis> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg = typeof error.detail === 'string' ? error.detail : (error.message || 'Failed to create analysis');
      throw new ApiError(msg, response.status, error.detail);
    }
    return response.json();
  }

  async getFailureAnalysis(id: string): Promise<FailureAnalysis> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch analysis');
    }
    return response.json();
  }

  async listFailureAnalyses(params?: { limit?: number; offset?: number }): Promise<FailureAnalysis[]> {
    const headers = await this.getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    const url = `${API_URL}/analyze${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch analyses');
    }
    return response.json();
  }

  // Spec Requests
  async createSpecRequest(data: Partial<SpecRequest>): Promise<SpecRequest> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/specify`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg = typeof error.detail === 'string' ? error.detail : (error.message || 'Failed to create spec');
      throw new ApiError(msg, response.status, error.detail);
    }
    return response.json();
  }

  async getSpecRequest(id: string): Promise<SpecRequest> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/specify/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch spec');
    }
    return response.json();
  }

  async listSpecRequests(params?: { limit?: number; offset?: number }): Promise<SpecRequest[]> {
    const headers = await this.getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    const url = `${API_URL}/specify${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch specs');
    }
    return response.json();
  }

  // Case Library
  async listCases(filters?: {
    materialCategory?: string;
    failureMode?: string;
  }): Promise<Case[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetch(`${API_URL}/cases?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }
    return response.json();
  }

  async getCase(id: string): Promise<Case> {
    const response = await fetch(`${API_URL}/cases/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch case');
    }
    return response.json();
  }

  // User
  async getCurrentUser(): Promise<User | null> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me`, { headers });
    if (!response.ok) return null;
    const json = (await response.json()) as ApiUserProfile;
    return mapUserProfile(json);
  }

  async getCurrentUserUsage(): Promise<UsageResponse | null> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me/usage`, { headers });
    if (!response.ok) return null;
    return response.json();
  }

  async updateProfile(data: {
    name?: string;
    company?: string;
    job_title?: string;
  }): Promise<User | null> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { detail?: string }).detail || 'Failed to update profile'
      );
    }
    const json = (await response.json()) as ApiUserProfile;
    return mapUserProfile(json);
  }

  async deleteMyAccount(): Promise<{ status: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { detail?: string }).detail || 'Failed to delete account'
      );
    }
    return response.json();
  }

  async createBillingPortalSession(): Promise<{ portal_url: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/billing/portal`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to create billing portal session');
    }
    return response.json();
  }

  async createCheckoutSession(params: {
    price_id?: string;
    success_url: string;
    cancel_url: string;
  }): Promise<{ checkout_url: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/billing/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    return response.json();
  }

  // PDF Download URLs
  getAnalysisPdfUrl(id: string): string {
    return `${API_URL}/reports/analysis/${id}/pdf`;
  }

  getSpecPdfUrl(id: string): string {
    return `${API_URL}/reports/spec/${id}/pdf`;
  }

  // PDF Download with Auth
  async downloadAnalysisPdf(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/reports/analysis/${id}/pdf`, {
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gravix-analysis-${id.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async downloadSpecPdf(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/reports/spec/${id}/pdf`, {
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gravix-spec-${id.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Feedback
  async submitFeedback(
    data: FeedbackSubmitData
  ): Promise<FeedbackCreateResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { detail?: string }).detail || 'Failed to submit feedback'
      );
    }
    return response.json();
  }

  async getFeedback(analysisId: string): Promise<FeedbackResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_URL}/v1/feedback/${analysisId}`,
      { headers }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch feedback');
    }
    return response.json();
  }

  async getPendingFeedback(): Promise<PendingFeedbackItem[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/feedback/pending/list`, {
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pending feedback');
    }
    return response.json();
  }

  // ---------------------------------------------------------------------------
  // Admin endpoints
  // ---------------------------------------------------------------------------

  async getAdminOverview(): Promise<{
    total_users: number;
    users_by_plan: Record<string, number>;
    total_analyses: number;
    total_specs: number;
    analyses_today: number;
    analyses_this_week: number;
    signups_today: number;
    signups_this_week: number;
  }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/admin/overview`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || 'Failed to fetch admin overview');
    }
    return response.json();
  }

  async getAdminEngineHealth(): Promise<{
    total_ai_calls: number;
    successful_ai_calls: number;
    failed_ai_calls: number;
    avg_latency_ms: number | null;
    calls_by_engine: Record<string, number>;
    calls_with_knowledge: number;
    injection_rate_pct: number | null;
    avg_patterns_per_call: number | null;
    total_knowledge_patterns: number;
    patterns_with_strong_evidence: number;
    total_feedback_entries: number;
    last_aggregation_run: string | null;
    last_aggregation_status: string | null;
    last_aggregation_patterns_upserted: number;
    avg_confidence_raw: number | null;
    avg_confidence_calibrated: number | null;
  }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/admin/engine-health`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || 'Failed to fetch engine health');
    }
    return response.json();
  }

  async getAdminUsers(search?: string): Promise<
    {
      id: string;
      email: string;
      name?: string | null;
      company?: string | null;
      role?: string | null;
      plan: string;
      analyses_this_month: number;
      specs_this_month: number;
      stripe_customer_id?: string | null;
      created_at?: string | null;
    }[]
  > {
    const headers = await this.getAuthHeaders();
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await fetch(`${API_URL}/v1/admin/users${params}`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || 'Failed to fetch admin users');
    }
    return response.json();
  }

  async updateAdminUser(
    userId: string,
    data: { plan?: string; role?: string }
  ): Promise<{
    id: string;
    email: string;
    plan: string;
    role?: string | null;
  }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/admin/users/${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || 'Failed to update user');
    }
    return response.json();
  }

  async getAdminActivity(): Promise<
    {
      id: string;
      type: string;
      user_email?: string | null;
      substrates?: string | null;
      status?: string | null;
      confidence_score?: number | null;
      created_at?: string | null;
    }[]
  > {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/v1/admin/activity`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || 'Failed to fetch admin activity');
    }
    return response.json();
  }

  async getAdminRequestLogs(path?: string): Promise<
    {
      id?: string | null;
      method?: string | null;
      path?: string | null;
      status_code?: number | null;
      duration_ms?: number | null;
      user_id?: string | null;
      user_email?: string | null;
      created_at?: string | null;
    }[]
  > {
    const headers = await this.getAuthHeaders();
    const params = path ? `?path=${encodeURIComponent(path)}` : '';
    const response = await fetch(`${API_URL}/v1/admin/request-logs${params}`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { detail?: string }).detail || 'Failed to fetch request logs');
    }
    return response.json();
  }
}

export const api = new ApiClient();
