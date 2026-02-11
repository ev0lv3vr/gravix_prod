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

type Status = 'idle' | 'loading' | 'complete' | 'error';

export default function FailureAnalysisPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<FailureResultData | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  const handleSubmit = async (formData: FailureFormData) => {
    if (isExhausted) { setUpgradeModalOpen(true); return; }
    setStatus('loading');

    try {
      // Map frontend form data to backend FailureAnalysisCreate schema (snake_case)
      const requestData: Record<string, unknown> = {
        material_category: 'adhesive',
        failure_mode: formData.failureMode,
        failure_description: formData.failureDescription,
        substrate_a: formData.substrateA,
        substrate_b: formData.substrateB,
      };

      if (formData.adhesiveUsed) requestData.material_subcategory = formData.adhesiveUsed;
      if (formData.timeToFailure) requestData.time_to_failure = formData.timeToFailure;
      if (formData.surfacePrep) requestData.surface_preparation = formData.surfacePrep;
      if (formData.additionalContext) requestData.additional_notes = formData.additionalContext;
      // Environment conditions go into chemical_exposure or additional_notes
      if (formData.environment.length > 0) {
        requestData.chemical_exposure = formData.environment.join(', ');
      }

      const response = await api.createFailureAnalysis(requestData);

      // Map backend snake_case response to frontend FailureResultData
      // Handle both camelCase (from types.ts) and snake_case (from backend) field names
      const rootCauses = response.rootCauses || (response as any).root_causes || [];
      const contribFactors = response.contributingFactors || (response as any).contributing_factors || [];
      const recs = response.recommendations || (response as any).recommendations || [];
      const prevPlan = (response as any).prevention_plan || (response as any).preventionPlan || '';
      const confScore = (response as any).confidence_score || (response as any).confidenceScore || 0.85;
      const simCases = (response as any).similar_cases || (response as any).similarCases || [];

      // Recommendations can come as array of objects or as {immediate, longTerm}
      let immediateActions: string[] = [];
      let longTermSolutions: string[] = [];

      if (Array.isArray(recs)) {
        immediateActions = recs
          .filter((r: any) => r.priority === 'immediate' || r.priority === 'short_term')
          .map((r: any) => `${r.title}: ${r.description}`);
        longTermSolutions = recs
          .filter((r: any) => r.priority === 'long_term')
          .map((r: any) => `${r.title}: ${r.description}`);
        // If no categorization, split evenly
        if (immediateActions.length === 0 && longTermSolutions.length === 0) {
          const mid = Math.ceil(recs.length / 2);
          immediateActions = recs.slice(0, mid).map((r: any) => typeof r === 'string' ? r : `${r.title || ''}: ${r.description || ''}`);
          longTermSolutions = recs.slice(mid).map((r: any) => typeof r === 'string' ? r : `${r.title || ''}: ${r.description || ''}`);
        }
      } else if (recs && typeof recs === 'object') {
        immediateActions = (recs as any).immediate || [];
        longTermSolutions = (recs as any).longTerm || (recs as any).long_term || [];
      }

      const mapped: FailureResultData = {
        diagnosis: {
          topRootCause: rootCauses[0]?.cause || 'Analysis Complete',
          confidence: rootCauses[0]?.confidence || 0.85,
          explanation: rootCauses[0]?.explanation || 'See details below.',
        },
        rootCauses: rootCauses.map((rc: any, i: number) => ({
          rank: i + 1,
          cause: rc.cause,
          category: rc.category || 'general',
          confidence: rc.confidence,
          explanation: rc.explanation,
          mechanism: Array.isArray(rc.evidence) ? rc.evidence.join('. ') : (rc.evidence || ''),
        })),
        contributingFactors: contribFactors,
        immediateActions,
        longTermSolutions,
        preventionPlan: typeof prevPlan === 'string'
          ? prevPlan.split('\n').filter(Boolean)
          : Array.isArray(prevPlan) ? prevPlan : [],
        similarCases: simCases,
        confidenceScore: confScore,
      };

      setResultData(mapped);
      setStatus('complete');
      incrementUsage(user);
    } catch (err) {
      console.error('Failure analysis error:', err);
      setStatus('error');
    }
  };

  const handleNewAnalysis = () => { setStatus('idle'); setResultData(null); };

  const resultsStatus = status === 'idle' ? 'idle' : status === 'complete' ? 'success' : status === 'error' ? 'error' : 'loading';

  return (
    <>
      <ToolLayout
        formPanel={<FailureForm onSubmit={handleSubmit} isLoading={status === 'loading'} />}
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
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} onUpgrade={() => window.location.href = '/pricing'} />
    </>
  );
}
