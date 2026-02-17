/**
 * Investigation types and API client for Sprint 9.
 * Maps to backend schemas in api/schemas/investigations.py
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Investigation {
  id: string;
  user_id: string;
  investigation_number: string;
  title: string;
  status: InvestigationStatus;
  severity: InvestigationSeverity;

  product_part_number?: string | null;
  customer_oem?: string | null;
  lot_batch_number?: string | null;
  production_line?: string | null;
  shift?: string | null;
  date_of_occurrence?: string | null;
  customer_complaint_ref?: string | null;

  // D2 Problem Description
  who_reported?: string | null;
  what_failed?: string | null;
  where_in_process?: string | null;
  when_detected?: string | null;
  why_it_matters?: string | null;
  how_detected?: string | null;
  how_many_affected?: number | null;
  defect_quantity?: number | null;
  scrap_cost?: number | null;
  rework_cost?: number | null;

  // D4 Root Cause
  analysis_id?: string | null;
  root_causes?: RootCauseItem[] | null;
  five_why_chain?: FiveWhyItem[] | null;
  escape_point?: string | null;
  fishbone_data?: Record<string, unknown> | null;

  // D8 Closure
  closure_summary?: string | null;
  lessons_learned?: string | null;
  closed_at?: string | null;

  // Team
  champion_user_id?: string | null;
  team_lead_user_id?: string | null;
  approver_user_id?: string | null;

  report_template?: string | null;

  created_at: string;
  updated_at: string;
}

export interface InvestigationListItem {
  id: string;
  investigation_number: string;
  title: string;
  status: InvestigationStatus;
  severity: InvestigationSeverity;
  customer_oem?: string | null;
  team_lead_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type InvestigationStatus =
  | 'open'
  | 'containment'
  | 'investigating'
  | 'corrective_action'
  | 'verification'
  | 'closed';

export type InvestigationSeverity = 'critical' | 'major' | 'minor';

export interface RootCauseItem {
  cause: string;
  confidence: number;
  explanation: string;
  evidence?: string[];
}

export interface FiveWhyItem {
  why: string;
  answer: string;
}

export interface InvestigationAction {
  id: string;
  investigation_id: string;
  discipline: string;
  action_type?: string | null;
  description: string;
  owner_user_id?: string | null;
  priority?: string | null;
  status: string;
  due_date?: string | null;
  completion_date?: string | null;
  verification_method?: string | null;
  sample_size?: string | null;
  acceptance_criteria?: string | null;
  verification_results?: string | null;
  verified_by?: string | null;
  verification_date?: string | null;
  evidence_urls?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface InvestigationSignature {
  id: string;
  investigation_id: string;
  user_id: string;
  discipline: string;
  signature_hash: string;
  signed_at: string;
}

export interface StatusTransitionResponse {
  investigation_id: string;
  old_status: string;
  new_status: string;
  transition_allowed: boolean;
  validation_errors?: string[] | null;
  message: string;
}

export interface ShareLinkResponse {
  investigation_id: string;
  share_token: string;
  share_url: string;
  expires_at: string;
  created_at: string;
}

export interface AnalyzeResponse {
  success: boolean;
  root_causes: RootCauseItem[];
  five_why_chain?: FiveWhyItem[] | null;
  escape_point?: string | null;
  confidence_score?: number | null;
}

export interface AuditLogEntry {
  id: string;
  investigation_id: string;
  event_type: string;
  event_detail?: string | null;
  actor_user_id?: string | null;
  discipline?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  diff_data?: Record<string, unknown> | null;
  created_at: string;
}

export interface SharedInvestigation {
  investigation_number: string;
  title: string;
  customer_oem?: string | null;
  severity: string;
  status: string;
  problem_description?: string | null;
  root_causes?: RootCauseItem[] | null;
  five_why_chain?: FiveWhyItem[] | null;
  escape_point?: string | null;
  closure_summary?: string | null;
  actions: {
    discipline: string;
    description: string;
    status: string;
    due_date?: string | null;
  }[];
  created_at: string;
  closed_at?: string | null;
}

// ---------------------------------------------------------------------------
// Attachment types
// ---------------------------------------------------------------------------

export interface InvestigationAttachment {
  id: string;
  investigation_id: string;
  filename: string;
  content_type: string;
  file_size: number;
  file_url?: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  email?: string | null;
  display_name?: string | null;
  role?: string | null;
}

// ---------------------------------------------------------------------------
// Comment types
// ---------------------------------------------------------------------------

export interface InvestigationComment {
  id: string;
  investigation_id: string;
  parent_comment_id?: string | null;
  discipline: string;
  user_id: string;
  comment_text: string;
  is_resolution: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentCreatePayload {
  discipline: string;
  comment_text: string;
  parent_comment_id?: string;
}

// ---------------------------------------------------------------------------
// Template types
// ---------------------------------------------------------------------------

export interface ReportTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  oem_standard?: string | null;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Create / Update payloads
// ---------------------------------------------------------------------------

export interface InvestigationCreatePayload {
  title: string;
  severity: InvestigationSeverity;
  customer_oem?: string;
  product_part_number?: string;
  what_failed?: string;
  analysis_id?: string;
  who_reported?: string;
  where_in_process?: string;
  why_it_matters?: string;
  how_detected?: string;
  how_many_affected?: number;
  report_template?: string;
}

export interface ActionCreatePayload {
  discipline: string;
  description: string;
  owner_user_id?: string;
  priority?: string;
  due_date?: string;
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Fast path: read token from localStorage
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

  // Slow path
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

export const investigationsApi = {
  // List
  list(params?: { status?: string; severity?: string; search?: string }): Promise<InvestigationListItem[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.severity) qs.set('severity', params.severity);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return request(`/v1/investigations${q ? `?${q}` : ''}`);
  },

  // Create
  create(data: InvestigationCreatePayload): Promise<Investigation> {
    return request('/v1/investigations', { method: 'POST', body: JSON.stringify(data) });
  },

  // Get detail
  get(id: string): Promise<Investigation> {
    return request(`/v1/investigations/${id}`);
  },

  // Update
  update(id: string, data: Partial<Investigation>): Promise<Investigation> {
    return request(`/v1/investigations/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // Actions
  listActions(id: string, discipline?: string): Promise<InvestigationAction[]> {
    const qs = discipline ? `?discipline=${discipline}` : '';
    return request(`/v1/investigations/${id}/actions${qs}`);
  },

  createAction(id: string, data: ActionCreatePayload): Promise<InvestigationAction> {
    return request(`/v1/investigations/${id}/actions`, { method: 'POST', body: JSON.stringify(data) });
  },

  updateAction(id: string, actionId: string, data: Partial<InvestigationAction>): Promise<InvestigationAction> {
    return request(`/v1/investigations/${id}/actions/${actionId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // Status transition
  transitionStatus(id: string, newStatus: string, notes?: string): Promise<StatusTransitionResponse> {
    return request(`/v1/investigations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ new_status: newStatus, notes }),
    });
  },

  // Signatures
  listSignatures(id: string): Promise<InvestigationSignature[]> {
    return request(`/v1/investigations/${id}/signatures`);
  },

  signDiscipline(id: string, discipline: string): Promise<InvestigationSignature> {
    return request(`/v1/investigations/${id}/sign/${discipline}`, { method: 'POST' });
  },

  // AI Analysis
  analyze(id: string, opts?: { run_five_why?: boolean; run_escape_point?: boolean }): Promise<AnalyzeResponse> {
    return request(`/v1/investigations/${id}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ run_five_why: true, run_escape_point: true, ...opts }),
    });
  },

  // Share
  createShareLink(id: string, expiresDays?: number): Promise<ShareLinkResponse> {
    return request(`/v1/investigations/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ expires_days: expiresDays ?? 30 }),
    });
  },

  // Shared (public, no auth)
  async getShared(token: string): Promise<SharedInvestigation> {
    const res = await fetch(`${API_URL}/v1/investigations/share/${token}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || 'Not found');
    }
    return res.json();
  },

  // Report (returns blob)
  async downloadReport(id: string, template?: string): Promise<void> {
    const headers = await getAuthHeaders();
    const t = template || 'generic_8d';
    const res = await fetch(`${API_URL}/v1/investigations/${id}/report?template=${t}`, { headers });
    if (!res.ok) throw new Error('Failed to download report');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `8D-Report-${id.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Attachments
  listAttachments(id: string): Promise<InvestigationAttachment[]> {
    return request(`/v1/investigations/${id}/attachments`);
  },

  async uploadAttachment(id: string, file: File): Promise<InvestigationAttachment> {
    const headers = await getAuthHeaders();
    // Remove Content-Type (multipart boundary must be set by browser)
    const { 'Content-Type': _ct, ...headersWithoutCT } = headers;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/v1/investigations/${id}/attachments`, {
      method: 'POST',
      headers: headersWithoutCT,
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || body.message || 'Upload failed');
    }
    return res.json();
  },

  deleteAttachment(id: string, attachmentId: string): Promise<{ success: boolean }> {
    return request(`/v1/investigations/${id}/attachments/${attachmentId}`, { method: 'DELETE' });
  },

  // Team members (for @mentions)
  listTeam(id: string): Promise<TeamMember[]> {
    return request(`/v1/investigations/${id}/team`);
  },

  // Report preview (returns blob URL)
  async getReportBlob(id: string, template?: string): Promise<string> {
    const headers = await getAuthHeaders();
    const t = template || 'generic_8d';
    const res = await fetch(`${API_URL}/v1/investigations/${id}/report?template=${t}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch report');
    const blob = await res.blob();
    return window.URL.createObjectURL(blob);
  },

  // Comments
  listComments(id: string, discipline?: string): Promise<InvestigationComment[]> {
    const qs = discipline ? `?discipline=${discipline}` : '';
    return request(`/v1/investigations/${id}/comments${qs}`);
  },

  createComment(id: string, data: CommentCreatePayload): Promise<InvestigationComment> {
    return request(`/v1/investigations/${id}/comments`, { method: 'POST', body: JSON.stringify(data) });
  },

  updateComment(id: string, commentId: string, commentText: string): Promise<InvestigationComment> {
    return request(`/v1/investigations/${id}/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ comment_text: commentText }),
    });
  },

  deleteComment(id: string, commentId: string): Promise<{ success: boolean }> {
    return request(`/v1/investigations/${id}/comments/${commentId}`, { method: 'DELETE' });
  },

  togglePinComment(id: string, commentId: string): Promise<{ id: string; is_pinned: boolean; is_resolution: boolean }> {
    return request(`/v1/investigations/${id}/comments/${commentId}/pin`, { method: 'PATCH' });
  },

  toggleResolveComment(id: string, commentId: string): Promise<{ id: string; is_pinned: boolean; is_resolution: boolean }> {
    return request(`/v1/investigations/${id}/comments/${commentId}/resolve`, { method: 'PATCH' });
  },

  // Templates
  listTemplates(): Promise<ReportTemplate[]> {
    return request('/v1/templates');
  },

  getTemplate(templateId: string): Promise<ReportTemplate & { template_data?: Record<string, unknown> }> {
    return request(`/v1/templates/${templateId}`);
  },

  // Audit log
  getAuditLog(id: string): Promise<AuditLogEntry[]> {
    return request(`/v1/investigations/${id}/audit`);
  },

  // Close
  close(id: string, data?: { lessons_learned?: string; generate_closure_summary?: boolean }): Promise<{ success: boolean; message: string }> {
    return request(`/v1/investigations/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    });
  },
};
