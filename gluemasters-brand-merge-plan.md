# Gluemasters — Brand Assets + Website Merge Plan

## Formascope Brand System (What's On The Bottles)

### Color Coding System (Per Viscosity)
| Viscosity | CPS | Label Color | Approximate Hex |
|-----------|-----|-------------|-----------------|
| Ultra Thin | 05 | Cyan/Light Blue | ~#00B4D8 |
| Thin | 100 | Royal/Cobalt Blue | ~#2B5CAB |
| Medium | 700 | Green | ~#4CAF50 |
| Thick | 1500 | Magenta/Hot Pink | ~#E91E76 |

### Brand Fonts (from Formascope package)
- **Intensa Bold Condensed** — the GLUEMASTERS™ wordmark font (bold condensed italic)
- **Intensa Speed** — likely for tagline "MASTER YOUR CRAFT"  
- **Brandon Grotesque** (Black, Bold, Regular) — body/UI font
- **TT Norms Regular** — secondary/utility font

### Logo
- Pure black wordmark on white (or reversed)
- Bold condensed italic sans-serif
- Tagline: "MASTER YOUR CRAFT"
- Clean, industrial, no-nonsense
- Two variants: wordmark only (logo_1) and wordmark + tagline (logo_2)

### Label Design Language
- White bottle, white cap
- Color-coded banner bands (top + bottom of label)
- Black triangular/arrow center section with viscosity name
- Bold typography hierarchy: Brand → Viscosity Name → CPS → Description
- Industrial aesthetic, clean, professional

### 3D Renders Available
- All 4 viscosities × 3 sizes (2oz, 8oz, 16oz) — front and back
- Accelerator and Debonder
- High resolution (3018×3840px)
- Professional quality, transparent backgrounds on PNGs

### Amazon/Media Kit Assets
- "From the Manufacturer" banners (multiple sizes)
- Product main images (2000×2000)
- Poster designs
- Business card template
- Social media template

---

## Current Website vs Brand Assets — Gap Analysis

### What MATCHES:
- ✅ Logo is used correctly in header
- ✅ Product images on Shopify are from the Formascope 3D renders
- ✅ "MASTER YOUR CRAFT" tagline referenced (newsletter section)

### What CONFLICTS:

| Element | Brand Assets | Website Currently | Problem |
|---------|-------------|-------------------|---------|
| **Primary font** | Brandon Grotesque | Libre Franklin (theme) + 7 random system stacks | Completely different typeface |
| **Viscosity color: Thick** | Magenta #E91E76 | Red #d32f2f | Different shade, wrong family |
| **Viscosity color: Medium** | Green #4CAF50 | Green #27ae60 | Close but not matching |
| **Viscosity color: Thin** | Blue #2B5CAB | Blue #4a90e2 | Different blue |
| **Viscosity color: Ultra Thin** | Cyan #00B4D8 | Gold #c9a84c | Completely wrong |
| **CTA/Button color** | No brand CTA defined (labels use viscosity colors) | Gold #c9a84c (new) / Blue #0076de (theme) | Neither matches bottles |
| **Body font** | TT Norms / Brandon Grotesque | Libre Franklin | Mismatch |
| **Brand personality** | Industrial, bold, italic, dynamic | Mixed — some pages corporate, some editorial | Inconsistent |

### The Core Disconnect:
The bottles scream **bold, italic, industrial** (Intensa font, strong color-coding, dynamic angle). The website is **static, corporate, neutral** (Libre Franklin, muted palettes, no energy). They don't feel like the same brand.

---

## Merged Design System — Proposed

### Colors
```
BRAND NAVY:       #1a1a2e   (hero, dark sections, authority — keeps the premium feel we built)
BRAND WHITE:      #ffffff   (primary backgrounds)
WARM GRAY:        #f8f7f4   (section alternation)

VISCOSITY COLORS (match the actual bottles):
  Ultra Thin:     #00B4D8   (cyan)
  Thin:           #2B5CAB   (royal blue)
  Medium:         #4CAF50   (green)  
  Thick:          #E91E76   (magenta)

CTA PRIMARY:      #E91E76   (magenta — the best-seller color, high contrast, action-oriented)
CTA SECONDARY:    #1a1a2e   (navy — for secondary actions)
LINK:             #2B5CAB   (matches Thin label, works as link blue)

TEXT:
  Headings:       #1a1a2e
  Body:           #333
  Muted:          #777

SEMANTIC:
  Success:        #2d6a4f on #d4edda
  Warning:        #856404 on #fff3cd  
  Error:          #721c24 on #ffe5e5
```

### Why Magenta (#E91E76) for CTA:
- It's your **best-selling product's color** (Thick)
- It has the **highest contrast** against white and dark backgrounds
- It's distinctive — no other CA glue brand uses it
- It creates **instant recognition** between the bottle and the website
- Gold was nice but had no connection to the physical product

### Typography
```
HEADINGS:   Brandon Grotesque Bold (or Black) — matches the bottle brand font
            Fallback: system bold sans-serif
            
BODY:       TT Norms Regular (or Brandon Grotesque Regular)
            Fallback: Libre Franklin (current theme font — close enough)

LOGO FONT:  Intensa Bold Condensed Italic (for display/hero use only)
```

**Font loading:** Upload Brandon Grotesque + TT Norms to Shopify theme assets as WOFF2. 
If performance is a concern: keep Libre Franklin for body, use Brandon Grotesque for headings only.

### Viscosity Badge System (for website use)
```html
<!-- Example: on product pages, collections, homepage -->
<span class="viscosity-badge viscosity-thick">THICK · 1500 CPS</span>
<span class="viscosity-badge viscosity-medium">MEDIUM · 700 CPS</span>
<span class="viscosity-badge viscosity-thin">THIN · 100 CPS</span>
<span class="viscosity-badge viscosity-ultra-thin">ULTRA THIN · 05 CPS</span>
```
Colors match the actual bottle labels exactly.

### Design Principles (from the bottles)
1. **Bold and dynamic** — italic angles, heavy weights, forward energy
2. **Color = product** — viscosity colors ARE the brand palette
3. **Industrial confidence** — no decorative fluff, strong typography
4. **White space** — the bottles are clean, the website should be too
5. **Consistent coding** — if it's green on the bottle, it's green on the screen

---

## Updated Improvement Plan

### Phase 0: Upload Brand Fonts (15 min)
- Download Brandon Grotesque + TT Norms from Drive
- Convert to WOFF2
- Upload to Shopify theme assets
- Add @font-face declarations to theme CSS

### Phase 1: Color + Typography Merge (2 hrs, API-driven)
- Apply viscosity color system across all pages
- Replace all accent colors with the correct bottle colors
- Replace font-family overrides with Brandon Grotesque heading / TT Norms body
- Update homepage sections to use bottle-matched colors
- Update hero to feel more aligned with the bold italic brand

### Phase 2: Theme Settings (30 min)
- Button color → #E91E76 (magenta/thick — the CTA color)
- Heading font → Brandon Grotesque Bold  
- Link color → #2B5CAB
- Footer → #1a1a2e with white text

### Phase 3: Product Pages (3-4 hrs)
- Viscosity color badges from the bottle palette
- Product descriptions styled with brand typography
- Cross-sell with color-coded viscosity siblings

### Phase 4: Revenue Features (same as before)
- Bundles, reviews, trust signals, shipping bar

---

## The Vision

When someone holds a Gluemasters bottle and visits gluemasters.com, they should see the same brand. Same magenta for Thick. Same green for Medium. Same bold condensed italic energy. Same "MASTER YOUR CRAFT" confidence.

Right now: the bottles are bold industrial, the website is polite corporate. After this merge: they're the same brand everywhere.
