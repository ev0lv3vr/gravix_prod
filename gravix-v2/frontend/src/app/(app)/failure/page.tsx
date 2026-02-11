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

type Status = 'idle' | 'validating' | 'submitting' | 'processing' | 'complete' | 'error';

export default function FailureAnalysisPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<FailureResultData | null>(null);
  const [, setError] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const handleSubmit = async (formData: FailureFormData) => {
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
        failure_mode: formData.failureMode,
        failure_description: formData.failureDescription,
      };
      
      if (formData.adhesiveUsed) requestData.material_subcategory = formData.adhesiveUsed;
      if (formData.substrateA) requestData.substrate_a = formData.substrateA;
      if (formData.substrateB) requestData.substrate_b = formData.substrateB;
      if (formData.environmentConditions.includes('humidity')) requestData.humidity = 'high';
      if (formData.environmentConditions.includes('chemical')) requestData.chemical_exposure = 'present';
      if (formData.timeToFailure) requestData.time_to_failure = formData.timeToFailure;
      if (formData.surfacePrep.length > 0) requestData.surface_preparation = formData.surfacePrep.join(', ');
      if (formData.additionalContext) requestData.additional_notes = formData.additionalContext;

      setStatus('processing');

      // Call API
      const response = await api.createFailureAnalysis(requestData);

      // Map response to result data format
      const mappedData: FailureResultData = {
        diagnosis: {
          topRootCause: response.rootCauses?.[0]?.cause || 'Analysis Complete',
          confidence: response.rootCauses?.[0]?.confidence || 0.85,
          explanation: response.rootCauses?.[0]?.explanation || 'Analysis complete. See details below.',
        },
        rootCauses: (response.rootCauses || []).map((rc, index) => ({
          rank: index + 1,
          cause: rc.cause,
          category: 'general',
          confidence: rc.confidence,
          explanation: rc.explanation,
          mechanism: rc.evidence?.join('. ') || 'No additional details available.',
        })),
        contributingFactors: response.contributingFactors || [],
        immediateActions: (response.recommendations?.immediate || []),
        longTermSolutions: (response.recommendations?.longTerm || []),
        preventionPlan: response.preventionPlan ? response.preventionPlan.split('\n').filter(Boolean) : [],
        confidenceScore: response.confidenceScore || 0.85,
      };

      setResultData(mappedData);
      setStatus('complete');
      
      // Increment usage counter
      incrementUsage(user);
    } catch (err) {
      console.error('Failure analysis error:', err);
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

  const handleRunSpecAnalysis = () => {
    router.push('/tool');
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
          <FailureForm
            onSubmit={handleSubmit}
            isLoading={status !== 'idle' && status !== 'complete' && status !== 'error'}
          />
        }
        resultsPanel={
          <FailureResults
            status={getResultsStatus()}
            data={resultData}
            onNewAnalysis={handleNewAnalysis}
            onRunSpecAnalysis={handleRunSpecAnalysis}
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
