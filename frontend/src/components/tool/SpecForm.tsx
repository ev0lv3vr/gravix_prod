'use client';

import { useState, useRef, useCallback } from 'react';
import { Combobox } from '@/components/ui/Combobox';
import { ExpandableSection } from '@/components/ui/ExpandableSection';
import { MultiSelectChips, type ChipOption } from '@/components/forms/MultiSelectChips';
import { ConditionalSubField } from '@/components/forms/ConditionalSubField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { specRequestSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import { SUBSTRATE_SUGGESTIONS } from '@/lib/substrate-suggestions';
import type { SuggestionCategory } from '@/lib/substrate-suggestions';
import { searchProducts, type ProductSpecification } from '@/lib/products';

// ─── Form Data Type ────────────────────────────────────────────
interface SpecFormData {
  substrateA: string;
  substrateB: string;
  productConsidered: string;
  loadType: string;          // kept for backward compat (unused by new fields)
  loadTypes: string[];       // multi-select load types
  environment: string[];
  chemicalExposureDetail: string[];
  chemicalExposureOther: string;
  sterilizationMethods: string[];
  tempMin: number;
  tempMax: number;
  cureConstraint: string;    // kept for backward compat
  cureConstraints: string[]; // multi-select cure constraints
  maxCureTempC: string;
  uvShadowAreas: string;     // 'yes' | 'no' | ''
  gapType: string;
  gapFill: string;
  additionalContext: string;
  productionVolume: string;
  applicationMethod: string;
  requiredFixtureTime: string;
}

interface SpecFormProps {
  onSubmit: (data: SpecFormData) => void;
  isLoading?: boolean;
}

// ─── Load Type Options (12) ────────────────────────────────────
const LOAD_TYPE_OPTIONS: ChipOption[] = [
  { value: 'shear', label: 'Shear', tooltip: 'Lap shear, sliding forces parallel to bond plane' },
  { value: 'peel', label: 'Peel', tooltip: 'T-peel, 90° peel, forces pulling bond apart at edge' },
  { value: 'tensile', label: 'Tensile', tooltip: 'Butt joint pull, forces perpendicular to bond plane' },
  { value: 'compression', label: 'Compression', tooltip: 'Forces pressing bonded parts together' },
  { value: 'cleavage', label: 'Cleavage', tooltip: 'Uneven pull — one end of bond loaded, other end fixed' },
  { value: 'torsion', label: 'Torsion', tooltip: 'Rotational / twisting forces on the bond' },
  { value: 'impact', label: 'Impact / Shock', tooltip: 'Sudden high-energy loads, drop testing, crash loads' },
  { value: 'vibration_fatigue', label: 'Vibration / Fatigue', tooltip: 'Cyclic loading over time, engine vibration, road vibration' },
  { value: 'creep', label: 'Creep (Sustained Static)', tooltip: 'Constant load over weeks/months/years, dead weight, spring tension' },
  { value: 'thermal_stress_cte', label: 'Thermal Stress (CTE Mismatch)', tooltip: 'Stress from differential thermal expansion of dissimilar substrates' },
  { value: 'flexural', label: 'Flexural / Bending', tooltip: 'Bending forces across the bond, panel flex' },
  { value: 'unknown', label: 'Not Sure', tooltip: 'AI will assess based on application context', exclusive: true },
];

// ─── Cure Constraint Options (10) ──────────────────────────────
const CURE_CONSTRAINT_OPTIONS: ChipOption[] = [
  { value: 'room_temp_only', label: 'Room Temp Only', tooltip: 'No ovens, IR heaters, or heat sources available', excludes: ['oven_available'] },
  { value: 'oven_available', label: 'Oven / Heat Available', tooltip: 'Batch or conveyor oven on the production line', excludes: ['room_temp_only'] },
  { value: 'uv_available', label: 'UV / Light Station', tooltip: 'UV lamp or LED cure station; specify if shadow areas exist' },
  { value: 'induction_available', label: 'Induction Available', tooltip: 'Induction heating for metal substrates' },
  { value: 'moisture_ok', label: 'Moisture-Initiated OK', tooltip: 'Ambient humidity or applied moisture can trigger cure' },
  { value: 'anaerobic_ok', label: 'Anaerobic OK', tooltip: 'Metal-to-metal sealed gap, no air exposure during cure' },
  { value: 'two_part_ok', label: 'Two-Part Mixing OK', tooltip: 'Metering/mixing equipment available or manual mixing acceptable', excludes: ['one_part_only'] },
  { value: 'one_part_only', label: 'One-Part Only (No Mixing)', tooltip: 'Cannot do metering or mixing — single-component adhesive required', excludes: ['two_part_ok'] },
  { value: 'primer_ok', label: 'Primer / Activator OK', tooltip: 'Extra surface treatment step before bonding is acceptable', excludes: ['no_primer'] },
  { value: 'no_primer', label: 'No Primer (One-Step Only)', tooltip: 'Cannot add surface treatment steps — adhesive must bond as-is', excludes: ['primer_ok'] },
];

// ─── Shared Options (imported from shared constants) ───────────
// Environment, Chemical, and Sterilization options are shared with Failure Analysis form
import { ENVIRONMENT_OPTIONS, CHEMICAL_OPTIONS, STERILIZATION_OPTIONS } from '@/lib/form-constants';

// ─── Gap Type Options ──────────────────────────────────────────
const GAP_TYPE_OPTIONS = [
  { value: 'controlled', label: 'Controlled bondline — shims, spacers, or fixtures maintain precise gap' },
  { value: 'variable', label: 'Variable gap — irregular surfaces, some areas thicker than others' },
  { value: 'zero', label: 'Zero gap — press fit, interference fit, threaded' },
  { value: 'cavity_fill', label: 'Large cavity — filling a void or potting (>5mm)' },
  { value: 'unknown', label: 'Not applicable / unknown' },
];

const GAP_HELPER_TEXT: Record<string, string> = {
  controlled: 'Target bondline thickness (mm), e.g., 0.15, 0.25, 0.5',
  variable: 'Maximum expected gap (mm)',
  cavity_fill: 'Cavity depth (mm), e.g., 10, 25, 50',
  unknown: 'Gap in mm, if known',
};

// ─── Application Method Options (10 total) ─────────────────────
const APPLICATION_METHOD_OPTIONS = [
  { value: 'manual_syringe', label: 'Manual (Syringe / Cartridge Gun)' },
  { value: 'manual_brush', label: 'Manual (Brush / Spatula / Trowel)' },
  { value: 'automated_dispense', label: 'Automated Dispense (Meter-Mix)' },
  { value: 'robotic_bead', label: 'Robotic Bead / Swirl Pattern' },
  { value: 'spray', label: 'Spray' },
  { value: 'roller_coat', label: 'Roller Coat' },
  { value: 'film_tape', label: 'Film / Tape' },
  { value: 'pre_applied', label: 'Pre-Applied (Microencapsulated)' },
  { value: 'jetting', label: 'Jetting' },
  { value: 'screen_print', label: 'Screen Print' },
];

// ─── Fixture Time Options (7 total, with new first option) ─────
const FIXTURE_TIME_OPTIONS = [
  { value: 'instant_contact', label: 'Instant / Contact Bond (zero fixture)' },
  { value: '<1min', label: '< 1 minute' },
  { value: '1-5min', label: '1-5 minutes' },
  { value: '5-30min', label: '5-30 minutes' },
  { value: '30min-2hr', label: '30 min - 2 hours' },
  { value: '>2hr', label: '> 2 hours acceptable' },
  { value: 'not_critical', label: 'Not critical' },
];

const PRODUCTION_VOLUME_OPTIONS = [
  { value: 'prototype', label: 'Prototype / R&D' },
  { value: '<100/day', label: '<100/day' },
  { value: '100-1000/day', label: '100-1,000/day' },
  { value: '1000-10000/day', label: '1,000-10,000/day' },
  { value: '>10000/day', label: '>10,000/day' },
];

// Product suggestions for the combobox
const PRODUCT_SUGGESTIONS: SuggestionCategory[] = [
  {
    category: 'Chemistry Types',
    items: [
      { name: 'Epoxy (2-part)', aliases: ['epoxy', 'two part epoxy', 'structural epoxy'] },
      { name: 'Cyanoacrylate (CA)', aliases: ['CA', 'super glue', 'instant adhesive'] },
      { name: 'Polyurethane (PU)', aliases: ['PU', 'urethane adhesive'] },
      { name: 'Acrylic (MMA)', aliases: ['MMA', 'methacrylate', 'structural acrylic'] },
      { name: 'Silicone', aliases: ['RTV', 'silicone sealant'] },
      { name: 'Anaerobic', aliases: ['threadlocker', 'retaining compound'] },
      { name: 'UV Cure', aliases: ['light cure', 'UV adhesive'] },
      { name: 'Hot Melt', aliases: ['hot glue', 'EVA hot melt'] },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────
export function SpecForm({ onSubmit, isLoading = false }: SpecFormProps) {
  const [formData, setFormData] = useState<SpecFormData>({
    substrateA: '',
    substrateB: '',
    productConsidered: '',
    loadType: '',
    loadTypes: [],
    environment: [],
    chemicalExposureDetail: [],
    chemicalExposureOther: '',
    sterilizationMethods: [],
    tempMin: -40,
    tempMax: 120,
    cureConstraint: '',
    cureConstraints: [],
    maxCureTempC: '',
    uvShadowAreas: '',
    gapType: '',
    gapFill: '',
    additionalContext: '',
    productionVolume: '',
    applicationMethod: '',
    requiredFixtureTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productSuggestions, setProductSuggestions] = useState<SuggestionCategory[]>(PRODUCT_SUGGESTIONS);
  const productSearchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleProductChange = useCallback((value: string) => {
    updateFieldDirect('productConsidered', value);

    if (productSearchTimeout.current) clearTimeout(productSearchTimeout.current);
    if (value.length >= 2) {
      productSearchTimeout.current = setTimeout(async () => {
        try {
          const results = await searchProducts(value);
          if (results.length > 0) {
            const tdsCategory: SuggestionCategory = {
              category: 'Products with TDS',
              items: results.map((p: ProductSpecification) => ({
                name: p.product_name + (p.manufacturer ? ` (${p.manufacturer})` : ''),
                aliases: [p.product_name, p.manufacturer || ''].filter(Boolean),
                hasTds: !!p.tds_file_url,
              })),
            };
            setProductSuggestions([tdsCategory, ...PRODUCT_SUGGESTIONS]);
          } else {
            setProductSuggestions(PRODUCT_SUGGESTIONS);
          }
        } catch {
          setProductSuggestions(PRODUCT_SUGGESTIONS);
        }
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = (): boolean => {
    try {
      specRequestSchema.parse({
        substrateA: formData.substrateA,
        substrateB: formData.substrateB,
        tempMin: formData.tempMin,
        tempMax: formData.tempMax,
        bondType: formData.loadTypes.length > 0 ? formData.loadTypes.join(',') : (formData.loadType || undefined),
        cureMethod: formData.cureConstraints.length > 0 ? formData.cureConstraints.join(',') : (formData.cureConstraint || undefined),
        gapSize: formData.gapFill || undefined,
        additionalContext: formData.additionalContext || undefined,
        productionVolume: formData.productionVolume || undefined,
        applicationMethod: formData.applicationMethod || undefined,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof SpecFormData>(key: K, value: SpecFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  // Non-hook version for useCallback usage
  const updateFieldDirect = (key: keyof SpecFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Specify a Material</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ═══════════════════ ZONE 1: Core Fields ═══════════════════ */}

        {/* 1. Substrate 1 + 2 — side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Combobox
            label="Substrate 1"
            placeholder="Search or type your own — e.g., Aluminum 6061, ABS"
            suggestions={SUBSTRATE_SUGGESTIONS}
            value={formData.substrateA}
            onChange={(v) => updateField('substrateA', v)}
            required
            autoFocus
            recentKey="gravix_recent_substrates_a"
            error={errors.substrateA}
            data-testid="substrate-a"
          />
          <Combobox
            label="Substrate 2"
            placeholder="Search or type — e.g., Steel, Polycarbonate"
            suggestions={SUBSTRATE_SUGGESTIONS}
            value={formData.substrateB}
            onChange={(v) => updateField('substrateB', v)}
            required
            recentKey="gravix_recent_substrates_b"
            error={errors.substrateB}
            data-testid="substrate-b"
          />
        </div>

        {/* 2. Product Considered — combobox with TDS search */}
        <Combobox
          label="Product Considered"
          placeholder="Search or type — e.g., Loctite 495, 3M DP420"
          suggestions={productSuggestions}
          value={formData.productConsidered}
          onChange={handleProductChange}
          recentKey="gravix_recent_products_spec"
          showTdsBadge
        />

        {/* ═══════════════════ ZONE 2: Expandable Detail ═══════════════════ */}
        <ExpandableSection
          label="Add requirements for a more precise specification (optional)"
          persistKey="gravix_spec_form_expanded"
        >
          {/* ─── Load Type — Multi-Select Chips ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              What loads does the bond experience? <span className="text-[#64748B] text-xs">(select all that apply)</span>
            </Label>
            <MultiSelectChips
              options={LOAD_TYPE_OPTIONS}
              selected={formData.loadTypes}
              onChange={(v) => updateField('loadTypes', v)}
            />
          </div>

          {/* ─── Cure Constraints — Multi-Select + Conditional Sub-Fields ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              What can your production process accommodate? <span className="text-[#64748B] text-xs">(select all that apply)</span>
            </Label>
            <MultiSelectChips
              options={CURE_CONSTRAINT_OPTIONS}
              selected={formData.cureConstraints}
              onChange={(v) => updateField('cureConstraints', v)}
            />

            {/* Sub-Field B: Max cure temperature — conditional on "Oven / Heat Available" */}
            <ConditionalSubField
              parentChipValue="oven_available"
              visible={formData.cureConstraints.includes('oven_available')}
              label="Max cure temperature your substrate/process can tolerate"
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={30}
                  max={400}
                  step={5}
                  value={formData.maxCureTempC}
                  onChange={(e) => updateField('maxCureTempC', e.target.value)}
                  placeholder="80"
                  className="h-11 bg-[#111827] border-[#374151] rounded text-sm w-[100px]"
                />
                <span className="text-[#94A3B8] text-sm">°C</span>
              </div>
              <p className="text-[#64748B] text-xs mt-1.5">
                Common: 60°C (most plastics), 80°C (engineering plastics), 120°C (metals/composites), 180°C (aerospace metals)
              </p>
            </ConditionalSubField>

            {/* Sub-Field C: UV shadow areas — conditional on "UV / Light Station" */}
            <ConditionalSubField
              parentChipValue="uv_available"
              visible={formData.cureConstraints.includes('uv_available')}
              label="Does the bond geometry have shadow areas UV light can't reach?"
            >
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField('uvShadowAreas', 'yes')}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                    formData.uvShadowAreas === 'yes'
                      ? 'bg-accent-500/20 border-[#3B82F6] text-accent-500'
                      : 'bg-brand-800 border-[#374151] text-[#94A3B8] hover:border-accent-500 hover:text-white'
                  }`}
                >
                  Yes — some areas won&apos;t get direct UV
                </button>
                <button
                  type="button"
                  onClick={() => updateField('uvShadowAreas', 'no')}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                    formData.uvShadowAreas === 'no'
                      ? 'bg-accent-500/20 border-[#3B82F6] text-accent-500'
                      : 'bg-brand-800 border-[#374151] text-[#94A3B8] hover:border-accent-500 hover:text-white'
                  }`}
                >
                  No — full UV exposure possible
                </button>
              </div>
            </ConditionalSubField>
          </div>

          {/* ─── Environment — 15 Chips + Conditional Sub-Fields ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              Environment <span className="text-[#64748B] text-xs">(select all that apply)</span>
            </Label>
            <MultiSelectChips
              options={ENVIRONMENT_OPTIONS}
              selected={formData.environment}
              onChange={(v) => updateField('environment', v)}
            />

            {/* Conditional: Chemical Exposure Detail */}
            <ConditionalSubField
              parentChipValue="chemical"
              visible={formData.environment.includes('chemical')}
              label="Which chemicals? (select all that apply)"
            >
              <MultiSelectChips
                options={CHEMICAL_OPTIONS}
                selected={formData.chemicalExposureDetail}
                onChange={(v) => updateField('chemicalExposureDetail', v)}
              />
              <div className="mt-3">
                <Input
                  type="text"
                  value={formData.chemicalExposureOther}
                  onChange={(e) => updateField('chemicalExposureOther', e.target.value)}
                  placeholder="e.g., Skydrol, hydrazine, customer-specific fluids"
                  className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
                />
                <p className="text-[#64748B] text-xs mt-1">Other chemicals not listed above</p>
              </div>
            </ConditionalSubField>

            {/* Conditional: Sterilization Method */}
            <ConditionalSubField
              parentChipValue="sterilization"
              visible={formData.environment.includes('sterilization')}
              label="Sterilization method (select all that apply)"
            >
              <MultiSelectChips
                options={STERILIZATION_OPTIONS}
                selected={formData.sterilizationMethods}
                onChange={(v) => updateField('sterilizationMethods', v)}
              />
            </ConditionalSubField>
          </div>

          {/* ─── Temperature Range ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Temperature Range (°C)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={formData.tempMin}
                onChange={(e) => updateField('tempMin', Number(e.target.value))}
                placeholder="-40"
                className="h-11 bg-[#111827] border-[#374151] rounded text-sm flex-1"
                data-testid="temp-min"
              />
              <span className="text-[#64748B]">to</span>
              <Input
                type="number"
                value={formData.tempMax}
                onChange={(e) => updateField('tempMax', Number(e.target.value))}
                placeholder="120"
                className="h-11 bg-[#111827] border-[#374151] rounded text-sm flex-1"
                data-testid="temp-max"
              />
            </div>
          </div>

          {/* ─── Gap Fill — Context Radio + Conditional Number Input ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Bond Gap Characteristics</Label>
            <div className="space-y-2">
              {GAP_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="gapType"
                    value={opt.value}
                    checked={formData.gapType === opt.value}
                    onChange={(e) => updateField('gapType', e.target.value)}
                    className="mt-1 accent-accent-500"
                  />
                  <span className={`text-sm ${
                    formData.gapType === opt.value ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'
                  } transition-colors`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {formData.gapType !== 'zero' && (
              <div className="mt-3">
                <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Gap Dimension (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.gapFill}
                  onChange={(e) => updateField('gapFill', e.target.value)}
                  placeholder={GAP_HELPER_TEXT[formData.gapType] || 'Maximum gap between substrates'}
                  className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
                />
                {formData.gapType && GAP_HELPER_TEXT[formData.gapType] && (
                  <p className="text-[#64748B] text-xs mt-1">{GAP_HELPER_TEXT[formData.gapType]}</p>
                )}
              </div>
            )}
          </div>

          {/* ─── Production Volume + Application Method — side by side ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Production Volume</Label>
              <Select value={formData.productionVolume} onValueChange={(v) => updateField('productionVolume', v)}>
                <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                  <SelectValue placeholder="Select volume" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTION_VOLUME_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Application Method</Label>
              <Select value={formData.applicationMethod} onValueChange={(v) => updateField('applicationMethod', v)}>
                <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_METHOD_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ─── Required Fixture Time ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Required Fixture Time</Label>
            <Select value={formData.requiredFixtureTime} onValueChange={(v) => updateField('requiredFixtureTime', v)}>
              <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                <SelectValue placeholder="Select fixture time" />
              </SelectTrigger>
              <SelectContent>
                {FIXTURE_TIME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ─── Additional Context ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Additional Context</Label>
            <Textarea
              value={formData.additionalContext}
              onChange={(e) => updateField('additionalContext', e.target.value)}
              placeholder="Special requirements, regulatory, application constraints…"
              rows={3}
              className="bg-[#111827] border-[#374151] rounded text-sm resize-none"
            />
          </div>
        </ExpandableSection>

        {/* ═══════════════════ Submit ═══════════════════ */}
        <Button
          type="submit"
          className="w-full h-12 bg-accent-500 hover:bg-accent-600 text-white text-base font-medium mt-8"
          disabled={isLoading}
          data-testid="analyze-submit"
        >
          {isLoading ? 'Generating…' : 'Generate Specification →'}
        </Button>
      </form>
    </div>
  );
}

export type { SpecFormData };
