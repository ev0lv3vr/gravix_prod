'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { formatConfidence } from '@/lib/utils';

export default function AnalysisResultsPage() {
  const params = useParams();
  const analysisId = params.id as string;

  // Mock data - in real app, fetch from API using analysisId
  const analysis = {
    id: analysisId,
    materialCategory: 'adhesive',
    materialSubcategory: 'Cyanoacrylate (CA)',
    failureMode: 'Debonding',
    substrateA: 'Aluminum',
    substrateB: 'ABS Plastic',
    confidenceScore: 0.85,
    rootCauses: [
      {
        cause: 'Surface Contamination',
        confidence: 0.85,
        explanation:
          'Oil, grease, or other contaminants on substrate surfaces prevent proper wetting and bonding. This is the most common cause of adhesive failure.',
        evidence: [
          'Common with aluminum substrates which easily accumulate handling oils',
          'Adhesive failure pattern (clean substrate) typical of contamination',
          'No surface preparation mentioned in application details',
        ],
      },
      {
        cause: 'Thermal Cycling Stress',
        confidence: 0.65,
        explanation:
          'Wide temperature range (-20°C to 80°C) creates expansion/contraction mismatch between dissimilar substrates, inducing stress at the bondline.',
        evidence: [
          'Significant CTE difference between aluminum and ABS',
          'Temperature range exceeds typical CA service range',
          'Failure after 2 weeks suggests fatigue accumulation',
        ],
      },
      {
        cause: 'Inadequate Surface Preparation',
        confidence: 0.55,
        explanation:
          'Aluminum oxide layer may not have been properly treated. Smooth aluminum can be problematic for mechanical adhesion.',
        evidence: [
          'No abrasion or etching mentioned',
          'Oxide layer on aluminum reforms quickly',
          'Standard CA requires some surface roughness',
        ],
      },
    ],
    contributingFactors: [
      'Low humidity environment may have slowed CA cure, reducing bond strength',
      'Bondline thickness not specified — thick bondlines reduce CA performance',
      'ABS plastic may have mold release residue if recently molded',
    ],
    recommendations: {
      immediate: [
        'Clean both surfaces thoroughly with isopropyl alcohol (IPA) or acetone',
        'Lightly abrade aluminum with 320-grit sandpaper or Scotch-Brite pad',
        'Use CA primer (activator) on ABS to improve cure and adhesion',
        'Apply thin bondline (<0.1mm) for maximum strength',
        'Clamp or fixture parts for 30-60 seconds minimum',
      ],
      longTerm: [
        'Consider switching to rubber-toughened CA for better thermal cycling resistance',
        'Alternative: Use flexible epoxy or polyurethane adhesive for this temperature range',
        'Implement documented surface prep SOP: (1) Solvent wipe, (2) Abrasion, (3) Final wipe',
        'Add environmental testing (thermal cycling) to product qualification',
        'Consider mechanical fasteners as backup for critical joints',
      ],
    },
    preventionPlan:
      'Establish and document surface preparation standard operating procedure: (1) Solvent wipe with IPA, (2) Light abrasion of aluminum, (3) Final IPA wipe, (4) Verify cleanliness with water break test. Train operators on proper technique. For production, consider plasma treatment of aluminum for consistent surface activation. Implement incoming inspection of ABS parts to check for mold release contamination.',
    similarCases: [
      {
        id: 'case-1',
        title: 'CA Debonding on Aluminum-ABS Assembly',
        industry: 'Automotive',
      },
      {
        id: 'case-2',
        title: 'Thermal Cycling Failure in Electronics Housing',
        industry: 'Electronics',
      },
    ],
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Failure Analysis Results</h1>
            <p className="text-muted-foreground">
              {analysis.materialSubcategory} — {analysis.failureMode}
            </p>
          </div>
          <Button asChild>
            <a href={`/api/reports/analysis/${analysisId}/pdf`} download>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
        </div>

        {/* Overall Confidence */}
        <Card className="bg-primary/10 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Overall Confidence</span>
              <span className="text-2xl font-bold text-primary">
                {formatConfidence(analysis.confidenceScore)}
              </span>
            </div>
            <Progress value={analysis.confidenceScore * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Root Causes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Root Causes (Ranked by Probability)</CardTitle>
          <CardDescription>
            Most likely causes of your failure, based on AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {analysis.rootCauses.map((cause, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <h3 className="text-lg font-semibold">{cause.cause}</h3>
                    <span className="text-sm font-medium text-primary">
                      {formatConfidence(cause.confidence)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{cause.explanation}</p>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Supporting Evidence:</p>
                    <ul className="text-sm space-y-1">
                      {cause.evidence.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {index < analysis.rootCauses.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contributing Factors */}
      {analysis.contributingFactors.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contributing Factors</CardTitle>
            <CardDescription>
              Secondary issues that may have influenced the failure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.contributingFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            Steps to fix the current failure and prevent future occurrences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Badge variant="destructive">Immediate</Badge>
              Fix This Failure Now
            </h3>
            <ul className="space-y-2">
              {analysis.recommendations.immediate.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Badge>Long-Term</Badge>
              Prevent Future Failures
            </h3>
            <ul className="space-y-2">
              {analysis.recommendations.longTerm.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Prevention Plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prevention Plan</CardTitle>
          <CardDescription>
            Comprehensive strategy to avoid this failure mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="text-sm leading-relaxed">
              {analysis.preventionPlan}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Similar Cases */}
      {analysis.similarCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Failure Cases</CardTitle>
            <CardDescription>
              Related failures from our case library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.similarCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="block border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium mb-1">{caseItem.title}</h4>
                      <Badge variant="secondary">{caseItem.industry}</Badge>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <Button variant="outline" asChild>
          <Link href="/analyze">Analyze Another Failure</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
