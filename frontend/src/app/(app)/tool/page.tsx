'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { SpecForm, type SpecFormData } from '@/components/tool/SpecForm';
import { SpecResults, type SpecResultData } from '@/components/tool/SpecResults';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking, incrementUsage } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';

type Status = 'idle' | 'loading' | 'complete' | 'error';

export default function SpecToolPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<SpecResultData | null>(null);
  const [specId, setSpecId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const handleSubmit = async (formData: SpecFormData) => {
    if (isExhausted) { setUpgradeModalOpen(true); return; }
    setStatus('loading');

    try {
      // Map frontend form data to backend SpecRequestCreate schema
      const envConditions: string[] = formData.environment || [];
      const requestData: Record<string, unknown> = {
        material_category: 'adhesive',
        substrate_a: formData.substrateA,
        substrate_b: formData.substrateB,
        bond_requirements: {
          shear_strength: formData.loadType === 'structural' ? 'High (>3000 psi)' :
                          formData.loadType === 'semi-structural' ? 'Medium (1000-3000 psi)' :
                          formData.loadType === 'non-structural' ? 'Low (<1000 psi)' : undefined,
          gap_fill: formData.gapFill ? `${formData.gapFill}mm` : undefined,
          flexibility_required: formData.loadType === 'sealing',
          other_requirements: formData.loadType || undefined,
        },
        environment: {
          temp_min: `${formData.tempMin}°C`,
          temp_max: `${formData.tempMax}°C`,
          chemical_exposure: envConditions.filter(e => e.includes('Chemical')).length > 0
            ? envConditions.filter(e => e.includes('Chemical'))
            : undefined,
          uv_exposure: envConditions.includes('UV/outdoor'),
          outdoor_use: envConditions.includes('UV/outdoor'),
          humidity: envConditions.includes('High humidity') ? 'High' : undefined,
        },
        cure_constraints: {
          preferred_method: formData.cureConstraint === 'room_temp' ? 'Room temperature' :
                           formData.cureConstraint === 'heat_available' ? 'Heat cure' :
                           formData.cureConstraint === 'uv_available' ? 'UV cure' :
                           formData.cureConstraint === 'fast_fixture' ? 'Fast fixture (<5 min)' : undefined,
          heat_available: formData.cureConstraint === 'heat_available',
          uv_available: formData.cureConstraint === 'uv_available',
        },
        additional_requirements: formData.additionalContext || undefined,
      };

      const response = await api.createSpecRequest(requestData) as import('@/lib/types').ApiSpecResponse;

      // Capture the record ID for feedback
      const recordId = response.id;
      if (recordId) setSpecId(recordId);

      // Map backend snake_case response to frontend SpecResultData
      const recSpec = (response.recommendedSpec || response.recommended_spec || {}) as Partial<import('@/lib/types').RecommendedSpec>;
      const prodChars = (response.productCharacteristics || response.product_characteristics || {}) as Partial<import('@/lib/types').ProductCharacteristics> & { viscosity_range?: string; cure_time?: string; shear_strength?: string; service_temperature?: string; gap_fill?: string };
      const appGuidance = response.applicationGuidance || response.application_guidance || {};
      const responseWarnings = response.warnings || [];
      const responseAlts = response.alternatives || [];

      const mapped: SpecResultData = {
        recommendedSpec: {
          materialType: recSpec.title || 'Unknown',
          chemistry: recSpec.chemistry || 'Unknown',
          subcategory: 'General',
          rationale: recSpec.rationale || '',
        },
        productCharacteristics: {
          viscosityRange: prodChars.viscosity || prodChars.viscosity_range || 'Unknown',
          cureTime: prodChars.cure_time || prodChars.cureTime || 'Unknown',
          expectedStrength: prodChars.shear_strength || prodChars.shearStrength || 'Unknown',
          temperatureResistance: prodChars.service_temperature || prodChars.serviceTemperature || 'Unknown',
          gapFillCapability: prodChars.gap_fill || prodChars.gapFill || 'Unknown',
        },
        applicationGuidance: {
          surfacePreparation: (appGuidance as import('@/lib/types').ApiApplicationGuidance).surface_prep || (appGuidance as import('@/lib/types').ApplicationGuidance).surfacePrep || [],
          applicationTips: (appGuidance as import('@/lib/types').ApiApplicationGuidance).application_tips || (appGuidance as import('@/lib/types').ApplicationGuidance).applicationTips || [],
          curingNotes: (appGuidance as import('@/lib/types').ApiApplicationGuidance).curing_notes || (appGuidance as import('@/lib/types').ApplicationGuidance).curingNotes || [],
          commonMistakesToAvoid: (appGuidance as import('@/lib/types').ApiApplicationGuidance).mistakes_to_avoid || (appGuidance as import('@/lib/types').ApplicationGuidance).mistakesToAvoid || [],
        },
        warnings: responseWarnings,
        alternatives: responseAlts.map((alt: import('@/lib/types').ApiAlternative) => ({
          materialType: alt.name || '',
          chemistry: alt.name || '',
          advantages: alt.pros || [],
          disadvantages: alt.cons || [],
          whenToUse: 'See advantages/disadvantages',
        })),
        confidenceScore: response.confidence_score || response.confidenceScore || 0.85,
        knowledgeEvidenceCount: response.knowledge_evidence_count ?? response.knowledgeEvidenceCount ?? undefined,
      };

      setResultData(mapped);
      setStatus('complete');
      incrementUsage(user);
    } catch (err) {
      console.error('Spec generation error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const handleNewAnalysis = () => { setStatus('idle'); setResultData(null); setSpecId(null); setErrorMessage(null); };

  const resultsStatus = status === 'idle' ? 'idle' : status === 'complete' ? 'success' : status === 'error' ? 'error' : 'loading';

  return (
    <>
      <ToolLayout
        formPanel={<SpecForm onSubmit={handleSubmit} isLoading={status === 'loading'} />}
        resultsPanel={<SpecResults status={resultsStatus} data={resultData} specId={specId} errorMessage={errorMessage} onNewAnalysis={handleNewAnalysis} isFree={!user} />}
      />
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} onUpgrade={() => window.location.href = '/pricing'} />
    </>
  );
}
