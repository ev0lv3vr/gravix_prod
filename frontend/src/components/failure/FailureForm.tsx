'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { SubstrateSelector } from '../tool/SubstrateSelector';
import { FailureModeCards } from './FailureModeCards';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { failureAnalysisSchema, type FailureAnalysisFormData } from '@/lib/schemas';
import { ZodError } from 'zod';
import { searchProducts, uploadDefectPhoto, type ProductSpecification } from '@/lib/products';
import { Upload, X, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import Link from 'next/link';

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

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PHOTOS = 5;

export function FailureForm({ onSubmit, isLoading = false }: FailureFormProps) {
  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const [formData, setFormData] = useState<FailureAnalysisFormData>({
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
    productName: '',
    defectPhotos: [],
    investigationMode: 'quick',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adhesiveInput, setAdhesiveInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const adhesiveRef = useRef<HTMLDivElement>(null);

  // Product autocomplete
  const [productInput, setProductInput] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<ProductSpecification[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSpecification | null>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const productSearchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Photo upload
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Product search debounce
  const handleProductSearch = useCallback((value: string) => {
    setProductInput(value);
    updateField('productName', value);
    setSelectedProduct(null);
    setShowProductSuggestions(true);
    if (productSearchTimeout.current) clearTimeout(productSearchTimeout.current);
    if (value.length < 2) { setProductSuggestions([]); return; }
    productSearchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchProducts(value);
        setProductSuggestions(results);
      } catch { setProductSuggestions([]); }
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProductSelect = (product: ProductSpecification) => {
    updateField('productName', product.product_name);
    setProductInput(product.product_name);
    setSelectedProduct(product);
    setShowProductSuggestions(false);

    // Auto-fill adhesive chemistry
    if (product.chemistry_type) {
      updateField('adhesiveUsed', product.chemistry_type);
      setAdhesiveInput(product.chemistry_type);
    }
  };

  // Photo upload handler
  const handlePhotoFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentPhotos = formData.defectPhotos || [];
    const remaining = MAX_PHOTOS - currentPhotos.length;
    if (remaining <= 0) return;

    const validFiles = fileArray
      .filter(f => {
        if (!ACCEPTED_IMAGE_TYPES.includes(f.type) && !f.name.toLowerCase().endsWith('.heic')) return false;
        if (f.size > MAX_FILE_SIZE) return false;
        return true;
      })
      .slice(0, remaining);

    if (validFiles.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploadPromises = validFiles.map(file => uploadDefectPhoto(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      updateField('defectPhotos', [...currentPhotos, ...newUrls]);
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) handlePhotoFiles(files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handlePhotoFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    const photos = [...(formData.defectPhotos || [])];
    photos.splice(index, 1);
    updateField('defectPhotos', photos);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const updateField = <K extends keyof FailureAnalysisFormData>(key: K, value: FailureAnalysisFormData[K]) => {
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

  // Click-outside handlers
  useEffect(() => {
    if (!showSuggestions) return;
    const handler = (e: MouseEvent) => {
      if (adhesiveRef.current && !adhesiveRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSuggestions]);

  useEffect(() => {
    if (!showProductSuggestions) return;
    const handler = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node)) setShowProductSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProductSuggestions]);

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

        {/* 2.5. Product Name — autocomplete (searches product_specifications) */}
        <div ref={productRef} className="relative">
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">Product Name</Label>
          <div className="relative">
            <Input
              value={productInput}
              onChange={(e) => handleProductSearch(e.target.value)}
              onFocus={() => productInput.length >= 2 && setShowProductSuggestions(true)}
              placeholder="Search product specifications…"
              className="h-11 bg-[#111827] border-[#374151] rounded text-sm"
            />
            {selectedProduct?.tds_file_url && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                ✓ TDS on file
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-1">Add your product for specification-aware analysis</p>
          {showProductSuggestions && productSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-[#1F2937] border border-[#374151] rounded-md shadow-lg max-h-48 overflow-y-auto">
              {productSuggestions.map(p => (
                <button key={p.id} type="button" onClick={() => handleProductSelect(p)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#374151] transition-colors">
                  <span className="font-medium">{p.product_name}</span>
                  {p.manufacturer && <span className="text-[#94A3B8] ml-2">— {p.manufacturer}</span>}
                  {p.chemistry_type && <span className="text-[#6B7280] ml-1 text-xs">({p.chemistry_type})</span>}
                  {p.tds_file_url && <span className="text-emerald-400 ml-2 text-xs">✓ TDS</span>}
                </button>
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

        {/* 12. Defect Photos — drag-and-drop upload */}
        <div>
          <Label className="text-[13px] font-medium text-[#94A3B8] mb-1.5 block">
            Defect Photos <span className="text-[#6B7280] text-xs">(up to {MAX_PHOTOS})</span>
          </Label>

          {/* Thumbnails */}
          {(formData.defectPhotos || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.defectPhotos || []).map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg border border-[#374151] overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Defect ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          {(formData.defectPhotos || []).length < MAX_PHOTOS && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => photoInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
                dragActive
                  ? 'border-accent-500 bg-accent-500/10'
                  : 'border-[#374151] hover:border-accent-500/50 hover:bg-[#111827]'
              )}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.heic"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {uploadingPhoto ? (
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#64748B]" />
                    <Camera className="w-5 h-5 text-[#64748B]" />
                  </div>
                  <p className="text-sm text-[#94A3B8]">
                    <span className="text-accent-500 font-medium">Click to browse</span> or drag and drop
                  </p>
                  <p className="text-xs text-[#64748B]">JPG, PNG, HEIC • Max 10MB each</p>
                </>
              )}
            </div>
          )}
          <p className="text-xs text-[#64748B] mt-1.5">Upload fracture surface photos for visual AI analysis</p>
        </div>

        {/* Analysis Mode Toggle — pill-style tabs above submit */}
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
            <p className="mt-1.5 text-xs text-[#6B7280]">AI will guide you through a structured investigation with follow-up questions.</p>
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

          {/* Monthly limit CTA */}
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
