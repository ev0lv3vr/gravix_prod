# Auth & Tier Gating — L2 Full Detail

> Combined from gravix-final-prd.md:
> - Part V-A, PAGE 5 (Sign In / Sign Up modal)
> - Part V-B, Section 1 (Navigation Updates — logged in vs out states)
> - Part V-B, Section 4 (Auth Modal Updates)
> - Part V-B, Section 7 (Settings Updates — subscription + seat management)
> - Part II, Section 1.4 (Critical Migration Rules) + Pricing references
>
> **Key rule:** Auth gate is a modal overlay on form submit, NOT a page redirect. localStorage preserves form data.

---

## BASE SPECIFICATION: AUTH MODAL

## PAGE 5: SIGN IN / SIGN UP â€” Route: Modal overlay (not a separate page)

**Trigger:** Clicking "Sign In" in nav, or attempting to use a tool without auth.

### Component 5.1: Auth Modal

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                   [âœ•]               â”‚
    â”‚                                     â”‚
    â”‚          [GRAVIX logo]              â”‚
    â”‚                                     â”‚
    â”‚    Sign in to Gravix                â”‚
    â”‚                                     â”‚
    â”‚    Email                            â”‚
    â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
    â”‚    â”‚ you@company.com          â”‚    â”‚
    â”‚    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
    â”‚                                     â”‚
    â”‚    [Send Magic Link]                â”‚
    â”‚                                     â”‚
    â”‚    â”€â”€â”€â”€â”€â”€â”€ or â”€â”€â”€â”€â”€â”€â”€               â”‚
    â”‚                                     â”‚
    â”‚    [G  Continue with Google]         â”‚
    â”‚                                     â”‚
    â”‚    No account? We'll create one     â”‚
    â”‚    automatically.                   â”‚
    â”‚                                     â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- Modal: 440px wide, `bg-brand-800`, border `1px solid #1F2937`, rounded-2xl, p-10, centered on screen
- Backdrop: `bg-black/60`, blur-sm, click-to-dismiss
- Logo: 24px, centered, mb-8
- Heading: 22px, font-semibold, text-white, centered, mb-8
- Email input: 48px height, full-width, auto-focus
- "Send Magic Link" button: Full-width, primary accent, 48px, mt-4
- Divider: `â”€â”€â”€ or â”€â”€â”€` pattern, text-tertiary, my-6
- Google button: Full-width, `bg-white text-gray-800`, Google "G" icon, 48px
- Bottom text: 13px, text-tertiary, centered, mt-6

**Success state (after magic link sent):**
```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                     â”‚
    â”‚          âœ‰ï¸                          â”‚
    â”‚                                     â”‚
    â”‚    Check your inbox                 â”‚
    â”‚                                     â”‚
    â”‚    We sent a sign-in link to        â”‚
    â”‚    you@company.com                  â”‚
    â”‚                                     â”‚
    â”‚    Didn't receive it?               â”‚
    â”‚    [Resend] or [Try different email] â”‚
    â”‚                                     â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**No separate sign-up page.** Sign in and sign up are the same flow. If the email doesn't exist, account is created on first magic link click. The bottom text "No account? We'll create one automatically." communicates this.

---

## PAGE 6: USER DASHBOARD â€” Route: `/dashboard`

**Requires auth.** Redirect to `/` with auth modal if not signed in.

### Component 6.1: Dashboard Header

```
    Welcome back, Ev                    Plan: Pro  â€¢  12/unlimited analyses used
```

Left: greeting (20px, text-white). Right: plan badge + usage (14px, text-secondary).

### Component 6.2: Quick Actions (2 cards)

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  [spec icon]               â”‚  â”‚  [failure icon]            â”‚
    â”‚                            â”‚  â”‚                            â”‚
    â”‚  New Material Spec         â”‚  â”‚  Diagnose a Failure        â”‚
    â”‚  Generate a specification  â”‚  â”‚  Get root cause analysis   â”‚
    â”‚                            â”‚  â”‚                            â”‚
    â”‚  [Start â†’]                 â”‚  â”‚  [Start â†’]                 â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Two cards, 50/50, linking to `/tool` and `/failure`. `bg-brand-800`, border, hover: `border-accent-500`.

### Component 6.3: Recent Analyses (table)

```
    Recent Analyses                                      [View All â†’]

    | Type     | Substrates              | Result         | Date      |
    |----------|-------------------------|----------------|-----------|
    | Failure  | Aluminum â†’ ABS          | Surface prep   | 2 days ago|
    | Spec     | Steel â†’ Polycarbonate   | MMA Acrylic    | 5 days ago|
    | Failure  | Glass â†’ Silicone rubber | Primer needed  | 1 week ago|
```

Table: `bg-brand-800`, rounded, max 5 rows. Each row clickable â†’ links to analysis detail page. "View All â†’" links to `/history`.

### Component 6.4: Pending Feedback Banner

If the user has analyses without feedback (older than 24h):

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  ðŸ“Š You have 2 analyses waiting for feedback.               â”‚
    â”‚     Your feedback makes Gravix smarter.   [Give Feedback â†’] â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

`bg-accent-500/10`, border `1px solid #3B82F6/30`, rounded, p-4. Dismissible (X button, remembers via localStorage).

---

-e 
---

## NAVIGATION UPDATES (Logged In vs Logged Out)

## V-B: FRONTEND UPDATE ADDENDUM (Supersedes base where noted)

> **This section supersedes V-A above for any component it references.** REPLACE = use this instead. MODIFY = apply changes to original. ADD = new component. DELETE = remove component.

**Conventions:**
- **REPLACE Component X.Y** â€” Remove old component, use this instead
- **MODIFY Component X.Y** â€” Keep existing component, apply listed changes
- **ADD Component X.Y.Z** â€” Insert new component at specified position
- **NEW PAGE** â€” Entirely new page not in original spec
- **DELETE** â€” Remove component entirely

---

# TABLE OF CONTENTS

1. [Navigation Updates](#1-navigation-updates)
2. [Landing Page Updates](#2-landing-page-updates)
3. [Tool Page Updates â€” Spec Engine & Failure Analysis](#3-tool-page-updates)
4. [Auth Modal Updates](#4-auth-modal-updates)
5. [Pricing Page â€” Full Replace](#5-pricing-page--full-replace)
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

## MODIFY: Global Nav â€” Logged Out

Original shows: Logo, "Analyze Failure", "Spec Engine", "Pricing", "Sign In", "Sign Up"

**New logged-out nav:**

```
[GRAVIX logo]    Analyze  â€¢  Products  â€¢  Case Library  â€¢  Pricing    [Sign In]  [Get Started Free]
```

**Changes:**
- "Analyze Failure" and "Spec Engine" collapse into single "Analyze" dropdown with two items: "Failure Analysis" (â†’ `/failure`) and "Spec Engine" (â†’ `/tool`)
- ADD "Products" link â†’ `/products` (public product catalog)
- ADD "Case Library" link â†’ `/cases` (already built, just needs nav link)
- "Sign Up" button relabeled to "Get Started Free" â€” primary accent style, more action-oriented
- "Sign In" stays as ghost/text link

## MODIFY: Global Nav â€” Logged In

Original shows: Logo, tool links, "Dashboard", user menu

**New logged-in nav:**

```
[GRAVIX logo]    Analyze â–¾  â€¢  Products  â€¢  Cases    Dashboard  â€¢  Investigations  â€¢  [ðŸ”” 3]  [User â–¾]
```

**Changes:**
- "Analyze" dropdown: "Failure Analysis", "Spec Engine", "Guided Investigation" (â†’ `/failure?mode=guided`)
- ADD "Investigations" link â†’ `/investigations` (visible only for Quality+ plans, hidden for Free/Pro)
- ADD notification bell icon with unread count badge â†’ clicking opens `/notifications` dropdown or page
- User dropdown menu adds: "Notifications", "Settings", "Subscription", "Sign Out"
- Plan badge pill visible next to user name in dropdown: `Free`, `Pro`, `Quality`, `Enterprise` with color coding

## MODIFY: Global Nav â€” Mobile

- Hamburger menu groups: "Analyze" section (Failure, Spec, Guided), "Explore" section (Products, Cases), "Account" section (Dashboard, Investigations, Notifications, Settings)
- Notification bell stays visible in mobile header (not collapsed into hamburger)

---

-e 
---

## AUTH MODAL ADDENDUM UPDATES

# 4. AUTH MODAL UPDATES

## MODIFY Component 5.1: Auth Modal

**Trigger change:** Original trigger was "clicking Sign In in nav or attempting to use a tool without auth." New trigger adds: "clicking Analyze/Generate button while unauthenticated."

**Key behavioral requirement:** When triggered from a tool page (form submit):
1. Form data is saved to `localStorage` under key `gravix_pending_analysis`
2. Modal opens as overlay â€” form visible behind (blurred backdrop)
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

-e 
---

## SETTINGS PAGE UPDATES (Subscription + Seat Management)

# 7. SETTINGS UPDATES

## MODIFY Component 10.2: Subscription Section

**Update to show correct plans and seat management:**

```
    Current Plan: Quality ($299/mo)
    Seats: 3 of 3 used  [Add Seat â€” $79/mo â†’]
    Next payment: March 1, 2026 â€” $299.00
    [Manage Subscription â†’]  [Change Plan â†’]
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
    â–¡ Investigation assigned     â˜‘ Email  â˜‘ In-app
    â–¡ Action item assigned       â˜‘ Email  â˜‘ In-app
    â–¡ Action item due            â˜‘ Email  â˜‘ In-app
    â–¡ @Mentioned                 â˜‘ Email  â˜‘ In-app
    â–¡ Status changed             â˜ Email  â˜‘ In-app
    â–¡ Investigation closed       â˜‘ Email  â˜‘ In-app
    â–¡ Pattern alert              â˜‘ Email  â˜‘ In-app
    â–¡ Share link accessed        â˜ Email  â˜‘ In-app
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
    â˜‘ Use company logo on reports
    â˜‘ Use custom colors on reports
    â˜ Hide Gravix branding (white-label)

    Inbound Email:
    8d@acme.gravix.io  [Copy]
    Routing Rules:  [Manage â†’]
```

---

-e 
---

## TIER GATING RULES (from V2 Tech Spec)

## 1.4 Pricing Tiers

| Tier | Price | Analyses/mo | Key Features |
|------|-------|------------|--------------|
| Free | $0 | 3 | Spec engine + failure analysis (summary results only) |
| Pro | $79/mo | 30 | Full results, feedback, case library, cross-linking |
| Quality | $299/mo | 100 | Everything in Pro + 8D investigations, guided investigation, 3 seats |
| Enterprise | $799/mo | Unlimited | Everything + OEM templates, pattern alerts, branding, 10 seats |

## 1.5 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python 3.11+), pytest |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | Claude API (Anthropic) |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel (frontend), Railway/Fly.io (backend) |
| CI/CD | GitHub Actions |
| E2E Tests | Playwright |

## 1.6 Feature Map by Tier

| Feature | Free | Pro | Quality | Enterprise |
|---------|------|-----|---------|------------|
| Spec Engine | ✅ (summary) | ✅ (full) | ✅ | ✅ |
| Failure Analysis | ✅ (summary) | ✅ (full) | ✅ | ✅ |
| Feedback System | ❌ | ✅ | ✅ | ✅ |
| Case Library | View only | Full access | Full access | Full access |
| Cross-linking (spec↔failure) | ❌ | ✅ | ✅ | ✅ |
| Knowledge Badges | ❌ | ✅ | ✅ | ✅ |
| 8D Investigations | ❌ | ❌ | ✅ (20/mo) | ✅ (unlimited) |
| Guided Investigation | ❌ | ❌ | ✅ | ✅ |
| Visual Failure Analysis | ❌ | ❌ | ✅ | ✅ |
| TDS Intelligence | ❌ | ❌ | ✅ | ✅ |
| Product Catalog | View only | View only | Full access | Full access |
| Action Item Dashboard | ❌ | ❌ | ✅ | ✅ |
| PDF Report Generation | ❌ | ❌ | ✅ | ✅ (branded) |
| Team Seats | 1 | 1 | 3 | 10 |
| Pattern Alerts | ❌ | ❌ | ❌ | ✅ |
| OEM Templates | ❌ | ❌ | ❌ | ✅ |
| Org Branding | ❌ | ❌ | ❌ | ✅ |
| Admin Dashboard | Internal only | Internal only | Internal only | Internal only |

---


