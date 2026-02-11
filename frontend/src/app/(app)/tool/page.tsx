'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { SpecForm, type SpecFormData } from '@/components/tool/SpecForm';
import { SpecResults, type SpecResultData } from '@/components/tool/SpecResults';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking, incrementUsage } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';
import { generateMockSpecResult, simulateLatency } from '@/lib/demo';

type Status = 'idle' | 'loading' | 'complete' | 'error';

export default function SpecToolPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<SpecResultData | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const handleSubmit = async (formData: SpecFormData) => {
    if (isExhausted) {
      setUpgradeModalOpen(true);
      return;
    }
    setStatus('loading');

    try {
      // Attempt real API call first
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await api.createSpecRequest(requestData);

      // Map API response (snake_case) to display format (camelCase)
      // Backend returns recommended_spec, product_characteristics, etc.
      const rec = response.recommended_spec || response.recommendedSpec;
      const chars = response.product_characteristics || response.productCharacteristics;
      const guidance = response.application_guidance || response.applicationGuidance;
      const alts = response.alternatives || [];

      const mapped: SpecResultData = {
        recommendedSpec: {
          materialType: rec?.material_type || rec?.title || 'Unknown',
          chemistry: rec?.chemistry || 'Unknown',
          subcategory: rec?.subcategory || 'General',
          rationale: rec?.rationale || '',
        },
        productCharacteristics: {
          viscosityRange: chars?.viscosity_range || chars?.viscosity,
          cureTime: chars?.cure_time || chars?.cureTime,
          expectedStrength: chars?.expected_strength || chars?.shearStrength,
          temperatureResistance:
            chars?.temperature_resistance || chars?.serviceTemperature,
          gapFillCapability: chars?.gap_fill_capability || chars?.gapFill,
        },
        applicationGuidance: {
          surfacePreparation:
            guidance?.surface_preparation || guidance?.surfacePrep || [],
          applicationTips:
            guidance?.application_tips || guidance?.applicationTips || [],
          curingNotes: guidance?.curing_notes || guidance?.curingNotes || [],
          commonMistakesToAvoid:
            guidance?.common_mistakes_to_avoid || guidance?.mistakesToAvoid || [],
        },
        warnings: response.warnings || [],
        alternatives: alts.map(
          (alt: Record<string, unknown>) => ({
            materialType: (alt.material_type as string) || (alt.name as string) || '',
            chemistry: (alt.chemistry as string) || (alt.name as string) || '',
            advantages: (alt.advantages as string[]) || (alt.pros as string[]) || [],
            disadvantages: (alt.disadvantages as string[]) || (alt.cons as string[]) || [],
            whenToUse: (alt.when_to_use as string) || 'See advantages/disadvantages',
          })
        ),
        confidenceScore: 0.85,
      };

      setResultData(mapped);
      setStatus('complete');
      incrementUsage(user);
    } catch {
      // API unreachable or errored → fall back to demo mode
      try {
        await simulateLatency();
        const demoResult = generateMockSpecResult({
          substrateA: formData.substrateA,
          substrateB: formData.substrateB,
          loadType: formData.loadType,
          environment: formData.environment,
          tempMin: formData.tempMin,
          tempMax: formData.tempMax,
        });
        setResultData(demoResult);
        setStatus('complete');
        incrementUsage(user);
      } catch (demoErr) {
        console.error('Demo fallback error:', demoErr);
        setStatus('error');
      }
    }
  };

  const handleNewAnalysis = () => {
    setStatus('idle');
    setResultData(null);
  };

  const resultsStatus =
    status === 'idle'
      ? 'idle'
      : status === 'complete'
        ? 'success'
        : status === 'error'
          ? 'error'
          : 'loading';

  return (
    <>
      <ToolLayout
        formPanel={
          <SpecForm onSubmit={handleSubmit} isLoading={status === 'loading'} />
        }
        resultsPanel={
          <SpecResults
            status={resultsStatus}
            data={resultData}
            onNewAnalysis={handleNewAnalysis}
            isFree={!user}
          />
        }
      />
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        onUpgrade={() => (window.location.href = '/pricing')}
      />
    </>
  );
}
