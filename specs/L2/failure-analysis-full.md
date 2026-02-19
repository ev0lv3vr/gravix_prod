# Failure Analysis — L2 Full Detail

> Combined from gravix-final-prd.md:
> - Part V-A, PAGE 3 (Failure Analysis)
> - Part V-B, Section 3 (Tool Page Updates) — applies to BOTH spec engine and failure analysis
> - Part V-B, Section 9 (Guided Investigation — new page)
> - Part VI-B (Form UX: combobox, zones, photo upload)
>
> **Also read:** L2/forms-full.md for complete field option lists

---

## BASE SPECIFICATION

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

-e 
---

## TOOL PAGE ADDENDUM UPDATES

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

-e 
---

## GUIDED INVESTIGATION (NEW PAGE)

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

-e 
---

## FORM UX SPECIFICATION

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
- The alias array is for search matching ONLY â€” never display aliases in the dropdown, only the display name
- This list will grow over time as users enter new substrates and the normalizer learns. Consider moving to a database table eventually, but static JSON is fine for launch.
- The "Recent" category (from localStorage) appears above all other categories when populated

---

# 3. FAILURE ANALYSIS FORM â€” LAYOUT RESTRUCTURE

## Current Problem

11 fields visible simultaneously. Description textarea competes with 10 other fields. Photo upload is buried near the bottom. Engineers in a hurry bounce. Engineers who fill everything get better results but the form looks overwhelming.

## New Layout: Core + Expandable Detail

### Zone 1: Core Fields (always visible)

These fields are visible immediately on page load. The submit button is visible without scrolling on a 900px viewport.

```
â”Œâ”€ Diagnose a Failure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                                     â”‚
â”‚  What happened? *                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Describe the failure â€” what broke, when, how it looked,      â”‚  â”‚
â”‚  â”‚ what conditions, what you've tried. The more detail you      â”‚  â”‚
â”‚  â”‚ provide, the more accurate the diagnosis.                    â”‚  â”‚
â”‚  â”‚                                                               â”‚  â”‚
â”‚  â”‚                                                               â”‚  â”‚
â”‚  â”‚                                                               â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚
â”‚  â”‚ Substrate 1 *        â”‚    â”‚ Substrate 2 *             â”‚          â”‚
â”‚  â”‚ e.g., Aluminum 6061  â”‚    â”‚ Material bonded to Sub 1  â”‚          â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Product / Adhesive Used                                       â”‚  â”‚
â”‚  â”‚ e.g., Loctite 495, 3M DP420, generic 2-part epoxy, unknown  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  ðŸ“· Drag photos here or click to upload                       â”‚  â”‚
â”‚  â”‚  Fracture surfaces, cross-sections, macro shots â€” up to 5    â”‚  â”‚
â”‚  â”‚  images for visual AI analysis                                â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                     â”‚
â”‚  â–¸ Add details for a more accurate diagnosis (optional)            â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚
â”‚  â”‚  [Standard Analysis] | [Guided Investigation]   â”‚               â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚                      Analyze Failure â†’                        â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                     â”‚
â”‚  3 of 5 free analyses remaining this month  [Pro â†’]                â”‚
â”‚                                                                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Zone 2: Expandable Detail (collapsed by default)

Clicking "â–¸ Add details for a more accurate diagnosis" expands this section with a smooth animation. The expand/collapse state persists in localStorage â€” if a user expanded it once, it stays expanded on future visits.

```
â”‚  â–¾ Add details for a more accurate diagnosis                       â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€ Failure Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚  â”‚
â”‚  â”‚  â”‚ Adhesive â”‚ â”‚ Cohesive â”‚ â”‚  Mixed   â”‚ â”‚Substrate â”‚      â”‚  â”‚
â”‚  â”‚  â”‚ [diagram]â”‚ â”‚ [diagram]â”‚ â”‚ [diagram]â”‚ â”‚ [diagram]â”‚      â”‚  â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚  â”‚
â”‚  â”‚  Not sure? Leave blank â€” our AI can infer from your        â”‚  â”‚
â”‚  â”‚  description and photos.                                    â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â”‚
â”‚  â”‚ Adhesive Type    â”‚  â”‚ Time to Failure       â”‚                    â”‚
â”‚  â”‚ [Epoxy        â–¾] â”‚  â”‚ [1-6 months        â–¾] â”‚                    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                    â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â”‚
â”‚  â”‚ Industry         â”‚  â”‚ Surface Preparation   â”‚                    â”‚
â”‚  â”‚ [Automotive   â–¾] â”‚  â”‚ [Solvent wipe (IPA)â–¾] â”‚                    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                    â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Environment (select all that apply)                          â”‚  â”‚
â”‚  â”‚ [High humidity] [Chemical] [UV/outdoor] [Thermal cycling]   â”‚  â”‚
â”‚  â”‚ [Submersion] [Vibration]                                     â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                              â”‚
â”‚  â”‚ Production Impactâ”‚                                              â”‚
â”‚  â”‚ [Line down    â–¾] â”‚                                              â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                              â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Additional Context                                           â”‚  â”‚
â”‚  â”‚ Test results, batch info, previous fixes tried...            â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                     â”‚
```

### Field Specifications â€” Zone 1

| # | Field | Type | Required | Spec |
|---|-------|------|----------|------|
| 1 | **What happened?** (Description) | Textarea | Yes | 6 rows, auto-growing to 12 rows. Placeholder: "Describe the failure â€” what broke, when, how it looked, what conditions, what you've tried. The more detail you provide, the more accurate the diagnosis." Auto-focused on page load. `bg-brand-900`, 15px text (slightly larger than other inputs). Min 10 chars on submit. |
| 2 | **Substrate 1** | Combobox (Section 1) | Yes | Label: "Substrate 1". Placeholder: "e.g., Aluminum 6061, ABS, Polycarbonate". |
| 3 | **Substrate 2** | Combobox (Section 1) | Yes | Label: "Substrate 2". Placeholder: "Material bonded to Substrate 1". Side-by-side with Substrate 1 on desktop, stacked on mobile. |
| 4 | **Product / Adhesive Used** | Combobox | No | Dual-source autocomplete: searches BOTH `product_specifications` table (TDS-backed products) AND the free-form adhesive type list. TDS matches show "âœ“ TDS on file" pill. Non-matches accepted as free text. Placeholder: "e.g., Loctite 495, 3M DP420, generic 2-part epoxy, unknown". Consolidated field â€” replaces the old separate "Adhesive Type" dropdown AND "Product Name" typeahead with a single smart input. |
| 5 | **Defect Photos** | Multi-file upload | No | Drag-and-drop zone, 80px height collapsed, expands on hover/drag. Dashed border `#374151`, hover: `border-accent-500`. Accepts: .jpg, .jpeg, .png, .heic, .tif. Max 5 files, max 10MB each. After upload: thumbnails (64x64) inline with remove button. Helper text inside zone: "ðŸ“· Drag photos here or click to upload â€” fracture surfaces, cross-sections, macro shots." Icon changes to green check after upload. |

**Note on Product field consolidation:** The old form had two separate fields: "Adhesive Type" (dropdown: Epoxy, CA, PU, etc.) and "Product Name" (typeahead searching product_specifications). These are merged into a single combobox. If user types "Loctite 495" it matches the TDS database. If they type "2-part epoxy" it matches the chemistry type. If they type "the stuff from the tube" â€” that's fine too, AI handles it. One field instead of two reduces cognitive load and eliminates the confusion of "which one do I fill?".

### Field Specifications â€” Zone 2

All Zone 2 fields remain as specified in the original page-by-page spec, with these changes:

| Field | Change |
|-------|--------|
| **Failure Mode** | No longer required. Helper text added below cards: "Not sure? Leave blank â€” our AI can infer from your description and photos." Cards still function the same (visual 2x2 radio selection). Unselected state is valid. |
| **Adhesive Type** | REMOVED â€” merged into Zone 1 "Product / Adhesive Used" combobox. |
| **Time to Failure** | Unchanged. Dropdown stays. |
| **Industry** | Unchanged. |
| **Surface Preparation** | Unchanged. |
| **Environment** | Unchanged. Multi-select chips. |
| **Production Impact** | Unchanged. |
| **Additional Context** | Unchanged. Textarea. |

### Zone 2 Expand/Collapse Behavior

- **Default state:** collapsed. Only the trigger text "â–¸ Add details for a more accurate diagnosis (optional)" is visible.
- **Click/tap:** expands with 300ms ease-out animation. Chevron rotates: â–¸ â†’ â–¾. Text changes to "â–¾ Add details for a more accurate diagnosis."
- **Persistence:** expand state saved to `localStorage` key `gravix_failure_form_expanded`. If user expanded it in a previous session, it stays expanded.
- **Scroll:** after expanding, page auto-scrolls so the first expanded field (Failure Mode) is visible. Does not scroll past the submit button.
- **Submit:** Zone 2 fields are submitted whether expanded or collapsed. If collapsed and the user previously filled fields (localStorage form persistence), those values still submit. Collapsing does NOT clear values.

### Photo Upload Zone â€” Detailed Spec

```
Default (no photos):
â”Œ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”
  ðŸ“· Drag photos here or click to upload
  Fracture surfaces, cross-sections, macro shots â€” up to 5
â”” â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”˜

Drag active:
â”Œ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”
  ðŸ“· Drop to upload                    (border turns accent-500,
                                        bg-accent-500/5)
â”” â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”€ â”˜

After upload (2 photos):
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [thumb1] [âœ•]   [thumb2] [âœ•]   [+ Add more]                â”‚
â”‚  âœ“ 2 photos â€” visual AI analysis enabled                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specs:**
- Default zone: dashed border `2px dashed #374151`, rounded-lg, py-4 px-6, centered text
- Drag-over: border-color `#3B82F6`, `bg-accent-500/5`
- Uploaded state: solid border, `bg-brand-800`, thumbnails 64x64 rounded-md, inline-flex with gap-3
- Remove button: 16px circle, `bg-brand-900/80`, âœ• icon, absolute positioned top-right of thumbnail
- "+ Add more": ghost button style, only shows when <5 photos uploaded, hidden at 5
- Success line: "âœ“ 2 photos â€” visual AI analysis enabled" in `text-accent-500`, 13px
- File validation: on drop/select, immediately reject files >10MB (toast: "File too large. Max 10MB.") and unsupported types (toast: "Unsupported format. Use JPG, PNG, or HEIC.")
- Upload happens client-side to state only (not to server until form submits). Photos stored as File objects in component state. For localStorage persistence (auth gate flow), photos stored as base64 data URLs.

---

# 4. SPEC ENGINE FORM â€” LAYOUT RESTRUCTURE

## Same Principle: Core + Expandable Detail

### Zone 1: Core Fields (always visible)

```
â”Œâ”€ Specify a Material â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚
â”‚  â”‚ Substrate 1 *        â”‚    â”‚ Substrate 2 *             â”‚           â”‚
â”‚  â”‚ e.g., Aluminum 6061  â”‚    â”‚ Material bonded to Sub 1  â”‚           â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Product Considered                                            â”‚   â”‚
â”‚  â”‚ e.g., Loctite 495, 3M DP420 â€” we'll check field performance â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                      â”‚
â”‚  â–¸ Add requirements for a more precise specification (optional)     â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                    Generate Specification â†’                    â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                      â”‚
â”‚  3 of 5 free analyses remaining this month  [Pro â†’]                 â”‚
â”‚                                                                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Zone 2: Expandable Detail

```
â”‚  â–¾ Add requirements for a more precise specification                â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                     â”‚
â”‚  â”‚ Load Type        â”‚  â”‚ Cure Constraints      â”‚                     â”‚
â”‚  â”‚ [Structural   â–¾] â”‚  â”‚ [Room temp only    â–¾] â”‚                     â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                     â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Environment (select all that apply)                          â”‚   â”‚
â”‚  â”‚ [High humidity] [Chemical] [UV/outdoor] [Thermal cycling]   â”‚   â”‚
â”‚  â”‚ [Submersion] [Vibration]                                     â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                      â”‚
â”‚  Temperature Range                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  to  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  Â°C                                  â”‚
â”‚  â”‚ -40     â”‚      â”‚ 120     â”‚                                       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                       â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                     â”‚
â”‚  â”‚ Production Volumeâ”‚  â”‚ Application Method    â”‚                     â”‚
â”‚  â”‚ [1,000+/day   â–¾] â”‚  â”‚ [Automated dispenseâ–¾] â”‚                     â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                     â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                       â”‚
â”‚  â”‚ Required Fixture Time                     â”‚                       â”‚
â”‚  â”‚ [< 1 minute                            â–¾] â”‚                       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                       â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                                â”‚
â”‚  â”‚ Gap Fill (mm)    â”‚                                                â”‚
â”‚  â”‚ [      5        ]â”‚                                                â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                â”‚
â”‚                                                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Additional Context                                           â”‚   â”‚
â”‚  â”‚ Special requirements, regulatory, application constraints... â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                      â”‚
```

### Field Specifications â€” Zone 1

| # | Field | Type | Required | Spec |
|---|-------|------|----------|------|
| 1 | **Substrate 1** | Combobox (Section 1) | Yes | Same combobox component as failure form. |
| 2 | **Substrate 2** | Combobox (Section 1) | Yes | Same. Side-by-side on desktop. |
| 3 | **Product Considered** | Combobox | No | Same dual-source autocomplete as failure form's "Product / Adhesive Used" field. Placeholder: "e.g., Loctite 495, 3M DP420 â€” we'll check field performance." If TDS product selected, spec results include Known Risks section from field failure data. |

### Field Specifications â€” Zone 2

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

## Combobox Component â€” Reusable

The combobox is a single shared component used in 5 places:
1. Failure form â€” Substrate 1
2. Failure form â€” Substrate 2
3. Failure form â€” Product / Adhesive Used
4. Spec form â€” Substrate 1
5. Spec form â€” Substrate 2
6. Spec form â€” Product Considered
7. Investigation create form â€” (future: linked substrates)

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
  showTdsBadge?: boolean;  // show "âœ“ TDS on file" for product matches
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

## Expand/Collapse Section â€” Reusable

```typescript
interface ExpandableSectionProps {
  label: string;            // "Add details for a more accurate diagnosis"
  persistKey: string;       // localStorage key for expand state
  defaultExpanded?: boolean;
  children: React.ReactNode;
}
```

**Component file:** `src/components/ui/ExpandableSection.tsx`

## Photo Upload Zone â€” Reusable

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
- Zone 2 collapse: all fields submit regardless of expand/collapse state â€” same payload as before.

**Minor backend consideration:**
- The expanded substrate list includes some materials not currently in the normalizer's mapping table. New aliases (Lexanâ†’polycarbonate, Delrinâ†’pom, Vitonâ†’fkm, etc.) should be added to the normalizer's alias dictionary. This is a data change, not a code change â€” add rows to the `substrate_aliases` mapping or extend the static dictionary.
- The new spec form fields (Production Volume, Application Method, Required Fixture Time) need to be accepted by the spec endpoint. Add them as optional string fields to the spec request schema and include them in the AI prompt context. Example prompt injection: "Production volume: 1,000+/day. Application method: Automated dispense. Required fixture time: < 1 minute." These are text values passed directly to the AI â€” no special processing needed.

---

# IMPLEMENTATION CHECKLIST

```
Phase 1: Shared Components
  â–¡ Build Combobox component (src/components/ui/Combobox.tsx)
  â–¡ Build ExpandableSection component
  â–¡ Build PhotoUpload component
  â–¡ Create SUBSTRATE_SUGGESTIONS constant with 96 items + aliases
  â–¡ Test: combobox keyboard navigation, free-form acceptance, alias matching

Phase 2: Failure Analysis Form
  â–¡ Replace substrate select â†’ Combobox (both fields)
  â–¡ Move Description to position 1, increase to 6 rows, auto-focus
  â–¡ Merge "Adhesive Type" + "Product Name" into single "Product / Adhesive Used" combobox
  â–¡ Move Photo Upload to Zone 1 (after Product field)
  â–¡ Wrap remaining fields (Failure Mode, Time to Failure, Industry, Surface Prep,
    Environment, Production Impact, Additional Context) in ExpandableSection
  â–¡ Make Failure Mode optional (remove required validation)
  â–¡ Add helper text under Failure Mode cards
  â–¡ Ensure Zone 2 collapsed by default, expand state persisted
  â–¡ Verify localStorage form persistence still works with new layout
  â–¡ Verify auth gate flow still works (form save â†’ modal â†’ restore â†’ auto-submit)

Phase 3: Spec Engine Form
  â–¡ Replace substrate select â†’ Combobox (both fields)
  â–¡ Move Product Considered to Zone 1
  â–¡ Add new fields: Production Volume, Application Method, Required Fixture Time
  â–¡ Wrap all fields except substrates and product in ExpandableSection
  â–¡ Ensure Zone 2 collapsed by default
  â–¡ Verify localStorage persistence and auth gate

Phase 4: Backend
  â–¡ Add new substrate aliases to normalizer dictionary
  â–¡ Add Production Volume, Application Method, Required Fixture Time to spec request schema
  â–¡ Include new spec fields in AI prompt context
  â–¡ Test: free-form substrate input â†’ normalizer â†’ correct canonical key

Phase 5: Validation
  â–¡ Run TC-3.1, TC-3.2, TC-4.1, TC-4.2 (updated forms render and submit correctly)
  â–¡ Run TC-47.1, TC-47.3 (auth gate flow with new form layout)
  â–¡ Test: exotic substrate free-form â†’ analysis completes with lower confidence
  â–¡ Test: Zone 2 collapsed, submit â†’ all Zone 2 values included in payload
  â–¡ Test: photo upload â†’ visual analysis section appears in results
  â–¡ Test: mobile layout â€” substrates stack, photo zone works, expand/collapse works
```

---

**END OF FORM UX IMPROVEMENT SPEC**

---

