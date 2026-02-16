
GRAVIX
QUALITY

Product Requirements Document
AI-Powered 8D Corrective Action Reports
for Industrial Adhesive, Sealant & Coating Failures


CONFIDENTIAL — GLUE MASTERS LLC

Table of Contents

Executive Summary
Gravix Quality is a bolt-on module that transforms Gravix from a single-use diagnostic tool into an enterprise compliance platform. It leverages the existing failure analysis engine and self-learning knowledge base to auto-generate audit-ready 8D corrective action reports for adhesive, sealant, and coating failures in manufacturing environments.
This feature shifts the primary buyer from individual engineers ($79/month) to quality departments at manufacturing facilities ($299-799/month), targeting a 10x increase in average revenue per account. The 8D module requires approximately 19 development days across 5 sprints and builds entirely on existing V2 infrastructure — no new AI models, no new data pipeline, just a new presentation layer and workflow on top of the analysis engine. The module includes six collaboration and compliance features critical for enterprise adoption: photo annotation, threaded comments, activity audit logging, email-in investigation creation, structured notifications, and OEM-specific report templates. Additionally, six AI-forward features future-proof the platform as models improve: visual failure analysis from defect photos, TDS product intelligence layer, agentic multi-step investigation, cross-case pattern recognition (epidemiology engine), specification-to-failure loop closure, and structured data architecture for fine-tuning and data licensing.

Strategic Context
Why 8D and Why Now
The 8D methodology was developed by Ford Motor Company in the 1980s and is now the dominant corrective action framework in automotive (IATF 16949), aerospace (AS9100), and medical device (ISO 13485) manufacturing. Every certified facility is required to produce 8D or equivalent CAPA documentation for quality events. This is not optional — it is an audit requirement.
Gravix V1 and V2 already produce the hardest part of an 8D report — the root cause analysis (D4) and corrective action recommendations (D5-D7). The remaining disciplines (D1 team formation, D2 problem description, D3 containment, D6 verification, D8 closure) are structured workflow and data entry that require no new AI capabilities.
Market Opportunity

Competitive Landscape
Existing 8D/CAPA tools (ComplianceQuest, ETQ Reliance, Greenlight Guru, MasterControl) are workflow platforms that provide blank templates and tracking. None perform the actual root cause analysis — they give you a form and expect you to fill in D4 yourself. Gravix Quality is the only product that combines AI-powered adhesive failure diagnostics with 8D workflow and audit-ready output.
Conversely, existing materials intelligence tools (Ansys Granta Selector) focus on material selection, not failure analysis or corrective action documentation. They are enterprise-priced ($5,000-15,000/seat/year) with no 8D capability.
Gravix Quality occupies a white space: domain-specific AI intelligence + compliance workflow + audit-ready documentation, at a price point 10x below enterprise tools.
User Personas
Persona 1: Quality Manager (Buyer)

Persona 2: Process Engineer (User)

Persona 3: OEM Customer Quality Rep (Downstream)

Feature Requirements
F1: Investigation Management
The investigation is the top-level container for an 8D process. It wraps one or more Gravix failure analyses with team, workflow, actions, and sign-off.
F1.1 Create Investigation
User can create a new investigation from scratch or from an existing failure analysis
When created from an existing analysis, D2 (problem description) and D4 (root cause) are pre-populated from the analysis results
Required fields at creation: investigation title, product/part number, customer (OEM), severity (critical/major/minor)
Optional fields: lot/batch number, production line, shift, date of occurrence, customer complaint reference number
System auto-assigns investigation number (format: GQ-YYYY-NNNN, e.g. GQ-2026-0042)
Status set to "Open" upon creation
F1.2 Investigation Status Workflow

F1.3 Team Management (D1)
Champion (required): The stakeholder who owns the problem. Must be a Gravix user on the same plan.
Team Lead (required): The engineer leading the investigation. Defaults to the creator.
Members (optional): Up to 10 additional participants. Can be invited by email (creates account if needed).
Approver (required for closure): The quality manager who signs off on the completed 8D. Cannot be the same person as the Team Lead.
All team members can view and comment on the investigation. Only Team Lead and Champion can edit disciplines.
F2: 8D Discipline Content
F2.1 Problem Description (D2)
Auto-populated from Gravix failure analysis intake form: failure description, substrates, material, environment, failure mode, industry, production impact
5W2H fields structured: Who reported, What failed, Where in process, When detected, Why it matters (impact), How detected, How many affected
Defect quantity and scrap/rework cost fields for financial tracking
Photo/file attachment support (up to 10 files, max 20MB each) for evidence of the defect
All fields editable by Team Lead to add context beyond the initial analysis
F2.2 Containment Actions (D3)
Structured action items: description, owner (team member), due date, status (open/in-progress/complete), completion date
Common containment templates pre-populated based on failure mode (e.g., debonding: "Quarantine affected lot", "100% inspection of bonded assemblies", "Sort and segregate suspect parts")
Evidence attachment per action (photos, inspection records)
At least one containment action must be completed before moving to Investigating status
F2.3 Root Cause Analysis (D4) — AI-Powered
This is the core differentiator. D4 is populated by the existing Gravix failure analysis engine and enhanced by the V2 knowledge layer.
"Run AI Analysis" button triggers the full Gravix failure analysis pipeline (same as V2 analyze endpoint)
Knowledge injection: if the substrate pair and failure mode have prior data in the knowledge_patterns table, the AI receives empirical context (resolution rates, confirmed root causes, effective/ineffective solutions)
Results displayed in structured format: ranked root causes with confidence scores, contributing factors, mechanisms
5-Why chain auto-generated by AI for the top-ranked root cause
Escape point analysis: AI identifies the earliest control point that should have caught the failure (e.g., "Incoming inspection should have detected surface contamination via water break test")
Fishbone (Ishikawa) diagram data generated by AI across 6M categories: Man, Machine, Material, Method, Measurement, Mother Nature
Team Lead can edit, reorder, or override AI root causes with manual entries
Confidence badge shows "Empirically Validated (N cases)" when knowledge injection was used, "AI Estimated" otherwise
F2.4 Corrective Actions (D5)
AI generates recommended corrective actions from the failure analysis output (long_term_solutions field)
Each action is a structured item: description, responsible person, target date, actual date, status, evidence
Actions categorized as: Design Change, Process Change, Material Change, Training, Supplier Action, Documentation Update
Team Lead can add custom corrective actions beyond AI recommendations
Priority field: P1 (immediate), P2 (within 30 days), P3 (within 90 days)
F2.5 Implementation & Verification (D6)
Each corrective action has a verification section: method (inspection, test, audit), sample size, acceptance criteria, results, verified by, date
Effectiveness check: define KPIs (e.g., "zero debonding failures in 90 days post-implementation"), track actuals
Links to Gravix feedback system: if subsequent analyses of same substrate pair show improvement, system flags it as verification evidence
Evidence attachment for verification results (test reports, inspection data, photos)
F2.6 Preventive Actions (D7)
AI generates preventive measures from the failure analysis output (prevention_plan field)
Systemic scope: actions that prevent similar failures across other products, lines, or facilities
Types: SOP update, FMEA revision, incoming inspection criteria, process control plan update, supplier specification revision, training program
Cross-reference field to link to spec engine: "Run Spec Analysis" button generates adhesive specification for the corrected process, linked back to this investigation
F2.7 Closure & Recognition (D8)
Closure requires: all corrective actions verified, all preventive actions assigned, approver sign-off
Electronic signature: approver signs with name, role, timestamp (stored in investigation_signatures table)
Closure summary: auto-generated narrative summarizing the investigation from D1-D7
Lessons learned field (free text) — feeds into the case library auto-generation pipeline
Investigation locked after closure. Amendments create a new revision, preserving the audit trail.
F3: 8D Report Generation (PDF)
The audit-ready PDF is the primary deliverable. This is what gets attached to customer complaint files, shown to auditors, and submitted to OEM portals.
F3.1 Report Template
Professional layout with company logo (uploaded in account settings), investigation number, date, revision number
Cover page: investigation title, part number, customer, severity, team members, dates
8 sections corresponding to D1-D8, each clearly labeled with discipline name
D4 section includes: ranked root causes with confidence scores, 5-Why chain, escape point, Ishikawa reference, Gravix knowledge citation ("Based on N similar cases...")
Action tracker summary table: all corrective and preventive actions with status, owner, dates
Signature block at end with approver name, role, date, electronic signature hash
Footer: "Generated by Gravix Quality — gravix.io" (removable on Enterprise plan with branded reports)
F3.2 Export Options
PDF (primary): audit-ready, includes embedded images and attachments
DOCX: editable template for facilities that need to customize before submission
Shareable link: read-only web view with unique URL for sending to OEM customer quality reps
Print-optimized: US Letter (8.5 x 11) and A4 layouts
F3.3 Revision Tracking
Each PDF export is a numbered revision (Rev A, Rev B, etc.)
System stores all revisions with diff between versions
Revision history available in investigation detail page
F4: Action Item Dashboard
Dashboard widget showing all open investigations across the team
Filter by: status, assignee, severity, customer, overdue
Overdue actions highlighted in red with escalation notification to Champion
Email notifications: assignment, due date reminders (3 days before, 1 day before, overdue), status changes, closure
Kanban view: columns for Open, Containment, Investigating, Corrective Action, Verification, Closed
Calendar view: action item due dates displayed on monthly calendar
F5: Cross-Linking with Spec Engine
When a failure investigation concludes, the natural next step is specifying the correct adhesive system for the corrected process. Gravix Quality bridges failure analysis to specification.
"Generate Corrected Specification" button on investigations in Corrective Action or Verification status
Pre-fills the spec engine form with: substrate_a, substrate_b, environment, load type, and adds context: "This specification follows a failure investigation (GQ-YYYY-NNNN) where [previous adhesive] failed due to [root cause]. The new specification must address: [corrective requirements]."
Resulting spec is linked back to the investigation as a related record
Spec PDF can be included as an appendix to the 8D report
F6: Automatic Case Library Generation
Closed investigations with outcome "Resolved" and verified corrective actions automatically generate anonymized case library entries. This feeds the knowledge moat.
AI generates anonymized case summary: problem, root cause, solution, lessons learned
No company names, part numbers, or proprietary information in published cases
Case tagged with: substrate pair, adhesive type, failure mode, industry, root cause category
Published to /cases for SEO indexing and free-tier browsing
Investigation owner can opt-out of case publication before closure
F7: Photo Capture & Annotation
Every 8D report requires annotated defect photos. Quality engineers must circle delamination zones, arrow crack propagation paths, and label contamination areas. Without in-app annotation, teams will detour through PowerPoint, killing workflow stickiness.
F7.1 Photo Upload
Drag-and-drop or click-to-upload on any discipline section (D2 through D7)
Supported formats: JPEG, PNG, HEIC (auto-converted to JPEG), BMP, TIFF
Max file size: 20MB per image, auto-compressed to 2MB for report embedding
EXIF metadata preserved for timestamp and GPS data (useful for traceability)
Mobile-responsive: camera button opens device camera directly on mobile browsers (no native app required)
Batch upload: up to 10 images at once per discipline section
F7.2 Annotation Canvas
Canvas overlay on uploaded images with the following tools: freehand draw (red pen, adjustable thickness), circle/ellipse (for highlighting defect areas), arrow (for indicating crack direction, failure origin), rectangle (for bounding regions of interest), text label (for callouts like "delamination zone", "contamination", "crack origin")
Color picker: red (default), blue, green, yellow, white, black
Undo/redo stack (up to 20 actions)
Save produces a flattened annotated image (original preserved separately for audit trail)
Both original and annotated versions stored; 8D report PDF uses annotated version
Side-by-side comparison: toggle between original and annotated in the investigation detail view
F7.3 Report Integration
Annotated photos auto-inserted into the corresponding discipline section of the 8D PDF
Image captions: user can add a text caption per photo (e.g., "Figure 1: Bond line failure at substrate interface, 10x magnification")
Photo order is drag-sortable; order in the UI = order in the PDF
Maximum 6 photos per discipline section in the PDF (additional available via appendix or digital link)
F7.4 Technical Implementation
Frontend: HTML5 Canvas API with Fabric.js library for annotation tools
Storage: Supabase Storage bucket (investigation-photos/{investigation_id}/{discipline}/{filename})
Compression: Sharp.js server-side for HEIC conversion and resize
Annotation data stored as JSON overlay (non-destructive) plus flattened export for PDF
F8: Comments & Discussion Threads
8D investigations are inherently collaborative. The process engineer, materials engineer, supplier quality rep, and production manager debate root causes and corrective actions. Without threaded discussion within Gravix, this conversation happens in email/Slack and the investigation becomes a dead document that gets filled in after decisions are already made elsewhere.
F8.1 Discipline-Level Comments
Each discipline section (D1-D8) has its own comment thread, visible as a collapsible panel on the right side of the investigation detail page
Comments support rich text: bold, italic, inline code (for part numbers), and image paste (screenshots)
@mention any team member by typing @ — triggers email and in-app notification to the mentioned user
Threaded replies: comments can be replied to, creating nested threads (max 2 levels deep to keep it clean)
Reaction emoji: thumbs up/down for quick consensus signaling without cluttering the thread
Pin comment: Team Lead can pin a comment to the top of a discipline thread (e.g., "Final consensus: root cause confirmed as incomplete cure")
F8.2 Resolution Markers
Team Lead can mark a comment as "Resolution" — this becomes the official conclusion for that discipline
Resolution comments are highlighted in the thread and included in the 8D report PDF as a discussion summary
A discipline cannot be signed off without at least one resolution-marked comment (enforces documented team agreement)
F8.3 External Participants
Champions can invite external participants (supplier quality engineers, OEM reps) to comment on specific disciplines without granting full investigation access
External participants see only the discipline they are invited to, plus the D2 problem description for context
External comments are tagged with "External" badge in the thread
Useful for D3 (containment) where tier-2 suppliers need to confirm their containment actions
F9: Activity Audit Log
IATF 16949 and AS9100 auditors will ask: "When was the root cause analysis completed? Who approved the corrective actions? What changed between revision A and revision B?" Without a complete, immutable audit trail, the tool is unusable for certified facilities. This is a compliance hard requirement, not a feature.
F9.1 Tracked Events
Investigation lifecycle: created, status changed (with from/to), closed, reopened
Team changes: member added, member removed, role changed
Content edits: any field modification on the investigation record (stores field name, old value hash, new value hash, full diff for text fields)
Action items: created, assigned, status changed, due date changed, completed, cancelled
Attachments: uploaded, deleted, annotation saved
AI events: analysis triggered, results received, results edited by user (diff tracked)
Comments: posted, edited, deleted, pinned, marked as resolution
Signatures: discipline signed off, signature revoked (if investigation reopened)
Report events: PDF generated (revision number), shareable link created, link accessed (by whom if authenticated, by IP if anonymous)
Notifications: sent (type, recipient, channel)
F9.2 Audit Log Properties
Immutable: log entries cannot be edited or deleted by any user, including admins
Timestamped: UTC timestamp with millisecond precision on every entry
User-attributed: every entry records the acting user_id (system events attributed to "system")
Filterable: UI allows filtering by event type, user, discipline, date range
Exportable: CSV and PDF export of the full audit log for external auditor review
Visible on investigation detail page as a "History" tab showing chronological timeline
F9.3 Diff Tracking for AI Edits
When a user modifies AI-generated content (root causes, corrective actions, 5-Why chain), the audit log stores a structured diff showing exactly what the AI proposed vs. what the human approved. This is critical for regulatory defensibility — it proves a qualified human reviewed and modified the AI output before it entered the official 8D record.
AI output stored as ai_original_content (immutable snapshot at generation time)
Human edits tracked as field-level diffs: {field: "root_causes[0].cause", ai_value: "Surface contamination", human_value: "Surface contamination from residual mold release agent", edited_by: user_id, edited_at: timestamp}
Report PDF includes a metadata section (optional, Enterprise plan): "AI-Assisted Analysis reviewed and approved by [user] on [date]"
F10: Email-In Investigation Creation
The OEM complaint arrives as an email: "Subject: 8D Required — Part 4472-B debonding failure, Lot 2026-0219." Today the quality manager reads it, opens Word, and starts typing. With email-in, they forward the complaint to Gravix and an investigation draft is created in seconds.
F10.1 Inbound Email Processing
Each organization gets a unique inbound address: 8d@{org-slug}.gravix.io (e.g., 8d@continental.gravix.io)
Alternatively, a universal address with user routing: {user-id}@8d.gravix.io
Email parsed by inbound webhook (SendGrid Inbound Parse or Resend equivalent)
Subject line mapped to investigation title
Email body mapped to D2 problem description (5W2H "What" field)
Attachments (images, PDFs, docs) auto-uploaded to investigation as D2 attachments
Sender email matched to Gravix user; if no match, investigation created as draft requiring manual claim
Customer complaint reference extracted via regex pattern matching on common OEM formats (Ford: GSDB complaint #, Toyota: SQM reference, VW: QPN number)
F10.2 Smart Draft Population
AI scans the email body and extracts structured data where possible: part number, failure description, affected quantity, customer name
Extracted fields pre-populate the investigation form as a draft (status: "Draft", not "Open")
User reviews the draft, corrects any extraction errors, adds team members, and clicks "Open Investigation" to begin the workflow
Original email preserved as an attachment for audit trail
F10.3 Reply Threading
Outbound notification emails include a reply-to address that routes back to the investigation comment thread
Team members can reply to notification emails and their reply appears as a comment on the relevant discipline
This allows engineers who are on the shop floor (mobile email only) to participate without logging into Gravix
F11: Notification System
Without notifications, the quality manager has to manually check Gravix for updates, which means they will not. Notifications are the connective tissue that keeps investigations moving and prevents them from going stale.
F11.1 Notification Events

F11.2 Notification Preferences
Per-user settings: toggle email vs. in-app for each event type
Digest mode: instead of real-time emails, receive a daily digest at 8 AM local time summarizing all investigation activity
Quiet hours: no email notifications between configurable hours (default 8 PM - 7 AM local)
Per-investigation mute: users can mute notifications for specific investigations they are passively observing
F11.3 In-App Notification Center
Bell icon in top navigation with unread count badge
Dropdown panel showing recent notifications grouped by investigation
Click notification to navigate directly to the relevant discipline/action/comment
Mark all as read, mark individual as read
Notification feed page (/notifications) with full history, filterable by investigation and event type
F12: OEM-Specific Report Templates
Ford, Toyota, BMW, and VW each expect different 8D formats. A one-size-fits-all PDF will get rejected. This is the difference between a tool that quality managers try once and a tool they use for every investigation.
F12.1 Built-In Templates

F12.2 Template Selection
Selected at investigation creation: "Which OEM is this for?" dropdown sets the default template
Can be changed at any time before closure (re-renders the report in the new format)
Organization-level default: quality manager sets a default template in account settings (e.g., "All our investigations use Ford Global 8D unless specified")
Quality tier: access to Generic 8D and one OEM template. Enterprise tier: all templates.
F12.3 Custom Branding (Enterprise)
Upload company logo (displayed on cover page and report header)
Set company name, address, and quality contact info (auto-populated in report footer)
Custom color scheme: primary and accent colors applied to report headers and section dividers
Remove "Generated by Gravix Quality" footer — white-label reports for OEM submission
Custom fields: Enterprise accounts can add up to 10 custom fields to investigations (e.g., "Safety Critical: Y/N", "Cost Center", "Program Code") that appear in the report
AI-Forward Platform Features
The following six features leverage the structured Gravix dataset to future-proof the platform as AI models improve. The core strategic insight: Gravix's long-term value is not in the AI (which is a commodity that gets cheaper and better every quarter) — it is in the structured, validated, outcome-confirmed dataset that only Gravix possesses. These features are designed to grow that dataset in richness and volume while automatically improving in quality as underlying models advance.
F13: Visual Failure Analysis
The single highest-impact AI capability. Currently an engineer types "the bond failed at the substrate interface." An experienced adhesive engineer looking at the actual fracture surface can classify the failure mode in seconds — adhesive failure (clean substrate), cohesive failure (torn adhesive), mixed mode, or substrate failure. This distinction completely changes the root cause. Multimodal models can already do this; next-gen models will be dramatically better.
F13.1 Image-Augmented Analysis
Optional image upload field added to the failure analysis intake form (alongside the existing text description)
When images are present, they are sent to the Claude API as part of the analysis prompt via the multimodal content block (base64-encoded image + text)
AI performs visual classification: failure mode (adhesive / cohesive / mixed / substrate failure), surface condition assessment (contamination visible, discoloration, moisture evidence, UV degradation), bond line thickness uniformity, coverage assessment (full wet-out vs. partial coverage vs. starved joint)
Visual findings are cross-referenced with the text description — the AI flags contradictions (e.g., engineer writes "adhesive failure" but photo shows cohesive fracture pattern)
Confidence scores adjusted based on visual evidence: analysis with photo evidence gets a confidence boost vs. text-only analysis
F13.2 Visual Pattern Database
When a case is closed with confirmed outcome, the uploaded images are tagged with: confirmed root cause, failure mode classification, substrate pair, adhesive type, environmental conditions
Stored in visual_analysis_results table linking image hashes to confirmed outcomes
Future analysis prompt injection: "Here are 12 reference images of confirmed adhesive failure on aluminum substrates from our database. Compare the user's submitted photo to these reference patterns."
As the visual database grows past 1,000 confirmed images, this becomes a proprietary visual reference library that no competitor can replicate without the same volume of confirmed-outcome data
Privacy: images used for AI context are never shown to other users; only aggregated visual pattern statistics are shared
F13.3 Photo-to-Report Pipeline
AI-generated image captions: "Figure 1: Fracture surface of adhesive joint showing predominantly adhesive failure mode. Clean aluminum substrate visible on left coupon (arrows) indicates poor wetting. Residual adhesive on right coupon shows cohesive zone limited to edges."
Auto-generated for the 8D report D2 and D4 sections, editable by the engineer
Saves 15-20 minutes of manual photo captioning per investigation
F14: Technical Data Sheet (TDS) Intelligence Layer
Every adhesive product has a Technical Data Sheet specifying recommended substrates, surface prep, cure schedules, operating ranges, and mechanical properties. These are PDFs on manufacturer websites. There are approximately 50,000-100,000 adhesive products globally across Henkel (Loctite), 3M, Sika, Permabond, Lord, Huntsman, H.B. Fuller, and hundreds of smaller manufacturers. By ingesting and structuring this data, Gravix transforms from knowing general adhesive chemistry to knowing the specific product's requirements.
F14.1 TDS Ingestion Pipeline
Manual upload: user uploads a TDS PDF via admin interface or during analysis intake ("Upload the TDS for the product you're using")
AI extraction: Claude processes the TDS PDF and extracts structured data into the product_specifications table: product_name, manufacturer, chemistry_type (epoxy, cyanoacrylate, polyurethane, silicone, acrylic, anaerobic, etc.), recommended_substrates (array), surface_prep_requirements (text), cure_schedule (JSON: {type: heat|RT|UV|moisture|anaerobic, temperature_min_c, temperature_max_c, time_min_hours, time_max_hours, humidity_range}), operating_temp_range (min/max °C), mechanical_properties (JSON: {lap_shear_mpa, t_peel_n_mm, impact_kj_m2, elongation_pct}), shelf_life_months, mix_ratio (for 2-part), pot_life_minutes, fixture_time_minutes
Extraction confidence scoring: AI rates its confidence per field (high/medium/low) based on TDS clarity. Low-confidence fields flagged for human review.
Seed database: manually enter the top 100 most commonly referenced adhesive products (by analysis intake frequency) to establish baseline coverage
Crowdsourced growth: when a user enters a product name not in the database, prompt them to upload the TDS. This builds the database organically from user activity.
F14.2 Specification-Aware Analysis
New optional field on analysis intake: "Product used" — autocomplete against product_specifications table
When product is matched, the analysis prompt includes: "According to the manufacturer TDS for [product], the following specifications apply: [structured data]. The user's reported conditions are: [user inputs]. Deviations from manufacturer specifications: [computed diff]."
AI explicitly identifies specification violations as potential root causes, ranked by severity: temperature out of range > missing surface prep > wrong substrate > cure time insufficient
Analysis output includes a new section: "Manufacturer Specification Compliance" — a checklist of TDS requirements vs. actual conditions with pass/fail per item
F14.3 Cross-Vendor Product Comparison
This is the feature that commands enterprise pricing. By combining TDS data with field failure outcomes, Gravix can generate validated product comparisons:
"For aluminum-to-CFRP bonding in automotive structural applications, our database shows: Product A has a 4% field failure rate across 847 applications, Product B at 7% across 312 applications, Product C at 2% across 156 applications."
Comparison factors: field failure rate, most common failure mode per product, average time-to-failure in similar environments, root cause distribution
Gated to Enterprise tier — this is the data that adhesive manufacturers will eventually want to license
Anonymized: no company or facility names, only aggregated outcome statistics per product
F15: Agentic Multi-Step Investigation
Current analysis is one-shot: submit form, receive results. This leaves value on the table because the AI cannot ask clarifying questions, request additional information, or run multiple analysis passes. Agentic investigation mode transforms Gravix from a diagnostic tool into an AI investigator that guides the engineer through a structured diagnostic interview.
F15.1 Conversational Diagnostic Mode
New analysis mode accessible via toggle: "Quick Analysis" (existing one-shot) vs. "Guided Investigation" (conversational)
AI initiates with targeted diagnostic questions based on the initial failure description, prioritized by information value: What questions, if answered, would most narrow the root cause hypothesis space?
Dynamic question flow: AI selects next question based on previous answers (not a fixed questionnaire). Example: if user reports failure after environmental exposure, AI drills into specific environment (temperature range, humidity, UV, chemical exposure, thermal cycling) rather than asking about cure conditions
Each answer refines the analysis in real-time — the user can see the root cause ranking update as they provide more information
Photo request at the right moment: AI asks for a fracture surface photo when visual analysis would be most diagnostic (e.g., after determining the failure mode is ambiguous from text description alone)
Session-based: conversation state persisted in investigation_sessions table. User can pause and resume. Conversation history included in 8D report as an appendix.
F15.2 Tool-Use Integration
AI has access to internal tools during the investigation conversation: lookup_product_tds(product_name) — retrieves TDS data from product_specifications table, search_similar_cases(substrates, failure_mode, environment) — queries knowledge_patterns and case library, check_specification_compliance(product_id, conditions) — runs TDS compliance check, generate_5why(root_cause, context) — generates 5-Why chain for a specific hypothesis
Tool calls are visible to the user as "AI is checking the product specifications..." or "AI is searching 847 similar cases..." — builds trust and shows the system working
Tool results feed back into the conversation context, enabling multi-hop reasoning: "Based on the TDS for Loctite 495, your operating temperature (15°C) is below the minimum fixturing temperature (20°C). And our database shows 23 similar cases of cyanoacrylate slow-cure failures at temperatures below spec — in 78% of cases, increasing fixture temperature resolved the issue."
F15.3 Investigation Summary Generation
At the end of the guided investigation, AI generates a structured summary equivalent to the one-shot analysis output — ranked root causes, contributing factors, corrective actions — but informed by the full conversation
Summary includes "Investigation Reasoning" section showing how each answer narrowed the diagnosis (useful for 8D D4 documentation)
One-click conversion to 8D investigation: all conversation data flows into D2 (problem description from answers) and D4 (root cause from analysis)
F16: Cross-Case Pattern Recognition (Epidemiology Engine)
With 1,000+ cases with confirmed outcomes, Gravix can identify patterns that no individual engineer would ever see. This is adhesive failure epidemiology — detecting emerging trends, product quality shifts, and seasonal patterns across the entire installed base.
F16.1 Automated Cluster Detection
Weekly cron job (expandable to daily) runs statistical analysis across recent cases looking for: time clusters (spike in failures for a specific product/substrate pair in the last 30/60/90 days), geographic clusters (multiple facilities in a region experiencing similar failures), product lot clusters (failures correlating with specific manufacturer lot numbers), seasonal patterns (recurring failures in specific months — temperature/humidity driven)
Detection algorithm: Z-score analysis on failure frequency per product/substrate/failure_mode combination. A cluster is flagged when the failure rate exceeds 2 standard deviations above the rolling 12-month average.
Each detected cluster generates a pattern_alert record with: alert_type (time/geographic/product_lot/seasonal), affected entities, statistical confidence, potential explanation hypothesis (AI-generated)
F16.2 Alert Distribution
When a cluster is detected, affected users receive a proactive notification: "Alert: 340% increase in [Product X] failures on [Substrate Y] in the last 60 days across 4 facilities. This may indicate a formulation change or raw material substitution. Affected investigations: [list]. Recommended: contact manufacturer technical support."
Admin dashboard shows active alerts with trend charts and affected investigation links
Enterprise accounts can opt into cross-organization alerts (anonymized) — they see industry-wide trends without seeing other companies' data
Alert severity levels: Informational (statistical anomaly, may be noise), Warning (strong pattern, investigation recommended), Critical (safety-relevant pattern, e.g., structural adhesive failures in automotive)
F16.3 Trend Intelligence Reports
Monthly auto-generated report for Enterprise accounts: "Gravix Intelligence Digest" — top emerging failure patterns, most common root causes this month vs. last month, product quality trends, seasonal forecasts
Publishable (anonymized) industry trend reports — positions Gravix as an industry authority, drives SEO and thought leadership
Future: offer trend data via API to adhesive manufacturers as a data licensing revenue stream
F17: Specification-to-Failure Loop Closure
Currently the spec engine and failure engine are separate tools with a simple cross-link. With the product database and outcome data, Gravix can close the loop: when a spec analysis recommends a product, the system automatically checks the failure database and warns the user about known failure patterns with that exact combination.
F17.1 Proactive Risk Flagging in Spec Engine
When the spec engine recommends an adhesive product, automatically query the failure database for: any documented failures with this product + substrate combination, the most common root cause for failures with this product, environmental conditions that correlate with failures for this product
If matches found, inject a "Known Risks" section into the spec output: "Gravix database contains N documented failures of [Product] on [Substrate]. In X% of cases, the root cause was [cause]. Recommended precaution: [action]."
Risk severity calculated from failure rate: <2% = green (low risk), 2-10% = yellow (moderate risk, precautions recommended), >10% = red (high risk, consider alternative product)
Alternative product suggestions ranked by field failure rate: "Consider [Alternative Product] which shows a Y% failure rate in Z similar applications."
F17.2 Post-Implementation Tracking
When a spec is generated as part of an 8D corrective action (via F5 cross-link), the spec is tagged as a "corrective specification" with a link back to the original failure
System monitors future analyses: if a new failure is reported with the same substrate pair AND the corrective product, the original investigation team is notified: "A new failure was reported using the product specified in your corrective action for GQ-2026-0042. This may indicate the corrective action was insufficient."
Closes the feedback loop: specification → implementation → field outcome → specification refinement
F18: Data Asset Architecture (Future-Proofing)
As the confirmed-outcome dataset grows past 10,000 cases, Gravix possesses the only curated, structured, outcome-validated dataset of real-world adhesive failures in existence. This section defines the data architecture that maximizes the value of this asset across three time horizons.
F18.1 Structured Outcome Tagging
Every closed investigation with a confirmed outcome generates a structured outcome record: {substrates (normalized), adhesive_product, adhesive_chemistry, failure_mode (visual + text classified), root_cause_confirmed (human-validated), contributing_factors, environment (temp, humidity, UV, chemical), cure_conditions_actual vs. cure_conditions_specified, time_to_failure, corrective_action_taken, corrective_action_effective (boolean), time_to_verify_effectiveness}
Outcome records are the atomic unit of Gravix's data moat — every record makes the system smarter
Quality score per record: completeness percentage (how many fields populated), verification depth (feedback only vs. full 8D with verification), confidence level (from knowledge aggregator)
F18.2 Fine-Tuning Readiness
Export pipeline: generate JSONL training data from confirmed outcomes in the format {prompt: [failure description + conditions], completion: [confirmed root cause + effective corrective action], metadata: [confidence, verification method]}
At 5,000+ high-quality records, evaluate fine-tuning a domain-specific model that has internalized adhesive failure patterns rather than receiving them via prompt injection (reduces latency, improves consistency, lowers per-analysis API cost)
At 10,000+ records, the fine-tuned model becomes a standalone asset — the AI equivalent of an experienced adhesive consulting engineer with exposure to 10,000 real-world failures
Training data includes negative examples: "This was initially diagnosed as [X] but was actually [Y]" to train the model on common misdiagnoses
F18.3 Data Licensing Pipeline
Anonymized, aggregated dataset exportable for licensing to: adhesive manufacturers (Henkel, 3M, Sika) for R&D field intelligence — how their products actually fail in the field vs. lab testing; insurance companies for manufacturing risk assessment; industry bodies (ASC, FEICA) for standards development; academic researchers for materials science studies
Licensing tiers: aggregate statistics only (failure rates by product/substrate, $10K-25K/year), full anonymized case data without company identifiers ($50K-100K/year), custom analysis reports on specific product/substrate combinations ($5K-15K per report)
Data governance: user consent captured at account creation. Enterprise accounts can opt-out of data licensing pool entirely. No individual company data ever exposed — minimum aggregation threshold of 5 organizations per data point.
F18.4 Intake Form Enhancements
To maximize data richness per analysis, the intake form needs two new optional fields that feed the entire AI-forward pipeline:
"Product used" — autocomplete against product_specifications table. When matched, triggers TDS-aware analysis (F14) and cross-vendor comparison data collection
"Defect photos" — image upload (up to 5 images) on the analysis intake form (separate from 8D investigation photos). Triggers visual failure analysis (F13) and builds the visual pattern database
Both fields are optional to avoid friction, but the system shows progressive value: "Upload a photo for more accurate analysis" or "Select your product for specification-aware diagnostics"
Completion incentive: analyses with photos and product data receive a "Comprehensive Analysis" badge with expanded output sections (visual assessment, TDS compliance check). This encourages richer data input without requiring it.
F18.5 Product Performance Pages (SEO & Distribution)
Public pages organized by product that serve two strategic purposes: (1) SEO capture of engineers searching for "[product name] failure" or "[product name] problems," and (2) the foundation for future manufacturer partnerships. These pages are the organic entry point that turns every adhesive manufacturer's product catalog into Gravix's keyword list.
Route: /products/{manufacturer-slug}/{product-slug} (e.g., /products/henkel/loctite-495)
Page content (all anonymized, no company or facility identifiers): product name, manufacturer, chemistry type, key TDS specifications (substrates, cure schedule, operating range), field performance summary (total documented applications, field failure rate, most common failure modes ranked, most common root causes ranked, most common application errors), related case library entries (linked)
CTA modules: "Using [product] in production? Get AI-powered failure analysis" → signup funnel. "Experiencing a [product] failure? Start a free diagnosis" → analysis intake with product pre-selected. "Compare [product] to alternatives" → Enterprise-gated cross-vendor comparison (F14.3)
Minimum data threshold: product page only published when Gravix has 10+ documented applications for that product (avoids publishing pages with statistically meaningless data)
SEO metadata: auto-generated title tags ("Loctite 495 Field Performance & Failure Analysis | Gravix"), meta descriptions, structured data (Product schema markup), alt text on any reference images
Product index page: /products — searchable/filterable catalog of all products with published performance pages, sorted by total documented applications. Becomes an industry resource that drives organic traffic.
F18.6 Manufacturer Claims & Future Partnership Architecture
Reserve the data architecture for a future manufacturer engagement model without building the portal. When the data asset reaches critical mass (~2,000 confirmed outcomes, 500+ products), manufacturers will want access to their field intelligence. This section ensures the schema is ready when they come knocking.
New fields on product_specifications table: manufacturer_claimed (BOOLEAN, DEFAULT false) — indicates whether the manufacturer has verified and claimed this product listing; manufacturer_org_id (UUID, NULLABLE, FK to organizations) — links to a future manufacturer organization account; manufacturer_verified_at (TIMESTAMPTZ, NULLABLE) — when the claim was approved; manufacturer_contact_email (TEXT, NULLABLE) — for future outreach; claimed_tds_version (TEXT, NULLABLE) — TDS revision the manufacturer confirmed as current
Claiming flow (NOT built at launch, architecture reserved): manufacturer creates a Gravix account with a "Manufacturer" organization type. They request to claim product listings by verifying domain ownership (e.g., email from @henkel.com). Upon approval, they get read access to anonymized field performance data for their products. This is the hook for data licensing (F18.3).
Future partnership plays enabled by this architecture: "Diagnose with Gravix" embed widget for manufacturer product support pages (distribution deal), manufacturer-verified TDS data (higher confidence than AI-extracted, improves analysis quality), co-branded product performance reports (manufacturer provides lab data, Gravix provides field data), direct-to-manufacturer failure alerts via F16 when cluster detection identifies a product quality issue (relationship builder)
Strategic timing: do NOT approach manufacturers until Gravix has (a) 200+ TDS entries for their products, (b) meaningful field failure data they cannot get elsewhere, (c) published product performance pages that already rank for their product keywords. Arrive at the negotiation with leverage, not a pitch deck.
F19: API Protection & Rate Limiting
Every AI inference endpoint MUST require authentication. No anonymous analysis. This is both a cost protection measure (each analysis costs $0.04-0.07 in API fees) and a conversion optimization — unauthenticated usage leaks value with zero data capture.
Auth Gating Strategy
The analysis and specification intake forms are publicly visible and fully interactive — any visitor can fill in substrates, adhesive type, failure description, and upload photos. This is by design: the form is the conversion tool. Filling it out is a 2-3 minute time investment that creates sunk cost. The gate drops when the user clicks "Analyze" or "Generate Specification." At that moment, if the user is not authenticated, the UI presents a login/register modal. No CAPTCHA, no friction beyond account creation. After authentication, the analysis fires immediately using the form data already entered — zero re-entry required. The user sees their results within seconds of creating their account.
This means every single Anthropic API call happens behind Supabase Auth. The free tier (5 analyses/month) is generous but requires a logged-in user. This captures an email address at the exact moment of highest intent, enables nurture sequences, and ensures every analysis feeds the knowledge base with an identifiable user profile.
What Stays Public (No Auth, No API Cost)
Product performance pages (/products/:manufacturer/:slug) — static content pre-generated from the database, no inference required. These are the SEO engine and must be fully public and crawlable.
Case library (/library) — pre-generated public content. Same logic: no per-request API cost, maximum organic traffic.
Analysis intake form UI — visible, fillable, interactive. Does NOT submit without auth. Form state persisted in localStorage so nothing is lost during the login/register flow.
Public product index (/products) — searchable, filterable catalog page. No auth required.
Shareable investigation links (/investigations/:id/share/:token) — read-only 8D report view for OEM reps. Token-gated, not auth-gated.
Rate Limiting
All rate limits enforced via middleware. Limits are per-user (by user_id from Supabase Auth JWT), with IP-based fallback for unauthenticated endpoints. Rate limit state stored in Supabase (rate_limits table) with TTL-based cleanup. Responses include X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers. Exceeded limits return 429 Too Many Requests with a JSON body containing the limit, reset time, and an upgrade CTA message.

IP-Based Abuse Protection
Account creation rate limit: maximum 3 accounts per IP per 24 hours. Prevents scripted account creation to bypass per-user limits.
Failed login throttling: after 5 failed attempts from same IP, 15-minute lockout. Prevents credential stuffing.
Concurrent session limit: maximum 3 active sessions per user. Prevents credential sharing.
Email verification required: accounts must verify email before first analysis. Prevents throwaway accounts. Verification email sent via SendGrid with 24-hour expiry link.
Admin alert: if any single user exhausts their monthly analysis quota within the first 48 hours, flag for review (potential abuse pattern or very high-value lead).
Frontend Implementation
Analysis form (/analyze, /specify): form renders fully for all visitors. All input fields functional. "Analyze" / "Generate Specification" button checks auth state. If unauthenticated, opens login/register modal (not a redirect — modal overlay preserves form state). After successful auth, form auto-submits. If authenticated but over monthly limit, shows upgrade CTA with remaining count.
Monthly usage counter: displayed in the form header for free-tier users — "3 of 5 analyses remaining this month." Creates urgency without being aggressive. Counter resets on calendar month boundary (UTC).
Post-analysis upgrade prompt: after each free-tier analysis, show non-blocking banner — "Upgrade to Pro for unlimited analyses and deeper AI diagnostics." Do not gate the results themselves (the user already authenticated and spent a credit). Gating results after the analysis would feel like a bait-and-switch.
localStorage persistence: form field values saved to localStorage on every input change. After login/register redirect, form auto-populates from localStorage. Cleared after successful submission.

Data Model
New Tables
All tables are additive. No modifications to existing V2 tables. Total: 15 new tables.
investigations

investigation_members

investigation_actions

investigation_signatures

investigation_attachments

investigation_comments

investigation_audit_log
Immutable append-only table. No UPDATE or DELETE permissions granted to any role.

notifications

notification_preferences

report_templates
product_specifications
Core of the TDS intelligence layer. Populated by AI extraction from uploaded TDS PDFs and manual entry.

visual_analysis_results

pattern_alerts

investigation_sessions
rate_limits
Composite index on (user_id, endpoint, window_key). TTL cleanup: cron deletes rows where window_start < now() - 60 days. Rate limit checks use SELECT ... FOR UPDATE to prevent race conditions under concurrent requests.
API Specification

AI Prompt Specifications
The 8D module adds three new AI prompt templates that extend the existing failure analysis system prompt, plus one email parsing prompt. No new AI model or API integration required — these are additional prompt templates sent to the same Claude API endpoint.
Prompt 1: 5-Why Chain Generator
Input: Top-ranked root cause from failure analysis + failure description + substrate pair.
Output: JSON array of 5 levels, each with {level: 1-5, question: "Why did X happen?", answer: "Because Y", evidence: "supporting detail"}. The 5th Why should reach a systemic root cause (process gap, training gap, or design gap) not a proximate cause.
Prompt 2: 8D Narrative Generator
Input: Complete investigation data (D1-D7 fields), failure analysis results, knowledge context, action items with statuses.
Output: Formatted prose narrative for each discipline section, written in the formal, third-person style expected by OEM quality auditors. Must use passive voice and technical language appropriate for automotive/aerospace quality documentation. Cites confidence scores and empirical data from Gravix knowledge base where available.
Prompt 3: Escape Point Analyzer
Input: Root cause analysis results + production process description (from 5W2H "Where in process" field).
Output: {escape_point: string, control_type: "inspection|test|SPC|audit", why_missed: string, recommended_control: string}. Identifies the earliest point in the production flow where the root cause could have been detected and explains why the existing control failed.
Prompt 4: Inbound Email Parser
Input: Raw email subject + body + list of attachment filenames.
Output: JSON object with extracted fields: {title: string, customer_name: string|null, complaint_ref: string|null, part_number: string|null, failure_description: string, affected_quantity: number|null, severity_guess: "critical|major|minor", confidence: number}. Uses regex patterns for common OEM reference formats and NLP extraction for unstructured complaint text.
Prompt 5: Visual Failure Classifier
Input: One or more images of the fracture surface or failed assembly (base64 multimodal content blocks) + text description from engineer + substrate pair + adhesive type (if known).
Output: {failure_mode: "adhesive|cohesive|mixed|substrate", visual_indicators: [{indicator: string, location: string, significance: string}], surface_condition: string, bond_line_assessment: string, coverage_estimate_pct: number, contradiction_with_text: string|null, confidence: number, auto_caption: string}. The auto_caption is a publication-ready figure caption for the 8D report. If the visual classification contradicts the text description, the AI must flag the contradiction explicitly.
Prompt 6: TDS Extraction
Input: TDS PDF content (as document content block or extracted text).
Output: Structured JSON matching the product_specifications table schema. Each field includes an extraction_confidence rating (high: clearly stated in TDS, medium: inferred from context, low: approximate or ambiguous). Fields not found in the TDS are returned as null. The AI should also extract warnings, limitations, and incompatible substrates as a separate warnings array.
Prompt 7: Guided Investigation Orchestrator
Input: Conversation history (message array), current analysis state (accumulated data from previous answers), available tools (lookup_product_tds, search_similar_cases, check_specification_compliance, generate_5why), knowledge context from knowledge_patterns table if available.
Output: {next_action: "ask_question|call_tool|present_findings|request_photo|generate_summary", question?: string, tool_call?: {name: string, params: object}, findings?: string, summary?: AnalysisResult}. The orchestrator decides at each turn whether to ask another question, invoke an internal tool, or present findings. It targets completing the investigation in 5-8 turns, prioritizing questions by information value (which question would most narrow the root cause hypothesis space).
Prompt 8: Pattern Cluster Detector
Input: Aggregated case statistics for the detection window: failure counts per product/substrate/failure_mode combination for current period vs. historical baseline, geographic distribution of recent failures, temporal distribution.
Output: Array of detected clusters, each with: {alert_type, title, description, affected_entities, statistical_confidence, hypothesis, severity, recommended_action}. The hypothesis should propose a plausible explanation (formulation change, seasonal effect, supply chain issue) and the recommended action should be specific and actionable.
Frontend Specifications
New Pages

Modified Pages
Dashboard (/dashboard): Add "Investigations" card showing: N open, N overdue actions, N awaiting closure. Click navigates to /investigations.
Analysis Results (/analyze/[id]): Add "Create 8D Investigation" button below the existing FeedbackPrompt component. Passes analysis_id as query param to /investigations/new.
Navigation: Add "Investigations" link in main nav between "History" and "Cases". Badge shows count of open investigations. Add bell icon (notification center) in top-right header with unread count.
Settings (/settings): Add "Notifications" tab for notification preferences (digest mode, quiet hours, per-event toggles). Add "Report Templates" tab for Enterprise branding (logo upload, colors, company info).
Investigation Detail Page Components
The /investigations/[id] page is the primary workspace and the most complex new page. It consists of the following components:
Header bar: Investigation number, title, status badge, severity badge, customer name, days open counter, "Generate Report" button
Discipline stepper (left column, 70% width): Vertical accordion with D1-D8 sections. Active step expanded, completed steps show green checkmark, future steps grayed. Each section contains its form fields, action items, photo gallery with annotation capability, and sign-off button.
Comment panel (right column, 30% width): Tabbed by discipline. Shows threaded comments with @mentions, resolution markers, pinned comments at top. Comment composer at bottom with rich text toolbar and image paste.
Tabs below stepper: "Actions" (filterable list of all action items across disciplines), "Photos" (gallery view of all annotated images), "History" (audit log timeline with filters), "Report" (preview and export).
Photo annotation modal: Opens on click of any uploaded image. Full-screen canvas with annotation toolbar (draw, circle, arrow, rectangle, text, color picker). Save/cancel buttons. Side-by-side toggle for original vs. annotated.
Pricing Model

Revenue Projections

Key assumptions: 3% free-to-Pro conversion, 5% Pro-to-Quality upgrade, 15% Quality-to-Enterprise upgrade for companies with 5+ active investigators. Quality tier extra seat revenue not modeled above (conservative). Enterprise deals assume 6-month sales cycle beginning Month 4.
Implementation Plan

Total implementation: 19 development days across 5 sprints, targeting full launch 34 days after V2 ships. Sprints 7-9 deliver the core 8D workflow (MVP). Sprint 10 adds collaboration and compliance features. Sprint 11 adds AI-forward capabilities that deepen the data moat and future-proof the platform. All sprints are backend-first (API + DB), then frontend in the same sprint. Dependencies: Claude API (existing), Supabase (existing), SendGrid (email-in), Supabase Storage (photos + TDS PDFs).
Success Metrics
Launch Metrics (First 90 Days)

Steady-State Metrics (6+ Months)

AI-Forward Metrics (12+ Months)

Risks and Mitigations

Future Roadmap (Post-Launch)
30-Day Fast-Follow Features
These features should ship within 30 days of launch. They are high-value for retention and enterprise upsell but do not block initial adoption.

Long-Term Roadmap (Quarters 2-4)

Infrastructure & Operational Costs
Gravix runs on a minimal-footprint stack: Vercel (frontend), Supabase (database + auth + storage), Render (backend API + workers), Anthropic API (inference), and SendGrid (email). Gross margins exceed 95% at every growth stage. This section defines what to provision at each milestone.
Service Stack

Launch Infrastructure Checklist
Vercel: Upgrade Hobby to Pro ($20/mo). Enable ISR for product performance pages. Configure preview deployments from GitHub.
Supabase: Upgrade Free to Pro ($25/mo). Run 14 new table migrations from PRD v1.4. Enable Row Level Security on all tables. No compute upgrades needed until Month 4-6.
Render: Upgrade Starter to Standard ($25/mo, 1 vCPU, 2GB RAM). Single instance handles 400+ analyses/month. Set health check endpoint. Configure auto-deploy from GitHub main branch. No background worker needed until Month 4.
Anthropic: Enable prompt caching from day one — system prompt and knowledge context reused across calls yields 20-25% cost reduction. Stay on Sonnet for all tasks. Tier 1 rate limits sufficient at launch volume.
SendGrid: Create account on free tier (100 emails/day). Set up domain authentication (SPF, DKIM). Configure inbound parse webhook on Render worker endpoint for email-in investigation creation (F10).
Sentry: Free tier (5K events/month). Point at Render and Vercel deployments. Configure Slack webhook for error rate alerts >1%.
Scaling Triggers
Month 4-6: Enable Supabase Storage bucket for photo attachments and TDS PDFs. Enable point-in-time recovery ($100/mo). Add Render background worker ($7/mo) for cron jobs (pattern detection, email-in processing, digest emails).
Month 7-12: Add Supabase compute upgrade (2 vCPU, 4GB RAM, $50/mo) when concurrent connections exceed shared tier limits. Split PDF generation to separate Render worker ($7/mo) to prevent API blocking during 8D report generation. Add database indexes on product_specifications(product_name), pattern_alerts(status, created_at), investigations(org_id, status).
Year 2: Evaluate Supabase Team plan ($599/mo) when needing read replica for pattern detection cron (avoids production DB load during weekly analysis of full case database). Enable connection pooling via pgBouncer. Upgrade Render to 2x Standard or Pro tier. Implement model routing: Haiku for email parsing and TDS extraction, Sonnet for analysis and 8D narrative.
Year 3 Bull: Supabase Team with read replica. Consider table partitioning on audit_log and notifications if exceeding 50M rows. Render Pro with autoscaling. Evaluate Anthropic batch API for pattern detection (50% cost reduction). If confirmed-outcome dataset exceeds 5,000 records, evaluate fine-tuning economics vs. continued prompt injection.
Cost Per Analysis
Blended cost per analysis (Anthropic API after prompt caching): $0.04-0.07 depending on volume and feature mix. Analysis with photo (multimodal) costs approximately 2x text-only due to image token overhead. Guided investigation mode (multi-turn) averages 5-8 API calls per session, costing $0.20-0.35 per completed investigation. 8D narrative generation (4 prompts: 5-Why, escape point, narrative, email parser) costs approximately $0.10-0.15 per investigation. Pattern detection weekly cron costs $0.25-0.50 per run regardless of case volume (aggregated statistics, not per-case inference). At $79/month Pro pricing, even the most expensive analysis path (guided + photos + 8D) costs under $0.50 — well under 1% of monthly subscription revenue.
Appendix
A. Glossary

B. Reference Documents
Gravix V2 Unified Specification (gravix-v2-specification.md) — Database schema, AI engine, feedback system, knowledge aggregator, observability
Gravix Testing Plan (gravix-testing-plan.md) — Unit, integration, E2E, and AI test specifications
Ford 8D Problem Solving Manual (1987, revised) — Original 8D methodology reference
AIAG CQI-20: Effective Problem Solving Practitioner Guide — Industry-standard 8D training material
IATF 16949:2016 Section 10.2.3 — Problem solving requirements for automotive suppliers


Product | Gravix Quality (8D Module) | Version | 1.4
Author | Ev (Product Owner) | Date | February 2026
Status | Draft for Review | Priority | P0 — Revenue Multiplier
Sprint | Sprints 7-11 (Post V2 Launch) | Est. Effort | 19 dev-days

 | Summary
Problem | Manufacturing facilities with ISO/IATF/AS certifications must produce 8D corrective action reports for every adhesive failure. Today this takes 15-40 person-hours using Word templates, with weak root cause analysis that OEMs frequently reject.
Solution | Gravix Quality auto-generates complete 8D reports by running the existing AI failure analysis engine, formatting the output into the standard 8D structure (D1-D8), and adding workflow features for team collaboration, action tracking, verification, and electronic sign-off.
Impact | Reduces 8D cycle time from 10-15 business days to 1-3 days. Elevates ARPU from $79 to $299-799/month. Unlocks quality department budgets as the buyer instead of individual engineering discretionary spend.

Metric | Current (Pro Only) | With 8D Module
Primary Buyer | Individual engineer | Quality department
Purchase Authority | Personal/discretionary | Department budget line
ARPU | $79/month | $299-799/month
Seats per Account | 1 | 3-10 (cross-functional)
Churn Risk | High (cancel after solving problem) | Low (historical 8D records lock-in)
Year 3 ARR Target | $400-680K | $1.0-1.5M

Role | Quality Manager / Quality Engineer at Tier 1 automotive or aerospace supplier
Company Size | 50-500 employees, $10M-200M revenue, IATF 16949 or AS9100 certified
Pain Today | Manages 5-20 adhesive-related 8D investigations per month. Each takes 15-40 person-hours. OEMs (Ford, Toyota, BMW) reject 20-30% for insufficient root cause analysis. Uses Word templates and Excel tracking.
Budget Authority | $500-5,000/month for quality tools. Already paying for QMS software. Has authority to purchase SaaS tools under $10K/year without VP approval.
Success Metric | 8D cycle time reduction, OEM rejection rate, audit readiness, cost of quality.

Role | Manufacturing / Process / Applications Engineer assigned to 8D investigations
Pain Today | Spends 60% of 8D time on documentation, not problem-solving. Has domain expertise but struggles to articulate root causes in the structured language that OEM auditors expect. Duplicates analysis across similar failures.
Gravix Value | AI does the heavy lifting on D4 (root cause) and D5-D7 (corrective/preventive actions). Engineer reviews, edits, adds domain context, and signs off rather than writing from scratch.

Role | Supplier Quality Engineer at OEM (Ford, Toyota, Boeing) who reviews submitted 8D reports
Pain Today | Receives 8Ds with vague root cause ("adhesive failed"), no data-backed analysis, missing containment evidence, no verification plan. Sends back 20-30% for rework.
Gravix Impact | Receives 8Ds with confidence-scored root causes, empirical data from similar cases, structured corrective actions, and verification criteria. Approval rate increases.

Status | Disciplines Active | Entry Criteria | Exit Criteria
Open | D1, D2 | Investigation created | Team assigned, problem described
Containment | D3 | D1+D2 complete | At least 1 containment action logged with date and owner
Investigating | D4 | D3 complete | Root cause analysis complete (AI-generated or manually entered)
Corrective Action | D5, D6 | D4 complete | Corrective actions defined with owners and due dates
Verification | D6, D7 | D5 complete | Effectiveness verified, preventive actions documented
Closed | D8 | D6+D7 complete | Approver sign-off recorded

Event | Recipients | Channel
Investigation created | All team members | Email + In-app
Assigned as Team Lead/Champion | Assigned user | Email + In-app
Action item assigned to you | Action owner | Email + In-app
Action due in 3 days | Action owner | Email
Action due tomorrow | Action owner + Team Lead | Email + In-app
Action overdue | Action owner + Team Lead + Champion | Email + In-app (daily)
Status changed | All team members | In-app
Discipline signed off | All team members | In-app
@mentioned in comment | Mentioned user | Email + In-app
Investigation closed | All team members | Email + In-app
Shareable link accessed | Team Lead | In-app
Investigation overdue (no status change in 7 days) | Champion + Team Lead | Email (escalation)

Template | Description | Key Differences
Generic 8D | Standard 8D format compatible with ISO 9001, IATF 16949, AS9100 | Default template. D1-D8 sections with Gravix branding.
Ford Global 8D | Matches Ford GSDB supplier portal expectations | Adds D0 (planning/ERA), requires escape point analysis, includes Ford-specific severity rating (S/O/D)
VDA 8D | German automotive standard (VW, BMW, Mercedes, Audi) | German-language section headers option, VDA problem-solving fields, Ishikawa diagram mandatory, A4 paper size default
A3 Report | Toyota-style single-page problem-solving format | Landscape orientation, single page, condensed layout, current/target condition framing instead of D1-D8
AS9100 CAPA | Aerospace CAPA format with additional certification fields | Adds airworthiness impact assessment, FAR/EASA reference fields, nonconformance classification

Endpoint | Free | Pro | Quality / Enterprise
POST /v1/analyze | 5/month, 3/hour | Unlimited, 20/hour | Unlimited, 60/hour
POST /v1/specify | 5/month, 3/hour | Unlimited, 20/hour | Unlimited, 60/hour
POST /v1/analyze/visual | 5/month, 2/hour | Unlimited, 10/hour | Unlimited, 30/hour
POST /v1/analyze/guided (start) | 2/month, 1/hour | Unlimited, 5/hour | Unlimited, 20/hour
POST /v1/analyze/guided/:sid/reply | 10/session | 20/session | 30/session
POST /v1/products/extract-tds | Not available | 5/hour | 20/hour
POST /v1/investigations | Not available | Not available | 20/hour
All GET endpoints | 60/min | 120/min | 300/min

Column | Type | Description | Constraints
id | UUID | Primary key | PK, DEFAULT gen_random_uuid()
investigation_number | TEXT | Human-readable ID | UNIQUE, NOT NULL, GQ-YYYY-NNNN
title | TEXT | Investigation title | NOT NULL
status | TEXT | Workflow status | CHECK (open|containment|investigating|corrective_action|verification|closed)
severity | TEXT | Impact severity | CHECK (critical|major|minor)
product_part_number | TEXT | Part or product ID | NULLABLE
customer_name | TEXT | OEM customer name | NULLABLE
customer_complaint_ref | TEXT | OEM reference number | NULLABLE
lot_batch_number | TEXT | Affected lot/batch | NULLABLE
defect_quantity | INTEGER | Number of defective units | NULLABLE
scrap_rework_cost | DECIMAL | Financial impact ($) | NULLABLE
analysis_id | UUID | FK to failure_analyses | NULLABLE, FK
spec_id | UUID | FK to spec_requests | NULLABLE, FK
five_whys | JSONB | AI-generated 5-Why chain | NULLABLE
escape_point | TEXT | Earliest missed control point | NULLABLE
fishbone_data | JSONB | Ishikawa categories | NULLABLE
closure_summary | TEXT | Auto-generated D8 narrative | NULLABLE
lessons_learned | TEXT | Free text lessons | NULLABLE
publish_case | BOOLEAN | Opt-in to case library | DEFAULT true
report_template_key | TEXT | Selected 8D template | DEFAULT 'generic_8d'
source_email_id | TEXT | Inbound email message ID | NULLABLE (set when created via email-in)
created_by | UUID | FK to users | NOT NULL, FK
created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT now()
updated_at | TIMESTAMPTZ | Last modified | DEFAULT now()
closed_at | TIMESTAMPTZ | Closure timestamp | NULLABLE

Column | Type | Description | Constraints
id | UUID | Primary key | PK
investigation_id | UUID | FK to investigations | NOT NULL, FK, ON DELETE CASCADE
user_id | UUID | FK to users | NOT NULL, FK
role | TEXT | Team role | CHECK (champion|team_lead|member|approver)
added_at | TIMESTAMPTZ | When added to team | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK
investigation_id | UUID | FK to investigations | NOT NULL, FK, ON DELETE CASCADE
discipline | TEXT | Which 8D step | CHECK (D3|D5|D6|D7)
action_type | TEXT | Category | CHECK (containment|corrective|verification|preventive)
category | TEXT | Change type | NULLABLE (design_change|process_change|material_change|training|supplier_action|doc_update)
description | TEXT | Action description | NOT NULL
owner_user_id | UUID | Responsible person | FK to users
priority | TEXT | Urgency | CHECK (P1|P2|P3), DEFAULT P2
due_date | DATE | Target completion | NULLABLE
completed_date | DATE | Actual completion | NULLABLE
status | TEXT | Action status | CHECK (open|in_progress|complete|cancelled), DEFAULT open
verification_method | TEXT | How verified (D6 only) | NULLABLE
verification_criteria | TEXT | Pass/fail criteria | NULLABLE
verification_result | TEXT | Actual result | NULLABLE
evidence_urls | JSONB | Attached file URLs | DEFAULT '[]'
created_at | TIMESTAMPTZ | Creation time | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK
investigation_id | UUID | FK to investigations | NOT NULL, FK
user_id | UUID | Who signed | NOT NULL, FK
discipline | TEXT | Which step signed off | NOT NULL
signature_hash | TEXT | SHA-256 of content at sign time | NOT NULL
signed_at | TIMESTAMPTZ | Signature timestamp | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK
investigation_id | UUID | FK to investigations | NOT NULL, FK
action_id | UUID | FK to investigation_actions | NULLABLE, FK
discipline | TEXT | Which 8D step | NOT NULL
file_name | TEXT | Original filename | NOT NULL
file_url | TEXT | Storage URL | NOT NULL
file_size_bytes | INTEGER | File size | NOT NULL
is_image | BOOLEAN | Whether file is an image | DEFAULT false
annotation_data | JSONB | Canvas annotation overlay (JSON) | NULLABLE
annotated_file_url | TEXT | Flattened annotated image URL | NULLABLE
original_file_url | TEXT | Pre-annotation original URL | NULLABLE
caption | TEXT | Image caption for report | NULLABLE
sort_order | INTEGER | Display order within discipline | DEFAULT 0
uploaded_by | UUID | FK to users | NOT NULL, FK
uploaded_at | TIMESTAMPTZ | Upload timestamp | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK
investigation_id | UUID | FK to investigations | NOT NULL, FK, ON DELETE CASCADE
discipline | TEXT | Which 8D step | NOT NULL (D1-D8)
parent_comment_id | UUID | FK to self for replies | NULLABLE, FK
user_id | UUID | Comment author | NOT NULL, FK
body | TEXT | Comment content (rich text as HTML) | NOT NULL
is_resolution | BOOLEAN | Marked as resolution | DEFAULT false
is_pinned | BOOLEAN | Pinned to top | DEFAULT false
is_external | BOOLEAN | From external participant | DEFAULT false
mentioned_user_ids | UUID[] | Users @mentioned | DEFAULT '{}'
image_urls | JSONB | Inline pasted images | DEFAULT '[]'
edited_at | TIMESTAMPTZ | Last edit timestamp | NULLABLE
created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT now()

Column | Type | Description | Constraints
id | BIGSERIAL | Primary key (auto-increment) | PK
investigation_id | UUID | FK to investigations | NOT NULL, FK
event_type | TEXT | Event category | NOT NULL (see F9.1 list)
event_detail | TEXT | Human-readable description | NOT NULL
actor_user_id | UUID | Who performed the action | NULLABLE (null = system)
discipline | TEXT | Related discipline | NULLABLE
target_type | TEXT | Entity acted on | NULLABLE (investigation|action|comment|attachment|signature)
target_id | UUID | ID of acted-on entity | NULLABLE
diff_data | JSONB | Field-level change data | NULLABLE (old/new values)
ai_original_content | JSONB | Snapshot of AI output before human edit | NULLABLE
ip_address | INET | Client IP for anonymous access events | NULLABLE
created_at | TIMESTAMPTZ | Event timestamp | DEFAULT now(), NOT NULL

Column | Type | Description | Constraints
id | UUID | Primary key | PK
user_id | UUID | Recipient | NOT NULL, FK
investigation_id | UUID | Related investigation | NOT NULL, FK
event_type | TEXT | Notification type | NOT NULL
title | TEXT | Notification headline | NOT NULL
body | TEXT | Detail text | NOT NULL
link_path | TEXT | Deep link to relevant page | NOT NULL
is_read | BOOLEAN | Read status | DEFAULT false
email_sent | BOOLEAN | Email delivery status | DEFAULT false
created_at | TIMESTAMPTZ | Notification timestamp | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK
user_id | UUID | FK to users | NOT NULL, UNIQUE, FK
email_enabled | BOOLEAN | Global email toggle | DEFAULT true
digest_mode | BOOLEAN | Daily digest instead of real-time | DEFAULT false
digest_hour_utc | INTEGER | Hour to send digest (0-23 UTC) | DEFAULT 15
quiet_start_utc | INTEGER | Quiet hours start (0-23 UTC) | NULLABLE
quiet_end_utc | INTEGER | Quiet hours end (0-23 UTC) | NULLABLE
event_overrides | JSONB | Per-event channel preferences | DEFAULT '{}'
muted_investigations | UUID[] | Investigations to suppress | DEFAULT '{}'

Column | Type | Description | Constraints
id | UUID | Primary key | PK
org_id | UUID | FK to organizations | NULLABLE (null = system template)
template_key | TEXT | Template identifier | NOT NULL (generic_8d|ford_global|vda_8d|a3_report|as9100_capa)
display_name | TEXT | User-facing name | NOT NULL
paper_size | TEXT | Default paper format | CHECK (letter|a4), DEFAULT letter
orientation | TEXT | Page orientation | CHECK (portrait|landscape), DEFAULT portrait
logo_url | TEXT | Company logo storage URL | NULLABLE (Enterprise only)
brand_primary_color | TEXT | Hex color for headers | NULLABLE
brand_accent_color | TEXT | Hex color for accents | NULLABLE
company_info | JSONB | Name, address, contact | NULLABLE
custom_fields | JSONB | Up to 10 custom field definitions | DEFAULT '[]'
hide_gravix_branding | BOOLEAN | White-label mode | DEFAULT false (Enterprise only)
section_config | JSONB | Section labels, order, visibility overrides | DEFAULT '{}'
is_default | BOOLEAN | Organization default template | DEFAULT false

Column | Type | Description | Constraints
id | UUID | Primary key | PK
product_name | TEXT | Commercial product name | NOT NULL
manufacturer | TEXT | Manufacturer name | NOT NULL
chemistry_type | TEXT | Adhesive chemistry | NOT NULL (epoxy|cyanoacrylate|polyurethane|silicone|acrylic|anaerobic|MS_polymer|phenolic|other)
recommended_substrates | TEXT[] | TDS-listed substrates | DEFAULT '{}'
surface_prep_requirements | TEXT | Prep instructions from TDS | NULLABLE
cure_schedule | JSONB | Cure parameters | {type, temp_min_c, temp_max_c, time_min_hrs, time_max_hrs, humidity_range}
operating_temp_min_c | DECIMAL | Min service temp (°C) | NULLABLE
operating_temp_max_c | DECIMAL | Max service temp (°C) | NULLABLE
mechanical_properties | JSONB | Strength data from TDS | {lap_shear_mpa, t_peel_n_mm, impact_kj_m2, elongation_pct}
mix_ratio | TEXT | Mixing ratio (2-part) | NULLABLE
pot_life_minutes | INTEGER | Working time after mix | NULLABLE
fixture_time_minutes | INTEGER | Time to handling strength | NULLABLE
full_cure_hours | INTEGER | Time to full strength | NULLABLE
shelf_life_months | INTEGER | Unopened shelf life | NULLABLE
tds_pdf_url | TEXT | Original TDS file URL | NULLABLE
extraction_confidence | JSONB | Per-field extraction confidence | DEFAULT '{}'
field_failure_count | INTEGER | Total documented failures | DEFAULT 0
field_failure_rate | DECIMAL | Failure rate from Gravix data | NULLABLE (computed)
verified_by_user_id | UUID | Human who reviewed extraction | NULLABLE, FK
manufacturer_claimed | BOOLEAN | Manufacturer verified listing | DEFAULT false
manufacturer_org_id | UUID | FK to manufacturer org account | NULLABLE, FK
manufacturer_verified_at | TIMESTAMPTZ | When claim was approved | NULLABLE
manufacturer_contact_email | TEXT | Manufacturer outreach email | NULLABLE
claimed_tds_version | TEXT | TDS revision manufacturer confirmed | NULLABLE
page_published | BOOLEAN | Product perf page live | DEFAULT false
page_slug | TEXT | URL slug for perf page | NULLABLE, UNIQUE
created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT now()
updated_at | TIMESTAMPTZ | Last modified | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK
analysis_id | UUID | FK to failure_analyses | NOT NULL, FK
image_url | TEXT | Source image URL | NOT NULL
image_hash | TEXT | SHA-256 for deduplication | NOT NULL
ai_failure_mode | TEXT | AI visual classification | NULLABLE (adhesive|cohesive|mixed|substrate)
ai_visual_findings | JSONB | Detailed visual observations | NULLABLE
ai_confidence | DECIMAL | Visual classification confidence | NULLABLE (0-1)
confirmed_failure_mode | TEXT | Human-verified classification | NULLABLE
confirmed_root_cause | TEXT | From closed investigation | NULLABLE
substrate_pair_normalized | TEXT | Normalized substrates | NULLABLE
adhesive_chemistry | TEXT | Adhesive type | NULLABLE
environment_tags | TEXT[] | Environmental conditions | DEFAULT '{}'
is_reference_image | BOOLEAN | Eligible for AI reference set | DEFAULT false
created_at | TIMESTAMPTZ | Creation timestamp | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK
alert_type | TEXT | Pattern category | NOT NULL (time_cluster|geographic|product_lot|seasonal|cross_product)
severity | TEXT | Alert level | CHECK (informational|warning|critical)
title | TEXT | Alert headline | NOT NULL
description | TEXT | AI-generated explanation | NOT NULL
affected_product | TEXT | Product name if applicable | NULLABLE
affected_substrates | TEXT | Substrate pair if applicable | NULLABLE
affected_failure_mode | TEXT | Failure mode if applicable | NULLABLE
statistical_confidence | DECIMAL | Z-score or p-value | NOT NULL
baseline_rate | DECIMAL | Expected failure rate | NOT NULL
observed_rate | DECIMAL | Current failure rate | NOT NULL
window_days | INTEGER | Detection window | NOT NULL
affected_investigation_ids | UUID[] | Related investigations | DEFAULT '{}'
affected_org_count | INTEGER | Number of orgs affected | NOT NULL
hypothesis | TEXT | AI-suggested explanation | NULLABLE
status | TEXT | Alert lifecycle | CHECK (active|acknowledged|resolved|dismissed), DEFAULT active
created_at | TIMESTAMPTZ | Detection timestamp | DEFAULT now()
resolved_at | TIMESTAMPTZ | Resolution timestamp | NULLABLE

Column | Type | Description | Constraints
id | UUID | Primary key | PK
analysis_id | UUID | FK to failure_analyses | NULLABLE, FK
investigation_id | UUID | FK to investigations | NULLABLE, FK
user_id | UUID | FK to users | NOT NULL, FK
mode | TEXT | Investigation type | CHECK (quick|guided)
status | TEXT | Session state | CHECK (active|paused|completed|abandoned)
conversation_history | JSONB | Full message array | DEFAULT '[]'
tool_calls | JSONB | Record of AI tool invocations | DEFAULT '[]'
extracted_data | JSONB | Structured data from conversation | NULLABLE
final_analysis | JSONB | Generated summary at completion | NULLABLE
message_count | INTEGER | Number of turns | DEFAULT 0
ai_token_usage | INTEGER | Total tokens consumed | DEFAULT 0
created_at | TIMESTAMPTZ | Session start | DEFAULT now()
updated_at | TIMESTAMPTZ | Last message | DEFAULT now()

Column | Type | Description | Constraints
id | UUID | Primary key | PK, DEFAULT gen_random_uuid()
user_id | UUID | User being rate limited | FK to auth.users, NULLABLE (IP-based if null)
ip_address | INET | Client IP for unauthenticated limits | NULLABLE
endpoint | TEXT | API endpoint path | NOT NULL
window_key | TEXT | Rate window identifier | NOT NULL, e.g. 'hourly', 'monthly', 'per_session'
window_start | TIMESTAMPTZ | Current window start time | NOT NULL
request_count | INTEGER | Requests in current window | DEFAULT 0
limit_value | INTEGER | Maximum allowed in window | NOT NULL
plan_tier | TEXT | User plan at time of check | free|pro|quality|enterprise

Method | Endpoint | Description | Notes
POST | /v1/investigations | Create investigation | Auth required, Quality+ plan
GET | /v1/investigations | List user's investigations | Filterable: status, severity, customer
GET | /v1/investigations/:id | Get investigation detail | Auth + team member access
PATCH | /v1/investigations/:id | Update investigation fields | Auth + Team Lead/Champion only
POST | /v1/investigations/:id/team | Add team member | Auth + Team Lead/Champion
DELETE | /v1/investigations/:id/team/:uid | Remove team member | Auth + Team Lead/Champion
POST | /v1/investigations/:id/analyze | Run AI root cause analysis (D4) | Triggers full Gravix analysis pipeline
POST | /v1/investigations/:id/actions | Add action item (D3/D5/D6/D7) | Auth + team member
PATCH | /v1/investigations/:id/actions/:aid | Update action item | Auth + action owner or Team Lead
POST | /v1/investigations/:id/attachments | Upload file attachment | Max 20MB, Auth + team member
POST | /v1/investigations/:id/sign/:discipline | Electronic sign-off | Auth + Approver (D8) or Team Lead
POST | /v1/investigations/:id/close | Close investigation | Requires all D1-D7 complete + approver sign
GET | /v1/investigations/:id/report | Generate 8D report (PDF/DOCX) | Auth + team member
GET | /v1/investigations/:id/share | Generate shareable read-only link | Auth + Team Lead/Champion
GET | /v1/investigations/:id/revisions | List report revision history | Auth + team member
POST | /v1/investigations/:id/spec | Generate corrected specification | Cross-links to spec engine
POST | /v1/investigations/:id/comments | Add comment to discipline | Auth + team/external member
PATCH | /v1/investigations/:id/comments/:cid | Edit or pin comment | Auth + comment author or Team Lead
DELETE | /v1/investigations/:id/comments/:cid | Delete comment | Auth + comment author or Team Lead
POST | /v1/investigations/:id/comments/:cid/resolve | Mark comment as resolution | Auth + Team Lead only
POST | /v1/investigations/:id/photos | Upload photo to discipline | Auth + team member, max 20MB
PUT | /v1/investigations/:id/photos/:pid/annotate | Save annotation overlay | Auth + team member
GET | /v1/investigations/:id/audit-log | Get investigation audit trail | Auth + team member, exportable
GET | /v1/investigations/:id/audit-log/export | Export audit log (CSV/PDF) | Auth + Team Lead/Approver
POST | /v1/inbound/email | Webhook: inbound email processing | SendGrid/Resend webhook, secret validation
GET | /v1/notifications | List user notifications | Auth required, paginated
PATCH | /v1/notifications/read | Mark notifications as read | Auth required, accepts array of IDs
GET | /v1/notifications/preferences | Get notification preferences | Auth required
PUT | /v1/notifications/preferences | Update notification preferences | Auth required
GET | /v1/report-templates | List available templates | Auth + Quality+ plan
GET | /v1/report-templates/:key | Get template details | Auth + plan-gated per template
PUT | /v1/report-templates/org-default | Set org default template | Auth + admin role
PUT | /v1/report-templates/branding | Update custom branding | Auth + Enterprise plan only
POST | /v1/analyze/visual | Run visual failure analysis with images | Auth required, rate limited, images as multipart/form-data
POST | /v1/analyze/guided | Start guided investigation session | Auth required, rate limited, returns session_id
POST | /v1/analyze/guided/:sid/reply | Send reply in guided investigation | Auth required, per-session rate limit
GET | /v1/analyze/guided/:sid | Get session state and history | Auth, session owner only
POST | /v1/products | Add product to specifications DB | Auth + admin or via TDS upload
GET | /v1/products | Search product specifications | Auth, autocomplete-enabled
GET | /v1/products/:id | Get product detail + field stats | Auth required
POST | /v1/products/extract-tds | Upload TDS PDF for AI extraction | Auth, max 10MB PDF
GET | /v1/products/:id/field-performance | Get field failure stats for product | Auth + Enterprise plan
GET | /v1/products/compare | Cross-vendor product comparison | Auth + Enterprise, query: product_ids[]
GET | /v1/alerts | List active pattern alerts | Auth + admin or Enterprise
PATCH | /v1/alerts/:id | Acknowledge/resolve/dismiss alert | Auth + admin
GET | /v1/alerts/:id | Get alert detail with investigations | Auth + affected team member
POST | /v1/cron/detect-patterns | Trigger pattern detection job | X-Cron-Secret required
GET | /v1/intelligence/trends | Monthly trend intelligence data | Auth + Enterprise plan
GET | /v1/products/public | Public product index (paginated) | No auth, SEO crawlable
GET | /v1/products/public/:manufacturer/:slug | Public product performance page data | No auth, min 10 applications
POST | /v1/products/:id/claim | Manufacturer claims product listing | Auth + manufacturer org type (future)

Route | Description
/investigations | Investigation list with search, filter (status, severity, customer, date range), sort, and kanban/list toggle. Shows: investigation number, title, customer, severity badge, status badge, team lead, last updated, days open.
/investigations/new | Create investigation form. Two paths: (1) blank form, (2) pre-filled from existing analysis ID passed as query param. Validates required fields. Shows team member selector with email invite.
/investigations/[id] | Investigation detail — the main workspace. Vertical stepper showing D1-D8 as collapsible sections. Active step expanded, completed steps collapsed with green checkmarks, future steps grayed. Each section shows its fields, action items, attachments, and sign-off status.
/investigations/[id]/report | 8D report preview. Full rendered preview of the PDF with "Download PDF", "Download DOCX", and "Create Shareable Link" buttons. Shows revision selector dropdown.
/investigations/[id]/share/[token] | Read-only shared view. No auth required. Shows the 8D report content with Gravix branding. OEM customer quality reps use this link to review without creating an account.
/notifications | Full notification history page. Filterable by investigation and event type. Mark as read individually or in bulk. Link to notification preferences settings.
/products | Public product index page. Searchable/filterable catalog of all products with published performance pages. Sorted by total documented applications. No auth required. SEO-optimized with structured data markup.
/products/[manufacturer]/[product] | Public product performance page. Shows TDS specs, field failure rate, common failure modes, common root causes, related case library entries. CTAs for signup and free diagnosis. No auth required. Minimum 10 documented applications to publish.
/analyze/guided | Guided investigation mode. Chat-like interface showing AI questions and user responses. Real-time root cause ranking sidebar updates as answers narrow the hypothesis space. Tool-use indicators ("Searching similar cases..."). Session pause/resume. One-click convert to 8D investigation at completion.
/alerts | Pattern alerts dashboard (admin/Enterprise). Active alerts with trend charts, affected investigation links, severity badges. Acknowledge/resolve/dismiss actions. Filter by alert type and severity.

Feature | Free ($0) | Pro ($79/mo) | Quality ($299/mo) | Enterprise ($799/mo)
Failure Analyses | 5/month (account req'd) | Unlimited | Unlimited | Unlimited
Spec Analyses | 5/month (account req'd) | Unlimited | Unlimited | Unlimited
8D Investigations | None | None | Unlimited | Unlimited
Seats | 1 | 1 | 3 included (+$79/ea) | 10 included (+$49/ea)
Photo Annotation | N/A | N/A | Full tools | Full tools
Comments & Threads | N/A | N/A | Full (team only) | Full + external guests
Audit Log | N/A | N/A | View only | View + CSV/PDF export
Email-In Creation | N/A | N/A | 1 inbound address | Unlimited + routing rules
Notifications | N/A | N/A | Email + in-app | Email + in-app + digest
Report Templates | N/A | N/A | Generic + 1 OEM | All templates + custom
8D Report PDF | N/A | N/A | Gravix-branded | Custom branding
Shareable Links | N/A | N/A | 5 active | Unlimited
API Access | No | No | No | Yes
SSO / SAML | No | No | No | Yes
Exec Summary | Blurred preview | Full access | Full access | Full access
Knowledge Data | Case count only | Full detail | Full detail | Full detail + export

Metric | Month 6 | Year 1 | Year 2 | Year 3 (Base) | Year 3 (Bull)
Free Users | 500 | 2,000 | 6,000 | 15,000 | 25,000
Pro ($79) | 20 | 80 | 250 | 500 | 800
Quality ($299) | 3 | 15 | 50 | 150 | 250
Enterprise ($799) | 0 | 2 | 8 | 25 | 40
MRR | $2,477 | $12,403 | $41,092 | $104,325 | $169,910
ARR | $29,724 | $148,836 | $493,104 | $1,251,900 | $2,038,920

Sprint | Days | Deliverables | Verification
Sprint 7 | Days 16-18 (3 days) | Database migration (10 new tables including comments, audit log, notifications, templates). Investigation CRUD API. Team management endpoints. Status workflow engine. Audit log middleware (auto-logs all investigation mutations). | Can create investigation, add team, transition statuses. Every mutation generates an audit log entry. Tables exist with correct constraints and indexes.
Sprint 8 | Days 19-22 (4 days) | AI 8D prompts (5-Why, narrative, escape point, email parser). 8D PDF generation with Generic and Ford templates. Action item CRUD. Attachment upload + photo storage. Electronic signature capture. Shareable link generation. | Can run AI analysis within investigation, generate formatted 8D PDF with all sections, upload evidence, sign off on disciplines.
Sprint 9 | Days 23-26 (4 days) | Frontend: investigation list, create, detail page (stepper + comment panel + photo gallery + audit history tab), report preview, shared view. Dashboard widget. Nav updates with notification bell. Cross-linking to spec engine. Quality/Enterprise plan billing integration. | Full user flow works end-to-end: create investigation from analysis results, run AI D4, add actions, annotate photos, comment with @mentions, generate PDF, share with OEM, close with sign-off.
Sprint 10 | Days 27-30 (4 days) | Photo annotation canvas (Fabric.js). Comment system with threads, @mentions, resolution markers. Notification system (events, preferences, in-app center, email delivery). Email-in webhook (SendGrid inbound parse, AI extraction, draft creation). OEM templates (VDA 8D, A3, AS9100 CAPA). Enterprise branding (logo, colors, white-label). | Can annotate defect photos inline. Team members receive notifications on assignments and overdue items. Forwarding an email to 8d@org.gravix.io creates a draft investigation. Reports render in Ford, VDA, and A3 formats.
Sprint 11 | Days 31-34 (4 days) | AI-Forward: product_specifications table + TDS extraction pipeline (AI PDF parsing + manual entry for top 100 products). Visual analysis integration (image upload on intake form, multimodal prompt, visual_analysis_results storage). Guided investigation mode (conversation UI, session management, tool-use orchestrator). Pattern detection cron job + pattern_alerts table + alert UI on admin dashboard. Specification-to-failure loop (risk flagging in spec engine output). product_name and defect_photos fields on analysis intake form. | Can upload a TDS PDF and get structured product data extracted. Analysis with photos produces visual failure classification. Guided mode asks follow-up questions and uses internal tools. Weekly cron detects failure clusters and alerts affected users. Spec engine warns about known failure patterns.

Metric | Target | Measurement
Quality plan signups | > 10 in 90 days | Stripe subscription data
Investigations created | > 50 in 90 days | investigations table count
8D PDFs generated | > 30 in 90 days | api_request_logs for /report endpoint
Average investigation completion time | < 5 business days | closed_at - created_at
Shareable links created | > 20 in 90 days | Share link generation events
Quality-to-Enterprise upgrade rate | > 10% | Stripe plan change events
Comments per investigation | > 5 avg | investigation_comments count / investigations count
Photos annotated per investigation | > 2 avg | investigation_attachments where annotated_file_url IS NOT NULL
Email-in investigations | > 10 in 90 days | investigations where source_email_id IS NOT NULL

Metric | Target | Why It Matters
Quality + Enterprise as % of MRR | > 60% | Validates the buyer shift from individual to department
Gross revenue retention (Quality tier) | > 90% | 8D audit trail creates switching cost
Average seats per Quality account | > 4 | Cross-functional expansion drives ARPU
Investigations per Quality account per month | > 3 | Active usage = retention
Case library entries from 8D closures | > 100 by month 12 | Knowledge moat growth from enterprise data
AI confidence lift (with vs. without knowledge) | > 15% | Validates the flywheel

Metric | Target | Why It Matters
Product specifications in TDS database | > 500 by month 12 | Coverage drives TDS-aware analysis adoption
% analyses with product matched to TDS | > 30% | Measures TDS utility and user engagement with product field
% analyses with defect photos uploaded | > 40% | Feeds visual pattern database, improves analysis quality
Visual analysis accuracy (vs. confirmed outcome) | > 75% | Validates visual classification capability
Guided investigation completion rate | > 60% | Users who start guided mode finish and find it useful
Confirmed-outcome records in data asset | > 2,000 by month 12 | Threshold for meaningful fine-tuning and licensing
Pattern alerts generated (true positives) | > 5 per quarter | Demonstrates cross-case intelligence value
Spec engine risk flags triggered | > 50 by month 12 | Validates spec-to-failure loop closure
Data licensing revenue | > $0 by month 18 | First external revenue from data asset

Risk | Severity | Mitigation | Contingency
AI-generated root causes are inaccurate and quality manager loses trust | HIGH | Position AI output as "draft starting point" that Team Lead reviews and edits. Confidence scores set expectations. Knowledge injection improves over time. | Add prominent disclaimer: "AI-assisted analysis requires professional review." Allow full manual override of all D4 content.
Enterprise sales cycle too long for bootstrapped timeline | HIGH | Focus on Quality tier ($299) for self-serve signup. Enterprise is bonus revenue, not required for model to work. | Offer annual prepay discount (20% off) to accelerate Enterprise decisions.
Competing QMS vendors add AI features | MEDIUM | They will add generic AI. They cannot replicate the adhesive-specific knowledge base with empirical failure data. Moat deepens over time. | Accelerate case library growth. Publish data moat metrics publicly to reinforce differentiation.
Regulatory concern about AI in quality documentation | MEDIUM | 8D standard has no restriction on tools used for analysis. Human sign-off is the regulatory requirement — Gravix enforces this via electronic signature. | Add audit trail showing human reviewed and approved all AI-generated content before inclusion in report.
Low volume of adhesive-specific 8D investigations per facility | LOW | Facilities that do 5+ adhesive 8Ds/month are the sweet spot. Many auto suppliers hit this. For lower-volume facilities, the per-investigation time savings still justify $299/month. | Consider per-investigation pricing for low-volume users ($79/report) as an alternative to monthly subscription.

Feature | Description | Value
Measurement Data Viewer | Upload CSV/PDF lab results (tensile test, DSC curves, CMM reports). Parse CSV into a simple before/after chart rendered in the 8D report D6 section. Start with display, add chart generation later. | Eliminates the PowerPoint detour for embedding test data. Auditors can see verification evidence inline.
Pareto & Trend Analytics | Analytics page at /investigations/analytics. Pareto chart of top root cause categories (quarter/year). Trend line of investigations over time. Cycle time distribution histogram. Average days per status. Filterable by customer, product line, severity. | Quality managers present this data to VP of Quality at monthly reviews. Demonstrates systemic improvement. Justifies continued Gravix spend.
Mobile Photo Capture | Responsive web view optimized for phone screen. Camera button opens device camera. Quick-capture flow: take photo, add caption, select investigation + discipline, upload. No annotation on mobile (too small), but photos sync to desktop for annotation. | Shop floor engineers capture defect photos at the production line and get them into the investigation immediately without leaving the floor.
Similar Investigation Detection | On investigation creation, query knowledge_patterns and organization investigation history for matching substrate pair + failure mode. Surface: "3 similar investigations found. GQ-2026-0018 (closed, resolved) same substrate pair, root cause: surface contamination. View?" Uses existing normalizer and knowledge lookup. | Prevents teams from reinventing the wheel on recurring problems. Accelerates D4 by showing what worked last time. Powerful data moat demonstration.

Phase | Feature | Value | Timeline
Phase 1 | A3 Report Format (alternative to 8D, used in lean manufacturing) | Expands addressable market to Toyota-aligned supply chains | Month 2 post-launch
Phase 2 | FMEA Integration (link failure analyses to existing failure mode effects analyses) | Deepens enterprise lock-in. FMEA updates are a D7 requirement. | Month 4 post-launch
Phase 3 | Supplier Portal (external view for tier-2 suppliers to submit containment evidence) | Extends the product into the supply chain. Network effects. | Month 6 post-launch
Phase 4 | OEM Portal Integration (direct submission to Ford CQMS, Toyota SQM, VW Q-Cockpit) | Eliminates manual re-entry into OEM systems. Massive time savings. | Month 9 post-launch
Phase 5 | Predictive Failure Alerts (notify when knowledge base patterns suggest emerging failure trend) | Shifts Gravix from reactive to proactive. Premium feature for Enterprise. | Month 12 post-launch
Phase 6 | Slack/Teams Integration (comment notifications, investigation creation via slash commands, action item reminders) | Meets enterprise teams where they already work. Reduces friction for comment participation. | Month 6 post-launch
Phase 7 | QMS Webhooks (push investigation events to MasterControl, ETQ, Greenlight Guru, SAP QM) | Coexists with existing QMS instead of replacing it. Reduces enterprise adoption friction. | Month 9 post-launch
Phase 8 | Bulk Import & Historical Migration (Excel/CSV import for legacy 8D records) | New customers can migrate historical 8Ds into Gravix. Data feeds the knowledge moat retroactively. | Month 10 post-launch
Phase 9 | Manufacturer Partnership Portal (claim product listings, access anonymized field intelligence, embed "Diagnose with Gravix" widget on product support pages, co-branded performance reports) | Flips the manufacturer relationship from data source to paying customer. Distribution deal puts Gravix in front of every engineer on manufacturer support pages. Trigger: 2,000+ confirmed outcomes and 500+ products in TDS database. | Month 15-18 post-launch

Service | Launch (M1-3) | Scale (M7-12) | Year 2 | Year 3 Bull
Vercel | Pro ($20/mo) | Pro ($20/mo) | Pro ($25/mo) | Pro or Enterprise ($230/mo)
Supabase | Pro ($25/mo) | Pro + compute ($185/mo) | Pro + compute ($215/mo) | Team + replica ($1,229/mo)
Render | Standard ($25/mo) | Standard + workers ($39/mo) | Standard x2 ($100/mo) | Pro x2 ($355/mo)
Anthropic API | Sonnet ($5/mo) | Sonnet + caching ($63/mo) | Sonnet + routing ($235/mo) | Sonnet + Haiku ($3,260/mo)
SendGrid | Free | Essentials ($20/mo) | Essentials ($20/mo) | Pro ($90/mo)
Other (Sentry, Stripe, DNS) | $54/mo | $360/mo | $1,466/mo | $18,116/mo
TOTAL MONTHLY OPEX | $129/mo | $687/mo | $2,061/mo | $23,280/mo
GROSS MARGIN | 95% | 95% | 96% | 97%

Term | Definition
8D | Eight Disciplines Problem Solving. A structured methodology for identifying, correcting, and eliminating recurring problems. Originated at Ford Motor Company.
CAPA | Corrective and Preventive Action. FDA/ISO term for the formal process of investigating and resolving quality issues.
IATF 16949 | International Automotive Task Force quality management standard. Required for automotive supply chain.
AS9100 | Aerospace quality management standard based on ISO 9001 with additional aerospace-specific requirements.
5-Why | Root cause analysis technique that iteratively asks "Why?" to drill from symptom to systemic root cause.
Escape Point | The earliest control in the process that should have detected the failure but did not.
Ishikawa / Fishbone | Cause-and-effect diagram categorizing root causes across Man, Machine, Material, Method, Measurement, Mother Nature.
PPAP | Production Part Approval Process. Ensures suppliers can consistently manufacture parts meeting OEM requirements.
FMEA | Failure Mode and Effects Analysis. Proactive risk assessment tool identifying potential failure modes and their impact.

