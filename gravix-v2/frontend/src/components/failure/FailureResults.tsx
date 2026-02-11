'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { ConfidenceIndicator } from '../shared/ConfidenceIndicator';
import { BlurOverlay } from '../shared/BlurOverlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { generateAndDownloadPDF, generateExecutiveSummary } from '@/lib/pdfUtils';
import type { FailurePDFData } from '@/components/shared/PDFReport';
import { showToast } from '@/lib/toast';

interface FailureResultsProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: FailureResultData | null;
  onNewAnalysis?: () => void;
  onRunSpecAnalysis?: () => void;
  isFree?: boolean;
}

interface FailureResultData {
  diagnosis: {
    topRootCause: string;
    confidence: number;
    explanation: string;
  };
  rootCauses: Array<{
    rank: number;
    cause: string;
    category: string;
    confidence: number;
    explanation: string;
    mechanism: string;
  }>;
  contributingFactors: string[];
  immediateActions: string[];
  longTermSolutions: string[];
  preventionPlan: string[];
  confidenceScore: number;
}

export function FailureResults({ status, data, onNewAnalysis, onRunSpecAnalysis, isFree = true }: FailureResultsProps) {
  const [loadingPhase, setLoadingPhase] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Loading phase progression
  useEffect(() => {
    if (status !== 'loading') {
      setLoadingPhase(1);
      setElapsedTime(0);
      return;
    }

    const phaseTimers = [
      setTimeout(() => setLoadingPhase(2), 2000),
      setTimeout(() => setLoadingPhase(3), 5000),
    ];

    const interval = setInterval(() => {
      setElapsedTime(t => t + 0.1);
    }, 100);

    return () => {
      phaseTimers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [status]);

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleExportPDF = async () => {
    if (!data) return;

    setIsGeneratingPDF(true);
    showToast({ message: 'Generating report...', type: 'info', duration: 2000 });

    try {
      // Map data to PDF format
      const pdfData: FailurePDFData = {
        type: 'failure',
        inputs: {
          failureMode: 'Failure Mode', // TODO: Get from form data
          environmentConditions: [],
          surfacePrep: [],
          failureDescription: 'Failure description',
        },
        diagnosis: data.diagnosis,
        rootCauses: data.rootCauses,
        contributingFactors: data.contributingFactors,
        immediateActions: data.immediateActions,
        longTermSolutions: data.longTermSolutions,
        preventionPlan: data.preventionPlan,
        confidenceScore: data.confidenceScore,
      };

      // Generate executive summary for pro users
      if (!isFree) {
        pdfData.executiveSummary = generateExecutiveSummary(pdfData);
      }

      await generateAndDownloadPDF(pdfData, isFree);
      showToast({ message: 'Report downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('PDF export failed:', error);
      showToast({ message: 'Failed to generate PDF report', type: 'error' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleUpgrade = () => {
    // Trigger parent upgrade modal
    window.location.href = '/pricing';
  };

  // Empty State
  if (status === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <Search className="w-12 h-12 text-text-tertiary mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-text-secondary mb-2">
          Your analysis will appear here
        </h2>
        <p className="text-sm text-text-tertiary">
          Fill in the form and click Analyze
        </p>
      </div>
    );
  }

  // Loading State
  if (status === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Phase 1 */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                loadingPhase >= 1 ? 'bg-accent-500 animate-pulse' : 'bg-brand-600'
              )}
            />
            <span className={cn('text-sm', loadingPhase >= 1 ? 'text-text-primary' : 'text-text-tertiary')}>
              Analyzing failure patterns...
            </span>
          </div>

          {/* Phase 2 */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                loadingPhase >= 2 ? 'bg-accent-500 animate-pulse' : 'bg-brand-600'
              )}
            />
            <div className="flex-1">
              <p className={cn('text-sm mb-2', loadingPhase >= 2 ? 'text-text-primary' : 'text-text-tertiary')}>
                Cross-referencing failure modes...
              </p>
              {loadingPhase >= 2 && (
                <div className="w-full h-1 bg-brand-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-500 animate-pulse" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          </div>

          {/* Phase 3 */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                loadingPhase >= 3 ? 'bg-accent-500 animate-pulse' : 'bg-brand-600'
              )}
            />
            <span className={cn('text-sm', loadingPhase >= 3 ? 'text-text-primary' : 'text-text-tertiary')}>
              Generating recommendations...
            </span>
          </div>

          {/* Elapsed timer */}
          <div className="text-right">
            <span className="text-xs font-mono text-text-tertiary">
              {elapsedTime.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Analysis Failed
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          We encountered an error while analyzing your failure. Please try again.
        </p>
        {onNewAnalysis && (
          <Button onClick={onNewAnalysis} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Results State
  if (status === 'success' && data) {
    const executiveSummary = (
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary leading-relaxed">
            The failure analysis indicates that {data.diagnosis.topRootCause.toLowerCase()} is
            the primary root cause with {Math.round(data.rootCauses[0]?.confidence * 100 || 0)}%
            confidence. {data.contributingFactors.length > 0 &&
              `${data.contributingFactors.length} contributing factors have been identified that exacerbate the primary failure mode.`}
            {' '}Immediate corrective actions are recommended to prevent recurrence, with
            long-term solutions focusing on process improvements and preventive measures.
            This analysis is based on the reported failure pattern, environmental conditions,
            and material properties.
          </p>
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-6 pb-20">
        {/* Diagnosis Summary */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-heading text-text-primary mb-1">
              {data.diagnosis.topRootCause}
            </h2>
            <p className="text-sm text-text-secondary">
              {data.diagnosis.explanation}
            </p>
          </div>
          <ConfidenceIndicator confidence={data.confidenceScore} />
        </div>

        {/* Executive Summary - Blurred for free tier */}
        {isFree ? (
          <BlurOverlay onUpgrade={handleUpgrade}>{executiveSummary}</BlurOverlay>
        ) : (
          executiveSummary
        )}

        {/* Root Cause Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Root Cause Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.rootCauses.map((cause) => (
              <div
                key={cause.rank}
                className="p-4 bg-surface-2 rounded-md border border-brand-600"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-accent-500">#{cause.rank}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-text-primary">{cause.cause}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          cause.confidence >= 0.8
                            ? 'bg-success/10 text-success border-success'
                            : cause.confidence >= 0.6
                            ? 'bg-info/10 text-info border-info'
                            : 'bg-warning/10 text-warning border-warning'
                        )}
                      >
                        {Math.round(cause.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{cause.explanation}</p>
                    <div className="mt-2 p-2 bg-brand-900/50 rounded border border-brand-700">
                      <p className="text-xs font-mono text-text-tertiary">{cause.mechanism}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contributing Factors */}
        {data.contributingFactors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contributing Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.contributingFactors.map((factor, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent-500">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Immediate Actions */}
        {data.immediateActions.length > 0 && (
          <Card className="border-danger/50">
            <CardHeader>
              <CardTitle className="text-danger">🚨 Immediate Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {data.immediateActions.map((action, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-danger font-semibold">{i + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Long-term Solutions */}
        {data.longTermSolutions.length > 0 && (
          <Card className="border-info/50">
            <CardHeader>
              <CardTitle className="text-info">🔧 Long-term Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.longTermSolutions.map((solution, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-info">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Prevention Plan */}
        {data.preventionPlan.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Prevention Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.preventionPlan.map((step, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 p-2 rounded hover:bg-surface-2 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.has(i)}
                      onChange={() => toggleCheck(i)}
                      className="mt-0.5 w-4 h-4 rounded border-brand-600 text-accent-500 focus:ring-2 focus:ring-accent-500"
                    />
                    <span className={cn('text-sm', checkedItems.has(i) ? 'text-text-tertiary line-through' : 'text-text-secondary')}>
                      {step}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Bar - Sticky bottom */}
        <div className="fixed bottom-0 left-0 right-0 md:left-[45%] bg-brand-900 border-t border-brand-700 p-4 md:p-6 z-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 min-h-[44px]"
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
            </Button>
            <Button variant="outline" className="flex-1 min-h-[44px]">
              Request Expert Review
            </Button>
            {onRunSpecAnalysis && (
              <Button onClick={onRunSpecAnalysis} className="flex-1 min-h-[44px]">
                Run Spec Analysis
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export type { FailureResultData };
