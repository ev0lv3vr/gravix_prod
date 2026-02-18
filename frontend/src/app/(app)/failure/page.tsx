'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { FailureForm, type FailureFormData } from '@/components/failure/FailureForm';
import { FailureResults, type FailureResultData } from '@/components/failure/FailureResults';
import { GuidedInvestigation } from '@/components/failure/GuidedInvestigation';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking, incrementUsage } from '@/hooks/useUsageTracking';
import { api } from '@/lib/api';
import { startGuidedSession } from '@/lib/products';
import { UsageCounter } from '@/components/shared/UsageCounter';

type Status = 'idle' | 'loading' | 'complete' | 'error';

const STORAGE_KEY = 'gravix_failure_form';
const AUTO_SUBMIT_KEY = 'gravix_failure_auto_submit';

function FailurePageContent() {
  const searchParams = useSearchParams();
  const isGuidedMode = searchParams.get('mode') === 'guided';

  // If guided mode is active via query param, render chat UI instead
  if (isGuidedMode) {
    return <GuidedInvestigation />;
  }

  return <StandardFailureAnalysis />;
}

function StandardFailureAnalysis() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<FailureResultData | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const autoSubmitTriggered = useRef(false);

  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();

  // Core submission logic (no auth check — caller is responsible)
  const executeSubmit = useCallback(async (formData: FailureFormData) => {
    if (isExhausted) { setUpgradeModalOpen(true); return; }
    setStatus('loading');

    try {
      const requestData: Record<string, unknown> = {
        material_category: 'adhesive',
        failure_mode: formData.failureMode,
        failure_description: formData.failureDescription,
        substrate_a: formData.substrateA,
        substrate_b: formData.substrateB,
      };

      if (formData.adhesiveUsed) requestData.material_subcategory = formData.adhesiveUsed;
      if (formData.timeToFailure) requestData.time_to_failure = formData.timeToFailure;
      // Surface prep: prefer new multi-select, fall back to legacy single-select
      if (formData.surfacePreps && formData.surfacePreps.length > 0) {
        requestData.surface_preparation = formData.surfacePreps.map(s => `prep:${s}`);
      } else if (formData.surfacePrep) {
        requestData.surface_preparation = formData.surfacePrep;
      }
      if (formData.surfacePrepDetail) requestData.surface_prep_detail = formData.surfacePrepDetail;
      if (formData.additionalContext) requestData.additional_notes = formData.additionalContext;
      if (formData.industry) requestData.industry = formData.industry;
      if (formData.productionImpact) requestData.production_impact = formData.productionImpact;
      if (formData.environment.length > 0) {
        requestData.chemical_exposure = formData.environment.map(e => `env:${e}`);
      }
      // Chemical exposure detail
      if (formData.environment.includes('chemical')) {
        if (formData.chemicalExposureDetail && formData.chemicalExposureDetail.length > 0) {
          requestData.chemical_exposure_detail = formData.chemicalExposureDetail.map(c => `chem:${c}`);
        }
        if (formData.chemicalExposureOther) {
          requestData.chemical_exposure_other = formData.chemicalExposureOther;
        }
      }
      // Sterilization methods
      if (formData.environment.includes('sterilization') && formData.sterilizationMethods && formData.sterilizationMethods.length > 0) {
        requestData.sterilization_methods = formData.sterilizationMethods.map(s => `sterilization:${s}`);
      }
      // Sprint 11: product name and defect photos
      if (formData.productName) requestData.product_name = formData.productName;
      if (formData.defectPhotos && formData.defectPhotos.length > 0) {
        requestData.defect_photos = formData.defectPhotos;
      }

      const response = await api.createFailureAnalysis(requestData) as import('@/lib/types').ApiFailureAnalysisResponse;

      const recordId = response.id;
      if (recordId) setAnalysisId(recordId);

      const rootCauses = response.rootCauses || response.root_causes || [];
      const contribFactors = response.contributingFactors || response.contributing_factors || [];
      const recs = response.recommendations || [];
      const prevPlan = response.prevention_plan || response.preventionPlan || '';
      const confScore = response.confidence_score || response.confidenceScore || 0.85;
      const simCases = response.similar_cases || response.similarCases || [];
      const knowledgeEvidenceCount = response.knowledge_evidence_count ?? response.knowledgeEvidenceCount ?? undefined;

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

      // Phase 3: Map visual analysis results
      const apiVisualAnalysis = response.visual_analysis || response.visualAnalysis || [];
      const visualAnalysis = apiVisualAnalysis.map((va) => ({
        imageUrl: va.image_url,
        failureMode: va.failure_mode || 'Unknown',
        confidence: va.confidence || 0.5,
        description: va.description || '',
      }));

      // Phase 3: Map TDS compliance results
      const apiTdsCompliance = response.tds_compliance || response.tdsCompliance;
      const tdsCompliance = apiTdsCompliance ? {
        productName: apiTdsCompliance.product_name,
        items: apiTdsCompliance.items,
      } : undefined;

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
        visualAnalysis: visualAnalysis.length > 0 ? visualAnalysis : undefined,
        userSelectedFailureMode: formData.failureMode,
        tdsCompliance,
      };

      setResultData(mapped);
      setStatus('complete');
      incrementUsage(user);

      // Clear saved form state on success
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(AUTO_SUBMIT_KEY); } catch { /* noop */ }
    } catch (err) {
      console.error('Failure analysis error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }, [isExhausted, user]);

  // Public submit handler — gates on auth
  const handleSubmit = async (formData: FailureFormData) => {
    if (!user) {
      // Save form state to localStorage so it survives the auth flow
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(AUTO_SUBMIT_KEY, 'true');
      } catch { /* noop */ }
      setAuthModalOpen(true);
      return;
    }

    // Sprint 11: Guided Investigation mode → redirect to guided UI
    if (formData.investigationMode === 'guided') {
      setStatus('loading');
      try {
        const session = await startGuidedSession({
          initial_context: {
            failure_description: formData.failureDescription,
            failure_mode: formData.failureMode,
            substrate_a: formData.substrateA,
            substrate_b: formData.substrateB,
            adhesive_used: formData.adhesiveUsed,
            product_name: formData.productName,
          },
        });
        router.push(`/guided/${session.id}`);
        return;
      } catch (err) {
        console.error('Failed to start guided session:', err);
        setErrorMessage('Failed to start guided investigation. Falling back to quick analysis.');
        setStatus('error');
        return;
      }
    }

    await executeSubmit(formData);
  };

  // After auth success: restore form and auto-submit
  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    try {
      const shouldAutoSubmit = localStorage.getItem(AUTO_SUBMIT_KEY);
      const savedForm = localStorage.getItem(STORAGE_KEY);
      if (shouldAutoSubmit && savedForm) {
        const formData = JSON.parse(savedForm) as FailureFormData;
        localStorage.removeItem(AUTO_SUBMIT_KEY);
        executeSubmit(formData);
      }
    } catch { /* noop */ }
  }, [executeSubmit]);

  // Auto-submit on page load if user just authenticated (e.g., after OAuth redirect)
  useEffect(() => {
    if (user && !autoSubmitTriggered.current) {
      try {
        const shouldAutoSubmit = localStorage.getItem(AUTO_SUBMIT_KEY);
        const savedForm = localStorage.getItem(STORAGE_KEY);
        if (shouldAutoSubmit && savedForm) {
          autoSubmitTriggered.current = true;
          const formData = JSON.parse(savedForm) as FailureFormData;
          localStorage.removeItem(AUTO_SUBMIT_KEY);
          executeSubmit(formData);
        }
      } catch { /* noop */ }
    }
  }, [user, executeSubmit]);

  const handleNewAnalysis = () => { setStatus('idle'); setResultData(null); setAnalysisId(null); setErrorMessage(null); };

  const resultsStatus = status === 'idle' ? 'idle' : status === 'complete' ? 'success' : status === 'error' ? 'error' : 'loading';

  return (
    <>
      <ToolLayout
        formPanel={<><UsageCounter /><FailureForm onSubmit={handleSubmit} isLoading={status === 'loading'} /></>}
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
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} onSuccess={handleAuthSuccess} fromFormSubmit />
    </>
  );
}

export default function FailureAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-[#94A3B8] text-sm">Loading...</div>}>
      <FailurePageContent />
    </Suspense>
  );
}
