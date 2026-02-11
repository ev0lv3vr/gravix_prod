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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const handleSubmit = async (formData: SpecFormData) => {
    if (isExhausted) { setUpgradeModalOpen(true); return; }
    setStatus('loading');

    try {
      const requestData: Record<string, unknown> = {
        material_category: 'adhesive',
        substrate_a: formData.substrateA,
        substrate_b: formData.substrateB,
        bond_requirements: {
          load_type: formData.loadType,
          gap_fill: formData.gapFill ? `${formData.gapFill}mm` : undefined,
        },
        environment: {
          temp_min: `${formData.tempMin}°C`,
          temp_max: `${formData.tempMax}°C`,
          conditions: formData.environment,
        },
        cure_constraints: formData.cureConstraint || undefined,
        additional_requirements: formData.additionalContext || undefined,
      };

      const response = await api.createSpecRequest(requestData);

      const mapped: SpecResultData = {
        recommendedSpec: {
          materialType: response.recommendedSpec?.title || 'Unknown',
          chemistry: response.recommendedSpec?.chemistry || 'Unknown',
          subcategory: 'General',
          rationale: response.recommendedSpec?.rationale || '',
        },
        productCharacteristics: {
          viscosityRange: response.productCharacteristics?.viscosity,
          cureTime: response.productCharacteristics?.cureTime,
          expectedStrength: response.productCharacteristics?.shearStrength,
          temperatureResistance: response.productCharacteristics?.serviceTemperature,
          gapFillCapability: response.productCharacteristics?.gapFill,
        },
        applicationGuidance: {
          surfacePreparation: response.applicationGuidance?.surfacePrep || [],
          applicationTips: response.applicationGuidance?.applicationTips || [],
          curingNotes: response.applicationGuidance?.curingNotes || [],
          commonMistakesToAvoid: response.applicationGuidance?.mistakesToAvoid || [],
        },
        warnings: response.warnings || [],
        alternatives: (response.alternatives || []).map((alt: any) => ({
          materialType: alt.name || '',
          chemistry: alt.name || '',
          advantages: alt.pros || [],
          disadvantages: alt.cons || [],
          whenToUse: 'See advantages/disadvantages',
        })),
        confidenceScore: 0.85,
      };

      setResultData(mapped);
      setStatus('complete');
      incrementUsage(user);
    } catch (err) {
      console.error('Spec generation error:', err);
      setStatus('error');
    }
  };

  const handleNewAnalysis = () => { setStatus('idle'); setResultData(null); };

  const resultsStatus = status === 'idle' ? 'idle' : status === 'complete' ? 'success' : status === 'error' ? 'error' : 'loading';

  return (
    <>
      <ToolLayout
        formPanel={<SpecForm onSubmit={handleSubmit} isLoading={status === 'loading'} />}
        resultsPanel={<SpecResults status={resultsStatus} data={resultData} onNewAnalysis={handleNewAnalysis} isFree={!user} />}
      />
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} onUpgrade={() => window.location.href = '/pricing'} />
    </>
  );
}
