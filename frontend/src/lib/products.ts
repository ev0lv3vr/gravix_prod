/**
 * Sprint 11: Product specifications API client and types.
 */

import { api } from './api';

// ============================================================================
// Types
// ============================================================================

export interface ProductSpecification {
  id: string;
  product_name: string;
  manufacturer?: string | null;
  chemistry_type?: string | null;
  recommended_substrates?: string[];
  surface_prep_requirements?: string | null;
  cure_schedule?: Record<string, unknown>;
  operating_temp_min_c?: number | null;
  operating_temp_max_c?: number | null;
  mechanical_properties?: Record<string, unknown>;
  shelf_life_months?: number | null;
  mix_ratio?: string | null;
  pot_life_minutes?: number | null;
  fixture_time_minutes?: number | null;
  tds_file_url?: string | null;
  extraction_confidence?: Record<string, number>;
  manufacturer_claimed?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TDSExtractionResponse {
  product: ProductSpecification;
  extraction_confidence: Record<string, number>;
  message: string;
}

export interface VisualAnalysisResult {
  image_url: string;
  failure_mode_classification?: string | null;
  surface_condition?: Record<string, unknown>;
  bond_line_assessment?: string | null;
  coverage_assessment?: string | null;
  ai_caption?: string | null;
  confidence_score?: number | null;
}

// ============================================================================
// Guided Investigation Types
// ============================================================================

export interface GuidedSession {
  id: string;
  user_id: string;
  analysis_id?: string | null;
  session_state: Record<string, unknown>;
  messages: GuidedMessage[];
  status: 'active' | 'completed' | 'abandoned' | 'paused';
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GuidedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  tool_calls?: Array<{ tool: string; input: Record<string, unknown> }>;
  tool_results?: Array<{ tool: string; result: Record<string, unknown> }>;
}

export interface GuidedMessageResponse {
  role: string;
  content: string;
  tool_calls?: Array<{ tool: string; input: Record<string, unknown> }> | null;
  tool_results?: Array<{ tool: string; result: Record<string, unknown> }> | null;
}

// ============================================================================
// Pattern Alert Types
// ============================================================================

export interface PatternAlert {
  id: string;
  alert_type: 'time_cluster' | 'geographic' | 'product_lot' | 'seasonal';
  severity: 'informational' | 'warning' | 'critical';
  title: string;
  description?: string | null;
  affected_product?: string | null;
  affected_substrate?: string | null;
  failure_mode?: string | null;
  statistical_confidence?: number | null;
  affected_investigation_ids?: string[];
  ai_explanation?: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at?: string | null;
}

// ============================================================================
// API Functions (extend ApiClient)
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Reuse the api client's auth mechanism
  // Access the private method through a workaround
  const headers = await (api as unknown as { getAuthHeaders(): Promise<Record<string, string>> }).getAuthHeaders();
  return headers;
}

// Products
export async function searchProducts(search?: string): Promise<ProductSpecification[]> {
  const headers = await getAuthHeaders();
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await fetch(`${API_URL}/v1/products${params}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function getProduct(id: string): Promise<ProductSpecification> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/v1/products/${id}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
}

export async function extractTDS(file: File): Promise<TDSExtractionResponse> {
  const headers = await getAuthHeaders();
  // Remove Content-Type for FormData (browser sets it with boundary)
  delete headers['Content-Type'];
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/v1/products/extract-tds`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { detail?: string }).detail || 'TDS extraction failed');
  }
  return response.json();
}

// Photo upload
export async function uploadDefectPhoto(file: File): Promise<{ url: string; filename: string }> {
  const headers = await getAuthHeaders();
  delete headers['Content-Type'];
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/analyze/upload-photo`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { detail?: string }).detail || 'Photo upload failed');
  }
  return response.json();
}

// Guided Investigation
export async function startGuidedSession(params: {
  analysis_id?: string;
  initial_context?: Record<string, unknown>;
}): Promise<GuidedSession> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/v1/guided/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Failed to start guided session');
  return response.json();
}

export async function sendGuidedMessage(
  sessionId: string,
  content: string,
  photoUrls?: string[]
): Promise<GuidedMessageResponse> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = { content };
  if (photoUrls?.length) body.photo_urls = photoUrls;
  const response = await fetch(`${API_URL}/v1/guided/${sessionId}/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

export async function getGuidedSession(sessionId: string): Promise<GuidedSession> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/v1/guided/${sessionId}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch session');
  return response.json();
}

export async function completeGuidedSession(
  sessionId: string,
  params?: { summary?: string; create_investigation?: boolean }
): Promise<{ success: boolean; summary: string; session_id: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/v1/guided/${sessionId}/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params || {}),
  });
  if (!response.ok) throw new Error('Failed to complete session');
  return response.json();
}

// Pause session
export async function pauseGuidedSession(
  sessionId: string
): Promise<{ success: boolean }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/v1/guided/${sessionId}/pause`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) throw new Error('Failed to pause session');
  return response.json();
}

// Pattern Alerts
export async function getPatternAlerts(status?: string): Promise<PatternAlert[]> {
  const headers = await getAuthHeaders();
  const params = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`${API_URL}/v1/patterns/alerts${params}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch pattern alerts');
  return response.json();
}

export async function updatePatternAlert(
  alertId: string,
  status: 'active' | 'acknowledged' | 'resolved'
): Promise<PatternAlert> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/v1/patterns/alerts/${alertId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update alert');
  return response.json();
}
