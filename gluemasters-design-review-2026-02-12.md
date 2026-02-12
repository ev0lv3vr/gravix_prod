# Gluemasters.com — Design Review
## Honest Assessment · Feb 12, 2026

---

## The Good News First

The site has genuinely strong bones. The B2B page is best-in-class. The use-case landing pages have real depth. The new hero is clean. The viscosity guide is excellent conversion content. You're ahead of every CA glue competitor online.

But there are real design problems that make the site feel like two different companies built it. Here's the honest breakdown.

---

## 🔴 Problem 1: Two Design Languages Fighting Each Other

**The theme (Empire)** uses:
- Fonts: Libre Franklin (body) + Arimo (headings) — clean, neutral
- Colors: `#0076de` blue buttons, `#000` headings, white backgrounds
- Style: Minimal, corporate, restrained

**The custom pages** use:
- Fonts: 7 different font-family declarations (Helvetica Neue, system stacks, etc.)
- Colors: A totally different palette — `#1a1a2e` navy, `#c9a84c` gold, `#0076de` blue, `#e74c3c` red, `#27ae60` green, `#2196F3` Material blue, `#E91E8C` hot pink, `#4CAF50` Material green
- Style: Rich, editorial, lots of gradients and shadows

**The result:** When you navigate from the homepage (premium, dark, gold accents) to a product page (basic Empire theme with `#0076de` blue buttons), it feels like you left the site. The custom pages feel 2025; the theme feels 2019.

### What to fix:
- Lock in ONE palette and apply it everywhere
- Stop introducing new accent colors per page
- The product pages need to match the new brand feel

---

## 🔴 Problem 2: Color Chaos (17+ Accent Colors)

Current accent colors across the site:

| Color | Hex | Where Used |
|-------|-----|-----------|
| Empire Blue | `#0076de` | Theme buttons, 164 uses across pages, borders |
| Navy | `#1a1a2e` | Hero, headings (220 uses) |
| Gold | `#c9a84c` | Hero badge, viscosity guide, Medium badge |
| GitHub Dark | `#0d1117` | FAQ page (44 uses) |
| Material Blue | `#2196F3` | FAQ, Use Cases |
| Green | `#27ae60` | Viscosity selector "Most Popular" |
| Red | `#d32f2f` | Viscosity selector "Best Seller" |
| Coral Red | `#e74c3c` | Models/RC page (17 uses) |
| Hot Pink | `#E91E8C` | Use Cases page buttons |
| Material Green | `#4CAF50` | Use Cases page buttons |
| Teal | `#046e82` | Homepage Shop by Size prices |
| Bootstrap Green | `#28a745` | Technical Resources |
| Orange | `#FF9800` | Use Cases |
| Dark Blue link | `#052f98` | Theme link color |
| Checkout Blue | `#197bbd` | Checkout |

That's at least **6 different blues**, **3 greens**, **3 reds**, and random hot pink.

### What the palette SHOULD be:
- **Primary:** `#1a1a2e` (navy) — headings, hero, authority
- **Accent:** `#c9a84c` (gold) — CTAs, badges, premium feel
- **Secondary:** ONE blue — pick `#0076de` or drop it
- **Text:** `#333` body, `#666` secondary, `#999` muted
- **Success/Warning/Error:** Keep semantic colors but standardize
- **Kill everything else.** No hot pink. No Material Design colors. No GitHub palette.

---

## 🔴 Problem 3: Typography Inconsistency

**Font sizes used:** 14px, 0.95em, 1.3em, 13px, 18px, 15px, 2.2em, 1.6em, 1.2em, 1.1em, 12px, 20px, 30px, 17px, 16px...

That's **px AND em mixed together** with no scale. The pages mix absolute (14px, 18px) with relative (0.95em, 1.3em) sizing randomly. Some pages use 14px for body text, others 0.95em, others 15px. Headlines range from 1.3em to 3em with no consistent hierarchy.

**Font families:** 7 different declarations. The theme uses Libre Franklin. Pages use Helvetica Neue, system stacks, or nothing.

### What to fix:
- One type scale: 14/16/18/24/32/48px (or em equivalents)
- Remove ALL font-family overrides from custom pages — let the theme fonts handle it
- H1 = 2.5em, H2 = 2em, H3 = 1.5em, body = 1em — consistently

---

## 🟡 Problem 4: The Product Pages Don't Match

This is where revenue happens and they're completely untouched. The product page is stock Empire theme:
- White background
- Basic title + price + description + Add to Cart
- No viscosity badges, no "Best for" tags, no comparison
- No cross-sell ("Pair with Accelerator")
- The Opinew review stars block is there but likely not rendering reviews
- "You may also like" recommendations at the bottom — generic

A customer goes from the beautiful homepage → viscosity selector → clicks "Shop Thick" → lands on a barren product page with a wall of text description and a basic Add to Cart button. The conversion chain breaks here.

### What to fix:
- Add product metafields for viscosity, best-for, cure time
- Build a custom product template (or at minimum, structured descriptions)
- Add "Pair with Accelerator" cross-sell
- Make the "Add to Cart" button use the brand gold, not Empire blue
- Show related viscosities ("Need thinner? Try 100 CPS")

---

## 🟡 Problem 5: Spacing and Container Inconsistency

- Some pages use `max-width: 1200px`, others have no max-width
- Padding varies: 20px, 25px, 30px, 35px, 40px — all used on the same types of content blocks
- Border radius: `4px`, `5px`, `6px`, `8px`, `12px`, `20px` — six different values for card corners
- Some cards have `box-shadow`, others don't, for the same type of content

The visual rhythm is off. Things don't "breathe" consistently.

### What to fix:
- Standardize: `border-radius: 8px` for cards, `4px` for buttons/badges
- Padding: `24px` for card content, `48px` for section spacing
- One shadow: `0 2px 8px rgba(0,0,0,0.08)` or none

---

## 🟡 Problem 6: The "Scale Models & RC" Page Is a Different Design

`ca-glue-for-models-and-rc` uses a completely different design system than the other 5 use-case pages:
- Different color scheme (`#e74c3c` red primary vs `#0076de` blue)
- Different layout patterns
- Different heading sizes
- Was clearly built separately

There's also `ca-glue-for-crafts-models-rc` which covers similar content with the correct design. The old one should probably redirect to the new one.

---

## 🟢 Problem 7: The Homepage Flow Is Actually Good Now

After today's changes, the homepage narrative is strong:
1. **Hero** — who you are, what you sell, why you're credible
2. **Use Cases** — what's your project?
3. **Viscosity** — which product do you need?
4. **Products** — here they are
5. **Shop by Size** — lower the barrier to entry
6. **Social Proof** — why trust us
7. **B2B** — business buyers
8. **Community** — Reef2Reef

This is a solid conversion funnel. The issue is visual consistency, not narrative structure.

---

## Conversion-Specific Issues

1. **Add to Cart button** is `#0076de` (theme default blue) — should be gold `#c9a84c` or high-contrast CTA color. Blue blends in with link text.

2. **No urgency signals** — no "In Stock" prominence, no shipping speed ("Ships from Chicago in 1-2 days"), no "X sold this week"

3. **Free shipping threshold** ($74.99) isn't used as a conversion tool on product pages. Should show "Add 1 more for free shipping!" when cart is close.

4. **No bundle or multi-buy** — the most common order is probably 1 bottle. A "Buy 2, Save 10%" or "Woodworker's Kit (Thin + Medium + Accelerator)" would boost AOV significantly.

5. **Cart page is empty** — no upsells, no "Frequently bought together"

---

## Recommended Design System

If I were standardizing the whole site:

```
COLORS
  Primary:     #1a1a2e (navy)
  Accent:      #c9a84c (gold)  
  CTA:         #c9a84c (gold buttons on dark) / #1a1a2e (dark buttons on light)
  Text:        #222 (headings) / #444 (body) / #777 (muted)
  Backgrounds: #fff (main) / #f8f7f4 (warm gray sections) / #1a1a2e (dark sections)
  Borders:     #e5e5e5
  Success:     #2d6a4f
  Warning:     #856404
  Error:       #721c24

TYPOGRAPHY  
  Font:        Libre Franklin (theme default — don't override)
  Scale:       16px base / 20 / 24 / 32 / 48
  Weights:     400 (body) / 600 (emphasis) / 700 (headings)

SPACING
  Section:     64px vertical
  Card:        24px padding
  Gap:         16px (grid gap)

RADIUS
  Cards:       8px
  Buttons:     6px
  Badges:      4px or 20px (pill)

SHADOW
  Cards:       0 1px 3px rgba(0,0,0,0.08)
  Elevated:    0 4px 12px rgba(0,0,0,0.1)
```

---

## Priority Order

1. **Fix product page experience** — this is where money converts
2. **Standardize colors to the palette above** — one pass across all pages
3. **Remove font-family overrides** — let theme fonts work
4. **Match theme buttons/links to brand** — gold CTA, navy secondary
5. **Redirect old Models/RC page** to the crafts one
6. **Add bundles/cross-sells** — AOV boost

---

*Bottom line: The content is genuinely good. The strategy is right. The design just needs discipline — one palette, one type scale, one spacing rhythm, applied everywhere. Right now it looks like 3 designers worked on it in 3 different weeks. Tighten it up and this site converts.*
