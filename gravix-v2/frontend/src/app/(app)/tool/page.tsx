'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { SpecForm, type SpecFormData } from '@/components/tool/SpecForm';
import { SpecResults, type SpecResultData } from '@/components/tool/SpecResults';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking, incrementUsage } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';

type Status = 'idle' | 'validating' | 'submitting' | 'processing' | 'complete' | 'error';

export default function SpecToolPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<SpecResultData | null>(null);
  const [, setError] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const handleSubmit = async (formData: SpecFormData) => {
    // Check usage limit
    if (isExhausted) {
      setUpgradeModalOpen(true);
      return;
    }
    setStatus('validating');
    setError(null);

    // Brief validation delay
    await new Promise(resolve => setTimeout(resolve, 300));

    setStatus('submitting');

    try {
      // Map form data to API request format
      const requestData: Record<string, unknown> = {
        material_category: 'adhesive',
        substrate_a: formData.substrateA,
        substrate_b: formData.substrateB,
        bond_requirements: {
          ...(formData.gapFillEnabled && { gap_fill: `${formData.gapFillValue}mm` }),
          other_requirements: formData.loadType,
        },
        environment: {
          temp_min: `${formData.tempMin}°${formData.tempUnit}`,
          temp_max: `${formData.tempMax}°${formData.tempUnit}`,
          humidity: formData.environment.includes('humidity') ? 'high' : 'low',
          ...(formData.environment.includes('chemical') && { chemical_exposure: ['general'] }),
          uv_exposure: formData.environment.includes('uv'),
          outdoor_use: formData.environment.includes('outdoor'),
        },
        cure_constraints: {
          ...(formData.cureConstraint !== 'no_preference' && { max_cure_time: formData.cureConstraint }),
        },
      };
      
      if (formData.additionalContext) {
        requestData.additional_requirements = formData.additionalContext;
      }

      setStatus('processing');

      // Call API
      const response = await api.createSpecRequest(requestData);

      // Map response to result data format
      const mappedData: SpecResultData = {
        recommendedSpec: {
          materialType: response.recommendedSpec?.title || 'Unknown',
          chemistry: response.recommendedSpec?.chemistry || 'Unknown',
          subcategory: 'General',
          rationale: response.recommendedSpec?.rationale || '',
        },
        productCharacteristics: {
          viscosityRange: response.productCharacteristics?.viscosity,
          color: 'Varies',
          cureTime: response.productCharacteristics?.cureTime,
          expectedStrength: response.productCharacteristics?.shearStrength,
          temperatureResistance: response.productCharacteristics?.serviceTemperature,
          flexibility: 'Varies',
          gapFillCapability: response.productCharacteristics?.gapFill,
        },
        applicationGuidance: {
          surfacePreparation: response.applicationGuidance?.surfacePrep || [],
          applicationTips: response.applicationGuidance?.applicationTips || [],
          curingNotes: response.applicationGuidance?.curingNotes || [],
          commonMistakesToAvoid: response.applicationGuidance?.mistakesToAvoid || [],
        },
        warnings: response.warnings || [],
        alternatives: (response.alternatives || []).map(alt => ({
          materialType: alt.name || '',
          chemistry: alt.name || '',
          advantages: alt.pros || [],
          disadvantages: alt.cons || [],
          whenToUse: 'See advantages/disadvantages',
        })),
        confidenceScore: 0.85, // Mock confidence score
      };

      setResultData(mappedData);
      setStatus('complete');
      
      // Increment usage counter
      incrementUsage(user);
    } catch (err) {
      console.error('Spec generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  };

  const handleUpgrade = () => {
    // TODO: Navigate to pricing/checkout page
    window.location.href = '/pricing';
  };

  const handleNewAnalysis = () => {
    setStatus('idle');
    setResultData(null);
    setError(null);
  };

  // Map status to results panel status
  const getResultsStatus = (): 'idle' | 'loading' | 'success' | 'error' => {
    if (status === 'idle') return 'idle';
    if (status === 'complete') return 'success';
    if (status === 'error') return 'error';
    return 'loading';
  };

  return (
    <>
      <ToolLayout
        formPanel={
          <SpecForm
            onSubmit={handleSubmit}
            isLoading={status !== 'idle' && status !== 'complete' && status !== 'error'}
          />
        }
        resultsPanel={
          <SpecResults
            status={getResultsStatus()}
            data={resultData}
            onNewAnalysis={handleNewAnalysis}
            isFree={!user}
          />
        }
      />
      
      <UpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
