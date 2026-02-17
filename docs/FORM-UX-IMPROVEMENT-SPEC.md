# GRAVIX FORM UX IMPROVEMENT SPEC — ADDENDUM
## Substrate Input, Form Layout, and Field Changes for Spec Engine & Failure Analysis
### February 2026

**Purpose:** Specifies changes to both analysis forms to improve conversion rate and analysis quality. Applies on top of `gravix-frontend-update-addendum.md`. Agent should implement these changes to the `/failure` and `/tool` form components.

**Priority:** HIGH — these changes directly affect signup conversion and analysis quality.

---

# TABLE OF CONTENTS

1. [Substrate Input — Combobox Replacement](#1-substrate-input--combobox-replacement)
2. [Expanded Substrate List](#2-expanded-substrate-list)
3. [Failure Analysis Form — Layout Restructure](#3-failure-analysis-form--layout-restructure)
4. [Spec Engine Form — Layout Restructure](#4-spec-engine-form--layout-restructure)
5. [Shared Component Specs](#5-shared-component-specs)
6. [Backend Normalizer Notes](#6-backend-normalizer-notes)

---

# 1. SUBSTRATE INPUT — COMBOBOX REPLACEMENT

## Problem

Current substrate fields are typeahead-select components bound to a closed list of 24 materials. An engineer typing "Noryl GFN2", "7075-T6", "Viton", "FR-4", or "Delrin" gets zero matches. They either pick a wrong generic, lose specificity, or abandon the form.

## Solution

Replace both Substrate 1 and Substrate 2 inputs with a **combobox** (typeahead with free-form fallback). The predefined list becomes suggestions, not a gate.

## Combobox Behavior — Three Modes

**Mode 1: Matched suggestion**
```
User types: "Alum"
┌──────────────────────────────────────┐
│ Aluminum (Generic)                   │
│ Aluminum 6061-T6                     │
│ Aluminum 2024-T3                     │
│ Aluminum 5052-H32                    │
│ Aluminum 7075-T6                     │
│ Aluminum (Anodized)                  │
│ Aluminum (Cast / A356)               │
└──────────────────────────────────────┘
```
User picks "Aluminum 6061-T6" → field value: `Aluminum 6061-T6`. Normalizer maps to `aluminum_6061`.

**Mode 2: No match — free-form accepted**
```
User types: "Noryl GFN2"
┌──────────────────────────────────────┐
│ No exact match                       │
│ ────────────────────────────────     │
│ ✓ Use "Noryl GFN2" as entered       │
│                                      │
│ Similar:                             │
│   Nylon 6/6                          │
│   Polycarbonate (PC)                 │
└──────────────────────────────────────┘
```
User either clicks "Use as entered" or just presses Enter/Tab → field value: `Noryl GFN2`. Normalizer handles server-side mapping (Noryl → PPO/PS blend). If normalizer can't map it, AI receives the raw string and works with it.

**Mode 3: Vague input — accepted with note**
```
User types: "the bracket part"
→ Field accepts it. No error. No validation block.
→ AI receives "the bracket part" as substrate, produces lower-confidence result,
   and the response will note: "Substrate not recognized as a specific material.
   For better results, specify the material (e.g., 'Mild Steel', 'ABS Plastic')."
```

## Combobox Component Spec

```
┌─ Substrate 1 ──────────────────────────────────────────┐
│ [icon: 🔍] Aluminum 60                            [✕]  │
├────────────────────────────────────────────────────────┤
│  METALS                                                │
│    Aluminum 6061-T6                                    │
│    Aluminum 7075-T6                                    │
│                                                        │
│  ── or use your exact text ──                          │
│    ✓ Use "Aluminum 60" as entered                      │
└────────────────────────────────────────────────────────┘
```

**Visual specs:**
- Input: 44px height, `bg-brand-900`, border `1px solid #374151`, rounded, 14px text
- Focus: border `2px solid #3B82F6`
- Dropdown: `bg-brand-800`, border `1px solid #374151`, rounded-b-lg, max-height 320px, overflow-y auto, shadow-lg
- Category headers: 11px, uppercase, `text-tertiary`, tracking-wider, px-3 pt-3 pb-1, non-selectable
- Suggestion items: 14px, `text-secondary`, px-3 py-2, hover: `bg-brand-700`, cursor-pointer
- "Use as entered" row: `border-top 1px solid #1F2937`, 14px, `text-accent-500`, px-3 py-2.5. Always visible at bottom when input text doesn't exactly match any suggestion.
- "Similar" section: only shows when no exact match AND fuzzy matches exist. 13px, `text-tertiary` header, items indented.
- Clear button (✕): right side of input, 16px, `text-tertiary`, hover: `text-white`. Only visible when field has value.
- Keyboard: Arrow keys navigate suggestions. Enter selects highlighted or submits "as entered" if nothing highlighted. Escape closes dropdown. Tab accepts current value and moves to next field.

**Search/filter logic:**
- Case-insensitive prefix match on item name AND common aliases
- Fuzzy threshold: if input has ≥3 chars and no prefix match, show items where Levenshtein distance ≤ 3 OR the input is a substring of any alias
- Category grouping: always show grouped by category (Metals, Plastics, Elastomers, Composites, Ceramics/Glass, Other)
- Max visible: 8 items + "use as entered" row. If more matches, show top 8 by relevance.
- Recent selections: if user has prior analyses, pin their last 3 unique substrates at top under "Recent" category (stored in localStorage)

**Validation:**
- NONE on the substrate field. Any non-empty string is valid. The AI and backend normalizer handle whatever the user provides.
- Empty string: standard required-field validation ("Substrate is required") — only on submit, not on blur.

---

# 2. EXPANDED SUBSTRATE LIST

Replace the current 24-item list with this 96-item categorized list. Each item has a display name and an array of aliases that also trigger matching.

## Metals (24 items)

| Display Name | Aliases |
|---|---|
| Aluminum (Generic) | Al, aluminium, aluminum alloy |
| Aluminum 6061-T6 | 6061, AL 6061, 6061-T6 |
| Aluminum 2024-T3 | 2024, AL 2024, 2024-T3 |
| Aluminum 5052-H32 | 5052, AL 5052 |
| Aluminum 7075-T6 | 7075, AL 7075, 7075-T6 |
| Aluminum (Anodized) | anodized aluminum, anodised, hard anodized |
| Aluminum (Cast / A356) | cast aluminum, A356, die cast aluminum |
| Mild Steel | low carbon steel, 1018 steel, A36, CRS, cold rolled steel |
| Stainless Steel 304 | SS304, 304 stainless, 18-8 stainless |
| Stainless Steel 316L | SS316L, 316 stainless, surgical steel |
| Stainless Steel (Generic) | SS, stainless |
| Galvanized Steel | galv steel, hot dip galvanized, zinc coated steel |
| Carbon Steel | high carbon steel, 1045, 4140, 4340 |
| Tool Steel | D2, A2, M2, H13, tool steel |
| Copper | Cu, pure copper, C110 |
| Brass | Cu-Zn, C360, yellow brass |
| Bronze | phosphor bronze, C510 |
| Titanium Grade 2 | Ti Gr2, CP titanium, commercially pure Ti |
| Titanium Grade 5 | Ti-6Al-4V, Ti64, Ti Gr5 |
| Cast Iron | grey iron, ductile iron, gray cast iron |
| Inconel 718 | IN718, nickel alloy 718 |
| Hastelloy C-276 | C276, nickel alloy C-276 |
| Magnesium | Mg, AZ31, AZ91, magnesium alloy |
| Zinc (Die Cast) | Zamak, zinc alloy, ZAMAK 3 |

## Plastics (28 items)

| Display Name | Aliases |
|---|---|
| ABS | acrylonitrile butadiene styrene |
| Polycarbonate (PC) | PC, Lexan, Makrolon |
| Nylon 6 | PA6, polyamide 6 |
| Nylon 6/6 | PA66, polyamide 66, PA6/6 |
| HDPE | high density polyethylene |
| LDPE | low density polyethylene |
| Polypropylene (PP) | PP, polypro |
| PP-GF30 | glass filled PP, PP 30% GF, polypropylene glass filled |
| PVC (Rigid) | polyvinyl chloride, uPVC, rigid PVC |
| PVC (Flexible) | plasticized PVC, soft PVC, flex PVC |
| Acrylic (PMMA) | PMMA, Plexiglass, Perspex, Lucite |
| PTFE | Teflon, polytetrafluoroethylene |
| POM / Acetal | Delrin, polyoxymethylene, acetal copolymer |
| PET | polyethylene terephthalate, Mylar (film) |
| PBT | polybutylene terephthalate, Valox |
| PEEK | polyetheretherketone |
| Ultem (PEI) | polyetherimide, Ultem 1000, PEI |
| Polysulfone (PSU) | PSU, Udel |
| PPO / PPE | Noryl, polyphenylene oxide, modified PPE |
| ASA | acrylonitrile styrene acrylate |
| Polystyrene (PS) | PS, GPPS, HIPS |
| TPU | thermoplastic polyurethane |
| TPE | thermoplastic elastomer |
| FRP / SMC | sheet molding compound, fiberglass reinforced plastic |
| Polyimide | Kapton (film), PI, Vespel |
| LCP | liquid crystal polymer, Vectra |
| UHMWPE | ultra high molecular weight PE |
| FR-4 | fiberglass laminate, PCB substrate, G10 |

## Elastomers (10 items)

| Display Name | Aliases |
|---|---|
| Natural Rubber (NR) | NR, latex rubber, isoprene |
| Silicone Rubber | VMQ, silicone, RTV silicone |
| Neoprene (CR) | chloroprene, CR rubber |
| EPDM | ethylene propylene, EPDM rubber |
| Nitrile Rubber (NBR) | NBR, Buna-N, nitrile |
| Viton (FKM) | FKM, fluoroelastomer, fluorocarbon rubber |
| Butyl Rubber (IIR) | IIR, butyl |
| Polyurethane Rubber | PU rubber, urethane rubber |
| SBR | styrene butadiene rubber |
| Santoprene (TPV) | TPV, thermoplastic vulcanizate |

## Composites (12 items)

| Display Name | Aliases |
|---|---|
| Carbon Fiber (CFRP) | CFRP, carbon fiber reinforced polymer, carbon composite |
| Glass Fiber (GFRP) | GFRP, fiberglass, glass reinforced polymer |
| Aramid Fiber (AFRP) | Kevlar composite, AFRP |
| Carbon Fiber (Prepreg) | prepreg CFRP, autoclave carbon |
| Honeycomb Core (Aluminum) | aluminum honeycomb, Al honeycomb |
| Honeycomb Core (Nomex) | Nomex honeycomb, aramid honeycomb |
| Foam Core (PVC) | Divinycell, PVC foam, structural foam |
| Foam Core (PU) | polyurethane foam core |
| Wood (Hardwood) | oak, maple, birch, hardwood |
| Wood (Softwood) | pine, spruce, cedar, plywood, softwood |
| MDF / Particle Board | MDF, medium density fiberboard, chipboard |
| Concrete | cement, morite, portland cement |

## Ceramics, Glass & Other (22 items)

| Display Name | Aliases |
|---|---|
| Glass (Soda-Lime) | float glass, window glass, soda lime glass |
| Glass (Borosilicate) | Pyrex, borosilicate, lab glass |
| Glass (Tempered) | toughened glass, safety glass |
| Ceramic (Alumina) | Al2O3, aluminum oxide, alumina ceramic |
| Ceramic (Zirconia) | ZrO2, zirconia, yttria-stabilized zirconia |
| Ceramic (Silicon Carbide) | SiC, silicon carbide |
| Ceramic Tile | porcelain tile, stoneware, floor tile |
| Granite | natural stone, granite countertop |
| Marble | marble stone, cultured marble |
| Quartz | engineered quartz, quartz stone |
| Carbon / Graphite | graphite block, carbon-graphite |
| Sapphire | sapphire glass, sapphire crystal |
| Fabric / Textile | woven fabric, polyester fabric, nylon fabric |
| Leather | genuine leather, synthetic leather, PU leather |
| Paper / Cardboard | kraft paper, corrugated cardboard |
| Cork | natural cork, composite cork |
| Foam (EVA) | EVA foam, ethylene vinyl acetate |
| Foam (Polyurethane) | PU foam, open cell foam, closed cell foam |
| Powder Coated Surface | powder coat, epoxy powder coat, polyester powder coat |
| Chrome Plated Surface | chrome, chromium plate, decorative chrome |
| Painted Surface | paint, primer, e-coat, painted metal |
| Anodized Surface | anodized, hard anodize, Type III anodize |

## Implementation Notes

- Store this list as a JSON constant: `SUBSTRATE_SUGGESTIONS` with structure: `[{ category: "Metals", items: [{ name: "Aluminum 6061-T6", aliases: ["6061", "AL 6061", "6061-T6"] }] }]`
- The alias array is for search matching ONLY — never display aliases in the dropdown, only the display name
- This list will grow over time as users enter new substrates and the normalizer learns. Consider moving to a database table eventually, but static JSON is fine for launch.
- The "Recent" category (from localStorage) appears above all other categories when populated

---

# 3. FAILURE ANALYSIS FORM — LAYOUT RESTRUCTURE

## Current Problem

11 fields visible simultaneously. Description textarea competes with 10 other fields. Photo upload is buried near the bottom. Engineers in a hurry bounce. Engineers who fill everything get better results but the form looks overwhelming.

## New Layout: Core + Expandable Detail

### Zone 1: Core Fields (always visible)

These fields are visible immediately on page load. The submit button is visible without scrolling on a 900px viewport.

```
┌─ Diagnose a Failure ───────────────────────────────────────────────┐
│                                                                     │
│  What happened? *                                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Describe the failure — what broke, when, how it looked,      │  │
│  │ what conditions, what you've tried. The more detail you      │  │
│  │ provide, the more accurate the diagnosis.                    │  │
│  │                                                               │  │
│  │                                                               │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────┐    ┌──────────────────────────┐          │
│  │ Substrate 1 *        │    │ Substrate 2 *             │          │
│  │ e.g., Aluminum 6061  │    │ Material bonded to Sub 1  │          │
│  └─────────────────────┘    └──────────────────────────┘          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Product / Adhesive Used                                       │  │
│  │ e.g., Loctite 495, 3M DP420, generic 2-part epoxy, unknown  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  📷 Drag photos here or click to upload                       │  │
│  │  Fracture surfaces, cross-sections, macro shots — up to 5    │  │
│  │  images for visual AI analysis                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ▸ Add details for a more accurate diagnosis (optional)            │
│                                                                     │
│  ┌─────────────────────────────────────────────────┐               │
│  │  [Standard Analysis] | [Guided Investigation]   │               │
│  └─────────────────────────────────────────────────┘               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Analyze Failure →                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  3 of 5 free analyses remaining this month  [Pro →]                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Zone 2: Expandable Detail (collapsed by default)

Clicking "▸ Add details for a more accurate diagnosis" expands this section with a smooth animation. The expand/collapse state persists in localStorage — if a user expanded it once, it stays expanded on future visits.

```
│  ▾ Add details for a more accurate diagnosis                       │
│                                                                     │
│  ┌───── Failure Mode ──────────────────────────────────────────┐  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │  │
│  │  │ Adhesive │ │ Cohesive │ │  Mixed   │ │Substrate │      │  │
│  │  │ [diagram]│ │ [diagram]│ │ [diagram]│ │ [diagram]│      │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │  │
│  │  Not sure? Leave blank — our AI can infer from your        │  │
│  │  description and photos.                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────────┐                    │
│  │ Adhesive Type    │  │ Time to Failure       │                    │
│  │ [Epoxy        ▾] │  │ [1-6 months        ▾] │                    │
│  └─────────────────┘  └──────────────────────┘                    │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────────┐                    │
│  │ Industry         │  │ Surface Preparation   │                    │
│  │ [Automotive   ▾] │  │ [Solvent wipe (IPA)▾] │                    │
│  └─────────────────┘  └──────────────────────┘                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Environment (select all that apply)                          │  │
│  │ [High humidity] [Chemical] [UV/outdoor] [Thermal cycling]   │  │
│  │ [Submersion] [Vibration]                                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────┐                                              │
│  │ Production Impact│                                              │
│  │ [Line down    ▾] │                                              │
│  └─────────────────┘                                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Additional Context                                           │  │
│  │ Test results, batch info, previous fixes tried...            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
```

### Field Specifications — Zone 1

| # | Field | Type | Required | Spec |
|---|-------|------|----------|------|
| 1 | **What happened?** (Description) | Textarea | Yes | 6 rows, auto-growing to 12 rows. Placeholder: "Describe the failure — what broke, when, how it looked, what conditions, what you've tried. The more detail you provide, the more accurate the diagnosis." Auto-focused on page load. `bg-brand-900`, 15px text (slightly larger than other inputs). Min 10 chars on submit. |
| 2 | **Substrate 1** | Combobox (Section 1) | Yes | Label: "Substrate 1". Placeholder: "e.g., Aluminum 6061, ABS, Polycarbonate". |
| 3 | **Substrate 2** | Combobox (Section 1) | Yes | Label: "Substrate 2". Placeholder: "Material bonded to Substrate 1". Side-by-side with Substrate 1 on desktop, stacked on mobile. |
| 4 | **Product / Adhesive Used** | Combobox | No | Dual-source autocomplete: searches BOTH `product_specifications` table (TDS-backed products) AND the free-form adhesive type list. TDS matches show "✓ TDS on file" pill. Non-matches accepted as free text. Placeholder: "e.g., Loctite 495, 3M DP420, generic 2-part epoxy, unknown". Consolidated field — replaces the old separate "Adhesive Type" dropdown AND "Product Name" typeahead with a single smart input. |
| 5 | **Defect Photos** | Multi-file upload | No | Drag-and-drop zone, 80px height collapsed, expands on hover/drag. Dashed border `#374151`, hover: `border-accent-500`. Accepts: .jpg, .jpeg, .png, .heic, .tif. Max 5 files, max 10MB each. After upload: thumbnails (64x64) inline with remove button. Helper text inside zone: "📷 Drag photos here or click to upload — fracture surfaces, cross-sections, macro shots." Icon changes to green check after upload. |

**Note on Product field consolidation:** The old form had two separate fields: "Adhesive Type" (dropdown: Epoxy, CA, PU, etc.) and "Product Name" (typeahead searching product_specifications). These are merged into a single combobox. If user types "Loctite 495" it matches the TDS database. If they type "2-part epoxy" it matches the chemistry type. If they type "the stuff from the tube" — that's fine too, AI handles it. One field instead of two reduces cognitive load and eliminates the confusion of "which one do I fill?".

### Field Specifications — Zone 2

All Zone 2 fields remain as specified in the original page-by-page spec, with these changes:

| Field | Change |
|-------|--------|
| **Failure Mode** | No longer required. Helper text added below cards: "Not sure? Leave blank — our AI can infer from your description and photos." Cards still function the same (visual 2x2 radio selection). Unselected state is valid. |
| **Adhesive Type** | REMOVED — merged into Zone 1 "Product / Adhesive Used" combobox. |
| **Time to Failure** | Unchanged. Dropdown stays. |
| **Industry** | Unchanged. |
| **Surface Preparation** | Unchanged. |
| **Environment** | Unchanged. Multi-select chips. |
| **Production Impact** | Unchanged. |
| **Additional Context** | Unchanged. Textarea. |

### Zone 2 Expand/Collapse Behavior

- **Default state:** collapsed. Only the trigger text "▸ Add details for a more accurate diagnosis (optional)" is visible.
- **Click/tap:** expands with 300ms ease-out animation. Chevron rotates: ▸ → ▾. Text changes to "▾ Add details for a more accurate diagnosis."
- **Persistence:** expand state saved to `localStorage` key `gravix_failure_form_expanded`. If user expanded it in a previous session, it stays expanded.
- **Scroll:** after expanding, page auto-scrolls so the first expanded field (Failure Mode) is visible. Does not scroll past the submit button.
- **Submit:** Zone 2 fields are submitted whether expanded or collapsed. If collapsed and the user previously filled fields (localStorage form persistence), those values still submit. Collapsing does NOT clear values.

### Photo Upload Zone — Detailed Spec

```
Default (no photos):
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  📷 Drag photos here or click to upload
  Fracture surfaces, cross-sections, macro shots — up to 5
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

Drag active:
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  📷 Drop to upload                    (border turns accent-500,
                                        bg-accent-500/5)
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

After upload (2 photos):
┌──────────────────────────────────────────────────────────────┐
│  [thumb1] [✕]   [thumb2] [✕]   [+ Add more]                │
│  ✓ 2 photos — visual AI analysis enabled                    │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**
- Default zone: dashed border `2px dashed #374151`, rounded-lg, py-4 px-6, centered text
- Drag-over: border-color `#3B82F6`, `bg-accent-500/5`
- Uploaded state: solid border, `bg-brand-800`, thumbnails 64x64 rounded-md, inline-flex with gap-3
- Remove button: 16px circle, `bg-brand-900/80`, ✕ icon, absolute positioned top-right of thumbnail
- "+ Add more": ghost button style, only shows when <5 photos uploaded, hidden at 5
- Success line: "✓ 2 photos — visual AI analysis enabled" in `text-accent-500`, 13px
- File validation: on drop/select, immediately reject files >10MB (toast: "File too large. Max 10MB.") and unsupported types (toast: "Unsupported format. Use JPG, PNG, or HEIC.")
- Upload happens client-side to state only (not to server until form submits). Photos stored as File objects in component state. For localStorage persistence (auth gate flow), photos stored as base64 data URLs.

---

# 4. SPEC ENGINE FORM — LAYOUT RESTRUCTURE

## Same Principle: Core + Expandable Detail

### Zone 1: Core Fields (always visible)

```
┌─ Specify a Material ────────────────────────────────────────────────┐
│                                                                      │
│  ┌─────────────────────┐    ┌──────────────────────────┐           │
│  │ Substrate 1 *        │    │ Substrate 2 *             │           │
│  │ e.g., Aluminum 6061  │    │ Material bonded to Sub 1  │           │
│  └─────────────────────┘    └──────────────────────────┘           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Product Considered                                            │   │
│  │ e.g., Loctite 495, 3M DP420 — we'll check field performance │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ▸ Add requirements for a more precise specification (optional)     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Generate Specification →                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  3 of 5 free analyses remaining this month  [Pro →]                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Zone 2: Expandable Detail

```
│  ▾ Add requirements for a more precise specification                │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────────┐                     │
│  │ Load Type        │  │ Cure Constraints      │                     │
│  │ [Structural   ▾] │  │ [Room temp only    ▾] │                     │
│  └─────────────────┘  └──────────────────────┘                     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Environment (select all that apply)                          │   │
│  │ [High humidity] [Chemical] [UV/outdoor] [Thermal cycling]   │   │
│  │ [Submersion] [Vibration]                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Temperature Range                                                   │
│  ┌─────────┐  to  ┌─────────┐  °C                                  │
│  │ -40     │      │ 120     │                                       │
│  └─────────┘      └─────────┘                                       │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────────┐                     │
│  │ Production Volume│  │ Application Method    │                     │
│  │ [1,000+/day   ▾] │  │ [Automated dispense▾] │                     │
│  └─────────────────┘  └──────────────────────┘                     │
│                                                                      │
│  ┌──────────────────────────────────────────┐                       │
│  │ Required Fixture Time                     │                       │
│  │ [< 1 minute                            ▾] │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                      │
│  ┌─────────────────┐                                                │
│  │ Gap Fill (mm)    │                                                │
│  │ [      5        ]│                                                │
│  └─────────────────┘                                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Additional Context                                           │   │
│  │ Special requirements, regulatory, application constraints... │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
```

### Field Specifications — Zone 1

| # | Field | Type | Required | Spec |
|---|-------|------|----------|------|
| 1 | **Substrate 1** | Combobox (Section 1) | Yes | Same combobox component as failure form. |
| 2 | **Substrate 2** | Combobox (Section 1) | Yes | Same. Side-by-side on desktop. |
| 3 | **Product Considered** | Combobox | No | Same dual-source autocomplete as failure form's "Product / Adhesive Used" field. Placeholder: "e.g., Loctite 495, 3M DP420 — we'll check field performance." If TDS product selected, spec results include Known Risks section from field failure data. |

### Field Specifications — Zone 2

All existing fields from the original spec (Load Type, Environment, Temperature Range, Cure Constraints, Gap Fill, Additional Context) remain unchanged. Three new fields added:

| Field | Type | Options | Notes |
|-------|------|---------|-------|
| **Production Volume** | Select | Prototype / R&D, <100/day, 100-1,000/day, 1,000-10,000/day, >10,000/day | Affects recommendations: high volume eliminates slow-cure and manually-mixed adhesives. |
| **Application Method** | Select | Manual (syringe/gun), Manual (brush/spatula), Automated dispense, Spray, Film/tape, Jetting, Screen print | Affects viscosity and rheology recommendations. |
| **Required Fixture Time** | Select | < 1 minute, 1-5 minutes, 5-30 minutes, 30 min - 2 hours, > 2 hours acceptable, Not critical | Drives chemistry selection more than almost any other factor. An assembly line needing 5-second fixture will never use a structural epoxy. |

### Zone 2 Expand/Collapse Behavior

Same behavior as failure form (Section 3). localStorage key: `gravix_spec_form_expanded`.

---

# 5. SHARED COMPONENT SPECS

## Combobox Component — Reusable

The combobox is a single shared component used in 5 places:
1. Failure form — Substrate 1
2. Failure form — Substrate 2
3. Failure form — Product / Adhesive Used
4. Spec form — Substrate 1
5. Spec form — Substrate 2
6. Spec form — Product Considered
7. Investigation create form — (future: linked substrates)

**Props:**

```typescript
interface ComboboxProps {
  label: string;
  placeholder: string;
  suggestions: SuggestionCategory[];  // categorized list
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  recentKey?: string;  // localStorage key for recent selections
  showTdsBadge?: boolean;  // show "✓ TDS on file" for product matches
}

interface SuggestionCategory {
  category: string;  // "Metals", "Plastics", etc.
  items: SuggestionItem[];
}

interface SuggestionItem {
  name: string;       // display name
  aliases: string[];  // search aliases (never displayed)
  hasTds?: boolean;   // true if TDS data available (products only)
}
```

**Component file:** `src/components/ui/Combobox.tsx` (or `.jsx`)

## Expand/Collapse Section — Reusable

```typescript
interface ExpandableSectionProps {
  label: string;            // "Add details for a more accurate diagnosis"
  persistKey: string;       // localStorage key for expand state
  defaultExpanded?: boolean;
  children: React.ReactNode;
}
```

**Component file:** `src/components/ui/ExpandableSection.tsx`

## Photo Upload Zone — Reusable

```typescript
interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxFiles?: number;     // default 5
  maxSizeMB?: number;    // default 10
  helperText?: string;
}
```

**Component file:** `src/components/ui/PhotoUpload.tsx`

Used in: failure form Zone 1, investigation detail photo gallery, guided investigation chat.

---

# 6. BACKEND NORMALIZER NOTES

The frontend changes have minimal backend impact because the normalizer already handles free-form input. However, a few notes for the agent:

**No backend changes required for:**
- Combobox: the backend receives the same `substrate_1` and `substrate_2` string fields. Whether the value came from a suggestion click or free-form typing makes no difference.
- Merged product field: the backend already accepts `adhesive_used` as a string AND `product_id` as an optional reference. If the combobox selection matches a TDS product, include `product_id`. If it's free text, send `adhesive_used` as string.
- Zone 2 collapse: all fields submit regardless of expand/collapse state — same payload as before.

**Minor backend consideration:**
- The expanded substrate list includes some materials not currently in the normalizer's mapping table. New aliases (Lexan→polycarbonate, Delrin→pom, Viton→fkm, etc.) should be added to the normalizer's alias dictionary. This is a data change, not a code change — add rows to the `substrate_aliases` mapping or extend the static dictionary.
- The new spec form fields (Production Volume, Application Method, Required Fixture Time) need to be accepted by the spec endpoint. Add them as optional string fields to the spec request schema and include them in the AI prompt context. Example prompt injection: "Production volume: 1,000+/day. Application method: Automated dispense. Required fixture time: < 1 minute." These are text values passed directly to the AI — no special processing needed.

---

# IMPLEMENTATION CHECKLIST

```
Phase 1: Shared Components
  □ Build Combobox component (src/components/ui/Combobox.tsx)
  □ Build ExpandableSection component
  □ Build PhotoUpload component
  □ Create SUBSTRATE_SUGGESTIONS constant with 96 items + aliases
  □ Test: combobox keyboard navigation, free-form acceptance, alias matching

Phase 2: Failure Analysis Form
  □ Replace substrate select → Combobox (both fields)
  □ Move Description to position 1, increase to 6 rows, auto-focus
  □ Merge "Adhesive Type" + "Product Name" into single "Product / Adhesive Used" combobox
  □ Move Photo Upload to Zone 1 (after Product field)
  □ Wrap remaining fields (Failure Mode, Time to Failure, Industry, Surface Prep,
    Environment, Production Impact, Additional Context) in ExpandableSection
  □ Make Failure Mode optional (remove required validation)
  □ Add helper text under Failure Mode cards
  □ Ensure Zone 2 collapsed by default, expand state persisted
  □ Verify localStorage form persistence still works with new layout
  □ Verify auth gate flow still works (form save → modal → restore → auto-submit)

Phase 3: Spec Engine Form
  □ Replace substrate select → Combobox (both fields)
  □ Move Product Considered to Zone 1
  □ Add new fields: Production Volume, Application Method, Required Fixture Time
  □ Wrap all fields except substrates and product in ExpandableSection
  □ Ensure Zone 2 collapsed by default
  □ Verify localStorage persistence and auth gate

Phase 4: Backend
  □ Add new substrate aliases to normalizer dictionary
  □ Add Production Volume, Application Method, Required Fixture Time to spec request schema
  □ Include new spec fields in AI prompt context
  □ Test: free-form substrate input → normalizer → correct canonical key

Phase 5: Validation
  □ Run TC-3.1, TC-3.2, TC-4.1, TC-4.2 (updated forms render and submit correctly)
  □ Run TC-47.1, TC-47.3 (auth gate flow with new form layout)
  □ Test: exotic substrate free-form → analysis completes with lower confidence
  □ Test: Zone 2 collapsed, submit → all Zone 2 values included in payload
  □ Test: photo upload → visual analysis section appears in results
  □ Test: mobile layout — substrates stack, photo zone works, expand/collapse works
```

---

**END OF FORM UX IMPROVEMENT SPEC**
