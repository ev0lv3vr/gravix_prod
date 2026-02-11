'use client';

import { useState } from 'react';
import { SubstrateSelector } from './SubstrateSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SpecFormData {
  substrateA: string;
  substrateB: string;
  loadType: string;
  environment: string[];
  tempMin: number;
  tempMax: number;
  cureConstraint: string;
  gapFill: string;
  additionalContext: string;
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

export function SpecForm({ onSubmit, isLoading = false }: SpecFormProps) {
  const [formData, setFormData] = useState<SpecFormData>({
    substrateA: '',
    substrateB: '',
    loadType: '',
    environment: [],
    tempMin: -40,
    tempMax: 120,
    cureConstraint: '',
    gapFill: '',
    additionalContext: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.substrateA) newErrors.substrateA = 'Substrate A is required';
    if (!formData.substrateB) newErrors.substrateB = 'Substrate B is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof SpecFormData>(key: K, value: SpecFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const toggleEnvChip = (chip: string) => {
    if (formData.environment.includes(chip)) {
      updateField('environment', formData.environment.filter(v => v !== chip));
    } else {
      updateField('environment', [...formData.environment, chip]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Specify a Material</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Substrate A */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
            Substrate A <span className="text-danger">*</span>
          </Label>
          <SubstrateSelector
            value={formData.substrateA}
            onChange={(v) => updateField('substrateA', v)}
            placeholder="e.g., Aluminum 6061, ABS, Polycarbonate"
            autoFocus
            error={errors.substrateA}
          />
        </div>

        {/* 2. Substrate B */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
            Substrate B <span className="text-danger">*</span>
          </Label>
          <SubstrateSelector
            value={formData.substrateB}
            onChange={(v) => updateField('substrateB', v)}
            placeholder="Material being bonded to Substrate A"
            error={errors.substrateB}
          />
        </div>

        {/* 3. Load Type */}
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

        {/* 4. Environment — multi-select chips */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Environment</Label>
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

        {/* 5. Temperature Range */}
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
            <span className="text-text-tertiary">to</span>
            <Input
              type="number"
              value={formData.tempMax}
              onChange={(e) => updateField('tempMax', Number(e.target.value))}
              placeholder="120"
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm flex-1"
            />
          </div>
        </div>

        {/* 6. Cure Constraints */}
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

        {/* 7. Gap Fill */}
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
          <p className="text-xs text-[#64748B] mt-1">Maximum gap between substrates</p>
        </div>

        {/* 8. Additional Context */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Additional Context</Label>
          <Textarea
            value={formData.additionalContext}
            onChange={(e) => updateField('additionalContext', e.target.value)}
            placeholder="Production volume, application method, special requirements…"
            rows={3}
            className="bg-[#111827] border-[#374151] rounded text-sm resize-none"
          />
        </div>

        {/* Submit */}
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
