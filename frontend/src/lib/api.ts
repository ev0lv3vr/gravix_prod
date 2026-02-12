import { supabase } from './supabase';
import type { FailureAnalysis, SpecRequest, Case, User } from './types';

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
  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!supabase) {
      console.error('[API] supabase client is null — NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing at build time');
      return { 'Content-Type': 'application/json' };
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.debug('[API] getAuthHeaders — session exists:', !!session, 'token exists:', !!session?.access_token);
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
      throw new Error(error.message || 'Failed to create analysis');
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

  async listFailureAnalyses(): Promise<FailureAnalysis[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze`, { headers });
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
      throw new Error(error.message || 'Failed to create spec');
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

  async listSpecRequests(): Promise<SpecRequest[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/specify`, { headers });
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
    role?: string;
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
