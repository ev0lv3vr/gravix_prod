'use client';

import { useEffect, useState } from 'react';
import { Beaker, ChevronDown, ChevronUp } from 'lucide-react';
import { ConfidenceIndicator } from '../shared/ConfidenceIndicator';
import { BlurOverlay } from '../shared/BlurOverlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { generateAndDownloadPDF, generateExecutiveSummary } from '@/lib/pdfUtils';
import type { SpecPDFData } from '@/components/shared/PDFReport';
import { showToast } from '@/lib/toast';

interface SpecResultsProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: SpecResultData | null;
  onNewAnalysis?: () => void;
  isFree?: boolean;
}

interface SpecResultData {
  recommendedSpec: {
    materialType: string;
    chemistry: string;
    subcategory: string;
    rationale: string;
  };
  productCharacteristics: {
    viscosityRange?: string;
    color?: string;
    cureTime?: string;
    expectedStrength?: string;
    temperatureResistance?: string;
    flexibility?: string;
    gapFillCapability?: string;
  };
  applicationGuidance: {
    surfacePreparation: string[];
    applicationTips: string[];
    curingNotes: string[];
    commonMistakesToAvoid: string[];
  };
  warnings: string[];
  alternatives: Array<{
    materialType: string;
    chemistry: string;
    advantages: string[];
    disadvantages: string[];
    whenToUse: string;
  }>;
  confidenceScore: number;
}

export function SpecResults({ status, data, onNewAnalysis, isFree = true }: SpecResultsProps) {
  const [loadingPhase, setLoadingPhase] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [expandedAlternatives, setExpandedAlternatives] = useState<number[]>([]);
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

  const toggleAlternative = (index: number) => {
    setExpandedAlternatives(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleExportPDF = async () => {
    if (!data) return;

    setIsGeneratingPDF(true);
    showToast({ message: 'Generating report...', type: 'info', duration: 2000 });

    try {
      // Map data to PDF format
      const pdfData: SpecPDFData = {
        type: 'spec',
        inputs: {
          substrateA: 'Substrate A', // TODO: Get from form data
          substrateB: 'Substrate B',
          loadType: 'Standard Load',
          tempRange: '-20°C to 80°C',
          environment: ['Indoor'],
          additionalContext: '',
        },
        recommendedSpec: data.recommendedSpec,
        productCharacteristics: data.productCharacteristics as Record<string, string>,
        applicationGuidance: data.applicationGuidance,
        warnings: data.warnings,
        alternatives: data.alternatives,
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
        <Beaker className="w-12 h-12 text-text-tertiary mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-text-secondary mb-2">
          Your specification will appear here
        </h2>
        <p className="text-sm text-text-tertiary mb-8">
          Fill in the form and click Generate
        </p>
        
        {/* Mini capability cards */}
        <div className="w-full max-w-md space-y-2 opacity-50">
          {[
            { label: 'Substrate Analysis', desc: 'Compatibility assessment' },
            { label: 'Material Recommendation', desc: 'Best-fit adhesive selection' },
            { label: 'Application Guidance', desc: 'Step-by-step instructions' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-surface-2 rounded border border-brand-600"
            >
              <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500 text-sm font-bold">
                {i + 1}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-text-primary">{item.label}</div>
                <div className="text-xs text-text-tertiary">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Loading State
  if (status === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Phase 1: Pulsing dot */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                loadingPhase >= 1 ? 'bg-accent-500 animate-pulse' : 'bg-brand-600'
              )}
            />
            <span className={cn('text-sm', loadingPhase >= 1 ? 'text-text-primary' : 'text-text-tertiary')}>
              Analyzing substrate compatibility...
            </span>
          </div>

          {/* Phase 2: Progress bar */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                loadingPhase >= 2 ? 'bg-accent-500 animate-pulse' : 'bg-brand-600'
              )}
            />
            <div className="flex-1">
              <p className={cn('text-sm mb-2', loadingPhase >= 2 ? 'text-text-primary' : 'text-text-tertiary')}>
                Cross-referencing adhesive profiles...
              </p>
              {loadingPhase >= 2 && (
                <div className="w-full h-1 bg-brand-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-500 animate-pulse" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          </div>

          {/* Phase 3: Streaming text effect */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                loadingPhase >= 3 ? 'bg-accent-500 animate-pulse' : 'bg-brand-600'
              )}
            />
            <span className={cn('text-sm', loadingPhase >= 3 ? 'text-text-primary' : 'text-text-tertiary')}>
              Generating specification...
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
          We encountered an error while generating your specification. Please try again.
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
            Based on the analysis of the specified substrates and environmental
            conditions, we recommend {data.recommendedSpec.chemistry} as the optimal
            adhesive solution. This recommendation is supported by comprehensive
            substrate compatibility assessment, environmental factor analysis, and
            application requirement evaluation. The confidence level for this
            specification is {Math.round(data.confidenceScore * 100)}%.
            {data.warnings.length > 0 &&
              ' Critical risk factors have been identified and require careful review before implementation.'}
          </p>
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-6 pb-20">
        {/* Summary Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-heading text-text-primary mb-1">
              {data.recommendedSpec.chemistry}
            </h2>
            <p className="text-sm text-text-secondary">
              {data.recommendedSpec.rationale}
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

        {/* Primary Recommendation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Specification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Material Type</div>
                <div className="font-mono text-sm text-text-primary">{data.recommendedSpec.materialType}</div>
              </div>
              <div>
                <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Chemistry</div>
                <div className="font-mono text-sm text-text-primary">{data.recommendedSpec.chemistry}</div>
              </div>
              <div>
                <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Subcategory</div>
                <div className="font-mono text-sm text-text-primary">{data.recommendedSpec.subcategory}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Characteristics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.productCharacteristics).map(([key, value]) => {
                if (!value) return null;
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-brand-700 last:border-0">
                    <span className="text-sm text-text-secondary">{label}</span>
                    <span className="text-sm font-mono text-text-primary">{value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Compatibility Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Substrate Compatibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success">
                Excellent Adhesion
              </Badge>
              <Badge variant="outline" className="bg-info/10 text-info border-info">
                Good Chemical Resistance
              </Badge>
              <Badge variant="outline" className="bg-accent-500/10 text-accent-500 border-accent-500">
                Suitable for Load Type
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        {data.warnings.length > 0 && (
          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="text-warning">⚠️ Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Application Guidance */}
        <Card>
          <CardHeader>
            <CardTitle>Application Guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.applicationGuidance.surfacePreparation.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Surface Preparation</h4>
                <ul className="space-y-1">
                  {data.applicationGuidance.surfacePreparation.map((step, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-accent-500">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.applicationGuidance.applicationTips.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Application Tips</h4>
                <ul className="space-y-1">
                  {data.applicationGuidance.applicationTips.map((tip, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-accent-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.applicationGuidance.curingNotes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Curing Notes</h4>
                <ul className="space-y-1">
                  {data.applicationGuidance.curingNotes.map((note, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-accent-500">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.applicationGuidance.commonMistakesToAvoid.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-danger mb-2">Common Mistakes to Avoid</h4>
                <ul className="space-y-1">
                  {data.applicationGuidance.commonMistakesToAvoid.map((mistake, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-danger">✗</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alternative Specs */}
        {data.alternatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alternative Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.alternatives.map((alt, i) => (
                <div key={i} className="border border-brand-600 rounded-md">
                  <button
                    onClick={() => toggleAlternative(i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-2 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">{alt.chemistry}</h4>
                      <p className="text-xs text-text-tertiary">{alt.materialType}</p>
                    </div>
                    {expandedAlternatives.includes(i) ? (
                      <ChevronUp className="w-4 h-4 text-text-tertiary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    )}
                  </button>

                  {expandedAlternatives.includes(i) && (
                    <div className="px-4 pb-4 space-y-3">
                      <div>
                        <h5 className="text-xs font-semibold text-success mb-1">Advantages</h5>
                        <ul className="space-y-1">
                          {alt.advantages.map((adv, j) => (
                            <li key={j} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-success">+</span>
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold text-danger mb-1">Disadvantages</h5>
                        <ul className="space-y-1">
                          {alt.disadvantages.map((dis, j) => (
                            <li key={j} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-danger">−</span>
                              <span>{dis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold text-text-primary mb-1">When to Use</h5>
                        <p className="text-xs text-text-secondary">{alt.whenToUse}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
              Request Review
            </Button>
            {onNewAnalysis && (
              <Button onClick={onNewAnalysis} className="flex-1 min-h-[44px]">
                New Analysis
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export type { SpecResultData };
