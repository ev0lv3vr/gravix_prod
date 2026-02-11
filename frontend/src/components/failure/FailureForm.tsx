'use client';

import { useState, useRef, useEffect } from 'react';
import { SubstrateSelector } from '../tool/SubstrateSelector';
import { FailureModeCards } from './FailureModeCards';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FailureFormData {
  failureDescription: string;
  adhesiveUsed: string;
  substrateA: string;
  substrateB: string;
  failureMode: string;
  timeToFailure: string;
  industry: string;
  environment: string[];
  surfacePrep: string;
  productionImpact: string;
  additionalContext: string;
}

interface FailureFormProps {
  onSubmit: (data: FailureFormData) => void;
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

const INDUSTRY_OPTIONS = [
  { value: 'automotive', label: 'Automotive' },
  { value: 'aerospace', label: 'Aerospace' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'medical', label: 'Medical Device' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'construction', label: 'Construction' },
  { value: 'general_mfg', label: 'General Mfg' },
  { value: 'other', label: 'Other' },
];

const ENVIRONMENT_CHIPS = [
  'High humidity', 'Chemical exposure', 'UV/outdoor', 'Thermal cycling', 'Submersion', 'Vibration',
];

const SURFACE_PREP_OPTIONS = [
  { value: 'ipa', label: 'Solvent wipe (IPA)' },
  { value: 'acetone', label: 'Solvent wipe (acetone)' },
  { value: 'abrasion', label: 'Abrasion' },
  { value: 'plasma', label: 'Plasma/corona' },
  { value: 'primer', label: 'Primer' },
  { value: 'none', label: 'None/unknown' },
];

const PRODUCTION_IMPACT_OPTIONS = [
  { value: 'line_down', label: 'Line down' },
  { value: 'reduced_output', label: 'Reduced output' },
  { value: 'quality_hold', label: 'Quality hold' },
  { value: 'field_failure', label: 'Field failure' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'na', label: 'N/A' },
];

const COMMON_ADHESIVES = [
  'Loctite 401', 'Loctite 480', 'Loctite E-120HP', '3M DP420', '3M DP460',
  'Henkel EA 9394', 'Generic epoxy', 'Generic cyanoacrylate', 'Generic polyurethane', 'Unknown',
];

export function FailureForm({ onSubmit, isLoading = false }: FailureFormProps) {
  const [formData, setFormData] = useState<FailureFormData>({
    failureDescription: '',
    adhesiveUsed: '',
    substrateA: '',
    substrateB: '',
    failureMode: '',
    timeToFailure: '',
    industry: '',
    environment: [],
    surfacePrep: '',
    productionImpact: '',
    additionalContext: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adhesiveInput, setAdhesiveInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const adhesiveRef = useRef<HTMLDivElement>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.failureDescription.trim() || formData.failureDescription.trim().length < 10) errs.failureDescription = 'Describe the failure (min 10 characters)';
    if (!formData.substrateA) errs.substrateA = 'Substrate A is required';
    if (!formData.substrateB) errs.substrateB = 'Substrate B is required';
    if (!formData.failureMode) errs.failureMode = 'Select a failure mode';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const updateField = <K extends keyof FailureFormData>(key: K, value: FailureFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleEnv = (chip: string) => {
    updateField('environment', formData.environment.includes(chip)
      ? formData.environment.filter(v => v !== chip)
      : [...formData.environment, chip]
    );
  };

  const filtered = COMMON_ADHESIVES.filter(a => a.toLowerCase().includes(adhesiveInput.toLowerCase()));

  useEffect(() => {
    if (!showSuggestions) return;
    const handler = (e: MouseEvent) => {
      if (adhesiveRef.current && !adhesiveRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSuggestions]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Diagnose a Failure</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Failure Description */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
            Failure Description <span className="text-danger">*</span>
          </Label>
          <Textarea
            value={formData.failureDescription}
            onChange={(e) => updateField('failureDescription', e.target.value)}
            placeholder="Describe what happened…"
            rows={5}
            autoFocus
            className={cn('bg-[#111827] border-[#374151] rounded text-sm resize-none', errors.failureDescription && 'border-danger')}
          />
          {errors.failureDescription && <p className="mt-1 text-xs text-danger">{errors.failureDescription}</p>}
        </div>

        {/* 2. Adhesive Used — typeahead */}
        <div ref={adhesiveRef} className="relative">
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Adhesive Used</Label>
          <Input
            value={adhesiveInput}
            onChange={(e) => { setAdhesiveInput(e.target.value); updateField('adhesiveUsed', e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="e.g., Loctite 401, generic epoxy, unknown"
            className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
          />
          {showSuggestions && adhesiveInput && filtered.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[#1F2937] border border-[#374151] rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filtered.map(a => (
                <button key={a} type="button" onClick={() => { updateField('adhesiveUsed', a); setAdhesiveInput(a); setShowSuggestions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#374151] transition-colors">{a}</button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Substrate A */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Substrate A <span className="text-danger">*</span></Label>
          <SubstrateSelector value={formData.substrateA} onChange={(v) => updateField('substrateA', v)} placeholder="Select first substrate" error={errors.substrateA} />
        </div>

        {/* 4. Substrate B */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Substrate B <span className="text-danger">*</span></Label>
          <SubstrateSelector value={formData.substrateB} onChange={(v) => updateField('substrateB', v)} placeholder="Select second substrate" error={errors.substrateB} />
        </div>

        {/* 5. Failure Mode — 2×2 visual cards */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Failure Mode <span className="text-danger">*</span></Label>
          <FailureModeCards value={formData.failureMode} onChange={(v) => updateField('failureMode', v)} error={errors.failureMode} />
        </div>

        {/* 6. Time to Failure */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Time to Failure</Label>
          <Select value={formData.timeToFailure} onValueChange={(v) => updateField('timeToFailure', v)}>
            <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm"><SelectValue placeholder="Select timeframe" /></SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 7. Industry */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Industry</Label>
          <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
            <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm"><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 8. Environment — chips */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Environment</Label>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENT_CHIPS.map(env => {
              const sel = formData.environment.includes(env);
              return (
                <button key={env} type="button" onClick={() => toggleEnv(env)}
                  className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                    sel ? 'bg-accent-500/15 border-accent-500 text-accent-500' : 'bg-[#1F2937] border-[#374151] text-[#94A3B8] hover:border-accent-500'
                  )}>{env}</button>
              );
            })}
          </div>
        </div>

        {/* 9. Surface Preparation */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Surface Preparation</Label>
          <Select value={formData.surfacePrep} onValueChange={(v) => updateField('surfacePrep', v)}>
            <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm"><SelectValue placeholder="Select surface prep" /></SelectTrigger>
            <SelectContent>
              {SURFACE_PREP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 10. Production Impact */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Production Impact</Label>
          <Select value={formData.productionImpact} onValueChange={(v) => updateField('productionImpact', v)}>
            <SelectTrigger className="h-11 bg-[#111827] border-[#374151] rounded text-sm"><SelectValue placeholder="Select impact" /></SelectTrigger>
            <SelectContent>
              {PRODUCTION_IMPACT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 11. Additional Context */}
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

        {/* Submit */}
        <Button type="submit" className="w-full h-12 bg-accent-500 hover:bg-accent-600 text-white text-base font-medium" disabled={isLoading}>
          {isLoading ? 'Analyzing…' : 'Analyze Failure →'}
        </Button>
      </form>
    </div>
  );
}

export type { FailureFormData };
