'use client';

import { useState, useRef, useEffect } from 'react';
import { SubstrateSelector } from '../tool/SubstrateSelector';
import { EnvironmentChips } from '../tool/EnvironmentChips';
import { FailureModeCards } from './FailureModeCards';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FailureFormData {
  failureDescription: string;
  adhesiveUsed: string;
  substrateA: string;
  substrateB: string;
  failureMode: string;
  timeToFailure: string;
  environmentConditions: string[];
  surfacePrep: string[];
  additionalContext: string;
}

interface FailureFormProps {
  onSubmit: (data: FailureFormData) => void;
  isLoading?: boolean;
}

const COMMON_ADHESIVES = [
  'CA/Cyanoacrylate',
  'Epoxy',
  'Polyurethane',
  'Silicone',
  'Acrylic',
  'Methacrylate',
  'UV Cure',
  'Hot Melt',
  'Anaerobic',
  'MS Polymer',
];

const TIME_TO_FAILURE_OPTIONS = [
  { value: 'immediate', label: 'Immediate <1hr' },
  { value: 'short', label: 'Short-term 1-72hr' },
  { value: 'medium', label: 'Medium 1-4 weeks' },
  { value: 'long', label: 'Long-term >1 month' },
  { value: 'cyclical', label: 'Cyclical/intermittent' },
];

const SURFACE_PREP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'wiped', label: 'Wiped clean' },
  { value: 'solvent', label: 'Solvent degrease' },
  { value: 'abrasion', label: 'Abrasion' },
  { value: 'primer', label: 'Primer' },
  { value: 'plasma', label: 'Plasma/corona' },
  { value: 'unknown', label: 'Unknown' },
];

export function FailureForm({ onSubmit, isLoading = false }: FailureFormProps) {
  const [formData, setFormData] = useState<FailureFormData>({
    failureDescription: '',
    adhesiveUsed: '',
    substrateA: '',
    substrateB: '',
    failureMode: '',
    timeToFailure: '',
    environmentConditions: ['indoor'],
    surfacePrep: [],
    additionalContext: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adhesiveInput, setAdhesiveInput] = useState('');
  const [showAdhesiveSuggestions, setShowAdhesiveSuggestions] = useState(false);
  const adhesiveInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.failureDescription.trim() || formData.failureDescription.trim().length < 10) {
      newErrors.failureDescription = 'Please provide at least 10 characters';
    }

    if (!formData.substrateA) {
      newErrors.substrateA = 'Substrate A is required';
    }

    if (!formData.substrateB) {
      newErrors.substrateB = 'Substrate B is required';
    }

    if (!formData.failureMode) {
      newErrors.failureMode = 'Failure mode is required';
    }

    setErrors(newErrors);
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
      failureDescription: '',
      adhesiveUsed: '',
      substrateA: '',
      substrateB: '',
      failureMode: '',
      timeToFailure: '',
      environmentConditions: ['indoor'],
      surfacePrep: [],
      additionalContext: '',
    });
    setAdhesiveInput('');
    setErrors({});
  };

  const updateField = <K extends keyof FailureFormData>(key: K, value: FailureFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleAdhesiveSelect = (adhesive: string) => {
    updateField('adhesiveUsed', adhesive);
    setAdhesiveInput(adhesive);
    setShowAdhesiveSuggestions(false);
  };

  const filteredAdhesives = COMMON_ADHESIVES.filter(a =>
    a.toLowerCase().includes(adhesiveInput.toLowerCase())
  );

  const toggleSurfacePrep = (value: string) => {
    if (formData.surfacePrep.includes(value)) {
      updateField('surfacePrep', formData.surfacePrep.filter(v => v !== value));
    } else {
      updateField('surfacePrep', [...formData.surfacePrep, value]);
    }
  };

  // Click outside handler for adhesive suggestions
  useEffect(() => {
    if (!showAdhesiveSuggestions) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (adhesiveInputRef.current && !adhesiveInputRef.current.contains(e.target as Node)) {
        setShowAdhesiveSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdhesiveSuggestions]);

  return (
    <div>
      <h1 className="text-3xl font-bold font-heading mb-2">Failure Analysis Tool</h1>
      <p className="text-text-secondary mb-8">
        Diagnose adhesive failures and get actionable recommendations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Failure Description */}
        <div>
          <Label htmlFor="failureDescription" className="mb-2 block">
            Failure Description <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="failureDescription"
            value={formData.failureDescription}
            onChange={(e) => updateField('failureDescription', e.target.value)}
            placeholder="Describe what happened, when you noticed it, and any relevant observations..."
            rows={5}
            autoFocus
            className={cn('resize-none', errors.failureDescription && 'border-danger')}
          />
          {errors.failureDescription && (
            <p className="mt-1 text-sm text-danger">{errors.failureDescription}</p>
          )}
        </div>

        {/* Adhesive Used */}
        <div className="relative" ref={adhesiveInputRef}>
          <Label htmlFor="adhesiveUsed" className="mb-2 block">
            Adhesive Used
          </Label>
          <Input
            id="adhesiveUsed"
            value={adhesiveInput}
            onChange={(e) => {
              setAdhesiveInput(e.target.value);
              updateField('adhesiveUsed', e.target.value);
              setShowAdhesiveSuggestions(true);
            }}
            onFocus={() => setShowAdhesiveSuggestions(true)}
            placeholder="Type adhesive type or product name"
            className="h-11"
          />

          {/* Typeahead suggestions */}
          {showAdhesiveSuggestions && filteredAdhesives.length > 0 && adhesiveInput && (
            <div className="absolute z-50 w-full mt-1 bg-surface-2 border border-brand-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredAdhesives.map((adhesive) => (
                <button
                  key={adhesive}
                  type="button"
                  onClick={() => handleAdhesiveSelect(adhesive)}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-brand-600 transition-colors"
                >
                  {adhesive}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Substrate A */}
        <div>
          <Label htmlFor="substrateA" className="mb-2 block">
            Substrate A <span className="text-danger">*</span>
          </Label>
          <SubstrateSelector
            value={formData.substrateA}
            onChange={(value) => updateField('substrateA', value)}
            placeholder="Select first substrate"
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
        </div>

        {/* Failure Mode */}
        <div>
          <Label className="mb-2 block">
            Failure Mode <span className="text-danger">*</span>
          </Label>
          <FailureModeCards
            value={formData.failureMode}
            onChange={(value) => updateField('failureMode', value)}
            error={errors.failureMode}
          />
        </div>

        {/* Time to Failure */}
        <div>
          <Label htmlFor="timeToFailure" className="mb-2 block">
            Time to Failure
          </Label>
          <Select value={formData.timeToFailure} onValueChange={(value) => updateField('timeToFailure', value)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIME_TO_FAILURE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Environment Conditions */}
        <div>
          <Label className="mb-2 block">Environment Conditions</Label>
          <EnvironmentChips
            value={formData.environmentConditions}
            onChange={(value) => updateField('environmentConditions', value)}
          />
        </div>

        {/* Surface Prep */}
        <div>
          <Label className="mb-2 block">Surface Preparation Used</Label>
          <div className="flex flex-wrap gap-2">
            {SURFACE_PREP_OPTIONS.map((option) => {
              const isSelected = formData.surfacePrep.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleSurfacePrep(option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                    isSelected
                      ? 'bg-accent-500/15 border-accent-500 text-accent-500'
                      : 'bg-surface-2 border-brand-600 text-text-secondary hover:border-accent-500 hover:text-text-primary'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
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
            placeholder="Any other relevant details, observations, or questions..."
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
            {isLoading ? 'Analyzing...' : 'Analyze Failure →'}
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

export type { FailureFormData };
