'use client';

import { useState, useRef, useCallback } from 'react';
import { Combobox } from '@/components/ui/Combobox';
import { ExpandableSection } from '@/components/ui/ExpandableSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { specRequestSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import { SUBSTRATE_SUGGESTIONS } from '@/lib/substrate-suggestions';
import type { SuggestionCategory } from '@/lib/substrate-suggestions';
import { searchProducts, type ProductSpecification } from '@/lib/products';

// Map the Zod schema to the internal form data structure
interface SpecFormData {
  substrateA: string;
  substrateB: string;
  productConsidered: string;
  loadType: string;
  environment: string[];
  tempMin: number;
  tempMax: number;
  cureConstraint: string;
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

const LOAD_TYPES = [
  { value: 'structural', label: 'Structural' },
  { value: 'semi-structural', label: 'Semi-structural' },
  { value: 'non-structural', label: 'Non-structural' },
  { value: 'sealing', label: 'Sealing' },
];

const CURE_CONSTRAINTS = [
  { value: 'room_temp', label: 'Room temp only' },
  { value: 'heat_available', label: 'Heat available' },
  { value: 'uv_available', label: 'UV available' },
  { value: 'fast_fixture', label: 'Fast fixture needed (<5 min)' },
];

const ENVIRONMENT_OPTIONS = [
  'High humidity',
  'Chemical exposure',
  'UV/outdoor',
  'Thermal cycling',
  'Submersion',
  'Vibration',
];

const PRODUCTION_VOLUME_OPTIONS = [
  { value: 'prototype', label: 'Prototype / R&D' },
  { value: '<100/day', label: '<100/day' },
  { value: '100-1000/day', label: '100-1,000/day' },
  { value: '1000-10000/day', label: '1,000-10,000/day' },
  { value: '>10000/day', label: '>10,000/day' },
];

const APPLICATION_METHOD_OPTIONS = [
  { value: 'manual_syringe', label: 'Manual (syringe/gun)' },
  { value: 'manual_brush', label: 'Manual (brush/spatula)' },
  { value: 'automated_dispense', label: 'Automated dispense' },
  { value: 'spray', label: 'Spray' },
  { value: 'film_tape', label: 'Film/tape' },
  { value: 'jetting', label: 'Jetting' },
  { value: 'screen_print', label: 'Screen print' },
];

const FIXTURE_TIME_OPTIONS = [
  { value: '<1min', label: '< 1 minute' },
  { value: '1-5min', label: '1-5 minutes' },
  { value: '5-30min', label: '5-30 minutes' },
  { value: '30min-2hr', label: '30 min - 2 hours' },
  { value: '>2hr', label: '> 2 hours acceptable' },
  { value: 'not_critical', label: 'Not critical' },
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

export function SpecForm({ onSubmit, isLoading = false }: SpecFormProps) {
  const [formData, setFormData] = useState<SpecFormData>({
    substrateA: '',
    substrateB: '',
    productConsidered: '',
    loadType: '',
    environment: [],
    tempMin: -40,
    tempMax: 120,
    cureConstraint: '',
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
        bondType: formData.loadType || undefined,
        cureMethod: formData.cureConstraint || undefined,
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

  const toggleEnvChip = (chip: string) => {
    if (formData.environment.includes(chip)) {
      updateField('environment', formData.environment.filter((v) => v !== chip));
    } else {
      updateField('environment', [...formData.environment, chip]);
    }
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
            placeholder="e.g., Aluminum 6061, ABS, Polycarbonate"
            suggestions={SUBSTRATE_SUGGESTIONS}
            value={formData.substrateA}
            onChange={(v) => updateField('substrateA', v)}
            required
            autoFocus
            recentKey="gravix_recent_substrates_a"
            error={errors.substrateA}
          />
          <Combobox
            label="Substrate 2"
            placeholder="Material bonded to Substrate 1"
            suggestions={SUBSTRATE_SUGGESTIONS}
            value={formData.substrateB}
            onChange={(v) => updateField('substrateB', v)}
            required
            recentKey="gravix_recent_substrates_b"
            error={errors.substrateB}
          />
        </div>

        {/* 2. Product Considered — combobox with TDS search */}
        <Combobox
          label="Product Considered"
          placeholder="e.g., Loctite 495, 3M DP420 — we'll check field performance"
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
          {/* Load Type + Cure Constraints — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Load Type</Label>
              <Select value={formData.loadType} onValueChange={(v) => updateField('loadType', v)}>
                <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                  <SelectValue placeholder="Select load type" />
                </SelectTrigger>
                <SelectContent>
                  {LOAD_TYPES.map((lt) => (
                    <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Cure Constraints</Label>
              <Select value={formData.cureConstraint} onValueChange={(v) => updateField('cureConstraint', v)}>
                <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                  <SelectValue placeholder="Select constraint" />
                </SelectTrigger>
                <SelectContent>
                  {CURE_CONSTRAINTS.map((cc) => (
                    <SelectItem key={cc.value} value={cc.value}>{cc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Environment — chips */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              Environment <span className="text-[#64748B] text-xs">(select all that apply)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {ENVIRONMENT_OPTIONS.map((env) => {
                const isSelected = formData.environment.includes(env);
                return (
                  <button
                    key={env}
                    type="button"
                    onClick={() => toggleEnvChip(env)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                      isSelected
                        ? 'bg-accent-500/15 border-accent-500 text-accent-500'
                        : 'bg-[#1F2937] border-[#374151] text-[#94A3B8] hover:border-accent-500 hover:text-white'
                    )}
                  >
                    {env}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature Range */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Temperature Range (°C)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={formData.tempMin}
                onChange={(e) => updateField('tempMin', Number(e.target.value))}
                placeholder="-40"
                className="h-11 bg-[#111827] border-[#374151] rounded text-sm flex-1"
              />
              <span className="text-[#64748B]">to</span>
              <Input
                type="number"
                value={formData.tempMax}
                onChange={(e) => updateField('tempMax', Number(e.target.value))}
                placeholder="120"
                className="h-11 bg-[#111827] border-[#374151] rounded text-sm flex-1"
              />
            </div>
          </div>

          {/* Production Volume + Application Method — side by side */}
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

          {/* Required Fixture Time */}
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

          {/* Gap Fill */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Gap Fill (mm)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.gapFill}
              onChange={(e) => updateField('gapFill', e.target.value)}
              placeholder="Maximum gap between substrates"
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
            />
          </div>

          {/* Additional Context */}
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
        >
          {isLoading ? 'Generating…' : 'Generate Specification →'}
        </Button>
      </form>
    </div>
  );
}

export type { SpecFormData };
