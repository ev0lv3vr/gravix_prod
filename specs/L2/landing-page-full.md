# Landing Page & Pricing — L2 Full Detail

> Combined from gravix-final-prd.md:
> - Part V-A, PAGE 1 (Landing Page) + PAGE 4 (Pricing)
> - Part V-B, Section 2 (Landing Page Updates) + Section 5 (Pricing Full Replace)
>
> **Rule:** Where V-B says REPLACE, the V-B version is authoritative.

---

## BASE SPECIFICATION

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

-e 
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

-e 
---

## ADDENDUM UPDATES (Supersede base where noted)

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

