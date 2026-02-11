# GRAVIX FRONTEND: Page-by-Page Component Specification

## Purpose
This document defines every page, every component on that page (in render order), exact copy, and layout. If a component is not listed here, it should not exist. If it is listed here, it must exist.

Design system: Dark-mode-first. Background #0A1628. Accent #3B82F6.

## GLOBAL: Components on Every Page

### Navigation Bar (sticky, top, 64px height)
Components in order (left to right):
1. Logo — "GRAVIX" wordmark, JetBrains Mono, 18px, font-bold, text-white. Links to /
2. Nav links (desktop only, hidden on mobile):
   - "Spec Engine" → /tool
   - "Failure Analysis" → /failure
   - "Pricing" → /pricing
3. Auth buttons (right side):
   - Signed out: "Sign In" (ghost button, text-secondary) + "Try Free →" (primary button, bg-accent-500)
   - Signed in: Usage badge ("3/5 analyses") + User avatar dropdown (Settings, History, Sign Out)
   - Mobile (< 768px): Hamburger icon replaces nav links. Opens full-screen overlay with all links + auth buttons stacked vertically.
   - Background: #0A1628, border-bottom 1px solid #1F2937

### Footer (all pages except tool pages)
3-column layout on desktop, stacked on mobile. Background #050D1A.
- Column 1: "GRAVIX" + "Industrial materials intelligence" + "© 2026 Gravix. All rights reserved."
- Column 2 "Product": Spec Engine, Failure Analysis, Pricing, Case Library
- Column 3 "Company": About, Contact, Privacy, Terms

---

## PAGE 1: LANDING PAGE — Route: /

### Component 1.1: Hero Section
Layout: Full-width, min-height 90vh, centered content, subtle grid background pattern.

**Headline:** "Specify industrial adhesives with confidence. Diagnose failures in minutes."
- 48px (desktop) / 32px (mobile), font-bold, text-white, max-width 720px, centered

**Subheadline:** "AI-powered materials intelligence that learns from every analysis. Backed by real production data, not just textbook theory."
- 18px, text-secondary (#94A3B8), max-width 560px, centered, line-height 1.6

**CTA buttons:**
- Primary: "Try Spec Engine →" — bg-accent-500 hover:bg-accent-600, 16px, px-8 py-3, rounded-lg
- Secondary: "Diagnose a Failure" — border border-brand-500 text-secondary hover:text-white, same size

**Microcopy:** "Free to start • No credit card"
- 14px, text-tertiary (#64748B), centered below buttons, 16px gap

### Component 1.2: Social Proof Bar
Layout: Horizontal strip below hero, full-width, bg-brand-800/50, border-top and border-bottom 1px solid #1F2937, py-4.
- Numbers: JetBrains Mono, text-secondary
- Labels: DM Sans / Inter, text-tertiary
- Dot separators: #374151
- Numbers pull from /v1/stats/public API (with sensible minimums)
- Single row on desktop, 2x2 grid on mobile

Content: "847+ analyses completed • 30+ substrate combinations • 7 adhesive families • 73% resolution rate"

### Component 1.3: Problem Section — "The Problem"
Section heading: "Engineers waste weeks on adhesive failures" — 32px, font-bold, text-white, centered, mb-12
Cards: bg-brand-800, border 1px solid #1F2937, rounded-lg, p-6
Grid: 4 columns desktop, 2 columns tablet, 1 column mobile. Gap: 24px

Card content:
1. Icon: Search | Title: "Generic search results" | Body: "Google gives you blog posts and forum guesses. Not engineering-grade analysis."
2. Icon: UserX | Title: "Vendor bias & delays" | Body: "Adhesive vendors recommend their own products. Responses take days."
3. Icon: DollarSign | Title: "Expensive testing cycles" | Body: "Lab testing runs $500-5,000 per round. Multiple rounds add up fast."
4. Icon: Clock | Title: "Consultant bottleneck" | Body: "Specialists charge $200-500/hr and take weeks to schedule. Production can't wait."

### Component 1.4: Solution Section — "How Gravix Works"
3 alternating rows (text left / visual right, then flip). Section gap: 96px desktop, 64px mobile.

**Feature Block 1: Spec Engine** (text left, visual right)
- Badge: "SPEC ENGINE"
- Heading: "Specify the right adhesive in 60 seconds"
- Body: "Tell us your substrates, environment, and requirements. Get a vendor-neutral specification with application guidance and alternatives."
- Checkmarks:
  - ✓ Vendor-neutral recommendations
  - ✓ Surface prep instructions per substrate
  - ✓ Risk warnings and alternatives
- Mockup: Spec Engine result preview card

**Feature Block 2: Failure Analysis** (visual left, text right)
- Badge: "FAILURE ANALYSIS"
- Heading: "Diagnose failures with ranked root causes"
- Body: "Describe your failure — substrates, conditions, timeline. Get ranked root causes with confidence scores and specific fix recommendations."
- Checkmarks:
  - ✓ Root causes ranked by probability
  - ✓ Immediate + long-term fixes
  - ✓ Prevention plan
- Mockup: Failure Analysis result preview card

**Feature Block 3: Self-Learning Intelligence** (text left, visual right)
- Badge: "SELF-LEARNING AI"
- Heading: "Gets smarter with every analysis"
- Body: "Unlike generic AI tools, Gravix accumulates empirical data from real production outcomes. Every confirmed fix makes the next diagnosis more accurate."
- Checkmarks:
  - ✓ Backed by real production data
  - ✓ Confidence scores calibrated by outcomes
  - ✓ Solutions ranked by confirmed success rate
- Visual: Knowledge flywheel diagram (circular arrows: "Your Analysis" → "Confirmed Fix" → "Knowledge Base" → "Better Analysis")

### Component 1.5: Differentiator Section — "Why Not Just Use ChatGPT?"
Section heading: "Why engineers choose Gravix over generic AI" — 32px, font-bold, text-white, centered, mb-12

Two-column comparison card: bg-brand-800, border, rounded-xl, overflow-hidden
- Left column (Generic AI): bg-brand-800, p-8
- Right column (Gravix): slightly lighter bg, p-8, border-left 2px solid #3B82F6

Rows:
| Generic AI (ChatGPT) | Gravix |
| ○ Different answer every time | ✓ Consistent, structured output you can attach to an ECO |
| ○ Knows textbooks only | ✓ Knows textbooks + real production outcomes |
| ○ Guesses at confidence | ✓ Confidence scores calibrated against confirmed cases |
| ○ Chat transcript output | ✓ Professional PDF report for engineering review |
| ○ Forgets everything | ✓ Accumulates institutional knowledge over time |

### Component 1.6: How It Works — 3 Steps
3 columns, centered, max-width 960px
- Step numbers: 48px, font-bold, JetBrains Mono, text-accent-500
- Connecting dashed line between steps on desktop

Step 1: "Describe your problem" — "Fill out the structured intake form. Takes 2-3 minutes."
Step 2: "Get your analysis" — "AI generates ranked root causes with confidence scores and specific fixes."
Step 3: "Track & improve" — "Report your outcome. Your feedback makes the next analysis smarter for everyone."

### Component 1.7: Pricing Preview
Section heading: "Simple pricing" — 32px, centered, mb-2
Subheading: "Start free. Upgrade when you need full reports." — 16px, text-secondary

Two cards side by side (max-width 360px each, gap-8):

**Free ($0):**
- ✓ 5 analyses/month
- ✓ Full AI results
- ✓ Watermarked PDF
- ○ Preview exec summary (grayed)
- CTA: "Start Free" (secondary)

**Pro ($49/mo):**
- ✓ Unlimited analyses
- ✓ Full exec summary
- ✓ Clean PDF export
- ✓ Full analysis history
- ✓ Similar cases detail
- ✓ Priority processing
- CTA: "Upgrade to Pro" (primary accent)
- Border: 1px solid #3B82F6, border-top 3px solid #3B82F6

Link below: "Need team access? → See all plans" → /pricing
Mobile: Stack vertically, Pro card first

### Component 1.8: Final CTA Section
Layout: Full-width, bg-brand-800/50, py-20, centered
- Heading: "Ready to stop guessing?" — 32px, font-bold, text-white
- Body: "Start with 5 free analyses. No credit card required." — 16px, text-secondary, mb-8
- CTA: "Try Gravix Free →" — primary button, large (px-10 py-4)

---

## PAGE 2: SPEC ENGINE — Route: /tool

### Component 2.1: Stats Bar (below nav)
32px height, bg-brand-800/50, text-xs, centered.
"847 analyses completed • 30+ substrates • 73% resolution rate"

### Component 2.2: Two-Panel Layout
Desktop: 45% form (left) | 55% results (right), separated by 1px border, full viewport height below nav+stats.
Tablet/Mobile: Form full-width, results below.

### Component 2.3: Form Panel (left)
Header: "Specify a Material" — 20px, font-semibold, text-white, mb-6

Fields:
1. Substrate A — Typeahead select, Required. "e.g., Aluminum 6061, ABS, Polycarbonate"
2. Substrate B — Typeahead select, Required. "Material being bonded to Substrate A"
3. Load Type — Select. Options: Structural, Semi-structural, Non-structural, Sealing
4. Environment — Multi-select chips. Options: High humidity, Chemical exposure, UV/outdoor, Thermal cycling, Submersion, Vibration
5. Temperature Range — Dual input (min/max °C). "-40" / "120"
6. Cure Constraints — Select. Options: Room temp only, Heat available, UV available, Fast fixture needed (<5 min)
7. Gap Fill — Number input (mm). "Maximum gap between substrates"
8. Additional Context — Textarea (3 rows). "Production volume, application method, special requirements…"

Form specs:
- All inputs: 44px height, bg-brand-900 (#111827), border 1px solid #374151, rounded, 14px text
- Focus: border 2px solid #3B82F6
- Labels: 13px, font-medium, text-secondary, mb-1.5
- Help text: 12px, text-tertiary, mt-1
- Gap between fields: 20px
- Submit: "Generate Specification →" — full-width, primary accent, 48px height, mt-8

### Component 2.4: Results Panel — Empty State
Centered vertically and horizontally. Spec icon 48px, text-brand-600.
"Your specification will appear here"
"Fill out the form to generate a vendor-neutral material spec with application guidance."

### Component 2.5: Results Panel — Loading State
3-step progress:
- ● Analyzing substrate pair...
- ○ Processing requirements...
- ○ Generating specification...
Progress bar + elapsed timer in JetBrains Mono.

### Component 2.6: Results Panel — Completed State
1. Summary header: Recommended material type (24px, font-bold) + chemistry (14px) + confidence badge
2. Key properties table (2-column grid)
3. Rationale (1-2 paragraphs)
4. Surface prep guidance per substrate (individual cards)
5. Application tips (numbered list)
6. Warnings (bg-warning-500/10, border-left 3px solid #F59E0B)
7. Alternatives (collapsible cards, default collapsed)
8. Action bar (fixed to bottom of results): [Export PDF] [Request Expert Review] [Run Failure Analysis] [New Spec]

### Component 2.7: Confidence Badge (reused)
Ring: 48px diameter, SVG circle, stroke color by range (green ≥90, blue ≥70, amber ≥50, red <50)
- "Empirically Validated" + case count (when knowledge data exists)
- "AI Estimated" (when no knowledge data)

---

## PAGE 3: FAILURE ANALYSIS — Route: /failure

Identical layout to /tool (stats bar + two-panel) with differences:

### Component 3.1: Form Panel
Header: "Diagnose a Failure" — 20px, font-semibold, text-white, mb-6

Fields:
1. Failure Description — Textarea (5 rows), Required, Auto-focused. "Describe what happened…"
2. Adhesive Used — Typeahead. "e.g., Loctite 401, generic epoxy, unknown"
3. Substrate A — Typeahead select, Required
4. Substrate B — Typeahead select, Required
5. Failure Mode — 4 visual radio cards (2×2 grid), Required:
   - Adhesive Failure: "Clean separation from surface"
   - Cohesive Failure: "Failure within adhesive itself"
   - Mixed Mode: "Both adhesive and cohesive"
   - Substrate Failure: "Substrate tears before bond"
6. Time to Failure — Select. Options: Immediate, Hours, Days, 1-4 weeks, 1-6 months, >6 months
7. Industry — Select. Options: Automotive, Aerospace, Electronics, Medical Device, Consumer, Construction, General Mfg, Other
8. Environment — Multi-select chips (same as spec tool)
9. Surface Preparation — Select. Options: Solvent wipe (IPA), Solvent wipe (acetone), Abrasion, Plasma/corona, Primer, None/unknown
10. Production Impact — Select. Options: Line down, Reduced output, Quality hold, Field failure, Prototype, N/A
11. Additional Context — Textarea (3 rows). "Test results, batch info, previous fixes tried…"

Submit: "Analyze Failure →" — full-width, primary accent, 48px

### Component 3.2: Results Panel — Completed State
1. Diagnosis summary: "Primary root cause: [cause name]" + confidence badge
2. Root cause cards (ranked):
   - Rank badge (24px circle, accent for #1)
   - "Gravix Data" line when knowledge exists
   - Explanation + Mechanism
3. Contributing factors (bulleted list)
4. Immediate actions (red left border, "Do This Now")
5. Long-term solutions (blue left border, "Long-Term Fixes")
6. Prevention plan (green left border, "Prevention Plan")
7. Similar cases card (when data exists)
8. Feedback prompt ("Was this analysis helpful?" → expands)
9. Action bar: [Export PDF] [Request Expert Review] [Run Spec Analysis →] [New Analysis]

---

## PAGE 4: PRICING — Route: /pricing

### Component 4.1: Page Header
Heading: "Simple, transparent pricing" — 36px, centered
Subheading: "Start free. Upgrade when you need full reports and unlimited analyses." — 16px, text-secondary

### Component 4.2: Pricing Cards (3 cards)
3 columns, centered, max-width 1080px, gap-8

**Free ($0):**
- 5 analyses/month
- ✓ Full AI results
- ✓ Watermarked PDF
- ✓ Last 5 analyses
- ○ Preview exec summary
- CTA: "Start Free" (secondary)

**Pro ($49/mo):** — border 2px solid #3B82F6, scale-105, "★ Most Popular" badge
- Unlimited analyses
- ✓ Everything in Free, plus:
- ✓ Full exec summary
- ✓ Clean PDF
- ✓ Full history
- ✓ Similar cases detail
- ✓ Priority processing
- CTA: "Upgrade to Pro" (primary accent)

**Team ($149/mo):**
- Unlimited analyses
- ✓ Everything in Pro, plus:
- ✓ 5 team seats
- ✓ Shared workspace
- ✓ API access
- ✓ Branded reports
- CTA: "Contact Sales" (ghost/outline)

### Component 4.3: Enterprise CTA
"Need unlimited access, SSO, or dedicated support? Contact us for Enterprise pricing →"

### Component 4.4: FAQ Accordion
6 questions with expandable answers (max-width 680px, centered):
1. What counts as an analysis?
2. Can I cancel anytime?
3. What payment methods do you accept?
4. Is my data secure?
5. What's in the executive summary?
6. Do you offer annual billing?

---

## PAGE 5: SIGN IN / SIGN UP — Modal overlay (not separate page)

### Component 5.1: Auth Modal
- 440px wide, bg-brand-800, rounded-2xl, p-10
- Logo centered, heading "Sign in to Gravix"
- Email input + "Send Magic Link" button
- Divider "or"
- "Continue with Google" button
- Bottom: "No account? We'll create one automatically."
- Success state: "Check your inbox" + resend option

---

## PAGE 6: USER DASHBOARD — Route: /dashboard

### Component 6.1: Dashboard Header
Left: greeting. Right: plan badge + usage.

### Component 6.2: Quick Actions (2 cards)
- New Material Spec → /tool
- Diagnose a Failure → /failure

### Component 6.3: Recent Analyses (table)
Max 5 rows, each clickable. "View All →" → /history

### Component 6.4: Pending Feedback Banner
"You have X analyses waiting for feedback."

---

## PAGE 7: ANALYSIS HISTORY — Route: /history

### Component 7.1: Filters Bar
[All Types] [All Substrates] [All Outcomes] [Search]

### Component 7.2: History List
Cards with type badge, substrates, result, outcome, PDF download.
Pagination: "Load more" button.
Free users: Last 5 only, blur + upgrade prompt.

---

## PAGE 8: CASE LIBRARY — Route: /cases

### Component 8.1: Page Header
"Failure Case Library" + "Real-world adhesive failure cases, anonymized and shared to help engineers learn faster."

### Component 8.2: Filter Bar
[All Materials] [All Failure Modes] [All Industries] [Search]

### Component 8.3: Case Cards Grid
3 columns desktop, 2 tablet, 1 mobile.

### Component 8.4: Case Detail Page — /cases/[slug]
Article layout, max-width 720px. Breadcrumb, title, tags, summary, root cause, solution, lessons, CTA.

---

## PAGE 9: FEEDBACK LANDING — Route: /feedback/[id]
Simple centered layout, max-width 560px. Analysis summary + feedback prompt.

---

## PAGE 10: SETTINGS — Route: /settings

### Component 10.1: Profile Section
Name, Email (read-only), Company, Role/Title, Save button.

### Component 10.2: Subscription Section
Plan badge, usage bar, Manage Subscription (Stripe portal), Upgrade link.

### Component 10.3: Data Section
Export My Data (JSON), Delete Account (with confirmation).

---

## PAGES THAT DO NOT EXIST
- /about — not needed
- /blog — not needed
- /contact — use mailto: in footer
- /forgot-password — not needed (magic links)
- Separate /signup — unified in auth modal

---

## BUILD ORDER
1. Global: Nav bar with auth state + Footer
2. Auth modal (magic link + Google OAuth)
3. Landing page (all 8 components)
4. Spec Engine (/tool)
5. Failure Analysis (/failure)
6. Pricing page
7. Dashboard
8. History page
9. Case library (list + detail)
10. Settings page
11. Feedback landing page
