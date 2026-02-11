'use client';

import { useState } from 'react';
import { SubstrateSelector } from './SubstrateSelector';
import { EnvironmentChips } from './EnvironmentChips';
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
  tempUnit: 'C' | 'F';
  cureConstraint: string;
  gapFillEnabled: boolean;
  gapFillValue: number;
  additionalContext: string;
}

interface SpecFormProps {
  onSubmit: (data: SpecFormData) => void;
  isLoading?: boolean;
}

const LOAD_TYPES = [
  'Shear',
  'Tensile',
  'Peel',
  'Cleavage',
  'Impact',
  'Vibration',
  'Combination',
];

const CURE_CONSTRAINTS = [
  { value: 'no_preference', label: 'No preference' },
  { value: '<30s', label: '<30 seconds' },
  { value: '<5min', label: '<5 minutes' },
  { value: '<30min', label: '<30 minutes' },
  { value: '<24h', label: '<24 hours' },
];

export function SpecForm({ onSubmit, isLoading = false }: SpecFormProps) {
  const [formData, setFormData] = useState<SpecFormData>({
    substrateA: '',
    substrateB: '',
    loadType: '',
    environment: ['indoor'],
    tempMin: 20,
    tempMax: 60,
    tempUnit: 'C',
    cureConstraint: 'no_preference',
    gapFillEnabled: false,
    gapFillValue: 0.1,
    additionalContext: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSameSubstrateWarning, setShowSameSubstrateWarning] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.substrateA) {
      newErrors.substrateA = 'Substrate A is required';
    }

    if (!formData.substrateB) {
      newErrors.substrateB = 'Substrate B is required';
    }

    if (!formData.loadType) {
      newErrors.loadType = 'Load type is required';
    }

    if (formData.tempMin >= formData.tempMax) {
      newErrors.tempMax = 'Max temperature must be greater than min';
    }

    if (formData.gapFillEnabled) {
      if (formData.gapFillValue < 0.01 || formData.gapFillValue > 25) {
        newErrors.gapFillValue = 'Gap fill must be between 0.01 and 25mm';
      }
    }

    setErrors(newErrors);
    
    // Check for same substrate warning
    if (formData.substrateA && formData.substrateB && formData.substrateA === formData.substrateB) {
      setShowSameSubstrateWarning(true);
    } else {
      setShowSameSubstrateWarning(false);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleClear = () => {
    setFormData({
      substrateA: '',
      substrateB: '',
      loadType: '',
      environment: ['indoor'],
      tempMin: 20,
      tempMax: 60,
      tempUnit: 'C',
      cureConstraint: 'no_preference',
      gapFillEnabled: false,
      gapFillValue: 0.1,
      additionalContext: '',
    });
    setErrors({});
    setShowSameSubstrateWarning(false);
  };

  const updateField = <K extends keyof SpecFormData>(key: K, value: SpecFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-heading mb-2">Adhesive Spec Tool</h1>
      <p className="text-text-secondary mb-8">
        Generate precise adhesive specifications based on your requirements.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Substrate A */}
        <div>
          <Label htmlFor="substrateA" className="mb-2 block">
            Substrate A <span className="text-danger">*</span>
          </Label>
          <SubstrateSelector
            value={formData.substrateA}
            onChange={(value) => updateField('substrateA', value)}
            placeholder="Select first substrate"
            autoFocus
            error={errors.substrateA}
          />
        </div>

        {/* Substrate B */}
        <div>
          <Label htmlFor="substrateB" className="mb-2 block">
            Substrate B <span className="text-danger">*</span>
          </Label>
          <SubstrateSelector
            value={formData.substrateB}
            onChange={(value) => updateField('substrateB', value)}
            placeholder="Select second substrate"
            error={errors.substrateB}
          />
          {showSameSubstrateWarning && (
            <p className="mt-2 text-sm text-warning flex items-start gap-2">
              <span>⚠️</span>
              <span>Both substrates are the same. This is valid but uncommon.</span>
            </p>
          )}
        </div>

        {/* Load Type */}
        <div>
          <Label htmlFor="loadType" className="mb-2 block">
            Load Type <span className="text-danger">*</span>
          </Label>
          <Select value={formData.loadType} onValueChange={(value) => updateField('loadType', value)}>
            <SelectTrigger className={cn('h-11', errors.loadType && 'border-danger')}>
              <SelectValue placeholder="Select load type" />
            </SelectTrigger>
            <SelectContent>
              {LOAD_TYPES.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.loadType && <p className="mt-1 text-sm text-danger">{errors.loadType}</p>}
        </div>

        {/* Environment */}
        <div>
          <Label className="mb-2 block">Environment Conditions</Label>
          <EnvironmentChips
            value={formData.environment}
            onChange={(value) => updateField('environment', value)}
          />
        </div>

        {/* Temperature Range */}
        <div>
          <Label className="mb-2 block">Temperature Range</Label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="number"
                value={formData.tempMin}
                onChange={(e) => updateField('tempMin', Number(e.target.value))}
                placeholder="Min"
                className="h-11"
              />
            </div>
            <span className="text-text-tertiary">to</span>
            <div className="flex-1">
              <Input
                type="number"
                value={formData.tempMax}
                onChange={(e) => updateField('tempMax', Number(e.target.value))}
                placeholder="Max"
                className={cn('h-11', errors.tempMax && 'border-danger')}
              />
            </div>
            <div className="flex bg-brand-700 rounded border border-brand-600">
              <button
                type="button"
                onClick={() => updateField('tempUnit', 'C')}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors rounded-l',
                  formData.tempUnit === 'C'
                    ? 'bg-accent-500 text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => updateField('tempUnit', 'F')}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors rounded-r',
                  formData.tempUnit === 'F'
                    ? 'bg-accent-500 text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                °F
              </button>
            </div>
          </div>
          {errors.tempMax && <p className="mt-1 text-sm text-danger">{errors.tempMax}</p>}
        </div>

        {/* Cure Constraints */}
        <div>
          <Label htmlFor="cureConstraint" className="mb-2 block">
            Cure Time Constraints
          </Label>
          <Select value={formData.cureConstraint} onValueChange={(value) => updateField('cureConstraint', value)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURE_CONSTRAINTS.map((constraint) => (
                <SelectItem key={constraint.value} value={constraint.value}>
                  {constraint.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gap Fill */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="gapFill">Gap Fill Required</Label>
            <button
              type="button"
              onClick={() => updateField('gapFillEnabled', !formData.gapFillEnabled)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                formData.gapFillEnabled ? 'bg-accent-500' : 'bg-brand-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                  formData.gapFillEnabled && 'translate-x-5'
                )}
              />
            </button>
          </div>
          {formData.gapFillEnabled && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="25"
                value={formData.gapFillValue}
                onChange={(e) => updateField('gapFillValue', Number(e.target.value))}
                className={cn('h-11', errors.gapFillValue && 'border-danger')}
              />
              <span className="text-text-secondary text-sm">mm</span>
            </div>
          )}
          {errors.gapFillValue && <p className="mt-1 text-sm text-danger">{errors.gapFillValue}</p>}
        </div>

        {/* Additional Context */}
        <div>
          <Label htmlFor="additionalContext" className="mb-2 block">
            Additional Context
          </Label>
          <Textarea
            id="additionalContext"
            value={formData.additionalContext}
            onChange={(e) => updateField('additionalContext', e.target.value)}
            placeholder="Any additional requirements, constraints, or context..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Submit */}
        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Specification →'}
          </Button>
          
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="w-full text-sm text-text-tertiary hover:text-text-primary transition-colors"
          >
            Clear form
          </button>
          
          <p className="text-center text-sm text-text-tertiary">
            2 of 3 free analyses remaining
          </p>
        </div>
      </form>
    </div>
  );
}

export type { SpecFormData };
