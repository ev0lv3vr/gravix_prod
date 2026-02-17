# GRAVIX FRONTEND UPDATE SPEC — ADDENDUM
## Changes to Page-by-Page Spec for PRD v1.4
### February 2026

**Purpose:** This document specifies ONLY what changes from the original page-by-page spec. For anything not mentioned here, the original spec remains authoritative. Each section references the original component number being modified or specifies a new component being added.

**Conventions:**
- **REPLACE Component X.Y** — Remove old component, use this instead
- **MODIFY Component X.Y** — Keep existing component, apply listed changes
- **ADD Component X.Y.Z** — Insert new component at specified position
- **NEW PAGE** — Entirely new page not in original spec
- **DELETE** — Remove component entirely

---

# TABLE OF CONTENTS

1. [Navigation Updates](#1-navigation-updates)
2. [Landing Page Updates](#2-landing-page-updates)
3. [Tool Page Updates — Spec Engine & Failure Analysis](#3-tool-page-updates)
4. [Auth Modal Updates](#4-auth-modal-updates)
5. [Pricing Page — Full Replace](#5-pricing-page--full-replace)
6. [Dashboard Updates](#6-dashboard-updates)
7. [Settings Updates](#7-settings-updates)
8. [New Page: Investigations](#8-new-page-investigations)
9. [New Page: Guided Investigation](#9-new-page-guided-investigation)
10. [New Page: Product Catalog & Performance Pages](#10-new-page-product-catalog--performance-pages)
11. [New Page: Pattern Alerts](#11-new-page-pattern-alerts)
12. [New Page: Notification Center](#12-new-page-notification-center)
13. [Updated Component Reuse Map](#13-updated-component-reuse-map)
14. [Updated Build Order](#14-updated-build-order)

---

# 1. NAVIGATION UPDATES

## MODIFY: Global Nav — Logged Out

Original shows: Logo, "Analyze Failure", "Spec Engine", "Pricing", "Sign In", "Sign Up"

**New logged-out nav:**

```
[GRAVIX logo]    Analyze  •  Products  •  Case Library  •  Pricing    [Sign In]  [Get Started Free]
```

**Changes:**
- "Analyze Failure" and "Spec Engine" collapse into single "Analyze" dropdown with two items: "Failure Analysis" (→ `/failure`) and "Spec Engine" (→ `/tool`)
- ADD "Products" link → `/products` (public product catalog)
- ADD "Case Library" link → `/cases` (already built, just needs nav link)
- "Sign Up" button relabeled to "Get Started Free" — primary accent style, more action-oriented
- "Sign In" stays as ghost/text link

## MODIFY: Global Nav — Logged In

Original shows: Logo, tool links, "Dashboard", user menu

**New logged-in nav:**

```
[GRAVIX logo]    Analyze ▾  •  Products  •  Cases    Dashboard  •  Investigations  •  [🔔 3]  [User ▾]
```

**Changes:**
- "Analyze" dropdown: "Failure Analysis", "Spec Engine", "Guided Investigation" (→ `/failure?mode=guided`)
- ADD "Investigations" link → `/investigations` (visible only for Quality+ plans, hidden for Free/Pro)
- ADD notification bell icon with unread count badge → clicking opens `/notifications` dropdown or page
- User dropdown menu adds: "Notifications", "Settings", "Subscription", "Sign Out"
- Plan badge pill visible next to user name in dropdown: `Free`, `Pro`, `Quality`, `Enterprise` with color coding

## MODIFY: Global Nav — Mobile

- Hamburger menu groups: "Analyze" section (Failure, Spec, Guided), "Explore" section (Products, Cases), "Account" section (Dashboard, Investigations, Notifications, Settings)
- Notification bell stays visible in mobile header (not collapsed into hamburger)

---

# 2. LANDING PAGE UPDATES

## REPLACE Component 1.1: Hero Section

Old hero: "Specify industrial adhesives with confidence. Diagnose failures in minutes."

**New hero:**

```
                 The adhesive intelligence platform
                  for manufacturing quality teams.

       AI-powered failure analysis, 8D investigation management,
     and cross-case pattern detection — backed by real production data,
                        not just textbook theory.

        [Analyze a Failure]     [See How It Works ↓]

              Free to start • No credit card required
```

**Specs:**
- Headline: 48px (desktop) / 32px (mobile), font-bold, text-white, max-width 800px, centered
- "for manufacturing quality teams" on second line, same style (not smaller — this is the buyer signal)
- Subheadline: 18px, text-secondary (`#94A3B8`), max-width 640px, centered, line-height 1.6
- Key terms in subheadline: "failure analysis", "8D investigation management", "cross-case pattern detection" — these are the SEO targets and buyer keywords
- Primary CTA: "Analyze a Failure" — `bg-accent-500 hover:bg-accent-600`, links to `/failure`
- Secondary CTA: "See How It Works ↓" — ghost/border style, smooth-scrolls to solution section
- Microcopy: same as original spec

**Rationale:** Old hero sold to individual engineers ("diagnose failures"). New hero sells to quality managers AND engineers. "Intelligence platform" positions as team tool, not personal utility. "8D investigation management" signals enterprise capability immediately.

---

## MODIFY Component 1.2: Social Proof Bar

**Replace stats with:**

```
📊 2,400+ analyses completed  •  150+ substrate pairs  •  89% resolution rate  •  Used by automotive, aerospace & medical device teams
```

**Changes:**
- Remove "7 adhesive families" (not compelling)
- Add "Used by automotive, aerospace & medical device teams" — industry credibility signal
- Numbers pull from `/v1/stats/public` with higher floor values as product matures
- Keep same visual spec (horizontal strip, monospace numbers)

---

## MODIFY Component 1.3: Problem Section

**Replace section heading:** "Engineers waste weeks on adhesive failures" → **"Adhesive failures cost manufacturing teams millions in scrap, delays, and customer complaints"**

**Replace 4 cards:**

| Icon | Title | Body |
|------|-------|------|
| 🔍 | Root cause guessing | Engineers try Google and ChatGPT. Different answers every time. Nothing audit-ready. |
| 📋 | 8D reports in Word templates | Quality teams spend 15-40 hours per 8D using blank templates. OEMs reject 20-30% for weak root cause analysis. |
| 🏝️ | Knowledge trapped in silos | Every failure is diagnosed from scratch. No institutional memory of what worked last time. |
| ⏱️ | Reactive, not predictive | Same failures repeat across facilities. No cross-case pattern detection. No early warning system. |

**Rationale:** Old cards spoke to individual engineers. New cards speak to quality managers and leadership. 8D pain point hits hard for the $299-799/mo buyer.

---

## REPLACE Component 1.4: Solution Section — "How Gravix Works"

Old section had 3 feature blocks: Spec Engine, Failure Analysis, Self-Learning Intelligence.

**New section has 5 feature blocks.** Same alternating layout pattern (text left/visual right, flip). Same visual specs as original. Content changes:

**Feature Block 1: AI Failure Analysis** (replaces old "Failure Analysis" block)

```
  Diagnose adhesive failures                [Mockup: failure analysis
  in minutes, not weeks                      results with confidence
                                             badge + visual analysis
  Describe the failure, upload defect        finding + "Based on 23
  photos, specify the product used.          similar cases" callout]
  Get ranked root causes with
  confidence scores calibrated
  against real production outcomes.

  ✓ Visual AI analyzes fracture surface photos
  ✓ TDS-aware — knows your product's specifications
  ✓ Confidence backed by confirmed case outcomes
  ✓ Guided investigation mode asks the right questions
```

**Feature Block 2: 8D Investigation Management** (NEW)

```
  [Mockup: 8D stepper UI           Complete 8D reports that
   showing D1-D8 tabs, team         OEMs actually accept
   panel, annotation tool]
                                    AI-powered root cause analysis
                                    fills D4 — the hardest part.
                                    Photo annotation, team comments,
                                    electronic signatures, and full
                                    audit trail for regulatory
                                    compliance.

                                    ✓ Ford Global 8D, VDA 8D, A3, AS9100 CAPA templates
                                    ✓ Immutable audit log for IATF 16949 / ISO 13485
                                    ✓ Action item tracking with due date reminders
                                    ✓ One-click PDF/DOCX report generation
```

**Feature Block 3: Self-Learning Intelligence** (updated from original)

```
  Gets smarter with                 [Visual: flywheel diagram
  every resolved case                updated to include:
                                     "Analysis" → "Visual AI" →
  Unlike generic AI, Gravix          "TDS Match" → "Feedback" →
  accumulates empirical data         "Knowledge Base" → "Better
  from real production outcomes.     Analysis" → back to start,
  Every confirmed fix improves       with "Pattern Detection"
  the next diagnosis for             branching off the center]
  everyone on the platform.

  ✓ Backed by confirmed production outcomes
  ✓ Confidence scores improve as data grows
  ✓ Cross-case pattern detection spots emerging trends
  ✓ Product performance pages built from real field data
```

**Feature Block 4: Pattern Intelligence** (NEW)

```
  [Mockup: alert card showing      Catch problems before
   "340% increase in Loctite 401    they become recalls
   failures — Midwest region"
   with severity badge and          Weekly AI analysis across all
   "Acknowledge" button]            cases detects statistical
                                    anomalies — product lot issues,
                                    seasonal patterns, geographic
                                    clusters. Get alerts before
                                    scattered incidents become
                                    systematic quality events.

                                    ✓ Automated cross-case pattern detection
                                    ✓ Product lot and seasonal cluster analysis
                                    ✓ Proactive alerts to affected teams
                                    ✓ Enterprise trend intelligence dashboard
```

**Feature Block 5: Adhesive Specification Engine** (moved from Block 1, demoted in order)

```
  Find the right adhesive           [Mockup: spec engine results
  with field-proven data             with "Known Risks" section
                                     showing field failure data]
  Tell us your substrates,
  environment, and requirements.
  Get vendor-neutral specs with
  risk warnings based on real
  failure data — not just
  manufacturer claims.

  ✓ Vendor-neutral recommendations
  ✓ Risk warnings from field failure database
  ✓ Surface prep instructions per substrate
  ✓ Cross-linked to failure case library
```

**Rationale:** Spec Engine moves from position 1 to position 5. Failure Analysis leads because it's the primary conversion tool. 8D is position 2 because it's the highest-value feature for the target buyer. Pattern detection is position 4 as the enterprise differentiator.

---

## MODIFY Component 1.5: Differentiator Section

**Replace heading:** "Why Not Just Use ChatGPT?" → **"Why engineering teams choose Gravix over generic AI and manual processes"**

**Replace comparison to 3-column:**

```
┌──────────────────────┬──────────────────────┬──────────────────────────┐
│  Generic AI          │  Manual / Templates  │  Gravix                  │
│  (ChatGPT, etc.)     │  (Word, Excel)       │                          │
│                      │                      │                          │
│  ○ Different answer  │  ○ 15-40 hrs per     │  ✓ Consistent,           │
│    every time        │    8D report         │    structured output     │
│                      │                      │                          │
│  ○ Knows textbooks   │  ○ Zero AI-powered   │  ✓ Knows textbooks +    │
│    only              │    root cause help   │    5,000+ real cases     │
│                      │                      │                          │
│  ○ Guesses at        │  ○ No confidence     │  ✓ Confidence calibrated │
│    confidence        │    scoring           │    by confirmed outcomes │
│                      │                      │                          │
│  ○ Chat transcript   │  ○ Static Word doc   │  ✓ OEM-ready 8D PDF     │
│    output            │    with no AI        │    with audit trail      │
│                      │                      │                          │
│  ○ Forgets           │  ○ Knowledge locked  │  ✓ Cross-case pattern   │
│    everything        │    in one person's   │    detection across your │
│                      │    head              │    entire organization   │
└──────────────────────┴──────────────────────┴──────────────────────────┘
```

**Specs:**
- Three-column layout (not two)
- Same visual style as original but add middle column
- Middle column (Manual): `bg-brand-800`, same style as left column
- Column headers: 16px, font-semibold. Left + Middle: text-secondary. Right: text-accent-500
- Mobile: only show "Generic AI" and "Gravix" columns (hide Manual column to save space), with expandable "vs. manual processes" below

---

## MODIFY Component 1.6: How It Works — 3 Steps

**Replace content (keep same layout):**

```
     ①                          ②                          ③
Describe your               AI diagnoses and            Track, learn,
problem                     investigates                and improve

Paste your failure           Ranked root causes with     Report outcomes. Your
description. Upload          confidence scores.          data improves the next
photos. Select your          TDS-aware analysis.         analysis. Cross-case
adhesive product.            Guided investigation        patterns emerge.
2-3 minutes.                 asks follow-up questions.   8D workflow for teams.
```

---

## REPLACE Component 1.7: Pricing Preview

Old: 2 cards (Free/$49 Pro). New: 4 mini-cards.

```
                          Plans for every team size

  ┌────────────┐  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐
  │  Free      │  │  Pro     ★      │  │  Quality       │  │  Enterprise      │
  │  $0        │  │  $79/mo         │  │  $299/mo       │  │  $799/mo         │
  │            │  │                 │  │                │  │                  │
  │  5/month   │  │  Unlimited     │  │  3 seats + 8D  │  │  10 seats + all  │
  │  analyses  │  │  analyses      │  │  investigations│  │  features + API  │
  │            │  │                │  │                │  │                  │
  │ [Start     │  │ [Start Pro →] │  │ [Start         │  │ [Contact         │
  │  Free]     │  │               │  │  Quality →]    │  │  Sales →]        │
  └────────────┘  └─────────────────┘  └────────────────┘  └──────────────────┘

                        [See full plan comparison →]
```

**Specs:**
- 4 columns, centered, max-width 1080px, gap-6
- All cards: `bg-brand-800`, rounded-xl, p-6
- Pro card: accent border + "★ Most Popular" badge (same as original Pro card style)
- Quality card: subtle different border color (`#8B5CF6` purple) to distinguish team tier
- Price: 36px, font-bold, JetBrains Mono
- Feature line: 14px, text-secondary, single most important differentiator per tier
- CTA: Full-width button per card. Free/Pro: primary styles. Quality: purple accent. Enterprise: ghost.
- "See full plan comparison →": 14px, text-accent-500, links to `/pricing`
- Mobile: 2x2 grid (not vertical stack — all 4 should be visible simultaneously)

---

## MODIFY Component 1.8: Final CTA Section

**Replace copy:**

```
                 Ready to stop guessing at root causes?

      Start with 5 free analyses. No credit card required.
   Quality teams: get audit-ready 8D reports in hours, not days.

                       [Start Free →]     [Book a Demo →]
```

**Changes:**
- Add second line addressing quality teams specifically
- Add secondary CTA: "Book a Demo →" — ghost button, links to Calendly or contact form (for Quality/Enterprise buyers who won't self-serve)
- "Book a Demo" only shows on desktop (mobile: single CTA to keep it clean)

---

## ADD Component 1.9: Enterprise Social Proof / Logo Bar (NEW)

Insert between Component 1.5 (Differentiator) and Component 1.6 (How It Works).

```
                    Trusted by quality teams in

    [OEM template logos or industry icons: Automotive, Aerospace,
     Medical Device, Electronics, Construction]

    "Gravix cut our 8D turnaround from 2 weeks to 3 days."
    — Quality Manager, Tier 1 Automotive Supplier
```

**Specs:**
- Section: py-12, `bg-brand-800/30`
- Logo row: grayscale icons/industry badges, horizontally centered, opacity-60, hover opacity-100
- Testimonial: 18px, italic, text-secondary, centered, max-width 600px
- Attribution: 14px, text-tertiary

**Note:** At launch, use industry icons (not company logos) since we won't have named customer permission. Replace with actual logos + testimonials as customers agree. If no testimonial available at launch, show only the industry icons row — do not fabricate quotes.

---

# 3. TOOL PAGE UPDATES

## MODIFY: Failure Analysis Form (Component 3.1)

**ADD 3 new fields** to the existing form. Insert between existing fields:

| Insert After | New # | Field | Type | Required | Notes |
|-------------|-------|-------|------|----------|-------|
| Field 2 (Adhesive Used) | 2.5 | **Product Name** | Typeahead autocomplete | No | Searches `product_specifications` table. On selection: auto-fills "Adhesive Used" chemistry. Shows: "Add your product for specification-aware analysis" helper text. If TDS available, green pill: "✓ TDS on file" |
| Field 11 (Additional Context) | 12 | **Defect Photos** | Multi-file upload | No | Up to 5 images. Drag-and-drop zone + click to browse. Accepts: .jpg, .jpeg, .png, .heic. Max 10MB each. Helper: "Upload fracture surface photos for visual AI analysis". Thumbnail preview after upload. Remove button per image. |
| Submit button | — | **Analysis Mode Toggle** | Toggle/tabs | No | Two modes above the submit button: "Standard Analysis" (default) and "Guided Investigation". See Section 9 for guided mode. Toggle is pill-style tabs, not a checkbox. |

**MODIFY submit button behavior (F19 Auth Gating):**

The submit button ("Analyze Failure →") now has conditional behavior:

```
IF user is authenticated AND has remaining quota:
  → Submit analysis normally (existing behavior)

IF user is authenticated AND at monthly limit:
  → Button shows "Monthly Limit Reached"
  → Button disabled, muted style
  → Below button: "Upgrade to Pro for unlimited analyses. [See Plans →]"

IF user is NOT authenticated:
  → Button text stays "Analyze Failure →" (same as normal)
  → On click: open Auth Modal (Component 5.1) as overlay
  → Form data saved to localStorage immediately before modal opens
  → After successful auth: modal closes, form auto-submits with preserved data
  → User sees results within seconds of creating account
```

**ADD: Monthly Usage Counter** (free tier only)

```
    ┌──────────────────────────────────────────────────┐
    │  3 of 5 free analyses remaining this month  [Pro →]  │
    └──────────────────────────────────────────────────┘
```

- Position: below form header, above first field
- Only visible for Free tier users
- `bg-accent-500/10`, rounded, px-4 py-2, 13px
- "Pro →" link text-accent-500, links to `/pricing`
- When 0 remaining: `bg-red-500/10`, text: "Monthly limit reached. [Upgrade →]"

**ADD: Post-Analysis Upgrade Banner** (free tier only)

After results render (top of results panel):

```
    ┌────────────────────────────────────────────────────┐
    │  ⚡ Upgrade to Pro for unlimited analyses,          │
    │     visual AI, and TDS-aware diagnostics. [See Plans]│
    │                                              [✕]    │
    └────────────────────────────────────────────────────┘
```

- Non-blocking — results fully visible beneath
- `bg-accent-500/10`, border `1px solid #3B82F6/20`, rounded
- Dismissible (✕ button). Dismissed state persisted in localStorage for session.
- Do NOT show for Pro+ users

---

## MODIFY: Failure Analysis Results (Component 3.2)

**ADD new result section** between "Root cause cards" (#2) and "Contributing factors" (#3):

**Visual Analysis Section** (only renders when photo(s) uploaded)

```
    ┌─ 📸 Visual Analysis ────────────────────────────────┐
    │                                                      │
    │  [Thumbnail]    Failure Mode: Adhesive               │
    │                 Confidence: 92%                       │
    │                                                      │
    │  Visual indicators: Clean substrate surface on       │
    │  ABS side, full adhesive transfer to aluminum.       │
    │  No cohesive tearing visible. Consistent with        │
    │  adhesive failure at low-surface-energy interface.   │
    │                                                      │
    │  ⚠️ Contradiction: You selected "Cohesive" but       │
    │  visual analysis indicates "Adhesive" failure mode.  │
    │  Analysis adjusted to reflect visual classification. │
    │                                                      │
    └──────────────────────────────────────────────────────┘
```

- Card: `bg-brand-800`, border, rounded-lg, p-5
- Photo thumbnail: 80x80px, rounded, left-aligned
- "Failure Mode" label: 13px text-tertiary. Value: 16px text-white
- Contradiction warning: `bg-warning-500/10`, border-left `3px solid #F59E0B`, only shows when visual contradicts text input
- Section heading icon 📸 in accent color

**ADD: TDS Compliance Section** (only renders when product from TDS database selected)

```
    ┌─ 📋 Specification Compliance — Loctite 495 ──────────┐
    │                                                       │
    │  ❌ Application temperature: 10°C (spec: 20-25°C)     │
    │  ❌ Surface preparation: None (spec: SF 770 primer)   │
    │  ✅ Cure time: 24 hours (spec: 24 hours at 22°C)     │
    │  ⚠️ Humidity: 85% RH (spec: max 60% recommended)     │
    │                                                       │
    │  2 specification violations and 1 warning detected.  │
    │  These deviations are factored into root cause       │
    │  ranking above.                                       │
    │                                                       │
    └───────────────────────────────────────────────────────┘
```

- ❌ red text for violations, ✅ green for pass, ⚠️ amber for warnings
- "Specification Compliance" heading includes product name
- Card collapses to summary line if >5 items: "2 violations, 1 warning, 4 passes [Expand ▾]"

---

## MODIFY: Spec Engine Form (Component 2.3)

**ADD 1 new field:**

| Insert After | New # | Field | Type | Required | Notes |
|-------------|-------|-------|------|----------|-------|
| Field 2 (Substrate B) | 2.5 | **Product Considered** | Typeahead autocomplete | No | Same autocomplete as failure form. If selected, spec results include risk check against failure database for this product. Helper: "Already have a product in mind? We'll check field performance." |

**MODIFY submit button:** Same auth gating behavior as failure analysis form (see above).

---

## MODIFY: Spec Engine Results (Component 2.6)

**ADD: Known Risks Section** (only renders when recommended product has failures in database)

Insert between "Warnings" (#6) and "Alternatives" (#7):

```
    ┌─ ⚠️ Known Risks — 3M DP420 on GFRP ─────────────────┐
    │                                                       │
    │  Our field data contains 7 documented failures of    │
    │  3M DP420 on GFRP substrates.                        │
    │                                                       │
    │  Field failure rate: 8.2%  [🟡 Moderate Risk]        │
    │  Most common root cause: UV degradation (71%)        │
    │  Typical time to failure: 12-18 months outdoor       │
    │                                                       │
    │  Consider: Lord 310A/B (0% failure rate, 4 cases)   │
    │            Plexus MA310 (2% failure rate, 12 cases)  │
    │                                                       │
    └───────────────────────────────────────────────────────┘
```

- Risk level color: 🟢 <2%, 🟡 2-10%, 🔴 >10%
- Only shows when field data exists for recommended product
- "Consider" alternatives sorted by ascending failure rate

---

# 4. AUTH MODAL UPDATES

## MODIFY Component 5.1: Auth Modal

**Trigger change:** Original trigger was "clicking Sign In in nav or attempting to use a tool without auth." New trigger adds: "clicking Analyze/Generate button while unauthenticated."

**Key behavioral requirement:** When triggered from a tool page (form submit):
1. Form data is saved to `localStorage` under key `gravix_pending_analysis`
2. Modal opens as overlay — form visible behind (blurred backdrop)
3. After successful auth (magic link callback or Google OAuth redirect):
   - Page reloads with auth context
   - `localStorage` key detected
   - Form auto-populates from stored data
   - Form auto-submits
   - `localStorage` key cleared after successful submission
4. If user closes modal without authenticating: form data remains, no submission, no data lost

**ADD to modal:** Below the "No account? We'll create one automatically" text:

```
    Your analysis data is saved. Sign in to see your results instantly.
```

- 12px, text-tertiary, italic
- Only shows when modal triggered from form submit (not from nav "Sign In")

---

# 5. PRICING PAGE — FULL REPLACE

## REPLACE Component 4.2: Pricing Cards

Old: 3 cards (Free, Pro $49, Team $149). New: 4 cards with correct pricing.

```
┌──────────────┐  ┌─────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐
│  Free        │  │  Pro         ★      │  │  Quality             │  │  Enterprise         │
│  $0          │  │  $79/mo             │  │  $299/mo             │  │  $799/mo            │
│              │  │                     │  │  3 seats included    │  │  10 seats included  │
│  For         │  │  For individual     │  │  For quality teams   │  │  For quality        │
│  evaluation  │  │  engineers          │  │  running 8D          │  │  departments        │
│              │  │                     │  │                      │  │                     │
│  ✓ 5 failure │  │  ✓ Unlimited        │  │  Everything in Pro,  │  │  Everything in      │
│    analyses  │  │    analyses         │  │  plus:               │  │  Quality, plus:     │
│    per month │  │  ✓ Unlimited spec   │  │                      │  │                     │
│  ✓ 5 spec    │  │    analyses         │  │  ✓ 8D investigations │  │  ✓ 10 seats         │
│    analyses  │  │  ✓ Visual AI        │  │  ✓ 3 seats           │  │    (+$49/ea extra)  │
│    per month │  │    analysis         │  │    (+$79/ea extra)   │  │  ✓ All OEM          │
│  ✓ Account   │  │  ✓ TDS-aware        │  │  ✓ Photo annotation  │  │    templates        │
│    required  │  │    diagnostics      │  │  ✓ Team comments     │  │  ✓ White-label      │
│              │  │  ✓ Guided           │  │  ✓ Audit log (view)  │  │    reports          │
│  ○ No 8D     │  │    investigation    │  │  ✓ 1 inbound email   │  │  ✓ Pattern alerts   │
│  ○ No team   │  │  ✓ Full analysis    │  │    address           │  │  ✓ Cross-vendor     │
│    features  │  │    history          │  │  ✓ Email + in-app    │  │    comparison       │
│              │  │  ✓ PDF export       │  │    notifications     │  │  ✓ API access       │
│              │  │                     │  │  ✓ Generic 8D +      │  │  ✓ SSO / SAML       │
│              │  │  ○ No 8D            │  │    1 OEM template    │  │  ✓ Dedicated        │
│              │  │  ○ No team features │  │  ✓ 5 shareable links │  │    support          │
│              │  │                     │  │                      │  │                     │
│ [Start Free] │  │ [Start Pro →]       │  │ [Start Quality →]    │  │ [Contact Sales →]   │
└──────────────┘  └─────────────────────┘  └──────────────────────┘  └─────────────────────┘
```

**Specs:**
- 4 columns, centered, max-width 1200px, gap-6
- All cards: `bg-brand-800`, rounded-xl, p-8
- Pro card: `border 2px solid #3B82F6`, "★ Most Popular" badge, scale-[1.02] on desktop
- Quality card: `border 1px solid #8B5CF6` (purple accent for team tier)
- Enterprise card: `border 1px solid #1F2937` (subtle)
- Plan name: 14px, uppercase, tracking-wider, text-tertiary
- Persona line ("For individual engineers"): 13px, text-tertiary, italic, mb-4
- Price: 48px, font-bold, JetBrains Mono
- Seat info: 14px, text-secondary, visible for Quality + Enterprise only
- Feature list: 14px, gap-3. ✓ = text-secondary with accent checkmark. ○ = text-tertiary with muted circle.
- CTA buttons: Full-width. Free: secondary. Pro: primary accent. Quality: purple accent. Enterprise: ghost/outline.
- Mobile: vertical stack, Pro card first, then Quality, then Free, then Enterprise
- Tablet: 2x2 grid

## REPLACE Component 4.1: Pricing Header

```
                    Plans for individual engineers and
                         quality departments

           Start free. Scale to your entire quality organization.
```

## MODIFY Component 4.3: Enterprise CTA

**Replace with ROI calculator CTA:**

```
    ┌──────────────────────────────────────────────────────────┐
    │  💡 One Gravix-diagnosed failure preventing a production  │
    │     line shutdown saves $5,000-50,000. Pro pays for       │
    │     itself with a single avoided incident.                │
    │                                                           │
    │     [Calculate your ROI →]    [Book a demo →]             │
    └──────────────────────────────────────────────────────────┘
```

- `bg-brand-800/50`, border, rounded-xl, p-8, centered
- "Calculate your ROI →" links to a simple calculator (future feature — for now, links to contact form)
- "Book a demo →" links to Calendly or contact form

## MODIFY Component 4.4: FAQ Accordion

**Replace/add questions:**

| Question | Answer |
|----------|--------|
| What counts as an analysis? | Each failure diagnosis, spec request, or guided investigation session counts as one analysis. Photo uploads within an analysis don't count separately. |
| Can I cancel anytime? | Yes. Cancel from Settings. You keep access until billing period ends. |
| What's the difference between Pro and Quality? | Pro is for individual engineers running failure analyses and specs. Quality adds 8D investigation management, team collaboration (3 seats), OEM report templates, audit logging, and notifications — everything quality departments need for IATF 16949 and ISO 13485 compliance. |
| How do extra seats work? | Quality includes 3 seats ($79/ea additional). Enterprise includes 10 seats ($49/ea additional). Each seat is a full user who can run analyses and participate in investigations. |
| Is my data secure and compliant? | All data encrypted in transit (TLS 1.3) and at rest (AES-256). Audit log is immutable and append-only. SOC 2 Type II certification planned. |
| Do you integrate with our QMS? | Enterprise plans include API access for integration with existing Quality Management Systems. Contact us for specific integration requirements. |
| What OEM report templates are available? | Generic 8D, Ford Global 8D, VDA 8D, A3 Report, and AS9100 CAPA. Quality plans get Generic + 1 OEM template. Enterprise gets all templates + custom branding. |
| Do you offer annual billing? | Coming soon with 20% discount. Contact sales for early access to annual plans. |

---

# 6. DASHBOARD UPDATES

## MODIFY Component 6.1: Dashboard Header

**Replace usage display:**

Old: `Plan: Pro • 12/unlimited analyses used`

New (conditional by plan):

```
Free:       Plan: Free  •  3 of 5 analyses remaining  [Upgrade →]
Pro:        Plan: Pro   •  47 analyses this month
Quality:    Plan: Quality  •  3 seats  •  12 analyses  •  4 active investigations
Enterprise: Plan: Enterprise  •  8 seats  •  156 analyses  •  23 active investigations
```

## MODIFY Component 6.2: Quick Actions

Old: 2 cards (Spec, Failure). New: 3-4 cards depending on plan.

```
Free/Pro (3 cards):
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ [failure icon]   │  │ [spec icon]      │  │ [guided icon]    │
│ Diagnose a       │  │ New Material     │  │ Guided           │
│ Failure          │  │ Specification    │  │ Investigation    │
│ [Start →]        │  │ [Start →]        │  │ [Start →]        │
└──────────────────┘  └──────────────────┘  └──────────────────┘

Quality/Enterprise (4 cards):
┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ [failure icon] │  │ [8d icon]      │  │ [guided icon]  │  │ [spec icon]    │
│ Diagnose a     │  │ New 8D         │  │ Guided         │  │ New Material   │
│ Failure        │  │ Investigation  │  │ Investigation  │  │ Specification  │
│ [Start →]      │  │ [Start →]      │  │ [Start →]      │  │ [Start →]      │
└────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
```

Links: Failure → `/failure`, Investigation → `/investigations/new`, Guided → `/failure?mode=guided`, Spec → `/tool`

## ADD Component 6.5: Investigations Summary Card (Quality+ only)

Below Recent Analyses table:

```
    Investigations                                        [View All →]

    ┌────────────────────────────────────────────────────────────┐
    │  4 open  •  2 overdue actions  •  1 awaiting closure      │
    │                                                            │
    │  GQ-2026-0012  Ford B-pillar disbond     Investigating  ● │
    │  GQ-2026-0011  Shelf life exceedance     Containment    ● │
    │  GQ-2026-0010  Supplier viscosity issue  Corrective     ● │
    └────────────────────────────────────────────────────────────┘
```

- Only visible for Quality and Enterprise plans
- Status dot colors: Open=blue, Containment=amber, Investigating=purple, Corrective=green, Verification=teal, Closed=gray
- "View All →" links to `/investigations`

## ADD Component 6.6: Pattern Alerts Card (Enterprise only)

Below Investigations card:

```
    Pattern Alerts                                        [View All →]

    ┌────────────────────────────────────────────────────────────┐
    │  🔴 Critical: Loctite 401 failures — 340% increase        │
    │     Midwest region  •  Detected Feb 12                    │
    │                                                            │
    │  🟡 Warning: Seasonal cure failures trending up            │
    │     Q4-Q1 pattern  •  Detected Feb 10                     │
    └────────────────────────────────────────────────────────────┘
```

- Only visible for Enterprise plan
- Severity badges: 🔴 Critical, 🟡 Warning, 🔵 Informational
- "View All →" links to `/alerts`

---

# 7. SETTINGS UPDATES

## MODIFY Component 10.2: Subscription Section

**Update to show correct plans and seat management:**

```
    Current Plan: Quality ($299/mo)
    Seats: 3 of 3 used  [Add Seat — $79/mo →]
    Next payment: March 1, 2026 — $299.00
    [Manage Subscription →]  [Change Plan →]
```

- "Add Seat" link opens Stripe checkout for additional seat
- "Change Plan" links to `/pricing` with current plan highlighted

## ADD Component 10.4: Notification Preferences

```
    Notification Preferences

    Email Notifications          [Toggle: ON]
    Digest Mode (daily at 8 AM)  [Toggle: OFF]
    Quiet Hours                  [8:00 PM] to [7:00 AM]

    Event Types:
    □ Investigation assigned     ☑ Email  ☑ In-app
    □ Action item assigned       ☑ Email  ☑ In-app
    □ Action item due            ☑ Email  ☑ In-app
    □ @Mentioned                 ☑ Email  ☑ In-app
    □ Status changed             ☐ Email  ☑ In-app
    □ Investigation closed       ☑ Email  ☑ In-app
    □ Pattern alert              ☑ Email  ☑ In-app
    □ Share link accessed        ☐ Email  ☑ In-app
```

- Only visible for Quality+ plans
- Toggle components: standard switch UI, `bg-accent-500` when on
- Per-event checkboxes in 2 columns (Email, In-app)

## ADD Component 10.5: Organization & Branding (Enterprise only)

```
    Organization Settings

    Company Name:    [Acme Aerospace Manufacturing, Inc.]
    Company Logo:    [Upload]  [Preview: acme-logo.png]
    Primary Color:   [#1B365D] [color swatch]
    Secondary Color: [#C41E3A] [color swatch]

    Report Branding:
    ☑ Use company logo on reports
    ☑ Use custom colors on reports
    ☐ Hide Gravix branding (white-label)

    Inbound Email:
    8d@acme.gravix.io  [Copy]
    Routing Rules:  [Manage →]
```

---

# 8. NEW PAGE: INVESTIGATIONS

## Route: `/investigations`
**Requires auth. Quality+ plan only.** Free/Pro users see upgrade prompt.

### Layout: List + Kanban Toggle

```
    Investigations                         [List view] [Kanban view]  [+ New Investigation]

    Filters: [Status ▾] [Severity ▾] [Customer ▾] [Assignee ▾]  [Search...]

    ┌─────────────────────────────────────────────────────────────────────┐
    │  GQ-2026-0012  •  Critical  •  Investigating                       │
    │  Ford B-pillar structural disbond                                   │
    │  Customer: Ford Motor Company  •  Created: Feb 10  •  Due: Feb 17  │
    │  Team: A. Chen (Lead), M. Rodriguez (Champion), +2                  │
    │  Actions: 3 open, 1 overdue                                         │
    └─────────────────────────────────────────────────────────────────────┘
```

**Kanban view:**

```
    | Open (2)      | Containment (1) | Investigating (1) | Corrective (0) | Verification (0) | Closed (8) |
    |               |                 |                    |                 |                   |            |
    | [Card]        | [Card]          | [Card]             |                 |                   | [Card]     |
    | [Card]        |                 |                    |                 |                   | [Card]     |
    |               |                 |                    |                 |                   | [Card]...  |
```

- Cards: compact version of list row, draggable between columns
- Drag-and-drop changes status (with validation — blocked transitions show error toast)

### Route: `/investigations/new`

Create form:
```
    New Investigation

    Title:              [                                          ]
    Customer:           [                                          ]
    Customer Reference: [                                          ]
    Part Number:        [                                          ]
    Severity:           [Minor ▾ | Major | Critical]
    Report Template:    [Generic 8D ▾ | Ford Global 8D | VDA 8D | A3 | AS9100 CAPA]

    Link to existing analysis: [Search analyses... ▾]  (optional — pre-fills D2)

    [Create Investigation]
```

### Route: `/investigations/[id]`

Full investigation detail page. Complex layout:

```
    ← Back to Investigations          GQ-2026-0012  •  Critical  •  Investigating

    ┌─ Sidebar (240px) ──┐  ┌─ Main Content ─────────────────────────────────────┐
    │                     │  │                                                    │
    │  Status:            │  │  [D1] [D2] [D3] [D4] [D5] [D6] [D7] [D8]        │
    │  ● Investigating    │  │   ✓    ✓    ✓    ●                                │
    │  [Change Status ▾]  │  │                                                    │
    │                     │  │  ┌─ D4: Root Cause Analysis ────────────────────┐  │
    │  Team:              │  │  │                                              │  │
    │  👤 A. Chen (Lead)  │  │  │  [Run AI Analysis]                          │  │
    │  👤 M. Rodriguez    │  │  │                                              │  │
    │  👤 J. Wilson       │  │  │  5-Why Chain:                                │  │
    │  👤 S. Kim          │  │  │  Why 1: ...                                  │  │
    │  [+ Add Member]     │  │  │  Why 2: ...                                  │  │
    │                     │  │  │  ...                                          │  │
    │  Actions:           │  │  │                                              │  │
    │  3 open / 1 overdue │  │  │  Ishikawa: [expand]                         │  │
    │  [View Actions →]   │  │  │  Escape Point: [expand]                     │  │
    │                     │  │  │                                              │  │
    │  Photos:            │  │  │  [Sign Off D4]                              │  │
    │  📷 📷 📷 [+]       │  │  └──────────────────────────────────────────────┘  │
    │                     │  │                                                    │
    │  Audit Log [→]      │  │  ┌─ Comments ──────────────────────────────────┐  │
    │                     │  │  │  [Comment input with @mention support]      │  │
    │  Share:             │  │  │  ...thread...                                │  │
    │  [Generate Link]    │  │  └──────────────────────────────────────────────┘  │
    │                     │  │                                                    │
    └─────────────────────┘  └────────────────────────────────────────────────────┘
```

**Specs:**
- Sidebar: fixed 240px, `bg-brand-900`, border-right, scrollable independently
- Stepper tabs: horizontal, 8 tabs (D1-D8). Active: accent underline. Completed: green checkmark. Incomplete: gray circle.
- Main content: scrollable, renders content for selected discipline
- Comments panel: collapsible, below main content, shows discipline-specific thread
- Mobile: sidebar becomes horizontal summary bar at top, stepper becomes horizontal scroll or select dropdown

**This is the most complex page in the app.** Agent should build it incrementally: skeleton → stepper → D2 form → D4 AI integration → comments → photos → audit log.

---

# 9. NEW PAGE: GUIDED INVESTIGATION

## Route: `/failure?mode=guided`
Not a separate page — same `/failure` route with mode toggle.

### When "Guided Investigation" tab is selected:

Replace the standard form + results layout with a chat-style interface:

```
    ┌─ Guided Investigation ─────────────────────────────────────────┐
    │                                                                 │
    │  ┌─ AI ──────────────────────────────────────────────────────┐ │
    │  │ I'll help you diagnose this adhesive failure step by      │ │
    │  │ step. Start by describing what happened — what failed,    │ │
    │  │ when, and what it looked like.                            │ │
    │  └──────────────────────────────────────────────────────────┘ │
    │                                                                 │
    │  ┌─ You ────────────────────────────────────────────────────┐ │
    │  │ Our cyanoacrylate bond failed after about 6 months       │ │
    │  │ outdoors at our coastal Florida facility.                 │ │
    │  └──────────────────────────────────────────────────────────┘ │
    │                                                                 │
    │  ┌─ AI ──────────────────────────────────────────────────────┐ │
    │  │ 🔍 Searching similar cases...                             │ │
    │  │                                                           │ │
    │  │ Coastal Florida — high humidity is a known risk factor    │ │
    │  │ for cyanoacrylate bonds. A few targeted questions:       │ │
    │  │                                                           │ │
    │  │ What surface preparation did you use?                    │ │
    │  │  [IPA Wipe] [Abrasion] [Plasma] [Primer] [None]         │ │
    │  └──────────────────────────────────────────────────────────┘ │
    │                                                                 │
    │  ┌──────────────────────────────────────────── [📎] [Send →] │ │
    │  │ Type your answer or click a suggestion...                 │ │
    │  └──────────────────────────────────────────────────────────┘ │
    │                                                                 │
    │  Session: Turn 3 of 10 (Free tier)    [Pause & Save]          │
    └─────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Chat bubbles: AI messages left-aligned with `bg-brand-800`, user messages right-aligned with `bg-accent-500/20`
- Tool call indicators: "🔍 Searching similar cases..." in italic, `text-tertiary`, with subtle pulse animation
- Quick-reply buttons: pill-style, `bg-brand-700 hover:bg-brand-600`, clicking sends as reply
- Photo upload: 📎 icon in input bar, opens file picker
- Input: auto-growing textarea, max 4 rows, full width, Send button right-aligned
- Turn counter: bottom bar, 13px, `text-tertiary`. Shows `Turn X of Y` for free tier. Hidden for Pro+.
- "Pause & Save": ghost button, saves session to DB, returns to dashboard
- On session completion: full-width results card renders in chat (same sections as standard analysis results), plus "Open 8D Investigation" button (Quality+ only)

---

# 10. NEW PAGE: PRODUCT CATALOG & PERFORMANCE PAGES

## Route: `/products` (public, no auth)

```
    Adhesive Product Database                    [Search products...]

    Filters: [Chemistry ▾] [Manufacturer ▾] [Application ▾]

    ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
    │  Loctite 495            │  │  3M DP460               │  │  Loctite 401            │
    │  Henkel • Cyanoacrylate │  │  3M • Epoxy (2-part)    │  │  Henkel • Cyanoacrylate │
    │                         │  │                         │  │                         │
    │  📊 142 applications    │  │  📊 89 applications     │  │  📊 67 applications     │
    │  Field failure: 4.2%    │  │  Field failure: 2.1%    │  │  Field failure: 6.8%    │
    │  Top failure: Humidity  │  │  Top failure: Cure temp │  │  Top failure: Humidity  │
    │                         │  │                         │  │                         │
    │  [View Performance →]   │  │  [View Performance →]   │  │  [View Performance →]   │
    └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

- Cards: `bg-brand-800`, border, rounded-lg, p-5
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Sorted by total applications (descending) by default
- "📊" = monospace stat numbers
- Only products with ≥10 documented applications shown

## Route: `/products/[manufacturer]/[slug]` (public, no auth)

Full performance page:

```
    ← All Products

    Loctite 495 — Henkel
    Cyanoacrylate (Ethyl)

    ┌─ Key Specifications ─────────────────────────────────────────┐
    │  Viscosity: 20-50 cP  •  Fixture: 5-20s  •  Cure: 24h@22°C │
    │  Shear: 17-24 MPa (steel)  •  Temp: -54°C to 82°C          │
    │  Source: Manufacturer TDS  ✓ Verified                        │
    └──────────────────────────────────────────────────────────────┘

    ┌─ Field Performance (Gravix Data) ────────────────────────────┐
    │                                                               │
    │  Total documented applications: 142                          │
    │  Field failure rate: 4.2%                                    │
    │                                                               │
    │  Top Failure Modes:            Top Root Causes:               │
    │  1. Adhesive (68%)             1. Moisture degradation (41%) │
    │  2. Cohesive (22%)             2. Surface prep (29%)         │
    │  3. Mixed (10%)                3. Incorrect substrate (18%)  │
    │                                                               │
    │  Common Application Errors:                                  │
    │  • Applied below minimum temperature (15% of failures)       │
    │  • No primer on low-surface-energy substrates (23%)          │
    │  • Exceeded fixture time before clamping (12%)               │
    │                                                               │
    └──────────────────────────────────────────────────────────────┘

    ┌─ CTAs ───────────────────────────────────────────────────────┐
    │  Using Loctite 495 in production?                            │
    │  [Get AI Failure Analysis →]     [Generate Specification →]  │
    │                                                               │
    │  Experiencing a failure with this product?                   │
    │  [Start Diagnosis with Product Pre-Selected →]               │
    └──────────────────────────────────────────────────────────────┘
```

- All data anonymized — no company or facility names
- CTA links: pre-select product in failure/spec form via query param `?product=loctite-495`
- SEO: SSR or ISR. Title tag: "Loctite 495 Field Performance & Failure Analysis | Gravix". Schema.org Product markup.

---

# 11. NEW PAGE: PATTERN ALERTS

## Route: `/alerts`
**Requires auth. Enterprise plan only.**

```
    Pattern Alerts                              [All ▾] [Critical ▾] [Date ▾]

    ┌─ 🔴 Critical ────────────────────────────────────────────────────────┐
    │  Loctite 401 Failure Spike — Midwest Region                         │
    │  Detected: Feb 12, 2026  •  15 failures in 8 weeks (340% above avg) │
    │                                                                      │
    │  Hypothesis: Potential formulation change in Lot #H2026-Q3-batch7.  │
    │  Affected organizations: 3  •  Geographic cluster: OH, MI           │
    │                                                                      │
    │  Recommended: Contact Henkel regarding lot consistency.              │
    │  Quarantine remaining stock from this lot.                          │
    │                                                                      │
    │  [Acknowledge]  [View Affected Cases →]                             │
    └──────────────────────────────────────────────────────────────────────┘

    ┌─ 🟡 Warning ─────────────────────────────────────────────────────────┐
    │  Seasonal Cure Failure Pattern                                       │
    │  Detected: Feb 10, 2026  •  Epoxy cure failures up 180% in Q4-Q1   │
    │  ...                                                                 │
    └──────────────────────────────────────────────────────────────────────┘
```

- Alert cards: `bg-brand-800`, border-left `4px solid` severity color (red/amber/blue)
- "Acknowledge" button changes status, adds note field
- Status filter: Active / Acknowledged / All

---

# 12. NEW PAGE: NOTIFICATION CENTER

## Route: `/notifications`
**Requires auth.**

Accessible from bell icon in nav or as full page.

**Dropdown view** (from bell icon):

```
    ┌─ Notifications (3 unread) ──────── [Mark all read] ──┐
    │                                                       │
    │  ● Alex Chen mentioned you in GQ-2026-0012 D4        │
    │    2 hours ago                                        │
    │                                                       │
    │  ● Action assigned: Quarantine batch B-2026-0205     │
    │    Due: Feb 15  •  5 hours ago                        │
    │                                                       │
    │  ● GQ-2026-0012 status: Open → Containment           │
    │    Yesterday                                          │
    │                                                       │
    │  ○ Pattern Alert: Loctite 401 spike                  │
    │    2 days ago                                         │
    │                                                       │
    │  [View all notifications →]                           │
    └───────────────────────────────────────────────────────┘
```

- Dropdown: max 400px wide, max 5 items, scrollable
- ● = unread (accent dot), ○ = read
- Each item clickable → navigates to relevant page (investigation, action, alert)
- "View all notifications →" links to full page view with filters

**Full page** (`/notifications`): same items but with date filters, type filters, and pagination.

---

# 13. UPDATED COMPONENT REUSE MAP

| Component | Used On |
|-----------|---------|
| Nav bar | Every page |
| Footer | Landing, Pricing, Cases, Products, Settings |
| Stats bar | `/tool`, `/failure` |
| Typeahead substrate selector | `/tool` form, `/failure` form, `/investigations/new` |
| Product autocomplete | `/failure` form (Product Name field), `/tool` form (Product Considered) |
| Confidence badge | `/tool` results, `/failure` results, guided investigation results |
| Feedback prompt | `/failure` results, `/tool` results, `/feedback/[id]`, guided investigation completion |
| Auth modal | Nav "Sign In", tool form submit (F19 auth gate), any protected page access |
| Action bar (Export PDF, etc.) | `/tool` results, `/failure` results, guided investigation completion |
| Visual analysis card | `/failure` results (when photos uploaded), guided investigation (when photos uploaded) |
| TDS compliance card | `/failure` results (when TDS product selected), spec results (Known Risks) |
| Investigation status badge | `/investigations` list, `/investigations/[id]`, dashboard card |
| Notification bell | Nav bar (logged-in state) |
| Usage counter | `/failure` form header, `/tool` form header (free tier only) |
| Upgrade banner | `/failure` results, `/tool` results, various gated features (free tier only) |
| 8D stepper | `/investigations/[id]` |
| Comment thread | `/investigations/[id]` per discipline |
| Photo gallery + annotation | `/investigations/[id]` per discipline |
| Audit log viewer | `/investigations/[id]` sidebar |
| Alert card | `/alerts` page, dashboard card (enterprise) |
| Notification item | Nav dropdown, `/notifications` page |

---

# 14. UPDATED BUILD ORDER

The original spec's build order remains valid for V1/V2 components. This is the incremental build order for new components:

```
Phase 1: Pricing & Auth Gating (ship first — affects conversion immediately)
  1. Update Pricing page (4 tiers, correct prices)
  2. Landing page pricing preview (4 mini-cards)
  3. Auth gate on tool forms (localStorage persistence, modal on submit)
  4. Usage counter + upgrade banner (free tier)
  5. Update nav (new links, notification bell placeholder)

Phase 2: Landing Page Repositioning
  6. Replace hero copy and CTAs
  7. Replace problem section cards
  8. Replace/add solution feature blocks (5 blocks)
  9. Replace differentiator (3-column)
  10. Add enterprise social proof section
  11. Update How It Works steps
  12. Update Final CTA

Phase 3: Tool Page Enhancements
  13. Add Product Name autocomplete to failure form
  14. Add Defect Photos upload to failure form
  15. Add Visual Analysis results section
  16. Add TDS Compliance results section
  17. Add Known Risks section to spec results
  18. Add mode toggle (Standard / Guided) to failure form

Phase 4: New Pages — Products & Guided
  19. Product catalog page (/products)
  20. Product performance page (/products/[mfr]/[slug])
  21. Guided investigation chat UI
  22. Guided → standard results rendering

Phase 5: New Pages — Investigations
  23. Investigations list (/investigations) with Kanban
  24. Investigation create form
  25. Investigation detail — skeleton + stepper
  26. Investigation detail — D1-D8 content forms
  27. Investigation detail — AI analysis (D4)
  28. Investigation detail — comments panel
  29. Investigation detail — photo gallery + annotation
  30. Investigation detail — audit log viewer
  31. Investigation detail — signatures
  32. Report generation (PDF download)

Phase 6: Notifications & Alerts
  33. Notification bell + dropdown
  34. Notification full page
  35. Notification preferences in Settings
  36. Pattern alerts page (/alerts)

Phase 7: Settings & Polish
  37. Settings — subscription with seat management
  38. Settings — notification preferences
  39. Settings — org branding (Enterprise)
  40. Dashboard — investigations card
  41. Dashboard — alerts card
```

---

## PAGES THAT STILL DO NOT EXIST

Everything from the original "do not build" list remains true. Additionally:

- `/blog` — still not needed. Product pages provide SEO content.
- `/about` — still not needed.
- `/admin/*` — already built per V2 spec. Not part of this addendum.
- `/contact` — `mailto:` in footer is sufficient. "Book a Demo" links to Calendly.

---

**END OF FRONTEND UPDATE ADDENDUM**
