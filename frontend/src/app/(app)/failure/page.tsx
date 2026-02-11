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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await api.createFailureAnalysis(requestData);

      // Map API response (snake_case) to display format (camelCase)
      const rootCauses = response.root_causes || response.rootCauses || [];
      const contribFactors = response.contributing_factors || response.contributingFactors || [];
      const recs = response.recommendations || [];
      const prevention = response.prevention_plan || response.preventionPlan || '';
      const confScore = response.confidence_score ?? response.confidenceScore ?? 0.85;

      // Backend returns recommendations as array of { title, description, priority, ... }
      // Frontend expects { immediate: string[], longTerm: string[] }
      let immediateActions: string[] = [];
      let longTermSolutions: string[] = [];
      if (Array.isArray(recs)) {
        immediateActions = recs
          .filter((r: Record<string, unknown>) => r.priority === 'immediate')
          .map((r: Record<string, unknown>) => (r.description as string) || (r.title as string) || '');
        longTermSolutions = recs
          .filter((r: Record<string, unknown>) => r.priority === 'long_term' || r.priority === 'short_term')
          .map((r: Record<string, unknown>) => (r.description as string) || (r.title as string) || '');
      } else if (recs && typeof recs === 'object') {
        immediateActions = (recs as Record<string, string[]>).immediate || [];
        longTermSolutions = (recs as Record<string, string[]>).longTerm || (recs as Record<string, string[]>).long_term || [];
      }

      const mapped: FailureResultData = {
        diagnosis: {
          topRootCause:
            rootCauses[0]?.cause || 'Analysis Complete',
          confidence: rootCauses[0]?.confidence || 0.85,
          explanation:
            rootCauses[0]?.explanation || 'See details below.',
        },
        rootCauses: rootCauses.map(
          (
            rc: {
              cause: string;
              category?: string;
              confidence: number;
              explanation: string;
              evidence?: string[];
            },
            i: number
          ) => ({
            rank: i + 1,
            cause: rc.cause,
            category: rc.category || 'general',
            confidence: rc.confidence,
            explanation: rc.explanation,
            mechanism: rc.evidence?.join('. ') || '',
          })
        ),
        contributingFactors: contribFactors,
        immediateActions,
        longTermSolutions,
        preventionPlan: typeof prevention === 'string'
          ? prevention.split('\n').filter(Boolean)
          : [],
        confidenceScore: confScore,
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
