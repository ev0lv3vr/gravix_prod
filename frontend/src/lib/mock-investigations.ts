/**
 * Mock investigation data for development.
 * Easy to swap for real API — just change imports in components.
 */

import type {
  Investigation,
  InvestigationListItem,
  InvestigationAction,
  InvestigationSignature,
  InvestigationComment,
  InvestigationAttachment,
  AuditLogEntry,
  TeamMember,
  InvestigationStatus,
} from './investigations';

// ─── Team Members ────────────────────────────────────────────────────────────

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { user_id: 'user-001', email: 'alex.chen@acme.com', display_name: 'Alex Chen', role: 'Team Lead' },
  { user_id: 'user-002', email: 'maria.rodriguez@acme.com', display_name: 'Maria Rodriguez', role: 'Champion' },
  { user_id: 'user-003', email: 'james.wilson@acme.com', display_name: 'James Wilson', role: 'Quality Engineer' },
  { user_id: 'user-004', email: 'sarah.kim@acme.com', display_name: 'Sarah Kim', role: 'Process Engineer' },
  { user_id: 'user-005', email: 'tom.baker@acme.com', display_name: 'Tom Baker', role: 'Supplier Quality' },
  { user_id: 'user-006', email: 'lisa.park@acme.com', display_name: 'Lisa Park', role: 'Lab Technician' },
];

// ─── Investigations List ─────────────────────────────────────────────────────

export const MOCK_INVESTIGATIONS: InvestigationListItem[] = [
  {
    id: 'inv-001',
    investigation_number: 'GQ-2026-0012',
    title: 'Ford B-pillar structural disbond',
    status: 'investigating',
    severity: 'critical',
    customer_oem: 'Ford Motor Company',
    team_lead_user_id: 'user-001',
    created_at: '2026-02-10T09:30:00Z',
    updated_at: '2026-02-16T14:22:00Z',
  },
  {
    id: 'inv-002',
    investigation_number: 'GQ-2026-0011',
    title: 'Shelf life exceedance — Loctite 401 batch',
    status: 'containment',
    severity: 'major',
    customer_oem: 'Toyota',
    team_lead_user_id: 'user-002',
    created_at: '2026-02-08T11:00:00Z',
    updated_at: '2026-02-15T16:45:00Z',
  },
  {
    id: 'inv-003',
    investigation_number: 'GQ-2026-0010',
    title: 'Supplier viscosity out-of-spec — DP420',
    status: 'corrective_action',
    severity: 'major',
    customer_oem: 'Boeing',
    team_lead_user_id: 'user-003',
    created_at: '2026-02-05T08:15:00Z',
    updated_at: '2026-02-14T10:30:00Z',
  },
  {
    id: 'inv-004',
    investigation_number: 'GQ-2026-0009',
    title: 'Primer application inconsistency — Line 3',
    status: 'open',
    severity: 'minor',
    customer_oem: 'General Motors',
    team_lead_user_id: 'user-004',
    created_at: '2026-02-14T13:00:00Z',
    updated_at: '2026-02-14T13:00:00Z',
  },
  {
    id: 'inv-005',
    investigation_number: 'GQ-2026-0008',
    title: 'Customer return — epoxy cure failure in cold weather',
    status: 'verification',
    severity: 'major',
    customer_oem: 'Stellantis',
    team_lead_user_id: 'user-001',
    created_at: '2026-01-28T10:00:00Z',
    updated_at: '2026-02-13T09:15:00Z',
  },
  {
    id: 'inv-006',
    investigation_number: 'GQ-2026-0007',
    title: 'Surface contamination — aluminum pre-treatment',
    status: 'closed',
    severity: 'critical',
    customer_oem: 'Ford Motor Company',
    team_lead_user_id: 'user-002',
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-02-10T17:00:00Z',
  },
  {
    id: 'inv-007',
    investigation_number: 'GQ-2026-0006',
    title: 'UV degradation — outdoor adhesive joint failure',
    status: 'closed',
    severity: 'minor',
    customer_oem: 'Rivian',
    team_lead_user_id: 'user-003',
    created_at: '2026-01-10T14:30:00Z',
    updated_at: '2026-02-05T12:00:00Z',
  },
  {
    id: 'inv-008',
    investigation_number: 'GQ-2026-0005',
    title: 'Humidity exposure during shipping — cyanoacrylate',
    status: 'open',
    severity: 'major',
    customer_oem: 'Medtronic',
    team_lead_user_id: 'user-005',
    created_at: '2026-02-15T07:45:00Z',
    updated_at: '2026-02-15T07:45:00Z',
  },
  {
    id: 'inv-009',
    investigation_number: 'GQ-2026-0004',
    title: 'Batch inconsistency — silicone sealant viscosity',
    status: 'closed',
    severity: 'minor',
    customer_oem: 'Tesla',
    team_lead_user_id: 'user-004',
    created_at: '2025-12-20T09:00:00Z',
    updated_at: '2026-01-30T16:00:00Z',
  },
  {
    id: 'inv-010',
    investigation_number: 'GQ-2026-0003',
    title: 'Wrong adhesive applied — operator error',
    status: 'closed',
    severity: 'critical',
    customer_oem: 'Airbus',
    team_lead_user_id: 'user-001',
    created_at: '2025-12-15T11:00:00Z',
    updated_at: '2026-01-20T14:30:00Z',
  },
];

// ─── Full Investigation Detail ───────────────────────────────────────────────

export const MOCK_INVESTIGATION_DETAIL: Investigation = {
  id: 'inv-001',
  user_id: 'user-001',
  investigation_number: 'GQ-2026-0012',
  title: 'Ford B-pillar structural disbond',
  status: 'investigating',
  severity: 'critical',

  product_part_number: 'DP-420-NS',
  customer_oem: 'Ford Motor Company',
  lot_batch_number: 'LOT-2026-Q1-042',
  production_line: 'Assembly Line 7',
  shift: 'Day Shift',
  date_of_occurrence: '2026-02-09',
  customer_complaint_ref: 'FORD-QN-2026-1847',

  // D2
  who_reported: 'Ford Quality — J. Martinez',
  what_failed: 'Structural adhesive bond on B-pillar reinforcement separated under crash test simulation. Complete adhesive failure at the aluminum-to-CFRP interface. Bond line showed clean substrate surface on the CFRP side with full adhesive transfer to aluminum.',
  where_in_process: 'Final Assembly — Station 47, Body-in-White',
  when_detected: '2026-02-09 — during crash simulation test',
  why_it_matters: 'Safety-critical structural joint. Potential production line stop affecting 450 vehicles/day. Ford PPAP at risk. $2.3M estimated exposure.',
  how_detected: 'Crash simulation test — destructive testing of B-pillar assembly',
  how_many_affected: 23,
  defect_quantity: 23,
  scrap_cost: 47500,
  rework_cost: 12000,

  // D4
  analysis_id: 'analysis-ref-001',
  root_causes: [
    {
      cause: 'Insufficient surface activation on CFRP substrate',
      confidence: 0.89,
      explanation: 'Atmospheric plasma treatment parameters drifted out of specification. Nozzle-to-surface distance increased by 8mm due to fixture wear, reducing surface energy below 42 mN/m threshold.',
      evidence: ['Surface energy measurement: 36 mN/m (spec: ≥42 mN/m)', 'Fixture wear measurement: 8mm deviation'],
    },
    {
      cause: 'Elevated humidity during adhesive application',
      confidence: 0.72,
      explanation: 'HVAC system malfunction on Feb 8-9 allowed shop floor humidity to reach 78% RH. DP-420 is moisture-sensitive during open time. Contact angle measurements confirm reduced wetting.',
      evidence: ['Environmental log: 78% RH (spec: max 60%)', 'Contact angle: 52° (baseline: 28°)'],
    },
    {
      cause: 'Adhesive pot life exceeded on 3 assemblies',
      confidence: 0.45,
      explanation: 'Operator logs indicate 3 assemblies bonded at T+55 min after mixing. DP-420 pot life is 40 minutes at 23°C. Viscosity would have increased significantly.',
    },
  ],
  five_why_chain: [
    { why: 'Why did the bond fail?', answer: 'Adhesive failure at CFRP interface — insufficient adhesion to substrate.' },
    { why: 'Why was adhesion insufficient?', answer: 'Surface energy on CFRP was below specification (36 vs 42 mN/m).' },
    { why: 'Why was surface energy low?', answer: 'Plasma treatment was ineffective — nozzle distance had drifted.' },
    { why: 'Why did nozzle distance drift?', answer: 'Fixture wear from 3 months of production. No PM schedule for this parameter.' },
    { why: 'Why was there no PM schedule?', answer: 'Parameter not included in original PFMEA — gap in process documentation.' },
  ],
  escape_point: 'No in-line surface energy verification after plasma treatment. Current process relies on periodic (weekly) lab checks. Daily or per-batch verification needed.',
  fishbone_data: {
    man: ['Operator exceeded pot life on 3 units', 'New operator on shift without full certification'],
    machine: ['Plasma fixture wear — 8mm drift', 'HVAC malfunction — humidity control lost'],
    material: ['DP-420 LOT-2026-Q1-042 viscosity within spec', 'CFRP surface chemistry nominal'],
    method: ['No in-line surface energy check', 'Pot life not monitored by system'],
    measurement: ['Weekly lab check missed Feb 7 reading', 'No real-time humidity alerting'],
    environment: ['78% RH during application', 'Temperature within spec'],
  },

  // D8
  closure_summary: null,
  lessons_learned: null,
  closed_at: null,

  // Team
  champion_user_id: 'user-002',
  team_lead_user_id: 'user-001',
  approver_user_id: 'user-005',

  report_template: 'ford_global_8d',
  created_at: '2026-02-10T09:30:00Z',
  updated_at: '2026-02-16T14:22:00Z',
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export const MOCK_ACTIONS: InvestigationAction[] = [
  // D3 — Containment
  {
    id: 'act-001',
    investigation_id: 'inv-001',
    discipline: 'D3',
    action_type: 'containment',
    description: 'Quarantine all DP-420 from LOT-2026-Q1-042. Segregate 150 remaining cartridges.',
    owner_user_id: 'user-003',
    priority: 'P1',
    status: 'complete',
    due_date: '2026-02-11',
    completion_date: '2026-02-10',
    verification_method: null,
    sample_size: null,
    acceptance_criteria: null,
    verification_results: null,
    verified_by: null,
    verification_date: null,
    evidence_urls: null,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T16:00:00Z',
  },
  {
    id: 'act-002',
    investigation_id: 'inv-001',
    discipline: 'D3',
    action_type: 'containment',
    description: 'Sort and inspect all B-pillar assemblies from Feb 8-9 production (est. 94 units). Destructive test 5 samples.',
    owner_user_id: 'user-004',
    priority: 'P1',
    status: 'in_progress',
    due_date: '2026-02-12',
    completion_date: null,
    verification_method: null,
    sample_size: null,
    acceptance_criteria: null,
    verification_results: null,
    verified_by: null,
    verification_date: null,
    evidence_urls: null,
    created_at: '2026-02-10T10:15:00Z',
    updated_at: '2026-02-11T09:00:00Z',
  },
  {
    id: 'act-003',
    investigation_id: 'inv-001',
    discipline: 'D3',
    action_type: 'containment',
    description: 'Notify Ford Quality — issue containment notice FCN-2026-0087.',
    owner_user_id: 'user-002',
    priority: 'P1',
    status: 'complete',
    due_date: '2026-02-10',
    completion_date: '2026-02-10',
    verification_method: null,
    sample_size: null,
    acceptance_criteria: null,
    verification_results: null,
    verified_by: null,
    verification_date: null,
    evidence_urls: null,
    created_at: '2026-02-10T09:45:00Z',
    updated_at: '2026-02-10T11:30:00Z',
  },
  // D5 — Corrective Actions
  {
    id: 'act-004',
    investigation_id: 'inv-001',
    discipline: 'D5',
    action_type: 'corrective',
    description: 'Replace plasma treatment fixture. New fixture with wear indicator (visual go/no-go gauge).',
    owner_user_id: 'user-004',
    priority: 'P1',
    status: 'open',
    due_date: '2026-02-17',
    completion_date: null,
    verification_method: 'Surface energy measurement on 25 consecutive parts',
    sample_size: '25',
    acceptance_criteria: '≥42 mN/m on all samples',
    verification_results: null,
    verified_by: null,
    verification_date: null,
    evidence_urls: null,
    created_at: '2026-02-12T14:00:00Z',
    updated_at: '2026-02-12T14:00:00Z',
  },
  {
    id: 'act-005',
    investigation_id: 'inv-001',
    discipline: 'D5',
    action_type: 'corrective',
    description: 'Install in-line surface energy verification (water contact angle sensor) after plasma station.',
    owner_user_id: 'user-003',
    priority: 'P2',
    status: 'open',
    due_date: '2026-02-28',
    completion_date: null,
    verification_method: 'Run 100 parts through system, verify auto-reject for non-conforming surfaces',
    sample_size: '100',
    acceptance_criteria: '100% detection of surfaces <42 mN/m',
    verification_results: null,
    verified_by: null,
    verification_date: null,
    evidence_urls: null,
    created_at: '2026-02-12T14:30:00Z',
    updated_at: '2026-02-12T14:30:00Z',
  },
  {
    id: 'act-006',
    investigation_id: 'inv-001',
    discipline: 'D5',
    action_type: 'corrective',
    description: 'Repair HVAC system. Add humidity alarming with automatic line stop at >65% RH.',
    owner_user_id: 'user-005',
    priority: 'P2',
    status: 'open',
    due_date: '2026-02-21',
    completion_date: null,
    verification_method: null,
    sample_size: null,
    acceptance_criteria: null,
    verification_results: null,
    verified_by: null,
    verification_date: null,
    evidence_urls: null,
    created_at: '2026-02-12T15:00:00Z',
    updated_at: '2026-02-12T15:00:00Z',
  },
  // D7 — Preventive
  {
    id: 'act-007',
    investigation_id: 'inv-001',
    discipline: 'D7',
    action_type: 'preventive',
    description: 'Update PFMEA to include plasma fixture wear as a failure mode. Add PM schedule for nozzle distance check (every 500 cycles).',
    owner_user_id: 'user-001',
    priority: 'P2',
    status: 'open',
    due_date: '2026-03-01',
    completion_date: null,
    verification_method: null,
    sample_size: null,
    acceptance_criteria: null,
    verification_results: null,
    verified_by: null,
    verification_date: null,
    evidence_urls: null,
    created_at: '2026-02-14T10:00:00Z',
    updated_at: '2026-02-14T10:00:00Z',
  },
];

// ─── Signatures ──────────────────────────────────────────────────────────────

export const MOCK_SIGNATURES: InvestigationSignature[] = [
  {
    id: 'sig-001',
    investigation_id: 'inv-001',
    user_id: 'user-001',
    discipline: 'D1',
    signature_hash: 'sha256:abc123',
    signed_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'sig-002',
    investigation_id: 'inv-001',
    user_id: 'user-002',
    discipline: 'D2',
    signature_hash: 'sha256:def456',
    signed_at: '2026-02-11T09:30:00Z',
  },
  {
    id: 'sig-003',
    investigation_id: 'inv-001',
    user_id: 'user-001',
    discipline: 'D3',
    signature_hash: 'sha256:ghi789',
    signed_at: '2026-02-11T16:00:00Z',
  },
];

// ─── Comments ────────────────────────────────────────────────────────────────

export const MOCK_COMMENTS: InvestigationComment[] = [
  {
    id: 'cmt-001',
    investigation_id: 'inv-001',
    discipline: 'D4',
    user_id: 'user-001',
    parent_comment_id: null,
    comment_text: 'AI analysis points strongly to the plasma treatment issue. @Maria Rodriguez can you pull the fixture maintenance log for the last 3 months?',
    is_resolution: false,
    is_pinned: true,
    created_at: '2026-02-12T10:00:00Z',
    updated_at: '2026-02-12T10:00:00Z',
  },
  {
    id: 'cmt-002',
    investigation_id: 'inv-001',
    discipline: 'D4',
    user_id: 'user-002',
    parent_comment_id: 'cmt-001',
    comment_text: 'Pulled the logs. Fixture was last checked Oct 2025. Wear is clearly visible — photos attached to the gallery.',
    is_resolution: false,
    is_pinned: false,
    created_at: '2026-02-12T11:30:00Z',
    updated_at: '2026-02-12T11:30:00Z',
  },
  {
    id: 'cmt-003',
    investigation_id: 'inv-001',
    discipline: 'D4',
    user_id: 'user-003',
    parent_comment_id: null,
    comment_text: 'Confirmed the humidity spike from HVAC data. 78% RH sustained for 6+ hours on Feb 8. This would significantly impact contact angle on treated surfaces.',
    is_resolution: false,
    is_pinned: false,
    created_at: '2026-02-12T14:00:00Z',
    updated_at: '2026-02-12T14:00:00Z',
  },
  {
    id: 'cmt-004',
    investigation_id: 'inv-001',
    discipline: 'D3',
    user_id: 'user-004',
    parent_comment_id: null,
    comment_text: 'Sort inspection update: 12 of 94 units show reduced peel strength. Holding all for re-bond.',
    is_resolution: false,
    is_pinned: false,
    created_at: '2026-02-11T15:00:00Z',
    updated_at: '2026-02-11T15:00:00Z',
  },
  {
    id: 'cmt-005',
    investigation_id: 'inv-001',
    discipline: 'D2',
    user_id: 'user-001',
    parent_comment_id: null,
    comment_text: 'Ford confirmed 23 vehicles affected based on their VIN trace. Updated the count.',
    is_resolution: false,
    is_pinned: false,
    created_at: '2026-02-11T09:00:00Z',
    updated_at: '2026-02-11T09:00:00Z',
  },
];

// ─── Attachments ─────────────────────────────────────────────────────────────

export const MOCK_ATTACHMENTS: InvestigationAttachment[] = [
  {
    id: 'att-001',
    investigation_id: 'inv-001',
    filename: 'fracture-surface-cfrp.jpg',
    content_type: 'image/jpeg',
    file_size: 2450000,
    file_url: null,
    uploaded_by: 'user-001',
    created_at: '2026-02-10T10:30:00Z',
  },
  {
    id: 'att-002',
    investigation_id: 'inv-001',
    filename: 'fracture-surface-aluminum.jpg',
    content_type: 'image/jpeg',
    file_size: 1890000,
    file_url: null,
    uploaded_by: 'user-001',
    created_at: '2026-02-10T10:31:00Z',
  },
  {
    id: 'att-003',
    investigation_id: 'inv-001',
    filename: 'plasma-fixture-wear.jpg',
    content_type: 'image/jpeg',
    file_size: 3200000,
    file_url: null,
    uploaded_by: 'user-002',
    created_at: '2026-02-12T11:35:00Z',
  },
  {
    id: 'att-004',
    investigation_id: 'inv-001',
    filename: 'humidity-log-feb8-9.pdf',
    content_type: 'application/pdf',
    file_size: 456000,
    file_url: null,
    uploaded_by: 'user-003',
    created_at: '2026-02-12T14:05:00Z',
  },
];

// ─── Audit Log ───────────────────────────────────────────────────────────────

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'al-001', investigation_id: 'inv-001', event_type: 'investigation_created', event_detail: 'Investigation GQ-2026-0012 created', actor_user_id: 'user-001', discipline: null, target_type: null, target_id: null, diff_data: null, created_at: '2026-02-10T09:30:00Z' },
  { id: 'al-002', investigation_id: 'inv-001', event_type: 'team_assigned', event_detail: 'Maria Rodriguez assigned as Champion', actor_user_id: 'user-001', discipline: 'D1', target_type: 'user', target_id: 'user-002', diff_data: null, created_at: '2026-02-10T09:35:00Z' },
  { id: 'al-003', investigation_id: 'inv-001', event_type: 'discipline_signed', event_detail: 'D1 — Establish the Team signed off by Alex Chen', actor_user_id: 'user-001', discipline: 'D1', target_type: null, target_id: null, diff_data: null, created_at: '2026-02-10T10:00:00Z' },
  { id: 'al-004', investigation_id: 'inv-001', event_type: 'status_changed', event_detail: 'Status changed: Open → Containment', actor_user_id: 'user-001', discipline: null, target_type: null, target_id: null, diff_data: { old: 'open', new: 'containment' }, created_at: '2026-02-10T10:05:00Z' },
  { id: 'al-005', investigation_id: 'inv-001', event_type: 'action_created', event_detail: 'Containment action added: Quarantine DP-420 LOT-2026-Q1-042', actor_user_id: 'user-001', discipline: 'D3', target_type: 'action', target_id: 'act-001', diff_data: null, created_at: '2026-02-10T10:00:00Z' },
  { id: 'al-006', investigation_id: 'inv-001', event_type: 'action_completed', event_detail: 'Containment action completed: Quarantine DP-420', actor_user_id: 'user-003', discipline: 'D3', target_type: 'action', target_id: 'act-001', diff_data: null, created_at: '2026-02-10T16:00:00Z' },
  { id: 'al-007', investigation_id: 'inv-001', event_type: 'attachment_uploaded', event_detail: 'Photo uploaded: fracture-surface-cfrp.jpg', actor_user_id: 'user-001', discipline: null, target_type: 'attachment', target_id: 'att-001', diff_data: null, created_at: '2026-02-10T10:30:00Z' },
  { id: 'al-008', investigation_id: 'inv-001', event_type: 'discipline_signed', event_detail: 'D2 — Describe the Problem signed off by Maria Rodriguez', actor_user_id: 'user-002', discipline: 'D2', target_type: null, target_id: null, diff_data: null, created_at: '2026-02-11T09:30:00Z' },
  { id: 'al-009', investigation_id: 'inv-001', event_type: 'status_changed', event_detail: 'Status changed: Containment → Investigating', actor_user_id: 'user-001', discipline: null, target_type: null, target_id: null, diff_data: { old: 'containment', new: 'investigating' }, created_at: '2026-02-11T10:00:00Z' },
  { id: 'al-010', investigation_id: 'inv-001', event_type: 'discipline_signed', event_detail: 'D3 — Interim Containment signed off by Alex Chen', actor_user_id: 'user-001', discipline: 'D3', target_type: null, target_id: null, diff_data: null, created_at: '2026-02-11T16:00:00Z' },
  { id: 'al-011', investigation_id: 'inv-001', event_type: 'ai_analysis', event_detail: 'AI root cause analysis completed — 3 root causes identified', actor_user_id: 'user-001', discipline: 'D4', target_type: null, target_id: null, diff_data: null, created_at: '2026-02-12T09:00:00Z' },
  { id: 'al-012', investigation_id: 'inv-001', event_type: 'comment_added', event_detail: 'Alex Chen commented on D4', actor_user_id: 'user-001', discipline: 'D4', target_type: 'comment', target_id: 'cmt-001', diff_data: null, created_at: '2026-02-12T10:00:00Z' },
];

// ─── Status transition validation ────────────────────────────────────────────

const VALID_TRANSITIONS: Record<InvestigationStatus, InvestigationStatus[]> = {
  open: ['containment'],
  containment: ['investigating'],
  investigating: ['corrective_action'],
  corrective_action: ['verification'],
  verification: ['closed', 'corrective_action'], // can revert
  closed: [],
};

export function isValidTransition(from: InvestigationStatus, to: InvestigationStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Helper: get team member display info ────────────────────────────────────

export function getTeamMember(userId: string): TeamMember | undefined {
  return MOCK_TEAM_MEMBERS.find((m) => m.user_id === userId);
}

export function getTeamMemberName(userId: string | null | undefined): string {
  if (!userId) return 'Unassigned';
  const member = getTeamMember(userId);
  return member?.display_name ?? userId.slice(0, 8);
}

// ─── Aggregate helpers ───────────────────────────────────────────────────────

export function getActionsForInvestigation(investigationId: string): InvestigationAction[] {
  return MOCK_ACTIONS.filter((a) => a.investigation_id === investigationId);
}

export function getOpenActionCount(investigationId: string): number {
  return getActionsForInvestigation(investigationId).filter((a) => a.status === 'open' || a.status === 'in_progress').length;
}

export function getOverdueActionCount(investigationId: string): number {
  const now = Date.now();
  return getActionsForInvestigation(investigationId).filter(
    (a) => a.status !== 'complete' && a.due_date && new Date(a.due_date).getTime() < now
  ).length;
}
