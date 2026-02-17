/**
 * Notification types and API client for Sprint 10.
 */

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  investigation_id?: string | null;
  notification_type: string;
  title: string;
  message?: string | null;
  action_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCount {
  unread_count: number;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  status_changes: boolean;
  new_comments: boolean;
  action_assigned: boolean;
  action_due_soon: boolean;
  team_member_added: boolean;
  investigation_closed: boolean;
  email_enabled: boolean;
  updated_at?: string | null;
}

export interface NotificationPreferencesUpdate {
  status_changes?: boolean;
  new_comments?: boolean;
  action_assigned?: boolean;
  action_due_soon?: boolean;
  team_member_added?: boolean;
  investigation_closed?: boolean;
  email_enabled?: boolean;
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

export const notificationsApi = {
  list(params?: { limit?: number; offset?: number }): Promise<Notification[]> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.offset) qs.set('offset', params.offset.toString());
    const q = qs.toString();
    return request(`/v1/notifications${q ? `?${q}` : ''}`);
  },

  getUnreadCount(): Promise<UnreadCount> {
    return request('/v1/notifications/unread-count');
  },

  markAsRead(id: string): Promise<{ success: boolean }> {
    return request(`/v1/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllAsRead(): Promise<{ success: boolean }> {
    return request('/v1/notifications/read-all', { method: 'POST' });
  },

  getPreferences(): Promise<NotificationPreferences> {
    return request('/v1/notifications/preferences');
  },

  updatePreferences(data: NotificationPreferencesUpdate): Promise<NotificationPreferences> {
    return request('/v1/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
