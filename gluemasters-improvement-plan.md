# Gluemasters.com — Improvement Plan
## Feb 12, 2026

---

## Design System (Reference for all work)

```
PALETTE
  Navy:        #1a1a2e     (headings, hero, dark sections)
  Gold:        #c9a84c     (primary CTA, badges, premium accents)
  Blue:        #0076de     (links only — NOT buttons)
  Text-Dark:   #222        (headings)
  Text-Body:   #444        (body copy)
  Text-Muted:  #777        (secondary, captions)
  BG-Main:     #ffffff
  BG-Warm:     #f8f7f4     (section alternation)
  BG-Dark:     #1a1a2e     (hero, social proof, CTA bands)
  Border:      #e5e5e5
  Success:     #2d6a4f  on #d4edda
  Warning:     #856404  on #fff3cd
  Error:       #721c24  on #ffe5e5

TYPOGRAPHY
  Font:        Libre Franklin (inherit from theme — zero overrides)
  H1:          2.5em / 700
  H2:          2em / 700
  H3:          1.5em / 700
  H4:          1.2em / 700
  Body:        1em (16px) / 400
  Small:       0.875em / 400
  Line-height: 1.6 body, 1.2 headings

SPACING
  Section gap: 64px
  Card pad:    24px
  Grid gap:    16px
  
RADIUS
  Cards:       8px
  Buttons:     6px
  Badges/pills: 20px

SHADOW
  Card:        0 1px 3px rgba(0,0,0,0.08)
  None on flat content blocks
```

---

## Phase 1: Standardize Existing Pages (I can do 100% via API)

**Goal:** Every page looks like the same brand built it.
**Effort:** ~2 hours automated  
**Impact:** HIGH — eliminates the "3 different designers" feel

### 1A. Color normalization across all 15+ content pages
- Replace all `#0d1117`, `#1f2328` → `#222` (heading text)
- Replace all `#656d76`, `#555`, `#666` → `#444` (body text)  
- Replace all `#e74c3c`, `#E91E8C`, `#FF9800` → context-appropriate brand colors
- Replace all `#2196F3`, `#4CAF50` Material colors → `#0076de` or `#c9a84c`
- Replace all `#28a745` → `#2d6a4f` (success green)
- Standardize backgrounds: `#f6f8fa`, `#fafbfc`, `#f5f5f5`, `#f8f8f8` → `#f8f7f4`
- Kill `#e91e8c` (hot pink) entirely

### 1B. Typography normalization
- Remove ALL `font-family:` declarations from page HTML
- Normalize font sizes to the scale (em-based, no px)
- Standardize heading sizes per level

### 1C. Spacing & radius normalization
- Cards → `border-radius: 8px` everywhere
- Buttons → `border-radius: 6px`
- Card padding → `24px`
- Section vertical spacing → `64px` (via padding on section wrappers)

### 1D. Kill the duplicate page
- Redirect `/pages/ca-glue-for-models-and-rc` → `/pages/ca-glue-for-crafts-models-rc`
- Or delete the old one and set up a Shopify URL redirect

---

## Phase 2: Theme-Level Brand Alignment (needs theme file edits)

**Goal:** Product pages, collections, cart, and checkout match the brand.
**Effort:** ~3-4 hours  
**Impact:** HIGH — this is where money converts

### 2A. Theme color settings update
- `color_button_background`: `#0076de` → `#c9a84c` (gold CTA)
- `color_button_text`: keep `#ffffff`
- `color_headings`: `#000000` → `#1a1a2e`
- `color_links`: `#052f98` → `#0076de`
- `checkout_accent_color` / `checkout_button_color`: `#197bbd` → `#c9a84c`
- `color_footer_background`: `#edeff3` → `#1a1a2e` (dark footer, matches brand)
- `color_footer_text`: → `#ffffff`

### 2B. Product page template enhancement
Create a custom product template (or enrich the existing one):
- **Viscosity badge** at top (color-coded: gold/blue/green/red per viscosity)
- **"Best for" tags** below title (Woodworking, Coral Fragging, etc.)
- **Key specs strip**: Viscosity | Cure Time | Gap Fill | Shelf Life
- **Cross-sell block**: "Pair with CA Accelerator for instant cure"
- **"Need a different viscosity?"** link strip to sibling products
- **Shipping promise**: "Ships from Chicago in 1-2 business days"
- Opinew reviews rendering properly below description

### 2C. Collection page fix
- Debug why `/collections/16-ounce-bottle-variable-viscosity` renders empty
- Likely a template assignment issue — check if collection template is set

### 2D. Cart page enhancements
- "Add 1 more bottle for FREE SHIPPING" progress bar when close to $74.99
- "Frequently bought together" section (e.g., Accelerator with any glue)
- Remove any default cart upsell that isn't relevant

---

## Phase 3: Revenue-Driving Features (content + Shopify config)

**Goal:** Increase AOV and conversion rate.
**Effort:** ~4-6 hours  
**Impact:** MEDIUM-HIGH

### 3A. Bundle products
Create Shopify bundles:
- **Woodworker's Kit**: Thin 16oz + Medium 16oz + Accelerator → 10% off
- **Starter Pack**: Medium 2oz + Thick 2oz → $24.99 (vs $27.98 separate)
- **Reef Kit**: Ultra Thin 16oz + Thick 16oz → 10% off
- **Production Trial 3-Pack**: Thin + Medium + Thick 8oz → $79.99

### 3B. Reviews activation
- Diagnose Opinew integration — 1,183 reviews exist but aren't displaying
- Get reviews showing on product pages and the reviews page
- Add review snippets to product cards in collections

### 3C. Urgency & trust signals on product pages
- "In Stock — Ships from Chicago" badge
- "X ordered this week" (if Shopify supports)
- "100% Money-Back Guarantee" badge near Add to Cart

### 3D. Free shipping progress bar
- Sitewide cart drawer or announcement showing distance to $74.99 threshold
- "You're $XX away from free shipping!"

---

## Phase 4: SEO & Performance Polish

**Goal:** Clean up technical debt and capture search traffic.
**Effort:** ~2-3 hours  
**Impact:** MEDIUM (compounds over time)

### 4A. Fix metadata inconsistencies
- Contact page: wrong zip code (72744 = Arkansas, not Seattle)
- About Us page: stale (2022), redirect to Our Story
- Refund policy: still links to gravixadhesives.com (manual fix in Shopify admin)

### 4B. Structured data
- Product schema markup (already in Empire, verify it's correct)
- FAQ schema on FAQ page (Google rich results)
- Review aggregate schema

### 4C. Blog refresh
- 7 blog posts, all from 2023 — stale
- SEO-rich topics: "Best CA Glue for Pen Turning 2026", "CA Glue vs Epoxy: When to Use Which", "How to Prevent CA Glue Blooming"
- Each blog links to relevant product + use-case page

### 4D. Page speed
- Audit image sizes (CDN images may be unoptimized)
- Custom liquid sections are inline HTML — consider moving heavy styles to a CSS file
- Lazy load below-fold sections

---

## Execution Summary

| Phase | What | Effort | Can I Do It? | Impact |
|-------|------|--------|-------------|--------|
| **1A** | Color normalization (all pages) | 1 hr | ✅ API | High |
| **1B** | Typography normalization | 1 hr | ✅ API | High |
| **1C** | Spacing/radius normalization | 30 min | ✅ API | Medium |
| **1D** | Kill duplicate page | 5 min | ✅ API | Low |
| **2A** | Theme color settings | 15 min | ✅ API | High |
| **2B** | Product page template | 3-4 hrs | ✅ Theme API | Very High |
| **2C** | Fix empty collections | 30 min | ✅ API | High |
| **2D** | Cart enhancements | 2 hrs | ⚠️ Theme edit | Medium |
| **3A** | Bundle products | 1-2 hrs | ✅ API | High |
| **3B** | Reviews activation | 1 hr | ⚠️ Opinew dashboard | Very High |
| **3C** | Trust signals | 1 hr | ✅ Theme API | Medium |
| **3D** | Shipping progress bar | 1-2 hrs | ⚠️ Theme edit | Medium |
| **4A** | Metadata fixes | 30 min | Partial | Low |
| **4B** | Structured data | 1 hr | ✅ Theme API | Medium |
| **4C** | Blog content | 4-6 hrs | ✅ API | Medium |
| **4D** | Page speed | 2 hrs | ⚠️ Audit first | Medium |

**Total estimated effort: ~20-25 hours across all phases.**

Phase 1 can start immediately — it's all API-driven, no manual intervention needed.

---

## What I Need From You

- **Phase 1:** Nothing — I can run it all.
- **Phase 2A:** Approval to change theme settings (buttons go gold, footer goes dark).
- **Phase 2B:** Approval for product page redesign approach.
- **Phase 2C:** Nothing — I'll debug.
- **Phase 3B:** Opinew dashboard access or credentials to check why reviews aren't showing.
- **Phase 4A:** You fix the refund policy link in Shopify Admin → Settings → Policies (I don't have `write_legal_policies` scope).
