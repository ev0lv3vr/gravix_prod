'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { FailureForm, type FailureFormData } from '@/components/failure/FailureForm';
import { FailureResults, type FailureResultData } from '@/components/failure/FailureResults';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking, incrementUsage } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';
import { generateMockFailureResult, simulateLatency } from '@/lib/demo';

type Status = 'idle' | 'loading' | 'complete' | 'error';

export default function FailureAnalysisPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<FailureResultData | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const handleSubmit = async (formData: FailureFormData) => {
    if (isExhausted) {
      setUpgradeModalOpen(true);
      return;
    }
    setStatus('loading');

    try {
      // Attempt real API call first
      const requestData: Record<string, unknown> = {
        material_category: 'adhesive',
        failure_mode: formData.failureMode,
        failure_description: formData.failureDescription,
        substrate_a: formData.substrateA,
        substrate_b: formData.substrateB,
      };

      if (formData.adhesiveUsed)
        requestData.material_subcategory = formData.adhesiveUsed;
      if (formData.timeToFailure)
        requestData.time_to_failure = formData.timeToFailure;
      if (formData.industry) requestData.industry = formData.industry;
      if (formData.environment.length > 0)
        requestData.environment_conditions = formData.environment;
      if (formData.surfacePrep)
        requestData.surface_preparation = formData.surfacePrep;
      if (formData.productionImpact)
        requestData.production_impact = formData.productionImpact;
      if (formData.additionalContext)
        requestData.additional_notes = formData.additionalContext;

      const response = await api.createFailureAnalysis(requestData);

      // Map API response to display format
      const mapped: FailureResultData = {
        diagnosis: {
          topRootCause:
            response.rootCauses?.[0]?.cause || 'Analysis Complete',
          confidence: response.rootCauses?.[0]?.confidence || 0.85,
          explanation:
            response.rootCauses?.[0]?.explanation || 'See details below.',
        },
        rootCauses: (response.rootCauses || []).map(
          (
            rc: {
              cause: string;
              confidence: number;
              explanation: string;
              evidence?: string[];
            },
            i: number
          ) => ({
            rank: i + 1,
            cause: rc.cause,
            category: 'general',
            confidence: rc.confidence,
            explanation: rc.explanation,
            mechanism: rc.evidence?.join('. ') || '',
          })
        ),
        contributingFactors: response.contributingFactors || [],
        immediateActions: response.recommendations?.immediate || [],
        longTermSolutions: response.recommendations?.longTerm || [],
        preventionPlan: response.preventionPlan
          ? response.preventionPlan.split('\n').filter(Boolean)
          : [],
        confidenceScore: response.confidenceScore || 0.85,
      };

      setResultData(mapped);
      setStatus('complete');
      incrementUsage(user);
    } catch {
      // API unreachable or errored → fall back to demo mode
      try {
        await simulateLatency();
        const demoResult = generateMockFailureResult({
          failureMode: formData.failureMode,
          failureDescription: formData.failureDescription,
          substrateA: formData.substrateA,
          substrateB: formData.substrateB,
          adhesiveUsed: formData.adhesiveUsed,
          timeToFailure: formData.timeToFailure,
          environment: formData.environment,
          surfacePrep: formData.surfacePrep,
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
          <FailureForm
            onSubmit={handleSubmit}
            isLoading={status === 'loading'}
          />
        }
        resultsPanel={
          <FailureResults
            status={resultsStatus}
            data={resultData}
            onNewAnalysis={handleNewAnalysis}
            onRunSpecAnalysis={() => router.push('/tool')}
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
