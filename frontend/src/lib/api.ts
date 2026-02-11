import { supabase } from './supabase';
import type { FailureAnalysis, SpecRequest, Case, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/** True when the backend API URL is not configured */
export function isApiConfigured(): boolean {
  return Boolean(API_URL) && API_URL !== '';
}

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
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
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
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch analysis');
    }
    return response.json();
  }

  async listFailureAnalyses(): Promise<FailureAnalysis[]> {
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/analyze`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch analyses');
    }
    return response.json();
  }

  // Spec Requests
  async createSpecRequest(data: Partial<SpecRequest>): Promise<SpecRequest> {
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
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
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/specify/${id}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch spec');
    }
    return response.json();
  }

  async listSpecRequests(): Promise<SpecRequest[]> {
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
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
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetch(`${API_URL}/cases?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }
    return response.json();
  }

  async getCase(id: string): Promise<Case> {
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const response = await fetch(`${API_URL}/cases/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch case');
    }
    return response.json();
  }

  // User
  async getCurrentUser(): Promise<User | null> {
    if (!isApiConfigured()) return null;
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me`, { headers });
    if (!response.ok) return null;
    return response.json();
  }

  // Usage
  async getUserUsage(): Promise<Record<string, number>> {
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me/usage`, { headers });
    if (!response.ok) throw new Error('Failed to fetch usage');
    return response.json();
  }

  // User profile update
  async updateUser(data: { name?: string; company?: string; role?: string }): Promise<unknown> {
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }

  // Feedback
  async submitFeedback(
    analysisId: string,
    data: { outcome: string; details?: string }
  ): Promise<unknown> {
    if (!isApiConfigured()) throw new Error('API not configured — demo mode');
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/feedback/${analysisId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  }

  // Public stats
  async getPublicStats(): Promise<Record<string, number>> {
    const url = isApiConfigured() ? `${API_URL}/stats/public` : '/api/stats/public';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch stats');
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
