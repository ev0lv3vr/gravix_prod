/**
 * Shared form field option constants used across both the Spec Engine
 * and Failure Analysis forms.
 *
 * Extracted from Sprint 1+2 SpecForm.tsx so Sprint 3 (Failure Analysis)
 * can reuse identical option arrays.
 */

import type { ChipOption } from '@/components/forms/MultiSelectChips';

// ─── Environment Options (15) ──────────────────────────────────
export const ENVIRONMENT_OPTIONS: ChipOption[] = [
  { value: 'high_humidity', label: 'High Humidity (>80% RH)', tooltip: 'Sustained exposure to high relative humidity' },
  { value: 'submersion', label: 'Submersion / Water Contact', tooltip: 'Partial or full water immersion, water spray, condensation cycling' },
  { value: 'salt_spray', label: 'Salt Spray / Marine', tooltip: 'Salt fog, coastal atmosphere, de-icing salt, per ASTM B117' },
  { value: 'chemical', label: 'Chemical Exposure', tooltip: 'Solvents, fuels, oils, cleaning agents — specify below' },
  { value: 'uv_outdoor', label: 'UV / Outdoor Weathering', tooltip: 'Sunlight, rain, temperature swings, per ASTM G154/G155' },
  { value: 'high_temp_steady', label: 'High Temperature (Steady)', tooltip: 'Continuous operation above 80°C — specify in Temperature Range' },
  { value: 'low_temp_steady', label: 'Low Temperature (Steady)', tooltip: 'Continuous operation below -20°C — specify in Temperature Range' },
  { value: 'thermal_cycling', label: 'Thermal Cycling', tooltip: 'Repeated hot-cold cycles, specify range in Temperature Range' },
  { value: 'vibration', label: 'Vibration / Dynamic', tooltip: 'Engine vibration, road loads, machinery vibration' },
  { value: 'cleanroom_low_outgassing', label: 'Cleanroom / Low Outgassing', tooltip: 'Restricted outgassing per NASA ASTM E595 or ISO 14644 cleanroom' },
  { value: 'sterilization', label: 'Sterilization Required', tooltip: 'Bond must survive sterilization cycles — specify method below' },
  { value: 'vacuum', label: 'Vacuum / Low Pressure', tooltip: 'Space, high altitude, or vacuum chamber exposure' },
  { value: 'radiation', label: 'Radiation Exposure', tooltip: 'Gamma, X-ray, UV sterilization, or nuclear environment' },
  { value: 'food_contact', label: 'Food Contact / FDA', tooltip: 'Must comply with FDA 21 CFR or EU 10/2011 food contact regulations' },
  { value: 'electrical_insulation', label: 'Electrical Insulation', tooltip: 'Bond must provide or maintain electrical isolation' },
  { value: 'standard_indoor', label: 'Standard Indoor', tooltip: 'Controlled indoor environment, no special exposures', exclusive: true },
];

// ─── Chemical Exposure Detail (14) ─────────────────────────────
export const CHEMICAL_OPTIONS: ChipOption[] = [
  { value: 'motor_oil', label: 'Motor Oil' },
  { value: 'hydraulic_fluid', label: 'Hydraulic Fluid' },
  { value: 'brake_fluid', label: 'Brake Fluid (DOT 3/4)' },
  { value: 'coolant_glycol', label: 'Coolant / Glycol' },
  { value: 'fuel_hydrocarbon', label: 'Gasoline / Diesel' },
  { value: 'jet_fuel', label: 'Jet Fuel (Jet-A, JP-8)' },
  { value: 'ipa', label: 'IPA (Isopropanol)' },
  { value: 'acetone', label: 'Acetone' },
  { value: 'mek', label: 'MEK' },
  { value: 'aromatic_solvent', label: 'Toluene / Xylene' },
  { value: 'bleach', label: 'Bleach / NaOCl' },
  { value: 'acid', label: 'Acids (specify below)' },
  { value: 'caustic', label: 'Bases / Caustics' },
  { value: 'cleaning_agents', label: 'Cleaning Agents' },
];

// ─── Sterilization Methods (6) ─────────────────────────────────
export const STERILIZATION_OPTIONS: ChipOption[] = [
  { value: 'autoclave', label: 'Autoclave (steam 121-134°C)', tooltip: 'High temp + moisture + pressure — eliminates many adhesives' },
  { value: 'eto', label: 'EtO (ethylene oxide)', tooltip: 'Chemical attack — some adhesives absorb EtO and outgas later' },
  { value: 'gamma', label: 'Gamma Radiation', tooltip: 'Radiation degrades some polymers; dose matters (25-50 kGy typical)' },
  { value: 'ebeam', label: 'E-beam', tooltip: 'Similar to gamma but higher dose rate, different degradation profile' },
  { value: 'h2o2_plasma', label: 'Hydrogen Peroxide Plasma', tooltip: 'Oxidative — affects some silicones and acrylics' },
  { value: 'dry_heat', label: 'Dry Heat (160-180°C)', tooltip: 'Extreme temperature — limits adhesive choices severely' },
];

// ─── Surface Preparation Options (14) — Failure Analysis ───────
export const SURFACE_PREP_OPTIONS: ChipOption[] = [
  { value: 'ipa_wipe', label: 'Solvent Wipe (IPA)', tooltip: 'Isopropanol cleaning' },
  { value: 'acetone_wipe', label: 'Solvent Wipe (Acetone)', tooltip: 'Acetone degreasing' },
  { value: 'mek_wipe', label: 'Solvent Wipe (MEK)', tooltip: 'Methyl ethyl ketone cleaning' },
  { value: 'abrasion_manual', label: 'Abrasion / Sanding', tooltip: 'Manual scuffing with sandpaper, Scotch-Brite, or similar' },
  { value: 'grit_blast', label: 'Grit Blast / Media Blast', tooltip: 'Aluminum oxide, glass bead, or other media blasting' },
  { value: 'plasma', label: 'Plasma Treatment', tooltip: 'Atmospheric or vacuum plasma surface activation' },
  { value: 'corona', label: 'Corona Treatment', tooltip: 'Corona discharge surface treatment (typically for films/plastics)' },
  { value: 'flame', label: 'Flame Treatment', tooltip: 'Brief flame exposure for surface activation (typically polyolefins)' },
  { value: 'chemical_etch', label: 'Chemical Etch', tooltip: 'Acid etch, chromic acid anodize, FPL etch, phosphoric acid anodize' },
  { value: 'primer', label: 'Primer Application', tooltip: 'Separate primer/activator applied before adhesive' },
  { value: 'adhesion_promoter', label: 'Adhesion Promoter / Coupling Agent', tooltip: 'Silane, titanate, or other coupling agent applied to substrate' },
  { value: 'laser_texturing', label: 'Laser Surface Texturing', tooltip: 'Laser ablation or texturing for surface profile modification' },
  { value: 'none', label: 'No Preparation (As Received)', tooltip: 'Bonded as-received, no cleaning or treatment', exclusive: true },
  { value: 'unknown', label: 'Unknown / Not Documented', tooltip: 'Prep steps not recorded or unknown', exclusive: true },
];

// ─── Industry Options (15) — Failure Analysis ──────────────────
export const INDUSTRY_OPTIONS = [
  { value: 'auto_oem', label: 'Automotive — OEM', tooltip: 'OEM specs (Ford, GM, VW, Toyota) drive adhesive selection' },
  { value: 'auto_tier_supplier', label: 'Automotive — Tier Supplier', tooltip: 'Must meet OEM specs but works within process constraints' },
  { value: 'aero_structural', label: 'Aerospace — Structural', tooltip: 'FAA/EASA certification, ASTM D1002/D3163, Nadcap' },
  { value: 'aero_interior', label: 'Aerospace — Interior', tooltip: 'FST requirements, lighter regulatory burden than structural' },
  { value: 'general_mfg', label: 'General Manufacturing', tooltip: 'Broad industrial bonding applications' },
  { value: 'electronics', label: 'Electronics / Semiconductor', tooltip: 'Outgassing, thermal management, CTE matching, cleanroom' },
  { value: 'medical_device', label: 'Medical Devices', tooltip: 'FDA, ISO 13485, biocompatibility, sterilization survival' },
  { value: 'packaging', label: 'Packaging / Converting', tooltip: 'High speed, food safety, recyclability' },
  { value: 'construction', label: 'Construction / Building', tooltip: 'Large gaps, weathering, low-skill application' },
  { value: 'marine', label: 'Marine', tooltip: 'Salt water, constant submersion, biofouling' },
  { value: 'energy_renewables', label: 'Renewable Energy (Wind/Solar)', tooltip: 'Outdoor weathering, 20-30 year life, large structures' },
  { value: 'consumer', label: 'Consumer Products', tooltip: 'Aesthetics, cost sensitivity, mass production' },
  { value: 'military_defense', label: 'Military / Defense', tooltip: 'MIL-specs, classified processes, extreme environments' },
  { value: 'food_beverage', label: 'Food & Beverage Processing', tooltip: 'Washdown resistance, FDA compliance, chemical exposure' },
  { value: 'other', label: 'Other', tooltip: 'Industry not listed — specify in additional context' },
];
