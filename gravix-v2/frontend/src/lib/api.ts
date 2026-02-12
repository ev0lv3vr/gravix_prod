import { supabase } from './supabase';
import type { FailureAnalysis, SpecRequest, Case, User } from './types';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
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

  // PDF Download URLs
  getAnalysisPdfUrl(id: string): string {
    return `${API_URL}/reports/analysis/${id}/pdf`;
  }

  getSpecPdfUrl(id: string): string {
    return `${API_URL}/reports/spec/${id}/pdf`;
  }
}

export const api = new ApiClient();
