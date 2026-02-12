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
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      if (formData.industry) requestData.industry = formData.industry;
      if (formData.productionImpact) requestData.production_impact = formData.productionImpact;
      // Environment conditions go into chemical_exposure or additional_notes
      if (formData.environment.length > 0) {
        requestData.chemical_exposure = formData.environment.join(', ');
      }

      const response = await api.createFailureAnalysis(requestData) as import('@/lib/types').ApiFailureAnalysisResponse;

      // Capture the record ID for feedback
      const recordId = response.id;
      if (recordId) setAnalysisId(recordId);

      // Map backend snake_case response to frontend FailureResultData
      // Handle both camelCase (from types.ts) and snake_case (from backend) field names
      const rootCauses = response.rootCauses || response.root_causes || [];
      const contribFactors = response.contributingFactors || response.contributing_factors || [];
      const recs = response.recommendations || [];
      const prevPlan = response.prevention_plan || response.preventionPlan || '';
      const confScore = response.confidence_score || response.confidenceScore || 0.85;
      const simCases = response.similar_cases || response.similarCases || [];
      const knowledgeEvidenceCount = response.knowledge_evidence_count ?? response.knowledgeEvidenceCount ?? undefined;

      // Recommendations can come as array of objects or as {immediate, longTerm}
      let immediateActions: string[] = [];
      let longTermSolutions: string[] = [];

      if (Array.isArray(recs)) {
        const apiRecs = recs as import('@/lib/types').ApiRecommendation[];
        immediateActions = apiRecs
          .filter((r) => r.priority === 'immediate' || r.priority === 'short_term')
          .map((r) => `${r.title}: ${r.description}`);
        longTermSolutions = apiRecs
          .filter((r) => r.priority === 'long_term')
          .map((r) => `${r.title}: ${r.description}`);
        // If no categorization, split evenly
        if (immediateActions.length === 0 && longTermSolutions.length === 0) {
          const mid = Math.ceil(apiRecs.length / 2);
          immediateActions = apiRecs.slice(0, mid).map((r) => typeof r === 'string' ? r : `${r.title || ''}: ${r.description || ''}`);
          longTermSolutions = apiRecs.slice(mid).map((r) => typeof r === 'string' ? r : `${r.title || ''}: ${r.description || ''}`);
        }
      } else if (recs && typeof recs === 'object') {
        const objRecs = recs as import('@/lib/types').Recommendations;
        immediateActions = objRecs.immediate || [];
        longTermSolutions = objRecs.longTerm || [];
      }

      const mapped: FailureResultData = {
        diagnosis: {
          topRootCause: rootCauses[0]?.cause || 'Analysis Complete',
          confidence: rootCauses[0]?.confidence || 0.85,
          explanation: rootCauses[0]?.explanation || 'See details below.',
        },
        rootCauses: rootCauses.map((rc, i) => ({
          rank: i + 1,
          cause: rc.cause,
          category: 'general',
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
        knowledgeEvidenceCount: knowledgeEvidenceCount,
      };

      setResultData(mapped);
      setStatus('complete');
      incrementUsage(user);
    } catch (err) {
      console.error('Failure analysis error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const handleNewAnalysis = () => { setStatus('idle'); setResultData(null); setAnalysisId(null); setErrorMessage(null); };

  const resultsStatus = status === 'idle' ? 'idle' : status === 'complete' ? 'success' : status === 'error' ? 'error' : 'loading';

  return (
    <>
      <ToolLayout
        formPanel={<FailureForm onSubmit={handleSubmit} isLoading={status === 'loading'} />}
        resultsPanel={
          <FailureResults
            status={resultsStatus}
            data={resultData}
            analysisId={analysisId}
            errorMessage={errorMessage}
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
