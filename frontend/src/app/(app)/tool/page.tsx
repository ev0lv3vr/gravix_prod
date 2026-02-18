'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { SpecForm, type SpecFormData } from '@/components/tool/SpecForm';
import { SpecResults, type SpecResultData } from '@/components/tool/SpecResults';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { usePlan } from '@/contexts/PlanContext';
import { api, ApiError } from '@/lib/api';
import { UsageCounter } from '@/components/shared/UsageCounter';

type Status = 'idle' | 'loading' | 'complete' | 'error';

const STORAGE_KEY = 'gravix_spec_form';
const AUTO_SUBMIT_KEY = 'gravix_spec_auto_submit';

export default function SpecToolPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [resultData, setResultData] = useState<SpecResultData | null>(null);
  const [specId, setSpecId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const autoSubmitTriggered = useRef(false);

  const { user } = useAuth();
  const { isExhausted } = useUsageTracking();
  const { plan, refreshPlan } = usePlan();

  // Core submission logic (no auth check — caller is responsible)
  const executeSubmit = useCallback(async (formData: SpecFormData) => {
    if (isExhausted) { setUpgradeModalOpen(true); return; }
    setStatus('loading');

    try {
      const envConditions: string[] = formData.environment || [];
      const loadTypes: string[] = formData.loadTypes || [];
      const cureConstraints: string[] = formData.cureConstraints || [];

      const requestData: Record<string, unknown> = {
        material_category: 'adhesive',
        substrate_a: formData.substrateA,
        substrate_b: formData.substrateB,
        bond_requirements: {
          // New multi-select load types
          load_types: loadTypes.length > 0
            ? loadTypes.map(lt => `load:${lt}`)
            : undefined,
          // Legacy single-select fallback
          shear_strength: formData.loadType === 'structural' ? 'High (>3000 psi)' :
                          formData.loadType === 'semi-structural' ? 'Medium (1000-3000 psi)' :
                          formData.loadType === 'non-structural' ? 'Low (<1000 psi)' : undefined,
          gap_fill: formData.gapFill ? `${formData.gapFill}mm` : undefined,
          gap_type: formData.gapType ? `gap_type:${formData.gapType}` : undefined,
          flexibility_required: formData.loadType === 'sealing',
          other_requirements: formData.loadType || undefined,
        },
        environment: {
          temp_min: `${formData.tempMin}°C`,
          temp_max: `${formData.tempMax}°C`,
          conditions: envConditions.length > 0
            ? envConditions.map(e => `env:${e}`)
            : undefined,
          chemical_exposure: envConditions.includes('chemical')
            ? [
                ...(formData.chemicalExposureDetail || []).map(c => `chem:${c}`),
                ...(formData.chemicalExposureOther ? [`chem_other:${formData.chemicalExposureOther}`] : []),
              ]
            : undefined,
          sterilization_methods: envConditions.includes('sterilization') && formData.sterilizationMethods?.length > 0
            ? formData.sterilizationMethods.map(s => `sterilization:${s}`)
            : undefined,
          uv_exposure: envConditions.includes('uv_outdoor'),
          outdoor_use: envConditions.includes('uv_outdoor'),
          humidity: envConditions.includes('high_humidity') ? 'High' : undefined,
        },
        cure_constraints: {
          // New multi-select cure constraints
          process_capabilities: cureConstraints.length > 0
            ? cureConstraints.map(cc => `cure_constraint:${cc}`)
            : undefined,
          max_cure_temp_c: formData.maxCureTempC ? Number(formData.maxCureTempC) : undefined,
          uv_shadow_areas: formData.uvShadowAreas === 'yes' ? true :
                           formData.uvShadowAreas === 'no' ? false : undefined,
          // Legacy single-select fallback
          preferred_method: formData.cureConstraint === 'room_temp' ? 'Room temperature' :
                           formData.cureConstraint === 'heat_available' ? 'Heat cure' :
                           formData.cureConstraint === 'uv_available' ? 'UV cure' :
                           formData.cureConstraint === 'fast_fixture' ? 'Fast fixture (<5 min)' : undefined,
          heat_available: cureConstraints.includes('oven_available') || formData.cureConstraint === 'heat_available',
          uv_available: cureConstraints.includes('uv_available') || formData.cureConstraint === 'uv_available',
        },
        additional_requirements: formData.additionalContext || undefined,
        production_volume: formData.productionVolume || undefined,
        application_method: formData.applicationMethod || undefined,
        required_fixture_time: formData.requiredFixtureTime || undefined,
        product_considered: formData.productConsidered || undefined,
      };

      const response = await api.createSpecRequest(requestData) as import('@/lib/types').ApiSpecResponse;

      const recordId = response.id;
      if (recordId) setSpecId(recordId);

      const recSpec = (response.recommendedSpec || response.recommended_spec || {}) as Partial<import('@/lib/types').RecommendedSpec>;
      const prodChars = (response.productCharacteristics || response.product_characteristics || {}) as Partial<import('@/lib/types').ProductCharacteristics> & { viscosity_range?: string; cure_time?: string; shear_strength?: string; service_temperature?: string; gap_fill?: string };
      const appGuidance = response.applicationGuidance || response.application_guidance || {};
      const responseWarnings = response.warnings || [];
      const responseAlts = response.alternatives || [];

      const matchingProducts = response.matching_products || response.matchingProducts || [];

      const mapped: SpecResultData = {
        recommendedSpec: {
          materialType: recSpec.title || 'Unknown',
          chemistry: recSpec.chemistry || 'Unknown',
          subcategory: 'General',
          rationale: recSpec.rationale || '',
          exampleProducts: recSpec.example_products || [],
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
        matchingProducts: matchingProducts,
        confidenceScore: response.confidence_score || response.confidenceScore || 0.85,
        knowledgeEvidenceCount: response.knowledge_evidence_count ?? response.knowledgeEvidenceCount ?? undefined,
        knownRisks: response.known_risks || response.knownRisks || undefined,
        knownRiskData: (() => {
          const apiRisk = response.known_risk_data || response.knownRiskData;
          if (!apiRisk) return undefined;
          return {
            productName: apiRisk.product_name,
            substratePair: apiRisk.substrate_pair,
            totalFailures: apiRisk.total_failures,
            failureRate: apiRisk.failure_rate,
            mostCommonCause: apiRisk.most_common_cause,
            commonCausePercent: apiRisk.common_cause_percent,
            typicalTimeToFailure: apiRisk.typical_time_to_failure,
            alternatives: apiRisk.alternatives?.map(a => ({
              name: a.name,
              failureRate: a.failure_rate,
              caseCount: a.case_count,
            })),
            linkedCases: apiRisk.linked_cases,
          };
        })(),
      };

      setResultData(mapped);
      setStatus('complete');
      // Refresh plan/usage from backend so UsageCounter updates immediately
      refreshPlan();

      // Clear saved form state on success
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(AUTO_SUBMIT_KEY); } catch { /* noop */ }
    } catch (err) {
      console.error('Spec generation error:', err);
      // 429 (rate limit) or 403 (plan gate) → show upgrade modal instead of error
      if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
        setUpgradeModalOpen(true);
        setStatus('idle');
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        setStatus('error');
      }
    }
  }, [isExhausted, user, refreshPlan]);

  // Public submit handler — gates on auth
  const handleSubmit = async (formData: SpecFormData) => {
    if (!user) {
      // Save form state to localStorage so it survives the auth flow
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(AUTO_SUBMIT_KEY, 'true');
      } catch { /* noop */ }
      setAuthModalOpen(true);
      return;
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
        const formData = JSON.parse(savedForm) as SpecFormData;
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
          const formData = JSON.parse(savedForm) as SpecFormData;
          localStorage.removeItem(AUTO_SUBMIT_KEY);
          executeSubmit(formData);
        }
      } catch { /* noop */ }
    }
  }, [user, executeSubmit]);

  const handleNewAnalysis = () => { setStatus('idle'); setResultData(null); setSpecId(null); setErrorMessage(null); };

  const resultsStatus = status === 'idle' ? 'idle' : status === 'complete' ? 'success' : status === 'error' ? 'error' : 'loading';

  return (
    <>
      <ToolLayout
        formPanel={<><UsageCounter /><SpecForm onSubmit={handleSubmit} isLoading={status === 'loading'} /></>}
        resultsPanel={<SpecResults status={resultsStatus} data={resultData} specId={specId} errorMessage={errorMessage} onNewAnalysis={handleNewAnalysis} isFree={!user || plan === 'free'} />}
      />
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} onUpgrade={() => window.location.href = '/pricing'} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} onSuccess={handleAuthSuccess} fromFormSubmit />
    </>
  );
}
