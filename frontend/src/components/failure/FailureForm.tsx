'use client';

import { useState, useRef, useCallback } from 'react';
import { Combobox } from '@/components/ui/Combobox';
import { ExpandableSection } from '@/components/ui/ExpandableSection';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { MultiSelectChips } from '@/components/forms/MultiSelectChips';
import { ConditionalSubField } from '@/components/forms/ConditionalSubField';
import { FailureModeCards } from './FailureModeCards';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { failureAnalysisSchema, type FailureAnalysisFormData } from '@/lib/schemas';
import { ZodError } from 'zod';
import { searchProducts, uploadDefectPhoto, type ProductSpecification } from '@/lib/products';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { usePlanGate } from '@/hooks/usePlanGate';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { SUBSTRATE_SUGGESTIONS } from '@/lib/substrate-suggestions';
import type { SuggestionCategory } from '@/lib/substrate-suggestions';
import {
  ENVIRONMENT_OPTIONS,
  CHEMICAL_OPTIONS,
  STERILIZATION_OPTIONS,
  SURFACE_PREP_OPTIONS,
  INDUSTRY_OPTIONS,
} from '@/lib/form-constants';

export type FailureFormData = FailureAnalysisFormData;

interface FailureFormProps {
  onSubmit: (data: FailureAnalysisFormData) => void;
  isLoading?: boolean;
}

const TIME_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: '1-4weeks', label: '1-4 weeks' },
  { value: '1-6months', label: '1-6 months' },
  { value: '>6months', label: '>6 months' },
];

const PRODUCTION_IMPACT_OPTIONS = [
  { value: 'line_down', label: 'Line down' },
  { value: 'reduced_output', label: 'Reduced output' },
  { value: 'quality_hold', label: 'Quality hold' },
  { value: 'field_failure', label: 'Field failure' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'na', label: 'N/A' },
];

// Build product suggestions for the merged Product/Adhesive combobox
const ADHESIVE_TYPE_SUGGESTIONS: SuggestionCategory[] = [
  {
    category: 'Chemistry Types',
    items: [
      { name: 'Epoxy (2-part)', aliases: ['epoxy', 'two part epoxy', 'structural epoxy'] },
      { name: 'Cyanoacrylate (CA)', aliases: ['CA', 'super glue', 'instant adhesive'] },
      { name: 'Polyurethane (PU)', aliases: ['PU', 'urethane adhesive'] },
      { name: 'Acrylic (MMA)', aliases: ['MMA', 'methacrylate', 'structural acrylic'] },
      { name: 'Silicone', aliases: ['RTV', 'silicone sealant'] },
      { name: 'MS Polymer', aliases: ['modified silicone', 'hybrid polymer'] },
      { name: 'UV Cure', aliases: ['light cure', 'UV adhesive'] },
      { name: 'Anaerobic', aliases: ['threadlocker', 'retaining compound'] },
      { name: 'Hot Melt', aliases: ['hot glue', 'EVA hot melt', 'PUR hot melt'] },
      { name: 'Contact Adhesive', aliases: ['contact cement', 'neoprene adhesive'] },
      { name: 'Pressure Sensitive (PSA)', aliases: ['PSA', 'tape', 'VHB'] },
      { name: 'Unknown / Not Sure', aliases: ['unknown', 'not sure', 'dont know'] },
    ],
  },
  {
    category: 'Common Products',
    items: [
      { name: 'Loctite 401', aliases: ['401'] },
      { name: 'Loctite 480', aliases: ['480', 'black max'] },
      { name: 'Loctite E-120HP', aliases: ['E120', 'E-120'] },
      { name: '3M DP420', aliases: ['DP420', 'DP-420'] },
      { name: '3M DP460', aliases: ['DP460', 'DP-460'] },
      { name: 'Henkel EA 9394', aliases: ['EA9394', '9394'] },
    ],
  },
];

export function FailureForm({ onSubmit, isLoading = false }: FailureFormProps) {
  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();
  const { allowed: canUploadPhotos } = usePlanGate('analysis.photos');

  const [formData, setFormData] = useState<FailureAnalysisFormData>({
    failureDescription: '',
    adhesiveUsed: '',
    substrateA: '',
    substrateB: '',
    failureMode: '',
    timeToFailure: '',
    industry: '',
    environment: [],
    chemicalExposureDetail: [],
    chemicalExposureOther: '',
    sterilizationMethods: [],
    surfacePrep: '',
    surfacePreps: [],
    surfacePrepDetail: '',
    productionImpact: '',
    additionalContext: '',
    productName: '',
    defectPhotos: [],
    investigationMode: 'quick',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localPhotos, setLocalPhotos] = useState<File[]>([]);

  // Product autocomplete for the merged combobox
  const [productSuggestions, setProductSuggestions] = useState<SuggestionCategory[]>(ADHESIVE_TYPE_SUGGESTIONS);
  const productSearchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Dynamically search product_specifications when user types in the product combobox
  const handleProductValueChange = useCallback((value: string) => {
    updateField('productName', value);
    updateField('adhesiveUsed', value);

    // Debounced search for TDS products
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
            setProductSuggestions([tdsCategory, ...ADHESIVE_TYPE_SUGGESTIONS]);
          } else {
            setProductSuggestions(ADHESIVE_TYPE_SUGGESTIONS);
          }
        } catch {
          setProductSuggestions(ADHESIVE_TYPE_SUGGESTIONS);
        }
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Photo upload — files are held locally, uploaded on submit
  const handlePhotosChange = useCallback((files: File[]) => {
    setLocalPhotos(files);
  }, []);

  const validate = (): boolean => {
    try {
      failureAnalysisSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errs: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errs[err.path[0].toString()] = err.message;
          }
        });
        setErrors(errs);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Upload photos if any
    let photoUrls = formData.defectPhotos || [];
    if (localPhotos.length > 0) {
      const results = await Promise.allSettled(localPhotos.map((f) => uploadDefectPhoto(f)));
      const succeeded = results.filter((r): r is PromiseFulfilledResult<{ url: string; filename: string }> => r.status === 'fulfilled');
      const failedCount = results.length - succeeded.length;
      photoUrls = succeeded.map((r) => r.value.url);

      if (failedCount > 0 && succeeded.length === 0) {
        alert(`All ${failedCount} photo upload(s) failed. Please try again or submit without photos.`);
        return;
      }
      if (failedCount > 0) {
        const proceed = confirm(`${failedCount} of ${results.length} photo(s) failed to upload. Continue with ${succeeded.length} photo(s)?`);
        if (!proceed) return;
      }
    }

    onSubmit({ ...formData, defectPhotos: photoUrls });
  };

  const updateField = <K extends keyof FailureAnalysisFormData>(key: K, value: FailureAnalysisFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  // Determine submit button state
  const isAtLimit = user && isExhausted;
  const submitLabel = isAtLimit
    ? 'Monthly Limit Reached'
    : isLoading
      ? 'Analyzing…'
      : formData.investigationMode === 'guided'
        ? 'Start Guided Investigation →'
        : 'Analyze Failure →';

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Diagnose a Failure</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ═══════════════════ ZONE 1: Core Fields ═══════════════════ */}

        {/* 1. Description — position 1, auto-focus, 6 rows, larger text */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
            What happened? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={formData.failureDescription}
            onChange={(e) => updateField('failureDescription', e.target.value)}
            placeholder="Describe the failure — what broke, when, how it looked, what conditions, what you've tried. The more detail you provide, the more accurate the diagnosis."
            rows={6}
            autoFocus
            className={cn(
              'bg-[#0F1629] border-[#374151] rounded text-[15px] resize-none leading-relaxed',
              errors.failureDescription && 'border-red-500'
            )}
          />
          {errors.failureDescription && (
            <p className="mt-1 text-xs text-red-500">{errors.failureDescription}</p>
          )}
        </div>

        {/* 2. Substrate 1 + 2 — side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Combobox
            label="Substrate 1"
            placeholder="e.g., Aluminum 6061, ABS, Polycarbonate"
            suggestions={SUBSTRATE_SUGGESTIONS}
            value={formData.substrateA}
            onChange={(v) => updateField('substrateA', v)}
            required
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

        {/* 3. Product / Adhesive Used — merged single combobox */}
        <Combobox
          label="Product / Adhesive Used"
          placeholder="e.g., Loctite 495, 3M DP420, generic 2-part epoxy, unknown"
          suggestions={productSuggestions}
          value={formData.productName || formData.adhesiveUsed || ''}
          onChange={handleProductValueChange}
          recentKey="gravix_recent_products"
          showTdsBadge
        />

        {/* 4. Photo Upload */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
            Defect Photos <span className="text-[#64748B] text-xs">(optional)</span>
          </Label>
          {canUploadPhotos ? (
            <PhotoUpload
              photos={localPhotos}
              onChange={handlePhotosChange}
              maxFiles={5}
              maxSizeMB={10}
            />
          ) : (
            <div className="bg-brand-800/50 border border-accent-500/20 rounded-lg p-4 text-center">
              <Lock className="w-6 h-6 text-accent-500 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Photo upload requires Pro</p>
              <Link href="/pricing" className="text-accent-500 text-sm hover:underline">Upgrade →</Link>
            </div>
          )}
        </div>

        {/* ═══════════════════ ZONE 2: Expandable Detail ═══════════════════ */}
        <ExpandableSection
          label="Add details for a more accurate diagnosis (optional)"
          persistKey="gravix_failure_form_expanded"
        >
          {/* ─── Failure Mode — Visual Cards (optional, now with 5th card) ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              Failure Mode
            </Label>
            <FailureModeCards
              value={formData.failureMode}
              onChange={(v) => updateField('failureMode', v)}
            />
            <p className="mt-2 text-xs text-[#64748B]">
              Not sure? Select &quot;Can&apos;t Determine&quot; or leave blank — our AI can infer from your description and photos.
            </p>
          </div>

          {/* ─── Time to Failure + Industry — side by side ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Time to Failure</Label>
              <Select value={formData.timeToFailure} onValueChange={(v) => updateField('timeToFailure', v)}>
                <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Industry</Label>
              <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span title={o.tooltip}>{o.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ─── Surface Preparation — Multi-Select Chips ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
              What surface preparation was done? <span className="text-[#64748B] text-xs">(select all steps, in any order)</span>
            </Label>
            <MultiSelectChips
              options={SURFACE_PREP_OPTIONS}
              selected={formData.surfacePreps}
              onChange={(v) => updateField('surfacePreps', v)}
            />
            <div className="mt-3">
              <Input
                type="text"
                value={formData.surfacePrepDetail}
                onChange={(e) => updateField('surfacePrepDetail', e.target.value)}
                placeholder="Optional: describe prep sequence, abrasive grit, primer product, dwell time, etc."
                className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
              />
            </div>
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

          {/* ─── Production Impact ─── */}
          <div>
            <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Production Impact</Label>
            <Select value={formData.productionImpact} onValueChange={(v) => updateField('productionImpact', v)}>
              <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm">
                <SelectValue placeholder="Select impact" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTION_IMPACT_OPTIONS.map((o) => (
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
              placeholder="Test results, batch info, previous fixes tried…"
              rows={3}
              className="bg-[#111827] border-[#374151] rounded text-sm resize-none"
            />
          </div>
        </ExpandableSection>

        {/* ═══════════════════ Mode Toggle + Submit ═══════════════════ */}

        {/* Analysis Mode Toggle */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Analysis Mode</Label>
          <div className="flex bg-[#111827] rounded-lg p-1 border border-[#374151]">
            <button
              type="button"
              onClick={() => updateField('investigationMode', 'quick')}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
                formData.investigationMode === 'quick'
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              )}
            >
              Standard Analysis
            </button>
            <button
              type="button"
              onClick={() => updateField('investigationMode', 'guided')}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
                formData.investigationMode === 'guided'
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              )}
            >
              Guided Investigation
            </button>
          </div>
          {formData.investigationMode === 'guided' && (
            <p className="mt-1.5 text-xs text-[#6B7280]">
              AI will guide you through a structured investigation with follow-up questions.
            </p>
          )}
        </div>

        {/* Submit */}
        <div>
          <Button
            type="submit"
            className={cn(
              'w-full h-12 text-base font-medium',
              isAtLimit
                ? 'bg-[#374151] text-[#64748B] cursor-not-allowed'
                : 'bg-accent-500 hover:bg-accent-600 text-white'
            )}
            disabled={isLoading || !!isAtLimit}
          >
            {submitLabel}
          </Button>

          {isAtLimit && (
            <p className="mt-2 text-sm text-[#94A3B8] text-center">
              Upgrade to Pro for unlimited analyses.{' '}
              <Link href="/pricing" className="text-accent-500 hover:text-accent-400 font-medium">
                See Plans →
              </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
