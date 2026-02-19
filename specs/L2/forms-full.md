# Form Specifications — L2 Full Detail

> Extracted from gravix-final-prd.md Part VI. All form field expansions and UX improvements.

# PART VI: FORM SPECIFICATIONS

> **Source documents merged:** `gravix-form-fields-addendum.md` + `gravix-form-ux-addendum.md`
>
> These addenda define expanded form field options (load type, cure constraints, environment, surface prep, gap fill, application method) and UX improvements (combobox substrate input, expandable form layout). They modify the base Spec Engine and Failure Analysis forms defined in Parts IV and V.

## VI-A: FORM FIELD EXPANSION

**Priority:** HIGH â€” these fields carry the most analytical weight for AI quality. Constrained option lists produce worse AI output.

**Design Principle:** Every field that currently restricts input to a short single-select dropdown should be evaluated against this question: *Does a real manufacturing engineer's answer fit neatly into one of these options?* If no â€” expand the list, switch to multi-select, add conditional sub-fields, or accept free-form.

---

# TABLE OF CONTENTS

1. [Load Type â€” Multi-Select Expansion](#1-load-type--multi-select-expansion)
2. [Cure Constraints â€” Restructure](#2-cure-constraints--restructure)
3. [Environment â€” Expansion + Conditional Detail](#3-environment--expansion--conditional-detail)
4. [Surface Preparation â€” Multi-Select Expansion](#4-surface-preparation--multi-select-expansion)
5. [Gap Fill â€” Context Selector](#5-gap-fill--context-selector)
6. [Application Method â€” Additional Options](#6-application-method--additional-options)
7. [Required Fixture Time â€” Minor Addition](#7-required-fixture-time--minor-addition)
8. [Industry â€” Expanded List](#8-industry--expanded-list)
9. [Failure Mode â€” Tooltip Enhancement](#9-failure-mode--tooltip-enhancement)
10. [Shared Component: Conditional Sub-Field](#10-shared-component-conditional-sub-field)
11. [Implementation Checklist](#11-implementation-checklist)

---

# 1. LOAD TYPE â€” MULTI-SELECT EXPANSION

**Form:** Spec Engine (`/tool`) Zone 2 â€” also referenced in Failure Analysis description prompts

**Current:** Single-select dropdown, ~5 options (Shear, Peel, Tensile, Compression, Cleavage).

**Problem:** Real bonds see combined loads. An automotive structural bond sees shear + peel + vibration fatigue + CTE mismatch stress simultaneously. Single-select forces the engineer to pick one, losing critical context.

## Change: Single-Select Dropdown â†’ Multi-Select Chips

**Component type:** Multi-select chip bar (same component as Environment)

**Options (12):**

| Chip Label | Tooltip (on hover/long-press) | AI Context Sent |
|---|---|---|
| Shear | Lap shear, sliding forces parallel to bond plane | `load:shear` |
| Peel | T-peel, 90Â° peel, forces pulling bond apart at edge | `load:peel` |
| Tensile | Butt joint pull, forces perpendicular to bond plane | `load:tensile` |
| Compression | Forces pressing bonded parts together | `load:compression` |
| Cleavage | Uneven pull â€” one end of bond loaded, other end fixed | `load:cleavage` |
| Torsion | Rotational / twisting forces on the bond | `load:torsion` |
| Impact / Shock | Sudden high-energy loads, drop testing, crash loads | `load:impact` |
| Vibration / Fatigue | Cyclic loading over time, engine vibration, road vibration | `load:vibration_fatigue` |
| Creep (Sustained Static) | Constant load over weeks/months/years, dead weight, spring tension | `load:creep` |
| Thermal Stress (CTE Mismatch) | Stress from differential thermal expansion of dissimilar substrates | `load:thermal_stress_cte` |
| Flexural / Bending | Bending forces across the bond, panel flex | `load:flexural` |
| Not Sure | AI will assess based on application context | `load:unknown` |

**Visual spec:**
- Chip bar: horizontal wrap layout, gap-2, same styling as Environment chips
- Each chip: `bg-brand-800`, border `1px solid #374151`, rounded-full, px-3 py-1.5, 13px text
- Selected: `bg-accent-500/20`, border `1px solid #3B82F6`, `text-accent-400`
- Tooltip: 200ms delay, max-width 240px, `bg-brand-700`, 12px text, appears below chip on desktop, long-press on mobile
- "Not Sure" chip: if selected, all other chips deselect. If any other chip is selected, "Not Sure" deselects. Mutually exclusive with specific selections.
- Multiple selection: any combination except "Not Sure" with others. Common: Shear + Peel + Vibration (3 selected simultaneously).

**Label:** "What loads does the bond experience? (select all that apply)"

---

# 2. CURE CONSTRAINTS â€” RESTRUCTURE

**Form:** Spec Engine (`/tool`) Zone 2

**Current:** Single-select dropdown, ~3 options (Room temperature, Heat cure, UV cure). Conflates cure mechanism with process constraints.

**Problem:** The current field asks "how should the adhesive cure?" but what the engineer actually needs to express is "what can my production line accommodate?" An engineer who says "room temperature" might actually mean "we have an oven but can't exceed 80Â°C because the plastic warps." An engineer who says "UV cure" might mean "we have a UV station but the geometry has shadow areas." These distinctions change recommendations dramatically.

## Change: Replace Single Dropdown with Two Sub-Fields

### Sub-Field A: "What can your process accommodate?" â€” Multi-Select Chips

| Chip Label | Tooltip | AI Context |
|---|---|---|
| Room Temp Only | No ovens, IR heaters, or heat sources available | `cure_constraint:room_temp_only` |
| Oven / Heat Available | Batch or conveyor oven on the production line | `cure_constraint:oven_available` |
| UV / Light Station | UV lamp or LED cure station; specify if shadow areas exist | `cure_constraint:uv_available` |
| Induction Available | Induction heating for metal substrates | `cure_constraint:induction_available` |
| Moisture-Initiated OK | Ambient humidity or applied moisture can trigger cure | `cure_constraint:moisture_ok` |
| Anaerobic OK | Metal-to-metal sealed gap, no air exposure during cure | `cure_constraint:anaerobic_ok` |
| Two-Part Mixing OK | Metering/mixing equipment available or manual mixing acceptable | `cure_constraint:two_part_ok` |
| One-Part Only (No Mixing) | Cannot do metering or mixing â€” single-component adhesive required | `cure_constraint:one_part_only` |
| Primer / Activator OK | Extra surface treatment step before bonding is acceptable | `cure_constraint:primer_ok` |
| No Primer (One-Step Only) | Cannot add surface treatment steps â€” adhesive must bond as-is | `cure_constraint:no_primer` |

**Label:** "What can your production process accommodate? (select all that apply)"

**Behavior notes:**
- Some chips are mutually exclusive: "Room Temp Only" deselects "Oven / Heat Available" and vice versa. "Two-Part Mixing OK" deselects "One-Part Only" and vice versa. "Primer / Activator OK" deselects "No Primer" and vice versa.
- Other chips are freely combinable: "UV / Light Station" + "Primer / Activator OK" + "Two-Part Mixing OK" is a valid combination.
- If nothing selected, AI uses all constraint fields plus description to infer.

### Sub-Field B: "Max cure temperature (Â°C)" â€” Conditional Number Input

**Visibility:** Only appears when "Oven / Heat Available" chip is selected. Slides in with 200ms animation below the chip bar.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Max cure temperature your substrate/process can tolerate    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  Â°C                                           â”‚
â”‚  â”‚    80    â”‚                                                â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                â”‚
â”‚  Common: 60Â°C (most plastics), 80Â°C (engineering plastics),  â”‚
â”‚  120Â°C (metals/composites), 180Â°C (aerospace metals)         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Spec:**
- Input: number type, min 30, max 400, step 5, width 100px
- Helper text below: "Common: 60Â°C (most plastics), 80Â°C (engineering plastics), 120Â°C (metals/composites), 180Â°C (aerospace metals)"
- If user selects "Oven / Heat Available" but leaves max temp blank: AI receives `oven_available` without temperature limit â€” still useful context.

### Sub-Field C: "UV shadow areas?" â€” Conditional Toggle

**Visibility:** Only appears when "UV / Light Station" chip is selected.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Does the bond geometry have shadow areas UV light can't     â”‚
â”‚  reach?                                                      â”‚
â”‚  [ Yes â€” some areas won't get direct UV ]  [ No â€” full UV   â”‚
â”‚    exposure possible ]                                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Impact:** If shadow areas exist, AI recommends dual-cure adhesives (UV + secondary cure mechanism like moisture or heat) rather than UV-only adhesives. This is a critical distinction â€” a UV-only adhesive in a shadow area will never fully cure.

---

# 3. ENVIRONMENT â€” EXPANSION + CONDITIONAL DETAIL

**Form:** Both Failure Analysis (`/failure`) Zone 2 AND Spec Engine (`/tool`) Zone 2

**Current:** Multi-select chips, 6 options: High humidity, Chemical, UV/outdoor, Thermal cycling, Submersion, Vibration.

**Problem:** Missing critical environmental conditions that drive adhesive selection and failure analysis. "Chemical exposure" without knowing which chemical is nearly useless â€” IPA is benign, MEK destroys most adhesives. No cleanroom/outgassing option (critical for medical, aerospace, semiconductor). No sterilization option (critical for medical devices). No salt spray (critical for automotive, marine).

## Change: Expand to 15 Chips + Conditional Sub-Fields

**Options (15):**

| Chip Label | Tooltip | AI Context |
|---|---|---|
| High Humidity (>80% RH) | Sustained exposure to high relative humidity | `env:high_humidity` |
| Submersion / Water Contact | Partial or full water immersion, water spray, condensation cycling | `env:submersion` |
| Salt Spray / Marine | Salt fog, coastal atmosphere, de-icing salt, per ASTM B117 | `env:salt_spray` |
| Chemical Exposure | Solvents, fuels, oils, cleaning agents â€” specify below | `env:chemical` |
| UV / Outdoor Weathering | Sunlight, rain, temperature swings, per ASTM G154/G155 | `env:uv_outdoor` |
| High Temperature (Steady) | Continuous operation above 80Â°C â€” specify in Temperature Range | `env:high_temp_steady` |
| Low Temperature (Steady) | Continuous operation below -20Â°C â€” specify in Temperature Range | `env:low_temp_steady` |
| Thermal Cycling | Repeated hot-cold cycles, specify range in Temperature Range | `env:thermal_cycling` |
| Vibration / Dynamic | Engine vibration, road loads, machinery vibration | `env:vibration` |
| Cleanroom / Low Outgassing | Restricted outgassing per NASA ASTM E595 or ISO 14644 cleanroom | `env:cleanroom_low_outgassing` |
| Sterilization Required | Bond must survive sterilization cycles â€” specify method below | `env:sterilization` |
| Vacuum / Low Pressure | Space, high altitude, or vacuum chamber exposure | `env:vacuum` |
| Radiation Exposure | Gamma, X-ray, UV sterilization, or nuclear environment | `env:radiation` |
| Food Contact / FDA | Must comply with FDA 21 CFR or EU 10/2011 food contact regulations | `env:food_contact` |
| Electrical Insulation | Bond must provide or maintain electrical isolation | `env:electrical_insulation` |

### Conditional Sub-Field: Chemical Exposure Detail

**Visibility:** Appears when "Chemical Exposure" chip is selected.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Which chemicals? (select all that apply)                    â”‚
â”‚  [Motor oil] [Hydraulic fluid] [Brake fluid] [Coolant/      â”‚
â”‚  glycol] [Gasoline/diesel] [Jet fuel] [IPA] [Acetone]       â”‚
â”‚  [MEK] [Toluene] [Bleach/NaOCl] [Acids] [Bases/Caustics]   â”‚
â”‚  [Cleaning agents]                                           â”‚
â”‚                                                              â”‚
â”‚  Other chemicals: [________________________________]         â”‚
â”‚  e.g., hydrazine, Skydrol, specific customer fluids          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Chemical chip options (14 + free-form):**

| Chip | AI Context |
|---|---|
| Motor Oil | `chem:motor_oil` |
| Hydraulic Fluid | `chem:hydraulic_fluid` |
| Brake Fluid (DOT 3/4) | `chem:brake_fluid` |
| Coolant / Glycol | `chem:coolant_glycol` |
| Gasoline / Diesel | `chem:fuel_hydrocarbon` |
| Jet Fuel (Jet-A, JP-8) | `chem:jet_fuel` |
| IPA (Isopropanol) | `chem:ipa` |
| Acetone | `chem:acetone` |
| MEK | `chem:mek` |
| Toluene / Xylene | `chem:aromatic_solvent` |
| Bleach / NaOCl | `chem:bleach` |
| Acids (specify below) | `chem:acid` |
| Bases / Caustics | `chem:caustic` |
| Cleaning Agents | `chem:cleaning_agents` |

**+ "Other chemicals" free-form text input** â€” always visible at bottom of chemical chip section. Placeholder: "e.g., Skydrol, hydrazine, customer-specific fluids."

### Conditional Sub-Field: Sterilization Method

**Visibility:** Appears when "Sterilization Required" chip is selected.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Sterilization method (select all that apply)                â”‚
â”‚  [Autoclave (steam 121Â°C+)] [EtO (ethylene oxide)]          â”‚
â”‚  [Gamma radiation] [E-beam] [Hydrogen peroxide plasma]      â”‚
â”‚  [Dry heat]                                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

| Chip | AI Context | Why It Matters |
|---|---|---|
| Autoclave (steam 121-134Â°C) | `sterilization:autoclave` | High temp + moisture + pressure â€” eliminates many adhesives |
| EtO (ethylene oxide) | `sterilization:eto` | Chemical attack â€” some adhesives absorb EtO and outgas later |
| Gamma Radiation | `sterilization:gamma` | Radiation degrades some polymers; dose matters (25-50 kGy typical) |
| E-beam | `sterilization:ebeam` | Similar to gamma but higher dose rate, different degradation profile |
| Hydrogen Peroxide Plasma | `sterilization:h2o2_plasma` | Oxidative â€” affects some silicones and acrylics |
| Dry Heat (160-180Â°C) | `sterilization:dry_heat` | Extreme temperature â€” limits adhesive choices severely |

---

# 4. SURFACE PREPARATION â€” MULTI-SELECT EXPANSION

**Form:** Failure Analysis (`/failure`) Zone 2

**Current:** Single-select dropdown, probably ~5 options.

**Problem:** Real processes have multiple prep steps in sequence. An aerospace bond: solvent degrease â†’ abrade â†’ primer â†’ dry. A quick production line: IPA wipe only. The AI needs to know ALL steps to assess where prep went wrong. Single-select loses the sequence.

## Change: Single-Select Dropdown â†’ Multi-Select Chips + Optional Detail

**Options (14):**

| Chip Label | Tooltip | AI Context |
|---|---|---|
| Solvent Wipe (IPA) | Isopropanol cleaning | `prep:ipa_wipe` |
| Solvent Wipe (Acetone) | Acetone degreasing | `prep:acetone_wipe` |
| Solvent Wipe (MEK) | Methyl ethyl ketone cleaning | `prep:mek_wipe` |
| Abrasion (Sandpaper) | Manual scuffing with sandpaper, Scotch-Brite, or similar | `prep:abrasion_manual` |
| Grit Blast (Media Blast) | Aluminum oxide, glass bead, or other media blasting | `prep:grit_blast` |
| Plasma Treatment | Atmospheric or vacuum plasma surface activation | `prep:plasma` |
| Corona Treatment | Corona discharge surface treatment (typically for films/plastics) | `prep:corona` |
| Flame Treatment | Brief flame exposure for surface activation (typically polyolefins) | `prep:flame` |
| Chemical Etch | Acid etch, chromic acid anodize, FPL etch, phosphoric acid anodize | `prep:chemical_etch` |
| Primer Applied | Separate primer/activator applied before adhesive | `prep:primer` |
| Anodize / Conversion Coat | Anodizing, chromate conversion, phosphate conversion | `prep:anodize_conversion` |
| No Preparation | Bonded as-received, no cleaning or treatment | `prep:none` |
| Unknown / Not Documented | Prep steps not recorded or unknown | `prep:unknown` |
| Other | Specify in text field below | `prep:other` |

**Label:** "What surface preparation was done? (select all steps, in any order)"

**Optional detail text input:**
Always visible below chips. Placeholder: "Optional: describe prep sequence, abrasive grit, primer product, dwell time, etc."
This catches details like "P320 sandpaper" or "3M AC-130 primer, 30 min flash-off" that chips can't express.

**Behavior:**
- "No Preparation" and "Unknown" are mutually exclusive with all other chips (selecting either deselects all others, and vice versa).
- All other chips are freely combinable.
- Common multi-select: Solvent Wipe (IPA) + Abrasion (Sandpaper) + Primer Applied (3 steps).

---

# 5. GAP FILL â€” CONTEXT SELECTOR

**Form:** Spec Engine (`/tool`) Zone 2

**Current:** Bare number input (mm).

**Problem:** Engineers think about gap fill differently depending on the application. A controlled aerospace bondline at 0.2mm, an automotive panel gap at 1-3mm, and a construction cavity fill at 15mm require completely different adhesive rheologies and chemistries. A bare number loses the context.

## Change: Add Context Radio Selector Above Number Input

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Bond gap characteristics                                    â”‚
â”‚                                                              â”‚
â”‚  ( ) Controlled bondline â€” shims, spacers, or fixtures       â”‚
â”‚      maintain precise gap                                    â”‚
â”‚  ( ) Variable gap â€” irregular surfaces, some areas thicker   â”‚
â”‚      than others                                             â”‚
â”‚  ( ) Zero gap â€” press fit, interference fit, threaded        â”‚
â”‚  ( ) Large cavity â€” filling a void or potting (>5mm)         â”‚
â”‚  ( ) Not applicable / unknown                                â”‚
â”‚                                                              â”‚
â”‚  Gap dimension (mm): [______]                                â”‚
â”‚  If variable, enter the maximum expected gap                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Options (single-select radio):**

| Option | AI Context | Impact |
|---|---|---|
| Controlled bondline | `gap_type:controlled` | AI recommends adhesives with specific rheology for bondline control, may suggest film adhesives |
| Variable gap | `gap_type:variable` | AI recommends gap-filling pastes, thixotropic adhesives, may flag risk of starved bondlines |
| Zero gap | `gap_type:zero` | AI recommends low-viscosity wicking adhesives, anaerobics, retaining compounds |
| Large cavity (>5mm) | `gap_type:cavity_fill` | AI recommends potting compounds, foam adhesives, or multi-step filling |
| Not applicable / unknown | `gap_type:unknown` | AI infers from other fields |

**Number input:** Same as current, but helper text updates based on radio selection:
- Controlled: "Target bondline thickness (mm), e.g., 0.15, 0.25, 0.5"
- Variable: "Maximum expected gap (mm)"
- Zero: input hidden (not applicable)
- Large cavity: "Cavity depth (mm), e.g., 10, 25, 50"
- Not applicable: input visible with generic placeholder "Gap in mm, if known"

---

# 6. APPLICATION METHOD â€” ADDITIONAL OPTIONS

**Form:** Spec Engine (`/tool`) Zone 2

**Current:** Single-select dropdown, 7 options: Manual (syringe/gun), Manual (brush/spatula), Automated dispense, Spray, Film/tape, Jetting, Screen print.

**Problem:** Missing 3 common industrial methods. Still fine as single-select since an application typically uses one method.

## Change: Add 3 Options

ADD to existing dropdown:

| New Option | Position | AI Context |
|---|---|---|
| Roller Coat | After Spray | `method:roller_coat` |
| Robotic Bead / Swirl | After Automated Dispense | `method:robotic_bead` |
| Pre-Applied (Microencapsulated) | After Film/Tape | `method:pre_applied` |

**Updated full option list (10):**
1. Manual (Syringe / Cartridge Gun)
2. Manual (Brush / Spatula / Trowel)
3. Automated Dispense (Meter-Mix)
4. Robotic Bead / Swirl Pattern
5. Spray
6. Roller Coat
7. Film / Tape
8. Pre-Applied (Microencapsulated)
9. Jetting
10. Screen Print

**No other structural changes.** Single-select dropdown is correct for this field.

---

# 7. REQUIRED FIXTURE TIME â€” MINOR ADDITION

**Form:** Spec Engine (`/tool`) Zone 2

**Current:** Dropdown with: <1 min, 1-5 min, 5-30 min, 30 min-2 hrs, >2 hrs, Not critical.

## Change: Add One Option at Top

ADD as first option:

| New Option | Position | AI Context |
|---|---|---|
| Instant / Contact Bond | First (before <1 min) | `fixture:instant_contact` |

This covers contact adhesives, pressure-sensitive adhesives, and instant-bond cyanoacrylates used in rubber-to-metal, gasket bonding, and label/tape applications where parts bond on contact with no fixture period.

**Updated full option list (7):**
1. Instant / Contact Bond (zero fixture)
2. < 1 minute
3. 1-5 minutes
4. 5-30 minutes
5. 30 minutes - 2 hours
6. > 2 hours acceptable
7. Not critical

---

# 8. INDUSTRY â€” EXPANDED LIST

**Form:** Failure Analysis (`/failure`) Zone 2

**Current:** Probably a short dropdown (~6 options).

**Problem:** Missing key verticals and missing the OEM vs supplier distinction that drives spec requirements (Ford WSS-M specs, VW TL specs, etc. only apply if you're in their supply chain).

## Change: Expand to 15 Options

| Option | AI Context | Why Distinct |
|---|---|---|
| Automotive â€” OEM | `industry:auto_oem` | OEM specs (Ford, GM, VW, Toyota) drive adhesive selection |
| Automotive â€” Tier 1/2 Supplier | `industry:auto_tier_supplier` | Must meet OEM specs but works within process constraints |
| Automotive â€” Aftermarket | `industry:auto_aftermarket` | Less regulated, different failure profiles |
| Aerospace â€” Commercial | `industry:aero_commercial` | FAA/EASA certification, ASTM D1002/D3163, Nadcap |
| Aerospace â€” Defense / Military | `industry:aero_defense` | MIL-specs, classified processes, extreme environments |
| Medical Device | `industry:medical_device` | FDA, ISO 13485, biocompatibility, sterilization survival |
| Electronics / Semiconductor | `industry:electronics` | Outgassing, thermal management, CTE matching, cleanroom |
| Construction / Building | `industry:construction` | Large gaps, weathering, low-skill application |
| Marine | `industry:marine` | Salt water, constant submersion, biofouling |
| Rail / Transit | `industry:rail_transit` | Vibration, fire resistance (EN 45545), long service life |
| Energy (Wind / Solar) | `industry:energy_renewables` | Outdoor weathering, 20-30 year life, large structures |
| Energy (Oil & Gas) | `industry:energy_oil_gas` | Extreme chemicals, high temp, high pressure |
| Consumer Products | `industry:consumer` | Aesthetics, cost sensitivity, mass production |
| Packaging | `industry:packaging` | High speed, food safety, recyclability |
| Other / General Manufacturing | `industry:other` | Catch-all for niche industries |

**Single-select dropdown.** Engineers work in one industry at a time.

---

# 9. FAILURE MODE â€” TOOLTIP ENHANCEMENT

**Form:** Failure Analysis (`/failure`) Zone 2

**Current (per form UX addendum):** Visual cards with diagrams, NOT required, helper text: "Not sure? Leave blank."

**No structural change.** The cards and optional behavior are correct. But add richer tooltips/descriptions to help engineers self-identify:

| Card | Current Label | Enhanced Description (shown below diagram) |
|---|---|---|
| Adhesive | Adhesive Failure | "Clean separation â€” adhesive peeled off one surface entirely. Little or no residue on one side." |
| Cohesive | Cohesive Failure | "Adhesive itself tore apart â€” residue on BOTH surfaces. The adhesive was weaker than its bond to either surface." |
| Mixed | Mixed Mode | "Combination â€” some areas show clean separation, other areas show torn adhesive. Inconsistent bond quality." |
| Substrate | Substrate Failure | "The substrate broke, not the bond â€” adhesive held but the material around it cracked or delaminated." |

Also add a fifth card:

| Card | Label | Description | AI Context |
|---|---|---|---|
| Unknown / Visual | Can't Determine | "Not sure from visual inspection. Upload photos and our AI will help identify the failure mode." | `failure_mode:unknown_visual` |

This fifth card explicitly signals that the user wants AI assistance identifying the failure mode, distinct from simply leaving the field blank (which means "I didn't bother selecting").

---

# 10. SHARED COMPONENT: CONDITIONAL SUB-FIELD

Several fields above use conditional sub-fields (max cure temp, UV shadow areas, chemical detail, sterilization method). These should share a consistent pattern.

## ConditionalSubField Component

```typescript
interface ConditionalSubFieldProps {
  parentChipValue: string;          // Which chip selection triggers this
  visible: boolean;                 // Controlled by parent chip state
  children: React.ReactNode;        // Inner content (chips, input, etc.)
  label?: string;                   // Optional sub-field label
}
```

**Visual behavior:**
- **Hidden â†’ Visible:** 200ms slide-down animation, height from 0 to auto. Opacity 0 â†’ 1.
- **Visible â†’ Hidden:** 200ms slide-up. Values NOT cleared on hide (user might re-select the parent chip).
- **Indentation:** sub-field content indented 16px from parent chip bar, left border `2px solid #1F2937` to visually nest.
- **Background:** `bg-brand-900/50` subtle differentiation from parent section.

**Example render (Chemical Exposure selected):**

```
â”‚  Environment (select all that apply)                         â”‚
â”‚  [High humidity] [âœ“ Chemical Exposure] [UV/outdoor] ...      â”‚
â”‚                                                              â”‚
â”‚  â”Š  Which chemicals? (select all that apply)                â”‚
â”‚  â”Š  [Motor oil] [âœ“ Brake fluid] [MEK] [Jet fuel] ...       â”‚
â”‚  â”Š                                                          â”‚
â”‚  â”Š  Other chemicals: [Skydrol hydraulic fluid         ]     â”‚
â”‚                                                              â”‚
```

---

# 11. IMPLEMENTATION CHECKLIST

```
Phase 1: Shared Components
  â–¡ Build ConditionalSubField component (slide animation, indented, values preserved on hide)
  â–¡ Verify multi-select chip component handles mutual exclusion rules
    (e.g., "Not Sure" deselects all others, "Room Temp Only" â†” "Oven Available")

Phase 2: Spec Engine Form â€” Zone 2 Field Updates
  â–¡ Load Type: replace single-select dropdown â†’ multi-select chips (12 options)
  â–¡ Cure Constraints: replace single dropdown with:
    - Sub-field A: multi-select chips (10 process capability options)
    - Sub-field B: conditional max temp input (appears when "Oven" selected)
    - Sub-field C: conditional UV shadow toggle (appears when "UV" selected)
  â–¡ Environment: expand from 6 â†’ 15 chips
    - Add conditional chemical detail (14 chemical chips + free-form text)
    - Add conditional sterilization method (6 chips)
  â–¡ Gap Fill: add context radio selector above existing number input (5 options)
    - Number input helper text updates based on radio selection
    - Number input hides when "Zero gap" selected
  â–¡ Application Method: add 3 options to dropdown (Roller Coat, Robotic Bead, Pre-Applied)
  â–¡ Required Fixture Time: add "Instant / Contact Bond" as first dropdown option
  â–¡ Verify Zone 2 expand/collapse still works with taller content
  â–¡ Verify all new fields included in form submission payload
  â–¡ Verify localStorage persistence covers all new chip selections and sub-fields

Phase 3: Failure Analysis Form â€” Zone 2 Field Updates
  â–¡ Surface Preparation: replace single-select â†’ multi-select chips (14 options)
    - Add optional detail text input below chips
    - Implement mutual exclusion: "No Preparation" / "Unknown" deselect all others
  â–¡ Environment: same 15-chip expansion as spec form (shared component)
    - Same conditional sub-fields (chemical detail, sterilization method)
  â–¡ Industry: expand dropdown to 15 options with OEM/supplier distinction
  â–¡ Failure Mode: add "Unknown / Visual" as 5th card
    - Add enhanced descriptions below each diagram
  â–¡ Verify Zone 2 expand/collapse works with taller content
  â–¡ Verify all new fields included in submission payload
  â–¡ Verify localStorage persistence

Phase 4: Backend
  â–¡ Update spec engine request schema to accept:
    - load_types: string[] (was load_type: string)
    - cure_constraints: string[] (was cure_constraint: string)
    - max_cure_temp_c: number | null (new)
    - uv_shadow_areas: boolean | null (new)
    - environment: string[] (expanded options)
    - chemical_exposure_detail: string[] | null (new)
    - sterilization_methods: string[] | null (new)
    - gap_type: string | null (new, alongside existing gap_mm)
    - application_method: string (expanded options)
    - fixture_time: string (new option added)
  â–¡ Update failure analysis request schema to accept:
    - surface_preparation: string[] (was surface_prep: string)
    - surface_prep_detail: string | null (new)
    - environment: string[] (expanded options)
    - chemical_exposure_detail: string[] | null (new)
    - sterilization_methods: string[] | null (new)
    - industry: string (expanded options)
    - failure_mode: string (new "unknown_visual" option)
  â–¡ Update AI prompt templates to include all new fields as structured context
    - Multi-select fields formatted as: "Load types: shear, peel, vibration/fatigue"
    - Conditional sub-fields included when present
    - Chemical detail formatted as: "Chemical exposure: brake fluid (DOT 3/4), MEK"
  â–¡ Add normalizer mappings for new environment/chemical/sterilization values
  â–¡ Test: all new fields pass through to AI, results reference them

Phase 5: Validation
  â–¡ Verify all existing TC-3.x and TC-4.x tests still pass (modified forms)
  â–¡ Run TC-57.11 (spec new fields) â€” update to include load type, cure constraints
  â–¡ Run TC-57.4 (Zone 2 values submit when collapsed) â€” verify expanded fields submit
  â–¡ Run TC-47.1, TC-47.3 (auth gate) â€” verify new fields persist through auth
  â–¡ Test: select 4 load types + 3 environment chips + cure constraints with max temp
    â†’ analysis results reference all inputs
  â–¡ Test: chemical exposure detail "Skydrol" â†’ AI warns about specific Skydrol compatibility
  â–¡ Test: sterilization "Autoclave" selected â†’ AI eliminates non-autoclave-safe adhesives
  â–¡ Test: gap type "Zero gap" â†’ number input hidden, AI recommends wicking/anaerobic adhesives
  â–¡ Test: mobile layout â€” chip bars wrap correctly, conditional sub-fields accessible
```

---

# FIELD CHANGE SUMMARY

| Field | Form | Was | Now | Options |
|-------|------|-----|-----|---------|
| **Load Type** | Spec | Single-select, ~5 | Multi-select chips | 12 |
| **Cure Constraints** | Spec | Single-select, ~3 | Multi-select chips + conditional max temp + conditional UV shadow | 10 chips + 2 sub-fields |
| **Environment** | Both | Multi-select, 6 | Multi-select, 15 + conditional chemical detail + conditional sterilization | 15 chips + 14 chemical chips + 6 sterilization chips + free-form |
| **Surface Preparation** | Failure | Single-select, ~5 | Multi-select chips + optional detail text | 14 + free-form |
| **Gap Fill** | Spec | Number input | Context radio (5) + conditional number input | 5 radios + number |
| **Application Method** | Spec | Single-select, 7 | Single-select, 10 | +3 options |
| **Fixture Time** | Spec | Single-select, 6 | Single-select, 7 | +1 option |
| **Industry** | Failure | Single-select, ~6 | Single-select, 15 | +9 options |
| **Failure Mode** | Failure | 4 visual cards (optional) | 5 visual cards (optional) + enhanced descriptions | +1 card + descriptions |

**Fields NOT changed (confirmed fine):** Product / Adhesive Used, Product Considered, Production Volume, Time to Failure, Required Strength, Additional Context, Temperature Range.

---

**END OF FORM FIELD EXPANSION SPEC**


---

## VI-B: FORM UX IMPROVEMENTS (Substrate Combobox, Layout Restructure)

**Priority:** HIGH â€” these changes directly affect signup conversion and analysis quality.

---

# TABLE OF CONTENTS

1. [Substrate Input â€” Combobox Replacement](#1-substrate-input--combobox-replacement)
2. [Expanded Substrate List](#2-expanded-substrate-list)
3. [Failure Analysis Form â€” Layout Restructure](#3-failure-analysis-form--layout-restructure)
4. [Spec Engine Form â€” Layout Restructure](#4-spec-engine-form--layout-restructure)
5. [Shared Component Specs](#5-shared-component-specs)
6. [Backend Normalizer Notes](#6-backend-normalizer-notes)

---

# 1. SUBSTRATE INPUT â€” COMBOBOX REPLACEMENT

## Problem

Current substrate fields are typeahead-select components bound to a closed list of 24 materials. An engineer typing "Noryl GFN2", "7075-T6", "Viton", "FR-4", or "Delrin" gets zero matches. They either pick a wrong generic, lose specificity, or abandon the form.

## Solution

Replace both Substrate 1 and Substrate 2 inputs with a **combobox** (typeahead with free-form fallback). The predefined list becomes suggestions, not a gate.

## Combobox Behavior â€” Three Modes

**Mode 1: Matched suggestion**
```
User types: "Alum"
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Aluminum (Generic)                   â”‚
â”‚ Aluminum 6061-T6                     â”‚
â”‚ Aluminum 2024-T3                     â”‚
â”‚ Aluminum 5052-H32                    â”‚
â”‚ Aluminum 7075-T6                     â”‚
â”‚ Aluminum (Anodized)                  â”‚
â”‚ Aluminum (Cast / A356)               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```
User picks "Aluminum 6061-T6" â†’ field value: `Aluminum 6061-T6`. Normalizer maps to `aluminum_6061`.

**Mode 2: No match â€” free-form accepted**
```
User types: "Noryl GFN2"
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ No exact match                       â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€     â”‚
â”‚ âœ“ Use "Noryl GFN2" as entered       â”‚
â”‚                                      â”‚
â”‚ Similar:                             â”‚
â”‚   Nylon 6/6                          â”‚
â”‚   Polycarbonate (PC)                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```
User either clicks "Use as entered" or just presses Enter/Tab â†’ field value: `Noryl GFN2`. Normalizer handles server-side mapping (Noryl â†’ PPO/PS blend). If normalizer can't map it, AI receives the raw string and works with it.

**Mode 3: Vague input â€” accepted with note**
```
User types: "the bracket part"
â†’ Field accepts it. No error. No validation block.
â†’ AI receives "the bracket part" as substrate, produces lower-confidence result,
   and the response will note: "Substrate not recognized as a specific material.
   For better results, specify the material (e.g., 'Mild Steel', 'ABS Plastic')."
```

## Combobox Component Spec

```
â”Œâ”€ Substrate 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [icon: ðŸ”] Aluminum 60                            [âœ•]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  METALS                                                â”‚
â”‚    Aluminum 6061-T6                                    â”‚
â”‚    Aluminum 7075-T6                                    â”‚
â”‚                                                        â”‚
â”‚  â”€â”€ or use your exact text â”€â”€                          â”‚
â”‚    âœ“ Use "Aluminum 60" as entered                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Visual specs:**
- Input: 44px height, `bg-brand-900`, border `1px solid #374151`, rounded, 14px text
- Focus: border `2px solid #3B82F6`
- Dropdown: `bg-brand-800`, border `1px solid #374151`, rounded-b-lg, max-height 320px, overflow-y auto, shadow-lg
- Category headers: 11px, uppercase, `text-tertiary`, tracking-wider, px-3 pt-3 pb-1, non-selectable
- Suggestion items: 14px, `text-secondary`, px-3 py-2, hover: `bg-brand-700`, cursor-pointer
- "Use as entered" row: `border-top 1px solid #1F2937`, 14px, `text-accent-500`, px-3 py-2.5. Always visible at bottom when input text doesn't exactly match any suggestion.
- "Similar" section: only shows when no exact match AND fuzzy matches exist. 13px, `text-tertiary` header, items indented.
- Clear button (âœ•): right side of input, 16px, `text-tertiary`, hover: `text-white`. Only visible when field has value.
- Keyboard: Arrow keys navigate suggestions. Enter selects highlighted or submits "as entered" if nothing highlighted. Escape closes dropdown. Tab accepts current value and moves to next field.

**Search/filter logic:**
- Case-insensitive prefix match on item name AND common aliases
- Fuzzy threshold: if input has â‰¥3 chars and no prefix match, show items where Levenshtein distance â‰¤ 3 OR the input is a substring of any alias
- Category grouping: always show grouped by category (Metals, Plastics, Elastomers, Composites, Ceramics/Glass, Other)
- Max visible: 8 items + "use as entered" row. If more matches, show top 8 by relevance.
- Recent selections: if user has prior analyses, pin their last 3 unique substrates at top under "Recent" category (stored in localStorage)

**Validation:**
- NONE on the substrate field. Any non-empty string is valid. The AI and backend normalizer handle whatever the user provides.
- Empty string: standard required-field validation ("Substrate is required") â€” only on submit, not on blur.

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

