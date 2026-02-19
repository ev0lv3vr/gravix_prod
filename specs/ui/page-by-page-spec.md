# Page-by-Page Frontend Specification

> Complete frontend spec from gravix-final-prd.md Part V. Includes base specification (V-A) and update addendum (V-B). For any component where V-B says REPLACE, the V-B version is authoritative.

# PART V: PAGE-BY-PAGE FRONTEND SPECIFICATION

> **Source documents merged:** `gravix-page-by-page-spec.md` (v1.0) + `gravix-frontend-update-addendum.md` (v1.1)
>
> **MERGE RULES:** The Frontend Update Addendum modifies the base Page-by-Page spec using REPLACE/MODIFY/ADD directives. For any component marked REPLACE below, the addendum version is authoritative and the original is superseded. For MODIFY, only the listed changes apply — everything else in the original remains. For ADD, this is net-new content. For any component NOT mentioned in the addendum, the base spec below is authoritative.

## V-A: BASE SPECIFICATION (Page-by-Page)


**Design system:** Dark-mode-first. Background `#0A1628`. Accent `#3B82F6`. Refer to gravix-ui-spec.docx for colors, typography, spacing tokens.

---

## GLOBAL: Components on Every Page

### Navigation Bar (sticky, top, 64px height)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [GRAVIX logo]     Spec Engine    Failure Analysis    Pricing    â”‚
â”‚                                                   [Sign In] [Try Free â†’] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Components in order (left to right):**

1. **Logo** â€” "GRAVIX" wordmark, JetBrains Mono, 18px, font-bold, text-white. Links to `/`
2. **Nav links** (desktop only, hidden on mobile):
   - "Spec Engine" â†’ `/tool`
   - "Failure Analysis" â†’ `/failure`
   - "Pricing" â†’ `/pricing`
3. **Auth buttons** (right side):
   - **Signed out:** "Sign In" (ghost button, text-secondary) + "Try Free â†’" (primary button, bg-accent-500)
   - **Signed in:** Usage badge ("3/5 analyses") + User avatar dropdown (Settings, History, Sign Out)

**Mobile (< 768px):** Hamburger icon replaces nav links. Opens full-screen overlay with all links + auth buttons stacked vertically.

**Background:** `#0A1628`, border-bottom `1px solid #1F2937`

---

### Footer (all pages except tool pages)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  GRAVIX                          Product          Company        â”‚
â”‚  Industrial materials            Spec Engine      About          â”‚
â”‚  intelligence                    Failure Analysis Contact        â”‚
â”‚                                  Pricing          Privacy        â”‚
â”‚  Â© 2026 Gravix. All rights       Case Library     Terms          â”‚
â”‚  reserved.                                                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

3-column layout on desktop, stacked on mobile. Background `#050D1A`. 

---

## PAGE 1: LANDING PAGE â€” Route: `/`

This is the most important page. It must communicate three things in order:
1. What Gravix does (specify + diagnose adhesive problems)
2. Why it's better than ChatGPT (self-learning from real production data)
3. How to start (free, no credit card)

### Component 1.1: Hero Section

**Layout:** Full-width, min-height 90vh, centered content, subtle grid background pattern.

```
                    Specify industrial adhesives
                         with confidence.
                    Diagnose failures in minutes.

          AI-powered materials intelligence that learns from
       every analysis. Backed by real production data, not just
                         textbook theory.

         [Try Spec Engine â†’]     [Diagnose a Failure]

                   Free to start â€¢ No credit card
```

**Specs:**
- Headline: 48px (desktop) / 32px (mobile), font-bold, text-white, max-width 720px, centered
- Subheadline: 18px, text-secondary (`#94A3B8`), max-width 560px, centered, line-height 1.6
- **CTA buttons:** 
  - Primary: "Try Spec Engine â†’" â€” `bg-accent-500 hover:bg-accent-600`, 16px, px-8 py-3, rounded-lg
  - Secondary: "Diagnose a Failure" â€” `border border-brand-500 text-secondary hover:text-white`, same size
- Microcopy: 14px, text-tertiary (`#64748B`), centered below buttons, 16px gap

**Key copy note:** The subheadline explicitly says "learns from every analysis" and "real production data." This is the self-learning USP. It must be here.

---

### Component 1.2: Social Proof Bar

**Layout:** Horizontal strip below hero, full-width, `bg-brand-800/50`, border-top and border-bottom `1px solid #1F2937`, py-4.

```
    ðŸ“Š 847+ analyses completed  â€¢  30+ substrate combinations  â€¢  7 adhesive families  â€¢  73% resolution rate
```

**Specs:**
- All numbers in JetBrains Mono, text-secondary
- Labels in DM Sans / Inter, text-tertiary
- Dot separators in `#374151`
- Numbers pull from `/v1/stats/public` API (with sensible minimums as floor: never show "0 analyses")
- Single row on desktop, 2x2 grid on mobile

---

### Component 1.3: Problem Section â€” "The Problem"

**Layout:** Section heading + 4 cards in a row.

```
                     Engineers waste weeks on adhesive failures

    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ ðŸ”           â”‚  â”‚ ðŸ“ž           â”‚  â”‚ ðŸ’°           â”‚  â”‚ â±ï¸           â”‚
    â”‚ Google gives  â”‚  â”‚ Vendors are  â”‚  â”‚ Testing costsâ”‚  â”‚ Consultants  â”‚
    â”‚ generic,      â”‚  â”‚ biased and   â”‚  â”‚ $500-$5000   â”‚  â”‚ charge $300/ â”‚
    â”‚ unreliable    â”‚  â”‚ slow to      â”‚  â”‚ per round    â”‚  â”‚ hr and take  â”‚
    â”‚ answers       â”‚  â”‚ respond      â”‚  â”‚              â”‚  â”‚ weeks        â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- Section heading: 32px, font-bold, text-white, centered, mb-12
- Cards: `bg-brand-800`, border `1px solid #1F2937`, rounded-lg, p-6
- Icon: 32px, text-accent-500, mb-4
- Card title: 16px, font-semibold, text-white, mb-2
- Card body: 14px, text-secondary, line-height 1.5
- Grid: 4 columns desktop, 2 columns tablet, 1 column mobile
- Gap: 24px

**Card content (exact copy):**

| Icon | Title | Body |
|------|-------|------|
| ðŸ” | Generic search results | Google gives you blog posts and forum guesses. Not engineering-grade analysis. |
| ðŸ“ž | Vendor bias & delays | Adhesive vendors recommend their own products. Responses take days. |
| ðŸ’° | Expensive testing cycles | Lab testing runs $500-5,000 per round. Multiple rounds add up fast. |
| â±ï¸ | Consultant bottleneck | Specialists charge $200-500/hr and take weeks to schedule. Production can't wait. |

---

### Component 1.4: Solution Section â€” "How Gravix Works"

**Layout:** 3 alternating rows (text left / visual right, then flip). Each row is a feature block.

**Feature Block 1: Spec Engine**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                             â”‚
â”‚  Specify the right adhesive              [Mockup card:      â”‚
â”‚  in 60 seconds                            Spec Engine       â”‚
â”‚                                           result preview]   â”‚
â”‚  Tell us your substrates, environment,                      â”‚
â”‚  and requirements. Get a vendor-neutral                     â”‚
â”‚  specification with application guidance                    â”‚
â”‚  and alternatives.                                          â”‚
â”‚                                                             â”‚
â”‚  âœ“ Vendor-neutral recommendations                          â”‚
â”‚  âœ“ Surface prep instructions per substrate                  â”‚
â”‚  âœ“ Risk warnings and alternatives                          â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Feature Block 2: Failure Analysis**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                             â”‚
â”‚  [Mockup card:           Diagnose failures with            â”‚
â”‚   Failure Analysis        ranked root causes               â”‚
â”‚   result preview]                                          â”‚
â”‚                          Describe your failure â€” substrates, â”‚
â”‚                          conditions, timeline. Get ranked    â”‚
â”‚                          root causes with confidence scores  â”‚
â”‚                          and specific fix recommendations.   â”‚
â”‚                                                             â”‚
â”‚                          âœ“ Root causes ranked by probability â”‚
â”‚                          âœ“ Immediate + long-term fixes       â”‚
â”‚                          âœ“ Prevention plan                   â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Feature Block 3: Self-Learning Intelligence (THE NEW USP)**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                             â”‚
â”‚  Gets smarter with                   [Visual:               â”‚
â”‚  every analysis                       Knowledge flywheel    â”‚
â”‚                                       diagram â€” circular    â”‚
â”‚  Unlike generic AI tools, Gravix       arrows connecting    â”‚
â”‚  accumulates empirical data from       "Your Analysis" â†’    â”‚
â”‚  real production outcomes. Every        "Confirmed Fix" â†’   â”‚
â”‚  confirmed fix makes the next           "Knowledge Base" â†’  â”‚
â”‚  diagnosis more accurate.               "Better Analysis"   â”‚
â”‚                                        â†’ back to start]    â”‚
â”‚  âœ“ Backed by real production data                          â”‚
â”‚  âœ“ Confidence scores calibrated by outcomes                â”‚
â”‚  âœ“ Solutions ranked by confirmed success rate              â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs for all feature blocks:**
- Two-column layout: 50/50 split, gap-16
- Heading: 28px, font-bold, text-white, mb-4
- Body: 16px, text-secondary, line-height 1.6, mb-6
- Checkmarks: `text-accent-500`, 14px label text-secondary
- Mockup cards: `bg-brand-800`, border, rounded-xl, p-6, subtle rotate transform on desktop
- Alternating: block 1 text-left, block 2 text-right, block 3 text-left
- Mobile: All stack vertically (text above, visual below)
- Section gap between blocks: 96px (desktop), 64px (mobile)

---

### Component 1.5: Differentiator Section â€” "Why Not Just Use ChatGPT?"

**This section directly addresses the elephant in the room. It must exist.**

**Layout:** Section heading + comparison table/grid

```
                     Why engineers choose Gravix over generic AI

    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                         â”‚                                     â”‚
    â”‚  Generic AI (ChatGPT)   â”‚  Gravix                            â”‚
    â”‚                         â”‚                                     â”‚
    â”‚  â—‹ Different answer      â”‚  âœ“ Consistent, structured output   â”‚
    â”‚    every time            â”‚    you can attach to an ECO        â”‚
    â”‚                         â”‚                                     â”‚
    â”‚  â—‹ Knows textbooks       â”‚  âœ“ Knows textbooks + real          â”‚
    â”‚    only                  â”‚    production outcomes              â”‚
    â”‚                         â”‚                                     â”‚
    â”‚  â—‹ Guesses at            â”‚  âœ“ Confidence scores calibrated    â”‚
    â”‚    confidence            â”‚    against confirmed cases          â”‚
    â”‚                         â”‚                                     â”‚
    â”‚  â—‹ Chat transcript       â”‚  âœ“ Professional PDF report for     â”‚
    â”‚    output                â”‚    engineering review               â”‚
    â”‚                         â”‚                                     â”‚
    â”‚  â—‹ Forgets everything    â”‚  âœ“ Accumulates institutional       â”‚
    â”‚                         â”‚    knowledge over time              â”‚
    â”‚                         â”‚                                     â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- Section heading: 32px, font-bold, text-white, centered, mb-12
- Two-column comparison card: `bg-brand-800`, border, rounded-xl, overflow-hidden
- Left column (Generic AI): `bg-brand-800`, p-8
- Right column (Gravix): `bg-brand-750` (slightly lighter), p-8, border-left `2px solid #3B82F6`
- Column headers: 18px, font-semibold. Left: text-secondary. Right: text-accent-500
- Row items: 15px, text-secondary
- Left circles: `text-red-400` â—‹
- Right checkmarks: `text-accent-500` âœ“
- Rows separated by `border-bottom 1px solid #1F2937`
- Mobile: Stack vertically, left column above right column

---

### Component 1.6: How It Works â€” 3 Steps

**Layout:** Horizontal 3-step flow.

```
         â‘                           â‘¡                          â‘¢
    Describe your               Get your                   Track &
    problem                     analysis                   improve

    Fill out the structured     AI generates ranked        Report your outcome.
    intake form. Takes          root causes with           Your feedback makes
    2-3 minutes.                confidence scores          the next analysis
                                and specific fixes.        smarter for everyone.

```

**Specs:**
- 3 columns, centered, max-width 960px
- Step number: 48px, font-bold, JetBrains Mono, text-accent-500
- Step title: 18px, font-semibold, text-white, mb-3
- Step body: 14px, text-secondary, max-width 280px per column
- Connecting line between steps: thin dashed line, `#374151`, desktop only
- Mobile: vertical stack with step numbers as left-aligned badges

---

### Component 1.7: Pricing Preview

**Layout:** Two pricing cards side by side, centered.

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Free                â”‚    â”‚  Pro            $49/mo   â”‚
    â”‚  $0                  â”‚    â”‚                          â”‚
    â”‚                      â”‚    â”‚  âœ“ Unlimited analyses    â”‚
    â”‚  âœ“ 5 analyses/month  â”‚    â”‚  âœ“ Full exec summary     â”‚
    â”‚  âœ“ Full AI results   â”‚    â”‚  âœ“ Clean PDF export      â”‚
    â”‚  âœ“ Watermarked PDF   â”‚    â”‚  âœ“ Full analysis history â”‚
    â”‚  â—‹ Preview exec      â”‚    â”‚  âœ“ Similar cases detail  â”‚
    â”‚    summary           â”‚    â”‚  âœ“ Priority processing   â”‚
    â”‚                      â”‚    â”‚                          â”‚
    â”‚  [Start Free]        â”‚    â”‚  [Upgrade to Pro]        â”‚
    â”‚                      â”‚    â”‚                          â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                    Need team access? â†’ See all plans
```

**Specs:**
- Section heading: "Simple pricing" â€” 32px, centered, mb-2
- Subheading: "Start free. Upgrade when you need full reports." â€” 16px, text-secondary, centered, mb-12
- Cards: max-width 360px each, gap-8
- Free card: `bg-brand-800`, border `1px solid #1F2937`, rounded-xl, p-8
- Pro card: `bg-brand-800`, border `1px solid #3B82F6`, border-top `3px solid #3B82F6`, rounded-xl, p-8, subtle shadow
- Price: 36px, font-bold, JetBrains Mono. Free: text-white. Pro: text-accent-500
- Per month: 14px, text-tertiary
- Feature list: 14px, spacing 12px between items
  - Included: `text-accent-500` âœ“ + text-secondary
  - Not included: `text-tertiary` â—‹ + text-tertiary (strikethrough-style)
- CTA: Full-width button at bottom. Free: secondary style. Pro: primary accent style.
- "See all plans" link: 14px, text-accent-500, centered below cards, links to `/pricing`
- Mobile: Stack vertically, Pro card first (it's the recommended plan)

---

### Component 1.8: Final CTA Section

**Layout:** Full-width section, centered, `bg-brand-800/50`, py-20.

```
                    Ready to stop guessing?

             Start with 5 free analyses. No credit card required.

                        [Try Gravix Free â†’]
```

**Specs:**
- Heading: 32px, font-bold, text-white, centered
- Body: 16px, text-secondary, centered, mb-8
- CTA: Primary button, large (px-10 py-4), centered

---

## PAGE 2: SPEC ENGINE â€” Route: `/tool`

### Component 2.1: Stats Bar (below nav)

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
  ðŸ“Š 847 analyses completed  â€¢  30+ substrates  â€¢  73% resolution rate
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

32px height, `bg-brand-800/50`, text-xs, centered. Same as landing page social proof bar but compact single-line.

### Component 2.2: Two-Panel Layout

**Desktop:** 45% form (left) | 55% results (right), separated by 1px border, full viewport height below nav+stats.

**Tablet:** Form full-width, results below.

**Mobile:** Form full-width, results below.

### Component 2.3: Form Panel (left)

**Header:** "Specify a Material" â€” 20px, font-semibold, text-white, mb-6

**Fields in order:**

| # | Field | Type | Required | Placeholder/Help |
|---|-------|------|----------|-----------------|
| 1 | Substrate A | Typeahead select | Yes | "e.g., Aluminum 6061, ABS, Polycarbonate" |
| 2 | Substrate B | Typeahead select | Yes | "Material being bonded to Substrate A" |
| 3 | Load Type | Select | No | Options: Structural, Semi-structural, Non-structural, Sealing |
| 4 | Environment | Multi-select chips | No | Options: High humidity, Chemical exposure, UV/outdoor, Thermal cycling, Submersion, Vibration |
| 5 | Temperature Range | Dual input (min/max Â°C) | No | "-40" / "120" |
| 6 | Cure Constraints | Select | No | Options: Room temp only, Heat available, UV available, Fast fixture needed (<5 min) |
| 7 | Gap Fill | Number input (mm) | No | "Maximum gap between substrates" |
| 8 | Additional Context | Textarea (3 rows) | No | "Production volume, application method, special requirements..." |

**Form specs:**
- All inputs: 44px height, `bg-brand-900 (#111827)`, border `1px solid #374151`, rounded, 14px text
- Focus: border `2px solid #3B82F6`, remove 1px border
- Labels: 13px, font-medium, text-secondary, mb-1.5
- Help text: 12px, text-tertiary, mt-1
- Substrate typeahead: dropdown with category grouping (Metals, Plastics, Elastomers, Composites, Other), recent selections pinned at top, fuzzy search
- Multi-select chips: small rounded pills, `bg-accent-500/20 text-accent-500` when selected
- Gap between fields: 20px

**Submit button:** "Generate Specification â†’" â€” full-width, primary accent, 48px height, mt-8

### Component 2.4: Results Panel (right) â€” Empty State

Before any analysis is run:

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                       â”‚
    â”‚          [spec icon, 48px]            â”‚
    â”‚                                       â”‚
    â”‚    Your specification will            â”‚
    â”‚    appear here                        â”‚
    â”‚                                       â”‚
    â”‚    Fill out the form to generate      â”‚
    â”‚    a vendor-neutral material spec     â”‚
    â”‚    with application guidance.         â”‚
    â”‚                                       â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Centered vertically and horizontally. Icon `text-brand-600`. Text `text-tertiary`. 

### Component 2.5: Results Panel â€” Loading State

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                       â”‚
    â”‚    â— Analyzing substrate pair...      â”‚
    â”‚    â—‹ Processing requirements...       â”‚
    â”‚    â—‹ Generating specification...      â”‚
    â”‚                                       â”‚
    â”‚    â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  45%          â”‚
    â”‚    Elapsed: 3.2s                      â”‚
    â”‚                                       â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

3-step progress: steps turn from `â—‹ text-tertiary` to `â— text-accent-500` as they complete. Progress bar below. Elapsed timer in JetBrains Mono.

### Component 2.6: Results Panel â€” Completed State

Renders top-to-bottom in this order:

1. **Summary header**: Recommended material type (24px, font-bold, text-white) + chemistry (14px, text-secondary) + confidence badge (see Component 2.7)

2. **Key properties table**: 2-column grid
   | Property | Value |
   |----------|-------|
   | Viscosity | Paste, 10,000-30,000 cP |
   | Shear Strength | 2,500-3,500 PSI |
   | Service Temp | -40Â°C to 120Â°C |
   | Cure Time | 24h RT |
   | Gap Fill | Up to 5mm |

   Cells: `bg-brand-800`, py-3 px-4, 13px. Property label text-tertiary, value text-white JetBrains Mono.

3. **Rationale**: 1-2 paragraph explanation. 14px, text-secondary, `bg-brand-800` card, p-5.

4. **Surface prep guidance**: Per-substrate cards
   ```
   â”Œâ”€ Aluminum 6061 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ Degrease with acetone. Abrade with â”‚
   â”‚ 180-grit. Wipe clean after.        â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   â”Œâ”€ ABS Plastic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ Degrease with IPA only. Do NOT use â”‚
   â”‚ acetone. Light abrasion optional.  â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   ```

5. **Application tips**: Numbered list (not bullets). 14px, text-secondary.

6. **Warnings**: `bg-warning-500/10`, border-left `3px solid #F59E0B`, p-4. Icon âš ï¸.

7. **Alternatives**: Collapsible cards, each with material type + trade-offs. Default collapsed.

8. **Action bar**: Fixed to bottom of results panel (not viewport).
   ```
   [Export PDF]  [Request Expert Review]  [Run Failure Analysis]  [New Spec]
   ```
   Export PDF = primary. Others = secondary/ghost.

### Component 2.7: Confidence Badge (reused on both tool pages)

```
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚  [circular ring 87%]  Empirically    â”‚
  â”‚                       Validated      â”‚
  â”‚                       23 cases       â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

OR if no knowledge data:

```
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚  [circular ring 72%]  AI Estimated   â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Ring: 48px diameter, SVG circle, stroke color by range (green â‰¥90, blue â‰¥70, amber â‰¥50, red <50)
- "Empirically Validated": text-accent-500, 12px, font-medium
- "AI Estimated": text-tertiary, 12px
- Case count: text-tertiary, 11px

---

## PAGE 3: FAILURE ANALYSIS â€” Route: `/failure`

### Identical layout to `/tool` (stats bar + two-panel) with these differences:

### Component 3.1: Form Panel

**Header:** "Diagnose a Failure" â€” 20px, font-semibold, text-white, mb-6

**Fields in order:**

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | Failure Description | Textarea (5 rows) | Yes | Auto-focused. "Describe what happened â€” what failed, when, how it looked..." |
| 2 | Adhesive Used | Typeahead | No | "e.g., Loctite 401, generic epoxy, unknown" |
| 3 | Substrate A | Typeahead select | Yes | Same typeahead as spec tool |
| 4 | Substrate B | Typeahead select | Yes | Same typeahead |
| 5 | Failure Mode | 4 visual radio cards (2Ã—2 grid) | Yes | See below |
| 6 | Time to Failure | Select | No | Options: Immediate, Hours, Days, 1-4 weeks, 1-6 months, >6 months |
| 7 | Industry | Select | No | Options: Automotive, Aerospace, Electronics, Medical Device, Consumer, Construction, General Mfg, Other |
| 8 | Environment | Multi-select chips | No | Same options as spec tool |
| 9 | Surface Preparation | Select | No | Options: Solvent wipe (IPA), Solvent wipe (acetone), Abrasion, Plasma/corona, Primer, None/unknown |
| 10 | Production Impact | Select | No | Options: Line down, Reduced output, Quality hold, Field failure, Prototype, N/A |
| 11 | Additional Context | Textarea (3 rows) | No | "Test results, batch info, previous fixes tried..." |

**Failure Mode Cards (Field 5):**

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  [cross-section     â”‚  â”‚  [cross-section     â”‚
    â”‚   diagram]          â”‚  â”‚   diagram]          â”‚
    â”‚                     â”‚  â”‚                     â”‚
    â”‚  Adhesive Failure   â”‚  â”‚  Cohesive Failure   â”‚
    â”‚  Clean separation   â”‚  â”‚  Failure within     â”‚
    â”‚  from surface       â”‚  â”‚  adhesive itself    â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  [cross-section     â”‚  â”‚  [cross-section     â”‚
    â”‚   diagram]          â”‚  â”‚   diagram]          â”‚
    â”‚                     â”‚  â”‚                     â”‚
    â”‚  Mixed Mode         â”‚  â”‚  Substrate Failure  â”‚
    â”‚  Both adhesive and  â”‚  â”‚  Substrate tears    â”‚
    â”‚  cohesive           â”‚  â”‚  before bond        â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Cards: 120px tall, `bg-brand-800`, border, rounded-lg, p-4. Selected: `border-accent-500`, `bg-accent-500/10`. Diagram: simple SVG showing the failure pattern (two rectangles representing substrates with adhesive layer between them, failure line in red). Mobile: 1-column stack.

**Submit button:** "Analyze Failure â†’" â€” full-width, primary accent, 48px.

### Component 3.2: Results Panel â€” Completed State

Renders top-to-bottom:

1. **Diagnosis summary**: "Primary root cause: [cause name]" â€” 20px, font-semibold, text-white + confidence badge

2. **Root cause cards** (1 per root cause, ranked):
   ```
   â”Œâ”€ #1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  Inadequate Surface Preparation on Aluminum           â”‚
   â”‚  Confidence: [87% ring] Empirically Validated         â”‚
   â”‚                                                       â”‚
   â”‚  ðŸ“Š Gravix Data: Confirmed in 64% of 23 similar     â”‚
   â”‚     aluminum-to-plastic cases                         â”‚
   â”‚                                                       â”‚
   â”‚  The clean adhesive failure on the aluminum side      â”‚
   â”‚  indicates the oxide layer was not disrupted...       â”‚
   â”‚                                                       â”‚
   â”‚  Mechanism: Aluminum oxide acts as weak boundary...   â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   ```
   
   - Rank badge: 24px circle, `bg-accent-500` for #1, `bg-brand-600` for #2-3
   - "Gravix Data" line: `bg-accent-500/10`, rounded, px-3 py-2, 12px. Only shows when knowledge context exists. Icon ðŸ“Š.
   - Explanation: 14px, text-secondary
   - Mechanism: 13px, text-tertiary, italic

3. **Contributing factors**: Simple list, `bg-brand-800` card, bulleted

4. **Immediate actions**: Card with red left border (`border-left 3px solid #EF4444`), heading "Do This Now", numbered list

5. **Long-term solutions**: Card with blue left border (`border-left 3px solid #3B82F6`), heading "Long-Term Fixes", numbered list

6. **Prevention plan**: Card with green left border, heading "Prevention Plan", numbered checklist

7. **Similar cases sidebar** (only when data exists):
   ```
   â”Œâ”€ ðŸ“‹ Similar Cases in Gravix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚                                        â”‚
   â”‚  5 engineers analyzed this substrate   â”‚
   â”‚  combination. Surface prep was the     â”‚
   â”‚  issue in 3/5 cases (60%).            â”‚
   â”‚                                        â”‚
   â”‚  Most effective fix: abrade + acetone  â”‚
   â”‚                                        â”‚
   â”‚  [View related cases â†’]               â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   ```
   
   This renders as a card within the results flow (between recommendations and action bar), NOT as a literal sidebar column.

8. **Feedback prompt** (always present at bottom of results):
   ```
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  Was this analysis helpful?                  â”‚
   â”‚                                              â”‚
   â”‚  [ ðŸ‘ Helpful ]    [ ðŸ‘Ž Not Helpful ]        â”‚
   â”‚                                              â”‚
   â”‚  (expands to root cause confirmation         â”‚
   â”‚   and detailed feedback after click)         â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   ```

9. **Action bar** (bottom of results):
   ```
   [Export PDF]  [Request Expert Review]  [Run Spec Analysis â†’]  [New Analysis]
   ```
   "Run Spec Analysis â†’" pre-fills the spec form with substrates + environment from this analysis.

---

## PAGE 4: PRICING â€” Route: `/pricing`

### Component 4.1: Page Header

```
                         Simple, transparent pricing

               Start free. Upgrade when you need full reports
                        and unlimited analyses.
```

Heading: 36px, centered. Subheading: 16px, text-secondary, centered.

### Component 4.2: Pricing Cards (3 cards)

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Free        â”‚  â”‚  Pro       â˜…      â”‚  â”‚  Team            â”‚
    â”‚  $0          â”‚  â”‚  $49/mo           â”‚  â”‚  $149/mo         â”‚
    â”‚              â”‚  â”‚                   â”‚  â”‚                  â”‚
    â”‚  5 analyses  â”‚  â”‚  Unlimited        â”‚  â”‚  Unlimited       â”‚
    â”‚  /month      â”‚  â”‚  analyses         â”‚  â”‚  analyses        â”‚
    â”‚              â”‚  â”‚                   â”‚  â”‚                  â”‚
    â”‚  âœ“ Full AI   â”‚  â”‚  âœ“ Everything in  â”‚  â”‚  âœ“ Everything in â”‚
    â”‚    results   â”‚  â”‚    Free, plus:    â”‚  â”‚    Pro, plus:    â”‚
    â”‚  âœ“ Water-    â”‚  â”‚  âœ“ Full exec      â”‚  â”‚  âœ“ 5 team seats  â”‚
    â”‚    marked    â”‚  â”‚    summary        â”‚  â”‚  âœ“ Shared        â”‚
    â”‚    PDF       â”‚  â”‚  âœ“ Clean PDF      â”‚  â”‚    workspace     â”‚
    â”‚  âœ“ Last 5    â”‚  â”‚  âœ“ Full history   â”‚  â”‚  âœ“ API access    â”‚
    â”‚    analyses  â”‚  â”‚  âœ“ Similar cases  â”‚  â”‚  âœ“ Branded       â”‚
    â”‚  â—‹ Preview   â”‚  â”‚    detail         â”‚  â”‚    reports       â”‚
    â”‚    exec      â”‚  â”‚  âœ“ Priority       â”‚  â”‚                  â”‚
    â”‚    summary   â”‚  â”‚    processing     â”‚  â”‚                  â”‚
    â”‚              â”‚  â”‚                   â”‚  â”‚                  â”‚
    â”‚ [Start Free] â”‚  â”‚ [Upgrade to Pro]  â”‚  â”‚ [Contact Sales]  â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- 3 columns, centered, max-width 1080px, gap-8
- All cards: `bg-brand-800`, rounded-xl, p-8
- Pro card (middle): `border 2px solid #3B82F6`, scale slightly larger (scale-105 on desktop), "â˜… Most Popular" badge top-right corner
- Plan name: 14px, uppercase, tracking-wider, text-tertiary
- Price: 48px, font-bold, JetBrains Mono. Free: text-white. Pro: text-accent-500. Team: text-white.
- "/mo": 16px, text-tertiary, inline after price
- Volume line: 16px, text-secondary, mb-6
- Feature list: 14px, gap-3
  - âœ“ included: text-secondary, check icon text-accent-500
  - â—‹ limited: text-tertiary
- CTA: Full-width button at bottom. Free: secondary. Pro: primary accent. Team: ghost/outline.
- Mobile: Stack vertically, Pro card first

### Component 4.3: Enterprise CTA

Below pricing cards, centered:

```
    Need unlimited access, SSO, or dedicated support?
    [Contact us for Enterprise pricing â†’]
```

14px, text-secondary. Link is text-accent-500.

### Component 4.4: FAQ Accordion

6-8 questions. Each is a clickable row that expands to show the answer.

| Question | Answer |
|----------|--------|
| What counts as an analysis? | Each failure diagnosis or material specification request counts as one analysis. |
| Can I cancel anytime? | Yes. Cancel anytime from your account settings. You keep access until the end of your billing period. |
| What payment methods do you accept? | All major credit cards via Stripe. |
| Is my data secure? | All data is encrypted in transit and at rest. We never share your analysis data with third parties. |
| What's in the executive summary? | A concise management-ready summary of findings, recommendations, and business impact â€” designed to share with leadership. |
| Do you offer annual billing? | Not yet, but it's coming. Annual plans will include a 20% discount. |

**Specs:**
- Max-width 680px, centered, mt-16
- Question row: py-4, border-bottom `1px solid #1F2937`, cursor-pointer
- Question text: 15px, font-medium, text-white
- Chevron: right-aligned, rotates 90Â° on expand
- Answer: 14px, text-secondary, py-3, animate expand

---

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

## PAGE 7: ANALYSIS HISTORY â€” Route: `/history`

**Requires auth.**

### Component 7.1: Filters Bar

```
    [All Types â–¾]  [All Substrates â–¾]  [All Outcomes â–¾]  [Search... ðŸ”]
```

Horizontal filter row. Select dropdowns + text search. Filters apply immediately (no submit button).

### Component 7.2: History List

Each item is a card:

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Failure Analysis  â€¢  Feb 8, 2026                  [PDF â†“]  â”‚
    â”‚                                                              â”‚
    â”‚  Aluminum 6061 â†’ ABS  â€¢  Cyanoacrylate  â€¢  Debonding       â”‚
    â”‚                                                              â”‚
    â”‚  Root cause: Surface preparation (87% confidence)            â”‚
    â”‚  Outcome: âœ“ Resolved                                        â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Card: `bg-brand-800`, border, rounded-lg, p-5, mb-3, cursor-pointer (whole card links to detail)
- Type badge: small pill, `bg-accent-500/20 text-accent-500` for Failure, `bg-green-500/20 text-green-500` for Spec
- Outcome badge: `âœ“ Resolved` in green, `â—‹ Pending feedback` in text-tertiary
- PDF download icon: right-aligned, ghost button
- Pagination: "Load more" button at bottom (not numbered pages)

**Free users:** See last 5 only. Below the 5th item: "Upgrade to Pro for full history" blurred card.

---

## PAGE 8: CASE LIBRARY â€” Route: `/cases`

**Public (no auth required).** This is an SEO page.

### Component 8.1: Page Header

```
                    Failure Case Library

         Real-world adhesive failure cases, anonymized
           and shared to help engineers learn faster.
```

### Component 8.2: Filter Bar

```
    [All Materials â–¾]  [All Failure Modes â–¾]  [All Industries â–¾]  [Search...]
```

### Component 8.3: Case Cards Grid

3 columns desktop, 2 tablet, 1 mobile.

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Cyanoacrylate  â€¢  Debonding      â”‚
    â”‚                                    â”‚
    â”‚  CA Debonding from Aluminum:       â”‚
    â”‚  Surface Prep Root Cause           â”‚
    â”‚                                    â”‚
    â”‚  Bond to aluminum 6061 failed      â”‚
    â”‚  after 2 weeks in automotive...    â”‚
    â”‚                                    â”‚
    â”‚  âœ“ Resolved  â€¢  Automotive         â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Card: `bg-brand-800`, border, rounded-lg, p-5, hover: `border-accent-500`
- Material + failure mode: 12px pills at top
- Title: 16px, font-semibold, text-white, mb-2
- Summary: 14px, text-secondary, 3 lines max (overflow hidden)
- Bottom: outcome badge + industry tag, 12px

Each card links to `/cases/[slug]`.

### Component 8.4: Case Detail Page â€” Route: `/cases/[slug]`

Full-width article layout, max-width 720px centered. Structured as:

1. Breadcrumb: Cases > [Material] > [Title]
2. Title: 28px, font-bold
3. Tags: material, failure mode, industry, "âœ“ Resolved"
4. Summary paragraph
5. Root Cause section (heading + paragraph)
6. Solution section (heading + paragraph)
7. Lessons Learned (heading + 2-3 items)
8. CTA: "Have a similar problem? [Run your own analysis â†’]"

---

## PAGE 9: FEEDBACK LANDING â€” Route: `/feedback/[id]`

(For email follow-up links. Already specified in V1.1 migration plan. Including here for completeness.)

Simple centered layout, max-width 560px. Shows analysis summary + the FeedbackPrompt component with pre-selected outcome from URL query param.

---

## PAGE 10: SETTINGS â€” Route: `/settings`

**Requires auth.** Minimal for V1.

### Component 10.1: Profile Section

- Name (text input)
- Email (read-only, grayed)
- Company (text input)
- Role/Title (text input)
- [Save Changes] button

### Component 10.2: Subscription Section

- Current plan badge
- Usage this month: "X of Y analyses used" with progress bar
- [Manage Subscription] â†’ opens Stripe Customer Portal (hosted by Stripe, no custom UI needed)
- [Upgrade] â†’ links to `/pricing` (only shows for free users)

### Component 10.3: Data Section

- [Export My Data] â†’ downloads JSON of all analyses
- [Delete Account] â†’ confirmation modal, then deletes

---

## PAGES THAT DO NOT EXIST (do not build these)

- `/about` â€” not needed for V1. Footer link can go to a simple paragraph on landing page.
- `/blog` â€” not needed for V1.
- `/contact` â€” use a `mailto:` link in footer.
- `/forgot-password` â€” not needed, we use magic links (passwordless).
- Separate `/signup` page â€” sign in and sign up are unified in the auth modal.

---

## COMPONENT REUSE MAP

| Component | Used On |
|-----------|---------|
| Nav bar | Every page |
| Footer | Landing, Pricing, Cases, Settings |
| Stats bar | `/tool`, `/failure` |
| Typeahead substrate selector | `/tool` form, `/failure` form |
| Confidence badge | `/tool` results, `/failure` results |
| Feedback prompt | `/failure` results, `/tool` results, `/feedback/[id]` |
| Auth modal | Triggered from nav "Sign In", or on protected page access |
| Action bar (Export PDF, etc.) | `/tool` results, `/failure` results |

---

## BUILD ORDER FOR OPENCLAW

If rebuilding or correcting the frontend:

```
1. Global: Nav bar with auth state + Footer
2. Auth modal (magic link + Google OAuth)
3. Landing page (all 8 components in order)
4. Spec Engine (/tool) â€” form + empty state + loading + results
5. Failure Analysis (/failure) â€” form + results + feedback prompt
6. Pricing page
7. Dashboard
8. History page
9. Case library (list + detail)
10. Settings page
11. Feedback landing page (/feedback/[id])
```

---

**END OF PAGE-BY-PAGE SPECIFICATION**


---

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

# 2. LANDING PAGE UPDATES

## REPLACE Component 1.1: Hero Section

Old hero: "Specify industrial adhesives with confidence. Diagnose failures in minutes."

**New hero:**

```
                 The adhesive intelligence platform
                  for manufacturing quality teams.

       AI-powered failure analysis, 8D investigation management,
     and cross-case pattern detection â€” backed by real production data,
                        not just textbook theory.

        [Analyze a Failure]     [See How It Works â†“]

              Free to start â€¢ No credit card required
```

**Specs:**
- Headline: 48px (desktop) / 32px (mobile), font-bold, text-white, max-width 800px, centered
- "for manufacturing quality teams" on second line, same style (not smaller â€” this is the buyer signal)
- Subheadline: 18px, text-secondary (`#94A3B8`), max-width 640px, centered, line-height 1.6
- Key terms in subheadline: "failure analysis", "8D investigation management", "cross-case pattern detection" â€” these are the SEO targets and buyer keywords
- Primary CTA: "Analyze a Failure" â€” `bg-accent-500 hover:bg-accent-600`, links to `/failure`
- Secondary CTA: "See How It Works â†“" â€” ghost/border style, smooth-scrolls to solution section
- Microcopy: same as original spec

**Rationale:** Old hero sold to individual engineers ("diagnose failures"). New hero sells to quality managers AND engineers. "Intelligence platform" positions as team tool, not personal utility. "8D investigation management" signals enterprise capability immediately.

---

## MODIFY Component 1.2: Social Proof Bar

**Replace stats with:**

```
ðŸ“Š 2,400+ analyses completed  â€¢  150+ substrate pairs  â€¢  89% resolution rate  â€¢  Used by automotive, aerospace & medical device teams
```

**Changes:**
- Remove "7 adhesive families" (not compelling)
- Add "Used by automotive, aerospace & medical device teams" â€” industry credibility signal
- Numbers pull from `/v1/stats/public` with higher floor values as product matures
- Keep same visual spec (horizontal strip, monospace numbers)

---

## MODIFY Component 1.3: Problem Section

**Replace section heading:** "Engineers waste weeks on adhesive failures" â†’ **"Adhesive failures cost manufacturing teams millions in scrap, delays, and customer complaints"**

**Replace 4 cards:**

| Icon | Title | Body |
|------|-------|------|
| ðŸ” | Root cause guessing | Engineers try Google and ChatGPT. Different answers every time. Nothing audit-ready. |
| ðŸ“‹ | 8D reports in Word templates | Quality teams spend 15-40 hours per 8D using blank templates. OEMs reject 20-30% for weak root cause analysis. |
| ðŸï¸ | Knowledge trapped in silos | Every failure is diagnosed from scratch. No institutional memory of what worked last time. |
| â±ï¸ | Reactive, not predictive | Same failures repeat across facilities. No cross-case pattern detection. No early warning system. |

**Rationale:** Old cards spoke to individual engineers. New cards speak to quality managers and leadership. 8D pain point hits hard for the $299-799/mo buyer.

---

## REPLACE Component 1.4: Solution Section â€” "How Gravix Works"

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

  âœ“ Visual AI analyzes fracture surface photos
  âœ“ TDS-aware â€” knows your product's specifications
  âœ“ Confidence backed by confirmed case outcomes
  âœ“ Guided investigation mode asks the right questions
```

**Feature Block 2: 8D Investigation Management** (NEW)

```
  [Mockup: 8D stepper UI           Complete 8D reports that
   showing D1-D8 tabs, team         OEMs actually accept
   panel, annotation tool]
                                    AI-powered root cause analysis
                                    fills D4 â€” the hardest part.
                                    Photo annotation, team comments,
                                    electronic signatures, and full
                                    audit trail for regulatory
                                    compliance.

                                    âœ“ Ford Global 8D, VDA 8D, A3, AS9100 CAPA templates
                                    âœ“ Immutable audit log for IATF 16949 / ISO 13485
                                    âœ“ Action item tracking with due date reminders
                                    âœ“ One-click PDF/DOCX report generation
```

**Feature Block 3: Self-Learning Intelligence** (updated from original)

```
  Gets smarter with                 [Visual: flywheel diagram
  every resolved case                updated to include:
                                     "Analysis" â†’ "Visual AI" â†’
  Unlike generic AI, Gravix          "TDS Match" â†’ "Feedback" â†’
  accumulates empirical data         "Knowledge Base" â†’ "Better
  from real production outcomes.     Analysis" â†’ back to start,
  Every confirmed fix improves       with "Pattern Detection"
  the next diagnosis for             branching off the center]
  everyone on the platform.

  âœ“ Backed by confirmed production outcomes
  âœ“ Confidence scores improve as data grows
  âœ“ Cross-case pattern detection spots emerging trends
  âœ“ Product performance pages built from real field data
```

**Feature Block 4: Pattern Intelligence** (NEW)

```
  [Mockup: alert card showing      Catch problems before
   "340% increase in Loctite 401    they become recalls
   failures â€” Midwest region"
   with severity badge and          Weekly AI analysis across all
   "Acknowledge" button]            cases detects statistical
                                    anomalies â€” product lot issues,
                                    seasonal patterns, geographic
                                    clusters. Get alerts before
                                    scattered incidents become
                                    systematic quality events.

                                    âœ“ Automated cross-case pattern detection
                                    âœ“ Product lot and seasonal cluster analysis
                                    âœ“ Proactive alerts to affected teams
                                    âœ“ Enterprise trend intelligence dashboard
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
  failure data â€” not just
  manufacturer claims.

  âœ“ Vendor-neutral recommendations
  âœ“ Risk warnings from field failure database
  âœ“ Surface prep instructions per substrate
  âœ“ Cross-linked to failure case library
```

**Rationale:** Spec Engine moves from position 1 to position 5. Failure Analysis leads because it's the primary conversion tool. 8D is position 2 because it's the highest-value feature for the target buyer. Pattern detection is position 4 as the enterprise differentiator.

---

## MODIFY Component 1.5: Differentiator Section

**Replace heading:** "Why Not Just Use ChatGPT?" â†’ **"Why engineering teams choose Gravix over generic AI and manual processes"**

**Replace comparison to 3-column:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Generic AI          â”‚  Manual / Templates  â”‚  Gravix                  â”‚
â”‚  (ChatGPT, etc.)     â”‚  (Word, Excel)       â”‚                          â”‚
â”‚                      â”‚                      â”‚                          â”‚
â”‚  â—‹ Different answer  â”‚  â—‹ 15-40 hrs per     â”‚  âœ“ Consistent,           â”‚
â”‚    every time        â”‚    8D report         â”‚    structured output     â”‚
â”‚                      â”‚                      â”‚                          â”‚
â”‚  â—‹ Knows textbooks   â”‚  â—‹ Zero AI-powered   â”‚  âœ“ Knows textbooks +    â”‚
â”‚    only              â”‚    root cause help   â”‚    5,000+ real cases     â”‚
â”‚                      â”‚                      â”‚                          â”‚
â”‚  â—‹ Guesses at        â”‚  â—‹ No confidence     â”‚  âœ“ Confidence calibrated â”‚
â”‚    confidence        â”‚    scoring           â”‚    by confirmed outcomes â”‚
â”‚                      â”‚                      â”‚                          â”‚
â”‚  â—‹ Chat transcript   â”‚  â—‹ Static Word doc   â”‚  âœ“ OEM-ready 8D PDF     â”‚
â”‚    output            â”‚    with no AI        â”‚    with audit trail      â”‚
â”‚                      â”‚                      â”‚                          â”‚
â”‚  â—‹ Forgets           â”‚  â—‹ Knowledge locked  â”‚  âœ“ Cross-case pattern   â”‚
â”‚    everything        â”‚    in one person's   â”‚    detection across your â”‚
â”‚                      â”‚    head              â”‚    entire organization   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- Three-column layout (not two)
- Same visual style as original but add middle column
- Middle column (Manual): `bg-brand-800`, same style as left column
- Column headers: 16px, font-semibold. Left + Middle: text-secondary. Right: text-accent-500
- Mobile: only show "Generic AI" and "Gravix" columns (hide Manual column to save space), with expandable "vs. manual processes" below

---

## MODIFY Component 1.6: How It Works â€” 3 Steps

**Replace content (keep same layout):**

```
     â‘                           â‘¡                          â‘¢
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

  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚  Free      â”‚  â”‚  Pro     â˜…      â”‚  â”‚  Quality       â”‚  â”‚  Enterprise      â”‚
  â”‚  $0        â”‚  â”‚  $79/mo         â”‚  â”‚  $299/mo       â”‚  â”‚  $799/mo         â”‚
  â”‚            â”‚  â”‚                 â”‚  â”‚                â”‚  â”‚                  â”‚
  â”‚  5/month   â”‚  â”‚  Unlimited     â”‚  â”‚  3 seats + 8D  â”‚  â”‚  10 seats + all  â”‚
  â”‚  analyses  â”‚  â”‚  analyses      â”‚  â”‚  investigationsâ”‚  â”‚  features + API  â”‚
  â”‚            â”‚  â”‚                â”‚  â”‚                â”‚  â”‚                  â”‚
  â”‚ [Start     â”‚  â”‚ [Start Pro â†’] â”‚  â”‚ [Start         â”‚  â”‚ [Contact         â”‚
  â”‚  Free]     â”‚  â”‚               â”‚  â”‚  Quality â†’]    â”‚  â”‚  Sales â†’]        â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                        [See full plan comparison â†’]
```

**Specs:**
- 4 columns, centered, max-width 1080px, gap-6
- All cards: `bg-brand-800`, rounded-xl, p-6
- Pro card: accent border + "â˜… Most Popular" badge (same as original Pro card style)
- Quality card: subtle different border color (`#8B5CF6` purple) to distinguish team tier
- Price: 36px, font-bold, JetBrains Mono
- Feature line: 14px, text-secondary, single most important differentiator per tier
- CTA: Full-width button per card. Free/Pro: primary styles. Quality: purple accent. Enterprise: ghost.
- "See full plan comparison â†’": 14px, text-accent-500, links to `/pricing`
- Mobile: 2x2 grid (not vertical stack â€” all 4 should be visible simultaneously)

---

## MODIFY Component 1.8: Final CTA Section

**Replace copy:**

```
                 Ready to stop guessing at root causes?

      Start with 5 free analyses. No credit card required.
   Quality teams: get audit-ready 8D reports in hours, not days.

                       [Start Free â†’]     [Book a Demo â†’]
```

**Changes:**
- Add second line addressing quality teams specifically
- Add secondary CTA: "Book a Demo â†’" â€” ghost button, links to Calendly or contact form (for Quality/Enterprise buyers who won't self-serve)
- "Book a Demo" only shows on desktop (mobile: single CTA to keep it clean)

---

## ADD Component 1.9: Enterprise Social Proof / Logo Bar (NEW)

Insert between Component 1.5 (Differentiator) and Component 1.6 (How It Works).

```
                    Trusted by quality teams in

    [OEM template logos or industry icons: Automotive, Aerospace,
     Medical Device, Electronics, Construction]

    "Gravix cut our 8D turnaround from 2 weeks to 3 days."
    â€” Quality Manager, Tier 1 Automotive Supplier
```

**Specs:**
- Section: py-12, `bg-brand-800/30`
- Logo row: grayscale icons/industry badges, horizontally centered, opacity-60, hover opacity-100
- Testimonial: 18px, italic, text-secondary, centered, max-width 600px
- Attribution: 14px, text-tertiary

**Note:** At launch, use industry icons (not company logos) since we won't have named customer permission. Replace with actual logos + testimonials as customers agree. If no testimonial available at launch, show only the industry icons row â€” do not fabricate quotes.

---

# 3. TOOL PAGE UPDATES

## MODIFY: Failure Analysis Form (Component 3.1)

**ADD 3 new fields** to the existing form. Insert between existing fields:

| Insert After | New # | Field | Type | Required | Notes |
|-------------|-------|-------|------|----------|-------|
| Field 2 (Adhesive Used) | 2.5 | **Product Name** | Typeahead autocomplete | No | Searches `product_specifications` table. On selection: auto-fills "Adhesive Used" chemistry. Shows: "Add your product for specification-aware analysis" helper text. If TDS available, green pill: "âœ“ TDS on file" |
| Field 11 (Additional Context) | 12 | **Defect Photos** | Multi-file upload | No | Up to 5 images. Drag-and-drop zone + click to browse. Accepts: .jpg, .jpeg, .png, .heic. Max 10MB each. Helper: "Upload fracture surface photos for visual AI analysis". Thumbnail preview after upload. Remove button per image. |
| Submit button | â€” | **Analysis Mode Toggle** | Toggle/tabs | No | Two modes above the submit button: "Standard Analysis" (default) and "Guided Investigation". See Section 9 for guided mode. Toggle is pill-style tabs, not a checkbox. |

**MODIFY submit button behavior (F19 Auth Gating):**

The submit button ("Analyze Failure â†’") now has conditional behavior:

```
IF user is authenticated AND has remaining quota:
  â†’ Submit analysis normally (existing behavior)

IF user is authenticated AND at monthly limit:
  â†’ Button shows "Monthly Limit Reached"
  â†’ Button disabled, muted style
  â†’ Below button: "Upgrade to Pro for unlimited analyses. [See Plans â†’]"

IF user is NOT authenticated:
  â†’ Button text stays "Analyze Failure â†’" (same as normal)
  â†’ On click: open Auth Modal (Component 5.1) as overlay
  â†’ Form data saved to localStorage immediately before modal opens
  â†’ After successful auth: modal closes, form auto-submits with preserved data
  â†’ User sees results within seconds of creating account
```

**ADD: Monthly Usage Counter** (free tier only)

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  3 of 5 free analyses remaining this month  [Pro â†’]  â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Position: below form header, above first field
- Only visible for Free tier users
- `bg-accent-500/10`, rounded, px-4 py-2, 13px
- "Pro â†’" link text-accent-500, links to `/pricing`
- When 0 remaining: `bg-red-500/10`, text: "Monthly limit reached. [Upgrade â†’]"

**ADD: Post-Analysis Upgrade Banner** (free tier only)

After results render (top of results panel):

```
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  âš¡ Upgrade to Pro for unlimited analyses,          â”‚
    â”‚     visual AI, and TDS-aware diagnostics. [See Plans]â”‚
    â”‚                                              [âœ•]    â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Non-blocking â€” results fully visible beneath
- `bg-accent-500/10`, border `1px solid #3B82F6/20`, rounded
- Dismissible (âœ• button). Dismissed state persisted in localStorage for session.
- Do NOT show for Pro+ users

---

## MODIFY: Failure Analysis Results (Component 3.2)

**ADD new result section** between "Root cause cards" (#2) and "Contributing factors" (#3):

**Visual Analysis Section** (only renders when photo(s) uploaded)

```
    â”Œâ”€ ðŸ“¸ Visual Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                                      â”‚
    â”‚  [Thumbnail]    Failure Mode: Adhesive               â”‚
    â”‚                 Confidence: 92%                       â”‚
    â”‚                                                      â”‚
    â”‚  Visual indicators: Clean substrate surface on       â”‚
    â”‚  ABS side, full adhesive transfer to aluminum.       â”‚
    â”‚  No cohesive tearing visible. Consistent with        â”‚
    â”‚  adhesive failure at low-surface-energy interface.   â”‚
    â”‚                                                      â”‚
    â”‚  âš ï¸ Contradiction: You selected "Cohesive" but       â”‚
    â”‚  visual analysis indicates "Adhesive" failure mode.  â”‚
    â”‚  Analysis adjusted to reflect visual classification. â”‚
    â”‚                                                      â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Card: `bg-brand-800`, border, rounded-lg, p-5
- Photo thumbnail: 80x80px, rounded, left-aligned
- "Failure Mode" label: 13px text-tertiary. Value: 16px text-white
- Contradiction warning: `bg-warning-500/10`, border-left `3px solid #F59E0B`, only shows when visual contradicts text input
- Section heading icon ðŸ“¸ in accent color

**ADD: TDS Compliance Section** (only renders when product from TDS database selected)

```
    â”Œâ”€ ðŸ“‹ Specification Compliance â€” Loctite 495 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                                       â”‚
    â”‚  âŒ Application temperature: 10Â°C (spec: 20-25Â°C)     â”‚
    â”‚  âŒ Surface preparation: None (spec: SF 770 primer)   â”‚
    â”‚  âœ… Cure time: 24 hours (spec: 24 hours at 22Â°C)     â”‚
    â”‚  âš ï¸ Humidity: 85% RH (spec: max 60% recommended)     â”‚
    â”‚                                                       â”‚
    â”‚  2 specification violations and 1 warning detected.  â”‚
    â”‚  These deviations are factored into root cause       â”‚
    â”‚  ranking above.                                       â”‚
    â”‚                                                       â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- âŒ red text for violations, âœ… green for pass, âš ï¸ amber for warnings
- "Specification Compliance" heading includes product name
- Card collapses to summary line if >5 items: "2 violations, 1 warning, 4 passes [Expand â–¾]"

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
    â”Œâ”€ âš ï¸ Known Risks â€” 3M DP420 on GFRP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                                       â”‚
    â”‚  Our field data contains 7 documented failures of    â”‚
    â”‚  3M DP420 on GFRP substrates.                        â”‚
    â”‚                                                       â”‚
    â”‚  Field failure rate: 8.2%  [ðŸŸ¡ Moderate Risk]        â”‚
    â”‚  Most common root cause: UV degradation (71%)        â”‚
    â”‚  Typical time to failure: 12-18 months outdoor       â”‚
    â”‚                                                       â”‚
    â”‚  Consider: Lord 310A/B (0% failure rate, 4 cases)   â”‚
    â”‚            Plexus MA310 (2% failure rate, 12 cases)  â”‚
    â”‚                                                       â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Risk level color: ðŸŸ¢ <2%, ðŸŸ¡ 2-10%, ðŸ”´ >10%
- Only shows when field data exists for recommended product
- "Consider" alternatives sorted by ascending failure rate

---

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

# 5. PRICING PAGE â€” FULL REPLACE

## REPLACE Component 4.2: Pricing Cards

Old: 3 cards (Free, Pro $49, Team $149). New: 4 cards with correct pricing.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Free        â”‚  â”‚  Pro         â˜…      â”‚  â”‚  Quality             â”‚  â”‚  Enterprise         â”‚
â”‚  $0          â”‚  â”‚  $79/mo             â”‚  â”‚  $299/mo             â”‚  â”‚  $799/mo            â”‚
â”‚              â”‚  â”‚                     â”‚  â”‚  3 seats included    â”‚  â”‚  10 seats included  â”‚
â”‚  For         â”‚  â”‚  For individual     â”‚  â”‚  For quality teams   â”‚  â”‚  For quality        â”‚
â”‚  evaluation  â”‚  â”‚  engineers          â”‚  â”‚  running 8D          â”‚  â”‚  departments        â”‚
â”‚              â”‚  â”‚                     â”‚  â”‚                      â”‚  â”‚                     â”‚
â”‚  âœ“ 5 failure â”‚  â”‚  âœ“ Unlimited        â”‚  â”‚  Everything in Pro,  â”‚  â”‚  Everything in      â”‚
â”‚    analyses  â”‚  â”‚    analyses         â”‚  â”‚  plus:               â”‚  â”‚  Quality, plus:     â”‚
â”‚    per month â”‚  â”‚  âœ“ Unlimited spec   â”‚  â”‚                      â”‚  â”‚                     â”‚
â”‚  âœ“ 5 spec    â”‚  â”‚    analyses         â”‚  â”‚  âœ“ 8D investigations â”‚  â”‚  âœ“ 10 seats         â”‚
â”‚    analyses  â”‚  â”‚  âœ“ Visual AI        â”‚  â”‚  âœ“ 3 seats           â”‚  â”‚    (+$49/ea extra)  â”‚
â”‚    per month â”‚  â”‚    analysis         â”‚  â”‚    (+$79/ea extra)   â”‚  â”‚  âœ“ All OEM          â”‚
â”‚  âœ“ Account   â”‚  â”‚  âœ“ TDS-aware        â”‚  â”‚  âœ“ Photo annotation  â”‚  â”‚    templates        â”‚
â”‚    required  â”‚  â”‚    diagnostics      â”‚  â”‚  âœ“ Team comments     â”‚  â”‚  âœ“ White-label      â”‚
â”‚              â”‚  â”‚  âœ“ Guided           â”‚  â”‚  âœ“ Audit log (view)  â”‚  â”‚    reports          â”‚
â”‚  â—‹ No 8D     â”‚  â”‚    investigation    â”‚  â”‚  âœ“ 1 inbound email   â”‚  â”‚  âœ“ Pattern alerts   â”‚
â”‚  â—‹ No team   â”‚  â”‚  âœ“ Full analysis    â”‚  â”‚    address           â”‚  â”‚  âœ“ Cross-vendor     â”‚
â”‚    features  â”‚  â”‚    history          â”‚  â”‚  âœ“ Email + in-app    â”‚  â”‚    comparison       â”‚
â”‚              â”‚  â”‚  âœ“ PDF export       â”‚  â”‚    notifications     â”‚  â”‚  âœ“ API access       â”‚
â”‚              â”‚  â”‚                     â”‚  â”‚  âœ“ Generic 8D +      â”‚  â”‚  âœ“ SSO / SAML       â”‚
â”‚              â”‚  â”‚  â—‹ No 8D            â”‚  â”‚    1 OEM template    â”‚  â”‚  âœ“ Dedicated        â”‚
â”‚              â”‚  â”‚  â—‹ No team features â”‚  â”‚  âœ“ 5 shareable links â”‚  â”‚    support          â”‚
â”‚              â”‚  â”‚                     â”‚  â”‚                      â”‚  â”‚                     â”‚
â”‚ [Start Free] â”‚  â”‚ [Start Pro â†’]       â”‚  â”‚ [Start Quality â†’]    â”‚  â”‚ [Contact Sales â†’]   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- 4 columns, centered, max-width 1200px, gap-6
- All cards: `bg-brand-800`, rounded-xl, p-8
- Pro card: `border 2px solid #3B82F6`, "â˜… Most Popular" badge, scale-[1.02] on desktop
- Quality card: `border 1px solid #8B5CF6` (purple accent for team tier)
- Enterprise card: `border 1px solid #1F2937` (subtle)
- Plan name: 14px, uppercase, tracking-wider, text-tertiary
- Persona line ("For individual engineers"): 13px, text-tertiary, italic, mb-4
- Price: 48px, font-bold, JetBrains Mono
- Seat info: 14px, text-secondary, visible for Quality + Enterprise only
- Feature list: 14px, gap-3. âœ“ = text-secondary with accent checkmark. â—‹ = text-tertiary with muted circle.
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
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  ðŸ’¡ One Gravix-diagnosed failure preventing a production  â”‚
    â”‚     line shutdown saves $5,000-50,000. Pro pays for       â”‚
    â”‚     itself with a single avoided incident.                â”‚
    â”‚                                                           â”‚
    â”‚     [Calculate your ROI â†’]    [Book a demo â†’]             â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- `bg-brand-800/50`, border, rounded-xl, p-8, centered
- "Calculate your ROI â†’" links to a simple calculator (future feature â€” for now, links to contact form)
- "Book a demo â†’" links to Calendly or contact form

## MODIFY Component 4.4: FAQ Accordion

**Replace/add questions:**

| Question | Answer |
|----------|--------|
| What counts as an analysis? | Each failure diagnosis, spec request, or guided investigation session counts as one analysis. Photo uploads within an analysis don't count separately. |
| Can I cancel anytime? | Yes. Cancel from Settings. You keep access until billing period ends. |
| What's the difference between Pro and Quality? | Pro is for individual engineers running failure analyses and specs. Quality adds 8D investigation management, team collaboration (3 seats), OEM report templates, audit logging, and notifications â€” everything quality departments need for IATF 16949 and ISO 13485 compliance. |
| How do extra seats work? | Quality includes 3 seats ($79/ea additional). Enterprise includes 10 seats ($49/ea additional). Each seat is a full user who can run analyses and participate in investigations. |
| Is my data secure and compliant? | All data encrypted in transit (TLS 1.3) and at rest (AES-256). Audit log is immutable and append-only. SOC 2 Type II certification planned. |
| Do you integrate with our QMS? | Enterprise plans include API access for integration with existing Quality Management Systems. Contact us for specific integration requirements. |
| What OEM report templates are available? | Generic 8D, Ford Global 8D, VDA 8D, A3 Report, and AS9100 CAPA. Quality plans get Generic + 1 OEM template. Enterprise gets all templates + custom branding. |
| Do you offer annual billing? | Coming soon with 20% discount. Contact sales for early access to annual plans. |

---

# 6. DASHBOARD UPDATES

## MODIFY Component 6.1: Dashboard Header

**Replace usage display:**

Old: `Plan: Pro â€¢ 12/unlimited analyses used`

New (conditional by plan):

```
Free:       Plan: Free  â€¢  3 of 5 analyses remaining  [Upgrade â†’]
Pro:        Plan: Pro   â€¢  47 analyses this month
Quality:    Plan: Quality  â€¢  3 seats  â€¢  12 analyses  â€¢  4 active investigations
Enterprise: Plan: Enterprise  â€¢  8 seats  â€¢  156 analyses  â€¢  23 active investigations
```

## MODIFY Component 6.2: Quick Actions

Old: 2 cards (Spec, Failure). New: 3-4 cards depending on plan.

```
Free/Pro (3 cards):
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [failure icon]   â”‚  â”‚ [spec icon]      â”‚  â”‚ [guided icon]    â”‚
â”‚ Diagnose a       â”‚  â”‚ New Material     â”‚  â”‚ Guided           â”‚
â”‚ Failure          â”‚  â”‚ Specification    â”‚  â”‚ Investigation    â”‚
â”‚ [Start â†’]        â”‚  â”‚ [Start â†’]        â”‚  â”‚ [Start â†’]        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Quality/Enterprise (4 cards):
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [failure icon] â”‚  â”‚ [8d icon]      â”‚  â”‚ [guided icon]  â”‚  â”‚ [spec icon]    â”‚
â”‚ Diagnose a     â”‚  â”‚ New 8D         â”‚  â”‚ Guided         â”‚  â”‚ New Material   â”‚
â”‚ Failure        â”‚  â”‚ Investigation  â”‚  â”‚ Investigation  â”‚  â”‚ Specification  â”‚
â”‚ [Start â†’]      â”‚  â”‚ [Start â†’]      â”‚  â”‚ [Start â†’]      â”‚  â”‚ [Start â†’]      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Links: Failure â†’ `/failure`, Investigation â†’ `/investigations/new`, Guided â†’ `/failure?mode=guided`, Spec â†’ `/tool`

## ADD Component 6.5: Investigations Summary Card (Quality+ only)

Below Recent Analyses table:

```
    Investigations                                        [View All â†’]

    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  4 open  â€¢  2 overdue actions  â€¢  1 awaiting closure      â”‚
    â”‚                                                            â”‚
    â”‚  GQ-2026-0012  Ford B-pillar disbond     Investigating  â— â”‚
    â”‚  GQ-2026-0011  Shelf life exceedance     Containment    â— â”‚
    â”‚  GQ-2026-0010  Supplier viscosity issue  Corrective     â— â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Only visible for Quality and Enterprise plans
- Status dot colors: Open=blue, Containment=amber, Investigating=purple, Corrective=green, Verification=teal, Closed=gray
- "View All â†’" links to `/investigations`

## ADD Component 6.6: Pattern Alerts Card (Enterprise only)

Below Investigations card:

```
    Pattern Alerts                                        [View All â†’]

    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  ðŸ”´ Critical: Loctite 401 failures â€” 340% increase        â”‚
    â”‚     Midwest region  â€¢  Detected Feb 12                    â”‚
    â”‚                                                            â”‚
    â”‚  ðŸŸ¡ Warning: Seasonal cure failures trending up            â”‚
    â”‚     Q4-Q1 pattern  â€¢  Detected Feb 10                     â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Only visible for Enterprise plan
- Severity badges: ðŸ”´ Critical, ðŸŸ¡ Warning, ðŸ”µ Informational
- "View All â†’" links to `/alerts`

---

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

# 8. NEW PAGE: INVESTIGATIONS

## Route: `/investigations`
**Requires auth. Quality+ plan only.** Free/Pro users see upgrade prompt.

### Layout: List + Kanban Toggle

```
    Investigations                         [List view] [Kanban view]  [+ New Investigation]

    Filters: [Status â–¾] [Severity â–¾] [Customer â–¾] [Assignee â–¾]  [Search...]

    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  GQ-2026-0012  â€¢  Critical  â€¢  Investigating                       â”‚
    â”‚  Ford B-pillar structural disbond                                   â”‚
    â”‚  Customer: Ford Motor Company  â€¢  Created: Feb 10  â€¢  Due: Feb 17  â”‚
    â”‚  Team: A. Chen (Lead), M. Rodriguez (Champion), +2                  â”‚
    â”‚  Actions: 3 open, 1 overdue                                         â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
- Drag-and-drop changes status (with validation â€” blocked transitions show error toast)

### Route: `/investigations/new`

Create form:
```
    New Investigation

    Title:              [                                          ]
    Customer:           [                                          ]
    Customer Reference: [                                          ]
    Part Number:        [                                          ]
    Severity:           [Minor â–¾ | Major | Critical]
    Report Template:    [Generic 8D â–¾ | Ford Global 8D | VDA 8D | A3 | AS9100 CAPA]

    Link to existing analysis: [Search analyses... â–¾]  (optional â€” pre-fills D2)

    [Create Investigation]
```

### Route: `/investigations/[id]`

Full investigation detail page. Complex layout:

```
    â† Back to Investigations          GQ-2026-0012  â€¢  Critical  â€¢  Investigating

    â”Œâ”€ Sidebar (240px) â”€â”€â”  â”Œâ”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                     â”‚  â”‚                                                    â”‚
    â”‚  Status:            â”‚  â”‚  [D1] [D2] [D3] [D4] [D5] [D6] [D7] [D8]        â”‚
    â”‚  â— Investigating    â”‚  â”‚   âœ“    âœ“    âœ“    â—                                â”‚
    â”‚  [Change Status â–¾]  â”‚  â”‚                                                    â”‚
    â”‚                     â”‚  â”‚  â”Œâ”€ D4: Root Cause Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
    â”‚  Team:              â”‚  â”‚  â”‚                                              â”‚  â”‚
    â”‚  ðŸ‘¤ A. Chen (Lead)  â”‚  â”‚  â”‚  [Run AI Analysis]                          â”‚  â”‚
    â”‚  ðŸ‘¤ M. Rodriguez    â”‚  â”‚  â”‚                                              â”‚  â”‚
    â”‚  ðŸ‘¤ J. Wilson       â”‚  â”‚  â”‚  5-Why Chain:                                â”‚  â”‚
    â”‚  ðŸ‘¤ S. Kim          â”‚  â”‚  â”‚  Why 1: ...                                  â”‚  â”‚
    â”‚  [+ Add Member]     â”‚  â”‚  â”‚  Why 2: ...                                  â”‚  â”‚
    â”‚                     â”‚  â”‚  â”‚  ...                                          â”‚  â”‚
    â”‚  Actions:           â”‚  â”‚  â”‚                                              â”‚  â”‚
    â”‚  3 open / 1 overdue â”‚  â”‚  â”‚  Ishikawa: [expand]                         â”‚  â”‚
    â”‚  [View Actions â†’]   â”‚  â”‚  â”‚  Escape Point: [expand]                     â”‚  â”‚
    â”‚                     â”‚  â”‚  â”‚                                              â”‚  â”‚
    â”‚  Photos:            â”‚  â”‚  â”‚  [Sign Off D4]                              â”‚  â”‚
    â”‚  ðŸ“· ðŸ“· ðŸ“· [+]       â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
    â”‚                     â”‚  â”‚                                                    â”‚
    â”‚  Audit Log [â†’]      â”‚  â”‚  â”Œâ”€ Comments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
    â”‚                     â”‚  â”‚  â”‚  [Comment input with @mention support]      â”‚  â”‚
    â”‚  Share:             â”‚  â”‚  â”‚  ...thread...                                â”‚  â”‚
    â”‚  [Generate Link]    â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
    â”‚                     â”‚  â”‚                                                    â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- Sidebar: fixed 240px, `bg-brand-900`, border-right, scrollable independently
- Stepper tabs: horizontal, 8 tabs (D1-D8). Active: accent underline. Completed: green checkmark. Incomplete: gray circle.
- Main content: scrollable, renders content for selected discipline
- Comments panel: collapsible, below main content, shows discipline-specific thread
- Mobile: sidebar becomes horizontal summary bar at top, stepper becomes horizontal scroll or select dropdown

**This is the most complex page in the app.** Agent should build it incrementally: skeleton â†’ stepper â†’ D2 form â†’ D4 AI integration â†’ comments â†’ photos â†’ audit log.

---

# 9. NEW PAGE: GUIDED INVESTIGATION

## Route: `/failure?mode=guided`
Not a separate page â€” same `/failure` route with mode toggle.

### When "Guided Investigation" tab is selected:

Replace the standard form + results layout with a chat-style interface:

```
    â”Œâ”€ Guided Investigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                                                 â”‚
    â”‚  â”Œâ”€ AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
    â”‚  â”‚ I'll help you diagnose this adhesive failure step by      â”‚ â”‚
    â”‚  â”‚ step. Start by describing what happened â€” what failed,    â”‚ â”‚
    â”‚  â”‚ when, and what it looked like.                            â”‚ â”‚
    â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
    â”‚                                                                 â”‚
    â”‚  â”Œâ”€ You â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
    â”‚  â”‚ Our cyanoacrylate bond failed after about 6 months       â”‚ â”‚
    â”‚  â”‚ outdoors at our coastal Florida facility.                 â”‚ â”‚
    â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
    â”‚                                                                 â”‚
    â”‚  â”Œâ”€ AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
    â”‚  â”‚ ðŸ” Searching similar cases...                             â”‚ â”‚
    â”‚  â”‚                                                           â”‚ â”‚
    â”‚  â”‚ Coastal Florida â€” high humidity is a known risk factor    â”‚ â”‚
    â”‚  â”‚ for cyanoacrylate bonds. A few targeted questions:       â”‚ â”‚
    â”‚  â”‚                                                           â”‚ â”‚
    â”‚  â”‚ What surface preparation did you use?                    â”‚ â”‚
    â”‚  â”‚  [IPA Wipe] [Abrasion] [Plasma] [Primer] [None]         â”‚ â”‚
    â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
    â”‚                                                                 â”‚
    â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ðŸ“Ž] [Send â†’] â”‚ â”‚
    â”‚  â”‚ Type your answer or click a suggestion...                 â”‚ â”‚
    â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
    â”‚                                                                 â”‚
    â”‚  Session: Turn 3 of 10 (Free tier)    [Pause & Save]          â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- Chat bubbles: AI messages left-aligned with `bg-brand-800`, user messages right-aligned with `bg-accent-500/20`
- Tool call indicators: "ðŸ” Searching similar cases..." in italic, `text-tertiary`, with subtle pulse animation
- Quick-reply buttons: pill-style, `bg-brand-700 hover:bg-brand-600`, clicking sends as reply
- Photo upload: ðŸ“Ž icon in input bar, opens file picker
- Input: auto-growing textarea, max 4 rows, full width, Send button right-aligned
- Turn counter: bottom bar, 13px, `text-tertiary`. Shows `Turn X of Y` for free tier. Hidden for Pro+.
- "Pause & Save": ghost button, saves session to DB, returns to dashboard
- On session completion: full-width results card renders in chat (same sections as standard analysis results), plus "Open 8D Investigation" button (Quality+ only)

---

# 10. NEW PAGE: PRODUCT CATALOG & PERFORMANCE PAGES

## Route: `/products` (public, no auth)

```
    Adhesive Product Database                    [Search products...]

    Filters: [Chemistry â–¾] [Manufacturer â–¾] [Application â–¾]

    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Loctite 495            â”‚  â”‚  3M DP460               â”‚  â”‚  Loctite 401            â”‚
    â”‚  Henkel â€¢ Cyanoacrylate â”‚  â”‚  3M â€¢ Epoxy (2-part)    â”‚  â”‚  Henkel â€¢ Cyanoacrylate â”‚
    â”‚                         â”‚  â”‚                         â”‚  â”‚                         â”‚
    â”‚  ðŸ“Š 142 applications    â”‚  â”‚  ðŸ“Š 89 applications     â”‚  â”‚  ðŸ“Š 67 applications     â”‚
    â”‚  Field failure: 4.2%    â”‚  â”‚  Field failure: 2.1%    â”‚  â”‚  Field failure: 6.8%    â”‚
    â”‚  Top failure: Humidity  â”‚  â”‚  Top failure: Cure temp â”‚  â”‚  Top failure: Humidity  â”‚
    â”‚                         â”‚  â”‚                         â”‚  â”‚                         â”‚
    â”‚  [View Performance â†’]   â”‚  â”‚  [View Performance â†’]   â”‚  â”‚  [View Performance â†’]   â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Cards: `bg-brand-800`, border, rounded-lg, p-5
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Sorted by total applications (descending) by default
- "ðŸ“Š" = monospace stat numbers
- Only products with â‰¥10 documented applications shown

## Route: `/products/[manufacturer]/[slug]` (public, no auth)

Full performance page:

```
    â† All Products

    Loctite 495 â€” Henkel
    Cyanoacrylate (Ethyl)

    â”Œâ”€ Key Specifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Viscosity: 20-50 cP  â€¢  Fixture: 5-20s  â€¢  Cure: 24h@22Â°C â”‚
    â”‚  Shear: 17-24 MPa (steel)  â€¢  Temp: -54Â°C to 82Â°C          â”‚
    â”‚  Source: Manufacturer TDS  âœ“ Verified                        â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

    â”Œâ”€ Field Performance (Gravix Data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                                                               â”‚
    â”‚  Total documented applications: 142                          â”‚
    â”‚  Field failure rate: 4.2%                                    â”‚
    â”‚                                                               â”‚
    â”‚  Top Failure Modes:            Top Root Causes:               â”‚
    â”‚  1. Adhesive (68%)             1. Moisture degradation (41%) â”‚
    â”‚  2. Cohesive (22%)             2. Surface prep (29%)         â”‚
    â”‚  3. Mixed (10%)                3. Incorrect substrate (18%)  â”‚
    â”‚                                                               â”‚
    â”‚  Common Application Errors:                                  â”‚
    â”‚  â€¢ Applied below minimum temperature (15% of failures)       â”‚
    â”‚  â€¢ No primer on low-surface-energy substrates (23%)          â”‚
    â”‚  â€¢ Exceeded fixture time before clamping (12%)               â”‚
    â”‚                                                               â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

    â”Œâ”€ CTAs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Using Loctite 495 in production?                            â”‚
    â”‚  [Get AI Failure Analysis â†’]     [Generate Specification â†’]  â”‚
    â”‚                                                               â”‚
    â”‚  Experiencing a failure with this product?                   â”‚
    â”‚  [Start Diagnosis with Product Pre-Selected â†’]               â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- All data anonymized â€” no company or facility names
- CTA links: pre-select product in failure/spec form via query param `?product=loctite-495`
- SEO: SSR or ISR. Title tag: "Loctite 495 Field Performance & Failure Analysis | Gravix". Schema.org Product markup.

---

# 11. NEW PAGE: PATTERN ALERTS

## Route: `/alerts`
**Requires auth. Enterprise plan only.**

```
    Pattern Alerts                              [All â–¾] [Critical â–¾] [Date â–¾]

    â”Œâ”€ ðŸ”´ Critical â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Loctite 401 Failure Spike â€” Midwest Region                         â”‚
    â”‚  Detected: Feb 12, 2026  â€¢  15 failures in 8 weeks (340% above avg) â”‚
    â”‚                                                                      â”‚
    â”‚  Hypothesis: Potential formulation change in Lot #H2026-Q3-batch7.  â”‚
    â”‚  Affected organizations: 3  â€¢  Geographic cluster: OH, MI           â”‚
    â”‚                                                                      â”‚
    â”‚  Recommended: Contact Henkel regarding lot consistency.              â”‚
    â”‚  Quarantine remaining stock from this lot.                          â”‚
    â”‚                                                                      â”‚
    â”‚  [Acknowledge]  [View Affected Cases â†’]                             â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

    â”Œâ”€ ðŸŸ¡ Warning â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  Seasonal Cure Failure Pattern                                       â”‚
    â”‚  Detected: Feb 10, 2026  â€¢  Epoxy cure failures up 180% in Q4-Q1   â”‚
    â”‚  ...                                                                 â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
    â”Œâ”€ Notifications (3 unread) â”€â”€â”€â”€â”€â”€â”€â”€ [Mark all read] â”€â”€â”
    â”‚                                                       â”‚
    â”‚  â— Alex Chen mentioned you in GQ-2026-0012 D4        â”‚
    â”‚    2 hours ago                                        â”‚
    â”‚                                                       â”‚
    â”‚  â— Action assigned: Quarantine batch B-2026-0205     â”‚
    â”‚    Due: Feb 15  â€¢  5 hours ago                        â”‚
    â”‚                                                       â”‚
    â”‚  â— GQ-2026-0012 status: Open â†’ Containment           â”‚
    â”‚    Yesterday                                          â”‚
    â”‚                                                       â”‚
    â”‚  â—‹ Pattern Alert: Loctite 401 spike                  â”‚
    â”‚    2 days ago                                         â”‚
    â”‚                                                       â”‚
    â”‚  [View all notifications â†’]                           â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Dropdown: max 400px wide, max 5 items, scrollable
- â— = unread (accent dot), â—‹ = read
- Each item clickable â†’ navigates to relevant page (investigation, action, alert)
- "View all notifications â†’" links to full page view with filters

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
Phase 1: Pricing & Auth Gating (ship first â€” affects conversion immediately)
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

Phase 4: New Pages â€” Products & Guided
  19. Product catalog page (/products)
  20. Product performance page (/products/[mfr]/[slug])
  21. Guided investigation chat UI
  22. Guided â†’ standard results rendering

Phase 5: New Pages â€” Investigations
  23. Investigations list (/investigations) with Kanban
  24. Investigation create form
  25. Investigation detail â€” skeleton + stepper
  26. Investigation detail â€” D1-D8 content forms
  27. Investigation detail â€” AI analysis (D4)
  28. Investigation detail â€” comments panel
  29. Investigation detail â€” photo gallery + annotation
  30. Investigation detail â€” audit log viewer
  31. Investigation detail â€” signatures
  32. Report generation (PDF download)

Phase 6: Notifications & Alerts
  33. Notification bell + dropdown
  34. Notification full page
  35. Notification preferences in Settings
  36. Pattern alerts page (/alerts)

Phase 7: Settings & Polish
  37. Settings â€” subscription with seat management
  38. Settings â€” notification preferences
  39. Settings â€” org branding (Enterprise)
  40. Dashboard â€” investigations card
  41. Dashboard â€” alerts card
```

---

## PAGES THAT STILL DO NOT EXIST

Everything from the original "do not build" list remains true. Additionally:

- `/blog` â€” still not needed. Product pages provide SEO content.
- `/about` â€” still not needed.
- `/admin/*` â€” already built per V2 spec. Not part of this addendum.
- `/contact` â€” `mailto:` in footer is sufficient. "Book a Demo" links to Calendly.

---

**END OF FRONTEND UPDATE ADDENDUM**

---

