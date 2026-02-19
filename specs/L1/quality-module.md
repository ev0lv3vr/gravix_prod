# Quality Module — 8D Investigations (F15–F18) — L1 Summary

> Full detail: `L2/quality-module-full.md` | Source: gravix-final-prd.md Part III

## What It Does
Enterprise 8D corrective action module. Auto-generates audit-ready 8D reports using the existing failure analysis engine. D1–D8 disciplines as stepper workflow. Team collaboration, photo annotation, electronic signatures, OEM templates. Shifts buyer from individual engineers ($79/mo) to quality departments ($299–799/mo).

## Routes
- `/investigations` — list view (table + kanban toggle)
- `/investigations/new` — create investigation form
- `/investigations/[id]` — detail view with D1–D8 stepper
- `/investigations/[id]/report` — PDF preview + export
- `/investigations/[id]/share/[token]` — read-only OEM sharing link
- `/failure?mode=guided` — chat-style guided investigation

## Tier Gating
| Feature | Quality ($299/mo) | Enterprise ($799/mo) |
|---------|-------------------|---------------------|
| Create investigations | 20/mo | Unlimited |
| Team seats | 3 | 10 |
| AI root cause (D4) | ✅ | ✅ |
| Photo annotation | ✅ | ✅ |
| PDF report generation | ✅ | ✅ (branded) |
| OEM templates | ❌ | ✅ (Ford, VDA, A3, AS9100) |
| Pattern alerts | ❌ | ✅ |
| Org branding on reports | ❌ | ✅ |

## 8D Disciplines (Stepper)
| Step | Name | Content |
|------|------|---------|
| D1 | Team Formation | Team members, roles, contact info |
| D2 | Problem Description | Is/Is-Not analysis, 5W2H, failure details |
| D3 | Containment Actions | Interim actions to stop defect from reaching customer |
| D4 | Root Cause Analysis | AI-powered (triggers failure analysis engine), fishbone diagram data |
| D5 | Corrective Actions | Permanent fixes, assigned owners, due dates |
| D6 | Verification | Proof that corrective actions work |
| D7 | Prevention | Systemic changes to prevent recurrence |
| D8 | Closure | Team recognition, lessons learned, sign-off |

## Key Tables
- `investigations` — id, title, status, severity, created_by, organization_id, d1-d8 JSONB columns, created_at, closed_at
- `investigation_team_members` — user assignments with roles
- `investigation_actions` — action items with status, owner, due_date
- `investigation_attachments` — photos with Fabric.js annotation data
- `investigation_comments` — threaded comments per discipline
- `investigation_audit_log` — immutable append-only activity log
- `investigation_signatures` — electronic sign-off per discipline
- `report_templates` — OEM-specific templates (Enterprise only)

## API Contracts
```
POST /api/investigations — create
GET /api/investigations — list (filterable by status, severity, date)
GET /api/investigations/{id} — detail
PATCH /api/investigations/{id} — update discipline data
POST /api/investigations/{id}/actions — add action item
POST /api/investigations/{id}/comments — add comment
POST /api/investigations/{id}/attachments — upload photo
POST /api/investigations/{id}/signatures — sign discipline
GET /api/investigations/{id}/report — generate PDF
POST /api/investigations/{id}/share — create share token
POST /api/investigations/email-in — create from forwarded email
```

## Critical Validations
- Investigation status flow: draft → active → review → closed (no skipping)
- D4 triggers the failure analysis engine — reuses existing AI infrastructure
- Photo annotation persists Fabric.js canvas JSON in `investigation_attachments.annotation_data`
- Audit log is append-only — no UPDATE or DELETE permitted
- Electronic signatures require re-authentication (password/magic link confirmation)
- PDF generation uses investigation data + selected template
- Email-in: parse forwarded email, extract failure description, create investigation in draft status

## AI-Forward Features (Future-Proof)
- Visual failure analysis: multimodal Claude analyzes defect photos → failure mode classification
- TDS intelligence: cross-reference investigation data against product TDS for spec violations
- Agentic investigation: multi-step AI walks user through D1–D8 with tool calls
- Pattern detection (epidemiology engine): cross-case pattern recognition, alerts on recurring failures (Enterprise only)
